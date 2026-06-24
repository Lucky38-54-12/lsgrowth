#!/usr/bin/env node

/**
 * Email Monitor Daemon
 * Runs continuously, checks sheets every 30 minutes
 * Auto-generates email drafts when new calls are logged
 */

const cron = require('node-cron');
const { monitorSheets } = require('./sheets-monitor-and-email');

console.log('🚀 LS Growth Email Monitor — DAEMON STARTED\n');
console.log('⏱️  Running every 30 minutes\n');
console.log('Press Ctrl+C to stop\n');

// Run immediately on start
console.log('→ Running initial check...\n');
monitorSheets().catch(err => console.error('Error:', err.message));

// Run every 30 minutes (0, 30)
cron.schedule('*/30 * * * *', () => {
  console.log('\n→ Running scheduled check...\n');
  monitorSheets().catch(err => console.error('Error:', err.message));
});

// Keep process alive
process.on('SIGINT', () => {
  console.log('\n\n✋ Daemon stopped');
  process.exit(0);
});
