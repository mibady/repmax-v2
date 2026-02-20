import Link from 'next/link';

export default function ClubScoutsPage(): React.JSX.Element {
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 max-w-5xl mx-auto">
        <Link href="/club" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-6 transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Scout Management</h1>
          <p className="text-slate-400 text-sm mt-1">
            Assign scouts to zones, track their evaluations, and manage coverage areas.
          </p>
        </div>

        <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-12 text-center">
          <span className="material-symbols-outlined text-slate-600 text-5xl mb-4">group</span>
          <h3 className="text-white font-semibold text-lg mb-2">No scouts assigned yet</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Scout management is being built. You will be able to add scouts, assign zones, and track evaluation reports here.
          </p>
        </div>
      </div>
    </div>
  );
}
