import Link from 'next/link';

export default function Page() {
  return (
    <>
      {/*  Background 404 Watermark  */}
<div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none z-0 overflow-hidden">
<span className="text-[30vw] font-black leading-none text-primary opacity-5 dark:opacity-10 tracking-tighter transform translate-y-4">
            404
        </span>
</div>
{/*  Main Content Container  */}
<main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10 w-full max-w-7xl mx-auto h-full min-h-[80vh]">
<div className="flex flex-col items-center text-center space-y-8 max-w-lg mx-auto animate-fade-in-up">
{/*  Icon/Graphic (Optional, but adds to the empty state feel)  */}
<div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-2 ring-1 ring-primary/30">
<span className="material-symbols-outlined text-primary text-5xl">sports_football</span>
</div>
{/*  Text Content  */}
<div className="space-y-4">
<h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Wrong Route
                </h1>
<p className="text-lg text-slate-600 dark:text-text-secondary max-w-md mx-auto leading-relaxed">
                    Looks like this play got called back. The page you're looking for doesn't exist on our playbook.
                </p>
</div>
{/*  Actions  */}
<div className="flex flex-col items-center gap-6 w-full pt-4">
<Link className="group relative inline-flex items-center justify-center px-8 py-3.5 text-sm font-bold text-black transition-all duration-200 bg-primary font-display rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary hover:bg-yellow-400 w-full sm:w-auto min-w-[200px] shadow-[0_0_20px_rgba(242,196,13,0.3)] hover:shadow-[0_0_30px_rgba(242,196,13,0.5)]" href="/">
<span className="material-symbols-outlined mr-2 text-[20px]">home</span>
                    Back to Home
                </Link>
<Link className="inline-flex items-center text-primary hover:text-yellow-300 font-medium transition-colors text-sm group" href="/">
<span className="material-symbols-outlined mr-2 text-[20px]">search</span>
                    Search Athletes
                    <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
</Link>
</div>
</div>
</main>
{/*  Footer  */}
<footer className="w-full py-8 relative z-10">
<div className="container mx-auto px-4 flex justify-center">
<div className="flex flex-col items-center gap-2">
<p className="text-primary text-base font-bold tracking-[0.15em] opacity-80">REPMAX</p>
<div className="h-0.5 w-8 bg-primary/30 rounded-full"></div>
</div>
</div>
</footer>
    </>
  );
}
