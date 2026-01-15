'use client';

import { UploadDropzone } from "@/lib/uploadthing";
import { OurFileRouter } from "@/server/uploadthing";
import { X, FileIcon, ImageIcon, Loader2, Download } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./button";

interface FileUploadProps {
    onChange: (url?: string) => void;
    value: string;
    endpoint: keyof OurFileRouter;
}

export const FileUpload = ({
    onChange,
    value,
    endpoint
}: FileUploadProps) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const fileType = value?.split(".").pop();

    if (value && (fileType === "pdf" || fileType === "docx" || fileType === "xlsx")) {
        return (
            <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10 border border-gold/20">
                <FileIcon className="h-10 w-10 fill-gold stroke-gold" />
                <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-sm font-medium text-gold hover:underline"
                >
                    {value}
                </a>
                <div className="absolute -top-2 -right-2 flex gap-1">
                    <button
                        onClick={() => {
                            const link = document.createElement('a');
                            link.href = value;
                            link.download = value.split('/').pop() || 'file';
                            link.click();
                        }}
                        className="bg-blue-500 text-white p-1 rounded-full shadow-sm hover:bg-blue-600 transition-colors"
                        type="button"
                    >
                        <Download className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onChange("")}
                        className="bg-rose-500 text-white p-1 rounded-full shadow-sm hover:bg-rose-600 transition-colors"
                        type="button"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        );
    }

    if (value) {
        return (
            <div className="relative h-40 w-40 mt-2">
                <Image
                    fill
                    src={value}
                    alt="Upload"
                    className="rounded-xl object-cover border-2 border-gold/20 shadow-lg"
                />
                <div className="absolute -top-2 -right-2 flex gap-1">
                    <button
                        onClick={() => {
                            window.open(value, '_blank');
                        }}
                        className="bg-blue-500 text-white p-1 rounded-full shadow-sm hover:bg-blue-600 transition-colors"
                        type="button"
                        title="Download / View"
                    >
                        <Download className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onChange("")}
                        className="bg-rose-500 text-white p-1 rounded-full shadow-sm hover:bg-rose-600 transition-colors"
                        type="button"
                        title="Delete"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <UploadDropzone
            endpoint={endpoint}
            onClientUploadComplete={(res) => {
                onChange(res?.[0].url);
                toast.success("File berhasil diunggah");
            }}
            onUploadError={(error: Error) => {
                toast.error(`${error?.message}`);
            }}
            className="border-2 border-dashed border-gold/20 bg-void/50 ut-label:text-gold ut-button:bg-gold ut-button:text-black ut-allowed-content:text-muted-foreground rounded-2xl h-40"
        />
    );
};
