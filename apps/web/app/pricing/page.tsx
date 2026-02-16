'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createCheckoutSession } from '@/lib/actions/subscription-actions';

export default function Page() {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(planSlug: string) {
    setLoadingPlan(planSlug);
    setError(null);

    try {
      const result = await createCheckoutSession(planSlug);

      if ('error' in result && result.error) {
        setError(result.error);
        return;
      }

      if ('sessionUrl' in result && result.sessionUrl) {
        window.location.href = result.sessionUrl;
        return;
      }

      if ('redirectTo' in result && result.redirectTo) {
        router.push(result.redirectTo);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <>
      {/*  Navbar  */}
<nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background-dark/80 backdrop-blur-md">
<div className="px-4 md:px-10 lg:px-20 py-4 max-w-7xl mx-auto flex items-center justify-between">
{/*  Logo  */}
<div className="flex items-center gap-3">
<div className="text-primary">
<span className="material-symbols-outlined !text-[32px]">sports_football</span>
</div>
<h2 className="text-white text-xl font-bold tracking-tight">RepMax</h2>
</div>
{/*  Desktop Links  */}
<div className="hidden md:flex items-center gap-8">
<Link className="text-sm font-medium text-gray-300 hover:text-primary transition-colors" href="/">Features</Link>
<Link className="text-sm font-medium text-gray-300 hover:text-primary transition-colors" href="/">About</Link>
<Link className="text-sm font-medium text-primary transition-colors" href="/">Pricing</Link>
<Link className="text-sm font-medium text-gray-300 hover:text-primary transition-colors" href="/">Login</Link>
<button className="bg-primary hover:bg-primary-hover text-background-dark text-sm font-bold py-2.5 px-6 rounded-full transition-all">
                    Get Started
                </button>
</div>
{/*  Mobile Menu Icon  */}
<div className="md:hidden text-white">
<span className="material-symbols-outlined">menu</span>
</div>
</div>
</nav>
{/*  Main Content  */}
<main className="flex flex-col items-center justify-center min-h-screen pt-12 pb-24 px-4 md:px-8">
{/*  Header Section  */}
<div className="max-w-4xl w-full text-center mb-16 space-y-4">
<p className="text-primary text-sm font-bold tracking-widest uppercase">Pricing</p>
<h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-white">
                Built for Access, <br className="hidden md:block" /> Not Exclusion
            </h1>
<p className="text-text-muted text-lg font-light max-w-2xl mx-auto">
                Transparent pricing for every level of recruiting. Unlock the data you need to build a championship roster.
            </p>
</div>
{error && (
<div className="w-full max-w-2xl mx-auto mb-8 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
  <p className="text-red-400 text-sm">{error}</p>
</div>
)}
{/*  Pricing Grid  */}
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full max-w-7xl mx-auto items-stretch">
{/*  STARTER CARD  */}
<div className="group relative flex flex-col rounded-3xl bg-card-dark border border-white/10 p-6 md:p-8 hover:-translate-y-2 transition-transform duration-300">
<div className="mb-6 space-y-2">
<h3 className="text-white text-lg font-bold tracking-wide">STARTER</h3>
<p className="text-text-muted text-xs font-normal">For the casual fan</p>
<div className="pt-4 flex items-baseline gap-1">
<span className="text-4xl font-bold font-mono text-white">$0</span>
<span className="text-gray-500 font-medium">/mo</span>
</div>
</div>
<ul className="flex-1 space-y-4 mb-8">
<li className="flex items-start gap-3 text-sm text-gray-300">
<span className="material-symbols-outlined text-gray-500 text-[20px] feature-check">check</span>
<span>Basic Access</span>
</li>
<li className="flex items-start gap-3 text-sm text-gray-300">
<span className="material-symbols-outlined text-gray-500 text-[20px] feature-check">check</span>
<span>Limited Search Queries</span>
</li>
<li className="flex items-start gap-3 text-sm text-gray-300">
<span className="material-symbols-outlined text-gray-500 text-[20px] feature-check">check</span>
<span>Public Profiles Only</span>
</li>
</ul>
<button
  onClick={() => handleCheckout('starter')}
  disabled={loadingPlan === 'starter'}
  className="w-full py-3 px-6 rounded-full border border-white/20 hover:bg-white/5 text-white text-sm font-bold transition-colors disabled:opacity-50"
>
                    {loadingPlan === 'starter' ? 'Loading...' : 'Start Free'}
                </button>
</div>
{/*  PRO CARD (Highlighted)  */}
<div className="group relative flex flex-col rounded-3xl bg-card-dark border-2 border-primary shadow-glow p-6 md:p-8 hover:-translate-y-2 transition-transform duration-300 z-10 transform md:scale-105 xl:scale-110 xl:-mt-4 xl:mb-4">
<div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-background-dark text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                    Most Popular
                </div>
<div className="mb-6 space-y-2">
<h3 className="text-primary text-lg font-bold tracking-wide">PRO</h3>
<p className="text-text-muted text-xs font-normal">For the serious recruiter</p>
<div className="pt-4 flex items-baseline gap-1">
<span className="text-4xl font-bold font-mono text-white">$9.99</span>
<span className="text-gray-500 font-medium">/mo</span>
</div>
</div>
<ul className="flex-1 space-y-4 mb-8">
<li className="flex items-start gap-3 text-sm text-white font-medium">
<span className="material-symbols-outlined text-primary text-[20px] feature-check">check</span>
<span>Full Player Database</span>
</li>
<li className="flex items-start gap-3 text-sm text-white font-medium">
<span className="material-symbols-outlined text-primary text-[20px] feature-check">check</span>
<span>Advanced Metrics &amp; Stats</span>
</li>
<li className="flex items-start gap-3 text-sm text-white font-medium">
<span className="material-symbols-outlined text-primary text-[20px] feature-check">check</span>
<span>Unlimited Search</span>
</li>
<li className="flex items-start gap-3 text-sm text-white font-medium">
<span className="material-symbols-outlined text-primary text-[20px] feature-check">check</span>
<span>Export Data (CSV)</span>
</li>
</ul>
<button
  onClick={() => handleCheckout('pro')}
  disabled={loadingPlan === 'pro'}
  className="w-full py-3 px-6 rounded-full bg-primary hover:bg-primary-hover text-background-dark text-sm font-bold transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
>
                    {loadingPlan === 'pro' ? 'Loading...' : 'Go Pro'}
                </button>
</div>
{/*  TEAM CARD  */}
<div className="group relative flex flex-col rounded-3xl bg-card-dark border border-white/10 p-6 md:p-8 hover:-translate-y-2 transition-transform duration-300 hover:border-accent-green/50">
<div className="mb-6 space-y-2">
<h3 className="text-accent-green text-lg font-bold tracking-wide">TEAM</h3>
<p className="text-text-muted text-xs font-normal">For the coaching staff</p>
<div className="pt-4 flex items-baseline gap-1">
<span className="text-4xl font-bold font-mono text-white">$29.99</span>
<span className="text-gray-500 font-medium">/mo</span>
</div>
</div>
<ul className="flex-1 space-y-4 mb-8">
<li className="flex items-start gap-3 text-sm text-gray-300">
<span className="material-symbols-outlined text-accent-green text-[20px] feature-check">check</span>
<span>5 Team Seats</span>
</li>
<li className="flex items-start gap-3 text-sm text-gray-300">
<span className="material-symbols-outlined text-accent-green text-[20px] feature-check">check</span>
<span>Collaboration Tools</span>
</li>
<li className="flex items-start gap-3 text-sm text-gray-300">
<span className="material-symbols-outlined text-accent-green text-[20px] feature-check">check</span>
<span>Shared Watchlists</span>
</li>
<li className="flex items-start gap-3 text-sm text-gray-300">
<span className="material-symbols-outlined text-accent-green text-[20px] feature-check">check</span>
<span>Priority Support</span>
</li>
</ul>
<button
  onClick={() => handleCheckout('team')}
  disabled={loadingPlan === 'team'}
  className="w-full py-3 px-6 rounded-full bg-[#1F2937] hover:bg-[#374151] border border-accent-green/30 text-white text-sm font-bold transition-colors disabled:opacity-50"
>
                    {loadingPlan === 'team' ? 'Loading...' : 'Get Team'}
                </button>
</div>
{/*  SCOUT CARD  */}
<div className="group relative flex flex-col rounded-3xl bg-card-dark border border-white/10 p-6 md:p-8 hover:-translate-y-2 transition-transform duration-300 hover:border-accent-purple/50">
<div className="mb-6 space-y-2">
<h3 className="text-accent-purple text-lg font-bold tracking-wide">SCOUT</h3>
<p className="text-text-muted text-xs font-normal">For agencies &amp; media</p>
<div className="pt-4 flex items-baseline gap-1">
<span className="text-3xl font-bold font-mono text-white">Contact</span>
</div>
</div>
<ul className="flex-1 space-y-4 mb-8">
<li className="flex items-start gap-3 text-sm text-gray-300">
<span className="material-symbols-outlined text-accent-purple text-[20px] feature-check">check</span>
<span>API Access</span>
</li>
<li className="flex items-start gap-3 text-sm text-gray-300">
<span className="material-symbols-outlined text-accent-purple text-[20px] feature-check">check</span>
<span>Custom Reporting</span>
</li>
<li className="flex items-start gap-3 text-sm text-gray-300">
<span className="material-symbols-outlined text-accent-purple text-[20px] feature-check">check</span>
<span>Dedicated Account Manager</span>
</li>
<li className="flex items-start gap-3 text-sm text-gray-300">
<span className="material-symbols-outlined text-accent-purple text-[20px] feature-check">check</span>
<span>SSO Integration</span>
</li>
</ul>
<button
  onClick={() => window.location.href = 'mailto:sales@repmax.com?subject=Scout Plan Inquiry'}
  className="w-full py-3 px-6 rounded-full bg-[#1F2937] hover:bg-[#374151] border border-accent-purple/30 text-white text-sm font-bold transition-colors"
>
                    Contact Sales
                </button>
</div>
</div>
{/*  Billing Note  */}
<div className="mt-12 text-center">
<p className="text-text-muted text-sm font-light">All plans billed monthly. Cancel anytime.</p>
</div>
{/*  FAQ Section  */}
<div className="mt-24 max-w-3xl w-full mx-auto">
<h2 className="text-2xl font-bold text-center mb-10 text-white">Frequently Asked Questions</h2>
<div className="space-y-4">
{/*  Question 1  */}
<details className="group bg-card-dark rounded-xl border border-white/5 overflow-hidden transition-all duration-300 open:border-primary/30 open:bg-[#252529]">
<summary className="flex justify-between items-center p-6 cursor-pointer list-none">
<span className="font-medium text-white group-hover:text-primary transition-colors">Is the Starter plan really free forever?</span>
<span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180 text-gray-400">expand_more</span>
</summary>
<div className="px-6 pb-6 text-gray-400 text-sm leading-relaxed">
                        Yes, the Starter plan is completely free and always will be. It gives you basic access to public profiles and a limited number of search queries per day, perfect for casual fans keeping up with their team&apos;s recruiting class.
                    </div>
</details>
{/*  Question 2  */}
<details className="group bg-card-dark rounded-xl border border-white/5 overflow-hidden transition-all duration-300 open:border-primary/30 open:bg-[#252529]">
<summary className="flex justify-between items-center p-6 cursor-pointer list-none">
<span className="font-medium text-white group-hover:text-primary transition-colors">Can I switch plans later?</span>
<span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180 text-gray-400">expand_more</span>
</summary>
<div className="px-6 pb-6 text-gray-400 text-sm leading-relaxed">
                        Absolutely. You can upgrade to Pro or Team at any time to unlock more features immediately. Downgrades are effective at the end of your current billing cycle.
                    </div>
</details>
{/*  Question 3  */}
<details className="group bg-card-dark rounded-xl border border-white/5 overflow-hidden transition-all duration-300 open:border-primary/30 open:bg-[#252529]">
<summary className="flex justify-between items-center p-6 cursor-pointer list-none">
<span className="font-medium text-white group-hover:text-primary transition-colors">What payment methods do you accept?</span>
<span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180 text-gray-400">expand_more</span>
</summary>
<div className="px-6 pb-6 text-gray-400 text-sm leading-relaxed">
                        We accept all major credit cards (Visa, Mastercard, American Express) as well as PayPal. For Team and Scout plans, we can also support invoice-based billing for annual contracts.
                    </div>
</details>
{/*  Question 4  */}
<details className="group bg-card-dark rounded-xl border border-white/5 overflow-hidden transition-all duration-300 open:border-primary/30 open:bg-[#252529]">
<summary className="flex justify-between items-center p-6 cursor-pointer list-none">
<span className="font-medium text-white group-hover:text-primary transition-colors">Do I need to sign a long-term contract?</span>
<span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180 text-gray-400">expand_more</span>
</summary>
<div className="px-6 pb-6 text-gray-400 text-sm leading-relaxed">
                        No, our standard plans are month-to-month. You can cancel at any time without penalty. Long-term contracts are only required={true} for custom enterprise solutions under the Scout plan.
                    </div>
</details>
</div>
</div>
</main>
{/*  Simple Footer  */}
<footer className="border-t border-white/5 bg-background-dark py-12">
<div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm">
<div className="flex items-center justify-center gap-2 mb-4 text-white">
<span className="material-symbols-outlined text-primary">sports_football</span>
<span className="font-bold">RepMax</span>
</div>
<p>© 2023 RepMax Intelligence. All rights reserved.</p>
</div>
</footer>
{/* Custom styles from Stitch */}
<style jsx>{`
        details > summary {
        details > summary::-webkit-details-marker {
        details[open] summary ~ * {
        @keyframes sweep {
            0%    {opacity: 0; transform: translateY(-10px)}
            100%  {opacity: 1; transform: translateY(0)}
        .feature-check {
`}</style>
    </>
  );
}
