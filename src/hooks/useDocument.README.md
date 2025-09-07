# useDocument Hook

A comprehensive React hook for managing document upload, download, and management functionality in the Capalyze platform. This hook provides queries and mutations for all document operations including file uploads, downloads, deletions, and management.

## Features

- **Complete TypeScript Support**: Full type safety with comprehensive interfaces
- **React Query Integration**: Built on TanStack Query for efficient caching and state management
- **File Upload Support**: Single and multiple file uploads with progress tracking
- **Drag & Drop Support**: Built-in drag and drop functionality
- **File Validation**: Type and size validation utilities
- **Bulk Operations**: Bulk delete and management operations
- **Progress Tracking**: Upload progress with percentage tracking
- **Utility Functions**: File formatting and type detection helpers

## Installation

The hook is already included in the project. Import it directly:

```typescript
import { useDocument } from '@/hooks/useDocument';
```

## Basic Usage

```typescript
import { useDocument } from '@/hooks/useDocument';

function DocumentComponent() {
  const { useGetDocuments, useUploadDocument } = useDocument();

  const { data: documents, isLoading } = useGetDocuments();
  const uploadMutation = useUploadDocument();

  const handleUpload = (file: File) => {
    uploadMutation.mutate(file);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Documents ({documents?.length || 0})</h2>
      {/* Your document list */}
    </div>
  );
}
```

## Available Queries

### Core Document Queries

#### `useGetDocuments(enabled?)`

Get all documents for the current user.

```typescript
const { data: documents, isLoading, error } = useGetDocuments();
```

#### `useGetDocument(id, enabled?)`

Get a specific document by ID.

```typescript
const { data: document, isLoading } = useGetDocument('document-id');
```

## Available Mutations

### Basic Mutations

#### `useUploadDocument()`

Upload a single document.

```typescript
const uploadMutation = useUploadDocument();

uploadMutation.mutate(file);
```

#### `useUploadMultipleDocuments()`

Upload multiple documents.

```typescript
const uploadMultipleMutation = useUploadMultipleDocuments();

uploadMultipleMutation.mutate([file1, file2, file3]);
```

#### `useDeleteDocument()`

Delete a document.

```typescript
const deleteMutation = useDeleteDocument();

deleteMutation.mutate('document-id');
```

#### `useDownloadDocument()`

Download a document.

```typescript
const downloadMutation = useDownloadDocument();

downloadMutation.mutate('document-id');
```

### Advanced Mutations

#### `useUploadDocumentWithProgress()`

Upload with progress tracking.

```typescript
const uploadWithProgressMutation = useUploadDocumentWithProgress();

uploadWithProgressMutation.mutate({
  file,
  onProgress: (progress) => {
    console.log(`Upload progress: ${progress.percentage}%`);
  }
});
```

#### `useBulkDeleteDocuments()`

Delete multiple documents.

```typescript
const bulkDeleteMutation = useBulkDeleteDocuments();

bulkDeleteMutation.mutate(['id1', 'id2', 'id3']);
```

## Specialized Hooks

### `useDocumentUpload()`

Specialized hook for upload functionality with validation.

```typescript
import { useDocumentUpload } from '@/hooks/useDocument';

function UploadComponent() {
  const { upload, uploadMultiple, isUploading, error, reset } = useDocumentUpload();

  const handleFileUpload = async (file: File) => {
    try {
      await upload(file);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
      />
      {isUploading && <div>Uploading...</div>}
      {error && <div>Error: {error.message}</div>}
    </div>
  );
}
```

### `useDocumentManagement()`

Specialized hook for document management with filtering and statistics.

```typescript
import { useDocumentManagement } from '@/hooks/useDocument';

function ManagementComponent() {
  const {
    documents,
    isLoading,
    deleteDocument,
    bulkDeleteDocuments,
    getDocumentsByType,
    getRecentDocuments,
    getTotalStorageUsed,
  } = useDocumentManagement();

  const images = getDocumentsByType('image');
  const recentDocs = getRecentDocuments(7);
  const totalStorage = getTotalStorageUsed();

  return (
    <div>
      <h2>Total Storage: {formatFileSize(totalStorage)}</h2>
      <h3>Images: {images.length}</h3>
      <h3>Recent: {recentDocs.length}</h3>
    </div>
  );
}
```

## Types and Interfaces

### Core Types

```typescript
interface Document {
  _id: string;
  userId: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  updatedAt: string;
}

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}
```

### Response Types

```typescript
interface DocumentUploadResponse {
  success: boolean;
  data: Document;
}

interface DocumentListResponse {
  success: boolean;
  data: Document[];
}

interface DocumentDeleteResponse {
  success: boolean;
  message: string;
}
```

## Utility Functions

### File Formatting

```typescript
import { formatFileSize, getFileTypeIcon } from '@/hooks/useDocument';

// Format file size for display
const size = formatFileSize(1024 * 1024); // "1 MB"

// Get file type icon
const icon = getFileTypeIcon('image/jpeg'); // "🖼️"
```

### File Validation

```typescript
import { isValidFileType, isValidFileSize } from '@/hooks/useDocument';

// Validate file type
const isValidType = isValidFileType(file, ['image/*', 'application/pdf']);

// Validate file size (10MB default)
const isValidSize = isValidFileSize(file, 10);
```

## Query Keys

The hook exports query keys for external cache management:

```typescript
import { documentQueryKeys } from '@/hooks/useDocument';

// Invalidate all document queries
queryClient.invalidateQueries({ queryKey: documentQueryKeys.all });

// Invalidate specific document
queryClient.invalidateQueries({
  queryKey: documentQueryKeys.detail('document-id')
});
```

## File Upload Examples

### Basic Upload

```typescript
const { useUploadDocument } = useDocument();
const uploadMutation = useUploadDocument();

const handleUpload = (file: File) => {
  uploadMutation.mutate(file);
};
```

### Upload with Progress

```typescript
const { useUploadDocumentWithProgress } = useDocument();
const uploadMutation = useUploadDocumentWithProgress();

const handleUpload = (file: File) => {
  uploadMutation.mutate({
    file,
    onProgress: (progress) => {
      console.log(`Upload progress: ${progress.percentage}%`);
    }
  });
};
```

### Drag & Drop Upload

```typescript
import { useDocumentUpload } from '@/hooks/useDocument';

function DragDropUpload() {
  const { uploadMultiple, isUploading } = useDocumentUpload();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadMultiple(files);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed p-8"
    >
      Drop files here
      {isUploading && <div>Uploading...</div>}
    </div>
  );
}
```

## Document Management Examples

### Document List with Actions

```typescript
function DocumentList() {
  const { useGetDocuments, useDeleteDocument, useDownloadDocument } = useDocument();

  const { data: documents } = useGetDocuments();
  const deleteMutation = useDeleteDocument();
  const downloadMutation = useDownloadDocument();

  return (
    <div>
      {documents?.map((doc) => (
        <div key={doc._id}>
          <span>{doc.originalName}</span>
          <button onClick={() => downloadMutation.mutate(doc._id)}>
            Download
          </button>
          <button onClick={() => deleteMutation.mutate(doc._id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Bulk Operations

```typescript
function BulkOperations() {
  const { useBulkDeleteDocuments } = useDocument();
  const bulkDeleteMutation = useBulkDeleteDocuments();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleBulkDelete = () => {
    if (selectedIds.length > 0) {
      bulkDeleteMutation.mutate(selectedIds);
      setSelectedIds([]);
    }
  };

  return (
    <div>
      <button onClick={handleBulkDelete}>
        Delete Selected ({selectedIds.length})
      </button>
    </div>
  );
}
```

## Error Handling

All queries and mutations include error handling:

```typescript
const { data, error, isLoading } = useGetDocuments();

if (error) {
  console.error('Failed to fetch documents:', error);
  return <div>Error loading documents</div>;
}

const uploadMutation = useUploadDocument();
if (uploadMutation.error) {
  console.error('Upload failed:', uploadMutation.error);
}
```

## File Validation

The hook includes built-in file validation:

```typescript
import { isValidFileType, isValidFileSize } from '@/hooks/useDocument';

const validateFile = (file: File) => {
  const errors: string[] = [];

  if (!isValidFileType(file)) {
    errors.push('Invalid file type. Only images and PDFs are allowed.');
  }

  if (!isValidFileSize(file, 10)) {
    errors.push('File size too large. Maximum size is 10MB.');
  }

  return errors;
};
```

## Best Practices

1. **File Validation**: Always validate files before upload
2. **Progress Tracking**: Use progress tracking for better UX
3. **Error Handling**: Handle upload and download errors gracefully
4. **Loading States**: Show loading states during operations
5. **File Size Limits**: Respect file size limits
6. **Type Safety**: Use TypeScript interfaces for better development experience

## API Endpoints

The hook covers all document endpoints from the API specification:

- `POST /api/v1/documents/upload` - Upload document
- `GET /api/v1/documents` - Get all documents
- `GET /api/v1/documents/{id}/download` - Download document
- `DELETE /api/v1/documents/{id}` - Delete document

## Examples

See `useDocument.example.tsx` for comprehensive usage examples including:

- Document List with Actions
- Drag & Drop Upload
- Document Management with Filtering
- File Validation
- Document Statistics

## Migration from Old Hooks

If migrating from old document hooks:

```typescript
// Old way
import { useUploadFile } from '@/hooks/useFiles';

// New way
import { useDocument } from '@/hooks/useDocument';

const { useUploadDocument } = useDocument();
```

The new hook provides better type safety, more comprehensive functionality, and improved error handling.
