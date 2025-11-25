
import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from '../LanguageContext';
import { 
    Project, ProjectBudget, BudgetLine, PermissionActions, Expenditure
} from '../types';
import { useToast } from '../ToastContext';
import { PencilIcon, FinanceIcon } from '../components/icons';

// #region Interfaces
interface BudgetForecastPageProps {
    projects: Project[];
    projectBudgets: ProjectBudget[];
    setProjectBudgets: React.Dispatch<React.SetStateAction<ProjectBudget[]>>;
    expenditures: Expenditure[];
    permissions: PermissionActions;
    logActivity: (args: any) => void;
}
// #endregion

// #region Helper Components
const FormField: React.FC<{ label: string; children: React.ReactNode; required?: boolean }> = ({ label, children, required }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
    </div>
);
// #endregion

const BudgetForecastPage: React.FC<BudgetForecastPageProps> = ({ projects, projectBudgets, setProjectBudgets, expenditures, permissions, logActivity }) => {
    const { t, language } = useTranslation();
    const { showToast } = useToast();
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [editingForecast, setEditingForecast] = useState<Record<string, Record<string, number>> | null>(null);

    const activeProject = useMemo(() => projects.find(p => p.id === selectedProjectId), [projects, selectedProjectId]);
    const activeBudget = useMemo(() => projectBudgets.find(b => b.projectId === selectedProjectId), [projectBudgets, selectedProjectId]);
    
    const monthColumns = useMemo(() => {
        if (!activeProject || !activeProject.startDate || !activeProject.endDate) return [];
        const start = new Date(activeProject.startDate);
        const end = new Date(activeProject.endDate);
        const months = [];
        
        let current = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
        const finalValidDate = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));

        while (current <= finalValidDate) {
            if (current.getUTCFullYear() === finalValidDate.getUTCFullYear() && 
                current.getUTCMonth() === finalValidDate.getUTCMonth() && 
                finalValidDate.getUTCDate() === 1 &&
                !(start.getUTCFullYear() === end.getUTCFullYear() && start.getUTCMonth() === end.getUTCMonth())) 
            {
                break;
            }
            months.push(new Date(current));
            current.setUTCMonth(current.getUTCMonth() + 1);
        }
        return months;
    }, [activeProject]);
    
    const processedBudgetData = useMemo(() => {
        if (!activeBudget) return null;

        const lines = activeBudget.lines.map(line => {
            const spent = expenditures.filter(e => e.budgetLineId === line.id).reduce((sum, e) => sum + e.originalAmount, 0);
            const remaining = line.totalCost - spent;
            const spendingPercentage = line.totalCost > 0 ? (spent / line.totalCost) * 100 : 0;
            const forecastSource = editingForecast ? editingForecast[line.id] : line.forecast;
            const totalForecast = (Object.values(forecastSource || {}) as number[]).reduce((sum, val) => sum + Number(val || 0), 0);
            const forecastPlusSpent = totalForecast + spent;
            const budgetVariation = line.totalCost - forecastPlusSpent;
            const variationPercentage = line.totalCost > 0 ? (budgetVariation / line.totalCost) * 100 : 0;

            return {
                ...line,
                spent,
                remaining,
                spendingPercentage,
                totalForecast,
                forecastPlusSpent,
                budgetVariation,
                variationPercentage
            };
        });

        const totals = lines.reduce((acc, line) => {
            acc.totalBudget += line.totalCost;
            acc.expenditures += line.spent;
            acc.remaining += line.remaining;
            acc.totalForecast += line.totalForecast;
            acc.forecastPlusSpent += line.forecastPlusSpent;
            acc.budgetVariation += line.budgetVariation;
            return acc;
        }, { totalBudget: 0, expenditures: 0, remaining: 0, totalForecast: 0, forecastPlusSpent: 0, budgetVariation: 0 } as any);

        totals.spendingPercentage = totals.totalBudget > 0 ? (totals.expenditures / totals.totalBudget) * 100 : 0;
        totals.variationPercentage = totals.totalBudget > 0 ? (totals.budgetVariation / totals.totalBudget) * 100 : 0;

        const monthlyTotals = monthColumns.reduce((acc, month) => {
            const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
            acc[monthKey] = lines.reduce((sum, line) => {
                 const forecastSource = editingForecast ? editingForecast[line.id] : line.forecast;
                 return sum + Number(forecastSource?.[monthKey] || 0);
            }, 0);
            return acc;
        }, {} as Record<string, number>);

        return { lines, totals, monthlyTotals };

    }, [activeBudget, expenditures, editingForecast, monthColumns]);

    const handleEditForecast = () => {
        if (!activeBudget) return;
        const initialForecasts: Record<string, Record<string, number>> = {};
        activeBudget.lines.forEach(line => {
            initialForecasts[line.id] = { ...line.forecast };
        });
        setEditingForecast(initialForecasts);
    };
    
    const handleSaveForecast = () => {
        if (!editingForecast || !activeBudget) return;
        const updatedLines = activeBudget.lines.map(line => ({
            ...line,
            forecast: editingForecast[line.id] || {}
        }));
        const updatedBudget = { ...activeBudget, lines: updatedLines };
        setProjectBudgets(prev => prev.map(b => b.id === activeBudget.id ? updatedBudget : b));
        logActivity({actionType: 'update', entityType: 'BudgetForecast', entityName: `Forecast for project ${selectedProjectId}`});
        showToast(t.common.updatedSuccess, 'success');
        setEditingForecast(null);
    };

    const handleForecastChange = (lineId: string, monthKey: string, value: string) => {
        const amount = parseFloat(value) || 0;
        setEditingForecast(prev => {
            if (!prev) return null;
            return {
                ...prev,
                [lineId]: {
                    ...(prev[lineId] || {}),
                    [monthKey]: amount,
                }
            };
        });
    };

    const formatNumber = (num: number) => num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const formatPercent = (num: number) => `${num.toFixed(1)}%`;
    
    return (
        <div className="bg-slate-50 p-0 sm:p-0 -m-4 md:-m-6">
            <style>{`
                .form-input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.375rem; background-color: #ffffff; color: #0f172a; transition: background-color .15s, border-color .15s; }
                .form-input:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 1px #4f46e5; }
                .form-input:read-only, .form-input:disabled { background-color: #f1f5f9; cursor: not-allowed; }
                .btn-primary { padding: 0.625rem 1.25rem; background-color: #4f46e5; color: white; border-radius: 0.5rem; font-weight: 600; transition: background-color .15s; }
                .btn-primary:hover { background-color: #4338ca; }
                .btn-primary:disabled { background-color: #a5b4fc; cursor: not-allowed; }
                .btn-secondary { padding: 0.625rem 1.25rem; background-color: #e2e8f0; color: #1e293b; border-radius: 0.5rem; font-weight: 600; transition: background-color .15s; }
                .btn-secondary:hover { background-color: #cbd5e1; }
            `}</style>
            <div className="flex items-center gap-4 mb-6 pb-4 border-b bg-white p-6 rounded-t-xl">
                 <div className="p-3 bg-cyan-100 rounded-lg"><FinanceIcon className="w-8 h-8 text-cyan-700"/></div>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{t.nav.budgetForecast}</h1>
            </div>

            <div className="px-6 space-y-6">
                <div className="p-4 bg-white border rounded-lg shadow-sm">
                    <FormField label={t.projectBudgets.selectProject}>
                        <select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} className="form-input">
                            <option value="">-- {t.projects.selectProject} --</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{language === 'ar' ? p.nameAr : p.nameEn}</option>)}
                        </select>
                    </FormField>
                </div>

                {selectedProjectId && (
                    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-slate-800">{t.nav.budgetForecast}</h3>
                            {editingForecast ? (
                                <div className="flex gap-2">
                                    <button onClick={() => setEditingForecast(null)} className="btn-secondary">{t.common.cancel}</button>
                                    <button onClick={handleSaveForecast} className="btn-primary">{t.finance.forecast.saveForecast}</button>
                                </div>
                            ) : (
                                <button onClick={handleEditForecast} disabled={!permissions.update || !activeBudget} className="btn-primary flex items-center gap-2"><PencilIcon/>{t.finance.forecast.editForecast}</button>
                            )}
                        </div>
                        {processedBudgetData && activeBudget ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-xs">
                                    <thead>
                                        <tr className="bg-slate-100 text-slate-800 uppercase">
                                            <th className="p-2 text-left font-semibold sticky left-0 bg-slate-100 z-10 w-64">{t.finance.forecast.budgetLine}</th>
                                            <th className="p-2 text-right font-semibold">{t.finance.forecast.totalBudget}</th>
                                            <th className="p-2 text-right font-semibold">{t.finance.forecast.expenditures}</th>
                                            <th className="p-2 text-right font-semibold">{t.finance.forecast.remaining}</th>
                                            <th className="p-2 text-right font-semibold">{t.finance.forecast.spendingPercentage}</th>
                                            {monthColumns.map(m => <th key={m.toISOString()} className="p-2 text-right font-semibold min-w-[120px]">{m.toLocaleString(language, {month: 'short', year: 'numeric'})}</th>)}
                                            <th className="p-2 text-right font-semibold">{t.finance.forecast.totalForecast}</th>
                                            <th className="p-2 text-right font-semibold">{t.finance.forecast.forecastPlusSpent}</th>
                                            <th className="p-2 text-right font-semibold">{t.finance.forecast.budgetVariation}</th>
                                            <th className="p-2 text-right font-semibold">{t.finance.forecast.variationPercentage}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {processedBudgetData.lines.map(line => {
                                            const forecastSource = editingForecast ? editingForecast[line.id] : line.forecast;
                                            return (
                                                <tr key={line.id} className="hover:bg-slate-50 group">
                                                    <td className="p-2 font-medium text-slate-800 sticky left-0 bg-white group-hover:bg-slate-50 z-10 w-64">{line.code} - {language === 'ar' ? line.descriptionAr : line.descriptionEn}</td>
                                                    <td className="p-2 text-right font-mono text-slate-800">{formatNumber(line.totalCost)}</td>
                                                    <td className="p-2 text-right font-mono text-red-600 font-semibold">{formatNumber(line.spent)}</td>
                                                    <td className="p-2 text-right font-mono text-slate-800">{formatNumber(line.remaining)}</td>
                                                    <td className="p-2 text-right font-mono text-slate-800">{formatPercent(line.spendingPercentage)}</td>
                                                    {monthColumns.map(m => {
                                                        const monthKey = `${m.getFullYear()}-${String(m.getMonth()+1).padStart(2, '0')}`;
                                                        return (
                                                            <td key={monthKey} className="p-2 text-right">
                                                                {editingForecast ? (
                                                                    <input type="number" value={editingForecast[line.id]?.[monthKey] || ''} onChange={e => handleForecastChange(line.id, monthKey, e.target.value)} className="form-input text-xs text-right w-28" placeholder="0.00"/>
                                                                ) : (<span className="font-mono text-slate-800">{formatNumber(Number(forecastSource?.[monthKey] || 0))}</span>)}
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="p-2 text-right font-mono text-blue-600 font-semibold">{formatNumber(line.totalForecast)}</td>
                                                    <td className="p-2 text-right font-mono text-slate-800">{formatNumber(line.forecastPlusSpent)}</td>
                                                    <td className={`p-2 text-right font-mono font-bold ${line.budgetVariation < 0 ? 'text-red-600' : 'text-green-600'}`}>{formatNumber(line.budgetVariation)}</td>
                                                    <td className={`p-2 text-right font-mono font-bold ${line.variationPercentage < 0 ? 'text-red-600' : 'text-green-600'}`}>{formatPercent(line.variationPercentage)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                     {processedBudgetData.totals && (
                                        <tfoot className="bg-slate-200 font-bold text-slate-900">
                                            <tr>
                                                <td className="p-3 text-left sticky left-0 bg-slate-200 z-10">{t.finance.forecast.totals}</td>
                                                <td className="p-3 text-right font-mono">{formatNumber(processedBudgetData.totals.totalBudget)}</td>
                                                <td className="p-3 text-right font-mono text-red-600">{formatNumber(processedBudgetData.totals.expenditures)}</td>
                                                <td className="p-3 text-right font-mono">{formatNumber(processedBudgetData.totals.remaining)}</td>
                                                <td className="p-3 text-right font-mono">{formatPercent(processedBudgetData.totals.spendingPercentage)}</td>
                                                {monthColumns.map(m => {
                                                    const monthKey = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`;
                                                    return (<td key={monthKey} className="p-3 text-right font-mono">{formatNumber(processedBudgetData.monthlyTotals[monthKey] || 0)}</td>);
                                                })}
                                                <td className="p-3 text-right font-mono text-blue-600">{formatNumber(processedBudgetData.totals.totalForecast)}</td>
                                                <td className="p-3 text-right font-mono">{formatNumber(processedBudgetData.totals.forecastPlusSpent)}</td>
                                                <td className={`p-3 text-right font-mono ${processedBudgetData.totals.budgetVariation < 0 ? 'text-red-600' : 'text-green-600'}`}>{formatNumber(processedBudgetData.totals.budgetVariation)}</td>
                                                <td className={`p-3 text-right font-mono ${processedBudgetData.totals.variationPercentage < 0 ? 'text-red-600' : 'text-green-600'}`}>{formatPercent(processedBudgetData.totals.variationPercentage)}</td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        ) : <div className="text-center py-12 text-slate-500">{t.projectBudgets.noBudget}</div>}
                    </div>
                )}
                 {!selectedProjectId && <div className="text-center py-12 text-slate-500 bg-white rounded-lg border">{t.finance.forecast.noProjectSelected}</div>}
            </div>
        </div>
    );
};

export default BudgetForecastPage;
