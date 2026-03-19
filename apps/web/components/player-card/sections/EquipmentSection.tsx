'use client';

import type { PlayerCardData } from '../types';

function GearRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-gray-500 text-[16px]">{icon}</span>
        <span className="text-xs text-gray-400 font-medium">{label}</span>
      </div>
      <span className="text-xs text-white font-bold font-mono">{value || 'N/A'}</span>
    </div>
  );
}

export function EquipmentSection({ data }: { data: PlayerCardData }) {
  const hasAny = data.cleatSize || data.shirtSize || data.pantsSize || data.helmetSize || data.gloveSize;
  if (!hasAny) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary text-[20px]">checkroom</span>
        <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase">Equipment Sizes</h2>
      </div>
      <div className="bg-white/5 border border-white/5 rounded-2xl px-4">
        {data.cleatSize && <GearRow icon="steps" label="Cleats" value={data.cleatSize} />}
        {data.shirtSize && <GearRow icon="apparel" label="Shirt" value={data.shirtSize} />}
        {data.pantsSize && <GearRow icon="apparel" label="Pants" value={data.pantsSize} />}
        {data.helmetSize && <GearRow icon="sports_football" label="Helmet" value={data.helmetSize} />}
        {data.gloveSize && <GearRow icon="front_hand" label="Gloves" value={data.gloveSize} />}
      </div>
    </section>
  );
}
