import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface ProfileViewedEmailProps {
  athleteName: string;
  schoolName: string;
  schoolLogo?: string;
  viewerRole?: string;
  viewDate: string;
  dashboardUrl: string;
}

export function ProfileViewedEmail({
  athleteName = 'Athlete',
  schoolName = 'Texas Christian University',
  schoolLogo,
  viewerRole = 'Recruiting Coordinator',
  viewDate = 'Today at 2:45 PM',
  dashboardUrl = 'https://repmax.io/dashboard',
}: ProfileViewedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>A recruiter from {schoolName} viewed your profile</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>
              <span style={logoIcon}>◆</span> RepMax
            </Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            <div style={iconContainer}>
              <span style={eyeIcon}>👁️</span>
            </div>

            <Heading style={title}>Someone's Watching</Heading>

            <Text style={description}>
              Hey {athleteName}, a recruiter from{' '}
              <strong style={highlight}>{schoolName}</strong> just viewed your
              complete profile stats and highlight reel.
            </Text>

            {schoolLogo && (
              <div style={schoolLogoContainer}>
                <Img src={schoolLogo} alt={schoolName} style={schoolLogoImg} />
              </div>
            )}

            <div style={detailsBox}>
              <Text style={detailLabel}>Viewed by</Text>
              <Text style={detailValue}>{viewerRole}</Text>
              <Text style={detailLabel}>When</Text>
              <Text style={detailValue}>{viewDate}</Text>
            </div>

            <Button style={primaryButton} href={dashboardUrl}>
              See Who's Looking
            </Button>

            <Text style={tipText}>
              💡 <strong>Pro Tip:</strong> Keep your highlight reel updated to
              make a strong first impression.
            </Text>
          </Section>

          {/* Footer */}
          <Hr style={divider} />
          <Section style={footer}>
            <Text style={footerText}>
              You're receiving this because you have profile view notifications
              enabled.
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

const content = {
  backgroundColor: '#1a1a1a',
  borderRadius: '16px',
  padding: '32px',
  textAlign: 'center' as const,
};

const iconContainer = {
  width: '64px',
  height: '64px',
  backgroundColor: 'rgba(212, 175, 53, 0.15)',
  borderRadius: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 24px',
  fontSize: '28px',
};

const eyeIcon = {
  fontSize: '28px',
};

const title = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 16px',
};

const description = {
  color: '#9ca3af',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 24px',
};

const highlight = {
  color: '#d4af35',
};

const schoolLogoContainer = {
  margin: '0 0 24px',
};

const schoolLogoImg = {
  maxWidth: '120px',
  height: 'auto',
};

const detailsBox = {
  backgroundColor: '#0a0a0a',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '24px',
  textAlign: 'left' as const,
};

const detailLabel = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '0 0 4px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const detailValue = {
  color: '#ffffff',
  fontSize: '14px',
  margin: '0 0 12px',
  fontWeight: '500',
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
  marginBottom: '24px',
};

const tipText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
  textAlign: 'left' as const,
  backgroundColor: '#0a0a0a',
  padding: '12px 16px',
  borderRadius: '8px',
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

export default ProfileViewedEmail;
