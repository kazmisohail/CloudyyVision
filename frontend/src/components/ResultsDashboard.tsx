"use client";

import { useState } from 'react';
import Image from 'next/image';
import { AlertTriangle, ChevronDown, ChevronUp, Download, Zap } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import WeatherCard from './WeatherCard';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ResultsDashboardProps {
    originalImage: string | null;
    maskImage: string | null;
    mitigatedImage?: string | null;
    solarHeatmap?: string | null;
    percentages: {
        Clear: number;
        Shadow: number;
        "Thin Cloud": number;
        "Thick Cloud": number;
    } | null;
    hasShadow: boolean;
    geminiAnalysis?: string | null;
    onMitigate?: () => void;
    isMitigating?: boolean;
}

export default function ResultsDashboard({
    originalImage,
    maskImage,
    mitigatedImage,
    solarHeatmap,
    percentages,
    hasShadow,
    geminiAnalysis,
    onMitigate,
    isMitigating = false,
}: ResultsDashboardProps) {
    const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
    const [showSolarMap, setShowSolarMap] = useState(false);

    const chartData = percentages ? {
        labels: ['Clear', 'Shadow', 'Thin Cloud', 'Thick Cloud'],
        datasets: [
            {
                data: [percentages.Clear, percentages.Shadow, percentages['Thin Cloud'], percentages['Thick Cloud']],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)', // Clear - Greenish
                    'rgba(54, 162, 235, 0.6)', // Shadow - Blue
                    'rgba(255, 206, 86, 0.6)', // Thin - Yellow
                    'rgba(255, 255, 255, 0.6)', // Thick - White
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(255, 255, 255, 1)',
                ],
                borderWidth: 1,
            },
        ],
    } : null;

    const handleDownloadPDF = () => {
        const doc = new jsPDF();

        // Title
        doc.setFontSize(20);
        doc.setTextColor(34, 211, 238);
        doc.text('CloudVision Analysis Report', 20, 20);

        // Date
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);

        // Class Distribution
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text('Class Distribution:', 20, 45);

        if (percentages) {
            doc.setFontSize(11);
            doc.text(`Clear: ${percentages.Clear.toFixed(2)}%`, 30, 55);
            doc.text(`Shadow: ${percentages.Shadow.toFixed(2)}%`, 30, 62);
            doc.text(`Thin Cloud: ${percentages["Thin Cloud"].toFixed(2)}%`, 30, 69);
            doc.text(`Thick Cloud: ${percentages["Thick Cloud"].toFixed(2)}%`, 30, 76);
        }

        // AI Analysis
        doc.setFontSize(14);
        doc.text('Meteorological Intelligence (Gemini 2.5):', 20, 90);

        if (geminiAnalysis) {
            doc.setFontSize(10);
            const splitText = doc.splitTextToSize(geminiAnalysis, 170);
            doc.text(splitText, 20, 100);
        } else {
            doc.setFontSize(10);
            doc.text('AI analysis is being generated...', 20, 100);
        }

        // Save PDF
        doc.save('cloudvision_analysis_report.pdf');

        // Also download images
        if (maskImage) {
            const aMask = document.createElement('a');
            aMask.href = `data:image/png;base64,${maskImage}`;
            aMask.download = 'segmentation_mask.png';
            aMask.click();
        }

        if (originalImage) {
            const aOriginal = document.createElement('a');
            aOriginal.href = originalImage;
            aOriginal.download = 'original_image.png';
            aOriginal.click();
        }

        if (mitigatedImage) {
            const aMitigated = document.createElement('a');
            aMitigated.href = `data:image/png;base64,${mitigatedImage}`;
            aMitigated.download = 'mitigated_image.png';
            aMitigated.click();
        }

        if (solarHeatmap) {
            const aSolar = document.createElement('a');
            aSolar.href = `data:image/png;base64,${solarHeatmap}`;
            aSolar.download = 'solar_potential_map.png';
            aSolar.click();
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Shadow Alert */}
            {hasShadow && !mitigatedImage && onMitigate && (
                <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 flex items-center justify-between backdrop-blur-sm">
                    <div className="flex items-center space-x-3">
                        <AlertTriangle className="text-blue-400 h-6 w-6" />
                        <div>
                            <h3 className="font-semibold text-blue-100">Heavy Shadow Detected</h3>
                            <p className="text-sm text-blue-200/70">Shadow coverage exceeds 1.0%. AI mitigation is recommended.</p>
                        </div>
                    </div>
                    <button
                        onClick={onMitigate}
                        disabled={isMitigating}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm font-medium transition-colors flex items-center space-x-2"
                    >
                        {isMitigating ? (
                            <span>Processing...</span>
                        ) : (
                            <>
                                <Zap className="h-4 w-4" />
                                <span>Apply AI De-Shadowing</span>
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Solar Map Toggle */}
            <div className="flex justify-end">
                <button
                    onClick={() => setShowSolarMap(!showSolarMap)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${showSolarMap ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-slate-800 text-gray-400 hover:text-white border border-white/10'}`}
                >
                    {showSolarMap ? 'Hide Solar Potential' : 'Show Solar Potential Heatmap'}
                </button>
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Original */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-white/10">
                    <h3 className="text-lg font-medium text-gray-300 mb-3">Original Imagery</h3>
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-900">
                        {originalImage && (
                            <Image src={originalImage} alt="Original" fill className="object-cover" />
                        )}
                    </div>
                </div>

                {/* Mask / Solar Map */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-white/10 relative">
                    <h3 className="text-lg font-medium text-gray-300 mb-3">{showSolarMap ? 'Solar Potential Heatmap' : 'Segmentation Mask'}</h3>
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-900">
                        {showSolarMap && solarHeatmap ? (
                            <Image src={`data:image/png;base64,${solarHeatmap}`} alt="Solar Map" fill className="object-cover" />
                        ) : maskImage ? (
                            <Image src={`data:image/png;base64,${maskImage}`} alt="Mask" fill className="object-cover" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500 text-sm">No data generated</div>
                        )}
                    </div>
                    {!showSolarMap && (
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                            <span className="px-2 py-1 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">Clear</span>
                            <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">Shadow</span>
                            <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">Thin Cloud</span>
                            <span className="px-2 py-1 rounded bg-white/20 text-white border border-white/30">Thick Cloud</span>
                        </div>
                    )}
                    {showSolarMap && (
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                            <span className="px-2 py-1 rounded bg-red-500/20 text-red-300 border border-red-500/30">High (100%)</span>
                            <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">Medium (50%)</span>
                            <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">Low (10%)</span>
                        </div>
                    )}
                </div>

                {/* Mitigated */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-white/10">
                    <h3 className="text-lg font-medium text-gray-300 mb-3">Mitigated Output</h3>
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center">
                        {mitigatedImage ? (
                            <Image src={`data:image/png;base64,${mitigatedImage}`} alt="Mitigated" fill className="object-cover" />
                        ) : (
                            <div className="text-center p-6">
                                <p className="text-gray-500 text-sm">Mitigation not applied</p>
                                {!hasShadow && <p className="text-gray-600 text-xs mt-1">No significant shadows detected</p>}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Distribution Chart */}
                <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-medium text-gray-300 mb-6">Class Distribution</h3>
                    <div className="h-64 w-full flex items-center justify-center">
                        {chartData && <Doughnut data={chartData} options={{ plugins: { legend: { position: 'right', labels: { color: '#fff' } } } }} />}
                    </div>
                </div>

                {/* Gemini Insights */}
                <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10 flex flex-col">
                    <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setIsAnalysisOpen(!isAnalysisOpen)}
                    >
                        <h3 className="text-lg font-medium text-gray-300 flex items-center gap-2">
                            <Zap className="text-yellow-400 h-5 w-5" />
                            Meteorological Intelligence
                        </h3>
                        {isAnalysisOpen ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                    </div>

                    <div className={`mt-4 text-gray-300 text-sm leading-relaxed transition-all duration-300 ${isAnalysisOpen ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                        {geminiAnalysis ? (
                            <div className="prose prose-invert max-w-none">
                                <p>{geminiAnalysis}</p>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-32 text-gray-500">
                                Generating insights...
                            </div>
                        )}
                    </div>

                    {!isAnalysisOpen && geminiAnalysis && (
                        <p className="mt-2 text-gray-500 text-xs truncate">{geminiAnalysis}</p>
                    )}
                </div>
            </div>

            {/* Weather Intelligence Section */}
            <div className="mt-6">
                <WeatherCard percentages={percentages} />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
                <button
                    onClick={handleDownloadPDF}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 border border-white/10"
                >
                    <Download className="h-5 w-5" />
                    Download PDF Report & Images
                </button>
            </div>
        </div>
    );
}
