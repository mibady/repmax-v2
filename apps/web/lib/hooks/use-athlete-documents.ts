"use client";

import { useCallback, useState, useEffect } from "react";

export interface AthleteDocument {
  id: string;
  name: string;
  type: "pdf" | "image" | "doc";
  size: string;
  uploadDate: string;
  verified: boolean;
  url?: string;
}

interface UseAthleteDocumentsReturn {
  documents: AthleteDocument[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  uploadDocument: (file: File) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
}

// Mock data - will be replaced with real API when documents table is created
const mockDocuments: AthleteDocument[] = [
  {
    id: "1",
    name: "Official Transcript.pdf",
    type: "pdf",
    size: "2.4 MB",
    uploadDate: "Oct 12, 2023",
    verified: true,
  },
  {
    id: "2",
    name: "Coach Recommendation.pdf",
    type: "doc",
    size: "1.1 MB",
    uploadDate: "Nov 04, 2023",
    verified: false,
  },
  {
    id: "3",
    name: "SAT Score Report.png",
    type: "image",
    size: "850 KB",
    uploadDate: "Dec 15, 2023",
    verified: false,
  },
  {
    id: "4",
    name: "Hudl Highlight Reel Link.pdf",
    type: "pdf",
    size: "45 KB",
    uploadDate: "Jan 10, 2024",
    verified: true,
  },
];

export function useAthleteDocuments(): UseAthleteDocumentsReturn {
  const [documents, setDocuments] = useState<AthleteDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // When a documents API is created, replace this with:
      // const res = await fetch("/api/athlete/documents");
      // const data = await res.json();
      // setDocuments(data.documents);

      // For now, use mock data with a simulated delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      setDocuments(mockDocuments);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch documents"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const uploadDocument = useCallback(async (file: File) => {
    // Placeholder for actual upload logic
    // When storage is set up:
    // 1. Upload file to Supabase storage
    // 2. Create document record in database
    // 3. Refetch documents

    const newDoc: AthleteDocument = {
      id: Date.now().toString(),
      name: file.name,
      type: file.type.includes("pdf")
        ? "pdf"
        : file.type.includes("image")
          ? "image"
          : "doc",
      size: `${(file.size / 1024).toFixed(0)} KB`,
      uploadDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      verified: false,
    };

    setDocuments((prev) => [newDoc, ...prev]);
  }, []);

  const deleteDocument = useCallback(async (id: string) => {
    // Placeholder for actual delete logic
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  }, []);

  return {
    documents,
    isLoading,
    error,
    refetch: fetchDocuments,
    uploadDocument,
    deleteDocument,
  };
}
