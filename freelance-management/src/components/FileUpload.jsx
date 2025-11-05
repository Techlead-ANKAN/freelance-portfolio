import React, { useState, useRef } from 'react';
import { storageService } from '../lib/supabase';
import {
    CloudArrowUpIcon,
    DocumentIcon,
    XMarkIcon,
    TrashIcon,
    EyeIcon,
    ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

const FileUpload = ({ 
    services,
    clientName, 
    startDate,
    onFileUploaded, 
    onFileDeleted,
    existingFiles = [],
    maxFiles = 10,
    acceptedTypes = '.pdf,.doc,.docx,.zip,.rar,.png,.jpg,.jpeg,.txt'
}) => {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const handleFiles = async (files) => {
        setUploading(true);
        
        try {
            for (const file of files) {
                // Check file size (max 10MB)
                if (file.size > 10 * 1024 * 1024) {
                    alert(`File ${file.name} is too large. Maximum size is 10MB.`);
                    continue;
                }

                const uploadResult = await storageService.uploadFile(
                    file, 
                    services,
                    clientName, 
                    startDate
                );

                const fileData = {
                    id: crypto.randomUUID(),
                    title: file.name,
                    url: uploadResult.publicUrl,
                    type: 'uploaded',
                    note: '',
                    uploaded_file_path: uploadResult.path,
                    size: file.size,
                    uploaded_at: new Date().toISOString()
                };

                if (onFileUploaded) {
                    onFileUploaded(fileData);
                }
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload file: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    };

    const handleFileInput = (e) => {
        const files = Array.from(e.target.files);
        handleFiles(files);
    };

    const handleDeleteFile = async (file) => {
        if (!window.confirm(`Are you sure you want to delete ${file.title}?`)) {
            return;
        }

        try {
            if (file.uploaded_file_path) {
                await storageService.deleteFile(file.uploaded_file_path);
            }
            
            if (onFileDeleted) {
                onFileDeleted(file);
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete file: ' + error.message);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileName) => {
        const extension = fileName.split('.').pop().toLowerCase();
        
        if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
            return '🖼️';
        } else if (['pdf'].includes(extension)) {
            return '📄';
        } else if (['doc', 'docx'].includes(extension)) {
            return '📝';
        } else if (['zip', 'rar'].includes(extension)) {
            return '📦';
        }
        return '📎';
    };

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive 
                        ? 'border-black bg-gray-50' 
                        : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={() => setDragActive(true)}
                onDragLeave={() => setDragActive(false)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={acceptedTypes}
                    onChange={handleFileInput}
                    className="hidden"
                />
                
                <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                
                <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-900">
                        Drop files here or{' '}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-black underline hover:no-underline"
                        >
                            browse
                        </button>
                    </p>
                    <p className="text-sm text-gray-600">
                        Support: PDF, DOC, ZIP, Images (Max 10MB each)
                    </p>
                    {clientName && (
                        <p className="text-xs text-gray-500">
                            Files will be stored in: {storageService.generateFolderPath(services, clientName, startDate)}
                        </p>
                    )}
                </div>

                {uploading && (
                    <div className="mt-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black mx-auto"></div>
                        <p className="text-sm text-gray-600 mt-2">Uploading...</p>
                    </div>
                )}
            </div>

            {/* Existing Files */}
            {existingFiles.length > 0 && (
                <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Uploaded Files ({existingFiles.length})</h4>
                    <div className="grid grid-cols-1 gap-2">
                        {existingFiles.map((file) => (
                            <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3 flex-1">
                                    <span className="text-xl">{getFileIcon(file.title)}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{file.title}</p>
                                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                                            {file.size && <span>{formatFileSize(file.size)}</span>}
                                            {file.uploaded_at && (
                                                <span>• {new Date(file.uploaded_at).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                        {file.note && (
                                            <p className="text-sm text-gray-600 mt-1">{file.note}</p>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => window.open(file.url, '_blank')}
                                        className="p-1 text-gray-400 hover:text-gray-600"
                                        title="View file"
                                    >
                                        <EyeIcon className="w-4 h-4" />
                                    </button>
                                    
                                    <a
                                        href={file.url}
                                        download
                                        className="p-1 text-gray-400 hover:text-gray-600"
                                        title="Download file"
                                    >
                                        <ArrowDownTrayIcon className="w-4 h-4" />
                                    </a>
                                    
                                    <button
                                        onClick={() => handleDeleteFile(file)}
                                        className="p-1 text-gray-400 hover:text-red-600"
                                        title="Delete file"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUpload;