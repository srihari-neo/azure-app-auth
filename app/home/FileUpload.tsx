'use client';

import React, { useState, useRef } from 'react';
import {  File, Save, X, CheckCircle, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadResponse {
  success: boolean;
  url?: string;
  requestId?: string;
  error?: string;
}

interface FileUploadComponentProps {
  onUploadSuccess: () => void;
}

const FileUploadComponent: React.FC<FileUploadComponentProps> = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [originalFileName, setOriginalFileName] = useState<string>('');
  const [containerName, setContainerName] = useState<string>('uploads');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState<string>('');
  const [uploadedUrl, setUploadedUrl] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
      setOriginalFileName(file.name);
      setFileName(nameWithoutExtension);
      setUploadStatus('idle');
      setUploadMessage('');
      setUploadedUrl('');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
      setOriginalFileName(file.name);
      setFileName(nameWithoutExtension);
      setUploadStatus('idle');
      setUploadMessage('');
      setUploadedUrl('');
    }
  };

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop() || '';
  };

  const getFinalFileName = (): string => {
    if (!selectedFile || !fileName) return '';
    const extension = getFileExtension(originalFileName);
    return `${fileName}.${extension}`;
  };

  const handleSave = async () => {
    if (!selectedFile || !fileName.trim()) {
      setUploadStatus('error');
      setUploadMessage('Please select a file and provide a name');
      return;
    }

    setUploadStatus('uploading');
    setUploadMessage('Uploading file...');

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      const response = await fetch('/api/storage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          containerName: containerName,
          fileName: getFinalFileName(),
          fileBuffer: Array.from(buffer),
        }),
      });

      const result: UploadResponse = await response.json();

      if (result.success) {
        setUploadStatus('success');
        setUploadMessage('File uploaded successfully!');
        setUploadedUrl(result.url || '');
        setTimeout(() => {
          clearForm();
        }, 3000);
      } else {
        setUploadStatus('error');
        setUploadMessage(result.error || 'Upload failed');
      }
    } catch (error) {
      setUploadStatus('error');
      setUploadMessage('Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const clearForm = () => {
    setSelectedFile(null);
    setFileName('');
    setOriginalFileName('');
    setUploadStatus('idle');
    setUploadMessage('');
    setUploadedUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    onUploadSuccess();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div style={{ maxWidth: '672px', margin: '0 auto', padding: '24px', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>Upload File to Azure Storage</h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>Drop a file in the trash can or click to browse</p>
      </div>

      {/* Container Name Input */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#fff', marginBottom: '8px' }}>
          Container Name
        </label>
        <input
          type="text"
          value={containerName}
          onChange={(e) => setContainerName(e.target.value)}
          style={{ width: '100%', padding: '8px 16px', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', color: '#fff', fontSize: '14px' }}
          placeholder="Enter container name"
        />
      </div>

      {/* File Upload Area with Trash Can Animation */}
      <div
        style={{
          position: 'relative',
          border: `2px dashed ${selectedFile ? 'rgba(34, 197, 94, 0.5)' : isDragging ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.3)'}`,
          borderRadius: '12px',
          padding: '32px',
          textAlign: 'center',
          background: selectedFile ? 'rgba(34, 197, 94, 0.1)' : isDragging ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
          transition: 'all 0.3s ease',
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <AnimatePresence>
            {selectedFile ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <File style={{ width: '48px', height: '48px', color: '#22c55e', marginBottom: '16px' }} />
                <p style={{ fontSize: '18px', fontWeight: '500', color: '#22c55e' }}>{originalFileName}</p>
                <p style={{ fontSize: '14px', color: '#22c55e' }}>{formatFileSize(selectedFile.size)}</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: isDragging ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <motion.div
                  animate={{
                    rotateX: isDragging ? 30 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  style={{ position: 'relative', width: '64px', height: '64px', marginBottom: '16px' }}
                >
                  <Trash2 style={{ width: '64px', height: '64px', color: isDragging ? '#3b82f6' : '#fff', position: 'absolute' }} />
                  <motion.div
                    style={{
                      position: 'absolute',
                      top: '-10px',
                      left: '0',
                      right: '0',
                      height: '20px',
                      background: isDragging ? '#3b82f6' : '#fff',
                      borderRadius: '4px 4px 0 0',
                      transformOrigin: 'top',
                    }}
                    animate={{ rotateX: isDragging ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
                <p style={{ fontSize: '18px', fontWeight: '500', color: '#fff' }}>
                  {isDragging ? 'Drop the file to feed the trash can!' : 'Drop your file here or click to browse'}
                </p>
                <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginTop: '8px' }}>
                  Supports all file types
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* File Name Input */}
      {selectedFile && (
        <div style={{ marginTop: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#fff', marginBottom: '8px' }}>
            Custom File Name
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              style={{ flex: 1, padding: '8px 16px', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', color: '#fff', fontSize: '14px' }}
              placeholder="Enter custom file name"
            />
            <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', fontWeight: '500' }}>
              .{getFileExtension(originalFileName)}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginTop: '4px' }}>
            Final filename: <span style={{ fontWeight: '500' }}>{getFinalFileName()}</span>
          </p>
        </div>
      )}

      {/* Action Buttons */}
      {selectedFile && (
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button
            onClick={handleSave}
            disabled={uploadStatus === 'uploading' || !fileName.trim()}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: '500',
              background: uploadStatus === 'uploading' || !fileName.trim() ? 'rgba(255, 255, 255, 0.3)' : 'linear-gradient(to right, #2563eb, #7c3aed)',
              color: uploadStatus === 'uploading' || !fileName.trim() ? 'rgba(255, 255, 255, 0.5)' : '#fff',
              cursor: uploadStatus === 'uploading' || !fileName.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            {uploadStatus === 'uploading' ? (
              <>
                <Loader2 style={{ width: '20px', height: '20px', marginRight: '8px', animation: 'spin 1s linear infinite' }} />
                Uploading...
              </>
            ) : (
              <>
                <Save style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                Save to Azure
              </>
            )}
          </button>
          <button
            onClick={clearForm}
            disabled={uploadStatus === 'uploading'}
            style={{
              padding: '12px 24px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              color: '#fff',
              background: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.3s ease',
              cursor: uploadStatus === 'uploading' ? 'not-allowed' : 'pointer',
            }}
          >
            <X style={{ width: '20px', height: '20px', marginRight: '8px' }} />
            Clear
          </button>
        </div>
      )}

      {/* Status Messages */}
      {uploadMessage && (
        <div
          style={{
            marginTop: '24px',
            padding: '16px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            background: uploadStatus === 'success' ? 'rgba(34, 197, 94, 0.1)' : uploadStatus === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
            color: uploadStatus === 'success' ? '#22c55e' : uploadStatus === 'error' ? '#ef4444' : '#3b82f6',
            border: `1px solid ${uploadStatus === 'success' ? 'rgba(34, 197, 94, 0.2)' : uploadStatus === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`,
          }}
        >
          {uploadStatus === 'success' && <CheckCircle style={{ width: '20px', height: '20px', marginRight: '8px' }} />}
          {uploadStatus === 'error' && <AlertCircle style={{ width: '20px', height: '20px', marginRight: '8px' }} />}
          {uploadStatus === 'uploading' && <Loader2 style={{ width: '20px', height: '20px', marginRight: '8px', animation: 'spin 1s linear infinite' }} />}
          <span>{uploadMessage}</span>
        </div>
      )}

      {/* Uploaded File URL */}
      {uploadedUrl && (
        <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <p style={{ fontSize: '14px', fontWeight: '500', color: '#fff', marginBottom: '8px' }}>File URL:</p>
          <a
            href={uploadedUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#3b82f6', textDecoration: 'underline', fontSize: '14px', wordBreak: 'break-all' }}
          >
            {uploadedUrl}
          </a>
        </div>
      )}
    </div>
  );
};

export default FileUploadComponent;