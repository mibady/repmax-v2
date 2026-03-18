'use client';

import Link from 'next/link';
import { useState } from 'react';

const STRIPE_CHECKOUT_URL = 'https://buy.stripe.com/3cs5mN6KrgV66rK28j';

const trainingStations = [
  {
    icon: 'sprint',
    title: '40-Yard Dash',
    description:
      'Master your stance, explode off the line, and maintain top-end speed. Focus on pushing off horizontally, keeping your chin tucked, and increasing stride frequency for faster ground coverage.',
  },
  {
    icon: 'jump',
    title: 'Vertical Jump',
    description:
      'Measure your explosiveness and lower-body power. Learn proper loading mechanics, arm swing timing, and how to reach your maximum height on the Vertec device.',
  },
  {
    icon: 'fitness_center',
    title: 'Broad Jump',
    description:
      'Develop explosive horizontal power from a standstill. Master the arm swing, knee bend timing, and staggered landing technique that scouts look for.',
  },
  {
    icon: 'swap_horiz',
    title: '5-10-5 Shuttle',
    description:
      'The Pro Agility Test measures lateral quickness, explosiveness, and body control. Sprint 5 yards, touch, sprint 10 back, touch, and finish through — all about sharp cuts and direction changes.',
  },
  {
    icon: 'turn_right',
    title: 'L-Drill (3-Cone)',
    description:
      'Assess your ability to accelerate, decelerate, and change direction at speed. Navigate the L-shaped cone pattern with sharp turns while maintaining balance and control.',
  },
  {
    icon: 'psychology',
    title: 'Mental Preparation',
    description:
      'Learn the mental aspects of combine performance — how to manage pressure, visualize success, and maintain focus when scouts and coaches are evaluating you.',
  },
];

const benefits = [
  { icon: 'timer', text: 'Professional combine timing' },
  { icon: 'videocam', text: 'Video analysis of your form' },
  { icon: 'person', text: 'Individual technique coaching' },
  { icon: 'assignment', text: 'Pre-camp preparation player profile' },
  { icon: 'rate_review', text: 'Post-camp performance review' },
];

export default function CampSeriesPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background-dark/90 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/20 text-primary">
              <span className="material-symbols-outlined">sports_football</span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white">REPMAX</h2>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link className="text-sm font-medium text-text-grey hover:text-white transition-colors" href="/#features">Features</Link>
            <Link className="text-sm font-medium text-text-grey hover:text-white transition-colors" href="/pricing">Pricing</Link>
            <Link className="text-sm font-medium text-text-grey hover:text-white transition-colors" href="/resources">Resources</Link>
            <Link className="text-sm font-medium text-text-grey hover:text-white transition-colors" href="/blog">Blog</Link>
            <Link className="text-sm font-medium text-text-grey hover:text-white transition-colors" href="/login">Login</Link>
          </nav>
          <a
            href={STRIPE_CHECKOUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-[#050505] transition-all hover:bg-primary-hover hover:scale-105"
          >
            Register Now
          </a>
          <button className="flex md:hidden text-white" onClick={() => setMobileMenuOpen(true)}>
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-background-dark/95 backdrop-blur-md md:hidden">
          <div className="flex items-center justify-between px-6 h-20">
            <div className="flex items-center gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/20 text-primary">
                <span className="material-symbols-outlined">sports_football</span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-white">REPMAX</h2>
            </div>
            <button className="text-white" onClick={() => setMobileMenuOpen(false)}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <nav className="flex flex-col gap-6 px-6 pt-8">
            <Link className="text-lg font-medium text-text-grey hover:text-white" href="/#features" onClick={() => setMobileMenuOpen(false)}>Features</Link>
            <Link className="text-lg font-medium text-text-grey hover:text-white" href="/pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
            <Link className="text-lg font-medium text-text-grey hover:text-white" href="/resources" onClick={() => setMobileMenuOpen(false)}>Resources</Link>
            <Link className="text-lg font-medium text-text-grey hover:text-white" href="/blog" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
            <Link className="text-lg font-medium text-text-grey hover:text-white" href="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
            <a
              href={STRIPE_CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-bold text-[#050505]"
            >
              Register Now
            </a>
          </nav>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 mb-8">
            <span className="material-symbols-outlined text-primary text-base">event</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">RepMax Camp Series</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-white leading-tight">
            THE COMBINE<br />
            <span className="text-primary">BLUEPRINT</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-text-grey max-w-2xl mx-auto italic">
            &ldquo;Invest in yourself BEFORE your next college camp&rdquo;
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={STRIPE_CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-md bg-primary px-8 py-3.5 text-base font-bold text-[#050505] transition-all hover:bg-primary-hover hover:scale-105"
            >
              <span className="material-symbols-outlined text-lg">confirmation_number</span>
              Register Now
            </a>
            <a
              href="#training-stations"
              className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-8 py-3.5 text-base font-medium text-white transition-all hover:bg-white/10"
            >
              <span className="material-symbols-outlined text-lg">arrow_downward</span>
              See What You&apos;ll Learn
            </a>
          </div>

          {/* Camp Details Bar */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <span className="material-symbols-outlined text-primary text-2xl">location_on</span>
              <div className="text-left">
                <p className="text-xs text-text-grey">Location</p>
                <p className="text-sm font-semibold text-white">Western High School</p>
                <p className="text-xs text-text-grey">Anaheim, CA</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <span className="material-symbols-outlined text-primary text-2xl">schedule</span>
              <div className="text-left">
                <p className="text-xs text-text-grey">Duration</p>
                <p className="text-sm font-semibold text-white">3 Hours</p>
                <p className="text-xs text-text-grey">Intensive training</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <span className="material-symbols-outlined text-primary text-2xl">groups</span>
              <div className="text-left">
                <p className="text-xs text-text-grey">Availability</p>
                <p className="text-sm font-semibold text-white">Limited Spots</p>
                <p className="text-xs text-text-grey">Per session</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why This Camp Matters */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Building Champions Through <span className="text-primary">Preparation</span>
            </h2>
            <p className="mt-6 text-text-grey leading-relaxed">
              Every year, thousands of talented athletes miss their opportunity to shine at major combines, showcases, and college camps &mdash; not because they lack ability, but because they weren&apos;t prepared for the testing environment. The Combine Blueprint changes that.
            </p>
            <p className="mt-4 text-text-grey leading-relaxed">
              High school athletes often get one chance to make an impression. Whether it&apos;s at The Opening, Rivals Camp Series, Under Armour Camp, or a university&apos;s prospect camp, your testing numbers can open doors. We teach you how to maximize these moments through proper preparation, technique refinement, and mental preparation.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                'Building testing confidence through proper technique and repetition',
                'Understanding the mental aspects of combine performance',
                'Mastering the specific movements scouts and coaches evaluate',
                'Learning how to perform under pressure',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-lg mt-0.5">check_circle</span>
                  <span className="text-sm text-text-grey">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-white/10 flex items-center justify-center">
              <div className="text-center px-8">
                <span className="material-symbols-outlined text-primary text-7xl">emoji_events</span>
                <p className="mt-4 text-2xl font-bold text-white">Your Journey to</p>
                <p className="text-2xl font-bold text-primary">Excellence</p>
                <p className="mt-3 text-sm text-text-grey">One chance. Be prepared.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Training Stations */}
      <section id="training-stations" className="bg-white/[0.02] border-y border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Training <span className="text-primary">Stations</span>
            </h2>
            <p className="mt-4 text-text-grey max-w-2xl mx-auto">
              Master the exact drills and techniques used at NFL Combines, college prospect days, and elite showcases.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainingStations.map((station) => (
              <div
                key={station.title}
                className="group rounded-xl border border-white/10 bg-white/[0.03] p-6 transition-all hover:border-primary/30 hover:bg-primary/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4 transition-colors group-hover:bg-primary/20">
                  <span className="material-symbols-outlined text-2xl">{station.icon}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{station.title}</h3>
                <p className="text-sm text-text-grey leading-relaxed">{station.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You'll Receive */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            What You&apos;ll <span className="text-primary">Receive</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {benefits.map((benefit) => (
            <div
              key={benefit.text}
              className="flex flex-col items-center text-center rounded-xl border border-white/10 bg-white/[0.03] p-6"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                <span className="material-symbols-outlined text-2xl">{benefit.icon}</span>
              </div>
              <p className="text-sm font-medium text-white">{benefit.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-white/5 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="mx-auto max-w-3xl px-6 py-20 lg:px-8 text-center">
          <span className="material-symbols-outlined text-primary text-5xl mb-6">rocket_launch</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Ready to <span className="text-primary">Dominate</span> Your Next Camp?
          </h2>
          <p className="mt-4 text-text-grey max-w-xl mx-auto">
            Limited spots available per session. Secure your place and get the preparation edge that separates good athletes from great ones.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={STRIPE_CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-md bg-primary px-10 py-4 text-base font-bold text-[#050505] transition-all hover:bg-primary-hover hover:scale-105"
            >
              <span className="material-symbols-outlined text-lg">confirmation_number</span>
              Pay Now &amp; Register
            </a>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-text-grey">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">location_on</span>
              Western High School, Anaheim CA
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">schedule</span>
              3-Hour Session
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-background-dark">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/20 text-primary">
                <span className="material-symbols-outlined">sports_football</span>
              </div>
              <span className="text-sm font-bold text-white">REPMAX</span>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-6">
              <Link className="text-xs text-text-grey hover:text-white transition-colors" href="/">Home</Link>
              <Link className="text-xs text-text-grey hover:text-white transition-colors" href="/pricing">Pricing</Link>
              <Link className="text-xs text-text-grey hover:text-white transition-colors" href="/resources">Resources</Link>
              <Link className="text-xs text-text-grey hover:text-white transition-colors" href="/blog">Blog</Link>
              <Link className="text-xs text-text-grey hover:text-white transition-colors" href="/privacy">Privacy</Link>
              <Link className="text-xs text-text-grey hover:text-white transition-colors" href="/terms">Terms</Link>
            </nav>
            <p className="text-xs text-text-grey">&copy; {new Date().getFullYear()} RepMax. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
