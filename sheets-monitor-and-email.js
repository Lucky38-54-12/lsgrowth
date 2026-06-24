#!/usr/bin/env node

/**
 * Google Sheets → Email Draft Generator
 *
 * Monitors Email Outreach sheets for new call entries
 * Validates/fixes outcome column
 * Generates personalized email drafts
 * Saves to vault for review
 */

require('dotenv').config();
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Config
const GOOGLE_SHEETS_FOLDER_ID = '1_2D0ugCHUBPOB7O3abgksAO0KGMiVQeR';
const VAULT_ROOT = process.env.VAULT_ROOT || 'C:/Users/lucky/Desktop/Luckys AI Brain';
const DRAFTS_FOLDER = path.join(VAULT_ROOT, '03 Projects/The Comeback/04 System/email-drafts');
const PROCESSED_LOG = path.join(DRAFTS_FOLDER, 'processed.json');

// Initialize Google APIs
const sheets = google.sheets({ version: 'v4', auth: new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_CREDENTIALS_PATH || './google-credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
}) });

const drive = google.drive({ version: 'v3', auth: new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_CREDENTIALS_PATH || './google-credentials.json',
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
}) });

// Valid outcomes
const VALID_OUTCOMES = [
  'No Answer',
  'Interested',
  'Not Interested',
  'Follow-up Needed',
  'Meeting Booked',
  'Call Back',
  'Left Voicemail',
  'Wrong Number'
];

/**
 * Validate and fix outcome
 */
function validateOutcome(outcome) {
  if (!outcome || outcome.trim() === '') return 'No Answer';

  const clean = outcome.trim();

  // Check if valid
  if (VALID_OUTCOMES.some(v => clean.toLowerCase().includes(v.toLowerCase()))) {
    return clean;
  }

  // Auto-fix common issues
  if (clean.toLowerCase().includes('maybe') || clean.toLowerCase().includes('perhaps')) {
    return 'Follow-up Needed';
  }
  if (clean.toLowerCase().includes('no') || clean.toLowerCase().includes('not interested')) {
    return 'Not Interested';
  }
  if (clean.toLowerCase().includes('yes') || clean.toLowerCase().includes('interested')) {
    return 'Interested';
  }
  if (clean.toLowerCase().includes('call back') || clean.toLowerCase().includes('callback')) {
    return 'Call Back';
  }
  if (clean.toLowerCase().includes('meeting') || clean.toLowerCase().includes('booked')) {
    return 'Meeting Booked';
  }
  if (clean.toLowerCase().includes('voicemail')) {
    return 'Left Voicemail';
  }

  // Default fallback
  return 'Follow-up Needed';
}

/**
 * Generate personalized email template
 */
function generateEmailTemplate(lead, outcome) {
  const businessName = lead.business_name || 'Business';
  const contactName = lead.contact_name || businessName;
  const phone = lead.number || '';
  const notes = lead.notes || '';

  let subject = '';
  let body = '';

  switch(outcome) {
    case 'No Answer':
      subject = `Following up on our call to ${businessName}`;
      body = `Hi ${contactName},\n\nI tried reaching you earlier but wasn't able to connect. I'd love to chat about how we can help ${businessName} grow.\n\nWould ${phone} be a good time to catch up?\n\nBest,\nLS Growth`;
      break;

    case 'Left Voicemail':
      subject = `Quick follow-up from LS Growth`;
      body = `Hi ${contactName},\n\nI left you a voicemail earlier. When you get a moment, give me a call back at ${phone} or reply to this email.\n\nLooking forward to connecting!\n\nBest,\nLS Growth`;
      break;

    case 'Interested':
      subject = `Let's set up a time to chat`;
      body = `Hi ${contactName},\n\nGreat chatting with you! I'd love to show you what we've done for similar businesses.\n\nLet's book a time that works for you. I'm flexible!\n\nBest,\nLS Growth`;
      break;

    case 'Not Interested':
      subject = `Keeping the door open`;
      body = `Hi ${contactName},\n\nNo worries if now's not the right time! If things change or you want to revisit this down the road, just reach out.\n\nBest of luck,\nLS Growth`;
      break;

    case 'Follow-up Needed':
      subject = `Quick note - want to loop back with you`;
      body = `Hi ${contactName},\n\nThanks for chatting today. I've got some ideas based on what you shared.\n\nWhen's a good time to follow up this week?\n\nBest,\nLS Growth`;
      break;

    case 'Call Back':
      subject = `Let's reconnect`;
      body = `Hi ${contactName},\n\nThanks for taking my call! You mentioned a good time to reconnect would be [DATE/TIME].\n\nI'll reach out then. Looking forward to it!\n\nBest,\nLS Growth`;
      break;

    case 'Meeting Booked':
      subject = `Confirming our meeting - ${businessName}`;
      body = `Hi ${contactName},\n\nExcited to meet with you! Just confirming our meeting is set.\n\nIf anything changes, just let me know.\n\nBest,\nLS Growth`;
      break;

    default:
      subject = `Following up with ${businessName}`;
      body = `Hi ${contactName},\n\nGreat connecting with you today. Looking forward to chatting more!\n\nBest,\nLS Growth`;
  }

  return { subject, body };
}

/**
 * Load processed log
 */
function loadProcessedLog() {
  if (fs.existsSync(PROCESSED_LOG)) {
    try {
      return JSON.parse(fs.readFileSync(PROCESSED_LOG, 'utf8'));
    } catch {
      return {};
    }
  }
  return {};
}

/**
 * Save processed log
 */
function saveProcessedLog(log) {
  fs.writeFileSync(PROCESSED_LOG, JSON.stringify(log, null, 2), 'utf8');
}

/**
 * Get all sheets
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
    console.error('Error fetching sheets:', err.message);
    return [];
  }
}

/**
 * Read sheet data
 */
async function readSheetData(sheetId, sheetName) {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `'${sheetName}'!A:I`,
    });
    return res.data.values || [];
  } catch (err) {
    console.error(`Error reading ${sheetName}:`, err.message);
    return [];
  }
}

/**
 * Map row to lead
 */
function mapRowToLead(headers, row) {
  if (!row || row.length === 0) return null;

  const lead = {};
  headers.forEach((header, idx) => {
    if (row[idx] !== undefined) {
      lead[header.toLowerCase().replace(/\s+/g, '_')] = row[idx];
    }
  });

  return lead.business_name ? lead : null;
}

/**
 * Ensure folders exist
 */
function ensureFoldersExist() {
  if (!fs.existsSync(DRAFTS_FOLDER)) {
    fs.mkdirSync(DRAFTS_FOLDER, { recursive: true });
    console.log(`Created: ${DRAFTS_FOLDER}`);
  }
}

/**
 * Save email draft to vault
 */
function saveEmailDraft(lead, outcome, email) {
  const businessName = (lead.business_name || 'Unknown').replace(/[^a-zA-Z0-9-]/g, '');
  const date = new Date().toISOString().split('T')[0];
  const filename = path.join(DRAFTS_FOLDER, `(C) Email Draft - ${businessName} - ${date}.md`);

  const content = `---
business_name: "${lead.business_name}"
contact_name: "${lead.contact_name || ''}"
phone: "${lead.number || ''}"
email: "${lead.email || ''}"
outcome: "${outcome}"
draft_date: "${date}"
status: "draft"
---

# Email Draft: ${lead.business_name}

**To:** ${lead.email || '[EMAIL]'}
**Subject:** ${email.subject}

---

## Email Body

${email.body}

---

## Call Notes
${lead.notes || '(no notes)'}

---

## Actions
- [ ] Review email
- [ ] Send email
- [ ] Mark as sent in sheet
`;

  try {
    fs.writeFileSync(filename, content, 'utf8');
    return { success: true, filename };
  } catch (err) {
    console.error(`Failed to save draft:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Main monitoring loop
 */
async function monitorSheets() {
  console.log('[Email Monitor] Starting...\n');

  try {
    ensureFoldersExist();
    const processedLog = loadProcessedLog();

    const files = await getSheetFilesFromFolder();
    console.log(`Found ${files.length} categories\n`);

    let totalProcessed = 0;

    for (const file of files) {
      console.log(`📂 ${file.name}`);

      const rows = await readSheetData(file.id, file.name);
      if (rows.length < 2) {
        console.log(`  └─ No data\n`);
        continue;
      }

      const headers = rows[0];
      const dataRows = rows.slice(1);

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        const lead = mapRowToLead(headers, row);

        if (!lead) continue;

        const rowKey = `${file.id}-${file.name}-${i}`;

        // Skip if already processed
        if (processedLog[rowKey]) continue;

        // Get outcome and validate
        let outcome = lead.outcome || '';
        const fixedOutcome = validateOutcome(outcome);

        if (outcome !== fixedOutcome) {
          console.log(`  ├─ ${lead.business_name}: Outcome fixed ("${outcome}" → "${fixedOutcome}")`);
        } else {
          console.log(`  ├─ ${lead.business_name}: ${fixedOutcome}`);
        }

        // Generate email
        const email = generateEmailTemplate(lead, fixedOutcome);

        // Save draft
        const result = saveEmailDraft(lead, fixedOutcome, email);

        if (result.success) {
          console.log(`  │  ✓ Draft saved: ${path.basename(result.filename)}`);
          processedLog[rowKey] = { date: new Date().toISOString(), outcome: fixedOutcome };
          totalProcessed++;
        } else {
          console.log(`  │  ✗ Failed to save draft: ${result.error}`);
        }
      }

      console.log('');
    }

    saveProcessedLog(processedLog);

    console.log(`\n✅ [Email Monitor] Complete`);
    console.log(`   Processed: ${totalProcessed} new calls`);
    console.log(`   Drafts saved to: ${DRAFTS_FOLDER}\n`);

  } catch (err) {
    console.error('[Email Monitor] Fatal error:', err);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  monitorSheets();
}

module.exports = { monitorSheets };
