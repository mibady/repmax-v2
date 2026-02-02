# Resend - Email API Service

**Official Website:** https://resend.com
**Documentation:** https://resend.com/docs
**Pricing:** Free tier: 100 emails/day, 3,000/month

---

## Overview

Resend is a modern email API built for developers. It provides a simple, reliable way to send transactional emails from your application with excellent deliverability and a developer-friendly API.

### Key Features

- ✅ Simple, modern API
- ✅ React Email template support
- ✅ Excellent deliverability
- ✅ Real-time webhooks
- ✅ Email validation
- ✅ Detailed analytics
- ✅ Custom domains
- ✅ Team collaboration
- ✅ Next.js optimized

---

## Use Cases for AI Coder

1. **User Onboarding**
   - Welcome emails
   - Email verification
   - Account activation

2. **Notifications**
   - Password reset
   - Account updates
   - Activity alerts

3. **Transactional**
   - Order confirmations
   - Invoices
   - Receipts

4. **Marketing**
   - Product updates
   - Newsletters
   - Announcements

---

## Quick Start

### 1. Installation

```bash
npm install resend
# or
pnpm add resend
```

### 2. Get API Key

1. Sign up at https://resend.com
2. Navigate to API Keys
3. Create a new API key
4. Add to `.env.local`:

```bash
RESEND_API_KEY=re_123456789
```

### 3. Basic Usage

```typescript
// lib/resend.ts
import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);
```

```typescript
// app/api/send-email/route.ts
import { resend } from '@/lib/resend';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email, subject, message } = await request.json();

  try {
    const data = await resend.emails.send({
      from: 'onboarding@yourdomain.com',
      to: email,
      subject: subject,
      html: `<p>${message}</p>`,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
```

---

## Integration with React Email

React Email provides beautiful, responsive email templates using React components.

### 1. Setup React Email

```bash
npm install react-email @react-email/components
# or
pnpm add react-email @react-email/components
```

### 2. Create Email Template

```tsx
// emails/welcome-email.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface WelcomeEmailProps {
  username: string;
  loginUrl: string;
}

export function WelcomeEmail({ username, loginUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to our platform!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome, {username}!</Heading>
          <Text style={text}>
            Thank you for joining us. We're excited to have you on board.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={loginUrl}>
              Get Started
            </Button>
          </Section>
          <Text style={text}>
            If you have any questions, feel free to reach out to our support team.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
};

const text = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '24px',
};

const buttonContainer = {
  padding: '27px 0 27px',
};

const button = {
  backgroundColor: '#5e6ad2',
  borderRadius: '3px',
  color: '#fff',
  fontSize: '14px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px',
};
```

### 3. Send React Email Template

```typescript
// app/api/welcome/route.ts
import { resend } from '@/lib/resend';
import { WelcomeEmail } from '@/emails/welcome-email';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email, username } = await request.json();

  try {
    const data = await resend.emails.send({
      from: 'onboarding@yourdomain.com',
      to: email,
      subject: 'Welcome to Our Platform!',
      react: WelcomeEmail({
        username,
        loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`
      }),
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
```

---

## Advanced Features

### Batch Emails

Send multiple emails in one request:

```typescript
const data = await resend.batch.send([
  {
    from: 'onboarding@yourdomain.com',
    to: 'user1@example.com',
    subject: 'Welcome!',
    react: WelcomeEmail({ username: 'User 1', loginUrl: '/login' }),
  },
  {
    from: 'onboarding@yourdomain.com',
    to: 'user2@example.com',
    subject: 'Welcome!',
    react: WelcomeEmail({ username: 'User 2', loginUrl: '/login' }),
  },
]);
```

### Attachments

```typescript
const data = await resend.emails.send({
  from: 'invoices@yourdomain.com',
  to: 'customer@example.com',
  subject: 'Your Invoice',
  react: InvoiceEmail({ invoiceData }),
  attachments: [
    {
      filename: 'invoice.pdf',
      content: Buffer.from(pdfData),
    },
  ],
});
```

### Email Validation

```typescript
import { resend } from '@/lib/resend';

const validation = await resend.emails.validate({
  email: 'user@example.com',
});

console.log(validation); // { valid: true, ... }
```

### Webhooks

Handle email events (opens, clicks, bounces):

```typescript
// app/api/webhooks/resend/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();

  switch (body.type) {
    case 'email.sent':
      // Handle successful send
      break;
    case 'email.delivered':
      // Handle delivery
      break;
    case 'email.opened':
      // Track opens
      break;
    case 'email.clicked':
      // Track clicks
      break;
    case 'email.bounced':
      // Handle bounces
      break;
  }

  return NextResponse.json({ received: true });
}
```

---

## Integration with AI Coder Services

### With Clerk (Authentication)

```typescript
// Send welcome email after user signs up
import { resend } from '@/lib/resend';
import { WelcomeEmail } from '@/emails/welcome-email';

export async function handleUserCreated(user: any) {
  await resend.emails.send({
    from: 'onboarding@yourdomain.com',
    to: user.emailAddresses[0].emailAddress,
    subject: 'Welcome to Our Platform!',
    react: WelcomeEmail({
      username: user.firstName || 'there',
      loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    }),
  });
}
```

### With Stripe (Payments)

```typescript
// Send invoice email after payment
import { resend } from '@/lib/resend';
import { InvoiceEmail } from '@/emails/invoice-email';

export async function handlePaymentSuccess(session: any) {
  await resend.emails.send({
    from: 'billing@yourdomain.com',
    to: session.customer_email,
    subject: `Invoice #${session.invoice}`,
    react: InvoiceEmail({
      invoiceId: session.invoice,
      amount: session.amount_total / 100,
      date: new Date(session.created * 1000),
    }),
  });
}
```

### With Inngest (Background Jobs)

```typescript
// Send emails as background jobs
import { inngest } from '@/lib/inngest';
import { resend } from '@/lib/resend';

export const sendWelcomeEmail = inngest.createFunction(
  { id: 'send-welcome-email' },
  { event: 'user.created' },
  async ({ event }) => {
    await resend.emails.send({
      from: 'onboarding@yourdomain.com',
      to: event.data.email,
      subject: 'Welcome!',
      react: WelcomeEmail(event.data),
    });
  }
);
```

---

## Best Practices

### 1. Use Custom Domain

Set up a custom domain for better deliverability:
- Go to Resend Dashboard > Domains
- Add your domain
- Configure DNS records
- Verify domain

### 2. Email Templates Structure

```
emails/
├── welcome-email.tsx
├── password-reset.tsx
├── invoice.tsx
├── notification.tsx
└── components/
    ├── footer.tsx
    ├── header.tsx
    └── button.tsx
```

### 3. Environment Variables

```bash
# Required
RESEND_API_KEY=re_xxx

# Optional
RESEND_FROM_EMAIL=onboarding@yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 4. Error Handling

```typescript
try {
  const data = await resend.emails.send({
    from: 'onboarding@yourdomain.com',
    to: email,
    subject: subject,
    react: EmailTemplate(props),
  });

  return { success: true, emailId: data.id };
} catch (error) {
  console.error('Email send failed:', error);

  // Log to Sentry
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error);
  }

  return { success: false, error: 'Failed to send email' };
}
```

### 5. Rate Limiting

```typescript
// Use Arcjet for rate limiting email sends
import arcjet, { tokenBucket } from '@arcjet/next';

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    tokenBucket({
      mode: 'LIVE',
      refillRate: 10, // 10 emails
      interval: 3600, // per hour
      capacity: 20,
    }),
  ],
});

export async function POST(request: Request) {
  const decision = await aj.protect(request);

  if (decision.isDenied()) {
    return NextResponse.json(
      { error: 'Too many emails sent' },
      { status: 429 }
    );
  }

  // Send email...
}
```

---

## Testing

### Development Mode

Use Resend's test mode to avoid sending real emails:

```typescript
// lib/resend.ts
export const resend = new Resend(
  process.env.NODE_ENV === 'production'
    ? process.env.RESEND_API_KEY
    : 'test_key'
);
```

### Preview Emails Locally

Use React Email CLI:

```bash
# Start email preview server
npm run email:dev
```

Add to `package.json`:

```json
{
  "scripts": {
    "email:dev": "email dev --port 3001"
  }
}
```

---

## Pricing

**Free Tier:**
- 100 emails/day
- 3,000 emails/month
- All features included

**Pro ($20/month):**
- 50,000 emails/month
- $1 per additional 1,000 emails
- Custom domains
- Team members
- Priority support

**Enterprise:**
- Custom volume
- Dedicated IP
- Advanced analytics
- Custom SLAs

---

## Common Use Cases with Code Examples

### 1. Password Reset Email

```typescript
// emails/password-reset.tsx
export function PasswordResetEmail({ resetUrl }: { resetUrl: string }) {
  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Body>
        <Container>
          <Heading>Reset your password</Heading>
          <Text>Click the button below to reset your password:</Text>
          <Button href={resetUrl}>Reset Password</Button>
          <Text>This link will expire in 1 hour.</Text>
        </Container>
      </Body>
    </Html>
  );
}
```

### 2. Email Verification

```typescript
// app/api/verify-email/route.ts
export async function POST(request: Request) {
  const { email, token } = await request.json();

  await resend.emails.send({
    from: 'verify@yourdomain.com',
    to: email,
    subject: 'Verify your email address',
    react: VerificationEmail({
      verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}`,
    }),
  });
}
```

### 3. Team Invitation

```typescript
// emails/team-invitation.tsx
export function TeamInvitationEmail({
  inviterName,
  teamName,
  inviteUrl,
}: {
  inviterName: string;
  teamName: string;
  inviteUrl: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>You've been invited to join {teamName}</Preview>
      <Body>
        <Container>
          <Heading>{inviterName} invited you to join {teamName}</Heading>
          <Button href={inviteUrl}>Accept Invitation</Button>
        </Container>
      </Body>
    </Html>
  );
}
```

---

## Resources

- **Documentation:** https://resend.com/docs
- **React Email:** https://react.email
- **Examples:** https://github.com/resendlabs/react-email-starter
- **Status Page:** https://status.resend.com

---

## Next Steps

1. Set up Resend account and get API key
2. Install dependencies
3. Create email templates
4. Implement sending logic
5. Set up webhooks for tracking
6. Configure custom domain
7. Test thoroughly

For more examples, see the template repositories in `/home/mibady/ai-coder-workspace/templates/`.
