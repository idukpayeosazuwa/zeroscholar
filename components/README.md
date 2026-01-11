# 📧 Email Notification Cron Job

This cron job sends personalized scholarship match notifications to users based on their eligibility profiles.

## 🚀 Features

- ✅ Fetches all active scholarships and eligibility tracks in bulk (optimized N+1 fix)
- ✅ Matches scholarships against user profiles with bulletproof case-insensitive logic
- ✅ Sends beautiful HTML email digests with new matches only
- ✅ Updates user's `notified` array to prevent duplicate notifications
- ✅ Automatically deactivates expired scholarships (pagination-safe)
- ✅ Full error logging and debugging output

## 📦 Setup

### 1. Install Dependencies

```bash
npm install
```

Dependencies:
- `node-appwrite` - Appwrite SDK for database access
- `nodemailer` - Email sending
- `dotenv` - Environment variable management

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:

```env
# Appwrite Configuration
APPWRITE_ENDPOINT=https://sfo.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key

# Database Configuration
APPWRITE_DATABASE_ID=scholarship_db
APPWRITE_SCHOLARSHIP_COLLECTION_ID=scholarships
APPWRITE_TRACKS_COLLECTION_ID=eligibility_tracks
APPWRITE_USER_COLLECTION_ID=users

# Gmail Configuration
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password
```

### 3. Gmail App Password Setup

For Gmail to work, you need to generate an App Password:

1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to **App Passwords**
4. Generate a new app password for "Mail"
5. Copy the 16-character password (no spaces)
6. Use it as `GMAIL_APP_PASSWORD` in your `.env` file

⚠️ **Never use your regular Gmail password!**

## 🏃 Running the Cron Job

### Manual Execution

```bash
node email-notification-cron.js
```

### Scheduled Execution

#### Option 1: Linux/Mac (crontab)

Edit your crontab:

```bash
crontab -e
```

Add a daily run at 9 AM:

```cron
0 9 * * * cd /path/to/zeroscholar/components && node email-notification-cron.js >> /var/log/scholarship-cron.log 2>&1
```

#### Option 2: PM2 (Production)

Install PM2:

```bash
npm install -g pm2
```

Create `ecosystem.config.cjs`:

```javascript
module.exports = {
  apps: [{
    name: 'scholarship-email-cron',
    script: './email-notification-cron.js',
    cron_restart: '0 9 * * *', // 9 AM daily
    autorestart: false,
    watch: false,
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

Start with PM2:

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

#### Option 3: Appwrite Functions (Serverless)

Deploy as an Appwrite Function with scheduled execution:

1. Create new function in Appwrite Console
2. Upload the script
3. Set schedule: `0 9 * * *` (9 AM daily)
4. Add environment variables in function settings

## 📊 Output Example

```
🚀 Starting email notification cron job...

⏰ Deactivating expired scholarships...
   📥 Fetching all active scholarships to check...
   📋 Found 450 active scholarships to check
✅ Deactivated 3 scholarships

📋 Fetching active scholarships...
✅ Found 447 active scholarships

📚 Fetching all eligibility tracks in bulk...
   📦 Fetched batch: 500 tracks (total: 500)
   📦 Fetched batch: 250 tracks (total: 750)
✅ Fetched 750 tracks total
   🎯 447 tracks match active scholarships

👥 Fetching all users...
✅ Found 1,247 total users

📧 Processing 1,247 users for scholarship matches...

📨 user@example.com: Found 3 new matches
✅ Email sent and notified array updated
📨 student@example.com: Found 1 new matches
✅ Email sent and notified array updated

📊 SUMMARY:
   Total users: 1,247
   Users notified: 342
   Emails sent: 342
✅ Cron job completed
```

## 🎯 Matching Logic

The cron uses bulletproof matching logic that handles:

- ✅ Case-insensitive comparisons (Gender, State, University, etc.)
- ✅ Wildcard support (`ALL`, `ANY`, `NONE`)
- ✅ Type coercion (number vs string for levels)
- ✅ Date parsing with ordinal suffixes (Dec 31st, 2025)
- ✅ Empty tracks = open eligibility

## 🔒 Security

- ✅ API keys and passwords stored in `.env` (never committed to git)
- ✅ `.env` file is in `.gitignore`
- ✅ Use `.env.example` as a template for others
- ✅ Gmail App Passwords instead of real passwords

## 🐛 Troubleshooting

### "Missing required environment variables"

Make sure your `.env` file exists and has all required variables.

### "Email error: Invalid login"

1. Check Gmail App Password is correct (16 characters, no spaces)
2. Verify 2-Step Verification is enabled on your Google account
3. Generate a new App Password if needed

### "No scholarships found"

Check that scholarships in database have `is_active: true`.

## 📝 Notes

- The cron job runs in **UTC timezone** by default
- Emails are sent using Gmail SMTP
- Failed emails are logged but don't stop the process
- Duplicate notifications are prevented via the `notified` array in user documents
