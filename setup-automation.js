#!/usr/bin/env node

/**
 * Automated Setup Script
 * Checks all prerequisites, installs dependencies, validates config
 * Creates necessary folders and files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SYSTEM_FOLDER = __dirname;
const VAULT_ROOT = 'C:/Users/lucky/Desktop/Luckys AI Brain';

console.log('\n🚀 LS GROWTH AUTOMATION — SETUP WIZARD\n');

// Check Node.js
console.log('1️⃣  Checking Node.js...');
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  console.log(`   ✓ Node.js ${nodeVersion}\n`);
} catch {
  console.error('   ✗ Node.js not found. Install from https://nodejs.org\n');
  process.exit(1);
}

// Check google-credentials.json
console.log('2️⃣  Checking Google Sheets credentials...');
const credsPath = path.join(SYSTEM_FOLDER, 'google-credentials.json');
if (fs.existsSync(credsPath)) {
  console.log('   ✓ google-credentials.json found\n');
} else {
  console.log('   ⚠️  google-credentials.json NOT found');
  console.log('   → Add it to: 04 System/google-credentials.json\n');
}

// Check .env
console.log('3️⃣  Checking .env configuration...');
const envPath = path.join(SYSTEM_FOLDER, '.env');
if (fs.existsSync(envPath)) {
  console.log('   ✓ .env file exists\n');
} else {
  console.log('   ℹ️  Creating .env template...');
  const envTemplate = `LS_GROWTH_API_KEY=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
GOOGLE_CREDENTIALS_PATH=./google-credentials.json
VAULT_ROOT=C:/Users/lucky/Desktop/Luckys AI Brain
`;
  fs.writeFileSync(envPath, envTemplate, 'utf8');
  console.log('   ✓ .env created (update if needed)\n');
}

// Check folders
console.log('4️⃣  Creating required folders...');
const folders = [
  path.join(VAULT_ROOT, '03 Projects/The Comeback/00 Outreach/reports'),
  path.join(VAULT_ROOT, '03 Projects/The Comeback/01 Pipeline'),
  path.join(VAULT_ROOT, '03 Projects/The Comeback/04 System/email-drafts'),
  path.join(VAULT_ROOT, '03 Projects/The Comeback/07 Iteration Logs'),
];

folders.forEach(folder => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
    console.log(`   ✓ Created: ${path.basename(folder)}`);
  }
});
console.log('');

// Install dependencies
console.log('5️⃣  Installing npm dependencies...');
try {
  const packagePath = path.join(SYSTEM_FOLDER, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  if (!pkg.dependencies['node-cron']) {
    console.log('   → Installing node-cron...');
    execSync('npm install node-cron', { cwd: SYSTEM_FOLDER, stdio: 'inherit' });
  }
  console.log('   ✓ Dependencies ready\n');
} catch (err) {
  console.log('   ✗ npm install failed. Run manually: npm install node-cron\n');
}

// Validate scripts
console.log('6️⃣  Validating scripts...');
const scripts = [
  'sheets-monitor-and-email.js',
  'sheets-monitor-daemon.js',
  'track-daily-metrics.js',
  'pipeline-sync.js',
  'generate-reports.js',
  'run-all-automations.js'
];

scripts.forEach(script => {
  const scriptPath = path.join(SYSTEM_FOLDER, script);
  if (fs.existsSync(scriptPath)) {
    console.log(`   ✓ ${script}`);
  } else {
    console.log(`   ✗ ${script} NOT FOUND`);
  }
});
console.log('');

// Summary
console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║                    ✅ SETUP COMPLETE                          ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

console.log('📋 Next Steps:\n');
console.log('1. Add google-credentials.json to 04 System/ folder');
console.log('2. Review/update .env file if needed');
console.log('3. Run: node sheets-monitor-daemon.js\n');

console.log('📚 Documentation:\n');
console.log('- Setup Guide: (C) AUTOMATION SETUP GUIDE.md');
console.log('- What Was Built: (C) WHAT WAS BUILT.md');
console.log('- Final Checklist: (C) FINAL CHECKLIST.md\n');
