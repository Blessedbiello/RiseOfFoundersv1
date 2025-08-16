'use client';

import { useState, useCallback, useRef } from 'react';
import { MissionStep } from './MissionWorkflow';
import { Button } from '../ui/button';
import { 
  Upload, 
  CheckCircle, 
  Loader2, 
  AlertTriangle, 
  File,
  X,
  Image,
  FileText,
  Archive
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ArtifactUploadProps {
  step: MissionStep;
  onUploaded: (data: any) => void;
  isCompleted: boolean;
}

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  content: string; // base64 encoded for demo
  uploadedAt: string;
}

export const ArtifactUpload: React.FC<ArtifactUploadProps> = ({
  step,
  onUploaded,
  isCompleted
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return Image;
    if (fileType.includes('pdf') || fileType.includes('document')) return FileText;
    if (fileType.includes('zip') || fileType.includes('tar')) return Archive;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = useCallback((file: File) => {
    // File size limit (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { valid: false, message: 'File size must be less than 10MB' };
    }

    // Allowed file types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/zip',
      'application/json'
    ];

    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.md')) {
      return { 
        valid: false, 
        message: 'File type not supported. Allowed: PDF, Word, Text, Markdown, Images, ZIP' 
      };
    }

    return { valid: true, message: 'File is valid' };
  }, []);

  const handleFileSelect = useCallback(async (files: FileList) => {
    const file = files[0]; // Single file upload for demo
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      // Convert file to base64 for demo (in production, upload to cloud storage)
      const reader = new FileReader();
      
      const fileContent = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const uploadedFile: UploadedFile = {
        name: file.name,
        size: file.size,
        type: file.type,
        content: fileContent,
        uploadedAt: new Date().toISOString()
      };

      setUploadedFiles([uploadedFile]);
      
      onUploaded({
        type: 'file',
        files: [uploadedFile],
        uploaded_at: new Date().toISOString()
      });

      toast.success('File uploaded successfully!');
    } catch (error: any) {
      setError(`Upload failed: ${error.message}`);
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, [validateFile, onUploaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const removeFile = useCallback((index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    if (uploadedFiles.length === 1) {
      // If removing the only file, reset the step
      setError('');
    }
  }, [uploadedFiles.length]);

  const renderUploadedFiles = () => {
    if (uploadedFiles.length === 0) return null;

    return (
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-300 mb-2">Uploaded Files:</div>
        {uploadedFiles.map((file, index) => {
          const FileIcon = getFileIcon(file.type);
          return (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
              <FileIcon className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white truncate">{file.name}</div>
                <div className="text-xs text-gray-400">
                  {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                className="text-red-400 hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          );
        })}
      </div>
    );
  };

  if (isCompleted) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-green-400">
          <CheckCircle className="w-5 h-5" />
          <span>File upload completed</span>
        </div>
        {renderUploadedFiles()}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="prose prose-invert max-w-none">
        <div className="whitespace-pre-wrap text-gray-300 mb-4">
          {step.instructions}
        </div>
      </div>

      <div className="space-y-3">
        {/* Upload Area */}
        <div
          className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
            accept=".pdf,.doc,.docx,.txt,.md,.jpg,.jpeg,.png,.gif,.zip,.json"
          />
          
          <div className="flex flex-col items-center gap-2">
            {isUploading ? (
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            ) : (
              <Upload className="w-8 h-8 text-gray-400" />
            )}
            
            <div>
              <div className="font-medium text-white mb-1">
                {isUploading ? 'Uploading...' : 'Drop your file here or click to browse'}
              </div>
              <div className="text-sm text-gray-400">
                PDF, Word, Text, Markdown, Images, ZIP (max 10MB)
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {renderUploadedFiles()}

        {/* Upload Guidelines */}
        <div className="text-xs text-gray-500">
          <p><strong>Upload Guidelines:</strong></p>
          <ul className="list-disc list-inside mt-1">
            <li>Maximum file size: 10MB</li>
            <li>Supported formats: PDF, Word, Text, Markdown, Images, ZIP</li>
            <li>Ensure your file contains the required deliverables</li>
            <li>Use clear, descriptive file names</li>
          </ul>
        </div>
      </div>
    </div>
  );
};