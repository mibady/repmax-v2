'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const STRIPE_CHECKOUT_URL = 'https://buy.stripe.com/3cs5mN6KrgV66rK28j';
const IMG = '/images/combine-blueprint';

const trainingStations = [
  {
    icon: 'sprint',
    title: '40-Yard Dash',
    image: `${IMG}/40-dash.jpg`,
    description:
      'Master your stance, explode off the line, and maintain top-end speed. Focus on pushing off horizontally, keeping your chin tucked, and increasing stride frequency for faster ground coverage.',
  },
  {
    icon: 'jump',
    title: 'Vertical Jump',
    image: `${IMG}/vertical-jump.png`,
    description:
      'Measure your explosiveness and lower-body power. Learn proper loading mechanics, arm swing timing, and how to reach your maximum height on the Vertec device.',
  },
  {
    icon: 'fitness_center',
    title: 'Broad Jump',
    image: `${IMG}/broad-jump.jpg`,
    description:
      'Develop explosive horizontal power from a standstill. Master the arm swing, knee bend timing, and staggered landing technique that scouts look for.',
  },
  {
    icon: 'swap_horiz',
    title: '5-10-5 Shuttle',
    image: `${IMG}/5-10-5.jpg`,
    description:
      'The Pro Agility Test measures lateral quickness, explosiveness, and body control. Sprint 5 yards, touch, sprint 10 back, touch, and finish through — all about sharp cuts and direction changes.',
  },
  {
    icon: 'turn_right',
    title: 'L-Drill (3-Cone)',
    image: `${IMG}/l-drill.jpg`,
    description:
      'Assess your ability to accelerate, decelerate, and change direction at speed. Navigate the L-shaped cone pattern with sharp turns while maintaining balance and control.',
  },
  {
    icon: 'psychology',
    title: 'Mental Preparation',
    image: null,
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

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Resources', href: '/resources' },
  { label: 'Blog', href: '/blog' },
  { label: 'Login', href: '/login' },
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
            {navLinks.map((link) => (
              <Link
                key={link.href}
                className="text-sm font-medium text-text-grey hover:text-white transition-colors"
                href={link.href}
              >
                {link.label}
              </Link>
            ))}
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
            {navLinks.map((link) => (
              <Link
                key={link.href}
                className="text-lg font-medium text-text-grey hover:text-white"
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
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

      {/* Hero Section with Video Background */}
      <section className="relative pt-20 overflow-hidden">
        {/* Video background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover opacity-20"
          >
            <source src={`${IMG}/Combine-1080-Vertical-V1-1920.mp4`} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-background-dark/60 via-background-dark/80 to-background-dark" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 text-center">
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
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
              <span className="material-symbols-outlined text-primary text-2xl">location_on</span>
              <div className="text-left">
                <p className="text-xs text-text-grey">Location</p>
                <p className="text-sm font-semibold text-white">Western High School</p>
                <p className="text-xs text-text-grey">Anaheim, CA</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
              <span className="material-symbols-outlined text-primary text-2xl">schedule</span>
              <div className="text-left">
                <p className="text-xs text-text-grey">Duration</p>
                <p className="text-sm font-semibold text-white">3 Hours</p>
                <p className="text-xs text-text-grey">Intensive training</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
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
          <div className="relative flex justify-center">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] max-w-xs">
              <Image
                src={`${IMG}/Demo-by-Coach-200x300.jpg`}
                alt="Coach demonstrating combine technique"
                width={200}
                height={300}
                className="w-full h-auto"
                unoptimized
              />
            </div>
            <div className="absolute -bottom-4 -right-4 lg:right-12 rounded-xl border border-primary/30 bg-background-dark/90 backdrop-blur-sm p-4">
              <p className="text-xs text-text-grey">Expert-led</p>
              <p className="text-sm font-bold text-primary">1-on-1 Coaching</p>
            </div>
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 pb-12">
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-white/[0.03]">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 sm:w-2/5">
            <Image
              src={`${IMG}/Black-and-Orange-Modern-Robotic-Showcase-Linkedin-Post-3-600x600.png`}
              alt="RepMax Combine Blueprint promotional graphic"
              width={600}
              height={600}
              className="h-full w-full object-contain object-right"
              unoptimized
            />
          </div>
          <div className="relative z-10 px-8 sm:px-12 py-12 sm:py-16 max-w-lg">
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              Don&apos;t Leave Your <span className="text-primary">Performance</span> to Chance
            </h3>
            <p className="mt-3 text-sm text-text-grey">
              Every rep, every drill, every technique — designed to prepare you for the moment that matters most.
            </p>
            <a
              href={STRIPE_CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-bold text-[#050505] transition-all hover:bg-primary-hover hover:scale-105"
            >
              <span className="material-symbols-outlined text-base">confirmation_number</span>
              Secure Your Spot
            </a>
          </div>
        </div>
      </section>

      {/* Video Showcase */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            See the <span className="text-primary">Blueprint</span> in Action
          </h2>
          <p className="mt-4 text-text-grey max-w-2xl mx-auto">
            Watch what a Combine Blueprint session looks like — real athletes, real coaching, real results.
          </p>
        </div>
        <div className="relative mx-auto max-w-3xl rounded-2xl border border-white/10 overflow-hidden bg-black">
          <video
            controls
            playsInline
            preload="metadata"
            poster={`${IMG}/header.png`}
            className="w-full aspect-[9/16] sm:aspect-video object-contain bg-black"
          >
            <source src={`${IMG}/Combine-1080-Vertical-V1-1920.mp4`} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
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
                className="group rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden transition-all hover:border-primary/30 hover:bg-primary/5"
              >
                {station.image ? (
                  <div className="relative h-44 overflow-hidden bg-black/40 flex items-center justify-center">
                    <Image
                      src={station.image}
                      alt={station.title}
                      width={300}
                      height={250}
                      className="max-h-full w-auto object-contain transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                    />
                    <div className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 backdrop-blur-sm text-primary">
                      <span className="material-symbols-outlined text-xl">{station.icon}</span>
                    </div>
                  </div>
                ) : (
                  <div className="relative h-44 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-6xl opacity-30">{station.icon}</span>
                    <div className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary">
                      <span className="material-symbols-outlined text-xl">{station.icon}</span>
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">{station.title}</h3>
                  <p className="text-sm text-text-grey leading-relaxed">{station.description}</p>
                </div>
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
            <Link href="/" className="flex items-center gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/20 text-primary">
                <span className="material-symbols-outlined">sports_football</span>
              </div>
              <span className="text-sm font-bold text-white">REPMAX</span>
            </Link>
            <nav className="flex flex-wrap items-center justify-center gap-6">
              <Link className="text-xs text-text-grey hover:text-white transition-colors" href="/">Home</Link>
              <Link className="text-xs text-text-grey hover:text-white transition-colors" href="/pricing">Pricing</Link>
              <Link className="text-xs text-text-grey hover:text-white transition-colors" href="/resources">Resources</Link>
              <Link className="text-xs text-text-grey hover:text-white transition-colors" href="/blog">Blog</Link>
              <Link className="text-xs text-text-grey hover:text-white transition-colors" href="/privacy">Privacy</Link>
              <Link className="text-xs text-text-grey hover:text-white transition-colors" href="/terms">Terms</Link>
              <Link className="text-xs text-text-grey hover:text-white transition-colors" href="/support">Support</Link>
            </nav>
            <p className="text-xs text-text-grey">&copy; {new Date().getFullYear()} RepMax. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
