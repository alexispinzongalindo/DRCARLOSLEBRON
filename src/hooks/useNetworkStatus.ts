import { useState, useEffect, useCallback } from 'react';
import { db } from '../db/dexie';

export type NetworkStatus = 'online' | 'offline' | 'pending';

export interface SyncState {
  isOnline: boolean;
  status: NetworkStatus;         // 'online' | 'offline' | 'pending' (items waiting to sync)
  queueCount: number;
  label: string;
  color: string;                 // Tailwind bg color class for the dot
  textColor: string;             // Tailwind text color class
}

// Probe the app's own origin with a no-cache HEAD request (3 s timeout).
// This bypasses service-worker caches thanks to cache: 'no-store'.
async function probeConnectivity(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    await fetch(`/?_=${Date.now()}`, {
      method: 'HEAD',
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timer);
    return true;
  } catch {
    return false;
  }
}

export function useNetworkStatus(): SyncState {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueCount, setQueueCount] = useState(0);

  // Real connectivity probe
  const checkConnectivity = useCallback(async () => {
    const reachable = await probeConnectivity();
    setIsOnline(reachable);
  }, []);

  // Sync queue count
  const updateQueue = useCallback(async () => {
    const count = await db.getSyncQueueCount();
    setQueueCount(count);
  }, []);

  useEffect(() => {
    // Instant browser events (fire when OS-level network changes)
    const handleOnline  = () => { setIsOnline(true);  updateQueue(); };
    const handleOffline = () => { setIsOnline(false); updateQueue(); };
    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);

    // Real probe: once on mount, then every 30 s
    checkConnectivity();
    updateQueue();
    const interval = setInterval(() => {
      checkConnectivity();
      updateQueue();
    }, 30_000);

    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [checkConnectivity, updateQueue]);

  // Derive display values
  let status: NetworkStatus;
  let label: string;
  let color: string;
  let textColor: string;

  if (!isOnline) {
    status    = 'offline';
    label     = queueCount > 0 ? `Offline · ${queueCount} queued` : 'Offline';
    color     = 'bg-red-500';
    textColor = 'text-red-600';
  } else if (queueCount > 0) {
    status    = 'pending';
    label     = `Syncing · ${queueCount} pending`;
    color     = 'bg-yellow-500';
    textColor = 'text-yellow-600';
  } else {
    status    = 'online';
    label     = 'Synced';
    color     = 'bg-green-500';
    textColor = 'text-green-600';
  }

  return { isOnline, status, queueCount, label, color, textColor };
}
