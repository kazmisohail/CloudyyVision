"use client";

import { useState, useCallback } from 'react';
import { Upload, FileImage } from 'lucide-react';

interface UploadZoneProps {
    onAnalyze: (file: File) => void;
    isAnalyzing: boolean;
}

export default function UploadZone({ onAnalyze, isAnalyzing }: UploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('image/') || file.name.toLowerCase().endsWith('.npy')) {
                setSelectedFile(file);
            }
        }
    }, []);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setSelectedFile(file);
        }
    }, []);

    const handleAnalyzeClick = () => {
        if (selectedFile) {
            onAnalyze(selectedFile);
        }
    };

    const isNpy = selectedFile?.name.toLowerCase().endsWith('.npy');

    return (
        <div className="w-full max-w-2xl mx-auto relative group space-y-6">
            <div className="relative w-full">
                {/* Animated Border Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt"></div>

                <div
                    className={`relative z-10 flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300 overflow-hidden ${isDragging
                        ? 'border-cyan-400 bg-cyan-900/20 backdrop-blur-sm'
                        : 'border-gray-600 bg-gray-900/60 hover:bg-gray-800/60 hover:border-gray-500 backdrop-blur-sm'
                        }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-upload')?.click()}
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 relative z-20">
                        {selectedFile ? (
                            <>
                                {isNpy ? (
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 mb-4 bg-slate-800 rounded-lg flex items-center justify-center border border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                                            <span className="text-cyan-400 font-mono font-bold text-xl">NPY</span>
                                        </div>
                                        <p className="mb-2 text-sm text-cyan-300 font-medium">Scientific Data File</p>
                                    </div>
                                ) : (
                                    <FileImage className="w-12 h-12 mb-4 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                                )}
                                <p className="mb-2 text-sm text-gray-200 font-medium">
                                    <span className="font-semibold text-cyan-400">Selected:</span> {selectedFile.name}
                                </p>
                                <p className="text-xs text-gray-400">Click to change file</p>
                            </>
                        ) : (
                            <>
                                <Upload className={`w-12 h-12 mb-4 transition-colors duration-300 ${isDragging ? 'text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'text-gray-400'}`} />
                                <p className="mb-2 text-sm text-gray-300">
                                    <span className="font-semibold text-cyan-400">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-400">PNG, JPG, TIFF or .NPY (Scientific Data)</p>
                            </>
                        )}
                    </div>
                    <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept="image/*,.npy"
                        onChange={handleFileInput}
                    />
                </div>
            </div>

            {/* Analyze Button */}
            <div className="flex justify-center">
                <button
                    onClick={handleAnalyzeClick}
                    disabled={!selectedFile || isAnalyzing}
                    className={`
                        px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all duration-300 flex items-center gap-2
                        ${!selectedFile || isAnalyzing
                            ? 'bg-slate-700 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/25 transform hover:-translate-y-0.5'
                        }
                    `}
                >
                    {isAnalyzing ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Analyzing...</span>
                        </>
                    ) : (
                        <>
                            <span>Analyze Image</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
