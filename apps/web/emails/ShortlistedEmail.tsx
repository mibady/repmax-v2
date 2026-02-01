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

interface ShortlistedEmailProps {
  athleteName: string;
  schoolName: string;
  schoolLogo?: string;
  season: string;
  position?: string;
  dashboardUrl: string;
}

export function ShortlistedEmail({
  athleteName = 'Athlete',
  schoolName = 'Arizona State',
  schoolLogo,
  season = '2025',
  position,
  dashboardUrl = 'https://repmax.io/dashboard',
}: ShortlistedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{schoolName} has added you to their prospect list!</Preview>
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
            <div style={starContainer}>
              <span style={starIcon}>⭐</span>
            </div>

            <Heading style={title}>You've Been Shortlisted!</Heading>

            <Text style={description}>
              <strong style={highlight}>{schoolName}</strong> has added you to
              their prospect list for the {season} season.
              {position && ` They're looking for talent at ${position}.`}
            </Text>

            {schoolLogo && (
              <div style={schoolLogoContainer}>
                <Img src={schoolLogo} alt={schoolName} style={schoolLogoImg} />
              </div>
            )}

            <div style={quoteBox}>
              <Text style={quoteText}>
                "This means a coach has specifically identified you as a
                potential recruit. Your profile and highlights caught their
                attention."
              </Text>
            </div>

            <Button style={primaryButton} href={dashboardUrl}>
              View Opportunity
            </Button>

            <div style={statsRow}>
              <div style={statItem}>
                <Text style={statValue}>12</Text>
                <Text style={statLabel}>Profile Views</Text>
              </div>
              <div style={statItem}>
                <Text style={statValue}>3</Text>
                <Text style={statLabel}>Shortlists</Text>
              </div>
              <div style={statItem}>
                <Text style={statValue}>Top 15%</Text>
                <Text style={statLabel}>In Zone</Text>
              </div>
            </div>
          </Section>

          {/* Footer */}
          <Hr style={divider} />
          <Section style={footer}>
            <Text style={footerText}>
              You're receiving this because you have shortlist notifications
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

const starContainer = {
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

const starIcon = {
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

const quoteBox = {
  backgroundColor: '#0a0a0a',
  borderLeft: '3px solid #d4af35',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
  textAlign: 'left' as const,
};

const quoteText = {
  color: '#9ca3af',
  fontSize: '14px',
  fontStyle: 'italic',
  lineHeight: '22px',
  margin: '0',
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

const statsRow = {
  display: 'flex',
  justifyContent: 'space-between',
  backgroundColor: '#0a0a0a',
  borderRadius: '12px',
  padding: '16px',
};

const statItem = {
  textAlign: 'center' as const,
  flex: '1',
};

const statValue = {
  color: '#d4af35',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 4px',
};

const statLabel = {
  color: '#6b7280',
  fontSize: '11px',
  margin: '0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
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

export default ShortlistedEmail;
