'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createCheckoutSession, createOneTimeCheckout } from '@/lib/actions/subscription-actions';
import PricingTabs from './_components/PricingTabs';

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

  async function handleOneTimeCheckout(productSlug: string) {
    setLoadingPlan(productSlug);
    setError(null);
    try {
      const result = await createOneTimeCheckout(productSlug);
      if ('error' in result && result.error) {
        setError(result.error);
        return;
      }
      if ('sessionUrl' in result && result.sessionUrl) {
        window.location.href = result.sessionUrl;
        return;
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
<Link className="text-sm font-medium text-gray-300 hover:text-primary transition-colors" href="/#features">Features</Link>
<Link className="text-sm font-medium text-gray-300 hover:text-primary transition-colors" href="/">About</Link>
<Link className="text-sm font-medium text-primary transition-colors" href="/pricing">Pricing</Link>
<Link className="text-sm font-medium text-gray-300 hover:text-primary transition-colors" href="/login">Login</Link>
<Link href="/signup" className="bg-primary hover:bg-primary-hover text-background-dark text-sm font-bold py-2.5 px-6 rounded-full transition-all">
                    Get Started
                </Link>
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
<PricingTabs
  loadingSlug={loadingPlan}
  onCheckout={handleCheckout}
  onOneTimeCheckout={handleOneTimeCheckout}
/>
{/*  FAQ Section  */}
<div className="mt-24 max-w-3xl w-full mx-auto">
<h2 className="text-2xl font-bold text-center mb-10 text-white">Frequently Asked Questions</h2>
<div className="space-y-4">
{/*  Question 1  */}
<details className="group bg-card-dark rounded-xl border border-white/5 overflow-hidden transition-all duration-300 open:border-primary/30 open:bg-[#252529]">
<summary className="flex justify-between items-center p-6 cursor-pointer list-none">
<span className="font-medium text-white group-hover:text-primary transition-colors">Are the free plans really free forever?</span>
<span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180 text-gray-400">expand_more</span>
</summary>
<div className="px-6 pb-6 text-gray-400 text-sm leading-relaxed">
                        Yes. Both the Athlete Basic and Recruiter Free plans are completely free and always will be. They give you basic access to get started, and you can upgrade anytime to unlock more features.
                    </div>
</details>
{/*  Question 2  */}
<details className="group bg-card-dark rounded-xl border border-white/5 overflow-hidden transition-all duration-300 open:border-primary/30 open:bg-[#252529]">
<summary className="flex justify-between items-center p-6 cursor-pointer list-none">
<span className="font-medium text-white group-hover:text-primary transition-colors">Can I switch plans later?</span>
<span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180 text-gray-400">expand_more</span>
</summary>
<div className="px-6 pb-6 text-gray-400 text-sm leading-relaxed">
                        Absolutely. You can upgrade or switch plans at any time within your category. Upgrades take effect immediately and downgrades apply at the end of your current billing cycle. Annual plans offer ~17% savings on subscription products.
                    </div>
</details>
{/*  Question 3  */}
<details className="group bg-card-dark rounded-xl border border-white/5 overflow-hidden transition-all duration-300 open:border-primary/30 open:bg-[#252529]">
<summary className="flex justify-between items-center p-6 cursor-pointer list-none">
<span className="font-medium text-white group-hover:text-primary transition-colors">What payment methods do you accept?</span>
<span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180 text-gray-400">expand_more</span>
</summary>
<div className="px-6 pb-6 text-gray-400 text-sm leading-relaxed">
                        We accept all major credit cards (Visa, Mastercard, American Express) as well as PayPal. For enterprise and school plans, we can also support invoice-based billing for annual contracts.
                    </div>
</details>
{/*  Question 4  */}
<details className="group bg-card-dark rounded-xl border border-white/5 overflow-hidden transition-all duration-300 open:border-primary/30 open:bg-[#252529]">
<summary className="flex justify-between items-center p-6 cursor-pointer list-none">
<span className="font-medium text-white group-hover:text-primary transition-colors">Do I need to sign a long-term contract?</span>
<span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180 text-gray-400">expand_more</span>
</summary>
<div className="px-6 pb-6 text-gray-400 text-sm leading-relaxed">
                        No. Subscription plans (Athletes, Recruiters) are month-to-month and can be canceled anytime. School plans are billed annually. Events and Dashr products are one-time purchases with no recurring charges. Long-term contracts are only required for enterprise solutions.
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
<p>© 2026 RepMax Intelligence. All rights reserved.</p>
</div>
</footer>
    </>
  );
}
