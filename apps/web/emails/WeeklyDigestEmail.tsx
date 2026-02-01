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

interface WeeklyDigestEmailProps {
  athleteName: string;
  dateRange: string;
  profileViews: number;
  profileViewsChange: number;
  shortlists: number;
  shortlistsChange: number;
  messages: number;
  messagesChange: number;
  zoneName: string;
  zoneActivityChange: number;
  topSchools: string[];
  dashboardUrl: string;
}

export function WeeklyDigestEmail({
  athleteName = 'Athlete',
  dateRange = 'Jan 22 - Jan 29, 2026',
  profileViews = 12,
  profileViewsChange = 15,
  shortlists = 2,
  shortlistsChange = 100,
  messages = 5,
  messagesChange = -10,
  zoneName = 'Southwest',
  zoneActivityChange = 23,
  topSchools = ['Texas A&M', 'Oklahoma State', 'TCU'],
  dashboardUrl = 'https://repmax.io/dashboard',
}: WeeklyDigestEmailProps) {
  const formatChange = (change: number) => {
    if (change > 0) return `↑ ${change}%`;
    if (change < 0) return `↓ ${Math.abs(change)}%`;
    return '→ 0%';
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return '#22c55e';
    if (change < 0) return '#ef4444';
    return '#6b7280';
  };

  return (
    <Html>
      <Head />
      <Preview>Your weekly recruiting summary for {dateRange}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>
              <span style={logoIcon}>◆</span> RepMax
            </Heading>
            <Text style={dateText}>{dateRange}</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={title}>Weekly Summary</Heading>
            <Text style={greeting}>Here's how your recruiting week shaped up, {athleteName}.</Text>

            {/* Stats Grid */}
            <div style={statsGrid}>
              <div style={statCard}>
                <Text style={statIcon}>👁️</Text>
                <Text style={statValue}>{profileViews}</Text>
                <Text style={statLabel}>Profile Views</Text>
                <Text style={{ ...changeText, color: getChangeColor(profileViewsChange) }}>
                  {formatChange(profileViewsChange)}
                </Text>
              </div>
              <div style={statCard}>
                <Text style={statIcon}>⭐</Text>
                <Text style={statValue}>{shortlists}</Text>
                <Text style={statLabel}>Shortlists</Text>
                <Text style={{ ...changeText, color: getChangeColor(shortlistsChange) }}>
                  {formatChange(shortlistsChange)}
                </Text>
              </div>
              <div style={statCard}>
                <Text style={statIcon}>💬</Text>
                <Text style={statValue}>{messages}</Text>
                <Text style={statLabel}>Messages</Text>
                <Text style={{ ...changeText, color: getChangeColor(messagesChange) }}>
                  {formatChange(messagesChange)}
                </Text>
              </div>
            </div>

            {/* Zone Update */}
            <div style={zoneSection}>
              <div style={zoneBadge}>
                <Text style={zoneLabel}>📍 {zoneName} Zone</Text>
              </div>
              <Text style={zoneDescription}>
                Recruiting activity in your zone is{' '}
                <strong style={{ color: '#22c55e' }}>up {zoneActivityChange}%</strong> this week.
              </Text>
              {topSchools.length > 0 && (
                <Text style={topSchoolsText}>
                  <strong>Most active:</strong> {topSchools.join(', ')}
                </Text>
              )}
            </div>

            <Button style={primaryButton} href={dashboardUrl}>
              View Full Analytics →
            </Button>
          </Section>

          {/* Tips Section */}
          <Section style={tipsSection}>
            <Heading style={tipsTitle}>💡 This Week's Tip</Heading>
            <Text style={tipText}>
              Coaches spend an average of 45 seconds on a profile. Make sure your
              highlight reel's best moments are in the first 30 seconds!
            </Text>
          </Section>

          {/* Footer */}
          <Hr style={divider} />
          <Section style={footer}>
            <Text style={footerText}>
              You're receiving this weekly digest because you have it enabled.
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
  textAlign: 'center' as const,
};

const logo = {
  color: '#d4af35',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 8px',
};

const logoIcon = {
  marginRight: '8px',
};

const dateText = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
};

const content = {
  backgroundColor: '#1a1a1a',
  borderRadius: '16px',
  padding: '32px',
};

const title = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 8px',
  textAlign: 'center' as const,
};

const greeting = {
  color: '#9ca3af',
  fontSize: '16px',
  margin: '0 0 24px',
  textAlign: 'center' as const,
};

const statsGrid = {
  display: 'flex',
  gap: '12px',
  marginBottom: '24px',
};

const statCard = {
  flex: '1',
  backgroundColor: '#0a0a0a',
  borderRadius: '12px',
  padding: '16px',
  textAlign: 'center' as const,
};

const statIcon = {
  fontSize: '24px',
  margin: '0 0 8px',
};

const statValue = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 4px',
};

const statLabel = {
  color: '#6b7280',
  fontSize: '11px',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const changeText = {
  fontSize: '12px',
  fontWeight: '600',
  margin: '0',
};

const zoneSection = {
  backgroundColor: '#0a0a0a',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '24px',
  textAlign: 'center' as const,
};

const zoneBadge = {
  display: 'inline-block',
  backgroundColor: 'rgba(212, 175, 53, 0.15)',
  borderRadius: '20px',
  padding: '6px 16px',
  marginBottom: '12px',
};

const zoneLabel = {
  color: '#d4af35',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
};

const zoneDescription = {
  color: '#9ca3af',
  fontSize: '14px',
  margin: '0 0 8px',
};

const topSchoolsText = {
  color: '#6b7280',
  fontSize: '13px',
  margin: '0',
};

const primaryButton = {
  backgroundColor: '#d4af35',
  borderRadius: '8px',
  color: '#201d12',
  display: 'block',
  fontSize: '16px',
  fontWeight: '600',
  padding: '14px 28px',
  textDecoration: 'none',
  textAlign: 'center' as const,
};

const tipsSection = {
  backgroundColor: '#1a1a1a',
  borderRadius: '16px',
  padding: '24px',
  marginTop: '16px',
};

const tipsTitle = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px',
};

const tipText = {
  color: '#9ca3af',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
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

export default WeeklyDigestEmail;
