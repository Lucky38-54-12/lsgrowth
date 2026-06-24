#!/usr/bin/env node

/**
 * Pipeline Sync & Dashboard
 * Reads from LS Growth API
 * Updates 01 Pipeline folder with deal tracking
 * Generates pipeline status dashboard
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const VAULT_ROOT = process.env.VAULT_ROOT || 'C:/Users/lucky/Desktop/Luckys AI Brain';
const PIPELINE_FOLDER = path.join(VAULT_ROOT, '03 Projects/The Comeback/01 Pipeline');
const LS_GROWTH_API_KEY = process.env.LS_GROWTH_API_KEY || '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';

/**
 * Fetch pipeline data from LS Growth API
 */
function fetchPipelineData() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'app.lsgrowth.agency',
      path: '/api/pipeline',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${LS_GROWTH_API_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve(JSON.parse(data || '[]'));
          }
        } else {
          reject({ error: `HTTP ${res.statusCode}`, response: data });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * Categorize leads by stage
 */
function categorizePipeline(leads) {
  const pipeline = {
    prospect: [],
    contacted: [],
    follow_up: [],
    replied: [],
    booked: [],
    closed: []
  };

  leads.forEach(lead => {
    const status = (lead.status || 'prospect').toLowerCase();
    if (pipeline[status]) {
      pipeline[status].push(lead);
    } else {
      pipeline.prospect.push(lead);
    }
  });

  return pipeline;
}

/**
 * Calculate pipeline metrics
 */
function calculateMetrics(pipeline) {
  const total = Object.values(pipeline).reduce((sum, arr) => sum + arr.length, 0);
  const booked = pipeline.booked.length;
  const closed = pipeline.closed.length;
  const conversionRate = total > 0 ? ((booked / total) * 100).toFixed(1) : 0;

  return {
    total,
    booked,
    closed,
    conversionRate,
    funnel: {
      prospect: pipeline.prospect.length,
      contacted: pipeline.contacted.length,
      follow_up: pipeline.follow_up.length,
      replied: pipeline.replied.length,
      booked: pipeline.booked.length,
      closed: pipeline.closed.length
    }
  };
}

/**
 * Generate pipeline dashboard
 */
function generateDashboard(pipeline, metrics) {
  const date = new Date().toISOString().split('T')[0];

  const content = `---
date: "${date}"
type: "pipeline"
total_leads: ${metrics.total}
booked: ${metrics.booked}
closed: ${metrics.closed}
---

# Pipeline Dashboard

**Last Updated:** ${date}

## 📊 Quick Stats

| Metric | Count |
|--------|-------|
| **Total Leads** | ${metrics.total} |
| **Prospects** | ${metrics.funnel.prospect} |
| **Contacted** | ${metrics.funnel.contacted} |
| **Follow-ups** | ${metrics.funnel.follow_up} |
| **Replied** | ${metrics.funnel.replied} |
| **Meetings Booked** | ${metrics.booked} |
| **Closed** | ${metrics.closed} |

## 🎯 Funnel Conversion

\`\`\`
Prospects (${metrics.funnel.prospect})
    ↓ (${((metrics.funnel.contacted / metrics.funnel.prospect) * 100).toFixed(0)}% contacted)
Contacted (${metrics.funnel.contacted})
    ↓ (${((metrics.funnel.follow_up / metrics.funnel.contacted) * 100).toFixed(0)}% follow-up)
Follow-ups (${metrics.funnel.follow_up})
    ↓ (${((metrics.funnel.replied / metrics.funnel.follow_up) * 100).toFixed(0)}% replied)
Replied (${metrics.funnel.replied})
    ↓ (${((metrics.booked / metrics.funnel.replied) * 100).toFixed(0)}% booked)
Booked (${metrics.booked})
    ↓ (${((metrics.closed / metrics.booked) * 100).toFixed(0)}% closed)
Closed (${metrics.closed})
\`\`\`

## 🔴 Stale Leads (Not contacted in 7+ days)

${pipeline.prospect.length > 0 ? `- ${pipeline.prospect.map(l => l.name).join('\n- ')}` : 'None'}

## 💚 Hot Leads (Replied, ready to book)

${pipeline.replied.length > 0 ? `- ${pipeline.replied.map(l => l.name).join('\n- ')}` : 'None'}

## ✅ Booked This Week

${pipeline.booked.slice(0, 5).map(l => `- ${l.name} (${l.booked_date || 'TBD'})`).join('\n')}

## 🎉 Closed This Month

${pipeline.closed.slice(0, 5).map(l => `- ${l.name} ($${l.deal_value || '?'})`).join('\n')}

---

## 💡 Next Actions

1. **Follow up with Replied leads** — they're closest to booking
2. **Re-contact cold prospects** — if stale for 7+ days
3. **Prepare for booked meetings** — review call notes before each call
`;

  const filename = path.join(PIPELINE_FOLDER, '(C) Pipeline Dashboard.md');
  fs.writeFileSync(filename, content, 'utf8');
  console.log(`✓ Dashboard: ${path.basename(filename)}`);

  return filename;
}

/**
 * Generate stale leads alert
 */
function generateStaleLeadsAlert(pipeline) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const staleLeads = pipeline.prospect.filter(lead => {
    const lastContact = lead.last_contact ? new Date(lead.last_contact) : null;
    return !lastContact || lastContact < sevenDaysAgo;
  });

  if (staleLeads.length === 0) return null;

  const date = new Date().toISOString().split('T')[0];
  const content = `---
date: "${date}"
type: "alert"
stale_count: ${staleLeads.length}
---

# 🚨 Stale Leads Alert

**Count:** ${staleLeads.length} leads haven't been contacted in 7+ days

## Leads to Re-Contact

${staleLeads.map((lead, i) => {
  const lastContact = lead.last_contact ? new Date(lead.last_contact).toISOString().split('T')[0] : 'Unknown';
  return `${i + 1}. **${lead.name}**
   - Last contacted: ${lastContact}
   - Phone: ${lead.phone || 'N/A'}
   - Email: ${lead.email || 'N/A'}
   - Notes: ${lead.notes || 'None'}`;
}).join('\n\n')}

---

## Action Plan
- Call each lead back
- Update their status
- If they say "not interested", close the deal
- If "maybe later", book a follow-up date
`;

  const filename = path.join(PIPELINE_FOLDER, `(C) Stale Leads Alert - ${date}.md`);
  fs.writeFileSync(filename, content, 'utf8');
  console.log(`✓ Stale leads alert: ${path.basename(filename)}`);

  return filename;
}

/**
 * Main
 */
async function main() {
  console.log('[Pipeline Sync] Starting...\n');

  try {
    if (!fs.existsSync(PIPELINE_FOLDER)) {
      fs.mkdirSync(PIPELINE_FOLDER, { recursive: true });
    }

    console.log('Fetching pipeline from LS Growth...');
    const leads = await fetchPipelineData();

    if (!leads || leads.length === 0) {
      console.log('⚠️  No leads found in LS Growth');
      return;
    }

    console.log(`Found ${leads.length} leads\n`);

    // Categorize
    const pipeline = categorizePipeline(leads);
    const metrics = calculateMetrics(pipeline);

    // Generate dashboard
    generateDashboard(pipeline, metrics);

    // Generate stale leads alert
    generateStaleLeadsAlert(pipeline);

    console.log(`\n✅ [Pipeline] Sync complete`);
    console.log(`   Total: ${metrics.total} | Booked: ${metrics.booked} | Closed: ${metrics.closed}\n`);

  } catch (err) {
    console.error('[Pipeline] Error:', err.message);
    console.log('(LS Growth API may not be available yet)\n');
  }
}

if (require.main === module) {
  main();
}

module.exports = { fetchPipelineData, categorizePipeline };
