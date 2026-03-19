#!/usr/bin/env node
/**
 * Seed Sanity with resources from the hardcoded parent/athlete resource pages.
 * Uses the Sanity HTTP API with the write token from .env.local.
 *
 * Usage: node scripts/seed-sanity-resources.mjs
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load env vars from apps/web/.env.local
const envPath = resolve(process.cwd(), 'apps/web/.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
  }
}

const PROJECT_ID = env.SANITY_API_PROJECT_ID || env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = env.SANITY_API_DATASET || env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const TOKEN = env.SANITY_API_WRITE_TOKEN;

if (!PROJECT_ID || !TOKEN) {
  console.error('Missing SANITY_API_PROJECT_ID or SANITY_API_WRITE_TOKEN in apps/web/.env.local');
  process.exit(1);
}

const resources = [
  // === PARENT RESOURCES ===
  {
    _type: 'resource',
    title: 'NCAA Compliance Guide',
    slug: { _type: 'slug', current: 'ncaa-compliance' },
    audience: 'parent',
    category: 'recruiting-rules',
    description: 'Essential recruiting rules every parent needs to know. Contact periods, visit rules, eligibility requirements, and financial rules — organized by risk level so you know what matters most.',
    icon: 'gavel',
    iconColor: 'bg-purple-500/20 text-purple-400',
    featured: true,
    readingTime: 15,
    publishedAt: '2026-01-15T00:00:00Z',
  },
  {
    _type: 'resource',
    title: 'Official Visit Question Playbook',
    slug: { _type: 'slug', current: 'visit-playbook' },
    audience: 'parent',
    category: 'recruiting-rules',
    description: '45 essential questions across 7 categories to ask during campus visits. Track your progress with an interactive checklist — your answers are saved automatically.',
    icon: 'checklist',
    iconColor: 'bg-green-500/20 text-green-400',
    featured: true,
    readingTime: 10,
    publishedAt: '2026-01-20T00:00:00Z',
  },
  {
    _type: 'resource',
    title: 'Scholarship & Financial Aid Guide',
    slug: { _type: 'slug', current: 'scholarship-guide' },
    audience: 'parent',
    category: 'financial-aid',
    description: '48 questions about scholarship offers, financial aid, hidden costs, and long-term planning — plus a cost calculator to estimate your family\'s out-of-pocket expenses.',
    icon: 'payments',
    iconColor: 'bg-yellow-500/20 text-yellow-400',
    featured: true,
    readingTime: 12,
    publishedAt: '2026-01-25T00:00:00Z',
  },
  {
    _type: 'resource',
    title: 'NCAA Eligibility Center',
    slug: { _type: 'slug', current: 'ncaa-eligibility-center' },
    audience: 'parent',
    category: 'eligibility',
    description: 'Register your child and track academic eligibility. Required for all Division I and Division II recruits.',
    icon: 'verified',
    iconColor: 'bg-blue-500/20 text-blue-400',
    featured: false,
    externalUrl: 'https://web3.ncaa.org/ecwr3/',
    publishedAt: '2026-02-01T00:00:00Z',
  },
  {
    _type: 'resource',
    title: 'NCAA Important Dates & Deadlines',
    slug: { _type: 'slug', current: 'ncaa-important-dates' },
    audience: 'parent',
    category: 'deadlines',
    description: 'Key deadlines for registration, eligibility center submissions, and recruiting periods throughout the year.',
    icon: 'event',
    iconColor: 'bg-orange-500/20 text-orange-400',
    featured: false,
    externalUrl: 'https://www.ncaa.org/sports/2015/2/5/important-dates.aspx',
    publishedAt: '2026-02-05T00:00:00Z',
  },
  {
    _type: 'resource',
    title: 'NCAA Helpful Links & Databases',
    slug: { _type: 'slug', current: 'ncaa-helpful-links' },
    audience: 'parent',
    category: 'recruiting-rules',
    description: 'External resources including scholarship databases, recruiting guides, and official NCAA student-athlete resources.',
    icon: 'link',
    iconColor: 'bg-teal-500/20 text-teal-400',
    featured: false,
    externalUrl: 'https://www.ncaa.org/student-athletes/future/helpful-links',
    publishedAt: '2026-02-10T00:00:00Z',
  },
  // === ATHLETE RESOURCES ===
  {
    _type: 'resource',
    title: 'Film & Highlights Guide',
    slug: { _type: 'slug', current: 'film-highlights-guide' },
    audience: 'athlete',
    category: 'recruiting-rules',
    description: 'How to create effective highlight reels that get coaches\' attention. Best practices for filming, editing, and sharing your game film.',
    icon: 'videocam',
    iconColor: 'bg-red-500/20 text-red-400',
    featured: true,
    readingTime: 8,
    publishedAt: '2026-02-15T00:00:00Z',
  },
  {
    _type: 'resource',
    title: 'Recruiting Timeline by Grade',
    slug: { _type: 'slug', current: 'recruiting-timeline' },
    audience: 'athlete',
    category: 'deadlines',
    description: 'What you should be doing each year from 9th grade through signing day. Key milestones, deadlines, and action items for every stage.',
    icon: 'timeline',
    iconColor: 'bg-indigo-500/20 text-indigo-400',
    featured: true,
    readingTime: 10,
    publishedAt: '2026-02-20T00:00:00Z',
  },
  {
    _type: 'resource',
    title: 'How to Contact College Coaches',
    slug: { _type: 'slug', current: 'contacting-coaches' },
    audience: 'athlete',
    category: 'recruiting-rules',
    description: 'Templates and tips for reaching out to college coaches. When to email, what to include, and how to follow up effectively.',
    icon: 'mail',
    iconColor: 'bg-sky-500/20 text-sky-400',
    featured: true,
    readingTime: 7,
    publishedAt: '2026-02-25T00:00:00Z',
  },
  {
    _type: 'resource',
    title: 'SAT/ACT & Academic Eligibility',
    slug: { _type: 'slug', current: 'academic-eligibility' },
    audience: 'athlete',
    category: 'academics',
    description: 'Understand the GPA and test score requirements for NCAA eligibility. Tips for balancing academics with athletics.',
    icon: 'school',
    iconColor: 'bg-emerald-500/20 text-emerald-400',
    featured: false,
    readingTime: 6,
    publishedAt: '2026-03-01T00:00:00Z',
  },
  {
    _type: 'resource',
    title: 'Off-Season Training Blueprint',
    slug: { _type: 'slug', current: 'offseason-training' },
    audience: 'athlete',
    category: 'training',
    description: 'Structured training programs, speed & agility drills, and nutrition fundamentals to maximize your off-season development.',
    icon: 'fitness_center',
    iconColor: 'bg-orange-500/20 text-orange-400',
    featured: false,
    readingTime: 12,
    publishedAt: '2026-03-05T00:00:00Z',
  },
  {
    _type: 'resource',
    title: 'Camp & Combine Preparation',
    slug: { _type: 'slug', current: 'camp-combine-prep' },
    audience: 'athlete',
    category: 'training',
    description: 'How to prepare for showcase events, what coaches look for at camps, and how to make the most of combine opportunities.',
    icon: 'sports',
    iconColor: 'bg-amber-500/20 text-amber-400',
    featured: false,
    readingTime: 8,
    publishedAt: '2026-03-10T00:00:00Z',
  },
];

async function seed() {
  const mutations = resources.map((doc) => ({
    createOrReplace: {
      ...doc,
      _id: `resource-${doc.slug.current}`,
    },
  }));

  const url = `https://${PROJECT_ID}.api.sanity.io/v2024-07-11/data/mutate/${DATASET}`;

  console.log(`Seeding ${resources.length} resources to Sanity (${PROJECT_ID}/${DATASET})...`);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ mutations }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Sanity API error (${res.status}):`, text);
    process.exit(1);
  }

  const result = await res.json();
  console.log(`✓ Seeded ${result.results.length} resources`);

  // Summary
  const parentCount = resources.filter(r => r.audience === 'parent').length;
  const athleteCount = resources.filter(r => r.audience === 'athlete').length;
  console.log(`  Parent: ${parentCount} | Athlete: ${athleteCount}`);
  console.log(`  Featured: ${resources.filter(r => r.featured).length}`);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
