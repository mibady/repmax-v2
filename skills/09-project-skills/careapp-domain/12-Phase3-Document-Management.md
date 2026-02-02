# File Management & Documents PRP - Caregiving Companion

## Goal

Build comprehensive file management system for secure document storage, organization, sharing, and AI-powered document analysis for health records, legal documents, and financial papers.

## Why

- Centralize all caregiving documents in one secure location
- Enable quick document retrieval during emergencies or appointments
- Support document sharing with healthcare providers and family
- Provide AI-powered document analysis and summarization
- Ensure HIPAA-compliant storage and access controls

## What (User-Visible Behavior)

- **Secure Upload**: Drag-and-drop file upload with encryption
- **Smart Organization**: AI-powered categorization and tagging
- **Document Search**: Full-text search across all documents
- **Sharing Controls**: Role-based access and temporary sharing links
- **AI Analysis**: Document summarization and key information extraction

## All Needed Context

### Documentation References

- Supabase Storage: https://supabase.com/docs/guides/storage
- React Dropzone: https://react-dropzone.js.org/
- PDF.js: https://mozilla.github.io/pdf.js/
- Tesseract.js: https://tesseract.projectnaptha.com/
- Mammoth.js: https://github.com/mwilliamson/mammoth.js

### Package Dependencies

```json
{
  "dependencies": {
    "react-dropzone": "^14.2.9",
    "react-pdf": "^7.7.1",
    "pdfjs-dist": "^3.11.174",
    "tesseract.js": "^5.1.0",
    "mammoth": "^1.7.2",
    "file-type": "^19.0.0",
    "sharp": "^0.33.4",
    "react-virtualized": "^9.22.5",
    "@upstash/redis": "^1.34.3",
    "@sentry/nextjs": "^8.0.0",
    "@vercel/analytics": "^1.2.1",
    "ai": "^3.4.33",
    "@anthropic-ai/sdk": "^0.19.0",
    "react-hotkeys-hook": "^4.5.0"
  }
}
```

### Tech Stack Alignment

- **Frontend**: Next.js 15 + React + TypeScript + Tailwind CSS + shadcn/ui
- **Storage**: Supabase Storage with RLS policies
- **Caching**: Redis Cloud for document metadata and previews
- **Database**: Supabase (existing schema table: documents)
- **Auth**: Clerk (existing organization-based permissions)
- **AI**: Claude 3 Opus for advanced document analysis and summarization
- **Search**: Redis Search for fast document retrieval
- **OCR**: Tesseract.js + Claude Vision for enhanced text extraction
- **Monitoring**: Sentry for error tracking
- **Analytics**: Vercel Analytics for usage metrics

### Critical Implementation Notes

- **Security**:
  - Scan all file uploads for malware using AWS Lambda + ClamAV
  - Implement client-side and server-side file type validation
  - Encrypt all files at rest using AES-256
  - Enforce strict CORS policies
  - Rate limit API endpoints

- **Performance**:
  - Cache document metadata and previews in Redis Cloud
  - Implement progressive loading for large documents
  - Use Redis Streams for background processing
  - Compress images and optimize PDFs before storage
  - Implement client-side caching with service workers

- **AI Integration**:
  - Use Claude 3 Opus for document analysis and summarization
  - Cache AI analysis results in Redis with appropriate TTL
  - Implement streaming responses for large documents
  - Support batch processing of multiple documents

- **Audit & Compliance**:
  - Maintain detailed audit trail of all document access
  - Log all document operations to Supabase audit table
  - Implement automatic retention policies
  - Support GDPR right to be forgotten
  - Enable document versioning

- **Offline Support**:
  - Cache recently accessed documents locally
  - Queue operations when offline
  - Sync changes when connection is restored
  - Handle conflicts with last-write-wins strategy

## Implementation Blueprint

### 1. File Management Hub Layout (/app/documents/layout.tsx)

```typescript
import { Sidebar } from '@/components/documents/Sidebar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { StorageProvider } from '@/components/documents/StorageProvider';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function DocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="member">
      <StorageProvider>
        <div className="flex h-full">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-gray-50">
            <Suspense fallback={<LoadingSpinner />}>
              {children}
            </Suspense>
          </main>
        </div>
      </StorageProvider>
    </ProtectedRoute>
  );
}
```

### 2. Documents Overview Page (/app/documents/page.tsx)

```typescript
'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Search, Filter, Grid, List, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileUploader } from '@/components/documents/FileUploader';
import { DocumentGrid } from '@/components/documents/DocumentGrid';
import { DocumentList } from '@/components/documents/DocumentList';
import { DocumentViewer } from '@/components/documents/DocumentViewer';
import { CreateFolderModal } from '@/components/documents/CreateFolderModal';
import { DocumentFilters } from '@/components/documents/DocumentFilters';
import { VoiceCommands } from '@/components/documents/VoiceCommands';
import { fetchDocuments, createFolder } from '@/lib/api/documents';
import { useDropzone } from 'react-dropzone';
import Fuse from 'fuse.js';

export default function DocumentsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploader, setShowUploader] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [currentFolder, setCurrentFolder] = useState('/');
  const [filters, setFilters] = useState({
    category: 'all',
    type: 'all',
    dateRange: 'all',
    size: 'all',
  });

  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents', currentFolder, filters],
    queryFn: () => fetchDocuments({ folder: currentFolder, filters }),
  });

  const createFolderMutation = useMutation({
    mutationFn: createFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setShowCreateFolder(false);
    },
  });

  // Setup Fuse.js for client-side search
  const fuse = new Fuse(documents || [], {
    keys: ['title', 'description', 'content', 'tags'],
    threshold: 0.3,
  });

  const filteredDocuments = searchQuery
    ? fuse.search(searchQuery).map(result => result.item)
    : documents || [];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setShowUploader(true);
    // Handle file uploads
  }, []);

  const { getRootProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
  });

  const handleVoiceCommand = async (command: string) => {
    if (command.includes('upload') || command.includes('add')) {
      setShowUploader(true);
    } else if (command.includes('search')) {
      const searchTerm = extractSearchTerm(command);
      if (searchTerm) {
        setSearchQuery(searchTerm);
      }
    } else if (command.includes('folder') || command.includes('create')) {
      setShowCreateFolder(true);
    } else if (command.includes('grid') || command.includes('list')) {
      setViewMode(command.includes('grid') ? 'grid' : 'list');
    }
  };

  const stats = {
    total: documents?.length || 0,
    health: documents?.filter(d => d.category === 'health').length || 0,
    financial: documents?.filter(d => d.category === 'financial').length || 0,
    legal: documents?.filter(d => d.category === 'legal').length || 0,
    size: documents?.reduce((sum, d) => sum + (d.file_size || 0), 0) || 0,
  };

  return (
    <div {...getRootProps()} className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Manage and organize care-related documents</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowCreateFolder(true)}
            className="flex items-center gap-2"
          >
            <FolderPlus className="w-4 h-4" />
            New Folder
          </Button>
          <Button
            onClick={() => setShowUploader(true)}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Files
          </Button>
        </div>
      </div>

      {/* Voice Commands */}
      <VoiceCommands
        commands={[
          'Upload documents',
          'Search for [document name]',
          'Create new folder',
          'Switch to grid view',
        ]}
        onCommand={handleVoiceCommand}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm font-medium text-gray-600">Total Documents</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm font-medium text-gray-600">Health Records</p>
          <p className="text-2xl font-bold text-blue-600">{stats.health}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm font-medium text-gray-600">Financial</p>
          <p className="text-2xl font-bold text-green-600">{stats.financial}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm font-medium text-gray-600">Legal</p>
          <p className="text-2xl font-bold text-purple-600">{stats.legal}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm font-medium text-gray-600">Storage Used</p>
          <p className="text-2xl font-bold text-orange-600">
            {formatFileSize(stats.size)}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-1 border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${
                viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${
                viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Filters */}
          <DocumentFilters
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>
      </div>

      {/* Drag and Drop Overlay */}
      {isDragActive && (
        <div className="fixed inset-0 bg-blue-500 bg-opacity-20 border-4 border-blue-500 border-dashed z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 shadow-lg text-center">
            <Upload className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900">Drop files here</h3>
            <p className="text-gray-600">Files will be uploaded and organized automatically</p>
          </div>
        </div>
      )}

      {/* Documents Display */}
      <div className="bg-white rounded-lg shadow-md">
        {isLoading ? (
          <div className="p-8 text-center">
            <LoadingSpinner />
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchQuery ? 'No documents match your search' : 'No documents uploaded yet'}
          </div>
        ) : viewMode === 'grid' ? (
          <DocumentGrid
            documents={filteredDocuments}
            onDocumentClick={setSelectedDocument}
            currentFolder={currentFolder}
            onFolderChange={setCurrentFolder}
          />
        ) : (
          <DocumentList
            documents={filteredDocuments}
            onDocumentClick={setSelectedDocument}
            currentFolder={currentFolder}
            onFolderChange={setCurrentFolder}
          />
        )}
      </div>

      {/* Modals */}
      {showUploader && (
        <FileUploader
          onClose={() => setShowUploader(false)}
          currentFolder={currentFolder}
        />
      )}

      {showCreateFolder && (
        <CreateFolderModal
          onClose={() => setShowCreateFolder(false)}
          onSubmit={createFolderMutation.mutate}
          currentFolder={currentFolder}
          isLoading={createFolderMutation.isPending}
        />
      )}

      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </div>
  );
}
```

### 3. File Uploader Component (/components/documents/FileUploader.tsx)

```typescript
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, X, FileText, Image, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { uploadFile, analyzeDocument } from '@/lib/api/documents';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface FileWithMetadata extends File {
  id: string;
  category?: string;
  description?: string;
  tags?: string[];
  uploadProgress?: number;
  status?: 'pending' | 'uploading' | 'analyzing' | 'complete' | 'error';
  error?: string;
  analysis?: any;
}

interface FileUploaderProps {
  onClose: () => void;
  currentFolder: string;
}

export function FileUploader({ onClose, currentFolder }: FileUploaderProps) {
  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: uploadFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    const newFiles: FileWithMetadata[] = acceptedFiles.map(file => ({
      ...file,
      id: Math.random().toString(36).substr(2, 9),
      category: detectCategory(file),
      status: 'pending',
      uploadProgress: 0,
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Show rejection errors
    rejectedFiles.forEach(({ file, errors }) => {
      console.error(`File ${file.name} rejected:`, errors);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB limit
  });

  const detectCategory = (file: File): string => {
    const name = file.name.toLowerCase();
    if (name.includes('medical') || name.includes('health') || name.includes('prescription')) {
      return 'health';
    } else if (name.includes('bill') || name.includes('invoice') || name.includes('financial')) {
      return 'financial';
    } else if (name.includes('legal') || name.includes('will') || name.includes('contract')) {
      return 'legal';
    }
    return 'general';
  };

  const updateFileMetadata = (fileId: string, updates: Partial<FileWithMetadata>) => {
    setFiles(prev => prev.map(file =>
      file.id === fileId ? { ...file, ...updates } : file
    ));
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const uploadFiles = async () => {
    setIsUploading(true);

    for (const file of files) {
      if (file.status !== 'pending') continue;

      try {
        updateFileMetadata(file.id, { status: 'uploading' });

        // Upload file with progress tracking
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', file.category || 'general');
        formData.append('description', file.description || '');
        formData.append('tags', JSON.stringify(file.tags || []));
        formData.append('folder', currentFolder);

        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const result = await response.json();
        updateFileMetadata(file.id, {
          status: 'analyzing',
          uploadProgress: 100,
        });

        // Analyze document with AI
        if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
          try {
            const analysis = await analyzeDocument(result.documentId);
            updateFileMetadata(file.id, {
              status: 'complete',
              analysis,
            });
          } catch (error) {
            console.error('Document analysis failed:', error);
            updateFileMetadata(file.id, { status: 'complete' });
          }
        } else {
          updateFileMetadata(file.id, { status: 'complete' });
        }

      } catch (error) {
        console.error('Upload error:', error);
        updateFileMetadata(file.id, {
          status: 'error',
          error: error.message,
        });
      }
    }

    setIsUploading(false);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-8 h-8 text-blue-500" />;
    }
    return <FileText className="w-8 h-8 text-gray-500" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const canUpload = files.length > 0 && files.every(f => f.category && f.status === 'pending');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Upload Documents</h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Drop Zone */}
          {files.length === 0 && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Drop files here or click to browse
              </h3>
              <p className="text-gray-600">
                Support for PDF, images, Word documents, and text files up to 50MB
              </p>
            </div>
          )}

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-4">
              {files.map((file) => (
                <div key={file.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    {/* File Icon */}
                    <div className="flex-shrink-0">
                      {getFileIcon(file)}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </h4>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(file.status)}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                            disabled={file.status === 'uploading'}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="text-sm text-gray-500 mb-3">
                        {formatFileSize(file.size)} • {file.type}
                      </div>

                      {/* Progress Bar */}
                      {file.status === 'uploading' && (
                        <div className="mb-3">
                          <Progress value={file.uploadProgress || 0} className="w-full" />
                        </div>
                      )}

                      {/* Status */}
                      <div className="mb-3">
                        <Badge
                          variant={
                            file.status === 'complete' ? 'default' :
                            file.status === 'error' ? 'destructive' :
                            'secondary'
                          }
                        >
                          {file.status === 'analyzing' ? 'Analyzing with AI...' : file.status}
                        </Badge>
                      </div>

                      {/* Error Message */}
                      {file.error && (
                        <div className="text-sm text-red-600 mb-3">
                          {file.error}
                        </div>
                      )}

                      {/* Metadata Fields */}
                      {file.status === 'pending' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Category
                            </label>
                            <Select
                              value={file.category}
                              onValueChange={(value) =>
                                updateFileMetadata(file.id, { category: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="health">Health Records</SelectItem>
                                <SelectItem value="financial">Financial</SelectItem>
                                <SelectItem value="legal">Legal Documents</SelectItem>
                                <SelectItem value="insurance">Insurance</SelectItem>
                                <SelectItem value="general">General</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Tags (comma-separated)
                            </label>
                            <Input
                              placeholder="urgent, prescription, etc."
                              onChange={(e) =>
                                updateFileMetadata(file.id, {
                                  tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean),
                                })
                              }
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description (optional)
                            </label>
                            <Textarea
                              placeholder="Brief description of the document..."
                              onChange={(e) =>
                                updateFileMetadata(file.id, { description: e.target.value })
                              }
                            />
                          </div>
                        </div>
                      )}

                      {/* AI Analysis Results */}
                      {file.analysis && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <h5 className="text-sm font-medium text-blue-900 mb-2">
                            AI Analysis Results
                          </h5>
                          <div className="text-sm text-blue-800">
                            {file.analysis.summary && (
                              <p className="mb-2">{file.analysis.summary}</p>
                            )}
                            {file.analysis.extractedData && (
                              <div className="space-y-1">
                                {Object.entries(file.analysis.extractedData).map(([key, value]) => (
                                  <div key={key} className="flex gap-2">
                                    <span className="font-medium">{key}:</span>
                                    <span>{value as string}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Add More Files */}
              <div
                {...getRootProps()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400"
              >
                <input {...getInputProps()} />
                <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Add more files</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {files.length} file{files.length !== 1 ? 's' : ''} selected
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={uploadFiles}
              disabled={!canUpload || isUploading}
              className="flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <LoadingSpinner className="w-4 h-4" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Files
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 4. Document Viewer Component (/components/documents/DocumentViewer.tsx)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useQuery } from '@tanstack/react-query';
import {
  X,
  Download,
  Share2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  FileText,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { fetchDocumentContent, analyzeDocumentWithAI } from '@/lib/api/documents';
import { format } from 'date-fns';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DocumentViewerProps {
  document: any;
  onClose: () => void;
}

export function DocumentViewer({ document, onClose }: DocumentViewerProps) {
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);

  const { data: content } = useQuery({
    queryKey: ['document-content', document.id],
    queryFn: () => fetchDocumentContent(document.id),
  });

  const { data: aiAnalysis, isLoading: isAnalyzing } = useQuery({
    queryKey: ['document-analysis', document.id],
    queryFn: () => analyzeDocumentWithAI(document.id),
    enabled: showAIAnalysis,
  });

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const changePage = (delta: number) => {
    setPageNumber(prev => Math.max(1, Math.min(numPages, prev + delta)));
  };

  const changeScale = (delta: number) => {
    setScale(prev => Math.max(0.5, Math.min(3.0, prev + delta)));
  };

  const downloadDocument = () => {
    const link = document.createElement('a');
    link.href = content?.downloadUrl || document.file_path;
    link.download = document.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareDocument = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          text: document.description,
          url: content?.shareUrl,
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(content?.shareUrl || '');
    }
  };

  const isPDF = document.mime_type === 'application/pdf';
  const isImage = document.mime_type?.startsWith('image/');
  const isText = document.mime_type === 'text/plain';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex">
        {/* Sidebar */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 truncate">
                {document.title}
              </h2>
              <Button variant="ghost" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadDocument}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={shareDocument}
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          </div>

          {/* Document Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Category</label>
                <div className="mt-1">
                  <Badge>{document.category}</Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Upload Date</label>
                <p className="text-sm text-gray-600 mt-1">
                  {format(new Date(document.uploaded_at), 'MMM d, yyyy')}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">File Size</label>
                <p className="text-sm text-gray-600 mt-1">
                  {formatFileSize(document.file_size)}
                </p>
              </div>

              {document.tags && document.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Tags</label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {document.tags.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {document.description && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="text-sm text-gray-600 mt-1">{document.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Analysis */}
          <div className="flex-1 p-4">
            <Button
              variant="outline"
              onClick={() => setShowAIAnalysis(!showAIAnalysis)}
              className="w-full flex items-center gap-2 mb-4"
            >
              <Sparkles className="w-4 h-4" />
              {showAIAnalysis ? 'Hide' : 'Show'} AI Analysis
            </Button>

            {showAIAnalysis && (
              <div className="space-y-4">
                {isAnalyzing ? (
                  <div className="text-center py-4">
                    <LoadingSpinner />
                    <p className="text-sm text-gray-600 mt-2">Analyzing document...</p>
                  </div>
                ) : aiAnalysis ? (
                  <div className="space-y-4">
                    {aiAnalysis.summary && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Summary</h4>
                        <p className="text-sm text-gray-600">{aiAnalysis.summary}</p>
                      </div>
                    )}

                    {aiAnalysis.keyPoints && aiAnalysis.keyPoints.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Key Points</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {aiAnalysis.keyPoints.map((point: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {aiAnalysis.extractedData && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Extracted Information</h4>
                        <div className="space-y-2">
                          {Object.entries(aiAnalysis.extractedData).map(([key, value]) => (
                            <div key={key} className="text-sm">
                              <span className="font-medium text-gray-700">{key}:</span>
                              <span className="text-gray-600 ml-2">{value as string}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No analysis available</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Document Content */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          {isPDF && (
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changePage(-1)}
                  disabled={pageNumber <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  Page {pageNumber} of {numPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changePage(1)}
                  disabled={pageNumber >= numPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changeScale(-0.2)}
                  disabled={scale <= 0.5}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600 min-w-[4rem] text-center">
                  {Math.round(scale * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changeScale(0.2)}
                  disabled={scale >= 3.0}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRotation(prev => (prev + 90) % 360)}
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-4">
            {isPDF && content?.fileUrl && (
              <Document
                file={content.fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<LoadingSpinner />}
                error={
                  <div className="text-center py-8">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Failed to load PDF</p>
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  rotate={rotation}
                  loading={<LoadingSpinner />}
                />
              </Document>
            )}

            {isImage && content?.fileUrl && (
              <img
                src={content.fileUrl}
                alt={document.title}
                className="max-w-full max-h-full object-contain"
                style={{
                  transform: `scale(${scale}) rotate(${rotation}deg)`,
                }}
              />
            )}

            {isText && content?.textContent && (
              <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl w-full">
                <pre className="whitespace-pre-wrap text-sm text-gray-900 font-mono">
                  {content.textContent}
                </pre>
              </div>
            )}

            {!content && (
              <div className="text-center py-8">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Loading document...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 5. Redis Document Cache Service (/lib/redis/document-cache.ts)

```typescript
import { Redis } from "@upstash/redis";
import { Document } from "@/types/documents";

export class DocumentCache {
  private redis: Redis;
  private prefix = "doc:";
  private ttl = 60 * 60 * 24 * 7; // 1 week

  constructor() {
    if (!process.env.REDIS_URL || !process.env.REDIS_TOKEN) {
      throw new Error("Redis configuration is missing");
    }

    this.redis = new Redis({
      url: process.env.REDIS_URL,
      token: process.env.REDIS_TOKEN,
    });
  }

  private getKey(documentId: string): string {
    return `${this.prefix}${documentId}`;
  }

  async getDocument(documentId: string): Promise<Document | null> {
    const key = this.getKey(documentId);
    const cached = await this.redis.get<string>(key);
    return cached ? JSON.parse(cached) : null;
  }

  async setDocument(document: Document): Promise<void> {
    const key = this.getKey(document.id);
    await this.redis.set(key, JSON.stringify(document), { ex: this.ttl });
  }

  async invalidateDocument(documentId: string): Promise<void> {
    const key = this.getKey(documentId);
    await this.redis.del(key);
  }
}

export const documentCache = new DocumentCache();
```

### 6. Claude Document Analysis Service (/lib/ai/document-analyzer.ts)

```typescript
import { Anthropic } from "@anthropic-ai/sdk";
import { Document } from "@/types/documents";

export class DocumentAnalyzer {
  private anthropic: Anthropic;
  private cache: DocumentCache;

  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("Anthropic API key is not configured");
    }

    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.cache = new DocumentCache();
  }

  async analyzeDocument(document: Document): Promise<DocumentAnalysis> {
    // Check cache first
    const cacheKey = `analysis:${document.id}`;
    const cached = await this.cache.getDocument(cacheKey);
    if (cached) {
      return cached as DocumentAnalysis;
    }

    // Process document with Claude
    const response = await this.anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 4000,
      temperature: 0.2,
      system:
        "You are an expert document analyst. Analyze the provided document and extract key information.",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this document and extract key information. Document type: ${document.type}. Document name: ${document.name}`,
            },
            {
              type: "text",
              text: document.content, // Extracted text from OCR/parsing
            },
          ],
        },
      ],
    });

    const analysis = {
      id: document.id,
      summary: response.content[0].text,
      keyPoints: [], // Extract from response
      entities: [], // Extract from response
      createdAt: new Date().toISOString(),
      model: "claude-3-opus-20240229",
    };

    // Cache the analysis
    await this.cache.setDocument(analysis);

    return analysis;
  }
}

export const documentAnalyzer = new DocumentAnalyzer();
```

### 7. Document Upload API Route (/app/api/documents/upload/route.ts)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";
import { NotificationService } from "@/lib/services/NotificationService";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: NextRequest) {
  try {
    const { userId, orgId } = auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const tags = JSON.parse((formData.get("tags") as string) || "[]");
    const folder = (formData.get("folder") as string) || "/";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Verify file type
    const detectedType = await fileTypeFromBuffer(buffer);
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!detectedType || !allowedTypes.includes(detectedType.mime)) {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 },
      );
    }

    // Process image files (optimize and create thumbnails)
    let processedBuffer = buffer;
    let thumbnailBuffer: Buffer | null = null;

    if (detectedType.mime.startsWith("image/")) {
      // Optimize image
      processedBuffer = await sharp(buffer)
        .resize(2048, 2048, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();

      // Create thumbnail
      thumbnailBuffer = await sharp(buffer)
        .resize(300, 300, { fit: "cover" })
        .jpeg({ quality: 80 })
        .toBuffer();
    }

    // Generate unique file name
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}_${sanitizedName}`;
    const filePath = `${orgId}${folder}${fileName}`;

    // Upload main file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, processedBuffer, {
        contentType: detectedType.mime,
        cacheControl: "3600",
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    // Upload thumbnail if created
    let thumbnailPath = null;
    if (thumbnailBuffer) {
      const thumbPath = `${orgId}${folder}thumbnails/${fileName}`;
      const { error: thumbError } = await supabase.storage
        .from("documents")
        .upload(thumbPath, thumbnailBuffer, {
          contentType: "image/jpeg",
          cacheControl: "3600",
        });

      if (!thumbError) {
        thumbnailPath = thumbPath;
      }
    }

    // Extract text content for search (basic implementation)
    let extractedText = "";
    if (detectedType.mime === "text/plain") {
      extractedText = buffer.toString("utf-8");
    }
    // For PDFs and images, you'd use more sophisticated extraction here

    // Save document metadata to database
    const { data: document, error: dbError } = await supabase
      .from("documents")
      .insert({
        organization_id: orgId,
        title: file.name,
        description,
        file_path: uploadData.path,
        thumbnail_path: thumbnailPath,
        file_size: file.size,
        mime_type: detectedType.mime,
        category,
        tags,
        content: extractedText,
        uploaded_by: userId,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      // Clean up uploaded file
      await supabase.storage.from("documents").remove([uploadData.path]);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // Send notification to team members about new document
    const notificationService = NotificationService.getInstance();
    await notificationService.sendNotification({
      userId,
      type: "team",
      title: "New Document Uploaded",
      message: `${file.name} has been uploaded to ${category}`,
      data: {
        documentId: document.id,
        fileName: file.name,
        category,
      },
      urgency: "low",
      channels: ["in_app"],
    });

    return NextResponse.json({
      success: true,
      documentId: document.id,
      message: "File uploaded successfully",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

## Task Checklist

### File Upload System

- [ ] Build drag-and-drop file uploader with progress tracking
- [ ] Implement file type validation and virus scanning
- [ ] Create image optimization and thumbnail generation
- [ ] Set up Supabase Storage with proper bucket policies
- [ ] Add file size limits and compression

### Document Organization

- [ ] Create folder structure and navigation
- [ ] Implement smart categorization with AI
- [ ] Build tagging system with suggestions
- [ ] Add document versioning and history
- [ ] Create bulk operations (move, delete, share)

### Document Viewer

- [ ] Build PDF viewer with zoom and navigation
- [ ] Create image viewer with rotation and zoom
- [ ] Implement text document viewer
- [ ] Add annotation and markup tools
- [ ] Support for Office document preview

### Search & Discovery

- [ ] Implement full-text search across documents
- [ ] Create advanced filtering by metadata
- [ ] Build AI-powered document insights
- [ ] Add smart recommendations
- [ ] Create search history and saved searches

### Security & Sharing

- [ ] Implement role-based access controls
- [ ] Create temporary sharing links with expiration
- [ ] Add download tracking and audit logs
- [ ] Enable document watermarking
- [ ] Set up automated backups

### AI Integration

- [ ] Document analysis with Claude
- [ ] OCR for scanned documents with Tesseract
- [ ] Smart data extraction (dates, amounts, names)
- [ ] Document summarization
- [ ] Content-based categorization

## Validation Loop

### Level 1: File Operations

```bash
npm test -- documents/FileUploader.test.tsx
npm test -- documents/DocumentViewer.test.tsx
npm test -- api/documents/upload.test.ts
```

### Level 2: Integration Testing

```bash
npm run test:file-upload-flow
npm run test:document-search
npm run test:ai-analysis
```

### Level 3: Security Testing

```bash
npm run test:file-validation
npm run test:access-controls
npm run test:virus-scanning
```

### Level 4: Performance Testing

```bash
npm run test:large-file-uploads
npm run test:document-rendering
npm run test:search-performance
```

## Success Criteria

- [ ] File uploads complete in < 30 seconds for 50MB files
- [ ] Document viewer loads PDFs in < 3 seconds
- [ ] Search returns results in < 500ms
- [ ] AI analysis completes in < 10 seconds
- [ ] Thumbnail generation works for all image types
- [ ] Proper access controls prevent unauthorized access

## Common Gotchas

- PDF.js worker needs proper configuration for Next.js
- Supabase Storage requires proper CORS settings
- Large file uploads need chunking for reliability
- OCR accuracy varies greatly with image quality
- Image optimization can significantly reduce quality
- AI analysis costs can escalate with large documents
