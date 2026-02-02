'use client';

import Link from 'next/link';

export default function Page() {
  return (
    <>
      {/*  Top Navigation  */}
<header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background-dark/80 backdrop-blur-md">
<div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
<div className="flex items-center gap-3">
<div className="size-8 text-primary flex items-center justify-center">
<span className="material-symbols-outlined" style={{fontSize: "32px"}}>sports_football</span>
</div>
<h1 className="text-xl font-bold tracking-tight text-white">RepMax</h1>
</div>
<nav className="hidden md:flex items-center gap-8">
<Link className="text-sm font-medium text-gray-300 hover:text-primary transition-colors" href="/">Platform</Link>
<Link className="text-sm font-medium text-gray-300 hover:text-primary transition-colors" href="/">Solutions</Link>
<Link className="text-sm font-medium text-gray-300 hover:text-primary transition-colors" href="/">Pricing</Link>
<Link className="text-sm font-medium text-gray-300 hover:text-primary transition-colors" href="/">Resources</Link>
</nav>
<div className="flex items-center gap-4">
<button className="hidden md:flex text-sm font-bold text-primary hover:text-white transition-colors">
                    Login
                </button>
<button className="h-10 px-5 rounded-lg bg-primary hover:bg-yellow-600 text-background-dark text-sm font-bold transition-all shadow-[0_0_15px_rgba(212,175,53,0.3)] hover:shadow-[0_0_25px_rgba(212,175,53,0.5)]">
                    Get Access
                </button>
</div>
</div>
</header>
{/*  Main Content  */}
<main className="relative flex flex-col min-h-screen pt-20">
{/*  Background Ambient Glow  */}
<div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
{/*  Hero Section  */}
<section className="relative pt-20 pb-32 px-6 overflow-hidden">
<div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
{/*  Hero Text  */}
<div className="flex flex-col gap-8 z-10">
<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 w-fit">
<span className="size-2 rounded-full bg-primary animate-pulse"></span>
<span className="text-xs font-mono text-primary uppercase tracking-wider">Live Intel v2.0</span>
</div>
<h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight">
                        Unlocking the <br />
<span className="text-gold-gradient">Future of Recruitment</span>
</h1>
<p className="text-lg text-gray-400 max-w-xl leading-relaxed">
                        AI-driven analytics for the next generation of college football. Experience the power of the <span className="text-white font-medium">Companion Card</span> with precision data and predictive modeling.
                    </p>
<div className="flex flex-wrap gap-4 mt-2">
<button className="h-12 px-8 rounded-lg bg-primary hover:bg-yellow-600 text-background-dark font-bold text-base transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
<span>Get Access</span>
<span className="material-symbols-outlined text-sm">arrow_forward</span>
</button>
<button className="h-12 px-8 rounded-lg border border-white/20 hover:border-primary/50 hover:bg-white/5 text-white font-bold text-base transition-all flex items-center gap-2 group">
<span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">play_circle</span>
<span>Watch Demo</span>
</button>
</div>
<div className="flex items-center gap-6 mt-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
<p className="text-xs font-mono text-gray-500 mb-2 w-full">TRUSTED BY ELITE PROGRAMS</p>
</div>
<div className="flex gap-8 opacity-40">
{/*  Simplified Logo Placeholders  */}
<div className="h-8 w-24 bg-white/20 rounded"></div>
<div className="h-8 w-24 bg-white/20 rounded"></div>
<div className="h-8 w-24 bg-white/20 rounded"></div>
</div>
</div>
{/*  Hero Visual: 3D Companion Card  */}
<div className="relative perspective-container h-[600px] flex items-center justify-center lg:justify-end">
{/*  Background decoration ring  */}
<div className="absolute inset-0 border border-primary/20 rounded-full w-[500px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 animate-[spin_20s_linear_infinite]"></div>
<div className="absolute inset-0 border border-dashed border-white/10 rounded-full w-[400px] h-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 animate-[spin_15s_linear_infinite_reverse]"></div>
{/*  The Card  */}
<div className="tilted-card w-[340px] h-[520px] rounded-2xl relative gold-aura group cursor-default">
{/*  Card Border/Glow Container  */}
<div className="absolute -inset-[1px] bg-gradient-to-b from-primary/50 to-transparent rounded-2xl z-0"></div>
{/*  Card Content  */}
<div className="absolute inset-0 bg-surface-dark/90 backdrop-blur-xl rounded-2xl overflow-hidden flex flex-col z-10 border border-white/10">
{/*  Header / Image  */}
<div className="relative h-[60%] w-full bg-gray-800 overflow-hidden">
<div className="absolute inset-0 bg-cover bg-center" data-alt="Athletic football player in action pose wearing a dark jersey with number 14" style={{backgroundImage: "url('https"}}></div>
<div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-transparent to-transparent"></div>
{/*  Rank Badge  */}
<div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-primary/40 rounded px-3 py-1 flex flex-col items-center">
<span className="text-[10px] text-gray-400 font-mono uppercase">OVR RANK</span>
<span className="text-xl font-bold text-primary font-mono">98.5</span>
</div>
</div>
{/*  Card Body / Stats  */}
<div className="flex-1 p-5 flex flex-col gap-4 relative">
{/*  Name  */}
<div>
<h3 className="text-2xl font-bold text-white leading-none">Marcus Thorne</h3>
<div className="flex items-center gap-2 mt-1">
<span className="text-xs text-primary font-mono bg-primary/10 px-1.5 py-0.5 rounded">WR</span>
<span className="text-xs text-gray-400 font-mono">|</span>
<span className="text-xs text-gray-400 font-mono">Class of &apos;25</span>
</div>
</div>
{/*  Stats Grid  */}
<div className="grid grid-cols-3 gap-2 mt-2">
<div className="bg-white/5 rounded p-2 flex flex-col gap-1 border border-white/5">
<span className="text-[10px] text-gray-500 font-mono uppercase">40 YD</span>
<span className="text-sm font-bold text-white font-mono">4.32s</span>
</div>
<div className="bg-white/5 rounded p-2 flex flex-col gap-1 border border-white/5">
<span className="text-[10px] text-gray-500 font-mono uppercase">VERT</span>
<span className="text-sm font-bold text-white font-mono">38.5&quot;</span>
</div>
<div className="bg-white/5 rounded p-2 flex flex-col gap-1 border border-white/5">
<span className="text-[10px] text-gray-500 font-mono uppercase">NIL Val</span>
<span className="text-sm font-bold text-primary font-mono">$185K</span>
</div>
</div>
{/*  Radar Chart visual  */}
<div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
<div className="flex gap-1">
<div className="h-1 w-8 bg-primary rounded-full"></div>
<div className="h-1 w-8 bg-primary/50 rounded-full"></div>
<div className="h-1 w-8 bg-primary/20 rounded-full"></div>
</div>
<span className="material-symbols-outlined text-gray-500 text-lg">fingerprint</span>
</div>
</div>
</div>
</div>
</div>
</div>
</section>
{/*  Dashboard Section  */}
<section className="py-24 px-6 relative bg-grid-pattern">
<div className="max-w-7xl mx-auto flex flex-col gap-12">
<div className="text-center max-w-2xl mx-auto">
<h2 className="text-3xl md:text-4xl font-bold mb-4">Unified Intelligence Dashboard</h2>
<p className="text-gray-400">Five distinct views, one powerful platform. Seamlessly switch contexts to see the data that matters most to you.</p>
</div>
{/*  Tabs  */}
<div className="w-full">
<div className="flex flex-wrap justify-center border-b border-white/10 mb-8 overflow-x-auto">
<button className="px-6 py-4 text-sm font-bold text-primary border-b-2 border-primary transition-colors flex items-center gap-2">
<span className="material-symbols-outlined text-lg">sports_handball</span>
                            Athlete
                        </button>
<button className="px-6 py-4 text-sm font-bold text-gray-500 hover:text-gray-300 border-b-2 border-transparent hover:border-gray-700 transition-colors flex items-center gap-2">
<span className="material-symbols-outlined text-lg">family_restroom</span>
                            Parent
                        </button>
<button className="px-6 py-4 text-sm font-bold text-gray-500 hover:text-gray-300 border-b-2 border-transparent hover:border-gray-700 transition-colors flex items-center gap-2">
<span className="material-symbols-outlined text-lg">groups</span>
                            Team
                        </button>
<button className="px-6 py-4 text-sm font-bold text-gray-500 hover:text-gray-300 border-b-2 border-transparent hover:border-gray-700 transition-colors flex items-center gap-2">
<span className="material-symbols-outlined text-lg">search</span>
                            Recruiter
                        </button>
<button className="px-6 py-4 text-sm font-bold text-gray-500 hover:text-gray-300 border-b-2 border-transparent hover:border-gray-700 transition-colors flex items-center gap-2">
<span className="material-symbols-outlined text-lg">trophy</span>
                            Club
                        </button>
</div>
{/*  Dashboard Window Mockup  */}
<div className="bg-surface-dark border border-white/10 rounded-xl overflow-hidden shadow-2xl relative min-h-[600px] flex flex-col md:flex-row">
{/*  Sidebar  */}
<div className="w-full md:w-64 bg-black/40 border-r border-white/5 p-4 hidden md:flex flex-col gap-2">
<div className="text-xs font-mono text-gray-500 uppercase mb-2 ml-2">Main Menu</div>
<div className="flex items-center gap-3 px-3 py-2 bg-primary/10 text-primary rounded-md text-sm font-medium">
<span className="material-symbols-outlined text-lg">dashboard</span>
                                Overview
                            </div>
<div className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-md text-sm font-medium transition-colors">
<span className="material-symbols-outlined text-lg">trending_up</span>
                                Performance
                            </div>
<div className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-md text-sm font-medium transition-colors">
<span className="material-symbols-outlined text-lg">local_offer</span>
                                NIL Offers
                            </div>
<div className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-md text-sm font-medium transition-colors">
<span className="material-symbols-outlined text-lg">school</span>
                                Academics
                            </div>
</div>
{/*  Main Area  */}
<div className="flex-1 p-6 md:p-8 bg-glass">
<div className="flex flex-col gap-6">
{/*  Mockup Header  */}
<div className="flex justify-between items-center pb-6 border-b border-white/5">
<div>
<h3 className="text-xl font-bold text-white">Athlete Overview</h3>
<p className="text-sm text-gray-500 font-mono mt-1">Last updated: 2 mins ago</p>
</div>
<button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-sm font-medium transition-colors flex items-center gap-2">
<span className="material-symbols-outlined text-sm">download</span>
                                        Export Report
                                    </button>
</div>
{/*  Mockup Content Grid  */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
{/*  Card 1  */}
<div className="lg:col-span-2 p-5 rounded-lg border border-white/5 bg-black/20">
<div className="flex justify-between items-center mb-4">
<h4 className="text-sm font-semibold text-gray-300">Recruitment Interest Heatmap</h4>
<span className="material-symbols-outlined text-gray-600">more_horiz</span>
</div>
<div className="h-48 rounded bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-dashed border-white/10 relative overflow-hidden" data-alt="Abstract heatmap showing geographic density of recruitment interest across the US map with glowing gold hotspots">
{/*  Fake map points  */}
<div className="absolute top-1/3 left-1/4 w-3 h-3 bg-primary rounded-full animate-ping"></div>
<div className="absolute top-1/2 left-1/2 w-4 h-4 bg-primary rounded-full opacity-50"></div>
<div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-primary rounded-full"></div>
<div className="absolute inset-0 flex items-center justify-center">
<p className="text-xs text-primary/50 font-mono">GEOSPATIAL DATA VISUALIZATION</p>
</div>
</div>
</div>
{/*  Card 2  */}
<div className="p-5 rounded-lg border border-white/5 bg-black/20 flex flex-col gap-4">
<h4 className="text-sm font-semibold text-gray-300">Active Offers</h4>
<div className="flex flex-col gap-3">
<div className="flex items-center justify-between p-3 rounded bg-white/5 border border-white/5">
<div className="flex items-center gap-3">
<div className="size-8 rounded-full bg-red-900/50 flex items-center justify-center text-xs font-bold">UA</div>
<div>
<p className="text-sm font-bold">Alabama</p>
<p className="text-xs text-gray-500">Official Visit</p>
</div>
</div>
<span className="text-xs font-mono text-primary">PENDING</span>
</div>
<div className="flex items-center justify-between p-3 rounded bg-white/5 border border-white/5">
<div className="flex items-center gap-3">
<div className="size-8 rounded-full bg-blue-900/50 flex items-center justify-center text-xs font-bold">UM</div>
<div>
<p className="text-sm font-bold">Michigan</p>
<p className="text-xs text-gray-500">Hard Commit</p>
</div>
</div>
<span className="text-xs font-mono text-gray-400">CLOSED</span>
</div>
<div className="flex items-center justify-between p-3 rounded bg-white/5 border border-white/5">
<div className="flex items-center gap-3">
<div className="size-8 rounded-full bg-orange-900/50 flex items-center justify-center text-xs font-bold">UT</div>
<div>
<p className="text-sm font-bold">Texas</p>
<p className="text-xs text-gray-500">Offer Extended</p>
</div>
</div>
<span className="text-xs font-mono text-green-400">NEW</span>
</div>
</div>
</div>
{/*  Bottom Row Metrics  */}
<div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
<div className="p-4 rounded border border-white/5 bg-black/20">
<p className="text-xs text-gray-500 font-mono uppercase">Profile Views</p>
<p className="text-2xl font-bold text-white mt-1">12,450</p>
<p className="text-xs text-green-400 mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">arrow_upward</span> 12%</p>
</div>
<div className="p-4 rounded border border-white/5 bg-black/20">
<p className="text-xs text-gray-500 font-mono uppercase">Est. NIL Value</p>
<p className="text-2xl font-bold text-white mt-1">$142k</p>
<p className="text-xs text-green-400 mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">arrow_upward</span> 4.2%</p>
</div>
<div className="p-4 rounded border border-white/5 bg-black/20">
<p className="text-xs text-gray-500 font-mono uppercase">Highlight Plays</p>
<p className="text-2xl font-bold text-white mt-1">24</p>
<p className="text-xs text-gray-500 mt-1">Last added 3d ago</p>
</div>
<div className="p-4 rounded border border-white/5 bg-black/20">
<p className="text-xs text-gray-500 font-mono uppercase">Scout Rating</p>
<p className="text-2xl font-bold text-primary mt-1">4.8<span className="text-sm text-gray-500">/5</span></p>
<p className="text-xs text-gray-500 mt-1">Top 1% of Class</p>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</section>
{/*  Solutions Grid  */}
<section className="py-24 px-6 relative overflow-hidden">
<div className="absolute inset-0 bg-gradient-to-b from-background-dark via-[#0f0e0a] to-background-dark -z-10"></div>
<div className="max-w-7xl mx-auto">
<div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
<div>
<h2 className="text-3xl md:text-4xl font-bold mb-4">Platform Solutions</h2>
<p className="text-gray-400 max-w-xl">Deep capabilities built for every stakeholder in the recruitment ecosystem.</p>
</div>
<Link className="text-primary hover:text-white font-medium flex items-center gap-2 transition-colors" href="/">
                        View All Features <span className="material-symbols-outlined">arrow_forward</span>
</Link>
</div>
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
{/*  Card 1  */}
<div className="group glass-card rounded-xl p-8 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
<div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-[40px] rounded-full group-hover:bg-primary/20 transition-all"></div>
<div className="size-12 rounded-lg bg-surface-dark border border-white/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform duration-300">
<span className="material-symbols-outlined">analytics</span>
</div>
<h3 className="text-xl font-bold text-white mb-3">NIL Analytics</h3>
<p className="text-sm text-gray-400 leading-relaxed mb-6">Real-time valuation models based on social engagement, on-field performance, and market trends.</p>
<Link className="inline-flex items-center text-xs font-bold text-primary uppercase tracking-wide group-hover:underline" href="/">Explore Data <span className="material-symbols-outlined text-sm ml-1">chevron_right</span></Link>
</div>
{/*  Card 2  */}
<div className="group glass-card rounded-xl p-8 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
<div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-[40px] rounded-full group-hover:bg-primary/20 transition-all"></div>
<div className="size-12 rounded-lg bg-surface-dark border border-white/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform duration-300">
<span className="material-symbols-outlined">speed</span>
</div>
<h3 className="text-xl font-bold text-white mb-3">Verified Speed Data</h3>
<p className="text-sm text-gray-400 leading-relaxed mb-6">GPS-tracked game speed and verified combine metrics integrated directly into the player card.</p>
<Link className="inline-flex items-center text-xs font-bold text-primary uppercase tracking-wide group-hover:underline" href="/">Explore Data <span className="material-symbols-outlined text-sm ml-1">chevron_right</span></Link>
</div>
{/*  Card 3  */}
<div className="group glass-card rounded-xl p-8 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
<div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-[40px] rounded-full group-hover:bg-primary/20 transition-all"></div>
<div className="size-12 rounded-lg bg-surface-dark border border-white/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform duration-300">
<span className="material-symbols-outlined">school</span>
</div>
<h3 className="text-xl font-bold text-white mb-3">Academic Eligibility</h3>
<p className="text-sm text-gray-400 leading-relaxed mb-6">Automated transcript analysis and NCAA clearinghouse requirement tracking for compliance.</p>
<Link className="inline-flex items-center text-xs font-bold text-primary uppercase tracking-wide group-hover:underline" href="/">Explore Data <span className="material-symbols-outlined text-sm ml-1">chevron_right</span></Link>
</div>
{/*  Card 4  */}
<div className="group glass-card rounded-xl p-8 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
<div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-[40px] rounded-full group-hover:bg-primary/20 transition-all"></div>
<div className="size-12 rounded-lg bg-surface-dark border border-white/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform duration-300">
<span className="material-symbols-outlined">psychology</span>
</div>
<h3 className="text-xl font-bold text-white mb-3">Scouting Reports</h3>
<p className="text-sm text-gray-400 leading-relaxed mb-6">AI-summarized game tape analysis highlighting strengths, weaknesses, and scheme fits.</p>
<Link className="inline-flex items-center text-xs font-bold text-primary uppercase tracking-wide group-hover:underline" href="/">Explore Data <span className="material-symbols-outlined text-sm ml-1">chevron_right</span></Link>
</div>
{/*  Card 5  */}
<div className="group glass-card rounded-xl p-8 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
<div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-[40px] rounded-full group-hover:bg-primary/20 transition-all"></div>
<div className="size-12 rounded-lg bg-surface-dark border border-white/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform duration-300">
<span className="material-symbols-outlined">hub</span>
</div>
<h3 className="text-xl font-bold text-white mb-3">Transfer Portal</h3>
<p className="text-sm text-gray-400 leading-relaxed mb-6">Predictive analytics on portal entries and fit matching for roster management.</p>
<Link className="inline-flex items-center text-xs font-bold text-primary uppercase tracking-wide group-hover:underline" href="/">Explore Data <span className="material-symbols-outlined text-sm ml-1">chevron_right</span></Link>
</div>
{/*  Card 6  */}
<div className="group glass-card rounded-xl p-8 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
<div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-[40px] rounded-full group-hover:bg-primary/20 transition-all"></div>
<div className="size-12 rounded-lg bg-surface-dark border border-white/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform duration-300">
<span className="material-symbols-outlined">verified_user</span>
</div>
<h3 className="text-xl font-bold text-white mb-3">Identity Verification</h3>
<p className="text-sm text-gray-400 leading-relaxed mb-6">Secure biometric verification ensuring all data points are tied to the verified athlete.</p>
<Link className="inline-flex items-center text-xs font-bold text-primary uppercase tracking-wide group-hover:underline" href="/">Explore Data <span className="material-symbols-outlined text-sm ml-1">chevron_right</span></Link>
</div>
</div>
</div>
</section>
{/*  CTA Section  */}
<section className="py-20 px-6">
<div className="max-w-5xl mx-auto rounded-2xl bg-gradient-to-br from-[#1a1810] to-background-dark border border-primary/20 p-12 text-center relative overflow-hidden">
<div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
<h2 className="text-3xl md:text-5xl font-black text-white mb-6 relative z-10">Ready to Upgrade Your Game?</h2>
<p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto relative z-10">Join over 500 elite programs using RepMax to discover, analyze, and sign the next generation of talent.</p>
<div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
<button className="h-12 px-8 rounded-lg bg-primary hover:bg-yellow-600 text-background-dark font-bold transition-all shadow-lg shadow-primary/20">
                        Start Free Trial
                    </button>
<button className="h-12 px-8 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold transition-all">
                        Contact Sales
                    </button>
</div>
</div>
</section>
</main>
{/*  Footer  */}
<footer className="border-t border-white/10 bg-background-dark pt-16 pb-8 px-6">
<div className="max-w-7xl mx-auto">
<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-16">
{/*  Brand Column  */}
<div className="col-span-2 lg:col-span-2">
<div className="flex items-center gap-2 mb-6">
<span className="material-symbols-outlined text-primary" style={{fontSize: "28px"}}>sports_football</span>
<span className="text-lg font-bold text-white">RepMax</span>
</div>
<p className="text-sm text-gray-400 mb-6 max-w-xs">The premier intelligence platform for college football recruiting, powered by advanced AI and verified data.</p>
<div className="flex gap-4">
<Link className="size-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-background-dark transition-all" href="/">
<span className="material-symbols-outlined text-lg">mail</span> {/*  Representing social/contact  */}
</Link>
<Link className="size-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-background-dark transition-all" href="/">
<span className="material-symbols-outlined text-lg">public</span> {/*  Representing social/web  */}
</Link>
</div>
</div>
{/*  Links Column 1  */}
<div className="flex flex-col gap-4">
<h4 className="text-sm font-bold text-white uppercase tracking-wider">Product</h4>
<Link className="text-sm text-gray-400 hover:text-primary transition-colors" href="/">Features</Link>
<Link className="text-sm text-gray-400 hover:text-primary transition-colors" href="/">Pricing</Link>
<Link className="text-sm text-gray-400 hover:text-primary transition-colors" href="/">Integrations</Link>
<Link className="text-sm text-gray-400 hover:text-primary transition-colors" href="/">API</Link>
</div>
{/*  Links Column 2  */}
<div className="flex flex-col gap-4">
<h4 className="text-sm font-bold text-white uppercase tracking-wider">Company</h4>
<Link className="text-sm text-gray-400 hover:text-primary transition-colors" href="/">About Us</Link>
<Link className="text-sm text-gray-400 hover:text-primary transition-colors" href="/">Careers</Link>
<Link className="text-sm text-gray-400 hover:text-primary transition-colors" href="/">Blog</Link>
<Link className="text-sm text-gray-400 hover:text-primary transition-colors" href="/">Press</Link>
</div>
{/*  Links Column 3  */}
<div className="flex flex-col gap-4">
<h4 className="text-sm font-bold text-white uppercase tracking-wider">Legal</h4>
<Link className="text-sm text-gray-400 hover:text-primary transition-colors" href="/">Privacy Policy</Link>
<Link className="text-sm text-gray-400 hover:text-primary transition-colors" href="/">Terms of Service</Link>
<Link className="text-sm text-gray-400 hover:text-primary transition-colors" href="/">Cookie Policy</Link>
<Link className="text-sm text-gray-400 hover:text-primary transition-colors" href="/">Security</Link>
</div>
</div>
<div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
<p className="text-xs text-gray-500">© 2024 RepMax Intelligence Inc. All rights reserved.</p>
<div className="flex items-center gap-2 text-xs text-gray-600">
<span className="size-2 rounded-full bg-green-500"></span>
                    Systems Operational
                </div>
</div>
</div>
</footer>
{/* Custom styles from Stitch */}
<style jsx>{`
        .glass-card {
        .gold-aura {
        .perspective-container {
        .tilted-card {
        .tilted-card:hover {
        .text-gold-gradient {
        .bg-grid-pattern {
`}</style>
    </>
  );
}
