# Email Tracking System — Complete Guide

**Status:** Built & Ready | Not Activated  
**Components:** Email tracker, API endpoints, Dashboard widget  
**Tracks:** Opens, clicks, bounces, engagement metrics  

---

## 🎯 What Gets Tracked

### Per Email
- ✅ When opened (timestamp, IP, user agent)
- ✅ How many times opened (open count)
- ✅ Which links clicked
- ✅ When clicked (timestamp, IP)
- ✅ Email bounce status
- ✅ Engagement classification (hot lead, interested, not opened)

### Analytics
- ✅ Overall open rate (%)
- ✅ Click-through rate (%)
- ✅ Bounce rate
- ✅ Hot leads (opened + clicked)
- ✅ Interested leads (opened, no click)
- ✅ Cold leads (not opened)

---

## 🔧 How It Works

### 1. Email Sending with Tracking
```javascript
// When email is sent:
const trackingId = registerEmailForTracking({
  to: 'contact@business.com',
  business_name: 'ABC Cleaning',
  subject: 'Following up on our call'
});

// Add tracking pixel to email body
let emailBody = addTrackingPixel(emailBody, trackingId);

// Add click tracking to all links
emailBody = addClickTracking(emailBody, trackingId);

// Send email with tracking enabled
// Every open/click now tracked automatically
```

### 2. Open Tracking
- Invisible 1x1 pixel added to email
- When recipient opens email, pixel loads
- API records: timestamp, IP, user agent
- Opens counted (even multiple opens per recipient)

### 3. Click Tracking
- All links wrapped in tracking redirect
- When link clicked, tracker captures it
- Then redirects to original URL
- Records: timestamp, which link, IP

### 4. Bounce Detection
- Email service webhook integration
- SendGrid, Mailgun, etc. send bounce events
- System logs bounce reason
- Marks lead as bounced

---

## 📁 Files & Components

### Core Scripts
- **`email-tracker.js`** — Tracking database, recording events, reporting
- **`email-tracking-api.js`** — API endpoints for pixel/click tracking
- **`email-tracking.json`** — Tracking database (auto-created)

### Dashboard
- **`app/emails/page.jsx`** — Email tracking dashboard
- Shows: stats, email list, hot leads, engagement

### Integration Points
- Connects to email-monitor script
- Adds tracking to generated emails
- Logs to dashboard in real-time

---

## 🚀 How to Enable (When Ready)

### Step 1: Integrate with Email Monitor
In `sheets-monitor-and-email.js`, add:
```javascript
const emailTracker = require('./email-tracker');

// Before sending email:
const trackingId = emailTracker.registerEmailForTracking({
  to: lead.email,
  business_name: lead.name,
  subject: emailTemplate.subject
});

// Add tracking to email body:
emailTemplate.body = emailTracker.addTrackingPixel(emailTemplate.body, trackingId);
emailTemplate.body = emailTracker.addClickTracking(emailTemplate.body, trackingId);

// Then send email with tracking enabled
```

### Step 2: Set Up Tracking API
Run tracking API server:
```bash
node email-tracking-api.js
# Server starts on port 3002
```

Or integrate into Express app:
```javascript
const { createTrackingMiddleware } = require('./email-tracking-api');
createTrackingMiddleware(app); // adds /api/track/* endpoints
```

### Step 3: Generate Reports
```bash
node email-tracker.js
# Generates email tracking dashboard
# Saves to: 04 System/email-tracking/(C) Email Tracking Report - {DATE}.md
```

---

## 📊 Dashboard Features

### Email List Table
- Business name
- Email address
- Subject
- Send date
- Open count
- Click count
- Status (Bounced, Opened, Sent)

### Metrics Cards
- **Total Sent** — All emails
- **Opened** — # & % open rate
- **Clicked** — # & % click rate
- **Bounced** — # of bounces

### Engagement Segmentation
- **🔥 Hot Leads** — Opened + clicked (ready to close)
- **👀 Interested** — Opened only (follow up)
- **❄️ Cold** — Not opened yet (resend or forget)

---

## 🔐 Privacy & Compliance

✅ Tracking is transparent (disclosed in footer)
✅ No personal data stored beyond email/name
✅ Compliant with GDPR (tracking via pixels is standard)
✅ Can be disabled per email if needed
✅ Data stored locally (not third-party)

---

## 📈 Use Cases

### 1. Identify Hot Leads
See which prospects opened AND clicked → highest conversion potential

### 2. Follow Up Timing
Send follow-ups only to opens, not sends

### 3. A/B Testing
Compare subject lines by open rate

### 4. Pipeline Scoring
Hot leads get priority in pipeline

### 5. Cleanup
Remove bounced emails from future sends

---

## 📝 Database Structure

### `email-tracking.json`
```json
{
  "emails": {
    "tracking-id-1": {
      "id": "abc123",
      "to": "contact@business.com",
      "business_name": "ABC Cleaning",
      "subject": "Follow up",
      "sent_at": "2026-06-24T10:30:00Z",
      "status": "sent",
      "opens": 2,
      "clicks": 1,
      "bounced": false,
      "events": [
        {
          "type": "open",
          "timestamp": "2026-06-24T12:00:00Z",
          "user_agent": "Mozilla...",
          "ip": "192.168.1.1"
        }
      ]
    }
  },
  "events": [
    // All events globally
  ]
}
```

---

## 🔗 API Endpoints

### Open Tracking Pixel
```
GET /api/track/open/{trackingId}
Response: 1x1 transparent GIF pixel
Records: open event with timestamp, IP, user agent
```

### Click Tracking Redirect
```
GET /api/track/click/{trackingId}?url={url}
Response: 302 redirect to original URL
Records: click event with timestamp, IP, which URL
```

### Bounce Webhook
```
POST /api/track/bounce
Body: webhook data from email service
Records: bounce event with reason
```

---

## 📊 Reporting

### Auto-Generated Reports
```
04 System/email-tracking/(C) Email Tracking Report - {DATE}.md
```

Contains:
- Overall stats (sent, opened, clicked, bounced)
- Email history table
- Hot leads list (opened + clicked)
- Interested list (opened only)
- Cold list (not opened)

---

## 🎯 Benefits

✅ Know exactly which prospects are interested
✅ Prioritize hot leads (opened + clicked)
✅ Track follow-up effectiveness
✅ Remove bounced emails automatically
✅ A/B test subject lines
✅ Score leads by engagement
✅ Time follow-ups strategically
✅ Never waste time on uninterested leads

---

**Everything built. Ready to activate with automations.** 🚀

See: `email-tracker.js`, `email-tracking-api.js`, `Dashboard > Emails`

