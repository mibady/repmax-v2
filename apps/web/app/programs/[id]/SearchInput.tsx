'use client';

import { useState } from 'react';

export default function SearchInput() {
  const [search, setSearch] = useState('');

  return (
    <div className="hidden sm:flex items-center rounded-full bg-[#1F1F22] px-3 py-1.5 ring-1 ring-white/5 focus-within:ring-[#D4AF37]/50 transition-all">
      <span className="material-symbols-outlined text-gray-500 text-[20px]">search</span>
      <input
        className="bg-transparent border-none text-sm text-white placeholder-gray-500 focus:ring-0 w-48"
        placeholder="Search programs..."
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
}
