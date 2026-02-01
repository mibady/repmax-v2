'use client';

import Link from 'next/link';

export default function Page() {
  return (
    <>
      {/*  Left Panel: Navigation (SideNavBar adapted)  */}
<aside className="w-20 lg:w-64 flex-shrink-0 border-r border-surface-light/30 bg-[#0a0a0a] flex flex-col justify-between p-4 hidden md:flex">
<div className="flex flex-col gap-8">
{/*  Logo Area  */}
<div className="flex items-center gap-3 pl-2">
<div className="bg-primary/20 p-2 rounded-lg">
<span className="material-symbols-outlined text-primary text-2xl">sports_football</span>
</div>
<h1 className="text-xl font-bold tracking-tight hidden lg:block">RepMax</h1>
</div>
{/*  Nav Links  */}
<nav className="flex flex-col gap-2">
<Link className="flex items-center gap-4 px-3 py-3 rounded-xl bg-surface-dark border border-primary/20 text-white group transition-all hover:bg-surface-light" href="/">
<span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">dashboard</span>
<span className="font-medium text-sm hidden lg:block">Dashboard</span>
</Link>
<Link className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-surface-dark/50 text-gray-400 hover:text-white transition-colors" href="/">
<span className="material-symbols-outlined">check_circle</span>
<span className="font-medium text-sm hidden lg:block">Onboarding</span>
</Link>
<Link className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-surface-dark/50 text-gray-400 hover:text-white transition-colors" href="/">
<span className="material-symbols-outlined">chat</span>
<span className="font-medium text-sm hidden lg:block">Messages</span>
</Link>
<Link className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-surface-dark/50 text-gray-400 hover:text-white transition-colors" href="/">
<span className="material-symbols-outlined">analytics</span>
<span className="font-medium text-sm hidden lg:block">Stats</span>
</Link>
</nav>
</div>
{/*  Bottom Actions  */}
<div className="flex flex-col gap-2">
<Link className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-surface-dark/50 text-gray-400 hover:text-white transition-colors" href="/">
<span className="material-symbols-outlined">settings</span>
<span className="font-medium text-sm hidden lg:block">Settings</span>
</Link>
<div className="flex items-center gap-3 mt-4 pt-4 border-t border-surface-light/30">
<div className="bg-center bg-no-repeat bg-cover rounded-full size-8 shrink-0 bg-gray-700" data-alt="User profile avatar placeholder" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAnczF0M2NXEv9PlC9z03IEATa7eRgWPRFrbnCSkXRh6n3Y5_fd4bMGuaN8Z7qWzRkrY41o4tgEAdcumyttk_ZY0rnA6JsAWBaKbxjTpLYb_qg9ParX00OGyYRQi-wvnrj0I96Er-oDzjrXgXrRxKZPdwtCcgrKd7yVBOt9a-Qhj7EtjwIxed7721bErAEvRRSPw_zerJAzcQQzVJV7mkKSuavtaM8zkgnl-j0WaUuvHHfaKD4XnGlaecjgKMP80Izhgvfi-qe3EQo')"}}></div>
<div className="hidden lg:flex flex-col">
<span className="text-sm font-medium leading-none">Jaylen W.</span>
<span className="text-xs text-gray-500 mt-1">Free Plan</span>
</div>
</div>
</div>
</aside>
{/*  Center Panel: Chat Interface (60% implied by flex-1 vs w-[400px])  */}
<main className="flex-1 flex flex-col min-w-0 bg-background-dark relative">
{/*  Chat Header  */}
<header className="flex items-center justify-between px-6 py-4 border-b border-surface-light/30 bg-background-dark/95 backdrop-blur z-10 sticky top-0">
<div className="flex items-center gap-3">
<div className="md:hidden">
<span className="material-symbols-outlined text-white">menu</span>
</div>
<div>
<h2 className="text-lg font-bold flex items-center gap-2">
                        RepMax AI
                        <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full border border-primary/20 uppercase tracking-wider font-bold">Beta</span>
</h2>
<p className="text-xs text-gray-400 flex items-center gap-1">
<span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        Live Session
                    </p>
</div>
</div>
<div className="flex items-center gap-4">
<button className="text-gray-400 hover:text-white transition-colors">
<span className="material-symbols-outlined">more_vert</span>
</button>
</div>
</header>
{/*  Chat Scroll Area  */}
<div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-6 scroll-smooth pb-32">
{/*  Timestamp  */}
<div className="flex justify-center">
<span className="text-xs font-mono text-gray-600">Today, 10:42 AM</span>
</div>
{/*  AI Message  */}
<div className="flex items-start gap-4 max-w-2xl">
<div className="size-10 rounded-full bg-surface-dark border border-white/10 flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-primary text-xl">smart_toy</span>
</div>
<div className="flex flex-col gap-2">
<div className="text-xs text-gray-400 ml-1">RepMax AI</div>
<div className="bg-surface-dark text-gray-100 px-5 py-4 rounded-xl rounded-tl-none border border-white/5 shadow-sm">
<p className="leading-relaxed">Welcome to the team, Jaylen. I'm here to build your athletic profile. Let's start with the basics. I've pulled some data from your registration.</p>
</div>
</div>
</div>
{/*  User Message  */}
<div className="flex items-start gap-4 max-w-2xl self-end flex-row-reverse">
<div className="size-10 rounded-full bg-center bg-cover shrink-0 border border-primary/30" data-alt="User avatar of Jaylen Washington" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAD58P2J0pEzKQ9hm6uFwxaCHl9at9ExVSAP5uvK-EQ0JzzI36DNyn8WkeMci7uHricjyA7aZIoKKY1mFMoTh9hsLOE1Dn0qhlq0p2svNlLKFqAncXEqNOarhrlBjlY05j0Xzx3YfshjhUY9IKVnfrxJLFU0J11oW2P3U4cDqRaev0e1YjO2SkGrPnSJ79qMCxbtiWXURyAS8chnWtGtZrZltQTIt6QSGhHlGyczcnaaunEf7jHQ0k2-vec4oLXOCL_YWhXPQ7BAmU')"}}></div>
<div className="flex flex-col gap-2 items-end">
<div className="text-xs text-gray-400 mr-1">Jaylen Washington</div>
<div className="bg-primary/5 text-primary-50 px-5 py-4 rounded-xl rounded-tr-none border-l-[3px] border-primary">
<p className="leading-relaxed">Sounds good. What do you have on file so far?</p>
</div>
</div>
</div>
{/*  System: Data Extraction Card  */}
<div className="flex flex-col gap-2 max-w-md ml-14">
<div className="text-[10px] font-mono text-accent-green uppercase tracking-widest flex items-center gap-2 mb-1">
<span className="material-symbols-outlined text-sm">terminal</span>
                    Data Extraction
                </div>
<div className="bg-[#0f0f11] border-l-[3px] border-accent-green rounded-r-xl p-4 font-mono text-sm text-gray-300 shadow-lg relative overflow-hidden group">
<div className="absolute top-0 right-0 p-2 opacity-50">
<span className="material-symbols-outlined text-accent-green text-lg">check_circle</span>
</div>
<div className="grid grid-cols-[80px_1fr] gap-y-2">
<span className="text-gray-500">NAME_ID:</span>
<span className="text-white">Jaylen Washington</span>
<span className="text-gray-500">SCHOOL:</span>
<span className="text-white">State University</span>
<span className="text-gray-500">POS_PRI:</span>
<span className="text-white bg-white/10 px-1 rounded inline-block w-fit">WR</span>
<span className="text-gray-500">CLASS:</span>
<span className="text-white">Junior (2025)</span>
</div>
</div>
</div>
{/*  AI Message  */}
<div className="flex items-start gap-4 max-w-2xl">
<div className="size-10 rounded-full bg-surface-dark border border-white/10 flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-primary text-xl">smart_toy</span>
</div>
<div className="flex flex-col gap-2">
<div className="text-xs text-gray-400 ml-1">RepMax AI</div>
<div className="bg-surface-dark text-gray-100 px-5 py-4 rounded-xl rounded-tl-none border border-white/5 shadow-sm">
<p className="leading-relaxed">I've locked those in. Now, let's talk speed. I see a 40-yard dash time from the regional combine. Can you confirm your latest verified time?</p>
</div>
</div>
</div>
{/*  User Message  */}
<div className="flex items-start gap-4 max-w-2xl self-end flex-row-reverse">
<div className="size-10 rounded-full bg-center bg-cover shrink-0 border border-primary/30" data-alt="User avatar of Jaylen Washington" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAbanrfGBumO8J4s9kB92pZI8aTeZxc1e7RCKMByP-tI10SjdyZnvtPUylxMKAsVcWjksttC-7ruXHRNiF_lXFNCZvRSWOu5V3h1cnTmoFXeC9g0A3dSR0G8IgAwE9J3avPtoZXLnwTnyBdKvG85S2YAai1CtJsShNeSSXQdpg0ceiIYlb_-NWaPW9J7xmGswqKaS-JKZUHYoN8mEqpnqCCbqwjCNmBJi3DyfEJbei_ILWwwVu__eZRb7zCmZsVAkKdly4M5OBPSCg')"}}></div>
<div className="flex flex-col gap-2 items-end">
<div className="text-xs text-gray-400 mr-1">Jaylen Washington</div>
<div className="bg-primary/5 text-primary-50 px-5 py-4 rounded-xl rounded-tr-none border-l-[3px] border-primary">
<p className="leading-relaxed">Yeah, I ran a 4.52 at the combine last month.</p>
</div>
</div>
</div>
{/*  System: Stats Validated Card  */}
<div className="flex flex-col gap-2 max-w-md ml-14">
<div className="text-[10px] font-mono text-primary uppercase tracking-widest flex items-center gap-2 mb-1">
<span className="material-symbols-outlined text-sm">verified</span>
                    Metric Validated
                </div>
<div className="bg-[#0f0f11] border-l-[3px] border-primary rounded-r-xl p-0 font-mono text-sm text-gray-300 shadow-lg overflow-hidden flex">
<div className="p-4 flex-1">
<div className="text-gray-500 text-xs mb-1">40-YARD DASH</div>
<div className="text-3xl font-bold text-white font-display tracking-tight">4.52s</div>
<div className="mt-2 flex items-center gap-2">
<span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-bold border border-primary/30">VERIFIED</span>
<span className="text-[10px] text-gray-500">Last updated: 2m ago</span>
</div>
</div>
<div className="w-16 bg-surface-light/30 flex flex-col items-center justify-center border-l border-white/5 gap-1">
<span className="material-symbols-outlined text-red-500 animate-pulse text-lg">sensors</span>
<span className="text-[9px] font-bold text-red-500 tracking-wider">LASER</span>
</div>
</div>
</div>
{/*  AI Message (Waiting)  */}
<div className="flex items-start gap-4 max-w-2xl">
<div className="size-10 rounded-full bg-surface-dark border border-white/10 flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-primary text-xl">smart_toy</span>
</div>
<div className="flex flex-col gap-2">
<div className="text-xs text-gray-400 ml-1">RepMax AI</div>
<div className="flex gap-1 items-center bg-surface-dark px-4 py-3 rounded-xl rounded-tl-none border border-white/5 w-fit">
<span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></span>
<span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-75"></span>
<span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-150"></span>
</div>
</div>
</div>
</div>
{/*  Input Area (Fixed Bottom)  */}
<div className="absolute bottom-0 left-0 right-0 bg-background-dark p-4 md:p-6 border-t border-surface-light/30">
<div className="max-w-4xl mx-auto relative flex items-end gap-2 bg-surface-dark rounded-2xl p-2 border border-surface-light shadow-2xl focus-within:border-primary/50 transition-colors">
<button className="p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors shrink-0">
<span className="material-symbols-outlined">attach_file</span>
</button>
<button className="p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors shrink-0">
<span className="material-symbols-outlined">photo_camera</span>
</button>
<textarea className="w-full bg-transparent border-none text-white placeholder-gray-500 focus:ring-0 resize-none py-3 max-h-32" placeholder="Type your response..." rows={1}></textarea>
<button className="p-3 bg-primary hover:bg-primary/90 text-background-dark rounded-xl font-bold transition-colors shrink-0 shadow-[0_0_15px_rgba(212,175,53,0.3)]">
<span className="material-symbols-outlined">send</span>
</button>
</div>
</div>
</main>
{/*  Right Panel: Context Sidebar (40%)  */}
<aside className="w-[400px] hidden xl:flex flex-col border-l border-surface-light/30 bg-[#080808]">
<div className="p-8 flex flex-col h-full gap-8 overflow-y-auto">
{/*  Progress Section  */}
<div className="flex flex-col items-center justify-center py-4">
<div className="relative size-40">
<svg className="size-full" viewBox="0 0 100 100">
{/*  Background circle  */}
<circle className="text-surface-dark stroke-current" cx="50" cy="50" fill="transparent" r="42" strokeWidth="8"></circle>
{/*  Progress circle  */}
<circle className="text-primary progress-ring__circle stroke-current" cx="50" cy="50" fill="transparent" r="42" strokeDasharray="263.89" strokeDashoffset="65.97" strokeLinecap="round" strokeWidth="8"></circle>
</svg>
<div className="absolute inset-0 flex flex-col items-center justify-center">
<span className="text-3xl font-bold text-white">75%</span>
<span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Complete</span>
</div>
</div>
<h3 className="mt-4 text-lg font-medium text-white">Profile Completeness</h3>
<p className="text-sm text-gray-500 text-center px-4 mt-1">You're almost there! Just a few more stats needed.</p>
</div>
{/*  Checklist  */}
<div className="flex flex-col gap-4">
<h4 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">Onboarding Steps</h4>
<div className="flex items-center gap-4 p-3 rounded-xl bg-surface-dark/50 border border-primary/20">
<div className="size-6 rounded-full bg-primary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-background-dark text-sm font-bold">check</span>
</div>
<div className="flex flex-col">
<span className="text-sm font-medium text-white decoration-primary">Personal Info</span>
<span className="text-[11px] text-gray-500">Completed 10:30 AM</span>
</div>
</div>
<div className="flex items-center gap-4 p-3 rounded-xl bg-surface-dark/50 border border-primary/20">
<div className="size-6 rounded-full bg-primary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-background-dark text-sm font-bold">check</span>
</div>
<div className="flex flex-col">
<span className="text-sm font-medium text-white">Academic History</span>
<span className="text-[11px] text-gray-500">Extracted from transcript</span>
</div>
</div>
<div className="flex items-center gap-4 p-3 rounded-xl bg-surface-dark border border-primary relative overflow-hidden">
<div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
<div className="size-6 rounded-full bg-transparent border-2 border-primary flex items-center justify-center shrink-0">
<span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
</div>
<div className="flex flex-col">
<span className="text-sm font-medium text-white">Athletic Measurables</span>
<span className="text-[11px] text-primary">In Progress...</span>
</div>
</div>
<div className="flex items-center gap-4 p-3 rounded-xl opacity-50">
<div className="size-6 rounded-full border-2 border-gray-700 flex items-center justify-center shrink-0">
</div>
<div className="flex flex-col">
<span className="text-sm font-medium text-gray-400">Highlight Reel</span>
<span className="text-[11px] text-gray-600">Pending</span>
</div>
</div>
</div>
{/*  Mini Companion Card Preview  */}
<div className="mt-auto">
<div className="flex justify-between items-center mb-3">
<h4 className="text-xs font-mono text-gray-500 uppercase tracking-widest">Live Preview</h4>
<span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-300">Recruiter View</span>
</div>
<div className="bg-gradient-to-br from-surface-dark to-[#151515] p-5 rounded-2xl border border-white/5 shadow-2xl">
<div className="flex items-start justify-between mb-4">
<div className="flex items-center gap-3">
<div className="bg-center bg-no-repeat bg-cover rounded-full size-12 border-2 border-white/10" data-alt="User avatar small" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBGI8Z-NysUcyUgknpkcQG3PptKiHEKzn4AEFLg1RnO5g0g5qF45-DZYCph1G-JL8-7cFI6AeumXm6K_WXd2BuYSz5YKMqb9X7Uue_g7928_E6M7nLXwsFp2XjBMQM-MjAsRd3CrM4OPGLsrC64eUG0Sifub--Qoz3fUS3rbY5tSzxnWdHkY855ihkJYC8K9GPgJ_U8QjtKDF3fXQK-mxduJU714yJi8581NcWktuYkWSsB7npKof1FLUkT_kdLMdwxJ4rPlfBLsVU')"}}></div>
<div>
<h5 className="font-bold text-white text-sm">Jaylen W.</h5>
<p className="text-[10px] text-gray-400">Class of '25 • WR</p>
</div>
</div>
<div className="bg-primary/20 p-1.5 rounded-lg">
<span className="material-symbols-outlined text-primary text-sm">star</span>
</div>
</div>
<div className="grid grid-cols-2 gap-2">
<div className="bg-black/30 p-2 rounded-lg border border-white/5">
<p className="text-[9px] text-gray-500 uppercase">Height</p>
<p className="text-xs font-mono font-bold">6'1"</p>
</div>
<div className="bg-black/30 p-2 rounded-lg border border-white/5">
<p className="text-[9px] text-gray-500 uppercase">Weight</p>
<p className="text-xs font-mono font-bold">195 lbs</p>
</div>
<div className="bg-black/30 p-2 rounded-lg border border-primary/30 relative overflow-hidden">
<div className="absolute inset-0 bg-primary/5"></div>
<p className="text-[9px] text-primary uppercase">40 YD</p>
<p className="text-xs font-mono font-bold text-white">4.52s</p>
</div>
<div className="bg-black/30 p-2 rounded-lg border border-white/5 opacity-50">
<p className="text-[9px] text-gray-500 uppercase">Vertical</p>
<p className="text-xs font-mono font-bold text-gray-500">--</p>
</div>
</div>
</div>
</div>
</div>
</aside>
{/* Custom styles from Stitch */}
<style jsx>{`
        .progress-ring__circle {
`}</style>
    </>
  );
}
