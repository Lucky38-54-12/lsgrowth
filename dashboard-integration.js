#!/usr/bin/env node

/**
 * LS Growth Dashboard Integration
 * Pushes automation data to dashboard in real-time
 * Creates widgets, updates metrics, syncs everything
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const LS_GROWTH_API_KEY = process.env.LS_GROWTH_API_KEY;
const VAULT_ROOT = process.env.VAULT_ROOT || 'C:/Users/lucky/Desktop/Luckys AI Brain';

/**
 * Push data to LS Growth dashboard
 */
function pushToDashboard(endpoint, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const options = {
      hostname: 'app.lsgrowth.agency',
      path: `/api/dashboard${endpoint}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LS_GROWTH_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, status: res.statusCode });
        } else {
          reject({ error: `HTTP ${res.statusCode}`, response: body });
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

/**
 * Sync daily metrics to dashboard
 */
async function syncDailyMetrics(metricsFile) {
  try {
    if (!fs.existsSync(metricsFile)) return;

    const content = fs.readFileSync(metricsFile, 'utf8');

    // Parse metrics
    const callsMatch = content.match(/\*\*Calls Made:\*\* (\d+)/);
    const convosMatch = content.match(/\*\*Conversations:\*\* (\d+)/);
    const meetingsMatch = content.match(/\*\*Meetings Booked:\*\* (\d+)/);

    if (callsMatch && convosMatch && meetingsMatch) {
      const data = {
        type: 'daily_metrics',
        date: new Date().toISOString().split('T')[0],
        calls: parseInt(callsMatch[1]),
        conversations: parseInt(convosMatch[1]),
        meetings: parseInt(meetingsMatch[1]),
        target_calls: 50
      };

      await pushToDashboard('/metrics', data);
      console.log('✓ Daily metrics synced to dashboard');
    }
  } catch (err) {
    console.error('Error syncing metrics:', err.message);
  }
}

/**
 * Sync pipeline data to dashboard
 */
async function syncPipeline(pipelineFile) {
  try {
    if (!fs.existsSync(pipelineFile)) return;

    const content = fs.readFileSync(pipelineFile, 'utf8');

    // Extract stats
    const totalMatch = content.match(/\*\*Total Leads\*\*.*?(\d+)/);
    const bookedMatch = content.match(/\*\*Meetings Booked\*\*.*?(\d+)/);
    const closedMatch = content.match(/\*\*Closed\*\*.*?(\d+)/);

    if (totalMatch) {
      const data = {
        type: 'pipeline_status',
        date: new Date().toISOString(),
        total_leads: parseInt(totalMatch[1]),
        booked: bookedMatch ? parseInt(bookedMatch[1]) : 0,
        closed: closedMatch ? parseInt(closedMatch[1]) : 0
      };

      await pushToDashboard('/pipeline', data);
      console.log('✓ Pipeline synced to dashboard');
    }
  } catch (err) {
    console.error('Error syncing pipeline:', err.message);
  }
}

/**
 * Sync email drafts count
 */
async function syncEmailStats() {
  try {
    const draftsFolder = path.join(__dirname, 'email-drafts');
    const draftCount = fs.existsSync(draftsFolder) ?
      fs.readdirSync(draftsFolder).filter(f => f.endsWith('.md')).length : 0;

    const data = {
      type: 'email_stats',
      date: new Date().toISOString(),
      pending_drafts: draftCount
    };

    await pushToDashboard('/emails', data);
    console.log(`✓ Email stats synced (${draftCount} pending)`);
  } catch (err) {
    console.error('Error syncing email stats:', err.message);
  }
}

/**
 * Sync analytics to dashboard
 */
async function syncAnalytics(analyticsFile) {
  try {
    if (!fs.existsSync(analyticsFile)) return;

    const content = fs.readFileSync(analyticsFile, 'utf8');

    const data = {
      type: 'analytics',
      date: new Date().toISOString(),
      report_file: path.basename(analyticsFile),
      has_predictions: content.includes('Projected'),
      has_trends: content.includes('Trend')
    };

    await pushToDashboard('/analytics', data);
    console.log('✓ Analytics synced to dashboard');
  } catch (err) {
    console.error('Error syncing analytics:', err.message);
  }
}

/**
 * Create dashboard widgets config
 */
function generateWidgetsConfig() {
  return {
    widgets: [
      {
        id: 'daily_calls',
        type: 'metric',
        title: 'Today\'s Calls',
        source: 'daily_metrics',
        field: 'calls',
        target: 50,
        refresh: 30
      },
      {
        id: 'weekly_calls',
        type: 'metric',
        title: 'Weekly Calls',
        source: 'daily_metrics',
        field: 'weekly_total',
        target: 350,
        refresh: 60
      },
      {
        id: 'conversion_rate',
        type: 'metric',
        title: 'Conversion Rate',
        source: 'pipeline_status',
        field: 'conversion_percent',
        target: 40,
        refresh: 60
      },
      {
        id: 'pending_emails',
        type: 'alert',
        title: 'Pending Email Drafts',
        source: 'email_stats',
        field: 'pending_drafts',
        refresh: 30
      },
      {
        id: 'stale_leads',
        type: 'alert',
        title: 'Stale Leads',
        source: 'pipeline_status',
        field: 'stale_count',
        refresh: 60
      },
      {
        id: 'pipeline_funnel',
        type: 'chart',
        title: 'Pipeline Funnel',
        source: 'pipeline_status',
        refresh: 60
      },
      {
        id: 'call_trends',
        type: 'chart',
        title: 'Call Trends (7 days)',
        source: 'analytics',
        refresh: 120
      },
      {
        id: 'best_day',
        type: 'insight',
        title: 'Best Day Analysis',
        source: 'analytics',
        refresh: 120
      }
    ]
  };
}

/**
 * Main sync
 */
async function syncAll() {
  console.log('[Dashboard Integration] Syncing...\n');

  try {
    // Sync metrics
    const metricsFile = path.join(VAULT_ROOT, '03 Projects/The Comeback/00 Outreach/reports/(C) Daily Report - ' + new Date().toISOString().split('T')[0] + '.md');
    await syncDailyMetrics(metricsFile);

    // Sync pipeline
    const pipelineFile = path.join(VAULT_ROOT, '03 Projects/The Comeback/01 Pipeline/(C) Pipeline Dashboard.md');
    await syncPipeline(pipelineFile);

    // Sync emails
    await syncEmailStats();

    // Sync analytics
    const analyticsFile = path.join(VAULT_ROOT, '03 Projects/The Comeback/07 Iteration Logs/(C) Analytics Report - ' + new Date().toISOString().split('T')[0] + '.md');
    await syncAnalytics(analyticsFile);

    console.log('\n✅ [Dashboard Integration] Sync complete\n');

  } catch (err) {
    console.error('[Dashboard Integration] Error:', err.message);
  }
}

/**
 * Export widgets config
 */
function exportWidgetsConfig() {
  const config = generateWidgetsConfig();
  const filename = path.join(__dirname, '(C) dashboard-widgets-config.json');
  fs.writeFileSync(filename, JSON.stringify(config, null, 2), 'utf8');
  console.log(`✓ Widgets config exported: ${filename}`);
  return config;
}

if (require.main === module) {
  syncAll();
}

module.exports = { syncAll, pushToDashboard, exportWidgetsConfig };
