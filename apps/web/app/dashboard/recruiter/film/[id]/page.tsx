'use client';

import Link from 'next/link';

interface Bookmark {
  id: string;
  timestamp: string;
  note: string;
  addedBy: string;
  avatar: string;
  isActive?: boolean;
}

interface AthleteInfo {
  name: string;
  classYear: string;
  school: string;
  height: string;
  weight: string;
}

const athlete: AthleteInfo = {
  name: 'John Doe',
  classYear: 'Class of 2025',
  school: 'Westlake High',
  height: '6\'2"',
  weight: '195 lbs',
};

const bookmarks: Bookmark[] = [
  {
    id: '1',
    timestamp: '0:34',
    note: 'Great pocket awareness under pressure',
    addedBy: 'Coach Mike',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBcvPR01euaqikT5K38tvFLJv0HCE6beAN1YdSlJJHrXSH38kdh7yTZ0HxOfR5u7lW3f7_1A7vwifF5G749t2a6jcM-7jspUzHP_qqQUZafEkzesfMjg1Gosi66KebE6irJCHG8eAIQnjSVuF9JozSiKKfVUtEvnuu_JeU_1rFri48r1rsidNYeWF_IgSKhGoHffkvdcdj-OcT69EJEWSN5hvSoFBHjRQwSP_6FMu30C2cXx9OiYqJtEXYsPqqcIdxUdyXq9EK-fMs',
    isActive: true,
  },
  {
    id: '2',
    timestamp: '1:12',
    note: '50-yard deep ball accuracy - Perfect spiral',
    addedBy: 'Coach Mike',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmhuHHiQWA15fJNmMennsGKjkB20YqtEj0YIob7pCn-M9VHWRUbco_6ktO1TO1kLJYQViGUBgr-i2HZmyWYXvX--0AdogFHDELdQLDi3aH8-SdbXIwVj_QSI1zs4SE1fmZhT_e92crJWsOhtiUtWYXSnFVEByrtHu8vN5Qlve_CtON4O6miD4aToXK8AamQ_0Ckf6qsEJI6_u5O9tkJ5KSDLPsCcD3rgxe52uV__C4dfhJZOEEB7KkNFBEG7KPt1Ga7wAVZc1UNe4',
  },
  {
    id: '3',
    timestamp: '2:05',
    note: 'Scramble drill - good improvisation',
    addedBy: 'Scout Team A',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAc3FZEYXDZozAOGOVYOW6HbImxmdOzYjv1gBb7W64-6FoowappTRj3xo3y1IQDqI3eCj5m_mes5N4atGJKnkr-X6OdwiJ_J7SofkstcIcC7Jilql36uX_xTo2dgrdU5b9niL4hBdyoIioJbEay9YA46wuHCk2HNGdjlH175ZBiLByfg7srVlW8A4mGnDTIThuQFBiRXoOjc0d_0RKt9hy3UM0XQvMUjc88aQkQfnwrNggT2AMnvHuCgrzOJb7QASGwAcKerlI4Fc8',
  },
];

const timelineMarkers = [
  { position: 12, title: 'Great pocket awareness' },
  { position: 48, title: '50-yard deep ball' },
  { position: 82, title: 'Scramble drill' },
];

export default function RecruiterFilmPlayerPage() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="w-full border-b border-[#333] bg-[#141414] px-6 py-3 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 text-primary">
              <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
                <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
              </svg>
            </div>
            <h1 className="text-white text-lg font-bold tracking-tight">RepMax</h1>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link className="text-sm font-medium text-gray-300 hover:text-primary transition-colors" href="#">Dashboard</Link>
            <Link className="text-sm font-medium text-white" href="#">Athletes</Link>
            <Link className="text-sm font-medium text-gray-300 hover:text-primary transition-colors" href="#">Teams</Link>
            <Link className="text-sm font-medium text-gray-300 hover:text-primary transition-colors" href="#">Messages</Link>
          </nav>
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-white transition-colors relative">
              <span className="material-symbols-outlined text-[24px]">notifications</span>
              <span className="absolute top-0 right-0 size-2 bg-primary rounded-full border-2 border-[#141414]"></span>
            </button>
            <div
              className="size-9 rounded-full bg-cover bg-center border border-[#333]"
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCo8aVNcrO1HQAOFb9up3mWn1yVjnITbYX7gwJtkNmYWTYufKi20BQedCrN9q_Wwh6CebQi8aNr1B3XgsJWkCjTuL9HFeO1nVcvp-pGvH7PMKRPgA2n1dGXpB2vLQG-83zGgVgUJrua6fipmBk7bgKCvEA_4qGzLn_FUFYBM4FPh-WSgPkUf5ecLyQ7NEw44AX6WTyqfv36oAHx9U155u3A0TJGLvRTInwcTuZNQl20tvwzL02QxzrEPJpLuZdZHIzbArATMm0L-28')" }}
            ></div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 w-full max-w-[960px] mx-auto p-4 md:py-8 flex flex-col gap-6">
        {/* Video Player Component */}
        <div className="group/player relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
          {/* Video Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-90 transition-opacity duration-300"
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDFayXrbblahT4oD7SrdxrFWbDEhetuf0fu9P9Ae0kUCHLcO43XPxwKx8HnO6ZOSYjM1hnNkng-2mQH_xdnFjVofi9SsUuIfICv7fClVYuU_Zk15k65bZGdP7lUbKAfFurxFML5srmyH_KNjafsNdR_qZy4lJUoC-8ZOJD4DL6C4d10IMcahPsT5kcSfpkYDjJLVNnHwR0-eHhJYwqxi_vCitPBxdbwXaMRWFTraSR1r_G4k6LuplPIJCABQV3nFNDNH2R5T8iTqpE')" }}
          ></div>
          {/* Video Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none"></div>

          {/* Centered Play Button */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover/player:scale-105 transition-transform duration-300">
            <button className="pointer-events-auto flex items-center justify-center size-20 rounded-full bg-primary/90 hover:bg-primary text-[#0f0f0f] shadow-[0_0_30px_rgba(237,188,29,0.3)] transition-all backdrop-blur-sm">
              <span className="material-symbols-outlined text-[40px] ml-1">play_arrow</span>
            </button>
          </div>

          {/* Top Controls (Title Overlay) */}
          <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start opacity-0 group-hover/player:opacity-100 transition-opacity duration-300">
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg drop-shadow-md">Junior Season Highlights</span>
              <span className="text-white/70 text-sm font-mono drop-shadow-md">1080p • 60FPS</span>
            </div>
            <button className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>

          {/* Bottom Control Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-[#0f0f0f]/90 backdrop-blur-md px-6 py-4 translate-y-full group-hover/player:translate-y-0 transition-transform duration-300 ease-out">
            {/* Timeline Scrubber */}
            <div className="relative w-full h-1.5 bg-white/20 rounded-full mb-4 cursor-pointer group/timeline">
              {/* Progress */}
              <div className="absolute top-0 left-0 h-full w-[25%] bg-primary rounded-full relative">
                <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 size-3 bg-white rounded-full scale-0 group-hover/timeline:scale-100 transition-transform shadow-sm"></div>
              </div>
              {/* Bookmark Dots on Timeline */}
              {timelineMarkers.map((marker, idx) => (
                <div
                  key={idx}
                  className="absolute top-1/2 -translate-y-1/2 size-2 bg-primary rounded-full hover:scale-150 transition-transform cursor-pointer ring-2 ring-black/50"
                  style={{ left: `${marker.position}%` }}
                  title={marker.title}
                ></div>
              ))}
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <button className="hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[28px]">pause</span>
                </button>
                <button className="hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[24px]">replay_10</span>
                </button>
                <div className="flex items-center gap-2 group/volume">
                  <button className="hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[24px]">volume_up</span>
                  </button>
                  <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300">
                    <div className="h-1 bg-white/30 rounded-full w-16 ml-2 cursor-pointer">
                      <div className="h-full w-[70%] bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
                <span className="font-mono text-sm tracking-wide text-white/90">
                  <span className="text-primary font-medium">0:37</span> <span className="text-white/40">/</span> 2:23
                </span>
              </div>
              <div className="flex items-center gap-4">
                <button className="hover:text-primary transition-colors" title="Settings">
                  <span className="material-symbols-outlined text-[24px]">settings</span>
                </button>
                <button className="hover:text-primary transition-colors" title="Fullscreen">
                  <span className="material-symbols-outlined text-[24px]">fullscreen</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Video Info & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#333]">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold text-white tracking-tight">Junior Season Highlights - QB #12</h2>
            <div className="flex flex-wrap items-center gap-2 text-[#999] text-sm">
              <span className="text-primary font-medium">{athlete.name}</span>
              <span>•</span>
              <span>{athlete.classYear}</span>
              <span>•</span>
              <span>{athlete.school}</span>
              <span>•</span>
              <span className="bg-[#333] text-xs px-1.5 py-0.5 rounded text-white/80">{athlete.height}</span>
              <span className="bg-[#333] text-xs px-1.5 py-0.5 rounded text-white/80">{athlete.weight}</span>
            </div>
          </div>
          {/* Primary Action Buttons */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#333] hover:bg-[#444] text-white text-sm font-medium transition-colors border border-transparent hover:border-white/10">
              <span className="material-symbols-outlined text-[20px]">file_download</span>
              Download
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-[#dcae18] text-[#0f0f0f] text-sm font-bold transition-colors shadow-[0_0_15px_rgba(237,188,29,0.2)]">
              <span className="material-symbols-outlined text-[20px]">mail</span>
              Contact Athlete
            </button>
          </div>
        </div>

        {/* Secondary Actions & Bookmarks Layout */}
        <div className="grid md:grid-cols-[200px_1fr] gap-8">
          {/* Quick Actions Toolbar (Left) */}
          <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible py-2 md:py-0">
            <button className="flex md:flex-col items-center gap-2 p-3 rounded-lg hover:bg-[#1A1A1A] text-left md:text-center min-w-max transition-colors group">
              <div className="size-10 rounded-full bg-[#1A1A1A] group-hover:bg-[#333] flex items-center justify-center text-white transition-colors border border-[#333]">
                <span className="material-symbols-outlined text-[20px]">share</span>
              </div>
              <div className="flex flex-col md:items-center">
                <span className="text-sm font-medium text-white">Share</span>
                <span className="text-xs text-gray-500">at 0:37</span>
              </div>
            </button>
            <button className="flex md:flex-col items-center gap-2 p-3 rounded-lg hover:bg-[#1A1A1A] text-left md:text-center min-w-max transition-colors group">
              <div className="size-10 rounded-full bg-[#1A1A1A] group-hover:bg-[#333] flex items-center justify-center text-white transition-colors border border-[#333]">
                <span className="material-symbols-outlined text-[20px]">link</span>
              </div>
              <div className="flex flex-col md:items-center">
                <span className="text-sm font-medium text-white">Copy Link</span>
                <span className="text-xs text-gray-500">to clipboard</span>
              </div>
            </button>
            <button className="flex md:flex-col items-center gap-2 p-3 rounded-lg hover:bg-[#1A1A1A] text-left md:text-center min-w-max transition-colors group">
              <div className="size-10 rounded-full bg-[#1A1A1A] group-hover:bg-[#333] flex items-center justify-center text-white transition-colors border border-[#333]">
                <span className="material-symbols-outlined text-[20px]">flag</span>
              </div>
              <div className="flex flex-col md:items-center">
                <span className="text-sm font-medium text-white">Report</span>
                <span className="text-xs text-gray-500">Video issue</span>
              </div>
            </button>
          </div>

          {/* Bookmarks Column (Right) */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">bookmark</span>
                Recruiter Bookmarks
              </h3>
              <button className="text-primary hover:text-[#ffe066] text-sm font-bold flex items-center gap-1 hover:underline underline-offset-4 decoration-primary/50 transition-all">
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add Bookmark
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className={`group relative p-4 rounded-lg bg-surface-dark border transition-all duration-200 cursor-pointer ${
                    bookmark.isActive
                      ? 'border-primary/40 hover:border-primary shadow-lg shadow-black/20'
                      : 'border-[#333] hover:border-primary'
                  }`}
                >
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button className="text-gray-400 hover:text-white">
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button className="text-gray-400 hover:text-red-400">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-16 pt-1">
                      <span
                        className={`inline-flex items-center justify-center px-2 py-1 rounded font-mono text-sm font-medium border transition-colors ${
                          bookmark.isActive
                            ? 'bg-primary/10 text-primary border-primary/20 group-hover:bg-primary group-hover:text-black'
                            : 'bg-[#2a2a2a] text-gray-400 border-[#333] group-hover:text-black group-hover:bg-primary group-hover:border-primary'
                        }`}
                      >
                        {bookmark.timestamp}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p
                        className={`text-sm font-medium leading-relaxed transition-colors ${
                          bookmark.isActive ? 'text-white group-hover:text-primary' : 'text-gray-300 group-hover:text-white'
                        }`}
                      >
                        {bookmark.note}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className="size-5 rounded-full bg-gray-600 bg-cover"
                          style={{ backgroundImage: `url('${bookmark.avatar}')` }}
                        ></div>
                        <span className="text-xs text-gray-500">Added by {bookmark.addedBy}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-auto border-t border-[#333] py-6 text-center text-gray-600 text-sm">
        <p>© 2024 RepMax. All rights reserved.</p>
      </footer>
    </div>
  );
}
