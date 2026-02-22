'use client';

import { useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAthleteDocuments, type AthleteDocument, useSubscription } from '@/lib/hooks';
import { getAthleteTier } from '@/lib/utils/subscription-tier';
import { UpgradeCTA } from '@/components/upgrade-cta';

function getTypeIcon(type: AthleteDocument['type']) {
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
  const { documents, isLoading, error, uploadDocument, deleteDocument } = useAthleteDocuments();
  const { subscription, isLoading: subLoading } = useSubscription();
  const tier = getAthleteTier(subscription?.plan?.slug);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filterTypes, setFilterTypes] = useState<Set<string>>(new Set());
  const [copiedDocId, setCopiedDocId] = useState<string | null>(null);

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterTypes.size === 0 || filterTypes.has(doc.type);
    return matchesSearch && matchesType;
  });

  const toggleFilterType = (type: string) => {
    setFilterTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const handleShare = async (docId: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedDocId(docId);
      setTimeout(() => setCopiedDocId(null), 2000);
    } catch {
      // Fallback for non-HTTPS contexts
      setCopiedDocId(docId);
      setTimeout(() => setCopiedDocId(null), 2000);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadDocument(file);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await deleteDocument(docId);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  if (isLoading || subLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  if (tier === 'basic') {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-black tracking-tight text-white">Documents</h1>
            <p className="text-[#A1A1AA] mt-1">Manage and share your recruiting materials securely.</p>
          </div>
          <UpgradeCTA
            icon="description"
            title="Unlock Document Management"
            description="Upgrade to Premium to securely store and share your recruiting documents, transcripts, and test scores."
            ctaText="Upgrade to Premium"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Documents</h1>
            <p className="text-[#A1A1AA] mt-1">Manage and share your recruiting materials securely.</p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#c4a030] text-[#050505] font-bold text-sm px-5 py-2.5 rounded-lg transition-all shadow-[0_0_15px_-3px_rgba(212,175,55,0.4)] hover:shadow-[0_0_20px_-3px_rgba(212,175,55,0.6)] disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-[20px]">upload_file</span>
            )}
            {isUploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>

        {/* Upload Zone */}
        <div
          className="mb-10 group relative cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#D4AF37]/30 to-[#D4AF37]/10 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
          <div className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/20 group-hover:border-[#D4AF37]/50 bg-[#1F1F22]/50 hover:bg-[#1F1F22]/80 rounded-xl transition-all">
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
              <div className="p-3 rounded-full bg-white/5 mb-3 group-hover:bg-[#D4AF37]/20 group-hover:text-[#D4AF37] transition-colors">
                {isUploading ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                )}
              </div>
              <p className="mb-1 text-base font-semibold text-white">
                {isUploading ? 'Uploading file...' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-sm text-[#A1A1AA]">Official transcripts, test scores, letters (PDF, JPG, PNG)</p>
            </div>
            <input
              ref={fileInputRef}
              className="hidden"
              id="dropzone-file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleFileSelect}
            />
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#1F1F22] border border-white/10 text-sm text-white rounded-lg pl-10 pr-4 py-2 focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] placeholder-slate-500 w-64 outline-none transition-all"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className={`flex items-center gap-2 px-3 py-2 bg-[#1F1F22] border rounded-lg text-sm font-medium transition-colors ${
                  showFilter || filterTypes.size > 0
                    ? 'border-primary/50 text-primary'
                    : 'border-white/10 text-[#A1A1AA] hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                Filter
                {filterTypes.size > 0 && (
                  <span className="bg-primary text-black text-[10px] font-bold px-1.5 rounded-full">{filterTypes.size}</span>
                )}
              </button>
              {showFilter && (
                <div className="absolute right-0 top-11 z-20 bg-[#2A2A2E] border border-white/10 rounded-lg shadow-xl p-3 min-w-[160px]">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Document Type</p>
                  {['pdf', 'image', 'other'].map(type => (
                    <label key={type} className="flex items-center gap-2 py-1.5 px-1 cursor-pointer hover:bg-white/5 rounded text-sm">
                      <input
                        type="checkbox"
                        checked={filterTypes.has(type)}
                        onChange={() => toggleFilterType(type)}
                        className="accent-primary"
                      />
                      <span className="text-white capitalize">{type === 'pdf' ? 'PDF' : type === 'image' ? 'Image' : 'Other'}</span>
                    </label>
                  ))}
                  {filterTypes.size > 0 && (
                    <button
                      onClick={() => setFilterTypes(new Set())}
                      className="mt-2 text-xs text-primary hover:text-primary/80 transition-colors"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <p className="text-red-500">{error.message}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && documents.length === 0 && (
          <div className="text-center py-20">
            <div className="size-16 rounded-full bg-[#1F1F22] flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl text-slate-500">folder_open</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No documents yet</h3>
            <p className="text-[#A1A1AA] mb-4">Upload your first document to get started.</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#c4a030] text-[#050505] font-bold text-sm px-5 py-2.5 rounded-lg transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">upload_file</span>
              Upload Document
            </button>
          </div>
        )}

        {/* Document Grid */}
        {!isLoading && !error && filteredDocuments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => {
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
                      <button onClick={() => window.open(doc.url, '_blank')} className="p-2 text-[#A1A1AA] hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="View">
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </button>
                      <button onClick={() => window.open(doc.url, '_blank')} className="p-2 text-[#A1A1AA] hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Download">
                        <span className="material-symbols-outlined text-[20px]">download</span>
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 text-[#A1A1AA] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                    <button
                      onClick={() => handleShare(doc.id, doc.url || '')}
                      className="flex items-center gap-1.5 text-sm font-semibold text-[#D4AF37] hover:text-[#e5c246] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {copiedDocId === doc.id ? 'check' : 'share'}
                      </span>
                      {copiedDocId === doc.id ? 'Copied!' : 'Share'}
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Upload More Card */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="group flex flex-col items-center justify-center p-6 border border-dashed border-white/10 hover:border-[#D4AF37]/50 rounded-xl hover:bg-white/5 transition-all h-full min-h-[220px]"
            >
              <div className="size-12 rounded-full bg-white/5 group-hover:bg-[#D4AF37]/20 flex items-center justify-center text-slate-400 group-hover:text-[#D4AF37] mb-3 transition-colors">
                <span className="material-symbols-outlined text-2xl">add</span>
              </div>
              <span className="text-sm font-medium text-slate-400 group-hover:text-white transition-colors">Upload Another File</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
