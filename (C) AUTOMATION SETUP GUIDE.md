# LS Growth Automation — Setup Guide

**Status:** Ready to deploy  
**Components:** 3 automated processes running in background

---

## 🎯 What's Automated

| Process | What It Does | How Often |
|---------|-------------|-----------|
| **Email Monitor** | Reads Google Sheets → validates outcomes → generates email drafts | Every 30 min |
| **Metrics Tracker** | Tracks daily calls vs 50 target → generates reports | Daily (evening) |
| **Vault Sync** | Syncs leads from sheets to vault folders | Every 6 hours |

---

## ⚡ Quick Start

### 1. Install Dependencies

```bash
cd "03 Projects/The Comeback/04 System"
npm install node-cron
```

### 2. Create `.env` File

```bash
# Create .env in 04 System/ folder with:
LS_GROWTH_API_KEY=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
GOOGLE_CREDENTIALS_PATH=./google-credentials.json
VAULT_ROOT=C:/Users/lucky/Desktop/Luckys AI Brain
```

### 3. Test Individual Scripts

```bash
# Test email monitor
node sheets-monitor-and-email.js

# Test metrics tracker
node track-daily-metrics.js

# Test vault sync
node sheets-to-vault-and-lsgrowth.js
```

### 4. Start Daemon (Runs in background)

```bash
node sheets-monitor-daemon.js
```

Or use the batch file:
```bash
start-daemon.bat
```

---

## 🔄 Automated Workflow

### Your Daily Flow

1. **You make a cold call** → Dean at ABC Cleaning
2. **You log it in Google Sheets:**
   - Date Called: 2026-06-24
   - Outcome: "interested, call back thursday"
   - Notes: "Budget $5k/mo, decision maker is manager"
3. **Every 30 min, Claude automatically:**
   - Reads the new entry
   - Fixes the outcome → "Call Back"
   - Generates personalized email draft
   - Saves to `04 System/email-drafts/(C) Email Draft - ABC Cleaning - 2026-06-24.md`
4. **You review the draft** (takes 10 sec) → approve or tweak
5. **Once Gmail is set up** → email sends automatically

### Evening Report (6 PM)

Metrics script auto-generates:
- **Daily Report:** Shows today's calls vs 50 target
- **Weekly Report:** Shows this week vs 350 target, trends, best days

---

## 📁 Files Created

| File | Purpose |
|------|---------|
| `sheets-monitor-and-email.js` | Reads sheets → generates email drafts |
| `sheets-monitor-daemon.js` | Runs email monitor continuously (every 30 min) |
| `track-daily-metrics.js` | Generates daily/weekly call reports |
| `start-daemon.bat` | Easy button to start the daemon |
| `.env` | API keys + configuration |

---

## 🔐 Security Note

- ✅ `.env` and `google-credentials.json` are in `.gitignore`
- ✅ Never commit API keys to git
- Keep credentials private

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| `Error: node-cron not found` | Run `npm install node-cron` |
| `Error: google-credentials.json not found` | Add the JSON file to `04 System/` |
| Daemon not running | Check console for error messages, verify `.env` is set |
| Email drafts not generating | Check that Google Sheets has new rows with all required columns |

---

## ✅ Next Steps

- [ ] Test each script individually
- [ ] Start the daemon (`node sheets-monitor-daemon.js`)
- [ ] Make a test call in Google Sheets
- [ ] Verify email draft is created in 30 min
- [ ] Review the draft template
- [ ] Set up Gmail credentials when ready
- [ ] Enable auto-send (skip review)

