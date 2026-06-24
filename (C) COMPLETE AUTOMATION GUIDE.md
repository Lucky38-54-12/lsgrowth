# LS Growth Complete Automation Suite — Master Guide

**Status:** ✅ FULLY BUILT & READY  
**Last Updated:** 2026-06-24  
**Total Scripts:** 13  
**Total Documentation:** 5 guides  

---

## 📚 Quick Navigation

| Want to... | Read This |
|-----------|-----------|
| Get started quickly | **Quick Start (below)** |
| See what was built | [[03 Projects/The Comeback/04 System/(C) WHAT WAS BUILT]] |
| Detailed setup | [[03 Projects/The Comeback/04 System/(C) AUTOMATION SETUP GUIDE]] |
| Complete checklist | [[03 Projects/The Comeback/04 System/(C) FINAL CHECKLIST]] |
| Understand each script | **Scripts Reference (below)** |

---

## ⚡ Quick Start (5 Minutes)

### Step 1: Install Dependencies
```bash
cd "03 Projects/The Comeback/04 System"
npm install node-cron
```

### Step 2: Create `.env`
Create file `.env` in `04 System/` with:
```
LS_GROWTH_API_KEY=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
GOOGLE_CREDENTIALS_PATH=./google-credentials.json
VAULT_ROOT=C:/Users/lucky/Desktop/Luckys AI Brain
```

### Step 3: Run Setup Wizard
```bash
node setup-automation.js
```

### Step 4: Start Monitoring
```bash
node sheets-monitor-daemon.js
```

**Done.** System runs 24/7 in background.

---

## 🛠️ Scripts Reference

### Core Automation (6 scripts)

#### 1. **sheets-monitor-and-email.js**
**Purpose:** Main email generator. Monitors Google Sheets for new calls and creates personalized email drafts.

**What it does:**
- Reads Email Outreach Google Sheets every 30 min
- Detects NEW rows (calls logged by you)
- Validates & fixes messy "Outcome" text
- Generates personalized email draft
- Saves to `email-drafts/` folder

**Output:** `(C) Email Draft - {Business Name}.md`

**How to use:** 
- Runs automatically via daemon
- Or manually: `node sheets-monitor-and-email.js`

**Templates:** 15+ email templates for different outcomes (no answer, interested, not interested, etc.)

---

#### 2. **sheets-monitor-daemon.js**
**Purpose:** Keeps email monitor running continuously.

**What it does:**
- Runs `sheets-monitor-and-email.js` every 30 minutes
- Never stops (until you stop it)
- Handles errors gracefully

**How to use:**
```bash
node sheets-monitor-daemon.js
```
Or: Double-click `start-daemon.bat`

**Output:** Console log + file logs

---

#### 3. **track-daily-metrics.js**
**Purpose:** Tracks your daily cold calls and generates reports.

**What it does:**
- Reads `00 Outreach/(C) Daily Outreach Log.md`
- Generates daily report (today vs 50 target)
- Generates weekly report (this week vs 350 target)
- Shows conversion rates and trends

**Output:** 
- `00 Outreach/reports/(C) Daily Report - {DATE}.md`
- `00 Outreach/reports/(C) Weekly Report - {DATE}.md`

**How to use:** `node track-daily-metrics.js`

---

#### 4. **pipeline-sync.js**
**Purpose:** Syncs with LS Growth and updates pipeline dashboard.

**What it does:**
- Reads from LS Growth API
- Categorizes leads by stage
- Generates pipeline dashboard
- Generates stale leads alert (not contacted in 7+ days)

**Output:**
- `01 Pipeline/(C) Pipeline Dashboard.md`
- `01 Pipeline/(C) Stale Leads Alert - {DATE}.md`

**How to use:** `node pipeline-sync.js`

---

#### 5. **generate-reports.js**
**Purpose:** Creates weekly and monthly performance reviews with insights.

**What it does:**
- Generates detailed weekly report
- Generates monthly review
- Analyzes what's working vs not
- Recommends next month targets

**Output:**
- `07 Iteration Logs/(C) Weekly Report - {DATE}.md`
- `07 Iteration Logs/(C) Monthly Review - {MONTH}.md`

**How to use:** `node generate-reports.js`

---

#### 6. **full-automation.js**
**Purpose:** Runs ALL scripts in sequence (master orchestrator).

**What it does:**
- Runs all 5 scripts above in order
- Handles errors gracefully
- Logs results
- Generates summary

**Output:** Console summary + detailed logs

**How to use:** `node full-automation.js` (once daily)

---

### Helper & Utility Scripts (5 scripts)

#### 7. **analytics-engine.js**
**Purpose:** Advanced analytics on call patterns and performance.

**What it does:**
- Analyzes best/worst days
- Identifies day-of-week patterns
- Predicts next month performance
- Provides optimization recommendations

**Output:** `07 Iteration Logs/(C) Analytics Report - {DATE}.md`

**How to use:** `node analytics-engine.js`

---

#### 8. **status-monitor.js**
**Purpose:** Health check for all automation processes.

**What it does:**
- Checks what's running
- Counts generated files
- Reports errors & warnings
- Generates status report

**Output:** 
- Console summary
- `04 System/(C) Status Report - {DATE}.md`

**How to use:** `node status-monitor.js`

---

#### 9. **setup-automation.js**
**Purpose:** One-time setup wizard.

**What it does:**
- Validates Node.js
- Checks credentials
- Creates `.env` if missing
- Creates required folders
- Installs npm packages

**Output:** Setup checklist + validation results

**How to use:** `node setup-automation.js` (once)

---

#### 10. **logger.js**
**Purpose:** Logging utility (used by all scripts).

**What it does:**
- Writes logs to `logs/` folder
- Provides clean logging API
- Auto-cleans old logs

**Output:** `logs/{script}-{date}.log`

**Files created:** Automatically used by all scripts

---

#### 11. **email-templates.js**
**Purpose:** Library of 15+ email templates.

**What it does:**
- Stores pre-written email templates
- Personalizes with lead data
- Maps outcomes to best templates
- Used by email monitor

**Templates included:**
- No Answer
- Left Voicemail
- Interested
- Not Interested
- Follow-up Needed
- Call Back Scheduled
- Meeting Booked
- Budget Discussion Needed
- Decision Maker Not Available
- Already Using Competitor
- Wrong Timing
- Price Concern
- Need Info
- Referral Request
- Personal Connection

---

### Other Files (2 files)

#### 12. **start-daemon.bat** (Windows batch file)
**Purpose:** One-click button to start the daemon.

**What it does:**
- Installs node-cron if needed
- Starts daemon
- Keeps window open for errors

**How to use:** Double-click `start-daemon.bat`

---

#### 13. **package.json**
**Purpose:** npm configuration.

**Contains:** Dependencies (googleapis, dotenv, node-cron)

---

## 📋 What Each Script Outputs

### Folders Created

```
04 System/
├── email-drafts/              ← Email drafts (saved here)
│   └── (C) Email Draft - {Business}.md
├── logs/                      ← Detailed logs
│   ├── sheets-monitor-and-email-2026-06-24.log
│   ├── track-daily-metrics-2026-06-24.log
│   └── [other logs...]
└── (C) Status Report - {DATE}.md

00 Outreach/
└── reports/                   ← Daily/weekly call reports
    ├── (C) Daily Report - 2026-06-24.md
    └── (C) Weekly Report - 2026-06-24.md

01 Pipeline/
├── (C) Pipeline Dashboard.md
└── (C) Stale Leads Alert - {DATE}.md

07 Iteration Logs/
├── (C) Weekly Report - 2026-06-24.md
├── (C) Monthly Review - 2026-06.md
├── (C) Analytics Report - 2026-06-24.md
└── (C) Growth Analysis - 2026-06-24.md
```

---

## 🔄 Automation Schedule

### Every 30 Minutes (24/7)
- ✅ Email Monitor reads sheets → generates email drafts

### Daily (Evening - 6 PM)
- ✅ Metrics Tracker generates daily/weekly reports
- ✅ Pipeline Sync updates dashboard
- ✅ Reports Generator creates insights
- ✅ Analytics Engine identifies patterns
- ✅ Status Monitor generates health check

### Weekly (Optional)
- Run `full-automation.js` to do everything at once

### Monthly
- Monthly review auto-generated
- Trends analysis created

---

## 🎯 How to Activate Everything

### Option A: Daemon Only (Recommended for Daily Automation)
```bash
node sheets-monitor-daemon.js
```
Pros:
- Continuous monitoring
- Runs 24/7
- Minimal setup

Cons:
- Requires keeping terminal/PowerShell open
- Daemon stops if window closes

---

### Option B: Windows Task Scheduler (Best for Production)
1. Open Task Scheduler
2. Create Basic Task: "LS Growth Automation"
3. Trigger: Daily at 6 PM (or multiple times per day)
4. Action: Run `node full-automation.js`

---

### Option C: Manual (Testing)
```bash
# Email drafts only
node sheets-monitor-and-email.js

# Metrics only
node track-daily-metrics.js

# Everything at once
node full-automation.js
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| `node: command not found` | Install Node.js from https://nodejs.org |
| `Error: google-credentials.json not found` | Add JSON file to `04 System/` |
| `Error: .env not found` | Run `node setup-automation.js` |
| Daemon won't start | Check all dependencies: `npm install node-cron` |
| No email drafts generated | Verify Google Sheets has new rows with required columns |
| Reports not generating | Check outreach log exists: `00 Outreach/(C) Daily Outreach Log.md` |
| LS Growth API errors | LS Growth may not be online yet (not critical) |

---

## 📊 Success Metrics

### What You Get

✅ **30 min:** Email drafts auto-generated (for review/approval)  
✅ **Daily:** Call metrics & reports auto-generated  
✅ **Daily:** Pipeline dashboard & stale alerts auto-generated  
✅ **Daily:** Weekly/monthly insights auto-generated  
✅ **Daily:** Advanced analytics & optimization tips auto-generated  
✅ **24/7:** Continuous monitoring with error logging  

### Before vs After

| Metric | Before | After |
|--------|--------|-------|
| Manual prompting | Every task | ✅ Zero |
| Email draft time | 10 min each | ✅ Automatic |
| Report generation | Manual | ✅ Automatic |
| Pipeline updates | Manual | ✅ Automatic |
| Pattern analysis | None | ✅ Daily insights |

---

## 🎓 Advanced Tips

### Customize Email Templates
Edit `email-templates.js` and add new outcomes as needed.

### Change Monitoring Frequency
In `sheets-monitor-daemon.js`, change `'*/30 * * * *'` to different cron syntax:
- `'*/15 * * * *'` = every 15 minutes
- `'*/60 * * * *'` = every 60 minutes
- `'0 9 * * *'` = daily at 9 AM

### View Real-Time Logs
```bash
# Watch email monitor logs
tail -f "04 System/logs/sheets-monitor-and-email-*.log"
```

### Debug Mode
Set `DEBUG=true` environment variable for verbose logging:
```bash
$env:DEBUG='true'; node sheets-monitor-and-email.js
```

---

## 📞 Support

Check the logs folder (`04 System/logs/`) for detailed error messages.

---

## 🎉 You're Ready

Everything is built. You have:

- ✅ 13 automated scripts
- ✅ 5 documentation guides
- ✅ Email template library
- ✅ Logging system
- ✅ Health monitoring
- ✅ Analytics engine
- ✅ Report generation

**Next:** Run `node setup-automation.js` to verify everything, then `node sheets-monitor-daemon.js` to start.

