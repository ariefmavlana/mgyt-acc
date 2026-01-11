
'use client';

import { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface FileUploadProps {
    onUploadComplete?: (document: any) => void;
    entityId?: string;
    entityType?: 'TRANSACTION' | 'USER' | 'COMPANY';
    kategori?: string;
}

export function FileUpload({ onUploadComplete, entityId, entityType, kategori = 'LAINNYA' }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            uploadFile(files[0]);
        }
    };

    const uploadFile = async (file: File) => {
        if (!file) return;

        // Validation (Client side)
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        // Allow office docs too
        if (!file.type.match(/(image\/.*|application\/pdf|application\/msword|application\/vnd.*)/)) {
            setError('Format file tidak didukung');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Ukuran file maksimal 5MB');
            return;
        }

        setIsUploading(true);
        setError(null);
        setSuccess(false);

        const formData = new FormData();
        formData.append('file', file);
        if (entityId) formData.append('entityId', entityId);
        if (entityType) formData.append('entityType', entityType);
        formData.append('kategori', kategori);

        try {
            const response = await fetch('/api/documents/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Upload gagal');
            }

            const document = await response.json();
            setSuccess(true);
            if (onUploadComplete) onUploadComplete(document);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="w-full">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                    border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                    ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400'}
                    ${error ? 'border-red-300 bg-red-50' : ''}
                    ${success ? 'border-green-300 bg-green-50' : ''}
                `}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => e.target.files && uploadFile(e.target.files[0])}
                />

                {isUploading ? (
                    <div className="flex flex-col items-center text-slate-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-500 mb-2"></div>
                        <p className="text-sm">Mengunggah...</p>
                    </div>
                ) : success ? (
                    <div className="flex flex-col items-center text-green-600">
                        <CheckCircle className="h-8 w-8 mb-2" />
                        <p className="text-sm font-medium">Berhasil diunggah!</p>
                        <p className="text-xs text-green-500 mt-1">Klik untuk unggah lagi</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center text-red-500">
                        <AlertCircle className="h-8 w-8 mb-2" />
                        <p className="text-sm font-medium">{error}</p>
                        <p className="text-xs mt-1">Klik untuk coba lagi</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-slate-500">
                        <Upload className="h-8 w-8 mb-2" />
                        <p className="text-sm font-medium text-slate-700">Klik atau tarik file ke sini</p>
                        <p className="text-xs mt-1">PDF, Gambar, atau Dokumen Office (Max 5MB)</p>
                    </div>
                )}
            </div>
        </div>
    );
}
