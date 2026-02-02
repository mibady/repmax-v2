import Link from 'next/link';

interface Athlete {
  id: string;
  name: string;
  position: string;
  classYear: string;
  imageUrl: string;
}

interface Coach {
  id: string;
  name: string;
  role: string;
  isHead?: boolean;
  imageUrl: string;
}

const mockAthletes: Athlete[] = [
  {
    id: '1',
    name: 'Marcus Johnson',
    position: 'QB',
    classYear: "'24",
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASCd-UyWPi-R32nGyQogO-qEbsJMuF7J8Tf8pYLsCQcAww7PysBzG0C_Otx5k_-QUJLCY0TpziqoqSVUmbxh_8Pr3WYPxPu8HCuA7xB-TPTXsuojqN1kf0KKwRXjWmpN8N6mkUD02wRnMxOjDFLUp4dxP1L-KvAVqhXY4smmu5gOL7lWNXumQmnSYcoDj57j5xSVfsiTKCi-JbSv94xdBDhd25ndwirqDTmjLlRQD0lwJjaKrUoZHWtLiyM6wLUy1CqImjFF4m4ss',
  },
  {
    id: '2',
    name: 'Trey Smith',
    position: 'WR',
    classYear: "'25",
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDhhgPMYEfcipcB6YTqPwUYmSpL2usVKTCvXS9Hkw6GUzg8zh4SCFfGr_6KHMZhRAoQxJuho8gZG_D2YjwJA3sEvSSETXclHLBvOXO6M9o9JqNtigvvoS9IDJ44g1v94YCtTnUEPCZxmJk--VM1tmjRqaxEriYZm4UhHMZGJeUkRmT_TxGgWb5JgGjveeAtODHXxC1YPWvK0nPO-ui0FknFYhXxPZ9XmIxP3FX6ElsbvHQGDYInngwgN_w4oE6JMxxkDlme3aNe3s',
  },
  {
    id: '3',
    name: 'David Brown',
    position: 'LB',
    classYear: "'24",
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBK1oDnVkoCQvXu3RA0Rv7hgPcEsoMLopcSyB6N2pqTfrF5UiDr5_IaHFE4MS7b41u03vsq3GW76B4ZW02Hf2FUxUICjVnL329iqjfkFySmufjIeHtb-t36CUBJEFHZCzIn1IxTSM9Nk1fXz5tgLR3TIDJNzRt6eWkJ1jnJDN6OWE5UFV-cKLLy5cXwbvR8Jm3Ji9SqT0ISFqqeMw_jawnx4uAz0HCfka5vSHTNR-182kOUmsV9gfnrMxVXkSWgfugqWpjGEb7yHYo',
  },
  {
    id: '4',
    name: 'Chris Paulson',
    position: 'RB',
    classYear: "'26",
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3BXcPBwFPLizMV1yIx6UMu65nxENJcOQuLkUmg9QhHTITHAXjKW8qxjm0EDg2JvNU3crGIKS2foujIg6B22CoQgmzkaUX4lETSdO8sH-0t5B_xaZu3c8az1DhqA6ROJjrdplGEVKD_vhODnFUOvk__z9jiAh63mUB7DL3jj5modQqne3j3s56hkXUD9Tro-gw254kZzkElzDOT1q3OoccdJy1ebSk3Bw8eagvf9ZC63mh52MPQzIaM-_tdXWbDCiZgnfJafvyyKI',
  },
  {
    id: '5',
    name: 'Jaylon Williams',
    position: 'S',
    classYear: "'24",
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBW8iKjdl8dWuz9TLlCNnDvSrDZCn8Zwu9iU7OJGBdyHjZhaiPQcrXxlYUOAGTeB1lWAHF_-4sMmFsM7guYX4KVp2Q6I2pJzP9LJRwHPRbUfzpfCL2rCgHv1nYPxJlfrtiM7tqxbCpSuPXGqsOp6z9hF5hbl2VP1GwWjOtJ5tO_IWZaeszXXmOwLQ_ttexWUihle_WrQpnJnqJamLyMPobu_87hyxVDRi4cF8UcQ2XnmLMnn4TNAm-qcfJaeu0DLIDFeCnbmI4CxGw',
  },
];

const mockCoaches: Coach[] = [
  {
    id: '1',
    name: 'Coach Thompson',
    role: 'Head Coach',
    isHead: true,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAeO7Rj5g_IVnTp89Fk8PdkaOixEHpgVny0WbbthddW0OMaQtO2GoBybJAbfJH5NCrQ6nFb2ooinsg_mS13znZCWTLebZ30YUdaxfEg0l6D18URyB8yIDUjvqJiK_m7drqPt1xUG7wWidKvjn6_8BQe_kbEbxx1za3Rn5VrS_euhJBwwfdLFv495M-iGSdk1oVLNz6D083I23B-4tSojW3TcsGRPN61-0-M9CRQH-E8j6GmbtEy9pwKgJYz0HDdN_kWiFA5BylxM0g',
  },
  {
    id: '2',
    name: 'Coach Miller',
    role: 'Offensive Coordinator',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1pUXz6fAhoZqcvp7KUqT9wtB8gKxW4IcZtra9iPXX5xt_BBzg2-ElBHr0pf8fuwXcg1LRJmCaXeSE7gX-eytu1jG9Y75Rns_4GSc5J9E6OBfrC7BzMKDzOPOH2udLV0wbCnBDTxEPTEMVKykvQVcCWrPoQgArR0zgXNdSYAvl2V1EYylZSBZEeFNbfizgRLVV88XD5DZ_mvgbjIswZEro7c04GAe-F-0ZVFQ1JDFyK9VL6nZRBT2k3_RVdJ9U0_RIIenTxMnfrhA',
  },
  {
    id: '3',
    name: 'Coach Davis',
    role: 'Defensive Coordinator',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDON9kOLuxbxZ1TwkXWxusSMUc7IG3C2oXyIxUuRmAgCnIShD842EFmF0OwRomUw05AGZYt1ji-xzeIqMlNJL7NDHtg_J_10s31KHdcSa3P-VUK4_fWPbSAAYP_wFMYkpJflt6Z-VGNfSfJdo1CTMBLL4ql4Kox4OWi_0VFNCPb8qxVVhibjwkcGXkl5z0fehslaEkom2fjUvTei2kgujKMXowhwrTlt3QbRLsonVvXzAqOcOWcvuoZUMuTBjcoDGVx3DRLmqu-Uyo',
  },
];

export default function ProgramSpotlightPage() {
  return (
    <div className="bg-[#050505] text-white min-h-screen flex flex-col antialiased selection:bg-[#D4AF37] selection:text-black">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-[#1F1F22] bg-[#050505]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 text-white transition-opacity hover:opacity-80">
              <div className="flex items-center justify-center size-8 rounded-lg bg-[#D4AF37] text-black">
                <span className="material-symbols-outlined text-[20px]">fitness_center</span>
              </div>
              <span className="text-xl font-bold tracking-tight">RepMax</span>
            </Link>
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="#" className="text-sm font-medium text-gray-300 hover:text-[#D4AF37] transition-colors">Schools</Link>
              <Link href="#" className="text-sm font-medium text-gray-300 hover:text-[#D4AF37] transition-colors">Athletes</Link>
              <Link href="#" className="text-sm font-medium text-gray-300 hover:text-[#D4AF37] transition-colors">Coaches</Link>
              <Link href="#" className="text-sm font-medium text-gray-300 hover:text-[#D4AF37] transition-colors">Rankings</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden sm:flex items-center rounded-full bg-[#1F1F22] px-3 py-1.5 ring-1 ring-white/5 focus-within:ring-[#D4AF37]/50 transition-all">
              <span className="material-symbols-outlined text-gray-500 text-[20px]">search</span>
              <input
                className="bg-transparent border-none text-sm text-white placeholder-gray-500 focus:ring-0 w-48"
                placeholder="Search programs..."
                type="text"
              />
            </div>
            {/* User Avatar */}
            <button className="relative size-9 rounded-full bg-[#1F1F22] overflow-hidden ring-1 ring-white/10 hover:ring-[#D4AF37]/50 transition-all">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDbLnsnjqQZXMvVWHr2vF72lC_jeMB71msNu8GRQxOLVXFZK2ZnnWky47dZPaHfue8JmMIvj1yAux0OHNEpnOBGLkFHxYLFJNpqSsRy7Z_O0HEvG2q_mc6_iuhztv3MNradpHQr_eq-uA7NYn4qTb_Ke-AxxTNvphrOAEd4bTOt2w-eu_RTyyh35JNmczRQqcCOW2pYXxE13lRJLBxCTRIESbZopVKRd9yLIzOB_N3Vz4zgtCnYXA_kRZ_NbB_ambd2xPZXuYGmKVU')" }}
              ></div>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-[1000px] px-4 py-8 md:px-6 md:py-12">
          {/* Hero Section */}
          <section className="flex flex-col md:flex-row gap-6 md:gap-8 mb-10">
            {/* School Logo */}
            <div className="shrink-0">
              <div className="size-32 md:size-40 rounded-xl bg-[#1F1F22] border border-white/5 p-1 shadow-2xl">
                <div
                  className="w-full h-full rounded-lg bg-cover bg-center"
                  style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCgNyW3voGvXTbYx3mAVN8YnhE43rnqxR5b1mj8fIYfoExEi4nu_drhLbbHrmx1qZ0MbEC7VVDW0YGN41MKJ5qMhBjOLtiMC4ycIal3XX0gFKBYq1HDCiNfp13gEzTklB3ixpTv_nGWFZaiJvcP5Rf_3wIKgXcnmhtpMO8qs9iRMSIkUpOIguR8zPJbkuCKi_rqXsID9wYoRG_aX6TZJwtVJY14ieqilVXYzlzQIMr4SJku-N1I-uvHi2uG2_VdE6kRBYNu1BdvrBw')" }}
                ></div>
              </div>
            </div>
            {/* School Info */}
            <div className="flex flex-col justify-end flex-1 gap-3">
              <div className="space-y-1">
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">North Shore High School</h1>
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                  <span className="text-sm md:text-base font-medium">Houston, TX</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                {/* Zone Badge */}
                <span className="inline-flex items-center gap-1.5 rounded bg-orange-500/10 px-2.5 py-1 text-xs font-semibold text-orange-500 ring-1 ring-inset ring-orange-500/20">
                  <span className="size-1.5 rounded-full bg-orange-500"></span>
                  Southwest Zone
                </span>
                {/* Record Badge */}
                <span className="inline-flex items-center gap-1.5 rounded bg-green-500/10 px-2.5 py-1 text-xs font-semibold text-green-500 ring-1 ring-inset ring-green-500/20 font-mono tracking-wide">
                  14-2 RECORD
                </span>
              </div>
            </div>
          </section>

          {/* Stats Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            <div className="bg-[#1F1F22] border border-white/5 rounded-xl p-5 flex flex-col gap-1 transition-transform hover:scale-[1.01]">
              <p className="text-gray-400 text-sm font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[#D4AF37] text-[18px]">school</span>
                D1 Prospects
              </p>
              <p className="text-3xl font-bold font-mono text-white">159</p>
            </div>
            <div className="bg-[#1F1F22] border border-white/5 rounded-xl p-5 flex flex-col gap-1 transition-transform hover:scale-[1.01]">
              <p className="text-gray-400 text-sm font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[#D4AF37] text-[18px]">group</span>
                Athletes on RepMax
              </p>
              <p className="text-3xl font-bold font-mono text-white">12</p>
            </div>
          </section>

          {/* About Section */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-bold text-white">About the Program</h2>
              <div className="h-px flex-1 bg-[#1F1F22]"></div>
            </div>
            <div className="prose prose-invert max-w-none text-gray-400 leading-relaxed">
              <p>
                North Shore High School is a premier athletic institution dedicated to developing top-tier talent in the Greater Houston area.
                With a history of excellence and a steadfast commitment to player development, we strive to dominate the competition both on and off the field.
                Our program emphasizes discipline, teamwork, and academic achievement, ensuring our athletes are prepared for the collegiate level.
                Current season goals include securing the State Championship and expanding our recruiting footprint nationwide.
              </p>
            </div>
          </section>

          {/* Athlete Roster */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-white">Featured Athletes</h2>
              <Link href="#" className="text-sm text-[#D4AF37] hover:underline font-medium">View Full Roster</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {mockAthletes.map((athlete, index) => (
                <Link
                  key={athlete.id}
                  href={`/card/${athlete.id}`}
                  className={`group relative block overflow-hidden rounded-lg bg-[#1F1F22] ring-1 ring-white/5 hover:ring-[#D4AF37]/50 transition-all ${index === 4 ? 'hidden lg:block' : ''}`}
                >
                  <div
                    className="aspect-[3/4] w-full bg-gray-800 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url('${athlete.imageUrl}')` }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 flex flex-col justify-end">
                    <p className="text-white font-bold text-sm leading-tight group-hover:text-[#D4AF37] transition-colors">{athlete.name}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{athlete.position} • Class of {athlete.classYear}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Coaching Staff */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-white mb-4">Coaching Staff</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockCoaches.map((coach) => (
                <div key={coach.id} className="flex items-center gap-4 rounded-xl bg-[#1F1F22] p-4 ring-1 ring-white/5">
                  <div
                    className="size-14 shrink-0 rounded-full bg-gray-700 bg-cover bg-center"
                    style={{ backgroundImage: `url('${coach.imageUrl}')` }}
                  ></div>
                  <div>
                    <p className="font-bold text-white">{coach.name}</p>
                    <p className={`text-sm font-medium ${coach.isHead ? 'text-[#D4AF37]' : 'text-gray-400'}`}>{coach.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Footer Actions Sticky */}
      <div className="sticky bottom-0 z-40 w-full bg-[#050505]/95 backdrop-blur border-t border-[#1F1F22] p-4">
        <div className="mx-auto max-w-[1000px] flex flex-col sm:flex-row gap-4">
          <button className="flex-1 rounded-lg bg-[#D4AF37] py-3 px-6 text-sm font-bold text-black shadow-lg shadow-[#D4AF37]/20 hover:bg-[#D4AF37]/90 hover:shadow-[#D4AF37]/30 transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">add_circle</span>
            Follow This Program
          </button>
          <button className="flex-1 rounded-lg border border-[#333] bg-[#1F1F22] py-3 px-6 text-sm font-bold text-white hover:bg-[#2A2A2E] hover:border-gray-600 transition-all">
            Create RepMax Profile
          </button>
        </div>
      </div>
    </div>
  );
}
