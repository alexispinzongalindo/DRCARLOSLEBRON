import { supabase } from '../lib/supabase';
import { db, type SyncQueue } from './dexie';
import { encryptPHI, decryptPHI } from '../lib/encryption';

interface SyncResult {
  success: boolean;
  recordsPushed: number;
  recordsPulled: number;
  errors: string[];
}

interface ConflictResolution {
  strategy: 'last_write_wins' | 'manual_review' | 'server_wins' | 'client_wins';
  resolvedBy?: string;
  resolvedAt?: string;
}

class SyncEngine {
  private isOnline = navigator.onLine;
  private syncInProgress = false;
  private deviceId: string;
  private lastSyncTimestamp: string | null = null;

  constructor() {
    this.deviceId = this.getOrCreateDeviceId();
    this.setupNetworkListeners();
    this.setupPeriodicSync();
  }

  private getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  }

  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('Network connection restored - starting sync');
      this.performSync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('Network connection lost - operating offline');
    });
  }

  private setupPeriodicSync(): void {
    // Sync every 15 minutes when online
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.performSync();
      }
    }, 15 * 60 * 1000);

    // End-of-day sync at 6:00 PM Atlantic Time
    this.scheduleEODSync();
  }

  private scheduleEODSync(): void {
    const now = new Date();
    const eodTime = new Date();
    eodTime.setHours(18, 0, 0, 0); // 6:00 PM

    // If it's past 6 PM today, schedule for tomorrow
    if (now > eodTime) {
      eodTime.setDate(eodTime.getDate() + 1);
    }

    const msUntilEOD = eodTime.getTime() - now.getTime();

    setTimeout(() => {
      this.performFullSync();
      // Reschedule for next day
      this.scheduleEODSync();
    }, msUntilEOD);
  }

  async performSync(): Promise<SyncResult> {
    if (this.syncInProgress || !this.isOnline) {
      return {
        success: false,
        recordsPushed: 0,
        recordsPulled: 0,
        errors: ['Sync already in progress or offline']
      };
    }

    this.syncInProgress = true;
    const errors: string[] = [];
    let recordsPushed = 0;
    let recordsPulled = 0;

    try {
      console.log('Starting sync process...');

      // Step 1: Push local changes to server
      const pushResult = await this.pushLocalChanges();
      recordsPushed = pushResult.count;
      errors.push(...pushResult.errors);

      // Step 2: Pull server changes to local
      const pullResult = await this.pullServerChanges();
      recordsPulled = pullResult.count;
      errors.push(...pullResult.errors);

      // Step 3: Log sync completion
      await this.logSyncCompletion(recordsPushed, recordsPulled, errors);

      console.log(`Sync completed: ${recordsPushed} pushed, ${recordsPulled} pulled`);

      return {
        success: errors.length === 0,
        recordsPushed,
        recordsPulled,
        errors
      };
    } catch (error) {
      console.error('Sync failed:', error);
      errors.push(`Sync failed: ${error}`);
      return {
        success: false,
        recordsPushed,
        recordsPulled,
        errors
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  async performFullSync(): Promise<SyncResult> {
    console.log('Starting end-of-day full sync...');
    
    // Force a complete reconciliation
    this.lastSyncTimestamp = null;
    const result = await this.performSync();
    
    // Additional validation and conflict resolution
    await this.resolveConflicts();
    
    return result;
  }

  private async pushLocalChanges(): Promise<{ count: number; errors: string[] }> {
    const errors: string[] = [];
    let count = 0;

    try {
      // Get all pending sync items
      const syncItems = await db.sync_queue.orderBy('created_at').toArray();
      
      for (const item of syncItems) {
        try {
          await this.pushSingleRecord(item);
          await db.sync_queue.delete(item.id!);
          count++;
        } catch (error) {
          console.error(`Failed to push record ${item.record_id}:`, error);
          errors.push(`Failed to push ${item.table_name} record: ${error}`);
          
          // Increment attempt count
          await db.sync_queue.update(item.id!, {
            attempts: (item.attempts || 0) + 1,
            last_error: String(error)
          });
        }
      }
    } catch (error) {
      errors.push(`Failed to push local changes: ${error}`);
    }

    return { count, errors };
  }

  private async pushSingleRecord(syncItem: SyncQueue): Promise<void> {
    const { table_name, record_id, operation, data } = syncItem;

    // Get the current record from local database
    const table = (db as any)[table_name];
    if (!table) {
      throw new Error(`Unknown table: ${table_name}`);
    }

    let record = await table.get(record_id);
    
    if (operation === 'delete' || !record) {
      // Handle deletion
      const { error } = await supabase
        .from(table_name)
        .delete()
        .eq('id', record_id);
      
      if (error) throw error;
      return;
    }

    // Encrypt PHI fields before uploading
    const encryptedRecord = this.encryptRecordForUpload(table_name, record);

    if (operation === 'create') {
      const { error } = await supabase
        .from(table_name)
        .insert(encryptedRecord);
      
      if (error) throw error;
    } else if (operation === 'update') {
      const { error } = await supabase
        .from(table_name)
        .update(encryptedRecord)
        .eq('id', record_id);
      
      if (error) throw error;
    }

    // Mark as synced locally
    await table.update(record_id, { sync_status: 'synced' });
  }

  private async pullServerChanges(): Promise<{ count: number; errors: string[] }> {
    const errors: string[] = [];
    let count = 0;

    try {
      const tables = [
        'patients', 'staff', 'encounters', 'appointments', 
        'soap_notes', 'mmt_findings', 'functional_measures',
        'spasticity_findings', 'transfer_findings', 'grip_strength'
      ];

      for (const tableName of tables) {
        try {
          const pullCount = await this.pullTableChanges(tableName);
          count += pullCount;
        } catch (error) {
          console.error(`Failed to pull ${tableName}:`, error);
          errors.push(`Failed to pull ${tableName}: ${error}`);
        }
      }
    } catch (error) {
      errors.push(`Failed to pull server changes: ${error}`);
    }

    return { count, errors };
  }

  private async pullTableChanges(tableName: string): Promise<number> {
    const table = (db as any)[tableName];
    if (!table) return 0;

    let query = supabase.from(tableName).select('*');
    
    // Only pull changes since last sync if we have a timestamp
    if (this.lastSyncTimestamp) {
      query = query.gte('updated_at', this.lastSyncTimestamp);
    }

    const { data: serverRecords, error } = await query;
    
    if (error) throw error;
    if (!serverRecords || serverRecords.length === 0) return 0;

    let count = 0;
    
    for (const serverRecord of serverRecords) {
      try {
        // Decrypt PHI fields
        const decryptedRecord = this.decryptRecordFromServer(tableName, serverRecord);
        
        // Check for conflicts
        const localRecord = await table.get(serverRecord.id);
        
        if (localRecord && localRecord.sync_status === 'pending') {
          // Conflict detected - apply resolution strategy
          await this.resolveConflict(tableName, localRecord, decryptedRecord);
        } else {
          // No conflict - update local record
          await table.put({
            ...decryptedRecord,
            sync_status: 'synced'
          });
          count++;
        }
      } catch (error) {
        console.error(`Failed to process server record ${serverRecord.id}:`, error);
      }
    }

    return count;
  }

  private async resolveConflict(
    tableName: string, 
    localRecord: any, 
    serverRecord: any
  ): Promise<void> {
    const table = (db as any)[tableName];
    
    // For signed clinical notes, require manual review
    if (tableName === 'encounters' && localRecord.status === 'signed') {
      await table.update(localRecord.id, { sync_status: 'conflict' });
      console.warn(`Conflict detected for signed encounter ${localRecord.id} - manual review required`);
      return;
    }

    // For other records, use last-write-wins
    const localTimestamp = new Date(localRecord.updated_at || localRecord.created_at);
    const serverTimestamp = new Date(serverRecord.updated_at || serverRecord.created_at);

    if (serverTimestamp > localTimestamp) {
      // Server wins
      await table.put({
        ...serverRecord,
        sync_status: 'synced'
      });
    } else {
      // Local wins - push to server
      await this.pushSingleRecord({
        table_name: tableName,
        record_id: localRecord.id,
        operation: 'update',
        data: localRecord,
        created_at: new Date().toISOString(),
        attempts: 0
      });
    }
  }

  private async resolveConflicts(): Promise<void> {
    // Get all records with conflict status
    const tables = ['patients', 'encounters', 'appointments', 'soap_notes'];
    
    for (const tableName of tables) {
      const table = (db as any)[tableName];
      if (!table) continue;

      const conflictedRecords = await table
        .where('sync_status')
        .equals('conflict')
        .toArray();

      console.log(`Found ${conflictedRecords.length} conflicts in ${tableName}`);
      
      // For now, just log conflicts - in production, this would trigger
      // a UI for manual conflict resolution
      for (const record of conflictedRecords) {
        console.warn(`Manual review required for ${tableName} record ${record.id}`);
      }
    }
  }

  private encryptRecordForUpload(tableName: string, record: any): any {
    const phiFieldsMap: Record<string, string[]> = {
      patients: ['first_name', 'last_name', 'dob', 'phone', 'email', 'address', 'emergency_contact'],
      soap_notes: ['subjective_text', 'assessment_text'],
      appointments: ['notes'],
      functional_measures: ['eval_notes', 'reval_notes']
    };

    const phiFields = phiFieldsMap[tableName] || [];
    return encryptPHI(record, phiFields);
  }

  private decryptRecordFromServer(tableName: string, record: any): any {
    const phiFieldsMap: Record<string, string[]> = {
      patients: ['first_name', 'last_name', 'dob', 'phone', 'email', 'address', 'emergency_contact'],
      soap_notes: ['subjective_text', 'assessment_text'],
      appointments: ['notes'],
      functional_measures: ['eval_notes', 'reval_notes']
    };

    const phiFields = phiFieldsMap[tableName] || [];
    return decryptPHI(record, phiFields);
  }

  private async logSyncCompletion(
    recordsPushed: number, 
    recordsPulled: number, 
    errors: string[]
  ): Promise<void> {
    const syncLog = {
      device_id: this.deviceId,
      last_sync_at: new Date().toISOString(),
      records_pushed: recordsPushed,
      records_pulled: recordsPulled,
      sync_status: errors.length === 0 ? 'completed' : 'failed',
      errors: errors.length > 0 ? errors.join('; ') : undefined
    };

    await db.sync_log.add(syncLog);
    
    if (errors.length === 0) {
      this.lastSyncTimestamp = syncLog.last_sync_at;
    }
  }

  // Public methods for manual sync triggers
  async forcSync(): Promise<SyncResult> {
    return this.performSync();
  }

  async getSyncStatus(): Promise<{
    isOnline: boolean;
    syncInProgress: boolean;
    pendingRecords: number;
    lastSync: string | null;
  }> {
    const pendingRecords = await db.getSyncQueueCount();
    
    return {
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress,
      pendingRecords,
      lastSync: this.lastSyncTimestamp
    };
  }

  async clearSyncQueue(): Promise<void> {
    await db.clearSyncQueue();
  }
}

// Export singleton instance
export const syncEngine = new SyncEngine();
