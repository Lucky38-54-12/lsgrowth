# Setup: Google Sheets → Vault + LS Growth

**What it does:**
1. Pulls all leads from Google Sheets (Auckland Cleaning, Auckland Plumbers, etc.)
2. Creates organized files in the vault by category:
   - `00 Outreach/Auckland Cleaning.md` (cold call list)
   - `01 Pipeline/Auckland Cleaning.md` (follow-up tracking)
3. Automatically imports all leads into LS Growth dashboard

---

## ⚡ Quick Start

### 1. Get Google Sheets API Credentials

You need a "Service Account" JSON file to access Google Sheets. Steps:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable "Google Sheets API" and "Google Drive API"
4. Go to "Service Accounts" → Create new service account
5. Create a key (JSON format) — download and save as `google-credentials.json` in this folder
6. Share your Email Outreach folder with the service account email (found in the JSON file)

### 2. Install Dependencies

```bash
cd "03 Projects/The Comeback/04 System"
npm install googleapis dotenv
```

### 3. Create `.env` file

Create a file `.env` in this folder:

```env
LS_GROWTH_API_KEY=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
GOOGLE_CREDENTIALS_PATH=./google-credentials.json
```

### 4. Run It

**One-time test:**
```bash
node sheets-to-vault-and-lsgrowth.js
```

**Check vault folders** — You should see new files:
- `00 Outreach/Auckland Cleaning.md`
- `01 Pipeline/Auckland Cleaning.md`
- etc.

**Scheduled (runs every 6 hours):**
```bash
# Windows Task Scheduler: Create task that runs: node C:\Users\lucky\Desktop\Luckys AI Brain\03 Projects\The Comeback\04 System\sheets-to-vault-and-lsgrowth.js

# Or use: npx node-cron (see below)
```

---

## 🔄 Automated Scheduling (No Manual Runs)

### Option A: Windows Task Scheduler (Simplest)

1. Open Task Scheduler (Windows key + "Task Scheduler")
2. Create Basic Task:
   - **Name:** LS Growth Sheets Sync
   - **Trigger:** Daily, 9 AM (or every 6 hours)
   - **Action:** Run `node` with argument `C:\Users\lucky\Desktop\Luckys AI Brain\03 Projects\The Comeback\04 System\sheets-to-lsgrowth.js`

### Option B: Node-Cron (Runs in background)

```bash
npm install node-cron
```

Create `sheets-to-vault-daemon.js`:
```javascript
const cron = require('node-cron');
const { runAutomation } = require('./sheets-to-vault-and-lsgrowth');

// Run every 6 hours (0, 6 AM, 12 PM, 6 PM)
cron.schedule('0 0,6,12,18 * * *', () => {
  console.log('Running vault + LS Growth sync...');
  runAutomation();
});

console.log('Daemon started. Sync runs every 6 hours.');
```

Then run:
```bash
node sheets-to-vault-daemon.js
```

---

## 📝 What Gets Mapped

| Sheet Column | → | LS Growth Field |
|---|---|---|
| Business Name | → | Lead Name |
| Number | → | Phone |
| Email | → | Email |
| Website | → | Website |
| Facebook Page | → | Social |
| Date Called | → | Last Contact |
| Outcome | → | Status |
| Call Back | → | Follow-up |
| Notes | → | Notes |

---

## ✅ Verify It Works

1. Add a test row to one of your sheets (e.g., "Test Company, 555-1234, test@example.com")
2. Run: `node sheets-to-lsgrowth.js`
3. Check LS Growth dashboard — should see the test lead

---

## 🐛 Troubleshooting

| Problem | Solution |
|---|---|
| `Error: google-credentials.json not found` | Make sure the JSON file is in this folder |
| `Error: 403 Forbidden` | Service account doesn't have access — re-share the Google Drive folder |
| `Error: HTTP 401` | API key is invalid — check LS_GROWTH_API_KEY in .env |
| Leads not importing | Check browser console in LS Growth dashboard for errors |

---

## 🔐 Security Note

- **Never commit** `.env` or `google-credentials.json` to git
- Keep your API key private
- These files are automatically in `.gitignore`
