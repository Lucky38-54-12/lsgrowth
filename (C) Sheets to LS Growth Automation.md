# Sheets to LS Growth Automation

**Purpose:** Pull leads from Google Sheets and auto-import into LS Growth.

## Configuration

### Google Drive Folder
**Email Outreach folder:** https://drive.google.com/drive/u/0/folders/1_2D0ugCHUBPOB7O3abgksAO0KGMiVQeR

Contains all lead sheets:
- Auckland Cleaning
- Auckland Plumbers
- Auckland Sparkys
- Chch Cleaners
- Chch Sparkys
- Chch- Electrical
- Chch- Moving
- Dunedin Cleaning
- Dunedin Sparkys
- Exploy Floor Coatings
- Fencing Companies
- Hamilton Cleaning
- Hamilton Plumbers
- Hamilton Sparkys
- Inv Electrical
- (and more as added)

### LS Growth API
**Endpoint:** `https://app.lsgrowth.agency/api/leads`
**API Key:** `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`

### Sheet Column Mapping
Standard columns (some sheets may vary slightly):
- Business Name
- Number
- Email
- Website
- Facebook Page
- Date Called
- Outcome
- Call Back
- Notes

## Files Created
- `(C) sheets-to-vault-and-lsgrowth.js` — Main automation script
- `(C) SETUP - Sheets to LS Growth.md` — Setup & deployment instructions

## How It Works
1. Reads all Google Sheets from Email Outreach folder (Auckland Cleaning, Auckland Plumbers, etc.)
2. For each category/sheet:
   - Creates `00 Outreach/{Category}.md` (organized cold call list)
   - Creates `01 Pipeline/{Category}.md` (organized follow-up tracking)
   - POSTs each lead to LS Growth API
3. Logs results to console

## Output Example
```
00 Outreach/Auckland Cleaning.md       ← Call list with leads
00 Outreach/Auckland Plumbers.md
01 Pipeline/Auckland Cleaning.md       ← Follow-up tracking
01 Pipeline/Auckland Plumbers.md
```

## Status
✅ Ready. Follow setup instructions in `(C) SETUP - Sheets to LS Growth.md`
