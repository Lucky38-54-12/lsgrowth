#!/usr/bin/env node

/**
 * Email Tracking System
 * Tracks opens, clicks, bounces for all outgoing emails
 * Generates tracking reports by recipient
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const VAULT_ROOT = process.env.VAULT_ROOT || 'C:/Users/lucky/Desktop/Luckys AI Brain';
const TRACKING_DB = path.join(__dirname, 'email-tracking.json');
const TRACKING_FOLDER = path.join(VAULT_ROOT, '03 Projects/The Comeback/04 System/email-tracking');

/**
 * Load or initialize tracking database
 */
function loadTrackingDB() {
  if (fs.existsSync(TRACKING_DB)) {
    try {
      return JSON.parse(fs.readFileSync(TRACKING_DB, 'utf8'));
    } catch {
      return { emails: {}, events: [] };
    }
  }
  return { emails: {}, events: [] };
}

/**
 * Save tracking database
 */
function saveTrackingDB(db) {
  fs.writeFileSync(TRACKING_DB, JSON.stringify(db, null, 2), 'utf8');
}

/**
 * Generate tracking ID for email
 */
function generateTrackingId(email, businessName) {
  const data = `${email}-${businessName}-${Date.now()}`;
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
}

/**
 * Register email for tracking
 */
function registerEmailForTracking(emailData) {
  const db = loadTrackingDB();
  const trackingId = generateTrackingId(emailData.to, emailData.business_name);

  const emailRecord = {
    id: trackingId,
    to: emailData.to,
    business_name: emailData.business_name,
    subject: emailData.subject,
    sent_at: new Date().toISOString(),
    status: 'sent',
    opens: 0,
    clicks: 0,
    bounced: false,
    events: []
  };

  db.emails[trackingId] = emailRecord;
  saveTrackingDB(db);

  return trackingId;
}

/**
 * Add tracking pixel to email HTML
 */
function addTrackingPixel(htmlContent, trackingId) {
  const pixelUrl = `https://app.lsgrowth.agency/api/track/open/${trackingId}`;
  const pixel = `<img src="${pixelUrl}" width="1" height="1" alt="" style="display:none;" />`;

  // Add before closing body tag
  return htmlContent.replace('</body>', `${pixel}</body>`);
}

/**
 * Add click tracking to links
 */
function addClickTracking(htmlContent, trackingId) {
  const linkRegex = /href="([^"]+)"/g;
  return htmlContent.replace(linkRegex, (match, url) => {
    const trackUrl = `https://app.lsgrowth.agency/api/track/click/${trackingId}?url=${encodeURIComponent(url)}`;
    return `href="${trackUrl}"`;
  });
}

/**
 * Record tracking event (open, click, bounce)
 */
function recordEvent(trackingId, eventType, data = {}) {
  const db = loadTrackingDB();

  if (!db.emails[trackingId]) {
    console.warn(`Tracking ID not found: ${trackingId}`);
    return;
  }

  const email = db.emails[trackingId];
  const event = {
    type: eventType,
    timestamp: new Date().toISOString(),
    data: data,
    user_agent: data.user_agent || 'unknown',
    ip: data.ip || 'unknown'
  };

  email.events.push(event);

  // Update counters
  if (eventType === 'open') {
    email.opens++;
  } else if (eventType === 'click') {
    email.clicks++;
  } else if (eventType === 'bounce') {
    email.bounced = true;
    email.status = 'bounced';
  }

  // Track globally
  db.events.push({
    tracking_id: trackingId,
    ...event
  });

  saveTrackingDB(db);
  console.log(`✓ Tracked ${eventType} for ${email.business_name} (${trackingId})`);
}

/**
 * Generate tracking report for email
 */
function generateEmailReport(trackingId) {
  const db = loadTrackingDB();
  const email = db.emails[trackingId];

  if (!email) return null;

  const openRate = email.opens > 0 ? 'Yes' : 'No';
  const clickRate = email.clicks > 0 ? 'Yes' : 'No';

  return {
    business: email.business_name,
    email: email.to,
    subject: email.subject,
    sent: email.sent_at,
    status: email.status,
    opens: email.opens,
    clicks: email.clicks,
    opened: openRate,
    clicked: clickRate,
    bounced: email.bounced ? 'Yes' : 'No',
    events: email.events
  };
}

/**
 * Generate tracking dashboard markdown
 */
function generateTrackingDashboard() {
  const db = loadTrackingDB();
  const emails = Object.values(db.emails);

  if (emails.length === 0) {
    return '# Email Tracking Dashboard\n\nNo emails tracked yet.';
  }

  // Sort by sent date descending
  emails.sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));

  // Calculate stats
  const totalSent = emails.length;
  const totalOpened = emails.filter(e => e.opens > 0).length;
  const totalClicked = emails.filter(e => e.clicks > 0).length;
  const totalBounced = emails.filter(e => e.bounced).length;
  const openRate = ((totalOpened / totalSent) * 100).toFixed(1);
  const clickRate = ((totalClicked / totalSent) * 100).toFixed(1);

  let report = `# Email Tracking Dashboard

## 📊 Overall Stats
- **Total Sent:** ${totalSent}
- **Opened:** ${totalOpened} (${openRate}%)
- **Clicked:** ${totalClicked} (${clickRate}%)
- **Bounced:** ${totalBounced}

## 📧 Email History

| Business | Email | Subject | Sent | Opens | Clicks | Status |
|----------|-------|---------|------|-------|--------|--------|
`;

  emails.forEach(email => {
    const sentDate = new Date(email.sent_at).toLocaleDateString();
    const status = email.bounced ? '❌ Bounced' : email.opens > 0 ? '✅ Opened' : '📨 Sent';
    report += `| ${email.business_name} | ${email.to} | ${email.subject.substring(0, 30)}... | ${sentDate} | ${email.opens} | ${email.clicks} | ${status} |\n`;
  });

  report += `\n## 🔥 Hot Leads (Opened + Clicked)
\n${emails.filter(e => e.opens > 0 && e.clicks > 0).map(e => `- **${e.business_name}**: ${e.opens} opens, ${e.clicks} clicks`).join('\n') || '(None yet)'}`;

  report += `\n\n## 👁️ Opened But Not Clicked
\n${emails.filter(e => e.opens > 0 && e.clicks === 0).map(e => `- ${e.business_name}: ${e.opens} opens`).join('\n') || '(None yet)'}`;

  report += `\n\n## 📬 Not Yet Opened
\n${emails.filter(e => e.opens === 0 && !e.bounced).map(e => `- ${e.business_name}`).join('\n') || '(All opened!)'}`;

  return report;
}

/**
 * Export tracking data
 */
function exportTrackingReport() {
  if (!fs.existsSync(TRACKING_FOLDER)) {
    fs.mkdirSync(TRACKING_FOLDER, { recursive: true });
  }

  const report = generateTrackingDashboard();
  const date = new Date().toISOString().split('T')[0];
  const filename = path.join(TRACKING_FOLDER, `(C) Email Tracking Report - ${date}.md`);

  fs.writeFileSync(filename, report, 'utf8');
  console.log(`✓ Report saved: ${filename}`);

  return filename;
}

/**
 * Get tracking data by business
 */
function getBusinessTrackingData(businessName) {
  const db = loadTrackingDB();
  const emails = Object.values(db.emails).filter(e => e.business_name === businessName);

  if (emails.length === 0) return null;

  const totalOpens = emails.reduce((sum, e) => sum + e.opens, 0);
  const totalClicks = emails.reduce((sum, e) => sum + e.clicks, 0);

  return {
    business: businessName,
    total_emails: emails.length,
    total_opens: totalOpens,
    total_clicks: totalClicks,
    emails: emails
  };
}

/**
 * Main export
 */
function main() {
  console.log('[Email Tracker] System ready\n');
  console.log('✓ Tracking pixel injection');
  console.log('✓ Click tracking');
  console.log('✓ Open tracking');
  console.log('✓ Bounce detection');
  console.log('✓ Dashboard reporting\n');
}

if (require.main === module) {
  main();
}

module.exports = {
  registerEmailForTracking,
  addTrackingPixel,
  addClickTracking,
  recordEvent,
  generateEmailReport,
  generateTrackingDashboard,
  exportTrackingReport,
  getBusinessTrackingData,
  loadTrackingDB
};
