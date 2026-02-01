"use client";

import { useState, useCallback } from "react";

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  url: string | null;
}

interface UseImageUploadOptions {
  type?: "profile" | "action" | "highlight";
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const { type = "profile", onSuccess, onError } = options;

  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    url: null,
  });

  const upload = useCallback(
    async (file: File) => {
      setState({
        isUploading: true,
        progress: 0,
        error: null,
        url: null,
      });

      try {
        // Validate file on client side first
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          throw new Error("File too large. Maximum size: 5MB");
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!allowedTypes.includes(file.type)) {
          throw new Error("Invalid file type. Allowed: JPEG, PNG, WebP, GIF");
        }

        // Create form data
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);

        // Simulate progress (since fetch doesn't support progress natively)
        const progressInterval = setInterval(() => {
          setState((prev) => ({
            ...prev,
            progress: Math.min(prev.progress + 10, 90),
          }));
        }, 100);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Upload failed");
        }

        const data = await response.json();

        setState({
          isUploading: false,
          progress: 100,
          error: null,
          url: data.url,
        });

        onSuccess?.(data.url);
        return data.url;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Upload failed";
        setState({
          isUploading: false,
          progress: 0,
          error: errorMessage,
          url: null,
        });
        onError?.(errorMessage);
        throw error;
      }
    },
    [type, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setState({
      isUploading: false,
      progress: 0,
      error: null,
      url: null,
    });
  }, []);

  return {
    ...state,
    upload,
    reset,
  };
}

// Helper hook for drag and drop
export function useDropzone(onDrop: (file: File) => void) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        onDrop(files[0]);
      }
    },
    [onDrop]
  );

  return {
    isDragging,
    dropzoneProps: {
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
}
