# Optimum Therapy PT Practice Management System - Deployment Guide

## 🚀 Production Deployment Checklist

### Prerequisites
- [ ] Supabase account with HIPAA add-on enabled (paid plan required)
- [ ] Business Associate Agreement (BAA) executed with Supabase
- [ ] Resend API account for email notifications
- [ ] Twilio account for SMS notifications
- [ ] Domain name and SSL certificate
- [ ] Node.js 18+ installed locally

### 1. Environment Configuration

Create `.env.local` file with production values:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Encryption Key (Generate a secure 32-character key)
VITE_ENCRYPTION_KEY=your_32_character_encryption_key_here

# Email Configuration (Resend)
VITE_RESEND_API_KEY=re_your_resend_api_key

# SMS Configuration (Twilio)
VITE_TWILIO_ACCOUNT_SID=your_twilio_account_sid
VITE_TWILIO_AUTH_TOKEN=your_twilio_auth_token
VITE_TWILIO_PHONE_NUMBER=+1234567890

# Application Settings
VITE_APP_NAME=Optimum Therapy
VITE_FACILITY_NAME=Optimum Therapy
VITE_FACILITY_ADDRESS=Edificio Roman Carr 107 km 1.1, Aguadilla PR 00603
VITE_FACILITY_PHONE=787-XXX-XXXX
VITE_FACILITY_NPI=1234567890

# Session Configuration
VITE_SESSION_TIMEOUT_MINUTES=15
VITE_EOD_SYNC_TIME=18:00
```

### 2. Supabase Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run database migrations
npm run supabase:migrate

# Seed reference data
npm run supabase:seed

# Deploy Edge Functions
npm run supabase:functions
```

### 3. Database Configuration

#### Enable HIPAA Compliance
1. Go to Supabase Dashboard → Settings → Billing
2. Enable HIPAA add-on (requires Pro plan or higher)
3. Complete HIPAA compliance questionnaire

#### Configure RLS Policies
All tables have Row Level Security enabled. Verify policies are active:

```sql
-- Check RLS is enabled on all tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = false;
```

Should return no rows (all tables should have RLS enabled).

### 4. Create Initial Admin User

```sql
-- Insert admin staff record (run in Supabase SQL editor)
INSERT INTO staff (
  first_name, 
  last_name, 
  role, 
  email, 
  license_number, 
  npi, 
  ptan, 
  is_active
) VALUES (
  'Carlos', 
  'Lebron-Quiñones', 
  'admin', 
  'carlos@optimumtherapy.pr', 
  '4521', 
  '1477089696', 
  'LG520', 
  true
);
```

### 5. Frontend Deployment

#### Option A: Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

#### Option B: Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist

# Set environment variables in Netlify dashboard
```

### 6. PWA Configuration

#### Generate PWA Icons
Create the following icon files in `/public`:
- `pwa-192x192.png` (192x192 pixels)
- `pwa-512x512.png` (512x512 pixels)
- `favicon.ico`
- `apple-touch-icon.png`

#### Test PWA Installation
1. Open deployed app in Chrome/Edge
2. Look for install prompt in address bar
3. Test offline functionality
4. Verify service worker registration in DevTools

### 7. Security Configuration

#### Content Security Policy
Add to your hosting platform:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://your-project.supabase.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://your-project.supabase.co wss://your-project.supabase.co https://api.resend.com https://api.twilio.com;
```

#### HTTPS Enforcement
Ensure all traffic is served over HTTPS with proper SSL certificates.

### 8. Monitoring and Backup

#### Set Up Monitoring
1. Configure Supabase alerts for database performance
2. Set up uptime monitoring for the web application
3. Monitor sync queue length and error rates

#### Database Backup
1. Enable Supabase automatic backups (daily)
2. Set up point-in-time recovery
3. Test backup restoration process

### 9. Staff Training

#### Before Go-Live
- [ ] Train all staff on HIPAA compliance requirements
- [ ] Conduct system walkthrough with each user role
- [ ] Test offline functionality during simulated outage
- [ ] Verify all workflows match current practice patterns
- [ ] Document emergency procedures for system downtime

#### User Accounts
Create user accounts for each staff member:

```sql
-- Example: Create therapist account
INSERT INTO staff (
  user_id,           -- Will be populated after Supabase auth user creation
  first_name, 
  last_name, 
  role, 
  email, 
  license_number,
  color_code,        -- For calendar display
  is_active
) VALUES (
  null,              -- Update after creating auth user
  'Jane', 
  'Smith', 
  'therapist', 
  'jane@optimumtherapy.pr', 
  '5432',
  '#10B981',         -- Green
  true
);
```

### 10. Go-Live Checklist

#### Pre-Launch (1 Week Before)
- [ ] Complete system testing with sample data
- [ ] Verify all integrations (email, SMS, sync)
- [ ] Test PWA installation on all devices
- [ ] Backup existing patient data (if migrating)
- [ ] Schedule staff training sessions

#### Launch Day
- [ ] Deploy to production
- [ ] Verify all environment variables
- [ ] Test authentication and permissions
- [ ] Create first real patient record
- [ ] Test appointment scheduling
- [ ] Verify SOAP note creation and signing
- [ ] Test offline functionality
- [ ] Monitor sync queue and error logs

#### Post-Launch (First Week)
- [ ] Daily monitoring of sync status
- [ ] Collect user feedback
- [ ] Monitor system performance
- [ ] Verify automated reminders are working
- [ ] Check audit logs for compliance

### 11. Maintenance

#### Daily
- Monitor sync queue length
- Check for failed reminder notifications
- Review audit logs for unusual activity

#### Weekly
- Review system performance metrics
- Check database backup status
- Update staff schedules and availability

#### Monthly
- Review and update ICD-10/CPT code database
- Analyze usage patterns and performance
- Update system documentation as needed

### 12. Troubleshooting

#### Common Issues

**Sync Queue Growing**
```bash
# Check sync queue status
SELECT COUNT(*) FROM sync_queue WHERE attempts > 3;

# Clear failed sync items (after investigation)
DELETE FROM sync_queue WHERE attempts > 5;
```

**Authentication Issues**
- Verify Supabase RLS policies
- Check user role assignments in staff table
- Ensure JWT tokens include role claims

**Offline Functionality**
- Verify service worker registration
- Check IndexedDB storage limits
- Test PWA installation process

#### Support Contacts
- Technical Support: [Your support email]
- HIPAA Compliance: [Compliance officer]
- Emergency Contact: [24/7 support number]

---

## 🔒 HIPAA Compliance Verification

### Required Documentation
- [ ] Business Associate Agreement with Supabase
- [ ] Staff HIPAA training certificates
- [ ] Risk assessment documentation
- [ ] Incident response procedures
- [ ] Data backup and recovery procedures

### Audit Trail
The system automatically logs all PHI access and modifications. Regular audit reports should be generated and reviewed monthly.

### Data Encryption
- All PHI fields encrypted at rest using AES-256
- TLS encryption for all data transmission
- Encrypted backups with secure key management

---

**⚠️ IMPORTANT**: This system handles Protected Health Information (PHI). Ensure all staff complete HIPAA training before system access is granted.
