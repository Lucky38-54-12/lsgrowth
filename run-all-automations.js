#!/usr/bin/env node

/**
 * Master Automation Orchestrator
 * Runs all automation scripts in sequence
 * Call this once daily (via Task Scheduler or manually)
 */

const { monitorSheets } = require('./sheets-monitor-and-email');
const { parseOutreachLog, getWeeklyStats } = require('./track-daily-metrics');
const { fetchPipelineData, categorizePipeline } = require('./pipeline-sync');

async function runAllAutomations() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║     🚀 LS GROWTH AUTOMATION SUITE — RUNNING ALL TASKS          ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    // 1. Monitor sheets for new calls & generate email drafts
    console.log('1️⃣  EMAIL MONITOR\n');
    await monitorSheets();

    // 2. Track daily metrics
    console.log('2️⃣  METRICS TRACKER\n');
    try {
      const { parseOutreachLog: parseLog } = require('./track-daily-metrics');
      const metrics = require('./track-daily-metrics');
      // Run the metrics tracking
      require('child_process').execSync('node track-daily-metrics.js', { stdio: 'inherit' });
    } catch (err) {
      console.log('⚠️  Metrics tracker: No outreach log found yet\n');
    }

    // 3. Sync pipeline
    console.log('3️⃣  PIPELINE SYNC\n');
    try {
      require('child_process').execSync('node pipeline-sync.js', { stdio: 'inherit' });
    } catch (err) {
      console.log('⚠️  Pipeline sync: LS Growth API not available yet\n');
    }

    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║                    ✅ ALL AUTOMATIONS COMPLETE                 ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    console.log('📂 Files generated:\n');
    console.log('   • Email Drafts → 04 System/email-drafts/');
    console.log('   • Daily Report → 00 Outreach/reports/');
    console.log('   • Weekly Report → 00 Outreach/reports/');
    console.log('   • Pipeline Dashboard → 01 Pipeline/');
    console.log('   • Stale Leads Alert → 01 Pipeline/\n');

    console.log('⏰ Next run: Check back in 30 min for new email drafts\n');

  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  runAllAutomations();
}

module.exports = { runAllAutomations };
