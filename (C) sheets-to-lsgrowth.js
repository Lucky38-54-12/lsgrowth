#!/usr/bin/env node

/**
 * Sheets to LS Growth Automation
 * Pulls leads from Google Sheets folder and imports into LS Growth
 *
 * Setup:
 * 1. npm install googleapis dotenv
 * 2. Get Google Sheets API credentials (service account JSON)
 * 3. Create .env with GOOGLE_SHEETS_FOLDER_ID and LS_GROWTH_API_KEY
 * 4. Run: node sheets-to-lsgrowth.js
 */

require('dotenv').config();
const { google } = require('googleapis');
const https = require('https');

// Config
const GOOGLE_SHEETS_FOLDER_ID = '1_2D0ugCHUBPOB7O3abgksAO0KGMiVQeR';
const LS_GROWTH_API_ENDPOINT = 'https://app.lsgrowth.agency/api/leads';
const LS_GROWTH_API_KEY = process.env.LS_GROWTH_API_KEY || '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';

// Expected columns in sheets
const EXPECTED_COLUMNS = ['Business Name', 'Number', 'Email', 'Website', 'Facebook Page', 'Date Called', 'Outcome', 'Call Back', 'Notes'];

// Initialize Google Sheets API
const sheets = google.sheets({ version: 'v4', auth: new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_CREDENTIALS_PATH || './google-credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
}) });

const drive = google.drive({ version: 'v3', auth: new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_CREDENTIALS_PATH || './google-credentials.json',
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
}) });

/**
 * Get all Google Sheets from the Email Outreach folder
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
      range: `'${sheetName}'!A:I`, // Adjust range as needed
    });
    return res.data.values || [];
  } catch (err) {
    console.error(`Error reading sheet ${sheetName}:`, err);
    return [];
  }
}

/**
 * Map sheet row to LS Growth lead object
 */
function mapRowToLead(headers, row) {
  if (!row || row.length === 0) return null;

  const lead = {};
  headers.forEach((header, idx) => {
    if (row[idx] !== undefined) {
      // Normalize header names
      lead[header.toLowerCase().replace(/\s+/g, '_')] = row[idx];
    }
  });

  // Only return if has at least business name
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
 * Main automation flow
 */
async function runAutomation() {
  console.log('[LS Growth Automation] Starting...');

  try {
    // Get all sheets from folder
    const files = await getSheetFilesFromFolder();
    console.log(`[LS Growth Automation] Found ${files.length} sheets`);

    let totalLeads = 0;
    let successCount = 0;
    let failureCount = 0;

    // Process each sheet
    for (const file of files) {
      console.log(`[LS Growth Automation] Processing: ${file.name}`);

      const rows = await readSheetData(file.id, file.name);
      if (rows.length === 0) {
        console.log(`  └─ No data found`);
        continue;
      }

      // First row = headers
      const headers = rows[0];
      const dataRows = rows.slice(1);

      console.log(`  ├─ Headers: ${headers.join(', ')}`);
      console.log(`  └─ ${dataRows.length} data rows`);

      // Process each data row
      for (const row of dataRows) {
        const lead = mapRowToLead(headers, row);
        if (!lead) continue;

        try {
          await postLeadToLSGrowth(lead);
          successCount++;
          console.log(`    ✓ ${lead.name}`);
        } catch (err) {
          failureCount++;
          console.error(`    ✗ ${lead.name}: ${err.error || err.message}`);
        }

        totalLeads++;
      }
    }

    console.log(`\n[LS Growth Automation] Complete`);
    console.log(`  Total leads: ${totalLeads}`);
    console.log(`  Success: ${successCount}`);
    console.log(`  Failed: ${failureCount}`);

  } catch (err) {
    console.error('[LS Growth Automation] Fatal error:', err);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runAutomation();
}

module.exports = { runAutomation, postLeadToLSGrowth, readSheetData };
