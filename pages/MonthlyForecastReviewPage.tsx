
import React, { useState, useMemo } from 'react';
import { useTranslation } from '../LanguageContext';
import { Project, ProjectBudget, Expenditure, PermissionActions } from '../types';

// Interfaces
interface MonthlyForecastReviewPageProps {
    projects: Project[];
    projectBudgets: ProjectBudget[];
    expenditures: Expenditure[];
    permissions: PermissionActions;
    logActivity: (args: any) => void;
}

interface ReportRow {
    projectId: string;
    projectName: string;
    lineCode: string;
    lineDescription: string;
    forecastAmount: number;
    totalBudget: number;
    totalSpent: number;
    remaining: number;
}

// Main Component
const MonthlyForecastReviewPage: React.FC<MonthlyForecastReviewPageProps> = ({ projects, projectBudgets, expenditures, permissions }) => {
    const { t, language } = useTranslation();

    const [filters, setFilters] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        projectId: 'ALL',
    });
    const [reportData, setReportData] = useState<ReportRow[] | null>(null);

    const availableYears = useMemo(() => {
        const years = new Set<number>();
        projects.forEach(p => {
            if (p.startDate) years.add(new Date(p.startDate).getFullYear());
            if (p.endDate) years.add(new Date(p.endDate).getFullYear());
        });
        if (years.size === 0) return [new Date().getFullYear()];
        const minYear = Math.min(...years);
        const maxYear = Math.max(...years);
        const yearArray = [];
        for (let y = minYear; y <= maxYear; y++) {
            yearArray.push(y);
        }
        return yearArray.sort((a, b) => b - a);
    }, [projects]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: name === 'year' || name === 'month' ? parseInt(value) : value }));
    };

    const handleGenerateReport = () => {
        const monthKey = `${filters.year}-${String(filters.month).padStart(2, '0')}`;
        const data: ReportRow[] = [];

        projectBudgets.forEach(budget => {
            if (filters.projectId !== 'ALL' && budget.projectId !== filters.projectId) {
                return;
            }

            const project = projects.find(p => p.id === budget.projectId);
            if (!project) return;

            budget.lines.forEach(line => {
                const forecastAmount = line.forecast?.[monthKey] ?? 0;

                if (forecastAmount > 0) {
                    const totalSpent = expenditures
                        .filter(e => e.budgetLineId === line.id)
                        .reduce((sum, e) => sum + e.originalAmount, 0);
                    
                    data.push({
                        projectId: project.id,
                        projectName: language === 'ar' ? project.nameAr : project.nameEn,
                        lineCode: line.code,
                        lineDescription: language === 'ar' ? line.descriptionAr : line.descriptionEn,
                        forecastAmount,
                        totalBudget: line.totalCost,
                        totalSpent,
                        remaining: line.totalCost - totalSpent,
                    });
                }
            });
        });
        setReportData(data);
    };

    const summary = useMemo(() => {
        if (!reportData) return null;
        const totalForecast = reportData.reduce((sum, row) => sum + row.forecastAmount, 0);
        const projectCount = new Set(reportData.map(row => row.projectId)).size;
        const lineCount = reportData.length;
        return { totalForecast, projectCount, lineCount };
    }, [reportData]);

    const formatNumber = (num: number) => num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-6">{t.monthlyForecastReview.title}</h1>

            <div className="p-4 bg-slate-50 border rounded-lg mb-6 space-y-4">
                <h3 className="text-lg font-bold text-slate-700">{t.monthlyForecastReview.filters}</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="text-sm font-medium text-slate-600 block mb-1">{t.monthlyForecastReview.selectYear}</label>
                        <select name="year" value={filters.year} onChange={handleFilterChange} className="form-input">
                            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-600 block mb-1">{t.monthlyForecastReview.selectMonth}</label>
                        <select name="month" value={filters.month} onChange={handleFilterChange} className="form-input">
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                <option key={m} value={m}>{new Date(0, m - 1).toLocaleString(language, { month: 'long' })}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-600 block mb-1">{t.monthlyForecastReview.selectProject}</label>
                        <select name="projectId" value={filters.projectId} onChange={handleFilterChange} className="form-input">
                            <option value="ALL">{t.monthlyForecastReview.allProjects}</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{language === 'ar' ? p.nameAr : p.nameEn}</option>)}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button onClick={handleGenerateReport} className="btn-primary w-full">{t.monthlyForecastReview.generateReport}</button>
                    </div>
                </div>
            </div>

            {reportData && summary && (
                <div>
                    <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg mb-4">
                        <h3 className="text-lg font-bold text-indigo-800 mb-2">
                            {t.monthlyForecastReview.summary.title
                                .replace('{month}', new Date(0, filters.month - 1).toLocaleString(language, { month: 'long' }))
                                .replace('{year}', filters.year.toString())
                            }
                        </h3>
                        <div className="grid grid-cols-3 gap-4 text-center">
                             <div>
                                <p className="text-2xl font-bold text-indigo-700">{formatNumber(summary.totalForecast)}</p>
                                <p className="text-sm text-slate-600">{t.monthlyForecastReview.summary.totalForecast}</p>
                            </div>
                             <div>
                                <p className="text-2xl font-bold text-indigo-700">{summary.projectCount}</p>
                                <p className="text-sm text-slate-600">{t.monthlyForecastReview.summary.projectCount}</p>
                            </div>
                             <div>
                                <p className="text-2xl font-bold text-indigo-700">{summary.lineCount}</p>
                                <p className="text-sm text-slate-600">{t.monthlyForecastReview.summary.lineCount}</p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto border rounded-lg">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-100 text-slate-800 uppercase">
                                <tr>
                                    <th className="p-3 text-left font-semibold">{t.monthlyForecastReview.table.project}</th>
                                    <th className="p-3 text-left font-semibold">{t.monthlyForecastReview.table.budgetLine}</th>
                                    <th className="p-3 text-right font-semibold">{t.monthlyForecastReview.table.forecastAmount}</th>
                                    <th className="p-3 text-right font-semibold">{t.monthlyForecastReview.table.totalBudget}</th>
                                    <th className="p-3 text-right font-semibold">{t.monthlyForecastReview.table.totalSpent}</th>
                                    <th className="p-3 text-right font-semibold">{t.monthlyForecastReview.table.remaining}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {reportData.map((row, index) => (
                                    <tr key={index} className="hover:bg-slate-50">
                                        <td className="p-3 font-medium text-slate-900">{row.projectName}</td>
                                        <td className="p-3 text-slate-700">{row.lineCode} - {row.lineDescription}</td>
                                        <td className="p-3 text-right font-mono font-bold text-blue-600">{formatNumber(row.forecastAmount)}</td>
                                        <td className="p-3 text-right font-mono text-slate-700">{formatNumber(row.totalBudget)}</td>
                                        <td className="p-3 text-right font-mono text-red-600">{formatNumber(row.totalSpent)}</td>
                                        <td className="p-3 text-right font-mono text-green-600">{formatNumber(row.remaining)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {reportData && reportData.length === 0 && (
                <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border">{t.monthlyForecastReview.noData}</div>
            )}

             <style>{`
                .form-input { width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background-color: #ffffff; color: #0f172a; }
                .btn-primary { padding: 0.75rem 1.5rem; background-color: #4f46e5; color: white; border-radius: 0.5rem; font-weight: 600; }
            `}</style>
        </div>
    );
};

export default MonthlyForecastReviewPage;
