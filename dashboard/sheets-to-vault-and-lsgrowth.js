#!/usr/bin/env node

/**
 * Google Sheets → Vault + LS Growth Automation
 * Pulls leads from Google Sheets and syncs to vault folders + LS Growth
 *
 * Creates organized files:
 * - 00 Outreach/{Category}.md (call log format)
 * - 01 Pipeline/{Category}.md (follow-up/booking format)
 * - Also posts to LS Growth API
 *
 * Setup: See (C) SETUP - Sheets to LS Growth.md
 */

require('dotenv').config();
const { google } = require('googleapis');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Config
const GOOGLE_SHEETS_FOLDER_ID = '1_2D0ugCHUBPOB7O3abgksAO0KGMiVQeR';
const LS_GROWTH_API_ENDPOINT = 'https://app.lsgrowth.agency/api/leads';
const LS_GROWTH_API_KEY = process.env.LS_GROWTH_API_KEY || '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';

// Vault paths (relative to project root)
const VAULT_ROOT = process.env.VAULT_ROOT || 'C:/Users/lucky/Desktop/Luckys AI Brain';
const OUTREACH_FOLDER = path.join(VAULT_ROOT, '03 Projects/The Comeback/00 Outreach');
const PIPELINE_FOLDER = path.join(VAULT_ROOT, '03 Projects/The Comeback/01 Pipeline');

// Initialize Google APIs
const sheets = google.sheets({ version: 'v4', auth: new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_CREDENTIALS_PATH || './google-credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
}) });

const drive = google.drive({ version: 'v3', auth: new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_CREDENTIALS_PATH || './google-credentials.json',
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
}) });

/**
 * Get all Google Sheets from Email Outreach folder
 */
async function getSheetFilesFromFolder() {
  try {
    const res = await drive.files.list({
      q: `'${GOOGLE_SHEETS_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
      spaces: 'drive',
      pageSize: 100,
      fields: 'files(id, name)',
    });
    return res.data.files || [];
  } catch (err) {
    console.error('Error fetching sheet files:', err);
    return [];
  }
}

/**
 * Read data from a single Google Sheet
 */
async function readSheetData(sheetId, sheetName) {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `'${sheetName}'!A:I`,
    });
    return res.data.values || [];
  } catch (err) {
    console.error(`Error reading sheet ${sheetName}:`, err);
    return [];
  }
}

/**
 * Map sheet row to lead object
 */
function mapRowToLead(headers, row) {
  if (!row || row.length === 0) return null;

  const lead = {};
  headers.forEach((header, idx) => {
    if (row[idx] !== undefined) {
      lead[header.toLowerCase().replace(/\s+/g, '_')] = row[idx];
    }
  });

  if (!lead.business_name) return null;

  return {
    name: lead.business_name || 'Unknown',
    phone: lead.number || '',
    email: lead.email || '',
    website: lead.website || '',
    facebook: lead.facebook_page || '',
    last_contacted: lead.date_called || '',
    outcome: lead.outcome || '',
    call_back: lead.call_back || '',
    notes: lead.notes || '',
  };
}

/**
 * Create markdown file for category (e.g., "Auckland Cleaning")
 */
function createMarkdownForCategory(category, leads, folderPath) {
  const sanitized = category.replace(/[^a-zA-Z0-9-\s]/g, '').trim();
  const filename = path.join(folderPath, `${sanitized}.md`);

  // Build table
  let table = '| Business Name | Phone | Email | Website | Facebook | Last Called | Outcome | Call Back | Notes |\n';
  table += '|---|---|---|---|---|---|---|---|---|\n';

  leads.forEach(lead => {
    const row = [
      lead.name || '',
      lead.phone || '',
      lead.email || '',
      lead.website || '',
      lead.facebook || '',
      lead.last_contacted || '',
      lead.outcome || '',
      lead.call_back || '',
      lead.notes || '',
    ].map(cell => (cell || '').replace(/\|/g, '\\|')); // Escape pipes
    table += `| ${row.join(' | ')} |\n`;
  });

  // Build frontmatter
  const date = new Date().toISOString().split('T')[0];
  const content = `---
category: "${category}"
created: ${date}
total_leads: ${leads.length}
status: active
---

# ${category}

**Total Leads:** ${leads.length}
**Last Updated:** ${date}

## Leads

${table}

---

## Call Notes
- [ ] Leads added to LS Growth dashboard
- [ ] Review outcomes for follow-ups
`;

  try {
    fs.writeFileSync(filename, content, 'utf8');
    console.log(`  ✓ Created: ${path.basename(filename)}`);
    return true;
  } catch (err) {
    console.error(`  ✗ Failed to write ${filename}:`, err);
    return false;
  }
}

/**
 * Post lead to LS Growth API
 */
function postLeadToLSGrowth(lead) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(lead);

    const options = {
      hostname: 'app.lsgrowth.agency',
      path: '/api/leads',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'Authorization': `Bearer ${LS_GROWTH_API_KEY}`,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, status: res.statusCode });
        } else {
          reject({ error: `HTTP ${res.statusCode}`, response: data });
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

/**
 * Ensure folders exist
 */
function ensureFoldersExist() {
  [OUTREACH_FOLDER, PIPELINE_FOLDER].forEach(folder => {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
      console.log(`Created folder: ${folder}`);
    }
  });
}

/**
 * Main automation
 */
async function runAutomation() {
  console.log('[Sheets Sync] Starting...\n');

  try {
    ensureFoldersExist();

    // Get all sheets
    const files = await getSheetFilesFromFolder();
    console.log(`[Sheets Sync] Found ${files.length} categories\n`);

    let totalLeads = 0;
    let successCount = 0;
    let failureCount = 0;

    // Process each sheet/category
    for (const file of files) {
      console.log(`📂 ${file.name}`);

      const rows = await readSheetData(file.id, file.name);
      if (rows.length === 0) {
        console.log(`  └─ No data found\n`);
        continue;
      }

      const headers = rows[0];
      const dataRows = rows.slice(1);
      const leads = [];

      // Convert rows to lead objects
      for (const row of dataRows) {
        const lead = mapRowToLead(headers, row);
        if (lead) leads.push(lead);
      }

      console.log(`  ├─ ${leads.length} leads found`);

      // Create vault files (Outreach & Pipeline)
      console.log(`  ├─ Syncing to vault...`);
      createMarkdownForCategory(file.name, leads, OUTREACH_FOLDER);
      createMarkdownForCategory(file.name, leads, PIPELINE_FOLDER);

      // Post to LS Growth
      console.log(`  └─ Pushing to LS Growth...`);
      for (const lead of leads) {
        try {
          await postLeadToLSGrowth(lead);
          successCount++;
        } catch (err) {
          failureCount++;
          console.error(`    ⚠ ${lead.name}: ${err.error}`);
        }
        totalLeads++;
      }

      console.log('');
    }

    console.log(`\n✅ [Sheets Sync] Complete`);
    console.log(`  Total leads processed: ${totalLeads}`);
    console.log(`  LS Growth uploads: ${successCount} ✓ | ${failureCount} ✗`);
    console.log(`  Vault files created: 00 Outreach/ + 01 Pipeline/\n`);

  } catch (err) {
    console.error('[Sheets Sync] Fatal error:', err);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runAutomation();
}

module.exports = { runAutomation };
