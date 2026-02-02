# Webhook Configuration Guide for Tapstead Communication System

## Overview

This guide covers the webhook configuration needed for Resend (email) and Retell.ai (SMS/Voice) to properly track delivery events and update the Tapstead communication system.

## Resend Webhook Configuration

### 1. Access Resend Dashboard

- Go to https://resend.com/dashboard
- Navigate to "Webhooks" section
- Click "Add Webhook"

### 2. Configure Resend Webhook

**Webhook URL:** `https://tapstead.com/api/communications/webhooks/resend`

**Events to Subscribe:**

- `email.sent` - When email is successfully sent
- `email.delivered` - When email is delivered to recipient
- `email.opened` - When recipient opens the email
- `email.clicked` - When recipient clicks a link in the email
- `email.bounced` - When email bounces
- `email.complained` - When recipient marks as spam

**Headers:**

- `Content-Type: application/json`
- `User-Agent: Resend-Webhook`

### 3. Webhook Secret

- Copy the webhook secret provided by Resend
- Add to your environment variables as `RESEND_WEBHOOK_SECRET`

## Retell.ai Webhook Configuration

### 1. Access Retell.ai Dashboard

- Go to https://app.retellai.com
- Navigate to "Settings" > "Webhooks"
- Click "Add Webhook"

### 2. Configure Retell.ai Webhook

**Webhook URL:** `https://tapstead.com/api/communications/webhooks/retell`

**Events to Subscribe:**

- `call_started` - When voice call begins
- `call_ended` - When voice call ends
- `call_analyzed` - When call analysis is complete
- `sms_sent` - When SMS is sent
- `sms_delivered` - When SMS is delivered
- `sms_failed` - When SMS fails to deliver

**Headers:**

- `Content-Type: application/json`
- `User-Agent: Retell-Webhook`

### 3. Webhook Secret

- Copy the webhook secret provided by Retell.ai
- Add to your environment variables as `RETELL_WEBHOOK_SECRET`

## Environment Variables Setup

Add these to your `.env.local` and production environment:

\`\`\`bash

# Webhook Secrets

RESEND_WEBHOOK_SECRET="whsec_your_resend_webhook_secret_here"
RETELL_WEBHOOK_SECRET="your_retell_webhook_secret_here"

# Domain Configuration

NEXT_PUBLIC_APP_URL="https://tapstead.com"
\`\`\`

## Testing Webhooks

### Local Development

For local testing, use ngrok or similar tool:

1. Install ngrok: `npm install -g ngrok`
2. Start your Next.js app: `npm run dev`
3. In another terminal: `ngrok http 3000`
4. Use the ngrok URL for webhook configuration:
   - Resend: `https://your-ngrok-url.ngrok.io/api/communications/webhooks/resend`
   - Retell: `https://your-ngrok-url.ngrok.io/api/communications/webhooks/retell`

### Production Testing

Use the production URLs:

- Resend: `https://tapstead.com/api/communications/webhooks/resend`
- Retell: `https://tapstead.com/api/communications/webhooks/retell`

## Webhook Security

Both webhook handlers include signature verification:

1. **Resend**: Uses HMAC-SHA256 with the webhook secret
2. **Retell.ai**: Uses HMAC-SHA256 with the webhook secret

The handlers will reject requests with invalid signatures.

## Monitoring Webhooks

### Check Webhook Logs

Monitor webhook delivery in your application logs:

\`\`\`bash

# View webhook logs

tail -f /var/log/tapstead/webhooks.log

# Or use Vercel logs if deployed on Vercel

vercel logs --follow
\`\`\`

### Database Monitoring

Check the `delivery_tracking` table for webhook events:

\`\`\`sql
-- Recent webhook events
SELECT \* FROM delivery_tracking
ORDER BY timestamp DESC
LIMIT 50;

-- Failed deliveries
SELECT \* FROM delivery_tracking
WHERE status = 'failed'
ORDER BY timestamp DESC;
\`\`\`

## Troubleshooting

### Common Issues

1. **Webhook Not Receiving Events**
   - Verify webhook URL is accessible
   - Check firewall settings
   - Ensure HTTPS is properly configured

2. **Signature Verification Failing**
   - Verify webhook secret is correct
   - Check environment variable names
   - Ensure no extra whitespace in secrets

3. **Events Not Being Processed**
   - Check application logs for errors
   - Verify database connectivity
   - Check Supabase RLS policies

### Debug Mode

Enable debug logging by setting:
\`\`\`bash
DEBUG_WEBHOOKS=true
\`\`\`

This will log all incoming webhook payloads for debugging.
\`\`\`

## Webhook Handler Implementation with Full Content
