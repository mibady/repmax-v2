export type BillingMode = 'subscription' | 'payment' | 'free' | 'contact';

export type PricingPlan = {
  name: string;
  slug: string;
  annualSlug?: string;
  monthlyPrice: number;
  annualPrice?: number;
  billingMode: BillingMode;
  features: string[];
  description: string;
  ctaText: string;
  highlighted?: boolean;
  accentColor?: string;
  contactEmail?: string;
};

export type PricingCategory = {
  id: string;
  label: string;
  icon: string;
  hasToggle: boolean;
  plans: PricingPlan[];
  billingNote?: string;
};

export const pricingCategories: PricingCategory[] = [
  {
    id: 'athletes',
    label: 'Athletes',
    icon: 'sprint',
    hasToggle: true,
    billingNote: 'All plans billed monthly. Cancel anytime. Annual plans save ~17%.',
    plans: [
      {
        name: 'Basic',
        slug: 'athlete-basic',
        monthlyPrice: 0,
        billingMode: 'free',
        description: 'For the casual athlete',
        ctaText: 'Get Started Free',
        features: ['Basic Profile', 'Limited Visibility', 'View Offers'],
      },
      {
        name: 'Premium',
        slug: 'athlete-premium',
        annualSlug: 'athlete-premium-annual',
        monthlyPrice: 14.99,
        annualPrice: 149.90,
        billingMode: 'subscription',
        description: 'For the competitive athlete',
        ctaText: 'Go Premium',
        highlighted: true,
        accentColor: 'primary',
        features: [
          'Enhanced Profile',
          'Priority Visibility',
          'Video Highlights',
          'Direct Messaging',
          'Recruiting Analytics',
        ],
      },
      {
        name: 'Pro',
        slug: 'athlete-pro',
        annualSlug: 'athlete-pro-annual',
        monthlyPrice: 59.99,
        annualPrice: 599.90,
        billingMode: 'subscription',
        description: 'For the elite prospect',
        ctaText: 'Go Pro',
        accentColor: 'accent-green',
        features: [
          'Everything in Premium',
          'AI Film Analysis',
          'RepMax Score',
          'Featured Profile',
          'Verified Badge',
          'Priority Support',
        ],
      },
    ],
  },
  {
    id: 'recruiters',
    label: 'Recruiters',
    icon: 'person_search',
    hasToggle: true,
    billingNote: 'All plans billed monthly. Cancel anytime. Annual plans save ~17%.',
    plans: [
      {
        name: 'Free',
        slug: 'recruiter-free',
        monthlyPrice: 0,
        billingMode: 'free',
        description: 'For casual scouting',
        ctaText: 'Start Free',
        features: ['Basic Search', '10 Searches/Day', 'Public Profiles'],
      },
      {
        name: 'Pro',
        slug: 'recruiter-pro',
        annualSlug: 'recruiter-pro-annual',
        monthlyPrice: 99,
        annualPrice: 990,
        billingMode: 'subscription',
        description: 'For the serious recruiter',
        ctaText: 'Go Pro',
        highlighted: true,
        accentColor: 'primary',
        features: [
          'Full Database Access',
          'Unlimited Search',
          'Advanced Filters',
          'Export CSV',
          'Shortlists',
        ],
      },
      {
        name: 'Team',
        slug: 'recruiter-team',
        annualSlug: 'recruiter-team-annual',
        monthlyPrice: 299,
        annualPrice: 2990,
        billingMode: 'subscription',
        description: 'For the coaching staff',
        ctaText: 'Get Team',
        accentColor: 'accent-green',
        features: [
          'Everything in Pro',
          '5 Team Seats',
          'Shared Watchlists',
          'Collaboration Tools',
          'Priority Support',
        ],
      },
      {
        name: 'AI',
        slug: 'recruiter-ai',
        annualSlug: 'recruiter-ai-annual',
        monthlyPrice: 399,
        annualPrice: 3990,
        billingMode: 'subscription',
        description: 'For data-driven recruiting',
        ctaText: 'Get AI',
        accentColor: 'accent-purple',
        features: [
          'Everything in Team',
          'AI Prospect Matching',
          'Predictive Analytics',
          'Custom Reports',
          'API Access',
        ],
      },
      {
        name: 'Enterprise',
        slug: 'recruiter-enterprise',
        monthlyPrice: 0,
        billingMode: 'contact',
        description: 'For agencies & media',
        ctaText: 'Contact Sales',
        contactEmail: 'sales@repmax.io',
        features: [
          'Everything in AI',
          'Unlimited Seats',
          'SSO Integration',
          'Dedicated Account Manager',
          'Custom Reporting',
          'SLA',
        ],
      },
    ],
  },
  {
    id: 'events',
    label: 'Events',
    icon: 'event',
    hasToggle: false,
    billingNote: 'One-time purchase per event.',
    plans: [
      {
        name: 'Basic',
        slug: 'event-basic',
        monthlyPrice: 99,
        billingMode: 'payment',
        description: 'For single events',
        ctaText: 'Buy Now',
        features: [
          'Single Event Listing',
          'Basic Registration',
          'Attendee Management',
        ],
      },
      {
        name: 'Standard',
        slug: 'event-standard',
        monthlyPrice: 249,
        billingMode: 'payment',
        description: 'For multi-day events',
        ctaText: 'Buy Now',
        highlighted: true,
        accentColor: 'primary',
        features: [
          'Multi-Day Events',
          'Custom Registration Forms',
          'Payment Collection',
          'Email Notifications',
          'Analytics Dashboard',
        ],
      },
      {
        name: 'Premium',
        slug: 'event-premium',
        monthlyPrice: 499,
        billingMode: 'payment',
        description: 'For tournament organizers',
        ctaText: 'Buy Now',
        accentColor: 'accent-green',
        features: [
          'Everything in Standard',
          'Tournament Brackets',
          'Live Scoring',
          'Streaming Integration',
          'White-Label Branding',
          'Priority Support',
        ],
      },
    ],
  },
  {
    id: 'dashr',
    label: 'Dashr',
    icon: 'speed',
    hasToggle: false,
    billingNote: 'One-time purchases. No recurring charges.',
    plans: [
      {
        name: 'Standard',
        slug: 'dashr-standard',
        monthlyPrice: 149,
        billingMode: 'payment',
        description: 'Core timing system',
        ctaText: 'Buy Now',
        features: [
          'Dashr Timing System Access',
          'Basic Speed Analytics',
          '40-Yard Dash Timing',
          'Session Reports',
        ],
      },
      {
        name: 'AI',
        slug: 'dashr-ai',
        monthlyPrice: 199,
        billingMode: 'payment',
        description: 'AI-powered analysis',
        ctaText: 'Buy Now',
        highlighted: true,
        accentColor: 'primary',
        features: [
          'Everything in Standard',
          'AI Movement Analysis',
          'Biomechanics Insights',
          'Performance Predictions',
          'Video Overlay',
        ],
      },
      {
        name: 'Blueprint',
        slug: 'dashr-blueprint',
        monthlyPrice: 79.99,
        billingMode: 'payment',
        description: 'Custom training plan',
        ctaText: 'Buy Now',
        features: [
          'Custom Training Plan',
          'Position-Specific Drills',
          '8-Week Program',
          'Progress Tracking',
        ],
      },
      {
        name: 'Clinic',
        slug: 'dashr-clinic',
        monthlyPrice: 99,
        billingMode: 'payment',
        description: 'Group training session',
        ctaText: 'Buy Now',
        features: [
          'Group Training Session',
          'Professional Coaching',
          'Timed Combine Events',
          'Performance Certificate',
        ],
      },
      {
        name: 'Intensive',
        slug: 'dashr-intensive',
        monthlyPrice: 149,
        billingMode: 'payment',
        description: 'Full-day training camp',
        ctaText: 'Buy Now',
        accentColor: 'accent-green',
        features: [
          'Full-Day Training Camp',
          '1-on-1 Coaching',
          'Film Review Session',
          'Custom Speed Program',
          'Combine Prep',
        ],
      },
    ],
  },
];
