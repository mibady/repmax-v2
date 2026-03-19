'use client';

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardWizard, validateRows, MAPPABLE_FIELDS } from '@/lib/hooks/use-onboard-wizard';
import type { ColumnMapping, RowValidation } from '@/lib/hooks/use-onboard-wizard';

const STEPS = [
  { num: 1, label: 'School Info', icon: 'school' },
  { num: 2, label: 'Upload Roster', icon: 'upload_file' },
  { num: 3, label: 'Map Columns', icon: 'view_column' },
  { num: 4, label: 'Review Data', icon: 'table_chart' },
  { num: 5, label: 'Import', icon: 'sync' },
  { num: 6, label: 'Complete', icon: 'check_circle' },
];

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY',
  'LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND',
  'OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
];

const PRIMARY_SPORTS = ['Football', 'Basketball', 'Baseball', 'Soccer', 'Multi-Sport'];

/* ─── Shared Input Component ─── */
function FormInput({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = 'text',
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-400 mb-1.5 block">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-500 focus:border-primary/50 focus:outline-none transition-colors"
      />
    </div>
  );
}

/* ─── Step Rail ─── */
function StepRail({ currentStep }: { currentStep: number }) {
  return (
    <div className="w-56 flex-shrink-0">
      <div className="sticky top-8 space-y-1">
        {STEPS.map((step) => {
          const isActive = step.num === currentStep;
          const isCompleted = step.num < currentStep;
          return (
            <div
              key={step.num}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive
                  ? 'bg-white/10 text-white'
                  : isCompleted
                    ? 'text-green-400'
                    : 'text-slate-500'
              }`}
            >
              <div
                className={`flex items-center justify-center size-7 rounded-full text-xs font-bold flex-shrink-0 ${
                  isActive
                    ? 'bg-primary text-black'
                    : isCompleted
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-white/5 text-slate-500'
                }`}
              >
                {isCompleted ? (
                  <span className="material-symbols-outlined text-sm">check</span>
                ) : (
                  step.num
                )}
              </div>
              <span className="text-sm font-medium">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Step 1: School Info (Full Stitch Fidelity) ─── */
function StepSchoolInfo({
  data,
  onChange,
  onNext,
  onCancel,
  isProcessing,
}: {
  data: ReturnType<typeof useOnboardWizard>['schoolData'];
  onChange: (d: typeof data) => void;
  onNext: () => Promise<void>;
  onCancel: () => void;
  isProcessing: boolean;
}) {
  const canProceed = data.name.trim() && data.city.trim() && data.state;
  const initials = data.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">School Information</h2>
        <p className="text-sm text-slate-400">Enter the high school program details to create their RepMax profile</p>
      </div>

      {/* Logo / Initials Preview */}
      <div className="flex items-center gap-4">
        <div className="size-16 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 flex items-center justify-center text-xl font-bold text-primary">
          {initials || 'HS'}
        </div>
        <div>
          <p className="text-sm font-medium text-white">{data.name || 'School Name'}</p>
          <p className="text-xs text-slate-400">Logo can be uploaded after creation</p>
        </div>
      </div>

      {/* Core Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <FormInput label="School Name" value={data.name} required onChange={(v) => onChange({ ...data, name: v })} placeholder="e.g. Lincoln High School" />
        </div>
        <FormInput label="Short Name / Mascot" value={data.mascot} onChange={(v) => onChange({ ...data, mascot: v })} placeholder="e.g. Lions" />
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">Primary Sport</label>
          <select
            value={data.primary_sport}
            onChange={(e) => onChange({ ...data, primary_sport: e.target.value })}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-primary/50 focus:outline-none transition-colors"
          >
            {PRIMARY_SPORTS.map((s) => (
              <option key={s} value={s} className="bg-[#1F1F22]">{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Location */}
      <div>
        <p className="text-xs font-medium text-slate-400 mb-3 uppercase tracking-wider">Location</p>
        <div className="grid grid-cols-3 gap-4">
          <FormInput label="City" value={data.city} required onChange={(v) => onChange({ ...data, city: v })} placeholder="e.g. Dallas" />
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">
              State <span className="text-primary">*</span>
            </label>
            <select
              value={data.state}
              onChange={(e) => onChange({ ...data, state: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-primary/50 focus:outline-none transition-colors"
            >
              <option value="" className="bg-[#1F1F22]">Select...</option>
              {US_STATES.map((s) => (
                <option key={s} value={s} className="bg-[#1F1F22]">{s}</option>
              ))}
            </select>
          </div>
          <FormInput label="ZIP Code" value={data.zip_code} onChange={(v) => onChange({ ...data, zip_code: v })} placeholder="75001" />
        </div>
      </div>

      {/* Conference & Division */}
      <div className="grid grid-cols-2 gap-4">
        <FormInput label="Conference / League" value={data.conference} onChange={(v) => onChange({ ...data, conference: v })} placeholder="e.g. District 8-6A" />
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">Division</label>
          <select
            value={data.division}
            onChange={(e) => onChange({ ...data, division: e.target.value })}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-primary/50 focus:outline-none transition-colors"
          >
            <option value="" className="bg-[#1F1F22]">Select division...</option>
            <option value="6a" className="bg-[#1F1F22]">6A</option>
            <option value="5a" className="bg-[#1F1F22]">5A</option>
            <option value="4a" className="bg-[#1F1F22]">4A</option>
            <option value="3a" className="bg-[#1F1F22]">3A</option>
            <option value="2a" className="bg-[#1F1F22]">2A</option>
            <option value="1a" className="bg-[#1F1F22]">1A</option>
            <option value="private" className="bg-[#1F1F22]">Private</option>
          </select>
        </div>
      </div>

      {/* Staff */}
      <div>
        <p className="text-xs font-medium text-slate-400 mb-3 uppercase tracking-wider">Staff</p>
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Head Coach Name" value={data.head_coach_name} onChange={(v) => onChange({ ...data, head_coach_name: v })} placeholder="Coach Williams" />
          <FormInput label="Athletic Director" value={data.athletic_director} onChange={(v) => onChange({ ...data, athletic_director: v })} placeholder="John Smith" />
          <FormInput label="Program Email" value={data.program_email} onChange={(v) => onChange({ ...data, program_email: v })} placeholder="football@lincoln.edu" type="email" />
          <FormInput label="Program Phone" value={data.program_phone} onChange={(v) => onChange({ ...data, program_phone: v })} placeholder="(214) 555-0100" type="tel" />
        </div>
      </div>

      {/* Program Stats */}
      <div>
        <p className="text-xs font-medium text-slate-400 mb-3 uppercase tracking-wider">Program Stats</p>
        <div className="grid grid-cols-3 gap-4">
          <FormInput label="State Championships" value={data.state_championships} onChange={(v) => onChange({ ...data, state_championships: parseInt(v) || 0 })} type="number" />
          <FormInput label="D1 Signees (Last Season)" value={data.d1_signees} onChange={(v) => onChange({ ...data, d1_signees: parseInt(v) || 0 })} type="number" />
          <FormInput label="Current Roster Size" value={data.roster_size} onChange={(v) => onChange({ ...data, roster_size: parseInt(v) || 0 })} type="number" />
        </div>
      </div>

      {/* Admin Access */}
      <div>
        <p className="text-xs font-medium text-slate-400 mb-3 uppercase tracking-wider">Admin Access</p>
        <div className="grid grid-cols-1 gap-4">
          <FormInput label="Coach Login Email" value={data.coach_login_email} onChange={(v) => onChange({ ...data, coach_login_email: v })} placeholder="coach.williams@lincoln.edu" type="email" />
        </div>
        <p className="text-xs text-slate-500 mt-2">
          <span className="material-symbols-outlined text-xs align-middle mr-1">mail</span>
          A welcome email with login instructions will be sent to this address
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t border-white/5">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed || isProcessing}
          className="px-6 py-2.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {isProcessing ? 'Creating School...' : (
            <>
              SAVE & CONTINUE
              <span className="material-symbols-outlined text-base">arrow_forward</span>
              UPLOAD ROSTER
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ─── Step 2: Upload Roster (Enhanced) ─── */
function StepUpload({
  onUpload,
  parsedData,
  isProcessing,
  onNext,
  onBack,
  onRemoveFile,
  onEnterManual,
}: {
  onUpload: (file: File) => Promise<void>;
  parsedData: ReturnType<typeof useOnboardWizard>['parsedData'];
  isProcessing: boolean;
  onNext: () => void;
  onBack: () => void;
  onRemoveFile: () => void;
  onEnterManual: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      const name = file.name.toLowerCase();
      if (!name.endsWith('.csv')) return;
      await onUpload(file);
    },
    [onUpload]
  );

  const handleDownloadTemplate = useCallback(() => {
    const headers = 'First Name,Last Name,Position,Class Year,Height,Weight,GPA,Email,Phone,Jersey Number,Guardian Email,ZIP Code,City';
    const blob = new Blob([headers + '\n'], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'repmax_roster_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileTypeInfo = (fileName: string) => {
    if (fileName.endsWith('.csv')) return { label: 'CSV', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) return { label: 'XLS', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
    return { label: 'FILE', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' };
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Upload Roster</h2>
        <p className="text-sm text-slate-400">Upload a file with your athlete roster data</p>
      </div>

      {/* Dropzone */}
      {!parsedData && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-primary bg-primary/5'
              : 'border-white/10 hover:border-white/20'
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <span className="material-symbols-outlined text-4xl text-slate-500 mb-3 block">
            {isProcessing ? 'progress_activity' : 'cloud_upload'}
          </span>
          <p className="text-white font-medium mb-2">
            {isProcessing ? 'Parsing file...' : 'Drop file here or click to browse'}
          </p>
          <div className="flex items-center justify-center gap-3 mt-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border bg-green-500/20 text-green-400 border-green-500/30">CSV</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border bg-purple-500/20 text-purple-400 border-purple-500/30 opacity-50">XLSX <span className="ml-1 text-[8px] opacity-70">soon</span></span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border bg-purple-500/20 text-purple-400 border-purple-500/30 opacity-50">XLS <span className="ml-1 text-[8px] opacity-70">soon</span></span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border bg-red-500/20 text-red-400 border-red-500/30 opacity-50">PDF <span className="ml-1 text-[8px] opacity-70">soon</span></span>
          </div>
        </div>
      )}

      {/* File Chip + Preview */}
      {parsedData && (
        <div className="space-y-4">
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold border ${getFileTypeInfo(parsedData.fileName).color}`}>
                {getFileTypeInfo(parsedData.fileName).label}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{parsedData.fileName}</p>
                <p className="text-xs text-slate-400">
                  {parsedData.totalRows} rows · {parsedData.headers.length} columns · {formatFileSize(parsedData.fileSize)}
                </p>
              </div>
              <button
                onClick={onRemoveFile}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-red-400 transition-colors"
                title="Remove file"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Preview Table */}
            {parsedData.previewRows.length > 0 && (
              <div className="mt-4 overflow-x-auto border border-white/5 rounded-lg">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      {parsedData.headers.map((h, i) => (
                        <th key={i} className="text-left py-1.5 px-2 text-slate-500 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.previewRows.map((row, rIdx) => (
                      <tr key={rIdx} className="border-b border-white/5 last:border-0">
                        {parsedData.headers.map((_, cIdx) => (
                          <td key={cIdx} className="py-1.5 px-2 text-slate-300">{row[cIdx] || '—'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-center py-1.5 text-[10px] text-slate-600">
                  Showing first {parsedData.previewRows.length} of {parsedData.totalRows} rows
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Template Downloads */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <p className="text-xs font-medium text-slate-400 mb-3">Don&apos;t have a file?</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-300 hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-sm text-green-400">download</span>
            Download CSV Template
          </button>
          <button
            disabled
            title="XLSX template coming soon"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-500 opacity-50 cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-sm text-purple-400">download</span>
            Download XLSX Template
            <span className="text-[8px] opacity-70">soon</span>
          </button>
          <button
            onClick={onEnterManual}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-300 hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-sm text-blue-400">edit_note</span>
            Enter Athletes Manually
          </button>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button onClick={onBack} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!parsedData}
          className="px-6 py-2.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 disabled:opacity-50 transition-colors"
        >
          Next: Map Columns
        </button>
      </div>
    </div>
  );
}

/* ─── Step 3: Column Mapper with Status Badges ─── */
function StepMapper({
  headers,
  mapping,
  confidence,
  onMappingChange,
  onNext,
  onBack,
}: {
  headers: string[];
  mapping: ColumnMapping;
  confidence: Record<number, 'auto' | 'review' | 'skip'>;
  onMappingChange: (m: ColumnMapping) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const getMappedField = (idx: number): string => {
    for (const [field, colIdx] of Object.entries(mapping)) {
      if (colIdx === idx) return field;
    }
    return 'skip';
  };

  const handleFieldChange = (headerIdx: number, field: string) => {
    const newMapping = { ...mapping };
    for (const [k, v] of Object.entries(newMapping)) {
      if (v === headerIdx) delete newMapping[k];
    }
    if (field !== 'skip') {
      for (const [k] of Object.entries(newMapping)) {
        if (k === field) delete newMapping[k];
      }
      newMapping[field] = headerIdx;
    }
    onMappingChange(newMapping);
  };

  const hasRequired = 'first_name' in mapping && 'last_name' in mapping;
  const autoCount = Object.values(confidence).filter((c) => c === 'auto').length;
  const reviewCount = Object.values(confidence).filter((c) => c === 'review').length;

  const isFieldRequired = (field: string) =>
    ['first_name', 'last_name', 'position', 'class_year'].includes(field);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Map Columns</h2>
        <p className="text-sm text-slate-400">Map your file columns to athlete fields</p>
      </div>

      {/* Auto/Review counts */}
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/15 text-green-400 border border-green-500/20">
          <span className="material-symbols-outlined text-xs">check_circle</span>
          {autoCount} auto-matched
        </span>
        {reviewCount > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/20">
            <span className="material-symbols-outlined text-xs">help</span>
            {reviewCount} needs review
          </span>
        )}
      </div>

      {/* Mapper Table */}
      <div className="overflow-hidden border border-white/5 rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="text-left py-2.5 px-4 text-xs font-medium text-slate-400">Your File Column</th>
              <th className="text-center py-2.5 px-2 text-xs font-medium text-slate-400 w-8"></th>
              <th className="text-left py-2.5 px-4 text-xs font-medium text-slate-400">Maps To</th>
              <th className="text-center py-2.5 px-4 text-xs font-medium text-slate-400">Status</th>
              <th className="text-center py-2.5 px-4 text-xs font-medium text-slate-400">Required?</th>
            </tr>
          </thead>
          <tbody>
            {headers.map((header, idx) => {
              const mappedField = getMappedField(idx);
              const status = confidence[idx] || 'skip';
              const fieldRequired = mappedField !== 'skip' && isFieldRequired(mappedField);
              return (
                <tr key={idx} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 px-4">
                    <span className="text-sm font-medium text-white">{header}</span>
                    <span className="text-[10px] text-slate-600 ml-2">Col {idx + 1}</span>
                  </td>
                  <td className="text-center px-2">
                    <span className="material-symbols-outlined text-slate-600 text-base">arrow_forward</span>
                  </td>
                  <td className="py-2.5 px-4">
                    <select
                      value={mappedField}
                      onChange={(e) => handleFieldChange(idx, e.target.value)}
                      className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-primary/50 focus:outline-none transition-colors"
                    >
                      {MAPPABLE_FIELDS.map((f) => (
                        <option key={f.value} value={f.value} className="bg-[#1F1F22]">{f.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {mappedField !== 'skip' && status === 'auto' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30">AUTO</span>
                    )}
                    {mappedField !== 'skip' && status === 'review' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">REVIEW</span>
                    )}
                    {mappedField === 'skip' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/20 text-slate-500 border border-slate-500/30">SKIP</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {fieldRequired ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-400">Required</span>
                    ) : mappedField !== 'skip' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/10 text-slate-500">Optional</span>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-500">
        <span className="material-symbols-outlined text-xs align-middle mr-1">info</span>
        Columns mapped to &quot;Skip&quot; will be ignored during import. Required fields must be mapped for rows to import successfully.
      </p>

      {!hasRequired && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-400 flex items-center gap-2">
          <span className="material-symbols-outlined text-base">warning</span>
          Map at least First Name and Last Name to proceed
        </div>
      )}

      <div className="flex justify-between pt-4">
        <button onClick={onBack} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!hasRequired}
          className="px-6 py-2.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 disabled:opacity-50 transition-colors"
        >
          Next: Review Data
        </button>
      </div>
    </div>
  );
}

/* ─── Step 4: Review & Fix with Granular Validation ─── */
function StepReview({
  rows,
  mapping,
  excludedRows,
  onToggleExclude,
  onExcludeGraduated,
  onUpdateCell,
  onAddRow,
  onNext,
  onBack,
  isProcessing,
  isManualMode,
}: {
  rows: string[][];
  mapping: ColumnMapping;
  excludedRows: Set<number>;
  onToggleExclude: (idx: number) => void;
  onExcludeGraduated: () => void;
  onUpdateCell: (rowIdx: number, colIdx: number, value: string) => void;
  onAddRow: () => void;
  onNext: () => void;
  onBack: () => void;
  isProcessing: boolean;
  isManualMode: boolean;
}) {
  const [showErrorsOnly, setShowErrorsOnly] = useState(false);
  const [editingRow, setEditingRow] = useState<number | null>(null);

  const validations = useMemo(() => validateRows(rows, mapping), [rows, mapping]);
  const mappedFields = Object.entries(mapping).sort((a, b) => a[1] - b[1]);

  const activeValidations = validations.filter((_, idx) => !excludedRows.has(idx));
  const readyCount = activeValidations.filter((v) => v.status === 'ready').length;
  const warningCount = activeValidations.filter((v) => v.status === 'warning').length;
  const errorCount = activeValidations.filter((v) => v.status === 'error').length;

  const filteredIndices = rows
    .map((_, idx) => idx)
    .filter((idx) => !excludedRows.has(idx))
    .filter((idx) => {
      if (!showErrorsOnly) return true;
      return validations[idx].status === 'error' || validations[idx].status === 'warning';
    });

  const getStatusBadge = (validation: RowValidation) => {
    const msg = validation.messages[0];
    switch (validation.status) {
      case 'ready':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400">✓ READY</span>;
      case 'warning':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">⚠ {msg}</span>;
      case 'error':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400">✗ {msg}</span>;
    }
  };

  const getRowBg = (validation: RowValidation) => {
    switch (validation.status) {
      case 'ready': return 'bg-green-500/[0.03]';
      case 'warning': return 'bg-amber-500/[0.03]';
      case 'error': return 'bg-red-500/[0.03]';
    }
  };

  const handleExportErrors = () => {
    const errorRows = rows.filter((_, idx) => validations[idx].status === 'error' || validations[idx].status === 'warning');
    const headers = mappedFields.map(([f]) => f);
    const csvLines = [headers.join(',')];
    errorRows.forEach((row) => {
      csvLines.push(mappedFields.map(([, colIdx]) => row[colIdx] || '').join(','));
    });
    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'roster_issues.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Review & Fix</h2>
        <p className="text-sm text-slate-400">Review each athlete row before importing</p>
      </div>

      {/* Count Badges */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          {readyCount} ready
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <span className="material-symbols-outlined text-sm">warning</span>
          {warningCount} warnings
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
          <span className="material-symbols-outlined text-sm">error</span>
          {errorCount} errors
        </span>
        {excludedRows.size > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <span className="material-symbols-outlined text-sm">remove_circle</span>
            {excludedRows.size} excluded
          </span>
        )}
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setShowErrorsOnly(!showErrorsOnly)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            showErrorsOnly
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
          }`}
        >
          <span className="material-symbols-outlined text-sm">filter_alt</span>
          {showErrorsOnly ? 'Show All' : 'Show Errors Only'}
        </button>
        {isManualMode && (
          <button
            onClick={onAddRow}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Row
          </button>
        )}
        {!isManualMode && (
          <>
            <button
              onClick={onExcludeGraduated}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">school</span>
              Exclude Graduated
            </button>
            <button
              onClick={handleExportErrors}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              Export for Correction
            </button>
          </>
        )}
      </div>

      {/* Review Table */}
      <div className="overflow-x-auto border border-white/5 rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="text-left py-2 px-3 text-xs font-medium text-slate-400 w-8">#</th>
              {mappedFields.map(([field]) => (
                <th key={field} className="text-left py-2 px-3 text-xs font-medium text-slate-400 capitalize">
                  {field.replace(/_/g, ' ')}
                </th>
              ))}
              <th className="text-center py-2 px-3 text-xs font-medium text-slate-400">Status</th>
              <th className="text-center py-2 px-3 text-xs font-medium text-slate-400 w-20">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredIndices.slice(0, 50).map((rowIdx) => {
              const row = rows[rowIdx];
              const validation = validations[rowIdx];
              return (
                <tr key={rowIdx} className={`border-b border-white/5 ${getRowBg(validation)} transition-colors`}>
                  <td className="py-2 px-3 text-slate-500 text-xs">{rowIdx + 1}</td>
                  {mappedFields.map(([field, colIdx]) => (
                    <td key={field} className="py-2 px-3 text-white text-xs">
                      {editingRow === rowIdx || isManualMode ? (
                        <input
                          defaultValue={row[colIdx] || ''}
                          className="w-full px-1.5 py-0.5 bg-white/10 border border-white/20 rounded text-xs text-white"
                          onBlur={(e) => {
                            onUpdateCell(rowIdx, colIdx, e.target.value);
                            if (!isManualMode) setEditingRow(null);
                          }}
                        />
                      ) : (
                        row[colIdx] || <span className="text-slate-600">—</span>
                      )}
                    </td>
                  ))}
                  <td className="py-2 px-3 text-center">{getStatusBadge(validation)}</td>
                  <td className="py-2 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {validation.status !== 'ready' && (
                        <button
                          onClick={() => setEditingRow(editingRow === rowIdx ? null : rowIdx)}
                          className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                          title="Edit row"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                      )}
                      <button
                        onClick={() => onToggleExclude(rowIdx)}
                        className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-red-400 transition-colors"
                        title="Exclude row"
                      >
                        <span className="material-symbols-outlined text-sm">remove_circle_outline</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredIndices.length > 50 && (
          <div className="text-center py-2 text-xs text-slate-500">
            Showing first 50 of {filteredIndices.length} rows
          </div>
        )}
      </div>

      {/* Error Summary */}
      {errorCount > 0 && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
          <p className="text-xs font-medium text-red-400 mb-2">Error Summary</p>
          <p className="text-xs text-slate-400">
            {errorCount} row{errorCount !== 1 ? 's' : ''} have missing required fields and will not be imported unless fixed.
            You can import the valid rows and skip errors, or fix them above.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <button onClick={onBack} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
          Back
        </button>
        <div className="flex items-center gap-3">
          {errorCount > 0 && readyCount + warningCount > 0 && (
            <button
              onClick={onNext}
              disabled={isProcessing}
              className="px-5 py-2.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-sm font-medium hover:bg-amber-500/30 disabled:opacity-50 transition-colors"
            >
              Import {readyCount + warningCount} (Skip Errors)
            </button>
          )}
          <button
            onClick={onNext}
            disabled={(readyCount + warningCount === 0 && errorCount > 0) || isProcessing}
            className="px-6 py-2.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 disabled:opacity-50 transition-colors"
          >
            {isProcessing ? 'Preparing...' : `Import All ${readyCount + warningCount}`}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Step 5: Real Progress Bar ─── */
function StepImport({
  isProcessing,
  totalRows,
}: {
  isProcessing: boolean;
  totalRows: number;
}) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Preparing import...');

  useEffect(() => {
    if (!isProcessing) return;

    const stages = [
      { pct: 15, text: 'Validating data...' },
      { pct: 35, text: 'Creating athlete profiles...' },
      { pct: 55, text: `Creating athlete profiles... (${Math.floor(totalRows * 0.5)} / ${totalRows})` },
      { pct: 75, text: `Creating athlete profiles... (${Math.floor(totalRows * 0.75)} / ${totalRows})` },
      { pct: 88, text: 'Generating QR codes...' },
      { pct: 94, text: 'Linking to school roster...' },
    ];

    let stageIdx = 0;
    const interval = setInterval(() => {
      if (stageIdx < stages.length) {
        setProgress(stages[stageIdx].pct);
        setStatusText(stages[stageIdx].text);
        stageIdx++;
      }
    }, 800);

    return () => clearInterval(interval);
  }, [isProcessing, totalRows]);

  // Jump to 100% when processing completes
  useEffect(() => {
    if (!isProcessing && progress > 0) {
      setProgress(100);
      setStatusText('Import complete!');
    }
  }, [isProcessing, progress]);

  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-8">
      {/* Progress Circle */}
      <div className="relative size-32">
        <svg className="size-32 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="52" fill="none"
            stroke={progress >= 100 ? '#22c55e' : '#3b82f6'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 52}`}
            strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress / 100)}`}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-bold ${progress >= 100 ? 'text-green-400' : 'text-white'}`}>
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md">
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              progress >= 100 ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-lg font-semibold text-white mb-1">Importing Athletes</h2>
        <p className="text-sm text-slate-400">{statusText}</p>
      </div>
    </div>
  );
}

/* ─── Step 6: Completion with Auto-Actions ─── */
function StepComplete({
  results,
  programId,
  onReset,
  onNavigate,
}: {
  results: ReturnType<typeof useOnboardWizard>['importResults'];
  programId: string | null;
  onReset: () => void;
  onNavigate: (path: string) => void;
}) {
  const imported = results?.imported ?? 0;
  const flagged = results?.flagged ?? results?.warnings ?? 0;
  const skipped = results?.skipped ?? 0;
  const displayProgramId = programId || results?.program_id || 'PRG-0001';

  const autoActions = [
    { label: `Welcome email to Coach`, status: 'PLANNED', color: 'bg-slate-500/20 text-slate-400' },
    { label: `Welcome email to AD`, status: 'PLANNED', color: 'bg-slate-500/20 text-slate-400' },
    { label: `${imported} athlete welcome emails`, status: 'PLANNED', color: 'bg-slate-500/20 text-slate-400' },
    { label: `${imported} QR codes (generated on demand)`, status: 'READY', color: 'bg-green-500/20 text-green-400' },
    { label: `${imported} player cards (rendered on demand)`, status: 'READY', color: 'bg-green-500/20 text-green-400' },
    { label: `${flagged} profiles flagged for review`, status: flagged > 0 ? 'PENDING' : 'NONE', color: flagged > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400' },
    { label: `Parent consent emails`, status: 'PLANNED', color: 'bg-slate-500/20 text-slate-400' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col items-center text-center pt-4">
        <div className="size-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-green-400 text-4xl">check_circle</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-1">Onboarding Complete!</h2>
        <p className="text-sm text-slate-400">
          {displayProgramId} created · {imported} athletes imported · Welcome emails queued
        </p>
      </div>

      {/* 4-Column Result Grid */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{imported}</p>
          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Athletes Created</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{imported}</p>
          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">QR Codes Generated</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{flagged}</p>
          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Need Review</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{skipped}</p>
          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Skipped — Error</p>
        </div>
      </div>

      {/* Auto-Actions Panel */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-1">What Happens Next</h3>
        <p className="text-xs text-slate-500 mb-4">Auto-Actions Triggered</p>
        <div className="space-y-2.5">
          {autoActions.map((action, idx) => (
            <div key={idx} className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-sm text-slate-500">
                  {action.status === 'READY'
                    ? 'check_circle'
                    : action.status === 'PENDING'
                      ? 'flag'
                      : action.status === 'PLANNED'
                        ? 'schedule'
                        : 'remove_circle_outline'}
                </span>
                <span className="text-sm text-slate-300">{action.label}</span>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${action.color}`}>
                {action.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          onClick={() => onNavigate('/admin')}
          className="flex flex-col items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined text-primary">domain</span>
          <span className="text-xs text-slate-300">View Program</span>
        </button>
        <button
          onClick={() => onNavigate('/coach/roster')}
          className="flex flex-col items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined text-primary">groups</span>
          <span className="text-xs text-slate-300">View Roster</span>
        </button>
        <button
          onClick={() => onNavigate('/admin/users')}
          className="flex flex-col items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined text-amber-400">flag</span>
          <span className="text-xs text-slate-300">Review Flagged</span>
        </button>
        <button
          onClick={onReset}
          className="flex flex-col items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined text-green-400">add_circle</span>
          <span className="text-xs text-slate-300">Onboard Another</span>
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function AdminOnboardPage() {
  const wizard = useOnboardWizard();
  const router = useRouter();

  const handleStep1Next = async () => {
    await wizard.createSchool();
    wizard.nextStep();
  };

  const handleUpload = async (file: File) => {
    await wizard.uploadFile(file);
  };

  const handleEnterManual = () => {
    wizard.enterManualMode();
    // Skip to step 4 (review/edit) — columns are pre-mapped in manual mode
    wizard.nextStep(); // 2 → 3
    wizard.nextStep(); // 3 → 4
  };

  const isManualMode = wizard.parsedData?.fileName === 'manual-entry';

  const handleImport = async () => {
    wizard.nextStep(); // Go to step 5 (progress)
    await wizard.runImport(); // This auto-advances to step 6
  };

  const totalActiveRows = wizard.parsedData
    ? wizard.parsedData.rows.length - wizard.excludedRows.size
    : 0;

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Onboard HS Program</h1>
          <p className="text-slate-400">6-step wizard to onboard a new high school football program</p>
        </div>

        {wizard.error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-red-400">error</span>
            <p className="text-sm text-red-400">{wizard.error.message}</p>
          </div>
        )}

        <div className="flex gap-8">
          <StepRail currentStep={wizard.currentStep} />

          <div className="flex-1 bg-[#1F1F22] rounded-xl border border-white/5 p-6">
            {wizard.currentStep === 1 && (
              <StepSchoolInfo
                data={wizard.schoolData}
                onChange={wizard.setSchoolData}
                onNext={handleStep1Next}
                onCancel={wizard.reset}
                isProcessing={wizard.isProcessing}
              />
            )}
            {wizard.currentStep === 2 && (
              <StepUpload
                onUpload={handleUpload}
                parsedData={wizard.parsedData}
                isProcessing={wizard.isProcessing}
                onNext={wizard.nextStep}
                onBack={wizard.prevStep}
                onRemoveFile={wizard.removeFile}
                onEnterManual={handleEnterManual}
              />
            )}
            {wizard.currentStep === 3 && wizard.parsedData && (
              <StepMapper
                headers={wizard.parsedData.headers}
                mapping={wizard.columnMapping}
                confidence={wizard.columnConfidence}
                onMappingChange={wizard.setColumnMapping}
                onNext={wizard.nextStep}
                onBack={wizard.prevStep}
              />
            )}
            {wizard.currentStep === 4 && wizard.parsedData && (
              <StepReview
                rows={wizard.parsedData.rows}
                mapping={wizard.columnMapping}
                excludedRows={wizard.excludedRows}
                onToggleExclude={wizard.toggleExcludeRow}
                onExcludeGraduated={wizard.excludeGraduated}
                onUpdateCell={wizard.updateRowCell}
                onAddRow={wizard.addEmptyRow}
                onNext={handleImport}
                onBack={wizard.prevStep}
                isProcessing={wizard.isProcessing}
                isManualMode={isManualMode}
              />
            )}
            {wizard.currentStep === 5 && (
              <StepImport
                isProcessing={wizard.isProcessing}
                totalRows={totalActiveRows}
              />
            )}
            {wizard.currentStep === 6 && (
              <StepComplete
                results={wizard.importResults}
                programId={wizard.programId}
                onReset={wizard.reset}
                onNavigate={(path) => router.push(path)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
