import Link from 'next/link';

interface Prospect {
  id: string;
  name: string;
  school: string;
  state: string;
  stars: number;
  imageUrl: string;
}

const mockProspects: Prospect[] = [
  {
    id: '1',
    name: 'Caleb Williams',
    school: 'Gonzaga College HS',
    state: 'DC',
    stars: 5,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPVs6Lw-YUr9kTqSL8yQ_hm-RHonDvN4TWJm8G8R-hO-wrHg81kIk31XFye56j7fbSFW40yrebyryExYojJDrEfpVmKpQ_8j_Emx46ZO6FDG766gWFFUQUQIzG9FBMV7-jaGAJyD2lHDjyhL3so6Cam-ZJrOQSpBW8YSRbCVqg67CRzOWhpbBk3H9GHirK2rr_eS7i84oegtC1DvLg21iRoktp_ZWL_V4nWBowdQTGnNC9KVTguB1-kJ19FBUz-lb8TuYHIZOHRkc',
  },
  {
    id: '2',
    name: 'Arch Manning',
    school: 'Isidore Newman',
    state: 'LA',
    stars: 5,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAabSw4dcdLGMi3NKt2hN3Z9GTqFi692XQtzqIyXdCgTwd-FOgqIim6xCjfvMFY2MSKY0faKHZ1uwoVyuO43QthUHwarueQ4hMm5DXw47AZTlAQUDAAnIBBrpPzcSLRKUZZlWfkZo53eX6HUZ_K5P1itAAwYGH0qyIHCKCzCe6LwsULt9MFPBKPsiHTRqOkmMy9UuJkAXrLZG6a2h4pBRpYycMDLXEIXzpaQbURUzMkYe2fDbL7PHUQO6KtptB6VB8zcIuXxE_iyhE',
  },
  {
    id: '3',
    name: 'Quinn Ewers',
    school: 'Southlake Carroll',
    state: 'TX',
    stars: 5,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDG3SBdyaSs3dkdKXGdJ2GIism2vUXK3oDxgPYk1SnSNDVtqYjoW9dRJX9QSmff7uVbgFrwkSs1XhgQarFXldTOtxWKf1ENYlvVv4Xdz5s57HfGekoeuwSuAV97sdK0ljROkTOJDBmNCf4caBxfS-eCx_iq74Xblmes7SJ-XVPkSc3JkFde7FyxzfD49QTc6r6JPKOinNV6jYFKxTssK0dYnGmQ89bEySkIeY_4H2wf9TBZswRuMdggzyi62RMXSRrI-iD0RnW0wsU',
  },
  {
    id: '4',
    name: 'Malachi Nelson',
    school: 'Los Alamitos',
    state: 'CA',
    stars: 5,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDuYne4YcBXR3q6wl230O1RhCUoOTpQQNwI-dOhKylRYqAYIFVvXvaDxKmojFN7czg4KKNSnfLDjzWAzElaQDWTfTv0X_Ch9KB8lSShOnaeqzpTLXig24q6GX9ZoR2dX82ZrJJeInITOP9mUI2F8XUXeXtu83YVGfKkAO-gB_wfURoG3rDTCs9r9OMMHqJM1wIZuC56wNN0KAfmRE5-RlnzJ6-Oo1196ZHI6wt-TD09VbGxABI2a11FwYV6S0sPqQPnPU2ezWw04Xc',
  },
  {
    id: '5',
    name: 'Dante Moore',
    school: 'Martin Luther King',
    state: 'MI',
    stars: 4,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBMlqUm4zgNt3-O4IpBZ9Py7q1y_XaNNVzwwlXiPq9xEwN5VALPQM8peMI9-UD71FT56jRhfurfl4ty3lCQrHBXO25or0_1IUwRxwQCyfcLn04WJ5AtfrmFNTOqHvdztkwKfBMy1AOhakTj5tD_BlrEpcxUB0DFMN71K3jSw5wwJ3hy4Kh8q7D9VSvA0Fs1l7bOKqFe-LmiWI29Ujxr-sXv5gFx55NqUmzJCdd-Zq_-H1V26tm4IfBrsZ65BX1us9qqtz9GQeYQ9wk',
  },
  {
    id: '6',
    name: 'Jaden Rashada',
    school: 'Pittsburg HS',
    state: 'CA',
    stars: 4,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYlPZdiExt6IxaBaiNtfVphSdSB5TOvfS4ueFLaI79bsknNq97eOTytxNclFkqbh6mnSRK2cibpq-b-Wc5UYUoGyDvjOblUGUWnf1mPEimcfpaRABFAiCDXCZ3ND71Uv0gbwZ4XV8cwyRhyLGOxjdQpITYonF1f0rd3TsYHKoQ7KW6Ef7_mAALFjd_ARDixNsefgkQUVydI_O1OHv63D_rbnES814ZXk0aNT7fdygxcKQH010Mwx2Qw-s0ZF2xXgPmW36-uq9YqWc',
  },
  {
    id: '7',
    name: 'Jackson Arnold',
    school: 'Guyer',
    state: 'TX',
    stars: 5,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJzA6VtmPepLs6Gemr9acGOYPd0bNH4EQSGVyxzYOfRB4DF4ceADr2R7ChI7fMV1eqz_BWFzDzn_67vO1aevsCIME-ja2wtORNPshD1qAoR95Br88qjqFzGo5I9wiAZhemydDsfaze-37z4UQk_IiYsjy2SzD2mVU_MJrmoWcDC5A7XnJ8KXahpz4wQZa9Lob2pYWoKWc4Iw_7mFpoamvUSkUia1yWhh68QjfmjVxDRjwFL5MvmwVmwkJCffzdNczXw7NxvUyoaL4',
  },
  {
    id: '8',
    name: 'Nico Iamaleava',
    school: 'Warren',
    state: 'CA',
    stars: 5,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBc9N4UXFhXAg0LmciLVobn6Fqm2awpv5l4hsWpi3U_A3PLWMDgiBIM5xZBRVskjHN1b5VV_ELmcAHUMjBwGoa4xHlvW9Z2e39dEL6iwPLl7pVBsDvR8tx1-4RJw2JiuOXFG1EqpxgOYmDq--iCU8KDepTZobpnNlD1lWm1lCTXquIcQuQWIkCsKv7WO6TN8iZjdLuQg0rO6HYBnUL25gpnyweUqJwZyP1LE5MziEReTdJAVlP_3K2kE8FwoE8_FvCJS2yQAjegjQs',
  },
  {
    id: '9',
    name: 'Christopher Vizzina',
    school: 'Briarwood Christian',
    state: 'AL',
    stars: 4,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASALzgqvwTdoF29tFa7FDRZLovuScyHpUvyeoNn39GMWK6XT_rtYjfN0A9guMCZExEvVz_rgBJ3SdO6bnUsPqFpcsI48nvGOzAnIIv--nETo0FUvjXb0FHyj9LN8jZ3u-NIP-TprkvisB91iAymb3kx1Hzbw_aeA8uoVGs_5ampXLB6ifko9bBd7uo2XSVSxRGGeJHImrVQfLzPyQQlVbthXRWp3x29Z66AiJlaR3XMC0PRe-uBFoJLtrrhqhrW8TNt5EDhneIH2Q',
  },
];

const zones = ['All', 'NE', 'SE', 'MW', 'SW', 'W', 'PL'];

function renderStars(count: number) {
  return (
    <div className="flex items-center gap-0.5 mt-1">
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className={`material-symbols-outlined text-[18px] ${i < count ? 'text-[#d4af35]' : 'text-[#c3b998]/30'}`}
          style={{ fontVariationSettings: i < count ? "'FILL' 1" : "'FILL' 0" }}
        >
          star
        </span>
      ))}
    </div>
  );
}

export default function PositionLandingPage({ params }: { params: { position: string } }) {
  const positionName = params.position === 'qb' ? 'Quarterback' : params.position.toUpperCase();
  const positionLabel = params.position.toUpperCase();

  return (
    <div className="bg-[#050505] font-[family-name:var(--font-inter)] text-white min-h-screen flex flex-col overflow-x-hidden antialiased selection:bg-[#d4af35] selection:text-black">
      {/* Navigation */}
      <header className="w-full border-b border-[#333333] bg-[#050505]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <span className="material-symbols-outlined text-[#d4af35] text-3xl">sports_football</span>
              <h1 className="text-white text-xl font-bold tracking-tight">RepMax</h1>
            </Link>
            {/* Desktop Nav */}
            <div className="flex items-center gap-4">
              <button className="hidden sm:flex h-10 px-6 items-center justify-center rounded-full bg-[#1A1A1A] text-white text-sm font-bold hover:bg-[#333333] transition-colors border border-transparent hover:border-[#d4af35]/30">
                Log In
              </button>
              <button className="h-10 px-6 flex items-center justify-center rounded-full bg-[#d4af35] text-[#050505] text-sm font-bold hover:bg-[#b5952b] transition-colors shadow-[0_0_15px_rgba(212,175,53,0.3)]">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center w-full">
        <div className="w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col gap-8">
          {/* Hero Section */}
          <div className="flex flex-col gap-2">
            <h2 className="text-white text-4xl sm:text-5xl font-black leading-tight tracking-[-0.033em]">{positionName} Prospects</h2>
            <div className="flex items-center gap-2 text-[#c3b998] text-base sm:text-lg font-normal">
              <span className="material-symbols-outlined text-[#d4af35] text-lg">analytics</span>
              <p>Total {positionLabel}s: 5,402 • Active Recruitment Zones: 6</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col gap-6 bg-[#111111] border border-[#333333] p-5 rounded-2xl shadow-lg">
            {/* Zone Filters */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold text-[#c3b998] uppercase tracking-wider">Recruitment Zones</label>
              <div className="flex flex-wrap gap-2">
                {zones.map((zone, index) => (
                  <button
                    key={zone}
                    className={`h-9 px-5 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                      index === 0
                        ? 'bg-[#d4af35] text-[#050505] font-bold shadow-md'
                        : 'bg-[#2A2A2A] text-white hover:bg-[#3A3A3A] border border-[#333333]'
                    }`}
                  >
                    {zone}
                  </button>
                ))}
              </div>
            </div>

            {/* Dropdown Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#333333] pt-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-[#c3b998] uppercase tracking-wider">State</span>
                <div className="relative">
                  <select className="w-full h-12 bg-[#2A2A2A] border border-[#333333] text-white text-sm rounded-xl px-4 appearance-none focus:outline-none focus:border-[#d4af35] focus:ring-1 focus:ring-[#d4af35] cursor-pointer">
                    <option>Any State</option>
                    <option>California</option>
                    <option>Texas</option>
                    <option>Florida</option>
                    <option>Georgia</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#c3b998] pointer-events-none text-xl">expand_more</span>
                </div>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-[#c3b998] uppercase tracking-wider">Class</span>
                <div className="relative">
                  <select className="w-full h-12 bg-[#2A2A2A] border border-[#333333] text-white text-sm rounded-xl px-4 appearance-none focus:outline-none focus:border-[#d4af35] focus:ring-1 focus:ring-[#d4af35] cursor-pointer">
                    <option>2025</option>
                    <option>2026</option>
                    <option>2027</option>
                    <option>2028</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#c3b998] pointer-events-none text-xl">expand_more</span>
                </div>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-[#c3b998] uppercase tracking-wider">Rating</span>
                <div className="relative">
                  <select className="w-full h-12 bg-[#2A2A2A] border border-[#333333] text-white text-sm rounded-xl px-4 appearance-none focus:outline-none focus:border-[#d4af35] focus:ring-1 focus:ring-[#d4af35] cursor-pointer">
                    <option>5 Stars</option>
                    <option>4 Stars &amp; Up</option>
                    <option>3 Stars &amp; Up</option>
                    <option>Unrated</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#c3b998] pointer-events-none text-xl">expand_more</span>
                </div>
              </label>
            </div>
          </div>

          {/* Athlete Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockProspects.map((prospect) => (
              <Link
                key={prospect.id}
                href={`/card/${prospect.id}`}
                className="group bg-[#111111] border border-[#333333] rounded-2xl p-6 flex items-center gap-4 hover:border-[#d4af35]/50 transition-all hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)] cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-3">
                  <span className="material-symbols-outlined text-[#d4af35]/20 group-hover:text-[#d4af35] transition-colors">bookmark</span>
                </div>
                <div
                  className="w-20 h-20 shrink-0 bg-cover bg-center rounded-full border-2 border-[#d4af35]/20 group-hover:border-[#d4af35] transition-colors"
                  style={{ backgroundImage: `url("${prospect.imageUrl}")` }}
                ></div>
                <div className="flex flex-col">
                  <h3 className="text-white text-lg font-bold leading-tight group-hover:text-[#d4af35] transition-colors">{prospect.name}</h3>
                  <p className="text-[#c3b998] text-sm font-normal">{prospect.school}, {prospect.state}</p>
                  {renderStars(prospect.stars)}
                </div>
              </Link>
            ))}
          </div>

          {/* Load More */}
          <div className="flex justify-center mt-4">
            <button className="flex items-center gap-2 text-[#c3b998] hover:text-white transition-colors">
              <span className="text-sm font-medium">Load More Prospects</span>
              <span className="material-symbols-outlined text-lg">arrow_downward</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer / Bottom CTA */}
      <div className="sticky bottom-0 w-full bg-[#050505]/95 backdrop-blur-md border-t border-[#333333] py-6 z-40">
        <div className="max-w-[1200px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="w-full sm:w-auto min-w-[200px] h-12 px-6 flex items-center justify-center rounded-full bg-[#d4af35] text-[#050505] text-base font-bold hover:bg-[#b5952b] transition-colors shadow-[0_0_20px_rgba(212,175,53,0.4)]">
            Create Your {positionLabel} Profile
          </button>
          <button className="w-full sm:w-auto min-w-[200px] h-12 px-6 flex items-center justify-center rounded-full bg-transparent border border-white/20 text-white text-base font-bold hover:bg-white/10 transition-colors">
            Search All {positionLabel}s
          </button>
        </div>
      </div>
    </div>
  );
}
