#!/usr/bin/env node

/**
 * Full Automation Suite — Master Runner
 * Orchestrates all automation scripts in proper order
 * Handles errors, logging, and notifications
 * Run this once daily via Task Scheduler or manually
 */

const { execSync } = require('child_process');
const path = require('path');
const Logger = require('./logger');

const logger = new Logger('full-automation');

const SYSTEM_FOLDER = __dirname;

/**
 * Run a script and log results
 */
function runScript(scriptName, description) {
  logger.info(`Starting: ${description}`);
  console.log(`\n▶️  ${description}...`);

  try {
    execSync(`node "${path.join(SYSTEM_FOLDER, scriptName)}"`, {
      cwd: SYSTEM_FOLDER,
      stdio: 'inherit'
    });
    logger.success(`${scriptName} completed`);
    return true;
  } catch (err) {
    logger.error(`${scriptName} failed: ${err.message}`);
    console.error(`\n❌ ${description} failed\n`);
    return false;
  }
}

/**
 * Main automation runner
 */
async function runFullAutomation() {
  const startTime = new Date();

  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║   🚀 LS GROWTH FULL AUTOMATION SUITE — STARTING                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  logger.info('='.repeat(60));
  logger.info('FULL AUTOMATION SUITE STARTED');
  logger.info('='.repeat(60));

  const results = {};

  // 1. Email Monitor
  console.log('\n📧 PHASE 1: EMAIL MONITOR');
  results.emailMonitor = runScript(
    'sheets-monitor-and-email.js',
    'Monitoring Google Sheets for new calls'
  );

  // 2. Metrics Tracker
  console.log('\n📊 PHASE 2: METRICS TRACKER');
  results.metricsTracker = runScript(
    'track-daily-metrics.js',
    'Generating daily/weekly metrics reports'
  );

  // 3. Pipeline Sync
  console.log('\n📋 PHASE 3: PIPELINE SYNC');
  results.pipelineSync = runScript(
    'pipeline-sync.js',
    'Syncing with LS Growth pipeline'
  );

  // 4. Reports Generator
  console.log('\n📈 PHASE 4: REPORTS & INSIGHTS');
  results.reportsGenerator = runScript(
    'generate-reports.js',
    'Generating weekly/monthly reports'
  );

  // 5. Analytics Engine
  console.log('\n🔍 PHASE 5: ADVANCED ANALYTICS');
  results.analyticsEngine = runScript(
    'analytics-engine.js',
    'Running advanced analytics and pattern analysis'
  );

  // 6. Status Monitor
  console.log('\n🏥 PHASE 6: STATUS MONITORING');
  results.statusMonitor = runScript(
    'status-monitor.js',
    'Generating health and status report'
  );

  // Summary
  const endTime = new Date();
  const duration = ((endTime - startTime) / 1000).toFixed(1);

  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                    ✅ AUTOMATION COMPLETE                      ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Print summary
  const successful = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;

  console.log(`📊 SUMMARY: ${successful}/${total} phases completed in ${duration}s\n`);

  console.log('✅ Completed:');
  Object.entries(results).forEach(([phase, success]) => {
    if (success) console.log(`   ✓ ${phase}`);
  });

  console.log('\n⚠️  Failed:');
  const failed = Object.entries(results).filter(([, success]) => !success);
  if (failed.length === 0) {
    console.log('   (None — all systems operational!)');
  } else {
    failed.forEach(([phase]) => {
      console.log(`   ✗ ${phase}`);
    });
  }

  console.log('\n📂 Output Folders:');
  console.log('   • Email Drafts: 04 System/email-drafts/');
  console.log('   • Reports: 00 Outreach/reports/');
  console.log('   • Analytics: 07 Iteration Logs/');
  console.log('   • Logs: 04 System/logs/\n');

  logger.success(`FULL AUTOMATION SUITE COMPLETED: ${successful}/${total} phases`);
  logger.info(`Duration: ${duration} seconds`);

  // Exit with success/failure code
  process.exit(successful === total ? 0 : 1);
}

// Run
if (require.main === module) {
  runFullAutomation().catch(err => {
    logger.error(`Fatal error: ${err.message}`);
    console.error('\n❌ FATAL ERROR:', err.message);
    process.exit(1);
  });
}

module.exports = { runFullAutomation };
