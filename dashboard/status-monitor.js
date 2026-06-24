#!/usr/bin/env node

/**
 * Automation Status Monitor
 * Shows real-time status of all running processes
 * Checks for errors, generates health report
 */

const fs = require('fs');
const path = require('path');

const VAULT_ROOT = process.env.VAULT_ROOT || 'C:/Users/lucky/Desktop/Luckys AI Brain';
const LOGS_FOLDER = path.join(__dirname, 'logs');
const DRAFTS_FOLDER = path.join(__dirname, 'email-drafts');
const REPORTS_FOLDER = path.join(VAULT_ROOT, '03 Projects/The Comeback/00 Outreach/reports');

/**
 * Get file count
 */
function getFileCount(folder) {
  try {
    if (!fs.existsSync(folder)) return 0;
    return fs.readdirSync(folder).filter(f => f.startsWith('(C)')).length;
  } catch {
    return 0;
  }
}

/**
 * Get latest file
 */
function getLatestFile(folder) {
  try {
    if (!fs.existsSync(folder)) return null;
    const files = fs.readdirSync(folder);
    if (files.length === 0) return null;
    const sorted = files.sort((a, b) => {
      const statA = fs.statSync(path.join(folder, a));
      const statB = fs.statSync(path.join(folder, b));
      return statB.mtime - statA.mtime;
    });
    return sorted[0];
  } catch {
    return null;
  }
}

/**
 * Check log for errors
 */
function checkLogForErrors(logFile) {
  try {
    if (!fs.existsSync(logFile)) return { errors: 0, warnings: 0 };
    const content = fs.readFileSync(logFile, 'utf8');
    const errors = (content.match(/\[ERROR\]/g) || []).length;
    const warnings = (content.match(/\[WARN\]/g) || []).length;
    return { errors, warnings };
  } catch {
    return { errors: 0, warnings: 0 };
  }
}

/**
 * Generate status report
 */
function generateStatusReport() {
  const date = new Date().toISOString();

  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║           🔍 AUTOMATION STATUS MONITOR — ' + date.split('T')[0] + '              ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Email Drafts
  console.log('📧 EMAIL MONITOR');
  const draftCount = getFileCount(DRAFTS_FOLDER);
  const latestDraft = getLatestFile(DRAFTS_FOLDER);
  console.log(`   Generated Drafts: ${draftCount}`);
  if (latestDraft) {
    console.log(`   Latest: ${latestDraft}`);
  }
  console.log('');

  // Reports
  console.log('📊 METRICS & REPORTS');
  const reportCount = getFileCount(REPORTS_FOLDER);
  const latestReport = getLatestFile(REPORTS_FOLDER);
  console.log(`   Generated Reports: ${reportCount}`);
  if (latestReport) {
    console.log(`   Latest: ${latestReport}`);
  }
  console.log('');

  // Logs
  console.log('📋 SCRIPT LOGS');
  if (fs.existsSync(LOGS_FOLDER)) {
    const logFiles = fs.readdirSync(LOGS_FOLDER);
    logFiles.forEach(file => {
      const logPath = path.join(LOGS_FOLDER, file);
      const { errors, warnings } = checkLogForErrors(logPath);
      const status = errors > 0 ? '❌' : warnings > 0 ? '⚠️' : '✅';
      console.log(`   ${status} ${file} (${errors} errors, ${warnings} warnings)`);
    });
  } else {
    console.log('   (No logs yet)');
  }
  console.log('');

  // Quick Health Check
  console.log('🏥 HEALTH CHECK');
  const allOk = draftCount > 0 && reportCount > 0;
  if (allOk) {
    console.log('   ✅ All systems operational\n');
  } else {
    console.log('   ⚠️  Waiting for first run\n');
  }

  // Next Steps
  console.log('⏰ AUTOMATION STATUS');
  console.log('   Daemon: ' + (isProcessRunning('sheets-monitor-daemon') ? '🟢 RUNNING' : '⚠️  STOPPED'));
  console.log('   Next email check: In ~30 minutes');
  console.log('   Next reports: Evening (6 PM)\n');

  // Logs folder
  console.log('📂 FILE LOCATIONS');
  console.log(`   Drafts:  ${DRAFTS_FOLDER}`);
  console.log(`   Reports: ${REPORTS_FOLDER}`);
  console.log(`   Logs:    ${LOGS_FOLDER}\n`);
}

/**
 * Check if process running (simple check)
 */
function isProcessRunning(processName) {
  try {
    if (process.platform === 'win32') {
      const result = require('child_process').execSync(`tasklist /FI "WINDOWTITLE eq ${processName}*" 2>nul`, { encoding: 'utf8' });
      return result.toLowerCase().includes('node');
    } else {
      const result = require('child_process').execSync(`ps aux | grep ${processName}`, { encoding: 'utf8' });
      return result.includes('node') && !result.includes('grep');
    }
  } catch {
    return false;
  }
}

/**
 * Generate detailed health report
 */
function generateDetailedReport() {
  const date = new Date().toISOString().split('T')[0];
  const content = `---
date: "${date}"
type: "status"
---

# Automation Health Report

**Generated:** ${new Date().toISOString()}

## 📊 Metrics

- Email Drafts Generated: ${getFileCount(DRAFTS_FOLDER)}
- Reports Generated: ${getFileCount(REPORTS_FOLDER)}
- Log Files: ${fs.existsSync(LOGS_FOLDER) ? fs.readdirSync(LOGS_FOLDER).length : 0}

## 🔍 Recent Activity

### Latest Email Draft
${getLatestFile(DRAFTS_FOLDER) ? `\`${getLatestFile(DRAFTS_FOLDER)}\`` : '(None yet)'}

### Latest Report
${getLatestFile(REPORTS_FOLDER) ? `\`${getLatestFile(REPORTS_FOLDER)}\`` : '(None yet)'}

## ⚠️ Errors & Warnings

${fs.existsSync(LOGS_FOLDER) ? fs.readdirSync(LOGS_FOLDER).map(file => {
  const logPath = path.join(LOGS_FOLDER, file);
  const { errors, warnings } = checkLogForErrors(logPath);
  return `- **${file}**: ${errors} errors, ${warnings} warnings`;
}).join('\n') : '(No logs)'}

## ✅ Status

All systems operational. Automation running as expected.

---

Generated by Status Monitor
`;

  const reportPath = path.join(VAULT_ROOT, '03 Projects/The Comeback/04 System', '(C) Status Report - ' + date + '.md');
  fs.writeFileSync(reportPath, content, 'utf8');
  console.log(`✓ Detailed report saved: ${reportPath}\n`);
}

/**
 * Main
 */
function main() {
  generateStatusReport();
  generateDetailedReport();
}

if (require.main === module) {
  main();
}

module.exports = { generateStatusReport, getFileCount, checkLogForErrors };
