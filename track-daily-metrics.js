#!/usr/bin/env node

/**
 * Daily Call Metrics Tracker
 * Reads 00 Outreach/(C) Daily Outreach Log.md
 * Generates daily/weekly metrics and reports
 */

const fs = require('fs');
const path = require('path');

const VAULT_ROOT = process.env.VAULT_ROOT || 'C:/Users/lucky/Desktop/Luckys AI Brain';
const LOG_FILE = path.join(VAULT_ROOT, '03 Projects/The Comeback/00 Outreach/(C) Daily Outreach Log.md');
const REPORTS_FOLDER = path.join(VAULT_ROOT, '03 Projects/The Comeback/00 Outreach/reports');

/**
 * Ensure reports folder exists
 */
function ensureFolder() {
  if (!fs.existsSync(REPORTS_FOLDER)) {
    fs.mkdirSync(REPORTS_FOLDER, { recursive: true });
  }
}

/**
 * Parse outreach log
 */
function parseOutreachLog() {
  if (!fs.existsSync(LOG_FILE)) {
    console.error(`Log file not found: ${LOG_FILE}`);
    return null;
  }

  const content = fs.readFileSync(LOG_FILE, 'utf8');
  const lines = content.split('\n');

  // Find the table
  const tableStart = lines.findIndex(l => l.includes('| Date'));
  if (tableStart === -1) {
    console.error('Could not find metrics table in log');
    return null;
  }

  const entries = [];
  for (let i = tableStart + 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || !line.startsWith('|')) break;

    const cols = line.split('|').map(c => c.trim()).filter(c => c);
    if (cols.length < 5) continue;

    entries.push({
      date: cols[0],
      calls: parseInt(cols[1]) || 0,
      convos: parseInt(cols[2]) || 0,
      meetings: parseInt(cols[3]) || 0,
      notes: cols[4] || ''
    });
  }

  return entries;
}

/**
 * Calculate weekly stats
 */
function getWeeklyStats(entries) {
  if (entries.length === 0) return null;

  const totalCalls = entries.reduce((sum, e) => sum + e.calls, 0);
  const totalConvos = entries.reduce((sum, e) => sum + e.convos, 0);
  const totalMeetings = entries.reduce((sum, e) => sum + e.meetings, 0);
  const daysLogged = entries.length;
  const targetCalls = 350; // 50 per day × 7 days

  return {
    days: daysLogged,
    calls: totalCalls,
    convos: totalConvos,
    meetings: totalMeetings,
    target: targetCalls,
    onTrack: totalCalls >= targetCalls,
    conversionRate: totalConvos > 0 ? ((totalMeetings / totalConvos) * 100).toFixed(1) : 0,
    callsPerDay: (totalCalls / daysLogged).toFixed(1),
    avgDaysLeft: Math.max(0, 7 - daysLogged)
  };
}

/**
 * Generate daily report
 */
function generateDailyReport(entries) {
  const today = entries[entries.length - 1];
  const date = new Date().toISOString().split('T')[0];

  const content = `---
date: "${date}"
type: "daily"
calls: ${today.calls}
convos: ${today.convos}
meetings: ${today.meetings}
---

# Daily Report — ${date}

## Today's Stats
- **Calls Made:** ${today.calls} (target: 50)
- **Conversations:** ${today.convos}
- **Meetings Booked:** ${today.meetings}

${today.calls >= 50 ? '✅ **Hit target today!**' : `⚠️ **Short by ${50 - today.calls} calls**`}

${today.notes ? `\n**Notes:** ${today.notes}` : ''}

---

## This Week So Far
${generateWeeklySection(entries)}
`;

  const filename = path.join(REPORTS_FOLDER, `(C) Daily Report - ${date}.md`);
  fs.writeFileSync(filename, content, 'utf8');
  console.log(`✓ Daily report: ${path.basename(filename)}`);

  return filename;
}

/**
 * Generate weekly section
 */
function generateWeeklySection(entries) {
  const weekly = getWeeklyStats(entries);
  if (!weekly) return '(No data yet)';

  return `| Metric | This Week |
|--------|-----------|
| **Calls** | ${weekly.calls} / ${weekly.target} |
| **Conversations** | ${weekly.convos} |
| **Meetings Booked** | ${weekly.meetings} |
| **Avg Calls/Day** | ${weekly.callsPerDay} |
| **Meeting Rate** | ${weekly.conversionRate}% |

${weekly.onTrack ? '🎯 **ON TRACK** — Keep it up!' : `⚠️ **BEHIND TARGET** — Need ${weekly.target - weekly.calls} more calls (${weekly.avgDaysLeft} days left)`}`;
}

/**
 * Generate weekly report
 */
function generateWeeklyReport(entries) {
  const weekly = getWeeklyStats(entries);
  if (!weekly) return null;

  const date = new Date().toISOString().split('T')[0];
  const weekEnd = new Date();
  weekEnd.setDate(weekEnd.getDate() - weekEnd.getDay() + 6);
  const weekOf = weekEnd.toISOString().split('T')[0];

  const content = `---
date: "${date}"
type: "weekly"
week_of: "${weekOf}"
calls: ${weekly.calls}
convos: ${weekly.convos}
meetings: ${weekly.meetings}
---

# Weekly Report — Week of ${weekOf}

## Weekly Summary
${generateWeeklySection(entries)}

## Daily Breakdown

| Date | Calls | Convos | Meetings | Notes |
|------|-------|--------|----------|-------|
${entries.map(e => `| ${e.date} | ${e.calls} | ${e.convos} | ${e.meetings} | ${e.notes} |`).join('\n')}

## Analysis
- **Best Day:** ${getBestDay(entries)}
- **Total Calls:** ${weekly.calls} (${weekly.callsPerDay} per day average)
- **Conversation Rate:** ${((weekly.convos / weekly.calls) * 100).toFixed(1)}%
- **Close Rate:** ${weekly.conversionRate}% (convos → meetings)

## Next Week
${weekly.onTrack ? '✅ Maintaining momentum — keep the same pace!' : '⚠️ Need to increase volume — aim for 55+ calls/day next week'}
`;

  const filename = path.join(REPORTS_FOLDER, `(C) Weekly Report - ${weekOf}.md`);
  fs.writeFileSync(filename, content, 'utf8');
  console.log(`✓ Weekly report: ${path.basename(filename)}`);

  return filename;
}

/**
 * Find best day
 */
function getBestDay(entries) {
  if (entries.length === 0) return '—';
  const best = entries.reduce((max, e) => e.calls > max.calls ? e : max);
  return `${best.date} (${best.calls} calls)`;
}

/**
 * Main
 */
function main() {
  console.log('[Metrics Tracker] Starting...\n');

  try {
    ensureFolder();
    const entries = parseOutreachLog();

    if (!entries || entries.length === 0) {
      console.error('No entries found in outreach log');
      return;
    }

    console.log(`Found ${entries.length} days of data\n`);

    // Generate daily report
    generateDailyReport(entries);

    // Generate weekly report if we have a full week or more
    if (entries.length >= 7) {
      generateWeeklyReport(entries);
    }

    console.log(`\n✅ [Metrics] Reports generated to: ${REPORTS_FOLDER}\n`);

  } catch (err) {
    console.error('[Metrics Tracker] Error:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { parseOutreachLog, getWeeklyStats };
