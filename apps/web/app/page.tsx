'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState(0);

  const accordionItems = [
    { title: 'Advanced Filtering', body: 'Filter thousands of athletes by verified stats, GPA, location, and AI-predicted potential rating. Find exactly who fits your system.' },
    { title: 'Team Collaboration', body: 'Share watchlists, assign evaluations, and coordinate recruiting efforts across your entire coaching staff in real-time.' },
    { title: 'Pipeline Management', body: 'Track prospects from initial contact through commitment with customizable stages, automated follow-ups, and deadline alerts.' },
  ];

  return (
    <>
      {/*  Sticky Navigation  */}
<header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background-dark/90 backdrop-blur-md">
<div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
<div className="flex items-center gap-4">
<div className="flex h-8 w-8 items-center justify-center rounded bg-primary/20 text-primary">
<span className="material-symbols-outlined">sports_football</span>
</div>
<h2 className="text-xl font-black tracking-tight text-white">REPMAX</h2>
</div>
<nav className="hidden md:flex items-center gap-8">
<Link className="text-sm font-medium text-text-grey hover:text-white transition-colors" href="#features">Features</Link>
<Link className="text-sm font-medium text-text-grey hover:text-white transition-colors" href="#how-it-works">How it Works</Link>
<Link className="text-sm font-medium text-text-grey hover:text-white transition-colors" href="/pricing">Pricing</Link>
<Link className="text-sm font-medium text-text-grey hover:text-white transition-colors" href="/resources">Resources</Link>
<Link className="text-sm font-medium text-text-grey hover:text-white transition-colors" href="/blog">Blog</Link>
<Link className="text-sm font-medium text-primary hover:text-primary-hover transition-colors" href="/repmax-camp-series">Camp Series</Link>
<Link className="text-sm font-medium text-text-grey hover:text-white transition-colors" href="/login">Login</Link>
</nav>
<Link href="/signup" className="hidden md:flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-[#050505] transition-all hover:bg-primary-hover hover:scale-105">
                Get Your Free RepMax ID
            </Link>
<button className="flex md:hidden text-white" onClick={() => setMobileMenuOpen(true)}>
<span className="material-symbols-outlined">menu</span>
</button>
</div>
</header>
{mobileMenuOpen && (
  <div className="fixed inset-0 z-[60] bg-background-dark/95 backdrop-blur-md md:hidden">
    <div className="flex items-center justify-between px-6 h-20">
      <div className="flex items-center gap-4">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/20 text-primary">
          <span className="material-symbols-outlined">sports_football</span>
        </div>
        <h2 className="text-xl font-black tracking-tight text-white">REPMAX</h2>
      </div>
      <button onClick={() => setMobileMenuOpen(false)} className="text-white">
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>
    <nav className="flex flex-col items-center gap-8 pt-12">
      <Link className="text-lg font-medium text-white" href="#features" onClick={() => setMobileMenuOpen(false)}>Features</Link>
      <Link className="text-lg font-medium text-white" href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How it Works</Link>
      <Link className="text-lg font-medium text-white" href="/pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
      <Link className="text-lg font-medium text-white" href="/resources" onClick={() => setMobileMenuOpen(false)}>Resources</Link>
      <Link className="text-lg font-medium text-white" href="/blog" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
      <Link className="text-lg font-medium text-primary" href="/repmax-camp-series" onClick={() => setMobileMenuOpen(false)}>Camp Series</Link>
      <Link className="text-lg font-medium text-white" href="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
      <Link href="/signup" className="mt-4 rounded-md bg-primary px-8 py-3 text-base font-bold text-[#050505]" onClick={() => setMobileMenuOpen(false)}>Get Your Free RepMax ID</Link>
    </nav>
  </div>
)}
{/*  Hero Section  */}
<section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
{/*  Background decorative elements  */}
<div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-20">
<div className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px]"></div>
<div className="absolute bottom-20 right-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px]"></div>
</div>
<div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
<div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
{/*  Hero Content  */}
<div className="flex flex-col gap-8 flex-1 text-center lg:text-left">
<div className="flex justify-center lg:justify-start">
<div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
<span className="relative flex h-2 w-2">
<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
<span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
</span>
                            The Recruiting Intelligence Platform
                        </div>
</div>
<h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black leading-[1.1] tracking-tight text-white">
                        Every Rep Counts. <br />
<span className="text-gradient-gold">Every Athlete Seen.</span>
</h1>
<p className="text-lg text-text-grey max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed">
                        The ultimate data-driven platform connecting elite talent with top-tier programs through verified analytics and AI-driven matchmaking.
                    </p>
<div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
<Link href="/signup" className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-md bg-primary px-8 py-3.5 text-base font-bold text-[#050505] transition-all hover:bg-primary-hover shadow-[0_0_20px_rgba(212,175,53,0.3)]">
                            Get Your Free RepMax ID
                        </Link>
<button onClick={() => router.push('/login')} className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 px-8 py-3.5 text-base font-medium text-white transition-all hover:bg-white/10">
<span className="material-symbols-outlined text-[20px]">play_circle</span>
                            View Demo
                        </button>
</div>
</div>
{/*  Hero Visual - Mock Card  */}
<div className="flex-1 w-full max-w-[440px] perspective-1000 group">
<div className="relative transform transition-transform duration-500 hover:rotate-y-6 hover:rotate-x-6">
{/*  Glow effect behind card  */}
<div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary to-primary/40 opacity-30 blur-lg transition duration-500 group-hover:opacity-50"></div>
{/*  Card Container  */}
<div className="relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A] shadow-2xl">
{/*  Image Header  */}
<div className="relative h-64 w-full overflow-hidden">
<div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent z-10"></div>
<Image src="/images/marketing/hero-athlete.png" alt="Athletic football player in action pose holding a ball with intense focus" className="object-cover" fill sizes="(max-width: 440px) 100vw, 440px" />
<div className="absolute top-4 right-4 z-20 flex items-center gap-1 rounded bg-black/60 px-2 py-1 backdrop-blur-sm border border-primary/30">
<span className="text-xs font-bold text-primary">ELITE 11</span>
</div>
</div>
{/*  Card Content  */}
<div className="relative z-20 -mt-12 flex flex-col p-6 pt-0">
<div className="flex justify-between items-end mb-4">
<div>
<h3 className="text-2xl font-bold text-white">Marcus J.</h3>
<p className="text-sm text-text-grey">Quarterback • Class of &apos;25</p>
</div>
<div className="h-12 w-12 rounded-full border-2 border-primary bg-surface-dark flex items-center justify-center">
<span className="font-bold text-white stats-font text-lg">98</span>
</div>
</div>
<div className="grid grid-cols-2 gap-3 mb-6">
<div className="rounded bg-white/5 p-3 border border-white/5">
<p className="text-[10px] uppercase tracking-wider text-text-grey mb-1">40-Yard Dash</p>
<p className="text-xl font-bold text-primary stats-font">4.42s</p>
</div>
<div className="rounded bg-white/5 p-3 border border-white/5">
<p className="text-[10px] uppercase tracking-wider text-text-grey mb-1">GPA</p>
<p className="text-xl font-bold text-white stats-font">3.8</p>
</div>
<div className="rounded bg-white/5 p-3 border border-white/5">
<p className="text-[10px] uppercase tracking-wider text-text-grey mb-1">Vertical</p>
<p className="text-xl font-bold text-white stats-font">36&quot;</p>
</div>
<div className="rounded bg-white/5 p-3 border border-white/5">
<p className="text-[10px] uppercase tracking-wider text-text-grey mb-1">Offers</p>
<p className="text-xl font-bold text-white stats-font">12</p>
</div>
</div>
<Link href="/signup" className="w-full rounded bg-primary py-2 text-sm font-bold text-black hover:bg-primary-hover text-center block">
                                    View Full Profile
                                </Link>
</div>
</div>
</div>
</div>
</div>
</div>
</section>
{/*  Glass Stats Bar  */}
<section className="border-y border-white/5 bg-white/[0.02] backdrop-blur-sm relative z-20">
<div className="mx-auto max-w-7xl px-6 lg:px-8 py-10">
<div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
<div className="flex flex-col items-center gap-2 p-2">
<span className="text-4xl lg:text-5xl font-bold text-primary stats-font">500+</span>
<span className="text-sm font-medium uppercase tracking-wider text-text-grey">Colleges Active</span>
</div>
<div className="flex flex-col items-center gap-2 p-2">
<span className="text-4xl lg:text-5xl font-bold text-primary stats-font">10k+</span>
<span className="text-sm font-medium uppercase tracking-wider text-text-grey">Athletes Verified</span>
</div>
<div className="flex flex-col items-center gap-2 p-2">
<span className="text-4xl lg:text-5xl font-bold text-primary stats-font">98%</span>
<span className="text-sm font-medium uppercase tracking-wider text-text-grey">Match Success Rate</span>
</div>
</div>
</div>
</section>
{/*  Problem Section  */}
<section className="py-24 bg-surface-dark relative">
<div className="mx-auto max-w-7xl px-6 lg:px-8">
<div className="text-center mb-16">
<h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-4">The Recruiting Gap</h2>
<p className="text-lg text-text-grey max-w-2xl mx-auto">The traditional system is broken. Elite athletes are missing opportunities while coaches waste time on unverified data.</p>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
{/*  Card 1  */}
<div className="group relative overflow-hidden rounded-md bg-[#161616] p-8 transition-all hover:bg-[#1c1c1c] border border-white/5 hover:border-white/10">
<div className="mb-4 text-4xl">📉</div>
<h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">Overlooked Talent</h3>
<p className="text-text-grey leading-relaxed">Thousands of qualified athletes fall through the cracks every year simply because they lack the right exposure.</p>
</div>
{/*  Card 2  */}
<div className="group relative overflow-hidden rounded-md bg-[#161616] p-8 transition-all hover:bg-[#1c1c1c] border border-white/5 hover:border-white/10">
<div className="mb-4 text-4xl">🕰️</div>
<h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">Wasted Time</h3>
<p className="text-text-grey leading-relaxed">Coaches spend countless hours sifting through unverified highlights and disorganized player data.</p>
</div>
{/*  Card 3  */}
<div className="group relative overflow-hidden rounded-md bg-[#161616] p-8 transition-all hover:bg-[#1c1c1c] border border-white/5 hover:border-white/10">
<div className="mb-4 text-4xl">💸</div>
<h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">Inaccurate Data</h3>
<p className="text-text-grey leading-relaxed">Recruiting decisions are often based on self-reported, outdated, or completely incorrect statistics.</p>
</div>
</div>
</div>
</section>
{/*  Solution Section  */}
<section id="features" className="py-24 bg-background-dark">
<div className="mx-auto max-w-7xl px-6 lg:px-8">
<div className="flex flex-col lg:flex-row gap-16 items-start">
<div className="flex-1 lg:sticky lg:top-24">
<div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-primary mb-6">
                        Why RepMax?
                    </div>
<h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-6">Intelligence for the modern game.</h2>
<p className="text-lg text-text-grey mb-8">RepMax provides a unified platform where data integrity meets video analysis. We don&apos;t just host highlights; we verify potential.</p>
<ul className="space-y-4 mb-8">
<li className="flex items-center gap-3 text-white">
<span className="material-symbols-outlined text-primary">check_circle</span>
<span>NCAA Compliant Communication</span>
</li>
<li className="flex items-center gap-3 text-white">
<span className="material-symbols-outlined text-primary">check_circle</span>
<span>Automated Highlight Tagging</span>
</li>
<li className="flex items-center gap-3 text-white">
<span className="material-symbols-outlined text-primary">check_circle</span>
<span>Direct Coach Messaging</span>
</li>
</ul>
<Link href="#features" className="flex items-center justify-center gap-2 rounded-md bg-white text-black px-6 py-3 text-sm font-bold transition-all hover:bg-gray-200">
                        Explore Features
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
</Link>
</div>
<div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
{/*  Feature Card 1  */}
<div className="flex flex-col p-6 rounded-md bg-surface-dark border-l-4 border-primary border-y border-r border-white/5 hover:border-white/10 transition-all">
<div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center text-primary mb-4">
<span className="material-symbols-outlined">verified</span>
</div>
<h3 className="text-lg font-bold text-white mb-2">Verified Stats</h3>
<p className="text-sm text-text-grey">Official, third-party verified athletic measurements that coaches trust implicitly.</p>
</div>
{/*  Feature Card 2  */}
<div className="flex flex-col p-6 rounded-md bg-surface-dark border-l-4 border-blue-500 border-y border-r border-white/5 hover:border-white/10 transition-all">
<div className="h-10 w-10 rounded bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
<span className="material-symbols-outlined">smart_display</span>
</div>
<h3 className="text-lg font-bold text-white mb-2">Video Analysis</h3>
<p className="text-sm text-text-grey">Deep dive automated video breakdown and analysis powered by computer vision.</p>
</div>
{/*  Feature Card 3  */}
<div className="flex flex-col p-6 rounded-md bg-surface-dark border-l-4 border-green-500 border-y border-r border-white/5 hover:border-white/10 transition-all">
<div className="h-10 w-10 rounded bg-green-500/10 flex items-center justify-center text-green-500 mb-4">
<span className="material-symbols-outlined">forum</span>
</div>
<h3 className="text-lg font-bold text-white mb-2">Direct Contact</h3>
<p className="text-sm text-text-grey">Direct, secure, and fully NCAA-compliant communication channels between talent and recruiters.</p>
</div>
{/*  Feature Card 4  */}
<div className="flex flex-col p-6 rounded-md bg-surface-dark border-l-4 border-purple-500 border-y border-r border-white/5 hover:border-white/10 transition-all">
<div className="h-10 w-10 rounded bg-purple-500/10 flex items-center justify-center text-purple-500 mb-4">
<span className="material-symbols-outlined">psychology</span>
</div>
<h3 className="text-lg font-bold text-white mb-2">AI Ranking</h3>
<p className="text-sm text-text-grey">Predictive modeling to match talent with specific team needs and roster gaps.</p>
</div>
</div>
</div>
</div>
</section>
{/*  How It Works Section  */}
<section id="how-it-works" className="py-24 bg-surface-dark relative overflow-hidden">
{/*  Background decorative line  */}
<div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5 -translate-y-1/2 hidden md:block z-0"></div>
<div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
<div className="text-center mb-16">
<h2 className="text-3xl font-bold text-white">How It Works</h2>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-12">
{/*  Step 1  */}
<div className="relative flex flex-col items-center text-center group">
<div className="relative w-20 h-20 rounded-lg bg-[#050505] border border-primary/30 flex items-center justify-center text-3xl mb-6 shadow-gold-glow group-hover:scale-110 transition-transform duration-300 overflow-hidden">
<Image src="/images/marketing/step-id.png" alt="Create Your ID" className="w-full h-full object-cover" fill sizes="80px" />
</div>
<span className="stats-font text-6xl font-bold text-white/5 absolute -z-10 -translate-y-6 select-none group-hover:text-white/10 transition-colors">01</span>
<h3 className="text-xl font-bold text-white mb-3">Create Your ID</h3>
<p className="text-text-grey text-sm max-w-xs">Build your verified profile with academic records, biometrics, and basic info.</p>
</div>
{/*  Step 2  */}
<div className="relative flex flex-col items-center text-center group">
<div className="relative w-20 h-20 rounded-lg bg-[#050505] border border-white/10 flex items-center justify-center text-3xl mb-6 group-hover:border-primary/30 group-hover:shadow-gold-glow group-hover:scale-110 transition-all duration-300 overflow-hidden">
<Image src="/images/marketing/step-video.png" alt="Upload Highlights" className="w-full h-full object-cover" fill sizes="80px" />
</div>
<span className="stats-font text-6xl font-bold text-white/5 absolute -z-10 -translate-y-6 select-none group-hover:text-white/10 transition-colors">02</span>
<h3 className="text-xl font-bold text-white mb-3">Upload Highlights</h3>
<p className="text-text-grey text-sm max-w-xs">Upload your game tape. Our AI automatically analyzes and tags your best plays.</p>
</div>
{/*  Step 3  */}
<div className="relative flex flex-col items-center text-center group">
<div className="relative w-20 h-20 rounded-lg bg-[#050505] border border-white/10 flex items-center justify-center text-3xl mb-6 group-hover:border-primary/30 group-hover:shadow-gold-glow group-hover:scale-110 transition-all duration-300 overflow-hidden">
<Image src="/images/marketing/step-trophy.png" alt="Get Recruited" className="w-full h-full object-cover" fill sizes="80px" />
</div>
<span className="stats-font text-6xl font-bold text-white/5 absolute -z-10 -translate-y-6 select-none group-hover:text-white/10 transition-colors">03</span>
<h3 className="text-xl font-bold text-white mb-3">Get Recruited</h3>
<p className="text-text-grey text-sm max-w-xs">Connect directly with coaches who are looking for exactly what you bring to the field.</p>
</div>
</div>
</div>
</section>
{/*  Dashboard Showcase Accordion  */}
<section className="py-24 bg-background-dark">
<div className="mx-auto max-w-7xl px-6 lg:px-8">
<div className="flex flex-col lg:flex-row gap-12 items-center">
{/*  Visual Side  */}
<div className="w-full lg:w-1/2">
<div className="relative rounded-xl border border-white/10 bg-[#0A0A0A] overflow-hidden shadow-2xl">
<div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
<div className="p-1">
<Image src="/images/marketing/internal-dashboard.png" alt="Dashboard interface screenshot showing charts, athlete list, and filtering options with a dark theme" className="w-full h-[300px] sm:h-[400px] rounded-lg opacity-90 object-cover" width={800} height={400} />
</div>
</div>
</div>
{/*  Accordion Side  */}
<div className="w-full lg:w-1/2 flex flex-col gap-4">
<h2 className="text-3xl font-bold text-white mb-4">Command Center</h2>
{accordionItems.map((item, i) => (
  <div
    key={i}
    onClick={() => setActiveAccordion(activeAccordion === i ? -1 : i)}
    className={`rounded-lg p-4 transition-all cursor-pointer ${
      activeAccordion === i
        ? 'border border-primary/20 bg-primary/5'
        : 'border border-white/5 bg-surface-dark hover:bg-[#151515]'
    }`}
  >
    <button className="flex w-full items-center justify-between text-left">
      <span className={`text-lg ${activeAccordion === i ? 'font-bold text-primary' : 'font-medium text-white'}`}>
        {item.title}
      </span>
      <span className={`material-symbols-outlined ${activeAccordion === i ? 'text-primary' : 'text-text-grey'}`}>
        {activeAccordion === i ? 'expand_less' : 'expand_more'}
      </span>
    </button>
    {activeAccordion === i && (
      <p className="text-sm text-text-grey leading-relaxed mt-2">{item.body}</p>
    )}
  </div>
))}
</div>
</div>
</div>
</section>
{/*  Final CTA  */}
<section className="py-24 bg-surface-dark border-t border-white/5 relative overflow-hidden">
<div className="absolute inset-0 opacity-20 pointer-events-none">
<Image src="/images/marketing/cta-background.png" alt="" className="object-cover" fill sizes="100vw" />
</div>
<div className="absolute inset-0 bg-gradient-to-b from-surface-dark via-transparent to-surface-dark"></div>
<div className="mx-auto max-w-4xl px-6 lg:px-8 text-center relative z-10">
<h2 className="text-4xl sm:text-5xl font-black text-white mb-6 tracking-tight">Ready to Level Up?</h2>
<p className="text-xl text-text-grey mb-10 max-w-2xl mx-auto">Join thousands of athletes and coaches transforming the recruitment process. Your future starts with verified data.</p>
<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
<Link href="/signup" className="w-full sm:w-auto rounded-md bg-primary px-10 py-4 text-lg font-bold text-[#050505] transition-all hover:bg-primary-hover hover:scale-105 shadow-[0_0_20px_rgba(212,175,53,0.4)] text-center">
                    Create Free Athlete Account
                </Link>
<Link href="/login" className="w-full sm:w-auto rounded-md border border-white/10 bg-white/5 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-white/10 hover:border-white/20 text-center">
                    Coach Login
                </Link>
<Link href="/login" className="w-full sm:w-auto rounded-md border border-primary/30 bg-primary/5 px-8 py-4 text-lg font-bold text-primary transition-all hover:bg-primary/10 hover:border-primary/50 text-center">
                    Recruiter Login
                </Link>
</div>
</div>
</section>
{/*  Footer  */}
<footer className="bg-background-dark border-t border-white/5 pt-16 pb-8">
<div className="mx-auto max-w-7xl px-6 lg:px-8">
<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
<div className="col-span-2 lg:col-span-2 pr-8">
<div className="flex items-center gap-2 mb-4">
<span className="material-symbols-outlined text-primary">sports_football</span>
<h2 className="text-lg font-black text-white">REPMAX</h2>
</div>
<p className="text-sm text-text-grey leading-relaxed mb-6">
                        The ultimate data-driven platform connecting elite talent with top-tier programs. Built for the modern athlete.
                    </p>
<div className="flex gap-4">
<span className="text-text-grey"><span className="material-symbols-outlined text-xl">thumb_up</span></span>
<span className="text-text-grey"><span className="material-symbols-outlined text-xl">smart_display</span></span>
<span className="text-text-grey"><span className="material-symbols-outlined text-xl">share</span></span>
</div>
</div>
<div className="flex flex-col gap-4">
<h3 className="text-sm font-bold text-white uppercase tracking-wider">Product</h3>
<Link className="text-sm text-text-grey hover:text-primary transition-colors" href="#features">Features</Link>
<Link className="text-sm text-text-grey hover:text-primary transition-colors" href="/pricing">Pricing</Link>
<Link className="text-sm text-text-grey hover:text-primary transition-colors" href="/signup">For Athletes</Link>
<Link className="text-sm text-text-grey hover:text-primary transition-colors" href="/login">For Coaches</Link>
</div>
<div className="flex flex-col gap-4">
<h3 className="text-sm font-bold text-white uppercase tracking-wider">Company</h3>
<span className="text-sm text-text-grey">About</span>
<span className="text-sm text-text-grey">Careers</span>
<Link href="/blog" className="text-sm text-text-grey hover:text-primary transition-colors">Blog</Link>
<Link href="/resources" className="text-sm text-text-grey hover:text-primary transition-colors">Resources</Link>
<Link href="/support" className="text-sm text-text-grey hover:text-primary transition-colors">Contact</Link>
</div>
<div className="flex flex-col gap-4">
<h3 className="text-sm font-bold text-white uppercase tracking-wider">Legal</h3>
<Link href="/privacy" className="text-sm text-text-grey hover:text-primary transition-colors">Privacy</Link>
<Link href="/terms" className="text-sm text-text-grey hover:text-primary transition-colors">Terms</Link>
<span className="text-sm text-text-grey">Security</span>
</div>
</div>
<div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
<p className="text-xs text-text-grey">© 2026 RepMax Inc. All rights reserved.</p>
<div className="flex items-center gap-2">
<div className="h-2 w-2 rounded-full bg-green-500"></div>
<span className="text-xs text-text-grey">Systems Operational</span>
</div>
</div>
</div>
</footer>
    </>
  );
}
