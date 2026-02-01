'use client';

import Image from 'next/image';

export default function Page() {
  return (
    <>
      {/*  Ambient Background Effects  */}
<div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
<div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]"></div>
<div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-purple-900/20 rounded-full blur-[100px]"></div>
</div>
{/*  Main Card Container  */}
<main className="relative z-10 w-full max-w-[480px] bg-card-dark border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
{/*  Header Background (Subtle Texture)  */}
<div className="h-32 w-full bg-gradient-to-b from-[#1a1a1a] to-card-dark relative">
<div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
{/*  Zone Badge  */}
<div className="absolute top-4 right-4 bg-purple-900/80 border border-purple-500/50 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
<span className="material-symbols-outlined text-purple-200 text-[14px]">location_on</span>
<span className="text-[10px] font-bold tracking-wider text-purple-100 uppercase">West Zone</span>
</div>
</div>
{/*  Avatar & Identity Section  */}
<div className="px-6 relative -mt-16 flex flex-col items-center text-center">
{/*  Avatar  */}
<div className="relative group cursor-pointer">
<div className="w-24 h-24 rounded-full border-4 border-primary shadow-glow p-0.5 bg-card-dark overflow-hidden relative z-10 transition-transform duration-300 group-hover:scale-105">
<img alt="Portrait of athlete Jaylen Washington smiling" className="w-full h-full object-cover rounded-full" data-alt="Portrait of athlete Jaylen Washington smiling" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCz5tdm2iqfJ4HWNltYdzZxqDD6zvFqQFxnt8XAnlYNU5PepMx3HTwvhTH-esYE5zA4sgEvuLBo7PxEdcvYiBbXA7_loyZ49uw3KPhiG5s0H5PLQFYekJM4E6nKivPokKcEDg4l0cDCyg2eEJgsZz5FpYskvM5EYz5PCbDeWUyiB3r5lrztrr53ZUGsJ_FoaDdS7b0wv4EQuoJAgbTNAo_2LBmejJ7qGoSIDGQnEPDBLujfO4I48IZ12Yfa4lE-S6jUgG40lXh2rnQ" />
</div>
{/*  Verified Badge overlapping avatar  */}
<div className="absolute bottom-0 right-0 z-20 bg-green-900 border-2 border-card-dark rounded-full p-1.5 flex items-center justify-center shadow-md">
<span className="material-symbols-outlined text-green-400 text-[16px] leading-none" style={{fontVariationSettings: "'FILL' 1, 'wght' 700"}}>verified</span>
</div>
</div>
{/*  Name & School  */}
<div className="mt-4 flex flex-col gap-1">
<h1 className="text-3xl font-bold tracking-tight text-white">Jaylen Washington</h1>
<p className="text-gray-400 text-sm font-medium">Lincoln High School, San Diego, CA</p>
</div>
{/*  Position Pills  */}
<div className="mt-4 flex gap-3">
<div className="flex h-7 items-center justify-center px-4 rounded-full bg-primary/20 border border-primary/30">
<span className="text-primary text-xs font-bold tracking-wider">QB</span>
</div>
<div className="flex h-7 items-center justify-center px-4 rounded-full bg-neutral-800 border border-white/10">
<span className="text-gray-300 text-xs font-bold tracking-wider">S</span>
</div>
</div>
{/*  Ratings & Class  */}
<div className="mt-5 w-full flex items-center justify-between border-y border-white/5 py-3 px-2">
<div className="flex flex-col items-start gap-1">
<span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Class Of</span>
<span className="text-sm font-bold text-white">2025</span>
</div>
<div className="h-8 w-px bg-white/10"></div>
<div className="flex flex-col items-center gap-1">
<span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Rating</span>
<div className="flex gap-0.5">
<span className="material-symbols-outlined text-primary text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
<span className="material-symbols-outlined text-primary text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
<span className="material-symbols-outlined text-primary text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
<span className="material-symbols-outlined text-gray-700 text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
<span className="material-symbols-outlined text-gray-700 text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
</div>
</div>
<div className="h-8 w-px bg-white/10"></div>
<div className="flex flex-col items-end gap-1">
<span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Status</span>
<div className="flex items-center gap-1">
<span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
<span className="text-sm font-bold text-green-400">Verified</span>
</div>
</div>
</div>
</div>
{/*  Scrollable Content Area  */}
<div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
{/*  Section: Measurables  */}
<section>
<div className="flex items-center gap-2 mb-4">
<span className="material-symbols-outlined text-primary text-[20px]">straighten</span>
<h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase">Measurables</h2>
</div>
<div className="grid grid-cols-2 gap-3">
{/*  Stat Card  */}
<div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 hover:bg-white/10 transition-colors">
<span className="text-xs text-gray-500 font-medium">Height</span>
<span className="text-2xl text-white font-bold text-mono">6'2"</span>
</div>
{/*  Stat Card  */}
<div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 hover:bg-white/10 transition-colors">
<span className="text-xs text-gray-500 font-medium">Weight</span>
<span className="text-2xl text-white font-bold text-mono">195</span>
<span className="text-[10px] text-gray-500 -mt-1">lbs</span>
</div>
{/*  Stat Card  */}
<div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 hover:bg-white/10 transition-colors">
<span className="text-xs text-gray-500 font-medium">40-Yard</span>
<span className="text-2xl text-primary font-bold text-mono">4.52s</span>
</div>
{/*  Stat Card  */}
<div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 hover:bg-white/10 transition-colors">
<span className="text-xs text-gray-500 font-medium">Vertical</span>
<span className="text-2xl text-white font-bold text-mono">32"</span>
</div>
</div>
</section>
{/*  Section: Academics  */}
<section>
<div className="flex items-center gap-2 mb-4">
<span className="material-symbols-outlined text-primary text-[20px]">school</span>
<h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase">Academics</h2>
</div>
<div className="bg-white/5 border border-white/5 rounded-2xl p-5 flex items-center justify-between">
<div className="flex flex-col gap-1">
<span className="text-xs text-gray-500 font-medium">GPA</span>
<span className="text-xl text-white font-bold text-mono">3.8</span>
</div>
<div className="h-8 w-px bg-white/10"></div>
<div className="flex flex-col gap-1">
<span className="text-xs text-gray-500 font-medium">SAT</span>
<span className="text-xl text-white font-bold text-mono">1250</span>
</div>
<div className="h-8 w-px bg-white/10"></div>
<div className="flex flex-col gap-1">
<span className="text-xs text-gray-500 font-medium">NCAA ID</span>
<div className="flex items-center gap-1 text-green-400">
<span className="material-symbols-outlined text-[16px]">check_circle</span>
<span className="text-xs font-bold">Cleared</span>
</div>
</div>
</div>
</section>
{/*  Section: Film  */}
<section>
<div className="flex items-center justify-between mb-4">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[20px]">smart_display</span>
<h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase">Highlights</h2>
</div>
<span className="text-xs text-primary font-medium cursor-pointer hover:underline">View All</span>
</div>
<div className="relative w-full aspect-video rounded-2xl overflow-hidden group cursor-pointer border border-white/10">
<div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" data-alt="Blurred football field background for video thumbnail" style={{backgroundImage: "url('https"}}>
</div>
<div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
<div className="absolute inset-0 flex items-center justify-center">
<div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center pl-1 shadow-glow group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined text-black text-[32px] font-bold">play_arrow</span>
</div>
</div>
<div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md">
<p className="text-[10px] text-white font-medium">Mid-Season Highlights 2024</p>
</div>
</div>
</section>
</div>
{/*  Sticky Footer Actions  */}
<div className="p-6 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/5 flex flex-col gap-4">
<button className="w-full h-12 bg-primary hover:bg-yellow-500 text-black font-bold rounded-full flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-lg shadow-primary/20">
<span className="material-symbols-outlined text-[20px]">add</span>
                Add to Shortlist
            </button>
<button className="w-full h-12 bg-transparent border border-primary text-primary hover:bg-primary/10 font-bold rounded-full flex items-center justify-center gap-2 transition-all active:scale-95">
<span className="material-symbols-outlined text-[20px]">mail</span>
                Contact Coach
            </button>
<div className="w-full flex justify-center items-center gap-1.5 opacity-40 mt-2">
<span className="material-symbols-outlined text-[12px]">bolt</span>
<p className="text-[10px] font-medium tracking-widest uppercase">Powered by REPMAX</p>
</div>
</div>
</main>
{/* Custom styles from Stitch */}
<style jsx>{`
        .text-mono {
`}</style>
    </>
  );
}
