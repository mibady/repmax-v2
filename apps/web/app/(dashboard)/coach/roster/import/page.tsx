'use client';

import Link from 'next/link';
import { useState, useRef, useCallback } from 'react';

interface ImportError {
  row: number;
  name: string;
  email: string;
  error: string;
}

interface ImportResult {
  total: number;
  created: number;
  linked: number;
  errors: ImportError[];
}

interface ParsedRow {
  name: string;
  email: string;
  position: string;
  classYear: string;
}

function parseCSVPreview(text: string): { headers: string[]; rows: ParsedRow[] } {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return { headers: [], rows: [] };

  const headerLine = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
  const header = headerLine.map((h) => h.toLowerCase());

  const nameIdx = header.findIndex((h) => ['name', 'full_name', 'fullname', 'athlete'].includes(h));
  const emailIdx = header.findIndex((h) => ['email', 'email_address', 'emailaddress'].includes(h));
  const posIdx = header.findIndex((h) => ['position', 'pos', 'primary_position'].includes(h));
  const classIdx = header.findIndex((h) => ['class_year', 'classyear', 'class', 'year', 'grad_year', 'graduation'].includes(h));

  const rows: ParsedRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
    rows.push({
      name: nameIdx >= 0 ? cells[nameIdx] || '' : '',
      email: emailIdx >= 0 ? cells[emailIdx] || '' : '',
      position: posIdx >= 0 ? cells[posIdx] || 'ATH' : 'ATH',
      classYear: classIdx >= 0 ? cells[classIdx] || '' : '',
    });
  }

  return { headers: headerLine, rows };
}

export default function CoachRosterImportPage(): React.JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{ headers: string[]; rows: ParsedRow[] } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setResult(null);
    setError(null);

    const text = await f.text();
    const parsed = parseCSVPreview(text);

    if (parsed.rows.length === 0) {
      setError('CSV must have a header row and at least one data row');
      setPreview(null);
      return;
    }

    if (parsed.rows.length > 100) {
      setError('Maximum 100 rows per upload');
      setPreview(null);
      return;
    }

    setPreview(parsed);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files[0];
      if (f && (f.type === 'text/csv' || f.name.endsWith('.csv'))) {
        handleFile(f);
      } else {
        setError('Please upload a CSV file');
      }
    },
    [handleFile]
  );

  const handleImport = async (): Promise<void> => {
    if (!file) return;
    setIsImporting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/coach/roster/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Import failed');
      }

      setResult(data);
      setPreview(null);
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = (): void => {
    const csv = 'Name,Email,Position,Class Year\nJohn Smith,john@example.com,QB,2026\nJane Doe,jane@example.com,WR,2027\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'roster-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/coach/roster"
            className="flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-4 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Roster
          </Link>
          <h1 className="text-2xl font-bold text-white mb-1">Import Roster</h1>
          <p className="text-slate-400">Upload a CSV to add multiple athletes at once</p>
        </div>

        {/* Template Download */}
        <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[24px]">description</span>
            <div>
              <p className="text-sm text-white font-medium">CSV Template</p>
              <p className="text-xs text-slate-400">Download template with required columns: Name, Email, Position, Class Year</p>
            </div>
          </div>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-1.5 bg-[#2A2A2E] text-white text-sm font-medium px-3 py-2 rounded-lg border border-white/10 hover:bg-[#333] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Download
          </button>
        </div>

        {/* Import Result */}
        {result && (
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Import Complete</h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-[#2A2A2E] rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-white">{result.total}</p>
                <p className="text-xs text-slate-400">Total Rows</p>
              </div>
              <div className="bg-green-500/10 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-400">{result.created}</p>
                <p className="text-xs text-green-400/70">Created</p>
              </div>
              <div className="bg-blue-500/10 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-400">{result.linked}</p>
                <p className="text-xs text-blue-400/70">Linked</p>
              </div>
            </div>
            {result.errors.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-red-400 mb-2">
                  {result.errors.length} Error{result.errors.length !== 1 ? 's' : ''}
                </h3>
                <div className="bg-red-500/5 border border-red-500/10 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-red-500/10">
                        <th className="px-3 py-2 text-left text-xs text-red-400/70">Row</th>
                        <th className="px-3 py-2 text-left text-xs text-red-400/70">Name</th>
                        <th className="px-3 py-2 text-left text-xs text-red-400/70">Email</th>
                        <th className="px-3 py-2 text-left text-xs text-red-400/70">Error</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-red-500/10">
                      {result.errors.map((err, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2 text-slate-400">{err.row}</td>
                          <td className="px-3 py-2 text-slate-300">{err.name || '-'}</td>
                          <td className="px-3 py-2 text-slate-300">{err.email || '-'}</td>
                          <td className="px-3 py-2 text-red-400">{err.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <button
              onClick={() => {
                setResult(null);
                setFile(null);
              }}
              className="mt-4 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Import another file
            </button>
          </div>
        )}

        {/* Upload Zone */}
        {!result && (
          <>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`bg-[#1F1F22] rounded-xl border-2 border-dashed p-12 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <span className="material-symbols-outlined text-slate-500 text-5xl mb-3">
                {file ? 'task' : 'cloud_upload'}
              </span>
              {file ? (
                <>
                  <p className="text-white font-medium mb-1">{file.name}</p>
                  <p className="text-slate-400 text-sm">
                    {preview ? `${preview.rows.length} athletes found` : 'Processing...'}
                  </p>
                  <p className="text-slate-500 text-xs mt-2">Click or drop to replace</p>
                </>
              ) : (
                <>
                  <p className="text-white font-medium mb-1">Drop your CSV file here</p>
                  <p className="text-slate-400 text-sm">or click to browse</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </div>
            )}

            {/* Preview Table */}
            {preview && preview.rows.length > 0 && (
              <div className="mt-6 bg-[#1F1F22] rounded-xl border border-white/5 overflow-hidden">
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-white">
                    Preview ({preview.rows.length} athlete{preview.rows.length !== 1 ? 's' : ''})
                  </h2>
                  <button
                    onClick={handleImport}
                    disabled={isImporting}
                    className="flex items-center gap-2 bg-primary text-black font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isImporting ? (
                      <>
                        <div className="size-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">upload</span>
                        Import {preview.rows.length} Athletes
                      </>
                    )}
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">#</th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Position</th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Class</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {preview.rows.slice(0, 20).map((row, i) => (
                        <tr key={i} className="hover:bg-white/5">
                          <td className="px-4 py-2 text-slate-500">{i + 1}</td>
                          <td className="px-4 py-2 text-white">{row.name || <span className="text-red-400">Missing</span>}</td>
                          <td className="px-4 py-2 text-slate-300">{row.email || <span className="text-red-400">Missing</span>}</td>
                          <td className="px-4 py-2 text-slate-300">{row.position}</td>
                          <td className="px-4 py-2 text-slate-300">{row.classYear || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {preview.rows.length > 20 && (
                    <div className="px-4 py-2 text-xs text-slate-500 border-t border-white/5">
                      Showing 20 of {preview.rows.length} rows
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
