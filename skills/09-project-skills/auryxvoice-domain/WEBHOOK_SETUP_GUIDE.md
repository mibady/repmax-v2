# Stripe Webhook Setup Guide

## Current Issue

Your `.env.local` has an invalid webhook secret:

```
STRIPE_WEBHOOK_SECRET=http://localhost:3000/  ❌ WRONG!
```

This needs to be a proper Stripe webhook signing secret that starts with `whsec_`.

---

## Option 1: Development Setup (Local Testing with Stripe CLI)

### Prerequisites

- Stripe CLI installed
- Stripe account with test mode enabled

### Step-by-Step Instructions

#### 1. Install Stripe CLI (if not already installed)

**Windows:**

```powershell
# Download from: https://github.com/stripe/stripe-cli/releases/latest
# Or use Scoop:
scoop install stripe

# Or use Chocolatey:
choco install stripe-cli
```

**Mac:**

```bash
brew install stripe/stripe-cli/stripe
```

**Linux:**

```bash
# Download the latest release
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.4/stripe_1.19.4_linux_x86_64.tar.gz
tar -xvf stripe_1.19.4_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
```

#### 2. Login to Stripe CLI

```bash
stripe login
```

This will open your browser to authenticate with Stripe.

#### 3. Start Webhook Forwarding

```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

**You'll see output like:**

```
> Ready! Your webhook signing secret is whsec_1234567890abcdefghijklmnopqrstuvwxyz
```

#### 4. Copy the Secret

**Copy the entire `whsec_...` secret from the output above.**

#### 5. Update `.env.local`

Open `.env.local` and replace line 7:

**Before:**

```
STRIPE_WEBHOOK_SECRET=http://localhost:3000/
```

**After:**

```
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdefghijklmnopqrstuvwxyz
```

(Use YOUR actual secret from step 3)

#### 6. Restart Your Dev Server

```bash
# Stop the server (Ctrl+C)
# Restart it
npx vercel dev
```

#### 7. Test the Webhook

In a new terminal window:

```bash
stripe trigger checkout.session.completed
```

You should see:

- ✅ Webhook received in your terminal
- ✅ Database updated in Supabase
- ✅ No signature verification errors

---

## Option 2: Production Setup (Vercel/Production)

### Step-by-Step Instructions

#### 1. Deploy Your Application

Make sure your app is deployed to Vercel with a stable URL:

```
https://your-app.vercel.app
```

#### 2. Go to Stripe Dashboard

1. Open: https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"** button

#### 3. Configure the Endpoint

**Endpoint URL:**

```
https://your-app.vercel.app/api/stripe-webhook
```

**Events to Send:**
Select these events (minimum required):

- [x] `checkout.session.completed`
- [x] `customer.subscription.created`
- [x] `customer.subscription.updated`
- [x] `customer.subscription.deleted`
- [x] `invoice.payment_succeeded`
- [x] `invoice.payment_failed`

**Description:**

```
VoiceConnect AI Subscription Webhooks
```

#### 4. Get the Signing Secret

After creating the endpoint:

1. Click on the newly created webhook
2. Click **"Reveal"** next to "Signing secret"
3. Copy the secret (starts with `whsec_`)

**Example:**

```
whsec_9Xjk2mN8pQrT5vLxY3zA7bCdEfGhIjK1
```

#### 5. Add to Vercel Environment Variables

##### Option A: Via Vercel Dashboard

1. Go to: https://vercel.com/your-username/your-project/settings/environment-variables
2. Add new variable:
   - **Name:** `STRIPE_WEBHOOK_SECRET`
   - **Value:** `whsec_9Xjk2mN8pQrT5vLxY3zA7bCdEfGhIjK1` (your actual secret)
   - **Environments:** Production, Preview, Development

##### Option B: Via Vercel CLI

```bash
vercel env add STRIPE_WEBHOOK_SECRET
# Paste your secret when prompted
# Select: Production, Preview, Development
```

#### 6. Redeploy

```bash
vercel --prod
```

Or push to your connected Git repository to trigger auto-deployment.

#### 7. Test the Production Webhook

**In Stripe Dashboard:**

1. Go to: Webhooks → Your endpoint
2. Click **"Send test webhook"**
3. Select event: `checkout.session.completed`
4. Click **"Send test webhook"**

**Verify:**

- ✅ Status shows "Succeeded"
- ✅ Response time is reasonable (<5s)
- ✅ No errors in response body

---

## Verification Checklist

After setting up the webhook secret, verify everything works:

### Local Development Tests

- [ ] Stripe CLI is running and forwarding webhooks
- [ ] `.env.local` has correct `whsec_...` secret
- [ ] Dev server restarted after updating `.env.local`
- [ ] Test webhook: `stripe trigger checkout.session.completed`
- [ ] Check server logs for successful webhook processing
- [ ] Verify database updated in Supabase

### Production Tests

- [ ] Webhook endpoint created in Stripe Dashboard
- [ ] Correct events selected (checkout.session.completed minimum)
- [ ] Signing secret added to Vercel environment variables
- [ ] Application redeployed to pick up new env var
- [ ] Test webhook sent from Stripe Dashboard
- [ ] Webhook shows "Succeeded" status
- [ ] Complete a real test payment end-to-end
- [ ] Verify subscription activated in database

---

## Troubleshooting

### Issue: "Webhook signature verification failed"

**Cause:** Wrong or missing webhook secret

**Fix:**

1. Verify secret in `.env.local` starts with `whsec_`
2. Restart dev server after changing `.env.local`
3. For local dev: Make sure Stripe CLI is running
4. Check no extra spaces or quotes around the secret

### Issue: "No webhook received"

**Local Development:**

- Is Stripe CLI running? (`stripe listen --forward-to localhost:3000/api/stripe-webhook`)
- Is dev server running? (`npx vercel dev`)
- Correct port? (Should be 3000)

**Production:**

- Is webhook URL correct? (`https://your-app.vercel.app/api/stripe-webhook`)
- Check Vercel deployment logs
- Verify webhook endpoint is publicly accessible

### Issue: "403 Forbidden" or "404 Not Found"

**Check:**

1. Webhook URL is exactly: `/api/stripe-webhook` (no trailing slash)
2. File exists at: `api/stripe-webhook.ts`
3. Function is properly deployed (check Vercel functions tab)
4. No routing issues in `App.tsx` or `vercel.json`

### Issue: Database not updating

**Check:**

1. Webhook received successfully (200 response)
2. Check server logs for Supabase errors
3. Verify `SUPABASE_SERVICE_ROLE_KEY` in environment
4. Check RLS policies allow the update
5. Verify user ID format matches (Clerk ID vs Supabase)

---

## Testing Your Complete Payment Flow

Once webhook secret is configured, test the entire flow:

### End-to-End Test Script

1. **Start Services:**

   ```bash
   # Terminal 1: Dev server
   npx vercel dev

   # Terminal 2: Stripe webhook forwarding
   stripe listen --forward-to localhost:3000/api/stripe-webhook
   ```

2. **Test Payment Flow:**
   - Open: http://localhost:3000/#/pricing
   - Click "Get Started" on any plan
   - Sign up with test email: `test@example.com`
   - Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/34)
   - CVC: Any 3 digits (e.g., 123)
   - Complete payment

3. **Verify Success:**
   - Redirected to onboarding page
   - Check Terminal 2: Should show webhook received
   - Check Supabase: User should have `subscription_status: 'active'`
   - Check Terminal 1: No errors in webhook processing

4. **Check Database:**

   ```sql
   -- In Supabase SQL Editor
   SELECT id, business_name, subscription_status, stripe_customer_id, stripe_subscription_id
   FROM clients
   WHERE id = 'your-clerk-user-id';
   ```

   Should show:
   - `subscription_status`: `'active'`
   - `stripe_customer_id`: `'cus_...'`
   - `stripe_subscription_id`: `'sub_...'`

---

## Next Steps After Webhook Setup

Once webhooks are working:

1. **Test All Subscription Events:**

   ```bash
   stripe trigger checkout.session.completed
   stripe trigger customer.subscription.updated
   stripe trigger invoice.payment_succeeded
   stripe trigger invoice.payment_failed
   ```

2. **Monitor Webhook Delivery:**
   - Stripe Dashboard → Webhooks → Your endpoint
   - Review success rate and error logs
   - Set up alerts for failures

3. **Production Deployment:**
   - Update webhook URL to production domain
   - Test with real Stripe test mode payment
   - Monitor for 24 hours before going live

---

## Quick Reference

### Environment Variable Format

```bash
# .env.local
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdefghijklmnopqrstuvwxyz
```

### Stripe CLI Commands

```bash
# Login
stripe login

# Forward webhooks (local dev)
stripe listen --forward-to localhost:3000/api/stripe-webhook

# Trigger test event
stripe trigger checkout.session.completed

# View recent webhooks
stripe webhooks events list

# Test webhook endpoint
stripe webhooks trigger checkout.session.completed \
  --webhook-endpoint https://your-app.vercel.app/api/stripe-webhook
```

### Test Card Numbers (Stripe Test Mode)

```
Success: 4242 4242 4242 4242
Declined: 4000 0000 0000 0002
Requires authentication: 4000 0025 0000 3155
```

---

## Security Notes

⚠️ **IMPORTANT:**

- Never commit webhook secrets to Git
- Use different secrets for dev/staging/production
- Rotate secrets if exposed
- Monitor webhook logs for suspicious activity
- Validate webhook signature on EVERY request (already implemented in your code)

✅ **Your Implementation:**
Your `api/stripe-webhook.ts` already has proper signature verification:

```typescript
event = stripe.webhooks.constructEvent(
  buf,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET!,
);
```

This ensures only legitimate Stripe webhooks are processed.

---

## Support Resources

**Stripe Documentation:**

- Webhooks Guide: https://stripe.com/docs/webhooks
- CLI Reference: https://stripe.com/docs/stripe-cli
- Test Cards: https://stripe.com/docs/testing

**Troubleshooting:**

- Stripe Webhook Logs: https://dashboard.stripe.com/webhooks
- Vercel Function Logs: https://vercel.com/dashboard/logs
- Supabase Logs: https://supabase.com/dashboard/project/logs

---

**Ready to proceed with the setup? I can help you through each step!**
