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

export function useAthleteDocuments(): UseAthleteDocumentsReturn {
  const [documents, setDocuments] = useState<AthleteDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/athlete/documents");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch documents");
      }
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch documents";
      console.error("Error fetching documents:", err);
      setError(err instanceof Error ? err : new Error(message));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const uploadDocument = useCallback(async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/athlete/documents", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to upload document");
      }

      await fetchDocuments();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to upload document";
      console.error("Error uploading document:", err);
      setError(err instanceof Error ? err : new Error(message));
    }
  }, [fetchDocuments]);

  const deleteDocument = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/athlete/documents?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete document");
      }

      await fetchDocuments();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete document";
      console.error("Error deleting document:", err);
      setError(err instanceof Error ? err : new Error(message));
    }
  }, [fetchDocuments]);

  return {
    documents,
    isLoading,
    error,
    refetch: fetchDocuments,
    uploadDocument,
    deleteDocument,
  };
}
