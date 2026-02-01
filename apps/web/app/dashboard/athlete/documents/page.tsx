import Link from 'next/link';

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'doc';
  size: string;
  uploadDate: string;
  verified: boolean;
}

const mockDocuments: Document[] = [
  { id: '1', name: 'Official Transcript.pdf', type: 'pdf', size: '2.4 MB', uploadDate: 'Oct 12, 2023', verified: true },
  { id: '2', name: 'Coach Recommendation.pdf', type: 'doc', size: '1.1 MB', uploadDate: 'Nov 04, 2023', verified: false },
  { id: '3', name: 'SAT Score Report.png', type: 'image', size: '850 KB', uploadDate: 'Dec 15, 2023', verified: false },
  { id: '4', name: 'Hudl Highlight Reel Link.pdf', type: 'pdf', size: '45 KB', uploadDate: 'Jan 10, 2024', verified: true },
];

function getTypeIcon(type: string) {
  switch (type) {
    case 'pdf':
      return { icon: 'picture_as_pdf', bgColor: 'bg-red-500/10', textColor: 'text-red-500' };
    case 'image':
      return { icon: 'image', bgColor: 'bg-purple-500/10', textColor: 'text-purple-500' };
    default:
      return { icon: 'description', bgColor: 'bg-blue-500/10', textColor: 'text-blue-500' };
  }
}

export default function DocumentsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-display">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#050505]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="size-8 flex items-center justify-center rounded bg-[#D4AF37]/20 text-[#D4AF37]">
                <span className="material-symbols-outlined">fitness_center</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight">RepMax</h2>
            </div>

            {/* Nav Links (Desktop) */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/dashboard/athlete" className="text-sm font-medium text-slate-400 hover:text-[#D4AF37] transition-colors">Dashboard</Link>
              <Link href="#" className="text-sm font-medium text-slate-400 hover:text-[#D4AF37] transition-colors">Recruiting</Link>
              <Link href="/dashboard/athlete/documents" className="text-sm font-medium text-[#D4AF37] border-b-2 border-[#D4AF37] pb-0.5">Documents</Link>
              <Link href="#" className="text-sm font-medium text-slate-400 hover:text-[#D4AF37] transition-colors">Settings</Link>
            </nav>

            {/* Profile */}
            <div className="flex items-center gap-4">
              <button className="text-slate-500 hover:text-white transition-colors">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <div className="size-9 rounded-full bg-[#1F1F22] border border-white/10 overflow-hidden cursor-pointer"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Documents</h1>
            <p className="text-[#A1A1AA] mt-1">Manage and share your recruiting materials securely.</p>
          </div>
          <button className="inline-flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#c4a030] text-[#050505] font-bold text-sm px-5 py-2.5 rounded-lg transition-all shadow-[0_0_15px_-3px_rgba(212,175,55,0.4)] hover:shadow-[0_0_20px_-3px_rgba(212,175,55,0.6)]">
            <span className="material-symbols-outlined text-[20px]">upload_file</span>
            Upload Document
          </button>
        </div>

        {/* Upload Zone */}
        <div className="mb-10 group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#D4AF37]/30 to-[#D4AF37]/10 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
          <div className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/20 group-hover:border-[#D4AF37]/50 bg-[#1F1F22]/50 hover:bg-[#1F1F22]/80 rounded-xl transition-all cursor-pointer">
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
              <div className="p-3 rounded-full bg-white/5 mb-3 group-hover:bg-[#D4AF37]/20 group-hover:text-[#D4AF37] transition-colors">
                <span className="material-symbols-outlined text-3xl">cloud_upload</span>
              </div>
              <p className="mb-1 text-base font-semibold text-white">Click to upload or drag and drop</p>
              <p className="text-sm text-[#A1A1AA]">Official transcripts, test scores, letters (PDF, JPG, PNG)</p>
            </div>
            <input className="hidden" id="dropzone-file" type="file" />
          </div>
        </div>

        {/* Filters & Sort */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Your Files</h3>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 material-symbols-outlined text-[20px]">search</span>
              <input
                type="text"
                placeholder="Search files..."
                className="bg-[#1F1F22] border border-white/10 text-sm text-white rounded-lg pl-10 pr-4 py-2 focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] placeholder-slate-500 w-64 outline-none transition-all"
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 bg-[#1F1F22] border border-white/10 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors text-[#A1A1AA] hover:text-white">
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Filter
            </button>
          </div>
        </div>

        {/* Document Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockDocuments.map((doc) => {
            const typeStyles = getTypeIcon(doc.type);
            return (
              <div key={doc.id} className="group relative bg-[#1F1F22] rounded-xl p-5 border border-white/5 hover:border-[#D4AF37]/30 transition-all duration-300 hover:shadow-lg hover:shadow-black/40">
                <div className="flex items-start justify-between mb-4">
                  <div className={`size-12 rounded-lg ${typeStyles.bgColor} flex items-center justify-center ${typeStyles.textColor}`}>
                    <span className="material-symbols-outlined text-3xl">{typeStyles.icon}</span>
                  </div>
                  {doc.verified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-500 border border-green-500/20">
                      <span className="material-symbols-outlined text-[14px]">verified</span>
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
                      <span className="material-symbols-outlined text-[14px]">pending</span>
                      Unverified
                    </span>
                  )}
                </div>
                <h4 className="text-lg font-bold text-white mb-1 truncate group-hover:text-[#D4AF37] transition-colors">{doc.name}</h4>
                <div className="flex items-center gap-3 text-xs text-[#A1A1AA] mb-6">
                  <span>{doc.size}</span>
                  <span className="size-1 rounded-full bg-gray-600"></span>
                  <span>Uploaded {doc.uploadDate}</span>
                </div>
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex gap-2">
                    <button className="p-2 text-[#A1A1AA] hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="View">
                      <span className="material-symbols-outlined text-[20px]">visibility</span>
                    </button>
                    <button className="p-2 text-[#A1A1AA] hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Download">
                      <span className="material-symbols-outlined text-[20px]">download</span>
                    </button>
                  </div>
                  <button className="flex items-center gap-1.5 text-sm font-semibold text-[#D4AF37] hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px]">share</span>
                    Share
                  </button>
                </div>
              </div>
            );
          })}

          {/* Upload More Card */}
          <button className="group flex flex-col items-center justify-center p-6 border border-dashed border-white/10 hover:border-[#D4AF37]/50 rounded-xl hover:bg-white/5 transition-all h-full min-h-[220px]">
            <div className="size-12 rounded-full bg-white/5 group-hover:bg-[#D4AF37]/20 flex items-center justify-center text-slate-400 group-hover:text-[#D4AF37] mb-3 transition-colors">
              <span className="material-symbols-outlined text-2xl">add</span>
            </div>
            <span className="text-sm font-medium text-slate-400 group-hover:text-white transition-colors">Upload Another File</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/5 py-8 mt-12 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#A1A1AA] text-sm">© 2024 RepMax. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-[#A1A1AA] hover:text-[#D4AF37] text-sm">Privacy</a>
            <a href="#" className="text-[#A1A1AA] hover:text-[#D4AF37] text-sm">Terms</a>
            <a href="#" className="text-[#A1A1AA] hover:text-[#D4AF37] text-sm">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
