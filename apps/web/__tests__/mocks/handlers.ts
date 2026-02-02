import { http, HttpResponse } from 'msw';
import { testUsers } from '../fixtures/users';

// Base URL for API routes
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const handlers = [
  // MCP Zone endpoints
  http.get(`${baseUrl}/api/mcp/zones`, () => {
    return HttpResponse.json({
      zones: [
        { id: 'WEST', name: 'West', color: '#8B5CF6', athleteCount: 4521, programCount: 312 },
        { id: 'SOUTHWEST', name: 'Southwest', color: '#F97316', athleteCount: 5234, programCount: 428 },
        { id: 'SOUTHEAST', name: 'Southeast', color: '#EF4444', athleteCount: 8921, programCount: 645 },
        { id: 'MIDWEST', name: 'Midwest', color: '#10B981', athleteCount: 6123, programCount: 534 },
        { id: 'NORTHEAST', name: 'Northeast', color: '#3B82F6', athleteCount: 3892, programCount: 287 },
        { id: 'PLAINS', name: 'Plains', color: '#D4AF37', athleteCount: 2451, programCount: 189 },
      ],
    });
  }),

  http.get(`${baseUrl}/api/mcp/zones/:zone`, ({ params }) => {
    const zone = params.zone as string;
    return HttpResponse.json({
      id: zone.toUpperCase(),
      name: zone.charAt(0).toUpperCase() + zone.slice(1),
      athleteCount: 4521,
      programCount: 312,
      topProspects: [],
      upcomingEvents: [],
    });
  }),

  // Athletes API
  http.get(`${baseUrl}/api/athletes`, ({ request }) => {
    const url = new URL(request.url);
    const position = url.searchParams.get('position');
    const zone = url.searchParams.get('zone');

    let athletes = Object.values(testUsers).filter(u => u.roles.includes('athlete'));

    if (position) {
      athletes = athletes.filter(a => a.athleteProfile?.position === position);
    }
    if (zone) {
      athletes = athletes.filter(a => a.zone === zone);
    }

    return HttpResponse.json({ athletes, total: athletes.length });
  }),

  http.get(`${baseUrl}/api/athletes/:id`, ({ params }) => {
    const id = params.id as string;
    const user = Object.values(testUsers).find(u => u.id === id || u.repmaxId === id);

    if (!user) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return HttpResponse.json(user);
  }),

  // Shortlists API
  http.get(`${baseUrl}/api/shortlists`, () => {
    return HttpResponse.json({
      shortlists: [
        { id: '1', name: 'Top Targets 2026', athleteCount: 12, createdAt: new Date().toISOString() },
        { id: '2', name: 'Watch List', athleteCount: 8, createdAt: new Date().toISOString() },
      ],
    });
  }),

  http.post(`${baseUrl}/api/shortlists`, async ({ request }) => {
    const body = await request.json() as { name: string };
    return HttpResponse.json({
      id: crypto.randomUUID(),
      name: body.name,
      athleteCount: 0,
      createdAt: new Date().toISOString(),
    });
  }),

  // Messages API
  http.get(`${baseUrl}/api/messages`, () => {
    return HttpResponse.json({
      threads: [
        {
          id: '1',
          participantIds: ['user1', 'user2'],
          subject: 'Recruiting Update',
          lastMessageAt: new Date().toISOString(),
          unreadCount: 2,
        },
      ],
    });
  }),

  // Profile views
  http.get(`${baseUrl}/api/analytics/profile-views`, () => {
    return HttpResponse.json({
      views: [
        { date: '2026-01-25', count: 12, recruiterViews: 8 },
        { date: '2026-01-26', count: 15, recruiterViews: 10 },
        { date: '2026-01-27', count: 8, recruiterViews: 5 },
      ],
      total: 35,
      recruiterTotal: 23,
    });
  }),

  // Calendar context
  http.get(`${baseUrl}/api/recruiting/calendar`, () => {
    return HttpResponse.json({
      currentPeriod: 'Contact Period',
      nextDeadline: {
        name: 'Early Signing Period',
        date: '2026-12-18',
        daysUntil: 320,
      },
      upcomingEvents: [
        { name: 'Spring Evaluation', date: '2026-04-15' },
        { name: 'Junior Day', date: '2026-03-01' },
      ],
    });
  }),

  // Stripe webhook (for integration tests)
  http.post(`${baseUrl}/api/webhooks/stripe`, async ({ request }) => {
    const body = await request.text();
    // Validate webhook signature would happen here
    return HttpResponse.json({ received: true });
  }),

  // File upload
  http.post(`${baseUrl}/api/upload`, async ({ request }) => {
    return HttpResponse.json({
      url: 'https://example.supabase.co/storage/v1/object/public/uploads/file.jpg',
      path: 'uploads/file.jpg',
    });
  }),
];

// Error handlers for testing error states
export const errorHandlers = {
  networkError: http.get(`${baseUrl}/api/athletes`, () => {
    return HttpResponse.error();
  }),

  serverError: http.get(`${baseUrl}/api/athletes`, () => {
    return HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }),

  unauthorized: http.get(`${baseUrl}/api/athletes`, () => {
    return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }),
};
