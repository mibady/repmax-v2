import Link from "next/link";

const pricingPlans = [
  {
    name: "STARTER",
    description: "For the casual fan",
    price: "$0",
    priceLabel: "/mo",
    features: ["Basic Access", "Limited Search Queries", "Public Profiles Only"],
    cta: "Start Free",
    highlighted: false,
    color: "gray",
  },
  {
    name: "PRO",
    description: "For the serious recruiter",
    price: "$9.99",
    priceLabel: "/mo",
    features: [
      "Full Player Database",
      "Advanced Metrics & Stats",
      "Unlimited Search",
      "Export Data (CSV)",
    ],
    cta: "Go Pro",
    highlighted: true,
    color: "primary",
    badge: "Most Popular",
  },
  {
    name: "TEAM",
    description: "For the coaching staff",
    price: "$29.99",
    priceLabel: "/mo",
    features: [
      "5 Team Seats",
      "Collaboration Tools",
      "Shared Watchlists",
      "Priority Support",
    ],
    cta: "Get Team",
    highlighted: false,
    color: "green",
  },
  {
    name: "SCOUT",
    description: "For agencies & media",
    price: "Contact",
    priceLabel: "",
    features: [
      "API Access",
      "Custom Reporting",
      "Dedicated Account Manager",
      "SSO Integration",
    ],
    cta: "Contact Sales",
    highlighted: false,
    color: "purple",
  },
];

const faqs = [
  {
    question: "Is the Starter plan really free forever?",
    answer:
      "Yes, the Starter plan is completely free and always will be. It gives you basic access to public profiles and a limited number of search queries per day, perfect for casual fans keeping up with their team's recruiting class.",
  },
  {
    question: "Can I switch plans later?",
    answer:
      "Absolutely. You can upgrade to Pro or Team at any time to unlock more features immediately. Downgrades are effective at the end of your current billing cycle.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express) as well as PayPal. For Team and Scout plans, we can also support invoice-based billing for annual contracts.",
  },
  {
    question: "Do I need to sign a long-term contract?",
    answer:
      "No, our standard plans are month-to-month. You can cancel at any time without penalty. Long-term contracts are only required for custom enterprise solutions under the Scout plan.",
  },
];

export default function PricingPage() {
  return (
    <div className="bg-background-dark text-white font-sans overflow-x-hidden antialiased min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background-dark/80 backdrop-blur-md">
        <div className="px-4 md:px-10 lg:px-20 py-4 max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="text-primary">
              <span className="material-symbols-outlined !text-[32px]">
                sports_football
              </span>
            </div>
            <h2 className="text-white text-xl font-bold tracking-tight">
              RepMax
            </h2>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/#features"
              className="text-sm font-medium text-gray-300 hover:text-primary transition-colors"
            >
              Features
            </Link>
            <Link
              href="/#about"
              className="text-sm font-medium text-gray-300 hover:text-primary transition-colors"
            >
              About
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-primary transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-gray-300 hover:text-primary transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-primary hover:bg-primary-hover text-background-dark text-sm font-bold py-2.5 px-6 rounded-full transition-all"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Icon */}
          <div className="md:hidden text-white">
            <span className="material-symbols-outlined">menu</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center min-h-screen pt-12 pb-24 px-4 md:px-8">
        {/* Header Section */}
        <div className="max-w-4xl w-full text-center mb-16 space-y-4">
          <p className="text-primary text-sm font-bold tracking-widest uppercase">
            Pricing
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-white">
            Built for Access, <br className="hidden md:block" /> Not Exclusion
          </h1>
          <p className="text-text-grey text-lg font-light max-w-2xl mx-auto">
            Transparent pricing for every level of recruiting. Unlock the data
            you need to build a championship roster.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full max-w-7xl mx-auto items-stretch">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`group relative flex flex-col rounded-3xl bg-card-dark p-6 md:p-8 hover:-translate-y-2 transition-transform duration-300
                ${
                  plan.highlighted
                    ? "border-2 border-primary shadow-glow z-10 transform md:scale-105 xl:scale-110 xl:-mt-4 xl:mb-4"
                    : `border border-white/10 hover:border-${
                        plan.color === "green"
                          ? "green-500"
                          : plan.color === "purple"
                          ? "purple-500"
                          : "white"
                      }/50`
                }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-background-dark text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                  {plan.badge}
                </div>
              )}

              <div className="mb-6 space-y-2">
                <h3
                  className={`text-lg font-bold tracking-wide ${
                    plan.color === "primary"
                      ? "text-primary"
                      : plan.color === "green"
                      ? "text-green-500"
                      : plan.color === "purple"
                      ? "text-purple-500"
                      : "text-white"
                  }`}
                >
                  {plan.name}
                </h3>
                <p className="text-text-grey text-xs font-normal">
                  {plan.description}
                </p>
                <div className="pt-4 flex items-baseline gap-1">
                  <span
                    className={`${
                      plan.price === "Contact" ? "text-3xl" : "text-4xl"
                    } font-bold font-mono text-white`}
                  >
                    {plan.price}
                  </span>
                  {plan.priceLabel && (
                    <span className="text-gray-500 font-medium">
                      {plan.priceLabel}
                    </span>
                  )}
                </div>
              </div>

              <ul className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className={`flex items-start gap-3 text-sm ${
                      plan.highlighted
                        ? "text-white font-medium"
                        : "text-gray-300"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[20px] ${
                        plan.color === "primary"
                          ? "text-primary"
                          : plan.color === "green"
                          ? "text-green-500"
                          : plan.color === "purple"
                          ? "text-purple-500"
                          : "text-gray-500"
                      }`}
                      style={{
                        fontVariationSettings: "'FILL' 1, 'wght' 700",
                      }}
                    >
                      check
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 px-6 rounded-full text-sm font-bold transition-colors ${
                  plan.highlighted
                    ? "bg-primary hover:bg-primary-hover text-background-dark shadow-lg shadow-primary/20"
                    : plan.color === "green"
                    ? "bg-[#1F2937] hover:bg-[#374151] border border-green-500/30 text-white"
                    : plan.color === "purple"
                    ? "bg-[#1F2937] hover:bg-[#374151] border border-purple-500/30 text-white"
                    : "border border-white/20 hover:bg-white/5 text-white"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Billing Note */}
        <div className="mt-12 text-center">
          <p className="text-text-grey text-sm font-light">
            All plans billed monthly. Cancel anytime.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl w-full mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10 text-white">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group bg-card-dark rounded-xl border border-white/5 overflow-hidden transition-all duration-300 open:border-primary/30 open:bg-[#252529]"
              >
                <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
                  <span className="font-medium text-white group-hover:text-primary transition-colors">
                    {faq.question}
                  </span>
                  <span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180 text-gray-400">
                    expand_more
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-400 text-sm leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-background-dark py-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm">
          <div className="flex items-center justify-center gap-2 mb-4 text-white">
            <span className="material-symbols-outlined text-primary">
              sports_football
            </span>
            <span className="font-bold">RepMax</span>
          </div>
          <p>&copy; {new Date().getFullYear()} RepMax Intelligence. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
