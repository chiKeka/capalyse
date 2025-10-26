import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/api/axios';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface Document {
  category: string;
  _id: string;
  userId: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  updatedAt: string;
}

export interface DocumentUploadResponse {
  success: boolean;
  data: Document;
}

export interface DocumentListResponse {
  success: boolean;
  data: Document[];
}

export interface DocumentDeleteResponse {
  success: boolean;
  message: string;
}

export interface ApiErrorResponse {
  success: boolean;
  error: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

const documentEndpoints = {
  upload: '/documents/upload',
  getAll: '/documents',
  download: (id: string) => `/documents/${id}/download`,
  delete: (id: string) => `/documents/${id}`,
} as const;

// ============================================================================
// QUERY KEYS
// ============================================================================

export const documentQueryKeys = {
  all: ['documents'] as const,
  lists: (category?: string) =>
    [...documentQueryKeys.all, 'list', { category }] as const,
  list: (filters: string) =>
    [...documentQueryKeys.lists(), { filters }] as const,
  details: () => [...documentQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...documentQueryKeys.details(), id] as const,
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file type icon based on MIME type
 */
export function getFileTypeIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet'))
    return '📊';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation'))
    return '📈';
  return '📁';
}

/**
 * Validate file type
 */
export function isValidFileType(
  file: File,
  allowedTypes: string[] = ['image/*', 'application/pdf']
): boolean {
  return allowedTypes.some((type) => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.slice(0, -1));
    }
    return file.type === type;
  });
}

/**
 * Validate file size
 */
export function isValidFileSize(file: File, maxSizeInMB: number = 10): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook for document-related queries and mutations
 */
export function useDocument() {
  const queryClient = useQueryClient();

  // ============================================================================
  // QUERIES
  // ============================================================================

  /**
   * Get all documents for the current user
   */
  const useGetDocuments = (enabled = true) => {
    return useQuery({
      queryKey: documentQueryKeys.lists(),
      queryFn: async (): Promise<Document[]> => {
        const response = await api.get<DocumentListResponse>(
          documentEndpoints.getAll
        );
        return response.data.data;
      },
      enabled,
    });
  };

  /**
   * Get all documents for the current user by category
   */
  const useGetDocumentsByCategory = (category?: string, enabled = true) => {
    return useQuery({
      queryKey: documentQueryKeys.lists(category),
      queryFn: async (): Promise<Document[]> => {
        const response = await api.get<DocumentListResponse>(
          documentEndpoints.getAll,
          {
            params: {
              category,
            },
          }
        );
        return response.data.data;
      },
      enabled,
    });
  };

  /**
   * Get a specific document by ID
   */
  const useGetDocument = (id: string, enabled = true) => {
    return useQuery({
      queryKey: documentQueryKeys.detail(id),
      queryFn: async (): Promise<Document> => {
        const response = await api.get<DocumentListResponse>(
          documentEndpoints.getAll
        );
        const document = response.data.data.find((doc) => doc._id === id);
        if (!document) {
          throw new Error('Document not found');
        }
        return document;
      },
      enabled: enabled && !!id,
    });
  };

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  /**
   * Upload a document
   */
  const useUploadDocument = () => {
    return useMutation({
      mutationFn: async ({
        file,
        fileName,
        category,
      }: {
        file: File;
        fileName: string;
        category?: string;
      }): Promise<Document> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', fileName);
        if (category) {
          formData.append('category', category);
        }

        const response = await api.post<DocumentUploadResponse>(
          documentEndpoints.upload,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const percentage = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                // You can use this for progress tracking if needed
                // console.log(`Upload progress: ${percentage}%`);
              }
            },
          }
        );

        return response.data.data;
      },
      onSuccess: (data) => {
        // Invalidate documents list
        queryClient.invalidateQueries({
          queryKey: documentQueryKeys.lists(),
        });

        // Add the new document to the cache
        queryClient.setQueryData(documentQueryKeys.detail(data._id), data);
      },
      onError: (error) => {
        // console.error('Document upload failed:', error);
      },
    });
  };

  /**
   * Upload multiple documents
   */
  const useUploadMultipleDocuments = () => {
    return useMutation({
      mutationFn: async ({
        files,
        category,
      }: {
        files: File[];
        category?: string;
      }): Promise<Document[]> => {
        const uploadPromises = files.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          if (category) {
            formData.append('category', category);
          }

          const response = await api.post<DocumentUploadResponse>(
            documentEndpoints.upload,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );

          return response.data.data;
        });

        return Promise.all(uploadPromises);
      },
      onSuccess: (data, variables) => {
        // Invalidate documents list
        queryClient.invalidateQueries({
          queryKey: documentQueryKeys.lists(variables?.category),
        });

        // Add new documents to the cache
        data.forEach((document) => {
          queryClient.setQueryData(
            documentQueryKeys.detail(document._id),
            document
          );
        });
      },
      onError: (error) => {
        // console.error('Multiple document upload failed:', error);
      },
    });
  };

  /**
   * Delete a document
   */
  const useDeleteDocument = () => {
    return useMutation({
      mutationFn: async (id: string): Promise<DocumentDeleteResponse> => {
        const response = await api.delete<DocumentDeleteResponse>(
          documentEndpoints.delete(id)
        );
        queryClient.setQueryData<Document[]>(
          documentQueryKeys.lists(),
          (oldData) => {
            if (!oldData) return oldData;
            return oldData.filter((doc) => doc._id !== id);
          }
        );

        // Remove from detail cache
        queryClient.removeQueries({
          queryKey: documentQueryKeys.detail(id),
        });
        return response.data;
      },
      onSuccess: (data, id) => {
        // Remove from documents list cache
      },
      onError: (error) => {
        // console.error('Document deletion failed:', error);
      },
    });
  };

  /**
   * Download a document
   */
  const useDownloadDocument = () => {
    return useMutation({
      mutationFn: async (id: string): Promise<Blob> => {
        const response = await api.get(documentEndpoints.download(id), {
          responseType: 'blob',
        });
        return response.data;
      },
      onSuccess: (blob, id) => {
        // Get document details to use original filename
        const docData = queryClient.getQueryData<Document>(
          documentQueryKeys.detail(id)
        );

        const filename = docData?.originalName || `document-${id}`;

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      onError: (error) => {
        // console.error('Document download failed:', error);
      },
    });
  };

  // ============================================================================
  // ADVANCED MUTATIONS
  // ============================================================================

  /**
   * Upload document with progress tracking
   */
  const useUploadDocumentWithProgress = () => {
    return useMutation({
      mutationFn: async ({
        file,
        onProgress,
      }: {
        file: File;
        onProgress?: (progress: UploadProgress) => void;
      }): Promise<Document> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post<DocumentUploadResponse>(
          documentEndpoints.upload,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total && onProgress) {
                const progress: UploadProgress = {
                  loaded: progressEvent.loaded,
                  total: progressEvent.total,
                  percentage: Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                  ),
                };
                onProgress(progress);
              }
            },
          }
        );

        return response.data.data;
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: documentQueryKeys.lists(),
        });
        queryClient.setQueryData(documentQueryKeys.detail(data._id), data);
      },
    });
  };

  /**
   * Bulk delete documents
   */
  const useBulkDeleteDocuments = () => {
    return useMutation({
      mutationFn: async (ids: string[]): Promise<DocumentDeleteResponse[]> => {
        const deletePromises = ids.map(async (id) => {
          const response = await api.delete<DocumentDeleteResponse>(
            documentEndpoints.delete(id)
          );
          return response.data;
        });

        return Promise.all(deletePromises);
      },
      onSuccess: (data, ids) => {
        // Remove from documents list cache
        queryClient.setQueryData<Document[]>(
          documentQueryKeys.lists(),
          (oldData) => {
            if (!oldData) return oldData;
            return oldData.filter((doc) => !ids.includes(doc._id));
          }
        );

        // Remove from detail cache
        ids.forEach((id) => {
          queryClient.removeQueries({
            queryKey: documentQueryKeys.detail(id),
          });
        });
      },
    });
  };

  return {
    // Queries
    useGetDocuments,
    useGetDocument,
    useGetDocumentsByCategory,

    // Basic mutations
    useUploadDocument,
    useUploadMultipleDocuments,
    useDeleteDocument,
    useDownloadDocument,

    // Advanced mutations
    useUploadDocumentWithProgress,
    useBulkDeleteDocuments,

    // Query keys for external use
    queryKeys: documentQueryKeys,
  };
}

// ============================================================================
// SPECIALIZED HOOKS
// ============================================================================

/**
 * Hook for document upload with drag and drop support
 */
export function useDocumentUpload() {
  const { useUploadDocumentWithProgress } = useDocument();
  const uploadMutation = useUploadDocumentWithProgress();

  const handleFileUpload = async (
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ) => {
    // Validate file type
    if (!isValidFileType(file)) {
      throw new Error('Invalid file type. Only images and PDFs are allowed.');
    }

    // Validate file size (10MB default)
    if (!isValidFileSize(file, 10)) {
      throw new Error('File size too large. Maximum size is 10MB.');
    }

    return uploadMutation.mutateAsync({ file, onProgress });
  };

  const handleDrop = async (
    files: FileList,
    onProgress?: (progress: UploadProgress) => void
  ) => {
    const fileArray = Array.from(files);
    const uploadPromises = fileArray.map((file) =>
      handleFileUpload(file, onProgress)
    );
    return Promise.all(uploadPromises);
  };

  return {
    upload: handleFileUpload,
    uploadMultiple: handleDrop,
    isUploading: uploadMutation.isPending,
    error: uploadMutation.error,
    reset: uploadMutation.reset,
  };
}

/**
 * Hook for document management with filtering and sorting
 */
export function useDocumentManagement() {
  const { useGetDocuments, useDeleteDocument, useBulkDeleteDocuments } =
    useDocument();

  const { data: documents, isLoading, error } = useGetDocuments();
  const deleteMutation = useDeleteDocument();
  const bulkDeleteMutation = useBulkDeleteDocuments();

  const getDocumentsByType = (mimeType: string) => {
    if (!documents) return [];
    return documents.filter((doc) => doc.mimeType.includes(mimeType));
  };

  const getDocumentsBySize = (maxSizeInBytes: number) => {
    if (!documents) return [];
    return documents.filter((doc) => doc.size <= maxSizeInBytes);
  };

  const getRecentDocuments = (days: number = 7) => {
    if (!documents) return [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return documents.filter((doc) => new Date(doc.uploadedAt) >= cutoffDate);
  };

  const getTotalStorageUsed = () => {
    if (!documents) return 0;
    return documents.reduce((total, doc) => total + doc.size, 0);
  };

  return {
    documents,
    isLoading,
    error,
    deleteDocument: deleteMutation.mutate,
    bulkDeleteDocuments: bulkDeleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    isBulkDeleting: bulkDeleteMutation.isPending,

    // Filtering methods
    getDocumentsByType,
    getDocumentsBySize,
    getRecentDocuments,
    getTotalStorageUsed,
  };
}

export default useDocument;
