'use client';

type BillingToggleProps = {
  isAnnual: boolean;
  onChange: (annual: boolean) => void;
};

export default function BillingToggle({ isAnnual, onChange }: BillingToggleProps) {
  return (
    <div className="flex items-center justify-center mb-10">
      <div className="inline-flex items-center rounded-full bg-surface-dark border border-white/10 p-1">
        <button
          onClick={() => onChange(false)}
          className={`relative px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            !isAnnual
              ? 'bg-primary text-background-dark shadow-lg'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => onChange(true)}
          className={`relative flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            isAnnual
              ? 'bg-primary text-background-dark shadow-lg'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Annual
          <span className="inline-flex items-center rounded-full bg-accent-green/20 text-accent-green text-[10px] font-bold px-2 py-0.5">
            Save ~17%
          </span>
        </button>
      </div>
    </div>
  );
}
