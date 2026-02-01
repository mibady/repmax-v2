'use client';

interface ProspectCard {
  id: string;
  name: string;
  school: string;
  position: string;
  stars: number;
  avatar: string;
  lastActivity: string;
  status?: string;
  isPriority?: boolean;
}

interface PipelineColumn {
  id: string;
  title: string;
  color: string;
  bgColor: string;
  textColor: string;
  count: number;
  prospects: ProspectCard[];
}

const pipelineData: PipelineColumn[] = [
  {
    id: 'identified',
    title: 'Identified',
    color: 'border-gray-600',
    bgColor: 'bg-gray-500/20',
    textColor: 'text-gray-300',
    count: 12,
    prospects: [
      {
        id: '1',
        name: 'Jalen Carter',
        school: 'Apopka High, FL',
        position: 'DT',
        stars: 3,
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCDLynSyAMQlw-VF2kk-ez47AGNXnTrDcRPIvtMybGgcfPXmPpXp_tU03VH6ECUI5kIBHrHu7mb66ZahyQbCDRFwySHbAAEF6vh3Ew1Q3EVZ_-TXHFenf5lOOCedZcddRqOGKRYgnLofaSlNfMkkNWnZ_7T2SfbxCBUzTqVSQIccoUQ46VRMLV1VCKyHt7K3gz9x23_gvKmA3b4HpqLa2mi7-fyGA02xPGyfVbVPA3alHctxW0Ha2830Z740scS6zgZSiL6MbY2uI',
        lastActivity: 'Last: 3w ago',
      },
      {
        id: '2',
        name: 'Kevin Miller',
        school: 'IMG Academy, FL',
        position: 'QB',
        stars: 4,
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZmIjpH_H6AmYgC3h4u3lEGLMrIfjxO4zkXuBZGZ6caBQZDtqMOeetk94kZchQKrjqr5gc_kUz4_R4cyh9bKVPzlBmSRL79N-Urj2DESJ7wu2mulaXO63WDXeyCvWtCO-ut79lGU2CCrkRTnK4gShpxQomqxNC_W4MtmMmjIDPnUFePdDI_qCC3vb8tvPn-mjd_HuiBpGPj7sK2rNW3eXqRCzHbtvGlX0ulvAVJE6EyDOzMif-CP9Gcfjv1Q31K2Y_qc3krTiALdw',
        lastActivity: 'Last: 1mo ago',
      },
    ],
  },
  {
    id: 'contacted',
    title: 'Contacted',
    color: 'border-blue-600',
    bgColor: 'bg-blue-500/20',
    textColor: 'text-blue-400',
    count: 8,
    prospects: [
      {
        id: '3',
        name: 'Tyrell Johnson',
        school: 'Mater Dei, CA',
        position: 'WR',
        stars: 5,
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXfa-vdl8h6_3OojgpEslGjWFL6ahHYnrXCbzaIdkysoOuNnivO7XWNvhMWLlogyR0XfPcey0qF3xdMIhHYe99yATXx1epC404KIgT3LbBNTdOyru88DU19e9AgjCbANiCGyZV5SEI2qQmD--ERwKTD5heiCp7BgOG44vUBdGfYTj8H3nYP_NkZiF6o-ygZZOo8OuTuWlE0zHTMhaGbaa7h9Kh4-jg4L-xXFH_i56jRL_1MIQ5PVMXyUndP5rDXK-w_C3krqvJIIo',
        lastActivity: '2d ago',
        status: 'DM Sent',
        isPriority: true,
      },
      {
        id: '4',
        name: 'Andre Smith',
        school: 'Westlake, TX',
        position: 'LB',
        stars: 3,
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDA-479lnQ66P2DkrzuBGPkIuQaERD5O6kHEJTZ00XBC3Kiimy7N5yX-w9764m5pRgPyrLWnNl5dF6499HvaeG0PFgcZfB4xILTEsjs7lqxHkG3BQUNWvFK9m8rD5x0LKfxxEsRcGt_i644gCoFuQX9CQuMC_gJ7Ka8ADyA-eI-wCIePorqEbV38cYzU1JdJK_g15J-H2e_vRuD9k4OFLnXapHvZoZ6scaZv6P5h1xQ8mpIypOpMvkZmZXEyJyr6i97cB0IPdd_zK4',
        lastActivity: 'Last: 4d ago',
      },
    ],
  },
  {
    id: 'evaluating',
    title: 'Evaluating',
    color: 'border-purple-600',
    bgColor: 'bg-purple-500/20',
    textColor: 'text-purple-400',
    count: 5,
    prospects: [
      {
        id: '5',
        name: 'Davante Adams',
        school: 'Palo Alto, CA',
        position: 'WR',
        stars: 4,
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBYZI4-qufqD1M2io-bBHJcOwcCVC1bg2tQT2nW6vywfZrlnJqnXv61n9uyVIUzJIEPs9CmtWSKTq8PDdh_wtuK1L-xtzwnSmB3onkkX1P5XJZYdp-k5IaAk5st8eROVhEh1k5fLW0G9fPM4USlWT0dV6yydCkaRkDGeAKXCJGDj_UpiMMo5zuQDojFa9hh0ddqsRoS-FjE8sEOPh0FiX0MVaZhT3PJfVzuac16nRz6Q-lX2qemeHIdG796nZgrIrrE7rHoI3sfB4',
        lastActivity: '1d ago',
        status: 'Film Review',
      },
    ],
  },
  {
    id: 'visit-scheduled',
    title: 'Visit Scheduled',
    color: 'border-orange-600',
    bgColor: 'bg-orange-500/20',
    textColor: 'text-orange-400',
    count: 3,
    prospects: [
      {
        id: '6',
        name: 'Marcus Washington',
        school: 'Oak Hill, VA',
        position: 'S',
        stars: 5,
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDyefZ907p6alZha3TtnkJJEhaAxrAfltEqFRB4cr_F92ZvdeL6JNEPJ3P9WtOrMULOehBoXkxGW7qm3tg072dGJS5f2IOOseOPGaYP_mHf2-9Tt6bRQHumJhW8lVvUg5M4-V2jewJ_gXp3iUfLwxtVvy0SFelIlHPqHUKWtCofb52dAydDQrfz0V6k5qXFaEAwuQlKt9mgw2LS5ZbiYh6jPUftJTiPWV3fekvX1mi65fV_14iKlg1yhvpusH7Kk7P1icbQsQIonYs',
        lastActivity: '6h ago',
        status: 'OV: Oct 12',
        isPriority: true,
      },
    ],
  },
  {
    id: 'offered',
    title: 'Offered',
    color: 'border-primary',
    bgColor: 'bg-primary/20',
    textColor: 'text-primary',
    count: 2,
    prospects: [
      {
        id: '7',
        name: 'Caleb Williams',
        school: 'Gonzaga, DC',
        position: 'QB',
        stars: 5,
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCL2QZ6vdeFlSgo1Twbm-frHY8J4eRcrYkXmy4TpeekCNfOvw2CHngrPd4QQzbOLGKBZck_hbePLLwCX7l9QL5eklj4VFHxJjmxIRE2Mr4Ruhpo2I9WaQwG1DwUE81Ips_mlK3df3bdlgXruqr1s_yDMX7wTLkT75NVfo8x5npCzKWnFtDQ5WbLMinB_OX2hCY5jApu726YMBdX39rM9bq8YWUTGaOKeqm0Dl1Y_fn-mmbGoDNKHyD5SSL2k01gZfsIrgkB4NIngxY',
        lastActivity: '12h ago',
        status: 'Full Ride',
      },
      {
        id: '8',
        name: 'Zion Nelson',
        school: 'Sumter, SC',
        position: 'OT',
        stars: 4,
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZtC_mT_BaUF03zRQxFvRVwq-inB9m59thXnrVOV1p82HuISjyRKISEQxltLLaXZnsMetuMNIRz9jEXG_TOMxKBfDJHr0jsZEvKdiYRHa8vPPe0CRodoy_St27c-DqlGTveQGQqzaFMX1mgGGFSZcwISjZKNEiNHjctekFvjS0ctPsgofEkA4EwcvRdkOwtV4S4WzJZe5zg_4SK2OWeOYp53DAEMUazRAU7lQCZ9M9asC6xTPBjo43D3PlOxOYo7u61BwVm00T-nw',
        lastActivity: '3d ago',
        status: 'Offer Sent',
      },
    ],
  },
  {
    id: 'committed',
    title: 'Committed',
    color: 'border-green-600',
    bgColor: 'bg-green-500/20',
    textColor: 'text-green-400',
    count: 1,
    prospects: [
      {
        id: '9',
        name: 'Mike Saunders',
        school: 'North Gwinnett, GA',
        position: 'RB',
        stars: 4,
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWcCG4RNUDhn8BQ3AdedFn0DAPrc7gnRLk7tYRqjXgTffQ-Xn6l66ieyh5OKiUQ9M2fBo12SHXbNc4i0wkV4qomEAeFXco1d1NGr05kxXV6J-BeywfSTDI3N_WBraJLlWv4cvEfrJC3EEnkN9If707ml9BQUBPOI--jIt14PHct9HIoYfN2Gf-tIo8tkVvn0qxAT4eawSHj-xr5jg94vtfFDTNR62GUVALQYA9UTvS4rKAY2F-UGJNKfX30-xGV-XeFIjF0ka6Ozo',
        lastActivity: '1mo ago',
        status: 'Signed',
      },
    ],
  },
];

const navItems = [
  { icon: 'view_kanban', label: 'Pipeline', active: true },
  { icon: 'groups', label: 'Athletes', active: false },
  { icon: 'campaign', label: 'Campaigns', active: false },
  { icon: 'chat_bubble', label: 'Messages', active: false },
  { icon: 'analytics', label: 'Analytics', active: false },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5 text-primary text-[10px]">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          star
        </span>
      ))}
    </div>
  );
}

function ProspectCardComponent({ prospect, columnId }: { prospect: ProspectCard; columnId: string }) {
  const isOffered = columnId === 'offered';
  const isCommitted = columnId === 'committed';
  const hoverBorderColor = {
    contacted: 'hover:border-blue-500/30',
    evaluating: 'hover:border-purple-500/30',
    'visit-scheduled': 'hover:border-orange-500/30',
    offered: 'hover:border-primary/40',
    committed: '',
  }[columnId] || '';

  const cardBorderClass = isOffered
    ? 'border-primary/40 shadow-[0_0_15px_-5px_rgba(242,204,13,0.15)]'
    : isCommitted
      ? 'border-green-500/50 opacity-80 hover:opacity-100'
      : 'border-white/5';

  return (
    <div className={`bg-[#141414] hover:bg-[#1c1c1c] border ${cardBorderClass} ${hoverBorderColor} rounded-lg p-3 cursor-pointer group transition-all shadow-sm relative`}>
      {prospect.isPriority && (
        <div className="absolute top-3 right-3 size-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
      )}

      <div className={`flex justify-between items-start mb-2 ${prospect.isPriority ? 'pr-4' : ''}`}>
        <div className="flex flex-col">
          <h4 className="font-bold text-white text-sm">{prospect.name}</h4>
          <p className="text-xs text-gray-500">{prospect.school}</p>
        </div>
        {!prospect.isPriority && <StarRating count={prospect.stars} />}
      </div>

      {prospect.isPriority && (
        <div className="mb-3">
          <StarRating count={prospect.stars} />
        </div>
      )}

      <div className="flex items-center gap-3 mt-3">
        <div
          className="bg-center bg-no-repeat bg-cover rounded-full size-8 border border-white/10"
          style={{ backgroundImage: `url("${prospect.avatar}")` }}
        />
        <span className="bg-white/5 text-gray-300 border border-white/5 text-[10px] px-2 py-1 rounded font-medium">
          {prospect.position}
        </span>
      </div>

      <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center">
        {isCommitted ? (
          <div className="flex items-center gap-1 text-green-400">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            <span className="font-mono text-[10px]">{prospect.status}</span>
          </div>
        ) : prospect.status ? (
          <span className={`font-mono text-[10px] ${
            columnId === 'contacted' ? 'text-blue-400' :
            columnId === 'evaluating' ? 'text-purple-400' :
            columnId === 'visit-scheduled' ? 'text-orange-400' :
            columnId === 'offered' ? 'text-primary' :
            'text-gray-400'
          }`}>
            {prospect.status}
          </span>
        ) : (
          <span className="font-mono text-[10px] text-gray-500">{prospect.lastActivity}</span>
        )}
        {prospect.status && !isCommitted && (
          <span className="font-mono text-[10px] text-gray-500">{prospect.lastActivity}</span>
        )}
        {isCommitted && (
          <span className="font-mono text-[10px] text-gray-500">{prospect.lastActivity}</span>
        )}
      </div>
    </div>
  );
}

export default function RecruiterPipelinePage() {
  return (
    <div className="flex h-screen w-full bg-[#050505] text-slate-200 font-sans overflow-hidden selection:bg-primary/30 selection:text-primary">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 bg-[#0a0a0a] border-r border-white/5 flex flex-col justify-between p-4 h-full">
        <div className="flex flex-col gap-6">
          {/* Brand */}
          <div className="flex gap-3 items-center px-2">
            <div
              className="bg-center bg-no-repeat bg-cover rounded-full size-10 shadow-lg shadow-primary/10 border border-white/10"
              style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCPTlI6TVLkpVC__zbDXe05kA5gCIReScvpyVg1yvcENONjUHQjuT-8HEXl7H7G02-hqz7wQ5hHqPf32S6SD2pVujHFJHSTMs_C3wVlbfYZRa2zjM9h6nf8jkBXlS1exBFkk80HS1xowjbzVxlE2AE6l2dfcIKYxrRqbg6cPFO-TkNGGfSgxdVGBcz6I9135PxI96WFyKQ06VjmkGFagkiIlXhi-fKt_2K8tbiEFWeMrq2O9q3YMyCgIlwQ-4VORUyE0qEjosURZnI")' }}
            />
            <div className="flex flex-col">
              <h1 className="text-white text-lg font-bold leading-none tracking-tight">RepMax</h1>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mt-1">Recruiter CRM</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <a
                key={item.label}
                href="#"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  item.active
                    ? 'bg-white/5 text-primary border border-white/5 group'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${item.active ? 'group-hover:scale-110 transition-transform' : ''}`}>
                  {item.icon}
                </span>
                <p className="text-sm font-medium">{item.label}</p>
              </a>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-2">
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all">
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <p className="text-sm font-medium">Settings</p>
          </a>
          <div className="flex items-center gap-3 px-3 py-3 mt-2 border-t border-white/5">
            <div
              className="bg-center bg-no-repeat bg-cover rounded-full size-8"
              style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBienQDUJ2lwHvQdX-i0917ivF2hfZHcraw8_n3Mj7fSQ2BcuBbK3kwXjUmXogW3FxvN5zr-sCxyRSBTALndg5rNFXLK0F-7snYx7JnK7Mk1yHEJR_FrYAxiG2h9FA0oPXKWTrU7cNotdK2HL6zmys_tpv89ZUvtPySrhq26Yajvx1KMYY6sxcYgjX2ClsdEe_Wf5bdKZWowsRV5GZtJLHfS02iasXrUe3HduIaXFDQzXUmBpZH7aqebEVAtjLNspaLwlP8Cbn6Tg4")' }}
            />
            <div className="flex flex-col">
              <p className="text-white text-sm font-medium">Coach Taylor</p>
              <p className="text-gray-500 text-xs">Head Recruiter</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0a0a0a]/50 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h2 className="text-white text-xl font-bold tracking-tight">Pipeline Dashboard</h2>
            <div className="h-4 w-px bg-white/10 mx-2"></div>
            <span className="text-gray-500 text-sm font-mono">NRB-2025-V1</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-gray-500 text-[20px]">search</span>
              </div>
              <input
                type="text"
                className="block w-64 pl-10 pr-3 py-2 border border-white/5 rounded-lg leading-5 bg-[#141414] text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-[#1c1c1c] focus:ring-1 focus:ring-primary/50 focus:border-primary/50 sm:text-sm transition-colors"
                placeholder="Search athletes, schools..."
              />
            </div>
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full border-2 border-[#0a0a0a]"></span>
            </button>
          </div>
        </header>

        {/* Control Bar */}
        <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4 bg-[#050505]/95 z-10">
          <div className="flex items-center gap-3">
            {/* Class Filter */}
            <div className="relative">
              <select className="appearance-none bg-[#141414] text-white pl-3 pr-10 py-2 rounded-lg text-sm border border-white/10 hover:border-white/20 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-colors w-40">
                <option>Class of 2025</option>
                <option>Class of 2026</option>
                <option>Class of 2027</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <span className="material-symbols-outlined text-[18px]">expand_more</span>
              </div>
            </div>

            {/* Position Filter */}
            <div className="relative">
              <select className="appearance-none bg-[#141414] text-white pl-3 pr-10 py-2 rounded-lg text-sm border border-white/10 hover:border-white/20 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-colors w-40">
                <option>All Positions</option>
                <option>Quarterbacks</option>
                <option>Wide Receivers</option>
                <option>Running Backs</option>
                <option>Defensive Line</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <span className="material-symbols-outlined text-[18px]">expand_more</span>
              </div>
            </div>

            {/* Zone Filter */}
            <div className="relative">
              <select className="appearance-none bg-[#141414] text-white pl-3 pr-10 py-2 rounded-lg text-sm border border-white/10 hover:border-white/20 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-colors w-40">
                <option>National Board</option>
                <option>Southeast Zone</option>
                <option>West Coast</option>
                <option>Midwest</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <span className="material-symbols-outlined text-[18px]">expand_more</span>
              </div>
            </div>
          </div>

          <button className="flex items-center gap-2 bg-primary hover:bg-[#d9b70b] text-[#050505] px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-primary/10">
            <span className="material-symbols-outlined text-[20px] font-bold">add</span>
            Add Prospect
          </button>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 pb-6">
          <div className="flex h-full gap-4 min-w-[1600px]">
            {pipelineData.map((column) => (
              <div
                key={column.id}
                className={`flex flex-col w-72 flex-shrink-0 bg-[#0a0a0a] rounded-xl border border-white/5 h-full relative overflow-hidden`}
              >
                {/* Gold glow for Offered column */}
                {column.id === 'offered' && (
                  <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
                )}

                {/* Column Header */}
                <div className={`p-3 border-t-4 ${column.color} rounded-t-xl bg-[#0a0a0a] flex items-center justify-between sticky top-0 z-10`}>
                  <h3 className={`font-semibold text-gray-200 text-sm tracking-wide ${column.id === 'offered' ? 'font-bold text-white' : ''}`}>
                    {column.title}
                  </h3>
                  <span className={`${column.bgColor} ${column.textColor} text-xs font-bold px-2 py-0.5 rounded-full`}>
                    {column.count}
                  </span>
                </div>

                {/* Column Content */}
                <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-3 relative z-10" style={{ height: 'calc(100vh - 180px)' }}>
                  {column.prospects.map((prospect) => (
                    <ProspectCardComponent key={prospect.id} prospect={prospect} columnId={column.id} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <style jsx>{`
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #0a0a0a;
        }
        ::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #444;
        }
      `}</style>
    </div>
  );
}
