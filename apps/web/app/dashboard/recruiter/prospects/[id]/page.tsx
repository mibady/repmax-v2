'use client';

interface TimelineItem {
  id: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  time: string;
  attachment?: { name: string };
}

interface SimilarProspect {
  id: string;
  name: string;
  position: string;
  classYear: string;
  location: string;
  rating: number;
  avatar: string;
}

const timelineData: TimelineItem[] = [
  {
    id: '1',
    icon: 'visibility',
    iconBg: 'bg-[#363225]',
    iconColor: 'text-primary',
    title: 'Viewed Companion Card',
    description: 'Recruiter Alex Coachman viewed profile stats.',
    time: '2h ago',
  },
  {
    id: '2',
    icon: 'mail',
    iconBg: 'bg-purple-500/20',
    iconColor: 'text-purple-500',
    title: 'Emailed Coach Smith',
    description: 'Sent intro packet and request for transcripts.',
    time: 'Yesterday',
    attachment: { name: 'Intro_Packet_v2.pdf' },
  },
  {
    id: '3',
    icon: 'person_add',
    iconBg: 'bg-[#363225]',
    iconColor: 'text-[#c3b998]',
    title: "Added to 'Evaluating'",
    description: 'Moved from New Lead.',
    time: 'Oct 1',
  },
];

const similarProspects: SimilarProspect[] = [
  {
    id: '1',
    name: 'Michael Brown',
    position: 'QB',
    classYear: "'24",
    location: 'Dallas, TX',
    rating: 4.8,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXOw77-WaRGMyt7rfEIrtXuxfyd6QpZIR6cdZEgUcziDoWWTPhVZMBIae7UKP9qDPX6MCfvy1wGxRoadhaBJ8al04Mq1bF6o2fejJ9mxwAOPnfYW2lat-7J5DamGyDk0WCQ8hUE3vjAuVs6qA1lUvg-31TeL6MlolG75kS207lXybZYuKi3pri5ZdpROqQx14TH6ehHWsjXS2xOFM4XE-emH8qFiFb2MkNJnJOJ4O0p6KOYQubsveFf2CJk6G0Da4j1g_kJRu0RtE',
  },
  {
    id: '2',
    name: 'Chris Davis',
    position: 'QB',
    classYear: "'25",
    location: 'Houston, TX',
    rating: 5.0,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbX49rdby_B7ySEXe2h64cEoawJqU4exXtf1r2qUcKWXFie-7HGweAZg71EuL6UIQmbGuaISnWpAHQJYb1bcsVn4gnNHRFWN-McEuhm_NGHYAA5DReivxRu-xr0qhjbewRm2Y2FBjFFSubZn_jo4KYwkx3k9jQwS-bfwKshJ49Y0gL7oE2iXc96nMtKhnh78q-KA1VzVH-fI8FDBflCLksM7sk2McnC-3gCi3aPuRUo0j5zx6bdEL6S_3G8yQFPQBRBRXbJbmumuE',
  },
  {
    id: '3',
    name: 'Marcus Jones',
    position: 'QB',
    classYear: "'24",
    location: 'Austin, TX',
    rating: 4.5,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkhruovHJ1jejLSWYlYP5_HLW0_BFjk92VBoKQkhHOyT-oSS0WbEtYJVeSJU21v14ON1qOEqbgfdwa03rjG6i8zJ4r5MDX57Z4oVRwoQsJcZcwdXe0ED0M3Cm9U7jK-IfbW9WiqKhip0g7lYY5rg_R69zNIlTcI422ry2jLjWlLVRCM10pBGsl3hQl5N3Z98RVxBjB9ctXswV3Q6eiK23zOArmzoTt1HG5QGF9Mj7jMSSht1dR7Bbp_sRGCItNS4NbVKB_IzLnZj8',
  },
  {
    id: '4',
    name: 'Tyrell Johnson',
    position: 'QB',
    classYear: "'24",
    location: 'Miami, FL',
    rating: 4.9,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgLeWFlsBf1vvWUSsGVpve0mhICIrMkRFkYb3LgCiAYbdZ7SlFnl4f7vyryDJAz8uxN8SIpbvgdMqkJxaCVT22Cxi8566DcRkpdmoXb9hcGy2KXrRXfC-zTZPlvE9PiTJED183dtbboTjqdwFX2GfY0fOmoFdORte24cByI4AIHhtrXbBkY0cFwa1uAtTfVz2ufit--Q2GZrHQaAG_TQ693wvjYtr0fMQkzCrIfyuu12ELosbrObsNErNu7valorvd8MW9G93QaCo',
  },
];

export default function ProspectDetailPage() {
  return (
    <div className="bg-slate-100 dark:bg-[#201d12] text-slate-900 dark:text-white overflow-x-hidden min-h-screen flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#433d28] px-6 py-3 bg-[#201d12] sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4 text-white">
            <div className="size-8 text-primary">
              <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path
                  clipRule="evenodd"
                  d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z"
                  fill="currentColor"
                  fillRule="evenodd"
                />
                <path
                  clipRule="evenodd"
                  d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z"
                  fill="currentColor"
                  fillRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em]">RepMax</h2>
          </div>
          <label className="hidden md:flex flex-col min-w-40 !h-10 max-w-64">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-[#2a271d] border border-[#433d28] group focus-within:border-primary transition-colors">
              <div className="text-[#c3b998] flex border-none items-center justify-center pl-4 rounded-l-lg border-r-0">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </div>
              <input
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-0 border-none bg-transparent focus:border-none h-full placeholder:text-[#c3b998] px-4 rounded-l-none border-l-0 pl-2 text-sm font-normal leading-normal"
                placeholder="Search athletes..."
              />
            </div>
          </label>
        </div>
        <div className="flex flex-1 justify-end gap-6 items-center">
          <div className="hidden lg:flex items-center gap-8 mr-4">
            <a className="text-white text-sm font-medium hover:text-primary transition-colors" href="#">
              Dashboard
            </a>
            <a className="text-primary text-sm font-bold" href="#">
              Prospects
            </a>
            <a className="text-white text-sm font-medium hover:text-primary transition-colors" href="#">
              Team
            </a>
            <a className="text-white text-sm font-medium hover:text-primary transition-colors" href="#">
              Settings
            </a>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end hidden md:flex">
              <span className="text-xs text-[#c3b998]">Recruiter</span>
              <span className="text-sm font-medium text-white">Alex Coachman</span>
            </div>
            <div
              className="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-purple-500/50"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBHOYz1K6OySk1AqSOVpHutcauAaqBhsfpnp5cinO8Fh2tOgEa9aS9h6RVI8yxZUCsovVfz1hiI4_LcSbZ4rw24OrP0grNTNiTvB-jKBFsZrkHIEAuJKGokgIfEgcMzsW0efb1ezK_l0xhLw9YwXU2yB5sunih4e_LJG6DboP8N7jWeuKvwU1iY5dlTeTABLCWG6HofO0euVY6qhvS8SKgYDeFa8g6HFej1kPAF4-GOMfnEqzTU1XdHs51bG7OPY4vWnimahGxo-aI")',
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 flex justify-center py-6 px-4 md:px-8 lg:px-12 xl:px-20">
        <div className="w-full max-w-[1400px] flex flex-col gap-6">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm">
            <a className="text-[#c3b998] hover:text-primary transition-colors" href="#">
              Prospects
            </a>
            <span className="text-[#c3b998] material-symbols-outlined text-[20px]">chevron_right</span>
            <span className="text-white font-medium">Jaylen Washington</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Athlete Profile */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Companion Card / Main Profile */}
              <div className="bg-[#2a271d] rounded-xl border border-[#433d28] overflow-hidden">
                {/* Hero Image & Header */}
                <div className="relative h-48 bg-gradient-to-t from-black/80 to-transparent">
                  <div
                    className="absolute inset-0 bg-center bg-cover bg-no-repeat opacity-60"
                    style={{
                      backgroundImage:
                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAlhsu5uM6tvCrKhFmxIgnwMRY7ag08qcV3ttMjeT7gtDKQslh_Ug_mwacNJJiYWMJHnuH_KN4EpY9w9XE4Bi-EVgLlf_pTtpJ_lKTi4z48NJOJVSG0zZfaM0b2iidcZtu3h-FCXI-d0kjy-V6lWhAxnp_239953lmHnIORnlQR7aW1L8TpKHPACI982vPKyi6XdB6gqQlcsqije4Vr8pwTrlvmRdBgITvByBBNiwQ4fTBWqHF_F_6qCi-KY8B5bFXn9K68-I6hUEM")',
                    }}
                  />
                  <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#2a271d] via-[#2a271d]/90 to-transparent pt-20">
                    <div className="flex justify-between items-end">
                      <div>
                        <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-1">
                          Jaylen Washington
                        </h1>
                        <p className="text-[#c3b998] text-sm">Lincoln High School, TX | Class of 2024</p>
                      </div>
                      <div className="flex flex-col items-center bg-[#363225] p-2 rounded-lg border border-[#433d28] shadow-lg">
                        <span className="text-primary font-black text-xl leading-none">#1</span>
                        <span className="text-[10px] uppercase tracking-wider text-[#c3b998]">QB Rank</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="p-6 pt-2 flex flex-col gap-6">
                  {/* Rating & Position */}
                  <div className="flex items-center justify-between pb-4 border-b border-[#433d28]/50">
                    <div className="flex items-center gap-1 text-primary">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className="material-symbols-outlined"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                      ))}
                      <span className="ml-2 text-white font-bold text-sm">5-Star Recruit</span>
                    </div>
                    <div className="px-3 py-1 bg-white/10 rounded text-white text-xs font-bold tracking-wide">QB</div>
                  </div>

                  {/* Physical Stats */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'Height', value: '6\'2"' },
                      { label: 'Weight', value: '215' },
                      { label: '40 YD', value: '4.45' },
                      { label: 'GPA', value: '3.8' },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="bg-[#363225] p-3 rounded-lg border border-[#433d28] text-center"
                      >
                        <p className="text-[#c3b998] text-xs uppercase mb-1">{stat.label}</p>
                        <p className="text-white font-bold">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Highlights */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-white font-semibold text-sm">Featured Highlight</h3>
                      <a className="text-primary text-xs font-medium hover:underline" href="#">
                        View All
                      </a>
                    </div>
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-[#433d28] group cursor-pointer">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{
                          backgroundImage:
                            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBvgQanpt3PYfrkU-si9UEqkyxPP-1F17DVVri4R81aCYaoDmS15veQlVzFHyweZzl-9qVSbQ581xUaOseXPPZUSYMR7797-vb0jAEpz2CE6NaypynThHFQtU0RuCbr8VgD-kTtfHsP8s3CYmf9ze-MYu3cCyaL4c83Ia4NNJs3W9pfok45bgQdhok9b_7gBGIyeXLYmxiF4_b-KZNNoQvZDZ-WVEPsOb7ZxqEKq-tFSmNOls36dg0FAUtVKmxP_wtBrtWcxsSm64w")',
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className="size-12 rounded-full bg-primary/90 text-[#201d12] flex items-center justify-center pl-1 shadow-lg group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined">play_arrow</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Actions */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { icon: 'call', label: 'Call' },
                      { icon: 'mail', label: 'Email' },
                      { icon: 'chat', label: 'DM' },
                    ].map((action) => (
                      <button
                        key={action.label}
                        className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-[#363225] hover:bg-[#363225]/80 border border-[#433d28] transition-colors group"
                      >
                        <span className="material-symbols-outlined text-[#c3b998] group-hover:text-primary">
                          {action.icon}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-[#c3b998]">{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-[#2a271d] rounded-xl border border-[#433d28] p-6">
                <h3 className="text-white font-semibold text-lg mb-4">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  {[
                    { label: 'Bench Press', value: '285 lbs' },
                    { label: 'Squat', value: '405 lbs' },
                    { label: 'Vert. Jump', value: '32 in' },
                    { label: 'Hand Size', value: '9.5 in' },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p className="text-[#c3b998] text-xs uppercase">{stat.label}</p>
                      <p className="text-white font-medium">{stat.value}</p>
                    </div>
                  ))}
                  <div className="col-span-2 pt-2 border-t border-[#433d28]/50 mt-2">
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[#c3b998] text-sm">Eligibility Status</span>
                      <span className="text-green-500 text-sm font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span> Verified
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: CRM */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* CRM Control Bar */}
              <div className="bg-[#2a271d] p-4 rounded-xl border border-[#433d28] flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-3 flex-wrap">
                  {/* Stage Dropdown */}
                  <div className="relative">
                    <select className="appearance-none bg-[#363225] text-white pl-9 pr-8 py-2 rounded-lg border border-[#433d28] focus:border-primary focus:outline-none text-sm font-medium cursor-pointer min-w-[140px]">
                      <option>New Lead</option>
                      <option>Evaluating</option>
                      <option>Offered</option>
                      <option>Committed</option>
                    </select>
                    <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-primary text-[20px]">
                      manage_search
                    </span>
                    <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#c3b998] text-[20px] pointer-events-none">
                      expand_more
                    </span>
                  </div>

                  {/* Priority Toggle */}
                  <div className="flex items-center gap-2 bg-[#363225] px-3 py-2 rounded-lg border border-primary/40 cursor-pointer hover:bg-[#363225]/80">
                    <span
                      className="material-symbols-outlined text-primary text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      flag
                    </span>
                    <span className="text-white text-sm font-medium">High Priority</span>
                  </div>
                </div>

                {/* Assignee */}
                <div className="flex items-center gap-3 pl-4 border-l border-[#433d28] max-sm:border-l-0 max-sm:pl-0">
                  <div className="flex -space-x-2">
                    <div
                      className="size-8 rounded-full border-2 border-[#2a271d] bg-cover bg-center"
                      style={{
                        backgroundImage:
                          'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBT6lVP2vMHhhplOqEZXsC1ImBe8R5yLP5nvtKNmoENNRz_c45kd4TxJ_9XM2EhiUTtGKzw-uG7J1j3xj_-Ey4-0AqZpF4QCF1yCZQ9BDsstxzXs1mUbvVbEcmWx6Ttj_Ho2WIXNIuOdW_oRKpWGxur95qhRPQfyXuXgVM7iAdR9LHrqBhKmrsZiQAVOxP0XOg3xAdwP9f9sJFsMX_FZM-jxahpkth70fzjQooTHvVZ-9nD4c2LofRTefzJEzduCw9FelwMs4xDDd4")',
                      }}
                    />
                    <div className="size-8 rounded-full border-2 border-[#2a271d] bg-[#363225] flex items-center justify-center text-xs font-medium text-[#c3b998] hover:bg-primary hover:text-white cursor-pointer transition-colors">
                      +
                    </div>
                  </div>
                  <span className="text-sm text-[#c3b998]">Assignee</span>
                </div>
              </div>

              {/* Next Action Card */}
              <div className="bg-gradient-to-r from-[#2a271d] to-[#363225] p-1 rounded-xl">
                <div className="bg-[#2a271d] rounded-[10px] border-l-4 border-primary p-5 flex justify-between items-center shadow-lg relative overflow-hidden">
                  <div className="absolute right-0 top-0 h-full w-1/3 bg-primary/5 -skew-x-12 blur-xl"></div>
                  <div className="relative z-10">
                    <p className="text-primary text-xs font-bold uppercase tracking-wider mb-1">Next Action Required</p>
                    <h3 className="text-white text-lg font-bold">Schedule campus visit</h3>
                    <p className="text-[#c3b998] text-sm mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">event</span> Due by Oct 12, 2023
                    </p>
                  </div>
                  <button className="relative z-10 bg-primary hover:bg-primary/90 text-[#201d12] font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                    <span>Complete</span>
                    <span className="material-symbols-outlined text-[20px]">check</span>
                  </button>
                </div>
              </div>

              {/* Tags & Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tags */}
                <div className="bg-[#2a271d] p-5 rounded-xl border border-[#433d28]">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-semibold text-sm">Tags</h3>
                    <button className="text-[#c3b998] hover:text-white">
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium border border-primary/20">
                      QB Target
                    </span>
                    <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-500 text-xs font-medium border border-purple-500/20">
                      Class of &apos;24
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[#363225] text-[#c3b998] text-xs font-medium border border-[#433d28]">
                      In-State
                    </span>
                    <button className="px-3 py-1 rounded-full border border-dashed border-[#c3b998]/50 text-[#c3b998] text-xs font-medium hover:text-white hover:border-white transition-colors">
                      + Add
                    </button>
                  </div>
                </div>

                {/* Quick Note */}
                <div className="bg-[#2a271d] p-5 rounded-xl border border-[#433d28] flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-white font-semibold text-sm">Latest Note</h3>
                    <span className="text-[10px] text-[#c3b998]">Edited 2h ago</span>
                  </div>
                  <p className="text-[#c3b998] text-sm leading-relaxed flex-1">
                    &quot;Arm strength is elite. Showing great pocket presence in recent games. Need to verify
                    transcript eligibility by next week.&quot;
                  </p>
                  <div className="mt-3 flex justify-end">
                    <button className="text-primary text-xs font-bold hover:underline">View All Notes</button>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-[#2a271d] rounded-xl border border-[#433d28] p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-white font-semibold">Activity Timeline</h3>
                  <button className="bg-[#363225] hover:bg-[#363225]/80 text-white text-xs px-3 py-1.5 rounded-lg border border-[#433d28] transition-colors">
                    Filter
                  </button>
                </div>
                <div className="relative space-y-8 pl-2">
                  {/* Vertical Line */}
                  <div className="absolute top-2 bottom-2 left-[19px] w-[2px] bg-[#433d28]"></div>

                  {timelineData.map((item) => (
                    <div key={item.id} className="relative flex gap-4">
                      <div
                        className={`relative z-10 size-10 rounded-full ${item.iconBg} border border-[#433d28] flex items-center justify-center shrink-0`}
                      >
                        <span className={`material-symbols-outlined ${item.iconColor} text-sm`}>{item.icon}</span>
                      </div>
                      <div className="flex flex-col pt-1 w-full">
                        <div className="flex justify-between items-start">
                          <p className="text-white text-sm font-medium">{item.title}</p>
                          <span className="text-xs text-[#c3b998]">{item.time}</span>
                        </div>
                        <p className="text-[#c3b998] text-xs mt-0.5">{item.description}</p>
                        {item.attachment && (
                          <div className="mt-2 p-2 bg-[#363225] rounded border border-[#433d28] max-w-md">
                            <div className="flex items-center gap-2 text-xs text-[#c3b998]">
                              <span className="material-symbols-outlined text-sm">attachment</span>
                              <span>{item.attachment.name}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 py-2 text-sm text-[#c3b998] hover:text-white border border-dashed border-[#433d28] hover:border-[#c3b998]/50 rounded-lg transition-colors">
                  Load older activity
                </button>
              </div>
            </div>
          </div>

          {/* Similar Prospects */}
          <div className="mt-8 mb-12">
            <h3 className="text-white font-bold text-xl mb-4">Similar Prospects</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {similarProspects.map((prospect) => (
                <div
                  key={prospect.id}
                  className="bg-[#2a271d] p-4 rounded-xl border border-[#433d28] hover:border-primary/50 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="size-12 rounded-lg bg-cover bg-center"
                      style={{ backgroundImage: `url("${prospect.avatar}")` }}
                    />
                    <div>
                      <h4 className="text-white font-bold text-sm group-hover:text-primary transition-colors">
                        {prospect.name}
                      </h4>
                      <p className="text-[#c3b998] text-xs">
                        {prospect.position} | Class {prospect.classYear}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs text-[#c3b998] border-t border-[#433d28] pt-3">
                    <span>{prospect.location}</span>
                    <span className="flex items-center gap-1 text-primary">
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>{' '}
                      {prospect.rating}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #201d12;
        }
        ::-webkit-scrollbar-thumb {
          background: #433d28;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #d4af35;
        }
      `}</style>
    </div>
  );
}
