'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { uploadFile } from '@/lib/api';
import type { UploadFilePayload } from '@/lib/types';

interface UploadDialogProps {
  onUploadSuccess?: () => void;
}

export function UploadDialog({ onUploadSuccess }: UploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customName, setCustomName] = useState('');
  const [metadata, setMetadata] = useState('');
  const [uploading, setUploading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0]);
      }
    },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);

    try {
      const payload: UploadFilePayload = {
        file: selectedFile,
      };

      if (customName.trim()) {
        payload.customName = customName.trim();
      }

      if (metadata.trim()) {
        try {
          payload.metadata = JSON.parse(metadata);
        } catch (error) {
          toast.error('Invalid JSON metadata');
          setUploading(false);
          return;
        }
      }

      await uploadFile(payload);
      toast.success('File uploaded successfully');

      // Reset form
      setSelectedFile(null);
      setCustomName('');
      setMetadata('');
      setOpen(false);

      onUploadSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to upload file'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add File
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[600px] w-[100vw]">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
          <DialogDescription>
            Upload a file to your Backblaze B2 storage
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            {selectedFile ? (
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div>
                <p className="font-medium">
                  {isDragActive ? 'Drop file here' : 'Drag & drop file here'}
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customName">Custom Name (Optional)</Label>
            <Input
              id="customName"
              placeholder="My Custom File Name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              maxLength={255}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="metadata">Metadata (Optional JSON)</Label>
            <Input
              id="metadata"
              placeholder='{"author": "John Doe", "tags": ["important"]}'
              value={metadata}
              onChange={(e) => setMetadata(e.target.value)}
            />
          </div>

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="w-full"
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
