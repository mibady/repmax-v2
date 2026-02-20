import Link from 'next/link';

const settingsCards = [
  {
    icon: 'notifications',
    title: 'Notifications',
    description: 'Manage email and push notification preferences.',
    href: '/settings/notifications',
    enabled: true,
  },
  {
    icon: 'person',
    title: 'Profile',
    description: 'Update your name, photo, and contact info.',
    href: '#',
    enabled: false,
  },
  {
    icon: 'lock',
    title: 'Security',
    description: 'Password, two-factor authentication, and sessions.',
    href: '#',
    enabled: false,
  },
  {
    icon: 'palette',
    title: 'Appearance',
    description: 'Theme, display density, and accessibility.',
    href: '#',
    enabled: false,
  },
];

export default function SettingsPage(): React.JSX.Element {
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400 text-sm mb-8">Manage your account and preferences.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {settingsCards.map((card) => {
            const content = (
              <div
                className={`bg-[#1F1F22] rounded-xl border border-white/5 p-6 transition-colors ${
                  card.enabled ? 'hover:border-primary/30 cursor-pointer' : 'opacity-50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="size-10 rounded-lg bg-[#2A2A2E] flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-[20px]">{card.icon}</span>
                  </div>
                  {!card.enabled && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                      Soon
                    </span>
                  )}
                </div>
                <h3 className="text-white font-semibold mb-1">{card.title}</h3>
                <p className="text-slate-400 text-sm">{card.description}</p>
              </div>
            );

            if (card.enabled) {
              return (
                <Link key={card.title} href={card.href}>
                  {content}
                </Link>
              );
            }

            return <div key={card.title}>{content}</div>;
          })}
        </div>
      </div>
    </div>
  );
}
