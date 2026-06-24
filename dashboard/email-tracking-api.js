#!/usr/bin/env node

/**
 * Email Tracking API Endpoints
 * Handles open/click/bounce tracking webhooks
 * Can be integrated into Express or used standalone
 */

const emailTracker = require('./email-tracker');

/**
 * Handle open tracking pixel
 */
function handleOpenTracking(trackingId, req) {
  const data = {
    user_agent: req.headers['user-agent'] || 'unknown',
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    timestamp: new Date().toISOString()
  };

  emailTracker.recordEvent(trackingId, 'open', data);

  // Return 1x1 transparent pixel
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'image/gif' },
    body: Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')
  };
}

/**
 * Handle click tracking redirect
 */
function handleClickTracking(trackingId, url, req) {
  const data = {
    user_agent: req.headers['user-agent'] || 'unknown',
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    url: url,
    timestamp: new Date().toISOString()
  };

  emailTracker.recordEvent(trackingId, 'click', data);

  // Redirect to original URL
  return {
    statusCode: 302,
    headers: { 'Location': url },
    body: ''
  };
}

/**
 * Handle bounce webhook (from email service like SendGrid)
 */
function handleBounceWebhook(webhookData) {
  // Parse webhook data from email service
  // This would be specific to your email provider (SendGrid, Mailgun, etc.)

  const { email, event, reason } = webhookData;

  if (event === 'bounce' || event === 'dropped') {
    // Find tracking ID for this email
    const db = emailTracker.loadTrackingDB();
    const trackingId = Object.keys(db.emails).find(id => db.emails[id].to === email);

    if (trackingId) {
      emailTracker.recordEvent(trackingId, 'bounce', {
        reason: reason,
        timestamp: new Date().toISOString()
      });
    }
  }
}

/**
 * Express middleware integration
 */
function createTrackingMiddleware(app) {
  // Open tracking endpoint
  app.get('/api/track/open/:trackingId', (req, res) => {
    const result = handleOpenTracking(req.params.trackingId, req);
    res.status(result.statusCode);
    res.set(result.headers);
    res.send(result.body);
  });

  // Click tracking endpoint
  app.get('/api/track/click/:trackingId', (req, res) => {
    const url = req.query.url;
    if (!url) {
      return res.status(400).send('Missing URL');
    }

    const result = handleClickTracking(req.params.trackingId, url, req);
    res.status(result.statusCode);
    res.set(result.headers);
    res.send(result.body);
  });

  // Bounce webhook endpoint (from email service)
  app.post('/api/track/bounce', (req, res) => {
    handleBounceWebhook(req.body);
    res.status(200).json({ success: true });
  });

  console.log('✓ Email tracking endpoints registered');
}

/**
 * Standalone server (for testing)
 */
function startTrackingServer(port = 3002) {
  const http = require('http');
  const url = require('url');

  const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    // Open tracking
    if (pathname.startsWith('/api/track/open/')) {
      const trackingId = pathname.split('/').pop();
      const result = handleOpenTracking(trackingId, req);
      res.writeHead(result.statusCode, result.headers);
      res.end(result.body);
    }
    // Click tracking
    else if (pathname.startsWith('/api/track/click/')) {
      const trackingId = pathname.split('/').pop();
      const redirectUrl = query.url;
      if (!redirectUrl) {
        res.writeHead(400);
        res.end('Missing URL');
        return;
      }
      const result = handleClickTracking(trackingId, redirectUrl, req);
      res.writeHead(result.statusCode, result.headers);
      res.end(result.body);
    }
    // Health check
    else if (pathname === '/health') {
      res.writeHead(200);
      res.end('OK');
    }
    // 404
    else {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  server.listen(port, () => {
    console.log(`✓ Email tracking server running on port ${port}`);
    console.log(`  Open tracking:  http://localhost:${port}/api/track/open/{id}`);
    console.log(`  Click tracking: http://localhost:${port}/api/track/click/{id}?url={url}`);
  });

  return server;
}

module.exports = {
  handleOpenTracking,
  handleClickTracking,
  handleBounceWebhook,
  createTrackingMiddleware,
  startTrackingServer
};

// Start server if run directly
if (require.main === module) {
  startTrackingServer();
}
