'use client';

import { useCallback, useRef, useState } from 'react';
import { useOnboardWizard } from '@/lib/hooks/use-onboard-wizard';
import type { ColumnMapping } from '@/lib/hooks/use-onboard-wizard';

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

const MAPPABLE_FIELDS = [
  { value: 'skip', label: 'Skip' },
  { value: 'first_name', label: 'First Name' },
  { value: 'last_name', label: 'Last Name' },
  { value: 'position', label: 'Position' },
  { value: 'class_year', label: 'Class Year' },
  { value: 'height', label: 'Height' },
  { value: 'weight', label: 'Weight' },
  { value: 'gpa', label: 'GPA' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
];

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

function StepSchoolInfo({
  data,
  onChange,
  onNext,
  isProcessing,
}: {
  data: { name: string; city: string; state: string; conference: string; division: string };
  onChange: (d: typeof data) => void;
  onNext: () => Promise<void>;
  isProcessing: boolean;
}) {
  const canProceed = data.name.trim() && data.city.trim() && data.state;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">School Information</h2>
        <p className="text-sm text-slate-400">Enter the high school program details</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">School Name *</label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            placeholder="e.g. Lincoln High School"
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-500"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">City *</label>
          <input
            type="text"
            value={data.city}
            onChange={(e) => onChange({ ...data, city: e.target.value })}
            placeholder="e.g. Dallas"
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-500"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">State *</label>
          <select
            value={data.state}
            onChange={(e) => onChange({ ...data, state: e.target.value })}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
          >
            <option value="" className="bg-[#1F1F22]">Select state...</option>
            {US_STATES.map((s) => (
              <option key={s} value={s} className="bg-[#1F1F22]">{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">Conference</label>
          <input
            type="text"
            value={data.conference}
            onChange={(e) => onChange({ ...data, conference: e.target.value })}
            placeholder="e.g. District 8-6A"
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-500"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">Division</label>
          <select
            value={data.division}
            onChange={(e) => onChange({ ...data, division: e.target.value })}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
          >
            <option value="" className="bg-[#1F1F22]">Select division...</option>
            <option value="d1" className="bg-[#1F1F22]">Division I</option>
            <option value="d2" className="bg-[#1F1F22]">Division II</option>
            <option value="d3" className="bg-[#1F1F22]">Division III</option>
            <option value="naia" className="bg-[#1F1F22]">NAIA</option>
            <option value="juco" className="bg-[#1F1F22]">JUCO</option>
            <option value="high_school" className="bg-[#1F1F22]">High School</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          disabled={!canProceed || isProcessing}
          className="px-6 py-2.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 disabled:opacity-50 transition-colors"
        >
          {isProcessing ? 'Creating School...' : 'Next: Upload Roster'}
        </button>
      </div>
    </div>
  );
}

function StepUpload({
  onUpload,
  parsedData,
  isProcessing,
  onNext,
  onBack,
}: {
  onUpload: (file: File) => Promise<void>;
  parsedData: { fileName: string; totalRows: number; headers: string[] } | null;
  isProcessing: boolean;
  onNext: () => void;
  onBack: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith('.csv')) return;
      await onUpload(file);
    },
    [onUpload]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Upload Roster</h2>
        <p className="text-sm text-slate-400">Upload a CSV file with athlete data</p>
      </div>

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
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
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
        <p className="text-white font-medium mb-1">
          {isProcessing ? 'Parsing file...' : 'Drop CSV file here or click to browse'}
        </p>
        <p className="text-xs text-slate-500">Accepts .csv files</p>
      </div>

      {parsedData && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-green-400">check_circle</span>
          <div>
            <p className="text-sm font-medium text-white">{parsedData.fileName}</p>
            <p className="text-xs text-slate-400">
              {parsedData.totalRows} rows, {parsedData.headers.length} columns detected
            </p>
          </div>
        </div>
      )}

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

function StepMapper({
  headers,
  mapping,
  onMappingChange,
  onNext,
  onBack,
}: {
  headers: string[];
  mapping: ColumnMapping;
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
    // Remove any existing mapping for this field
    for (const [k, v] of Object.entries(newMapping)) {
      if (v === headerIdx) delete newMapping[k];
    }
    if (field !== 'skip') {
      // Remove field if mapped elsewhere
      for (const [k] of Object.entries(newMapping)) {
        if (k === field) delete newMapping[k];
      }
      newMapping[field] = headerIdx;
    }
    onMappingChange(newMapping);
  };

  const hasRequired = 'first_name' in mapping && 'last_name' in mapping;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Map Columns</h2>
        <p className="text-sm text-slate-400">Map CSV columns to athlete fields. First Name and Last Name are required.</p>
      </div>

      <div className="space-y-2">
        {headers.map((header, idx) => (
          <div key={idx} className="flex items-center gap-4 bg-white/[0.03] border border-white/5 rounded-lg px-4 py-3">
            <div className="flex-1">
              <span className="text-sm font-medium text-white">{header}</span>
              <span className="text-xs text-slate-500 ml-2">Column {idx + 1}</span>
            </div>
            <span className="material-symbols-outlined text-slate-500 text-lg">arrow_forward</span>
            <select
              value={getMappedField(idx)}
              onChange={(e) => handleFieldChange(idx, e.target.value)}
              className="w-44 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
            >
              {MAPPABLE_FIELDS.map((f) => (
                <option key={f.value} value={f.value} className="bg-[#1F1F22]">{f.label}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

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

function StepReview({
  rows,
  mapping,
  onNext,
  onBack,
  isProcessing,
}: {
  rows: string[][];
  mapping: ColumnMapping;
  onNext: () => void;
  onBack: () => void;
  isProcessing: boolean;
}) {
  const mappedFields = Object.entries(mapping).sort((a, b) => a[1] - b[1]);
  const validRows = rows.filter((row) => {
    const fnIdx = mapping.first_name;
    const lnIdx = mapping.last_name;
    return fnIdx !== undefined && lnIdx !== undefined && row[fnIdx]?.trim() && row[lnIdx]?.trim();
  });
  const invalidCount = rows.length - validRows.length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Review Data</h2>
        <p className="text-sm text-slate-400">
          {validRows.length} valid rows, {invalidCount} invalid (missing required fields)
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#1F1F22] rounded-lg border border-white/5 p-3 text-center">
          <p className="text-xl font-bold text-white">{rows.length}</p>
          <p className="text-xs text-slate-400">Total Rows</p>
        </div>
        <div className="bg-green-500/10 rounded-lg border border-green-500/20 p-3 text-center">
          <p className="text-xl font-bold text-green-400">{validRows.length}</p>
          <p className="text-xs text-slate-400">Valid</p>
        </div>
        <div className={`rounded-lg border p-3 text-center ${invalidCount > 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-[#1F1F22] border-white/5'}`}>
          <p className={`text-xl font-bold ${invalidCount > 0 ? 'text-red-400' : 'text-slate-500'}`}>{invalidCount}</p>
          <p className="text-xs text-slate-400">Invalid</p>
        </div>
      </div>

      <div className="overflow-x-auto border border-white/5 rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="text-left py-2 px-3 text-xs font-medium text-slate-400">#</th>
              {mappedFields.map(([field]) => (
                <th key={field} className="text-left py-2 px-3 text-xs font-medium text-slate-400 capitalize">
                  {field.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 20).map((row, rowIdx) => {
              const fnIdx = mapping.first_name;
              const lnIdx = mapping.last_name;
              const isValid = fnIdx !== undefined && lnIdx !== undefined && row[fnIdx]?.trim() && row[lnIdx]?.trim();
              return (
                <tr key={rowIdx} className={`border-b border-white/5 ${!isValid ? 'bg-red-500/5' : ''}`}>
                  <td className="py-2 px-3 text-slate-500">{rowIdx + 1}</td>
                  {mappedFields.map(([field, colIdx]) => (
                    <td key={field} className="py-2 px-3 text-white">
                      {row[colIdx] || <span className="text-slate-600">—</span>}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length > 20 && (
          <div className="text-center py-2 text-xs text-slate-500">
            Showing first 20 of {rows.length} rows
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <button onClick={onBack} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
          Back
        </button>
        <button
          onClick={onNext}
          disabled={validRows.length === 0 || isProcessing}
          className="px-6 py-2.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 disabled:opacity-50 transition-colors"
        >
          {isProcessing ? 'Importing...' : `Import ${validRows.length} Athletes`}
        </button>
      </div>
    </div>
  );
}

function StepImport({ isProcessing }: { isProcessing: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6">
      <div className="size-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      <div className="text-center">
        <h2 className="text-lg font-semibold text-white mb-1">Importing Athletes</h2>
        <p className="text-sm text-slate-400">
          {isProcessing ? 'Creating athlete profiles and linking to school...' : 'Preparing import...'}
        </p>
      </div>
    </div>
  );
}

function StepComplete({
  results,
  schoolName,
  onReset,
}: {
  results: { imported: number; warnings: number; errors: number } | null;
  schoolName: string;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6">
      <div className="size-16 rounded-full bg-green-500/20 flex items-center justify-center">
        <span className="material-symbols-outlined text-green-400 text-4xl">check_circle</span>
      </div>

      <div className="text-center">
        <h2 className="text-lg font-semibold text-white mb-1">Import Complete!</h2>
        <p className="text-sm text-slate-400">{schoolName} has been onboarded</p>
      </div>

      {results && (
        <div className="grid grid-cols-3 gap-4 w-full max-w-md">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{results.imported}</p>
            <p className="text-xs text-slate-400 mt-1">Imported</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">{results.warnings}</p>
            <p className="text-xs text-slate-400 mt-1">Warnings</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{results.errors}</p>
            <p className="text-xs text-slate-400 mt-1">Errors</p>
          </div>
        </div>
      )}

      <button
        onClick={onReset}
        className="px-6 py-2.5 bg-white/5 border border-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
      >
        <span className="material-symbols-outlined text-base align-middle mr-1">restart_alt</span>
        Onboard Another Program
      </button>
    </div>
  );
}

export default function AdminOnboardPage() {
  const wizard = useOnboardWizard();

  const handleStep1Next = async () => {
    await wizard.createSchool();
    wizard.nextStep();
  };

  const handleUpload = async (file: File) => {
    await wizard.uploadFile(file);
  };

  const handleImport = async () => {
    wizard.nextStep(); // Go to step 5 (progress)
    await wizard.runImport(); // This auto-advances to step 6
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Onboard HS Program</h1>
          <p className="text-slate-400">6-step wizard to onboard a new high school program</p>
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
              />
            )}
            {wizard.currentStep === 3 && wizard.parsedData && (
              <StepMapper
                headers={wizard.parsedData.headers}
                mapping={wizard.columnMapping}
                onMappingChange={wizard.setColumnMapping}
                onNext={wizard.nextStep}
                onBack={wizard.prevStep}
              />
            )}
            {wizard.currentStep === 4 && wizard.parsedData && (
              <StepReview
                rows={wizard.parsedData.rows}
                mapping={wizard.columnMapping}
                onNext={handleImport}
                onBack={wizard.prevStep}
                isProcessing={wizard.isProcessing}
              />
            )}
            {wizard.currentStep === 5 && (
              <StepImport isProcessing={wizard.isProcessing} />
            )}
            {wizard.currentStep === 6 && (
              <StepComplete
                results={wizard.importResults}
                schoolName={wizard.schoolData.name}
                onReset={wizard.reset}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
