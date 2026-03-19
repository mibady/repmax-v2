"use client";

import { useCallback, useState } from "react";

export interface SchoolData {
  name: string;
  city: string;
  state: string;
  conference: string;
  division: string;
}

export interface ParsedCSV {
  headers: string[];
  rows: string[][];
  totalRows: number;
  fileName: string;
}

export interface ColumnMapping {
  [field: string]: number;
}

export interface ImportResults {
  import_id: string;
  imported: number;
  warnings: number;
  errors: number;
  total: number;
}

const INITIAL_SCHOOL_DATA: SchoolData = {
  name: "",
  city: "",
  state: "",
  conference: "",
  division: "",
};

export function useOnboardWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [schoolData, setSchoolData] = useState<SchoolData>(INITIAL_SCHOOL_DATA);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedCSV | null>(null);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [importResults, setImportResults] = useState<ImportResults | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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
      return data.school_id;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to create school"));
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
      if (!res.ok) throw new Error("Failed to parse CSV");
      const data: ParsedCSV = await res.json();
      setParsedData(data);

      // Auto-detect column mapping
      const autoMapping: ColumnMapping = {};
      const fieldMap: Record<string, string[]> = {
        first_name: ["first_name", "firstname", "first name", "fname"],
        last_name: ["last_name", "lastname", "last name", "lname"],
        position: ["position", "pos"],
        class_year: ["class_year", "class", "year", "grad_year", "graduation"],
        height: ["height", "ht"],
        weight: ["weight", "wt"],
        gpa: ["gpa", "grade_point"],
        email: ["email", "e-mail"],
        phone: ["phone", "telephone", "cell"],
      };

      data.headers.forEach((header, idx) => {
        const lower = header.toLowerCase().trim();
        for (const [field, aliases] of Object.entries(fieldMap)) {
          if (aliases.includes(lower)) {
            autoMapping[field] = idx;
            break;
          }
        }
      });

      setColumnMapping(autoMapping);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to upload file"));
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const runImport = useCallback(async () => {
    if (!schoolId || !parsedData) return;
    setIsProcessing(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/onboard/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          school_id: schoolId,
          rows: parsedData.rows,
          column_mapping: columnMapping,
          file_name: parsedData.fileName,
        }),
      });
      if (!res.ok) throw new Error("Failed to import roster");
      const data: ImportResults = await res.json();
      setImportResults(data);
      setCurrentStep(6);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to import"));
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [schoolId, parsedData, columnMapping]);

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
    setParsedData(null);
    setColumnMapping({});
    setImportResults(null);
    setError(null);
  }, []);

  return {
    currentStep,
    schoolData,
    schoolId,
    parsedData,
    columnMapping,
    importResults,
    isProcessing,
    error,
    setSchoolData,
    setColumnMapping,
    createSchool,
    uploadFile,
    runImport,
    nextStep,
    prevStep,
    reset,
  };
}
