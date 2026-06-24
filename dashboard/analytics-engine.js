#!/usr/bin/env node

/**
 * Advanced Analytics Engine
 * Analyzes call data, conversion trends, and provides recommendations
 * Identifies patterns and optimization opportunities
 */

const fs = require('fs');
const path = require('path');

const VAULT_ROOT = process.env.VAULT_ROOT || 'C:/Users/lucky/Desktop/Luckys AI Brain';
const OUTREACH_LOG = path.join(VAULT_ROOT, '03 Projects/The Comeback/00 Outreach/(C) Daily Outreach Log.md');
const ANALYTICS_FOLDER = path.join(VAULT_ROOT, '03 Projects/The Comeback/07 Iteration Logs');

/**
 * Parse outreach log
 */
function parseOutreachLog() {
  if (!fs.existsSync(OUTREACH_LOG)) return [];

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
 * Analyze patterns
 */
function analyzePatterns(entries) {
  if (entries.length === 0) return null;

  const weekDayStats = {
    Monday: { calls: 0, convos: 0, meetings: 0, count: 0 },
    Tuesday: { calls: 0, convos: 0, meetings: 0, count: 0 },
    Wednesday: { calls: 0, convos: 0, meetings: 0, count: 0 },
    Thursday: { calls: 0, convos: 0, meetings: 0, count: 0 },
    Friday: { calls: 0, convos: 0, meetings: 0, count: 0 },
    Saturday: { calls: 0, convos: 0, meetings: 0, count: 0 },
    Sunday: { calls: 0, convos: 0, meetings: 0, count: 0 },
  };

  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  entries.forEach(entry => {
    const date = new Date(entry.date + 'T00:00:00');
    const dayName = weekDays[date.getDay()];

    weekDayStats[dayName].calls += entry.calls;
    weekDayStats[dayName].convos += entry.convos;
    weekDayStats[dayName].meetings += entry.meetings;
    weekDayStats[dayName].count += 1;
  });

  // Calculate averages
  Object.keys(weekDayStats).forEach(day => {
    const stats = weekDayStats[day];
    if (stats.count > 0) {
      stats.avgCalls = (stats.calls / stats.count).toFixed(1);
      stats.avgConvos = (stats.convos / stats.count).toFixed(1);
      stats.avgMeetings = (stats.meetings / stats.count).toFixed(1);
      stats.conversionRate = stats.convos > 0 ? ((stats.meetings / stats.convos) * 100).toFixed(1) : 0;
    }
  });

  return weekDayStats;
}

/**
 * Find best/worst days
 */
function findBestWorstDays(entries) {
  if (entries.length < 2) return null;

  const sorted = [...entries].sort((a, b) => b.calls - a.calls);

  return {
    bestDay: {
      date: sorted[0].date,
      calls: sorted[0].calls,
      convos: sorted[0].convos,
      meetings: sorted[0].meetings
    },
    worstDay: {
      date: sorted[sorted.length - 1].date,
      calls: sorted[sorted.length - 1].calls,
      convos: sorted[sorted.length - 1].convos,
      meetings: sorted[sorted.length - 1].meetings
    }
  };
}

/**
 * Predict next month
 */
function predictNextMonth(entries) {
  if (entries.length < 7) return null;

  // Get last week average
  const lastWeek = entries.slice(-7);
  const avgCallsPerDay = lastWeek.reduce((sum, e) => sum + e.calls, 0) / 7;
  const avgConvosPerDay = lastWeek.reduce((sum, e) => sum + e.convos, 0) / 7;
  const avgMeetingsPerDay = lastWeek.reduce((sum, e) => sum + e.meetings, 0) / 7;

  // Project to month (30 days)
  return {
    predictedCalls: Math.round(avgCallsPerDay * 30),
    predictedConvos: Math.round(avgConvosPerDay * 30),
    predictedMeetings: Math.round(avgMeetingsPerDay * 30),
    basedOn: 'Last 7 days average'
  };
}

/**
 * Identify trends
 */
function identifyTrends(entries) {
  if (entries.length < 14) return null;

  const week1 = entries.slice(-14, -7);
  const week2 = entries.slice(-7);

  const week1Calls = week1.reduce((sum, e) => sum + e.calls, 0);
  const week2Calls = week2.reduce((sum, e) => sum + e.calls, 0);

  const callTrend = week2Calls - week1Calls;
  const callTrendPercent = ((callTrend / week1Calls) * 100).toFixed(1);

  return {
    callsTrend: callTrend > 0 ? '📈 INCREASING' : callTrend < 0 ? '📉 DECLINING' : '➡️ FLAT',
    callsTrendValue: callTrend,
    callsTrendPercent: callTrendPercent,
    recommendation: callTrend > 0 ? 'Keep momentum!' : 'Time to increase volume.'
  };
}

/**
 * Generate analytics report
 */
function generateAnalyticsReport(entries) {
  if (entries.length === 0) {
    console.log('No data to analyze yet.');
    return null;
  }

  const date = new Date().toISOString().split('T')[0];
  const patterns = analyzePatterns(entries);
  const bestWorst = findBestWorstDays(entries);
  const prediction = predictNextMonth(entries);
  const trends = identifyTrends(entries);

  let report = `---
date: "${date}"
type: "analytics"
data_points: ${entries.length}
---

# Advanced Analytics Report

**Generated:** ${date}
**Data Points:** ${entries.length} days

---

## 📈 Performance Trends

${trends ? `
**Call Volume Trend:** ${trends.callsTrend}
- Change: ${trends.callsTrendValue > 0 ? '+' : ''}${trends.callsTrendValue} calls (${trends.callsTrendPercent}%)
- Recommendation: ${trends.recommendation}
` : '(Not enough data)'}

---

## 📅 Best vs Worst Days

${bestWorst ? `
**Best Day:** ${bestWorst.bestDay.date}
- Calls: ${bestWorst.bestDay.calls}
- Conversations: ${bestWorst.bestDay.convos}
- Meetings: ${bestWorst.bestDay.meetings}

**Worst Day:** ${bestWorst.worstDay.date}
- Calls: ${bestWorst.worstDay.calls}
- Conversations: ${bestWorst.worstDay.convos}
- Meetings: ${bestWorst.worstDay.meetings}

**Difference:** ${bestWorst.bestDay.calls - bestWorst.worstDay.calls} calls
` : '(Not enough data)'}

---

## 📊 Day-of-Week Analysis

| Day | Avg Calls | Avg Convos | Avg Meetings | Conv. Rate |
|-----|-----------|-----------|-------------|-----------|
${Object.entries(patterns).map(([day, stats]) => {
  return `| ${day} | ${stats.avgCalls} | ${stats.avgConvos} | ${stats.avgMeetings} | ${stats.conversionRate}% |`;
}).join('\n')}

### Best Day of Week
${(() => {
  let best = { day: '', calls: 0 };
  Object.entries(patterns).forEach(([day, stats]) => {
    if (stats.calls > best.calls) {
      best = { day, calls: stats.calls };
    }
  });
  return `**${best.day}** (${best.calls} total calls)`;
})()}

### Slowest Day of Week
${(() => {
  let worst = { day: '', calls: Infinity };
  Object.entries(patterns).forEach(([day, stats]) => {
    if (stats.calls < worst.calls && stats.calls > 0) {
      worst = { day, calls: stats.calls };
    }
  });
  return worst.calls === Infinity ? '(No data)' : `**${worst.day}** (${worst.calls} total calls)`;
})()}

---

## 🔮 Next Month Projection

${prediction ? `
Based on last 7 days average:

- **Projected Calls:** ${prediction.predictedCalls} (vs 1,050 target)
- **Projected Conversations:** ${prediction.predictedConvos}
- **Projected Meetings:** ${prediction.predictedMeetings} (vs 150 target)

${prediction.predictedCalls >= 1050 ? '✅ On track to hit call goal' : `⚠️ Need ${1050 - prediction.predictedCalls} more calls to hit target`}

${prediction.predictedMeetings >= 150 ? '✅ On track to hit meeting goal' : `⚠️ Need ${150 - prediction.predictedMeetings} more meetings to hit target`}
` : '(Not enough data)'}

---

## 💡 Key Insights

${(() => {
  const insights = [];

  if (bestWorst && bestWorst.bestDay.calls > bestWorst.worstDay.calls * 1.5) {
    insights.push('✅ Large variance between best and worst days — consistency is opportunity');
  }

  if (trends && trends.callsTrendPercent > 10) {
    insights.push('✅ Call volume increasing — momentum is strong');
  } else if (trends && trends.callsTrendPercent < -10) {
    insights.push('⚠️ Call volume declining — need to refocus on volume');
  }

  if (patterns) {
    const bestDay = Object.entries(patterns).reduce((max, [day, stats]) => stats.calls > max[1].calls ? [day, stats] : max);
    if (bestDay) {
      insights.push(`📌 ${bestDay[0]}s are your strongest days — block extra time for calls`);
    }
  }

  if (prediction && prediction.predictedCalls < 1050) {
    const gap = 1050 - prediction.predictedCalls;
    insights.push(`⚠️ Current pace will fall short by ~${gap} calls — increase daily target to 55+`);
  }

  return insights.length > 0 ? insights.map(i => `- ${i}`).join('\n') : 'Keep tracking for patterns to emerge';
})()}

---

## 🎯 Optimization Recommendations

1. **Focus on best days** — Identify what's different on your high-performing days and replicate
2. **Boost weak days** — Allocate extra time on typically slow days
3. **Consistency matters** — Aim for 50+ calls 7 days/week, not 70 some days and 20 others
4. **Track outcomes** — Note which industries/scripts convert best
5. **Follow-up ruthlessly** — 80% of deals come from follow-up, not first contact

---

Generated by Analytics Engine
`;

  return report;
}

/**
 * Main
 */
function main() {
  console.log('[Analytics Engine] Running...\n');

  try {
    if (!fs.existsSync(ANALYTICS_FOLDER)) {
      fs.mkdirSync(ANALYTICS_FOLDER, { recursive: true });
    }

    const entries = parseOutreachLog();
    const report = generateAnalyticsReport(entries);

    if (!report) return;

    const date = new Date().toISOString().split('T')[0];
    const filename = path.join(ANALYTICS_FOLDER, `(C) Analytics Report - ${date}.md`);
    fs.writeFileSync(filename, report, 'utf8');

    console.log(`✅ [Analytics] Report generated\n`);
    console.log(`📊 ${filename}\n`);

  } catch (err) {
    console.error('[Analytics Engine] Error:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { parseOutreachLog, analyzePatterns, identifyTrends };
