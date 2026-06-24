#!/usr/bin/env node

/**
 * Business Reports Generator
 * Creates weekly and monthly performance reviews
 * Analyzes what's working, what isn't, growth trends
 */

const fs = require('fs');
const path = require('path');

const VAULT_ROOT = process.env.VAULT_ROOT || 'C:/Users/lucky/Desktop/Luckys AI Brain';
const OUTREACH_LOG = path.join(VAULT_ROOT, '03 Projects/The Comeback/00 Outreach/(C) Daily Outreach Log.md');
const REPORTS_FOLDER = path.join(VAULT_ROOT, '03 Projects/The Comeback/00 Outreach/reports');
const INSIGHTS_FOLDER = path.join(VAULT_ROOT, '03 Projects/The Comeback/07 Iteration Logs');

/**
 * Parse outreach log
 */
function parseOutreachLog() {
  if (!fs.existsSync(OUTREACH_LOG)) {
    return [];
  }

  const content = fs.readFileSync(OUTREACH_LOG, 'utf8');
  const lines = content.split('\n');
  const tableStart = lines.findIndex(l => l.includes('| Date'));

  if (tableStart === -1) return [];

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
 * Get past weeks of data
 */
function getPastWeeks(entries, weeks = 4) {
  const weekData = {};

  entries.reverse().forEach(entry => {
    const date = new Date(entry.date + 'T00:00:00');
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weekData[weekKey]) {
      weekData[weekKey] = { calls: 0, convos: 0, meetings: 0, days: 0, entries: [] };
    }
    weekData[weekKey].calls += entry.calls;
    weekData[weekKey].convos += entry.convos;
    weekData[weekKey].meetings += entry.meetings;
    weekData[weekKey].days += 1;
    weekData[weekKey].entries.push(entry);
  });

  return Object.entries(weekData).reverse().slice(0, weeks);
}

/**
 * Generate weekly report
 */
function generateWeeklyReport(entries) {
  if (entries.length === 0) return null;

  const weekData = getPastWeeks(entries, 1)[0];
  if (!weekData) return null;

  const [weekKey, data] = weekData;
  const calls = data.calls;
  const convos = data.convos;
  const meetings = data.meetings;
  const target = 350;
  const onTrack = calls >= target;
  const conversionRate = convos > 0 ? ((meetings / convos) * 100).toFixed(1) : 0;
  const callsPerDay = (calls / data.days).toFixed(1);

  const date = new Date().toISOString().split('T')[0];

  const content = `---
date: "${date}"
type: "weekly"
week_of: "${weekKey}"
calls: ${calls}
convos: ${convos}
meetings: ${meetings}
days_logged: ${data.days}
---

# Weekly Report — Week of ${weekKey}

## 📊 This Week's Stats

| Metric | Result | Target |
|--------|--------|--------|
| **Calls** | ${calls} | 350 (50/day) |
| **Conversations** | ${convos} | — |
| **Meetings Booked** | ${meetings} | — |
| **Avg Calls/Day** | ${callsPerDay} | 50 |
| **Days Logged** | ${data.days} | 7 |
| **Meeting Rate** | ${conversionRate}% | — |

${onTrack ? '🎯 **ON TRACK** — Keep this pace!' : `⚠️ **BEHIND TARGET** — Need ${target - calls} more calls`}

## Daily Breakdown

| Date | Calls | Convos | Meetings | Notes |
|------|-------|--------|----------|-------|
${data.entries.map(e => `| ${e.date} | ${e.calls} | ${e.convos} | ${e.meetings} | ${e.notes.substring(0, 20)} |`).join('\n')}

## 💡 Analysis

- **Best Day:** ${data.entries.reduce((max, e) => e.calls > max.calls ? e : max).date} (${data.entries.reduce((max, e) => e.calls > max.calls ? e : max).calls} calls)
- **Conversation Rate:** ${convos > 0 ? ((convos / calls) * 100).toFixed(1) : 0}% (calls → convos)
- **Close Rate:** ${conversionRate}% (convos → meetings)
- **Consistency:** ${data.days}/7 days logged (${(data.days / 7 * 100).toFixed(0)}%)

## 🔍 Observations

${calls >= target ? '✅ Volume is solid. Focus now on improving conversation quality and close rates.' : '⚠️ Need to increase call volume. Check if you\'re getting distracted during the day.'}

${conversionRate >= 30 ? '✅ Strong conversion rate. Your pitch is working.' : '⚠️ Low conversion rate. Consider refining your opening or value proposition.'}

## 🎯 Next Week Goals

- **Calls:** ${Math.max(350, calls + 50)} (increase by 50 if possible)
- **Conversations:** ${Math.max(convos, Math.round(calls * 0.3))} (improve convo rate to 30%+)
- **Meetings:** ${Math.max(meetings, Math.round(convos * 0.4))} (improve close rate to 40%+)
`;

  const filename = path.join(REPORTS_FOLDER, `(C) Weekly Report - ${weekKey}.md`);
  fs.writeFileSync(filename, content, 'utf8');
  console.log(`✓ Weekly report: ${path.basename(filename)}`);

  return filename;
}

/**
 * Generate monthly review
 */
function generateMonthlyReview(entries) {
  if (entries.length === 0) return null;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthKey = monthStart.toISOString().split('T')[0].substring(0, 7); // YYYY-MM

  const monthEntries = entries.filter(e => e.date.startsWith(monthKey));
  if (monthEntries.length === 0) return null;

  const totalCalls = monthEntries.reduce((sum, e) => sum + e.calls, 0);
  const totalConvos = monthEntries.reduce((sum, e) => sum + e.convos, 0);
  const totalMeetings = monthEntries.reduce((sum, e) => sum + e.meetings, 0);
  const daysLogged = monthEntries.length;
  const callsPerDay = (totalCalls / daysLogged).toFixed(1);
  const conversionRate = totalConvos > 0 ? ((totalMeetings / totalConvos) * 100).toFixed(1) : 0;

  const date = new Date().toISOString().split('T')[0];

  const content = `---
date: "${date}"
type: "monthly"
month: "${monthKey}"
calls: ${totalCalls}
convos: ${totalConvos}
meetings: ${totalMeetings}
---

# Monthly Review — ${monthKey}

## 📈 Monthly Summary

| Metric | This Month |
|--------|-----------|
| **Total Calls** | ${totalCalls} |
| **Conversations** | ${totalConvos} |
| **Meetings Booked** | ${totalMeetings} |
| **Avg Calls/Day** | ${callsPerDay} |
| **Days Worked** | ${daysLogged} |
| **Meeting Rate** | ${conversionRate}% |

## 🎯 Against Targets

- **Call Goal (1,050 for month):** ${totalCalls} / 1,050 — ${totalCalls >= 1050 ? '✅ HIT TARGET' : `⚠️ SHORT BY ${1050 - totalCalls}`}
- **Meeting Goal (150 for month):** ${totalMeetings} / 150 — ${totalMeetings >= 150 ? '✅ HIT TARGET' : `⚠️ SHORT BY ${150 - totalMeetings}`}

## 📊 Week-by-Week

${getPastWeeks(monthEntries, 5).map(([week, data]) => {
  const weekCalls = data.calls;
  const weekConvos = data.convos;
  const weekMeetings = data.meetings;
  return `- **Week of ${week}:** ${weekCalls} calls, ${weekConvos} convos, ${weekMeetings} meetings`;
}).join('\n')}

## 💡 What Worked

- Best performing day: ${monthEntries.reduce((max, e) => e.calls > max.calls ? e : max).date} (${monthEntries.reduce((max, e) => e.calls > max.calls ? e : max).calls} calls)
- Days you hit 50+ calls: ${monthEntries.filter(e => e.calls >= 50).length} out of ${daysLogged}
- Conversation quality: ${conversionRate}% conversion (${totalConvos} convos from ${totalCalls} calls)

## ⚠️ What Needs Improvement

${totalCalls < 1050 ? `- **Volume:** You\'re at ${totalCalls} calls but need 1,050. Add 15-20 more calls/day.` : '✅ Volume is strong.'}

${conversionRate < 25 ? `- **Pitch:** Only ${conversionRate}% of calls turn into conversations. Refine your opening.` : '✅ Pitch is converting well.'}

${totalMeetings < 150 ? `- **Closing:** Getting ${conversionRate}% of convos to meetings. Work on close rate.` : '✅ Close rate is solid.'}

## 📋 Recommendations for Next Month

1. **Increase volume if below target** — consistency matters more than perfection
2. **Refine your pitch** — small changes = big impact on conversion rate
3. **Track what works** — note which industries/scripts get best results
4. **Follow up aggressively** — 80% of deals close on follow-up, not first call
5. **Don't get comfortable** — when sales are good, keep outreaching

## 🎯 Next Month Targets

- **Calls:** ${totalCalls >= 1050 ? totalCalls + 100 : 1050} (increase if you hit target)
- **Conversations:** ${Math.round(totalCalls * 0.35)} (push conversion to 35%+)
- **Meetings:** ${Math.round(totalConvos * 0.45)} (push close rate to 45%+)
- **Revenue:** [Update when deals close]
`;

  const filename = path.join(INSIGHTS_FOLDER, `(C) Monthly Review - ${monthKey}.md`);

  if (!fs.existsSync(INSIGHTS_FOLDER)) {
    fs.mkdirSync(INSIGHTS_FOLDER, { recursive: true });
  }

  fs.writeFileSync(filename, content, 'utf8');
  console.log(`✓ Monthly review: ${path.basename(filename)}`);

  return filename;
}

/**
 * Generate growth analysis
 */
function generateGrowthAnalysis(entries) {
  if (entries.length < 7) return null;

  const weeks = getPastWeeks(entries, 12);
  if (weeks.length < 2) return null;

  const date = new Date().toISOString().split('T')[0];

  let analysis = `---
date: "${date}"
type: "growth"
---

# Growth & Trends Analysis

## 📈 Last 12 Weeks

| Week | Calls | Convos | Meetings | Trend |
|------|-------|--------|----------|-------|
`;

  weeks.forEach(([week, data], i) => {
    const trend = i > 0 ? (data.calls >= weeks[i-1][1].calls ? '📈' : '📉') : '—';
    analysis += `| ${week} | ${data.calls} | ${data.convos} | ${data.meetings} | ${trend} |\n`;
  });

  const latestWeek = weeks[weeks.length - 1][1];
  const prevWeek = weeks.length > 1 ? weeks[weeks.length - 2][1] : null;

  const callsChange = prevWeek ? latestWeek.calls - prevWeek.calls : 0;
  const convosChange = prevWeek ? latestWeek.convos - prevWeek.convos : 0;

  analysis += `

## 🎯 Latest Week Trend

- **Calls:** ${latestWeek.calls} (${callsChange > 0 ? '+' : ''}${callsChange} vs prev week)
- **Conversations:** ${latestWeek.convos} (${convosChange > 0 ? '+' : ''}${convosChange} vs prev week)
- **Direction:** ${callsChange > 0 ? '📈 IMPROVING' : callsChange < 0 ? '📉 DECLINING' : '➡️ FLAT'}

## 🔍 Key Insights

${callsChange > 0 ? '✅ Call volume is increasing.' : '⚠️ Call volume is declining. Get back to 50+ daily.'}

${latestWeek.meetings > 0 ? `✅ You're booking meetings — focus on closing them.` : '⚠️ No meetings booked recently — revisit your close strategy.'}

${latestWeek.convos / latestWeek.calls > 0.3 ? '✅ Conversation rate is strong.' : '⚠️ Low conversation rate — people aren\'t interested yet.'}
`;

  const filename = path.join(INSIGHTS_FOLDER, `(C) Growth Analysis - ${date}.md`);

  if (!fs.existsSync(INSIGHTS_FOLDER)) {
    fs.mkdirSync(INSIGHTS_FOLDER, { recursive: true });
  }

  fs.writeFileSync(filename, content, 'utf8');
  console.log(`✓ Growth analysis: ${path.basename(filename)}`);

  return filename;
}

/**
 * Main
 */
function main() {
  console.log('[Reports Generator] Starting...\n');

  try {
    if (!fs.existsSync(REPORTS_FOLDER)) {
      fs.mkdirSync(REPORTS_FOLDER, { recursive: true });
    }

    const entries = parseOutreachLog();

    if (entries.length === 0) {
      console.log('⚠️  No outreach log data found\n');
      return;
    }

    console.log(`Found ${entries.length} days of data\n`);

    // Generate reports
    generateWeeklyReport(entries);
    generateMonthlyReview(entries);
    generateGrowthAnalysis(entries);

    console.log(`\n✅ [Reports] Generated\n`);

  } catch (err) {
    console.error('[Reports Generator] Error:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { parseOutreachLog, getPastWeeks };
