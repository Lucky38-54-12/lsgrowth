#!/usr/bin/env node

/**
 * Email Templates Library
 * 15+ templates for different outcomes and scenarios
 * Used by sheets-monitor-and-email.js
 */

/**
 * Template: No Answer
 */
const templateNoAnswer = (lead) => ({
  subject: `Following up on our call to ${lead.business_name}`,
  body: `Hi ${lead.contact_name || lead.business_name},

I tried reaching you earlier but wasn't able to connect. I wanted to chat about how we help ${lead.business_name} grow their online presence.

Would ${lead.number} be a good number to reach you at? I'm flexible with timing.

Looking forward to connecting!

Best,
LS Growth`
});

/**
 * Template: Left Voicemail
 */
const templateLeftVoicemail = (lead) => ({
  subject: `Voicemail from LS Growth - Let's connect`,
  body: `Hi ${lead.contact_name || lead.business_name},

I left you a quick voicemail earlier. When you get a moment, give me a call back at ${lead.number} or just reply to this email.

I've got some ideas that might be valuable for ${lead.business_name}.

Looking forward to chatting!

Best,
LS Growth`
});

/**
 * Template: Interested
 */
const templateInterested = (lead) => ({
  subject: `Let's set up a time to chat - ${lead.business_name}`,
  body: `Hi ${lead.contact_name || lead.business_name},

Great chatting with you today! I'm really excited about the potential here.

I'd love to show you what we've done for similar businesses and how it could apply to ${lead.business_name}.

When's a good time this week for a quick call? I can work around your schedule.

Best,
LS Growth`
});

/**
 * Template: Not Interested
 */
const templateNotInterested = (lead) => ({
  subject: `No worries - keeping the door open`,
  body: `Hi ${lead.contact_name || lead.business_name},

Thanks for being straight with me! I appreciate the honesty.

If things change down the road or you want to revisit this, you've got my number. No pressure.

Best of luck with ${lead.business_name}!

LS Growth`
});

/**
 * Template: Follow-up Needed
 */
const templateFollowupNeeded = (lead) => ({
  subject: `Quick thoughts from our call`,
  body: `Hi ${lead.contact_name || lead.business_name},

Thanks for taking the time to chat today. I've been thinking about what you shared and have a few ideas that could work well for ${lead.business_name}.

When would be a good time this week to follow up? Even 10 minutes would be helpful.

Best,
LS Growth`
});

/**
 * Template: Call Back Scheduled
 */
const templateCallBackScheduled = (lead) => ({
  subject: `Confirmed - our call on ${lead.call_back_date || '[DATE]'}`,
  body: `Hi ${lead.contact_name || lead.business_name},

Perfect! I've got us down for ${lead.call_back_date || '[DATE/TIME]'}.

Just confirming that time still works for you. If anything changes, just let me know.

Looking forward to diving deeper with ${lead.business_name}!

Best,
LS Growth`
});

/**
 * Template: Meeting Booked
 */
const templateMeetingBooked = (lead) => ({
  subject: `Meeting confirmed - ${lead.business_name}`,
  body: `Hi ${lead.contact_name || lead.business_name},

Excited to meet! Just confirming we're set for our meeting.

${lead.meeting_date ? `Date/Time: ${lead.meeting_date}` : ''}
${lead.meeting_link ? `Link: ${lead.meeting_link}` : ''}

If you need to reschedule, just let me know.

See you then!

LS Growth`
});

/**
 * Template: Budget Discussion Needed
 */
const templateBudgetNeeded = (lead) => ({
  subject: `Budget expectations - ${lead.business_name}`,
  body: `Hi ${lead.contact_name || lead.business_name},

Thanks for the call today. One question came up — what budget range does ${lead.business_name} typically work with for something like this?

This helps me tailor the right solution for you.

Let me know when you get a chance!

Best,
LS Growth`
});

/**
 * Template: Decision Maker Not Available
 */
const templateDecisionMakerNeeded = (lead) => ({
  subject: `Need to loop in the decision maker`,
  body: `Hi ${lead.contact_name || lead.business_name},

Thanks for the conversation! I'm sensing you might need to loop in someone else (owner, manager, etc.) before we move forward.

No problem at all. Can you make an introduction, or would it be better if I reached out to them directly?

Best,
LS Growth`
});

/**
 * Template: Already Using Competitor
 */
const templateAlreadyUsing = (lead) => ({
  subject: `How ${lead.business_name} can save money with us`,
  body: `Hi ${lead.contact_name || lead.business_name},

I get it — you're already using [COMPETITOR]. We hear that a lot.

The thing is, most of our clients switched from their old provider because we're 40% cheaper and get 3x the results.

Would it make sense to do a quick comparison? No obligation.

Best,
LS Growth`
});

/**
 * Template: Timing Issue
 */
const templateWrongTiming = (lead) => ({
  subject: `Let's touch base in 3 months`,
  body: `Hi ${lead.contact_name || lead.business_name},

Totally understand — timing's not right now for ${lead.business_name}.

I'm putting a reminder to check back in with you in 3 months. Hopefully things will have shifted by then.

Talk soon!

LS Growth`
});

/**
 * Template: Price Too High
 */
const templatePriceConcern = (lead) => ({
  subject: `Budget options for ${lead.business_name}`,
  body: `Hi ${lead.contact_name || lead.business_name},

I hear the budget concern. We actually have a few options depending on scope.

Let me ask you this: if we could make the numbers work, would ${lead.business_name} be interested in moving forward?

Let me know and we can brainstorm some options.

Best,
LS Growth`
});

/**
 * Template: Need More Information
 */
const templateNeedInfo = (lead) => ({
  subject: `Info you need about our services`,
  body: `Hi ${lead.contact_name || lead.business_name},

Thanks for asking more questions! I love when people dig into the details.

Here's what you asked about:

${lead.notes || '[Your questions will be addressed here]'}

Let me know if you need anything else!

Best,
LS Growth`
});

/**
 * Template: Referral Request
 */
const templateReferral = (lead) => ({
  subject: `Do you know anyone in ${lead.category || 'your industry'}?`,
  body: `Hi ${lead.contact_name || lead.business_name},

Since ${lead.business_name} isn't the right fit right now, I wanted to ask: do you know other businesses in your space who might benefit from what we do?

I'll make sure to take great care of anyone you refer.

Thanks!

LS Growth`
});

/**
 * Template: Personal Connection
 */
const templatePersonalConnection = (lead) => ({
  subject: `Great meeting you, ${lead.contact_name || lead.business_name}`,
  body: `Hi ${lead.contact_name || lead.business_name},

Just wanted to say thanks for taking the call today. I really enjoyed our conversation about ${lead.business_name} and where you're headed.

Whether we work together or not, I'm rooting for you.

Best,
LS Growth`
});

/**
 * Get template by outcome
 */
function getTemplate(outcome, lead) {
  const outcomeMap = {
    'no answer': templateNoAnswer,
    'left voicemail': templateLeftVoicemail,
    'interested': templateInterested,
    'not interested': templateNotInterested,
    'follow-up needed': templateFollowupNeeded,
    'call back': templateCallBackScheduled,
    'meeting booked': templateMeetingBooked,
    'budget': templateBudgetNeeded,
    'decision maker': templateDecisionMakerNeeded,
    'already using': templateAlreadyUsing,
    'wrong timing': templateWrongTiming,
    'price': templatePriceConcern,
    'need info': templateNeedInfo,
    'referral': templateReferral,
    'personal': templatePersonalConnection,
  };

  const template = outcomeMap[outcome.toLowerCase()] || templateFollowupNeeded;
  return template(lead);
}

module.exports = {
  getTemplate,
  templateNoAnswer,
  templateLeftVoicemail,
  templateInterested,
  templateNotInterested,
  templateFollowupNeeded,
  templateCallBackScheduled,
  templateMeetingBooked,
  templateBudgetNeeded,
  templateDecisionMakerNeeded,
  templateAlreadyUsing,
  templateWrongTiming,
  templatePriceConcern,
  templateNeedInfo,
  templateReferral,
  templatePersonalConnection,
};
