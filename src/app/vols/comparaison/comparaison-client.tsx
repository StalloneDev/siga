"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon, Filter, Search, Download } from "lucide-react";
import { getDailyComparisons, CompanyComparison, saveComparisonComment } from "./actions";
import * as XLSX from "xlsx";

export default function ComparaisonClient({
    initialDate,
    initialComparisons
}: {
    initialDate: string;
    initialComparisons: CompanyComparison[];
}) {
    const [selectedDate, setSelectedDate] = useState(initialDate);
    const [comparisons, setComparisons] = useState<CompanyComparison[]>(initialComparisons);
    const [comments, setComments] = useState<Record<number, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    // Initialize local comment states whenever comparisons data load
    useEffect(() => {
        const initialComments: Record<number, string> = {};
        comparisons.forEach(c => initialComments[c.companyId] = c.comment || "");
        setComments(initialComments);
    }, [comparisons]);

    const handleCommentChange = (companyId: number, value: string) => {
        setComments(prev => ({ ...prev, [companyId]: value }));
    };

    const handleCommentBlur = async (companyId: number) => {
        const commentToSave = comments[companyId] || "";
        const originalComment = comparisons.find(c => c.companyId === companyId)?.comment || "";

        if (commentToSave !== originalComment) {
            await saveComparisonComment(selectedDate, companyId, commentToSave);
            // Update the source of truth
            setComparisons(prev => prev.map(c => c.companyId === companyId ? { ...c, comment: commentToSave } : c));
        }
    };

    const handleExport = () => {
        const exportData = comparisons.map(c => ({
            "Company": c.companyName,
            "Forecasts (L)": c.forecasts,
            "Achievements (L)": c.achievements,
            "Variances (L)": c.variances,
            "Écart (%)": `${c.ecartPercentage}%`,
            "Comments": c.comment
        }));

        // Add total row
        const totalForecast = comparisons.reduce((sum, c) => sum + c.forecasts, 0);
        const totalAchievement = comparisons.reduce((sum, c) => sum + c.achievements, 0);
        const totalVariance = totalAchievement - totalForecast;
        const totalEcart = totalForecast > 0 ? Math.round((totalVariance / totalForecast) * 100) : 0;

        exportData.push({
            "Company": "TOTAL",
            "Forecasts (L)": totalForecast,
            "Achievements (L)": totalAchievement,
            "Variances (L)": totalVariance,
            "Écart (%)": `${totalEcart}%`,
            "Comments": ""
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Comparaison Vols");
        XLSX.writeFile(wb, `SIGA_Comparaison_Vols_${selectedDate}.xlsx`);
    };

    useEffect(() => {
        const fetchComparisons = async () => {
            setIsLoading(true);
            try {
                const data = await getDailyComparisons(selectedDate);
                setComparisons(data);
            } catch (error) {
                console.error("Failed to load comparisons");
            } finally {
                setIsLoading(false);
            }
        };

        if (selectedDate !== initialDate) {
            fetchComparisons();
        }
    }, [selectedDate, initialDate]);

    // Calculate totals
    const totalForecast = comparisons.reduce((sum, c) => sum + c.forecasts, 0);
    const totalAchievement = comparisons.reduce((sum, c) => sum + c.achievements, 0);
    const totalVariance = totalAchievement - totalForecast;
    const totalEcart = totalForecast > 0 ? Math.round((totalVariance / totalForecast) * 100) : 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Comparaison des Volumes d'Exploitation</h1>
                    <p className="text-slate-400 text-sm">Prévu vs Réel (Forecasts vs Achievements)</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-1.5 flex items-center shadow-inner">
                        <div className="flex items-center gap-2 px-3 py-1.5 border-r border-slate-800">
                            <CalendarIcon size={16} className="text-blue-500" />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="bg-transparent text-sm font-medium text-white focus:outline-none focus:ring-0 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                            />
                        </div>
                        <div className="px-4 py-1.5 text-sm font-bold text-blue-400 hidden md:block">
                            {format(new Date(selectedDate), "EEEE d MMMM yyyy", { locale: fr })}
                        </div>
                    </div>
                    <button
                        onClick={handleExport}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-3 rounded-lg border border-slate-700 transition-colors shadow-sm" title="Exporter">
                        <Download size={18} />
                    </button>
                </div>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-4 bg-slate-900/60 border-b border-slate-800 text-center">
                    <h2 className="text-xl font-black text-white uppercase tracking-wider">
                        COMPARISON OF FORECASTS AND ACHIEVEMENTS OF DAILY DELIVERIES
                    </h2>
                    <p className="text-red-500 font-bold text-lg mt-1">
                        {format(new Date(selectedDate), "dd/MM/yyyy")}
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#e4bba1] text-black">
                                <th className="border border-slate-700 px-4 py-3 font-bold">Company</th>
                                <th className="border border-slate-700 px-4 py-3 font-bold text-center">Forecasts<br />(L)</th>
                                <th className="border border-slate-700 px-4 py-3 font-bold text-center">Achievements<br />(L)</th>
                                <th className="border border-slate-700 px-4 py-3 font-bold text-center">Variances<br />(L)</th>
                                <th className="border border-slate-700 px-4 py-3 font-bold text-center">Écart (%)</th>
                                <th className="border border-slate-700 px-4 py-3 font-bold">Comments</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white text-black">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12">
                                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                                        <p className="mt-4 text-slate-500 font-medium">Chargement des comparaisons...</p>
                                    </td>
                                </tr>
                            ) : comparisons.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-slate-500 font-medium">
                                        Aucune donnée pour cette date.
                                    </td>
                                </tr>
                            ) : (
                                comparisons.map((comp) => (
                                    <tr key={comp.companyId} className="hover:bg-slate-50 transition-colors">
                                        <td className="border border-slate-300 px-4 py-3 font-medium">{comp.companyName}</td>
                                        <td className="border border-slate-300 px-4 py-3 text-right">
                                            {comp.forecasts.toLocaleString('fr-FR')}
                                        </td>
                                        <td className="border border-slate-300 px-4 py-3 text-right">
                                            {comp.achievements > 0 ? comp.achievements.toLocaleString('fr-FR') : '-'}
                                        </td>
                                        <td className="border border-slate-300 px-4 py-3 text-right">
                                            {comp.variances === 0 ? '-' : comp.variances.toLocaleString('fr-FR')}
                                        </td>
                                        <td className="border border-slate-300 px-4 py-3 text-center">
                                            <span className={comp.ecartPercentage < -30 ? "text-red-600 font-bold" : comp.ecartPercentage > 0 ? "text-green-600 font-bold" : ""}>
                                                {comp.ecartPercentage}%
                                            </span>
                                        </td>
                                        <td className="border border-slate-300 p-0">
                                            <input
                                                type="text"
                                                value={comments[comp.companyId] ?? ""}
                                                onChange={(e) => handleCommentChange(comp.companyId, e.target.value)}
                                                onBlur={() => handleCommentBlur(comp.companyId)}
                                                placeholder={comp.achievements === 0 && comp.forecasts > 0 ? "Ex: Vol annulé..." : "Ajouter un commentaire..."}
                                                className="w-full h-full min-h-[44px] px-4 py-2 bg-transparent text-sm focus:outline-none focus:bg-blue-50 focus:ring-1 focus:ring-inset focus:ring-blue-500 transition-colors placeholder:text-slate-300"
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        <tfoot className="bg-[#e4bba1] text-black">
                            <tr>
                                <td className="border border-slate-700 px-4 py-3 font-bold text-lg">Total</td>
                                <td className="border border-slate-700 px-4 py-3 text-right font-bold text-lg">
                                    {totalForecast.toLocaleString('fr-FR')}
                                </td>
                                <td className="border border-slate-700 px-4 py-3 text-right font-bold text-lg">
                                    {totalAchievement.toLocaleString('fr-FR')}
                                </td>
                                <td className="border border-slate-700 px-4 py-3 text-right font-bold text-lg">
                                    {totalVariance.toLocaleString('fr-FR')}
                                </td>
                                <td className="border border-slate-700 px-4 py-3 text-center font-bold text-lg">
                                    {totalEcart}%
                                </td>
                                <td className="border border-slate-700 px-4 py-3"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Empty grid for future charts / insights related to comparisons */}
            </div>
        </div>
    );
}
