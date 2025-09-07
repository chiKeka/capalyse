/**
 * Example component demonstrating how to use the useDocument hook
 * This file shows various usage patterns for document management functionality
 */

import React, { useState, useCallback } from 'react';
import {
  useDocument,
  useDocumentUpload,
  useDocumentManagement,
  formatFileSize,
  getFileTypeIcon,
  isValidFileType,
  isValidFileSize,
} from './useDocument';

// Example 1: Basic Document List Component
export function DocumentList() {
  const { useGetDocuments, useDeleteDocument, useDownloadDocument } =
    useDocument();

  const { data: documents, isLoading, error } = useGetDocuments();
  const deleteMutation = useDeleteDocument();
  const downloadMutation = useDownloadDocument();

  if (isLoading) return <div>Loading documents...</div>;
  if (error) return <div>Error loading documents: {error.message}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">My Documents</h2>

      {documents?.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No documents uploaded yet
        </div>
      ) : (
        <div className="grid gap-4">
          {documents?.map((doc) => (
            <div
              key={doc._id}
              className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">
                  {getFileTypeIcon(doc.mimeType)}
                </span>
                <div>
                  <h3 className="font-medium">{doc.originalName}</h3>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(doc.size)} •{' '}
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => downloadMutation.mutate(doc._id)}
                  disabled={downloadMutation.isPending}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {downloadMutation.isPending ? 'Downloading...' : 'Download'}
                </button>
                <button
                  onClick={() => deleteMutation.mutate(doc._id)}
                  disabled={deleteMutation.isPending}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Example 2: Document Upload Component with Drag & Drop
export function DocumentUpload() {
  const { upload, uploadMultiple, isUploading, error, reset } =
    useDocumentUpload();
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      if (files.length === 1) {
        await upload(files[0], (progress) => {
          setUploadProgress(progress.percentage);
        });
      } else {
        await uploadMultiple(files, (progress) => {
          setUploadProgress(progress.percentage);
        });
      }
      setUploadProgress(0);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        try {
          await uploadMultiple(files, (progress) => {
            setUploadProgress(progress.percentage);
          });
          setUploadProgress(0);
        } catch (err) {
          console.error('Upload failed:', err);
        }
      }
    },
    [uploadMultiple]
  );

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Upload Documents</h2>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error.message}</p>
          <button
            onClick={reset}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="text-4xl">📁</div>
          <div>
            <p className="text-lg font-medium">
              Drop files here or click to upload
            </p>
            <p className="text-sm text-gray-500">
              Supports images and PDFs up to 10MB
            </p>
          </div>

          <input
            type="file"
            multiple
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
          >
            Choose Files
          </label>
        </div>
      </div>

      {/* Progress Bar */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Example 3: Document Management with Filtering
export function DocumentManagement() {
  const {
    documents,
    isLoading,
    error,
    deleteDocument,
    bulkDeleteDocuments,
    isDeleting,
    isBulkDeleting,
    getDocumentsByType,
    getDocumentsBySize,
    getRecentDocuments,
    getTotalStorageUsed,
  } = useDocumentManagement();

  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'images' | 'pdfs' | 'recent'>(
    'all'
  );

  if (isLoading) return <div>Loading documents...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const filteredDocuments = (() => {
    switch (filter) {
      case 'images':
        return getDocumentsByType('image');
      case 'pdfs':
        return getDocumentsByType('pdf');
      case 'recent':
        return getRecentDocuments(7);
      default:
        return documents || [];
    }
  })();

  const handleSelectAll = () => {
    if (selectedDocuments.length === filteredDocuments.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(filteredDocuments.map((doc) => doc._id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedDocuments.length > 0) {
      bulkDeleteDocuments(selectedDocuments);
      setSelectedDocuments([]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Document Management</h2>
        <div className="text-sm text-gray-500">
          Total Storage: {formatFileSize(getTotalStorageUsed())}
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded ${
            filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          All ({documents?.length || 0})
        </button>
        <button
          onClick={() => setFilter('images')}
          className={`px-3 py-1 rounded ${
            filter === 'images' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Images ({getDocumentsByType('image').length})
        </button>
        <button
          onClick={() => setFilter('pdfs')}
          className={`px-3 py-1 rounded ${
            filter === 'pdfs' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          PDFs ({getDocumentsByType('pdf').length})
        </button>
        <button
          onClick={() => setFilter('recent')}
          className={`px-3 py-1 rounded ${
            filter === 'recent' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Recent ({getRecentDocuments(7).length})
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedDocuments.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span>{selectedDocuments.length} document(s) selected</span>
            <button
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              {isBulkDeleting ? 'Deleting...' : 'Delete Selected'}
            </button>
          </div>
        </div>
      )}

      {/* Document List */}
      <div className="space-y-2">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No documents found
          </div>
        ) : (
          <>
            {/* Select All */}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
              <input
                type="checkbox"
                checked={selectedDocuments.length === filteredDocuments.length}
                onChange={handleSelectAll}
                className="rounded"
              />
              <span className="text-sm font-medium">Select All</span>
            </div>

            {/* Documents */}
            {filteredDocuments.map((doc) => (
              <div
                key={doc._id}
                className="flex items-center space-x-3 p-3 bg-white rounded border"
              >
                <input
                  type="checkbox"
                  checked={selectedDocuments.includes(doc._id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedDocuments([...selectedDocuments, doc._id]);
                    } else {
                      setSelectedDocuments(
                        selectedDocuments.filter((id) => id !== doc._id)
                      );
                    }
                  }}
                  className="rounded"
                />

                <span className="text-xl">{getFileTypeIcon(doc.mimeType)}</span>

                <div className="flex-1">
                  <h3 className="font-medium">{doc.originalName}</h3>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(doc.size)} •{' '}
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={() => deleteDocument(doc._id)}
                  disabled={isDeleting}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// Example 4: File Validation Component
export function FileValidationExample() {
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errors: string[];
  }>({ isValid: true, errors: [] });

  const handleFileValidation = (file: File) => {
    const errors: string[] = [];

    if (!isValidFileType(file)) {
      errors.push('Invalid file type. Only images and PDFs are allowed.');
    }

    if (!isValidFileSize(file, 5)) {
      // 5MB limit
      errors.push('File size too large. Maximum size is 5MB.');
    }

    setValidationResult({
      isValid: errors.length === 0,
      errors,
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">File Validation</h2>

      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFileValidation(file);
          }
        }}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />

      {validationResult.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-medium text-red-800">Validation Errors:</h3>
          <ul className="mt-2 list-disc list-inside text-red-700">
            {validationResult.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {validationResult.isValid && validationResult.errors.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">File is valid and ready for upload!</p>
        </div>
      )}
    </div>
  );
}

// Example 5: Document Statistics Component
export function DocumentStatistics() {
  const { documents, getDocumentsByType, getTotalStorageUsed } =
    useDocumentManagement();

  if (!documents) return <div>Loading statistics...</div>;

  const imageCount = getDocumentsByType('image').length;
  const pdfCount = getDocumentsByType('pdf').length;
  const totalStorage = getTotalStorageUsed();
  const averageFileSize =
    documents.length > 0 ? totalStorage / documents.length : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Document Statistics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">
            {documents.length}
          </div>
          <div className="text-sm text-gray-600">Total Documents</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{imageCount}</div>
          <div className="text-sm text-gray-600">Images</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">{pdfCount}</div>
          <div className="text-sm text-gray-600">PDFs</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-orange-600">
            {formatFileSize(totalStorage)}
          </div>
          <div className="text-sm text-gray-600">Total Storage</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Storage Breakdown</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Images</span>
            <span>
              {formatFileSize(
                getDocumentsByType('image').reduce(
                  (sum, doc) => sum + doc.size,
                  0
                )
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span>PDFs</span>
            <span>
              {formatFileSize(
                getDocumentsByType('pdf').reduce(
                  (sum, doc) => sum + doc.size,
                  0
                )
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Average File Size</span>
            <span>{formatFileSize(averageFileSize)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
