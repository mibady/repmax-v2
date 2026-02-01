import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface DeadlineAlertEmailProps {
  athleteName: string;
  deadlineType: 'signing' | 'commitment' | 'camp' | 'verification';
  deadlineName: string;
  daysRemaining: number;
  deadlineDate: string;
  actionRequired: string;
  dashboardUrl: string;
}

export function DeadlineAlertEmail({
  athleteName = 'Athlete',
  deadlineType = 'signing',
  deadlineName = 'Early Signing Period',
  daysRemaining = 3,
  deadlineDate = 'December 20, 2025',
  actionRequired = 'Ensure your profile is locked and verified',
  dashboardUrl = 'https://repmax.io/dashboard',
}: DeadlineAlertEmailProps) {
  const getUrgencyColor = () => {
    if (daysRemaining <= 1) return '#ef4444';
    if (daysRemaining <= 3) return '#f59e0b';
    return '#d4af35';
  };

  const getUrgencyBg = () => {
    if (daysRemaining <= 1) return 'rgba(239, 68, 68, 0.15)';
    if (daysRemaining <= 3) return 'rgba(245, 158, 11, 0.15)';
    return 'rgba(212, 175, 53, 0.15)';
  };

  const urgencyColor = getUrgencyColor();
  const urgencyBg = getUrgencyBg();

  return (
    <Html>
      <Head />
      <Preview>{`⚠️ ${deadlineName} begins in ${daysRemaining} days`}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>
              <span style={logoIcon}>◆</span> RepMax
            </Heading>
          </Section>

          {/* Alert Banner */}
          <Section style={{ ...alertBanner, backgroundColor: urgencyBg }}>
            <Text style={{ ...alertIcon, color: urgencyColor }}>⚠️</Text>
            <Text style={{ ...alertText, color: urgencyColor }}>
              Deadline Alert
            </Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={title}>Time-Sensitive Action Required</Heading>

            <div style={{ ...countdownBox, borderColor: urgencyColor }}>
              <Text style={{ ...countdownNumber, color: urgencyColor }}>
                {daysRemaining}
              </Text>
              <Text style={countdownLabel}>
                {daysRemaining === 1 ? 'Day' : 'Days'} Remaining
              </Text>
            </div>

            <Text style={description}>
              Hey {athleteName}, the <strong style={{ color: '#ffffff' }}>{deadlineName}</strong> begins
              on <strong style={{ color: '#ffffff' }}>{deadlineDate}</strong>.
            </Text>

            <div style={actionBox}>
              <Text style={actionLabel}>What you need to do:</Text>
              <Text style={actionText}>{actionRequired}</Text>
            </div>

            <div style={checklistBox}>
              <Text style={checklistTitle}>Pre-deadline checklist:</Text>
              <div style={checklistItem}>
                <Text style={checkbox}>☐</Text>
                <Text style={checklistText}>Profile information is accurate</Text>
              </div>
              <div style={checklistItem}>
                <Text style={checkbox}>☐</Text>
                <Text style={checklistText}>Highlight reel is up-to-date</Text>
              </div>
              <div style={checklistItem}>
                <Text style={checkbox}>☐</Text>
                <Text style={checklistText}>Academic records verified</Text>
              </div>
              <div style={checklistItem}>
                <Text style={checkbox}>☐</Text>
                <Text style={checklistText}>Contact information current</Text>
              </div>
            </div>

            <div style={buttonGroup}>
              <Button style={primaryButton} href={`${dashboardUrl}/profile`}>
                Finalize Profile
              </Button>
            </div>

            <Link href={dashboardUrl} style={skipLink}>
              Skip verification for now
            </Link>
          </Section>

          {/* Warning */}
          <Section style={warningSection}>
            <Text style={warningText}>
              ⚡ <strong>Important:</strong> Missing deadlines can affect your
              recruiting eligibility. Take action today to ensure you don't miss
              this opportunity.
            </Text>
          </Section>

          {/* Footer */}
          <Hr style={divider} />
          <Section style={footer}>
            <Text style={footerText}>
              You're receiving this because you have deadline alerts enabled.
            </Text>
            <Link href={`${dashboardUrl}/settings/notifications`} style={footerLink}>
              Manage preferences
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#050505',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '560px',
};

const header = {
  paddingBottom: '24px',
};

const logo = {
  color: '#d4af35',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0',
};

const logoIcon = {
  marginRight: '8px',
};

const alertBanner = {
  borderRadius: '12px',
  padding: '12px 20px',
  marginBottom: '16px',
  textAlign: 'center' as const,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
};

const alertIcon = {
  fontSize: '20px',
  margin: '0',
};

const alertText = {
  fontSize: '14px',
  fontWeight: '700',
  margin: '0',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
};

const content = {
  backgroundColor: '#1a1a1a',
  borderRadius: '16px',
  padding: '32px',
  textAlign: 'center' as const,
};

const title = {
  color: '#ffffff',
  fontSize: '22px',
  fontWeight: '700',
  margin: '0 0 24px',
};

const countdownBox = {
  display: 'inline-block',
  border: '2px solid',
  borderRadius: '16px',
  padding: '20px 40px',
  marginBottom: '24px',
};

const countdownNumber = {
  fontSize: '48px',
  fontWeight: '800',
  margin: '0',
  lineHeight: '1',
};

const countdownLabel = {
  color: '#9ca3af',
  fontSize: '14px',
  margin: '4px 0 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
};

const description = {
  color: '#9ca3af',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 24px',
};

const actionBox = {
  backgroundColor: '#0a0a0a',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '24px',
  textAlign: 'left' as const,
};

const actionLabel = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const actionText = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0',
};

const checklistBox = {
  backgroundColor: '#0a0a0a',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '24px',
  textAlign: 'left' as const,
};

const checklistTitle = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 16px',
};

const checklistItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '12px',
};

const checkbox = {
  color: '#6b7280',
  fontSize: '16px',
  margin: '0',
};

const checklistText = {
  color: '#9ca3af',
  fontSize: '14px',
  margin: '0',
};

const buttonGroup = {
  marginBottom: '16px',
};

const primaryButton = {
  backgroundColor: '#d4af35',
  borderRadius: '8px',
  color: '#201d12',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  padding: '14px 28px',
  textDecoration: 'none',
  textAlign: 'center' as const,
};

const skipLink = {
  color: '#6b7280',
  fontSize: '14px',
  textDecoration: 'underline',
};

const warningSection = {
  backgroundColor: 'rgba(245, 158, 11, 0.1)',
  borderRadius: '12px',
  padding: '16px 20px',
  marginTop: '16px',
};

const warningText = {
  color: '#f59e0b',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
  textAlign: 'center' as const,
};

const divider = {
  borderColor: '#2a2a2d',
  margin: '32px 0',
};

const footer = {
  textAlign: 'center' as const,
};

const footerText = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '0 0 8px',
};

const footerLink = {
  color: '#d4af35',
  fontSize: '12px',
  textDecoration: 'underline',
};

export default DeadlineAlertEmail;
