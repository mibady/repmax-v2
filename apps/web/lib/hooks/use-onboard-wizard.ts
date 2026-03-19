"use client";

import { useCallback, useState } from "react";

export interface SchoolData {
  name: string;
  city: string;
  state: string;
  conference: string;
  division: string;
  mascot: string;
  head_coach_name: string;
  athletic_director: string;
  program_email: string;
  program_phone: string;
  zip_code: string;
  primary_sport: string;
  state_championships: number;
  d1_signees: number;
  roster_size: number;
  coach_login_email: string;
}

export interface ParsedCSV {
  headers: string[];
  rows: string[][];
  totalRows: number;
  fileName: string;
  fileSize: number;
  previewRows: string[][];
}

export interface ColumnMapping {
  [field: string]: number;
}

export interface ColumnConfidence {
  [headerIndex: number]: "auto" | "review" | "skip";
}

export interface RowValidation {
  status: "ready" | "warning" | "error";
  messages: string[];
}

export interface ImportResults {
  import_id: string;
  imported: number;
  warnings: number;
  errors: number;
  total: number;
  program_id?: string;
  skipped: number;
  flagged: number;
}

export const MAPPABLE_FIELDS = [
  { value: "skip", label: "Skip", required: false },
  { value: "first_name", label: "First Name", required: true },
  { value: "last_name", label: "Last Name", required: true },
  { value: "position", label: "Position", required: true },
  { value: "class_year", label: "Class Year", required: true },
  { value: "height", label: "Height", required: false },
  { value: "weight", label: "Weight", required: false },
  { value: "gpa", label: "GPA", required: false },
  { value: "email", label: "Email", required: false },
  { value: "phone", label: "Phone", required: false },
  { value: "jersey_number", label: "Jersey Number", required: false },
  { value: "guardian_email", label: "Guardian Email", required: false },
  { value: "zip_code", label: "ZIP Code", required: false },
  { value: "city", label: "City", required: false },
];

const INITIAL_SCHOOL_DATA: SchoolData = {
  name: "",
  city: "",
  state: "",
  conference: "",
  division: "",
  mascot: "",
  head_coach_name: "",
  athletic_director: "",
  program_email: "",
  program_phone: "",
  zip_code: "",
  primary_sport: "Football",
  state_championships: 0,
  d1_signees: 0,
  roster_size: 0,
  coach_login_email: "",
};

const FIELD_ALIASES: Record<string, string[]> = {
  first_name: ["first_name", "firstname", "first name", "fname", "first"],
  last_name: ["last_name", "lastname", "last name", "lname", "last"],
  position: ["position", "pos"],
  class_year: [
    "class_year",
    "class",
    "year",
    "grad_year",
    "graduation",
    "grad year",
    "class year",
  ],
  height: ["height", "ht"],
  weight: ["weight", "wt"],
  gpa: ["gpa", "grade_point"],
  email: ["email", "e-mail", "athlete email"],
  phone: ["phone", "telephone", "cell", "mobile"],
  jersey_number: ["jersey", "jersey_number", "number", "no", "#"],
  guardian_email: [
    "guardian_email",
    "parent_email",
    "guardian email",
    "parent email",
  ],
  zip_code: ["zip", "zip_code", "zipcode", "zip code", "postal"],
  city: ["city", "hometown"],
};

export function validateRows(
  rows: string[][],
  mapping: ColumnMapping
): RowValidation[] {
  const currentYear = new Date().getFullYear();
  return rows.map((row) => {
    const messages: string[] = [];
    let status: RowValidation["status"] = "ready";

    // Check required fields
    const fnIdx = mapping.first_name;
    const lnIdx = mapping.last_name;
    const posIdx = mapping.position;
    const yearIdx = mapping.class_year;

    if (fnIdx === undefined || !row[fnIdx]?.trim()) {
      messages.push("NO FIRST NAME");
      status = "error";
    }
    if (lnIdx === undefined || !row[lnIdx]?.trim()) {
      messages.push("NO LAST NAME");
      status = "error";
    }

    // Warnings for important but optional fields
    if (posIdx === undefined || !row[posIdx]?.trim()) {
      messages.push("MISSING POS");
      if (status !== "error") status = "warning";
    }
    if (
      mapping.height !== undefined &&
      mapping.height !== null &&
      !row[mapping.height]?.trim()
    ) {
      messages.push("NO HEIGHT");
      if (status !== "error") status = "warning";
    }
    if (
      mapping.weight !== undefined &&
      mapping.weight !== null &&
      !row[mapping.weight]?.trim()
    ) {
      messages.push("NO WEIGHT");
      if (status !== "error") status = "warning";
    }

    // Graduated check
    if (yearIdx !== undefined && row[yearIdx]?.trim()) {
      const classYear = parseInt(row[yearIdx].trim(), 10);
      if (!isNaN(classYear) && classYear < currentYear) {
        messages.push("GRADUATED");
        if (status !== "error") status = "warning";
      }
    }

    if (messages.length === 0) {
      messages.push("READY");
    }

    return { status, messages };
  });
}

export function useOnboardWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [schoolData, setSchoolData] = useState<SchoolData>(INITIAL_SCHOOL_DATA);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [programId, setProgramId] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedCSV | null>(null);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [columnConfidence, setColumnConfidence] = useState<ColumnConfidence>(
    {}
  );
  const [importResults, setImportResults] = useState<ImportResults | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [excludedRows, setExcludedRows] = useState<Set<number>>(new Set());

  const createSchool = useCallback(async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schoolData),
      });
      if (!res.ok) throw new Error("Failed to create school");
      const data = await res.json();
      setSchoolId(data.school_id);
      setProgramId(data.program_id || null);
      return data.school_id;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to create school")
      );
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [schoolData]);

  const uploadFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/onboard/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to parse file");
      const data: ParsedCSV = await res.json();
      setParsedData(data);

      // Auto-detect column mapping with confidence
      const autoMapping: ColumnMapping = {};
      const confidence: ColumnConfidence = {};

      data.headers.forEach((header, idx) => {
        const lower = header.toLowerCase().trim();
        let matched = false;
        for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
          if (aliases.includes(lower)) {
            autoMapping[field] = idx;
            confidence[idx] = "auto";
            matched = true;
            break;
          }
        }
        if (!matched) {
          // Fuzzy match — check partial containment
          for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
            if (
              aliases.some(
                (a) => lower.includes(a) || a.includes(lower)
              ) &&
              !(field in autoMapping)
            ) {
              autoMapping[field] = idx;
              confidence[idx] = "review";
              matched = true;
              break;
            }
          }
          if (!matched) {
            confidence[idx] = "skip";
          }
        }
      });

      setColumnMapping(autoMapping);
      setColumnConfidence(confidence);
      setExcludedRows(new Set());
      return data;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to upload file")
      );
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const enterManualMode = useCallback(() => {
    const headers = MAPPABLE_FIELDS.filter((f) => f.value !== "skip").map(
      (f) => f.label
    );
    const identityMapping: ColumnMapping = {};
    const confidence: ColumnConfidence = {};
    MAPPABLE_FIELDS.filter((f) => f.value !== "skip").forEach((f, idx) => {
      identityMapping[f.value] = idx;
      confidence[idx] = "auto";
    });
    // Start with 5 empty rows
    const emptyRows = Array.from({ length: 5 }, () =>
      Array(headers.length).fill("")
    );
    setParsedData({
      headers,
      rows: emptyRows,
      totalRows: 5,
      fileName: "manual-entry",
      fileSize: 0,
      previewRows: [],
    });
    setColumnMapping(identityMapping);
    setColumnConfidence(confidence);
    setExcludedRows(new Set());
  }, []);

  const updateRowCell = useCallback(
    (rowIdx: number, colIdx: number, value: string) => {
      setParsedData((prev) => {
        if (!prev) return prev;
        const newRows = prev.rows.map((row, rIdx) =>
          rIdx === rowIdx
            ? row.map((cell, cIdx) => (cIdx === colIdx ? value : cell))
            : row
        );
        return { ...prev, rows: newRows, totalRows: newRows.length };
      });
    },
    []
  );

  const addEmptyRow = useCallback(() => {
    setParsedData((prev) => {
      if (!prev) return prev;
      const newRow = Array(prev.headers.length).fill("");
      const newRows = [...prev.rows, newRow];
      return { ...prev, rows: newRows, totalRows: newRows.length };
    });
  }, []);

  const removeFile = useCallback(() => {
    setParsedData(null);
    setColumnMapping({});
    setColumnConfidence({});
    setExcludedRows(new Set());
  }, []);

  const toggleExcludeRow = useCallback((rowIdx: number) => {
    setExcludedRows((prev) => {
      const next = new Set(prev);
      if (next.has(rowIdx)) {
        next.delete(rowIdx);
      } else {
        next.add(rowIdx);
      }
      return next;
    });
  }, []);

  const excludeGraduated = useCallback(() => {
    if (!parsedData) return;
    const currentYear = new Date().getFullYear();
    const yearIdx = columnMapping.class_year;
    if (yearIdx === undefined) return;
    const newExcluded = new Set(excludedRows);
    parsedData.rows.forEach((row, idx) => {
      const val = parseInt(row[yearIdx]?.trim(), 10);
      if (!isNaN(val) && val < currentYear) {
        newExcluded.add(idx);
      }
    });
    setExcludedRows(newExcluded);
  }, [parsedData, columnMapping, excludedRows]);

  const runImport = useCallback(async () => {
    if (!schoolId || !parsedData) return;
    setIsProcessing(true);
    setError(null);
    try {
      // Filter out excluded rows
      const activeRows = parsedData.rows.filter(
        (_, idx) => !excludedRows.has(idx)
      );
      const res = await fetch("/api/admin/onboard/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          school_id: schoolId,
          rows: activeRows,
          column_mapping: columnMapping,
          file_name: parsedData.fileName,
        }),
      });
      if (!res.ok) throw new Error("Failed to import roster");
      const data: ImportResults = await res.json();
      data.skipped = data.skipped ?? excludedRows.size;
      setImportResults(data);
      setCurrentStep(6);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to import"));
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [schoolId, parsedData, columnMapping, excludedRows]);

  const nextStep = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, 6));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 1));
  }, []);

  const reset = useCallback(() => {
    setCurrentStep(1);
    setSchoolData(INITIAL_SCHOOL_DATA);
    setSchoolId(null);
    setProgramId(null);
    setParsedData(null);
    setColumnMapping({});
    setColumnConfidence({});
    setImportResults(null);
    setExcludedRows(new Set());
    setError(null);
  }, []);

  return {
    currentStep,
    schoolData,
    schoolId,
    programId,
    parsedData,
    columnMapping,
    columnConfidence,
    importResults,
    isProcessing,
    error,
    excludedRows,
    setSchoolData,
    setColumnMapping,
    createSchool,
    uploadFile,
    removeFile,
    enterManualMode,
    updateRowCell,
    addEmptyRow,
    runImport,
    toggleExcludeRow,
    excludeGraduated,
    nextStep,
    prevStep,
    reset,
  };
}
