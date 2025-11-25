import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from '../LanguageContext';
import { 
    Project, ProjectBudget, BudgetLine, PermissionActions, Expenditure
} from '../types';
import { useToast } from '../ToastContext';
import Modal from '../components/Modal';
import { PlusIcon, PencilIcon, TrashIcon } from '../components/icons';

interface ProjectBudgetsPageProps {
    projects: Project[];
    projectBudgets: ProjectBudget[];
    setProjectBudgets: React.Dispatch<React.SetStateAction<ProjectBudget[]>>;
    expenditures: Expenditure[];
    permissions: PermissionActions;
    logActivity: (args: any) => void;
}

interface AddCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (categoryName: string) => void;
}

const FormField: React.FC<{ label: string; children: React.ReactNode; required?: boolean }> = ({ label, children, required }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
    </div>
);

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ isOpen, onClose, onSave }) => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [name, setName] = useState('');

    const handleSave = () => {
        if (!name.trim()) {
            showToast(t.projectBudgets.addCategoryModal.nameRequired, 'error');
            return;
        }
        onSave(name.trim());
        setName('');
    };
    
    useEffect(() => {
        if (!isOpen) {
            setName('');
        }
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t.projectBudgets.addCategoryModal.title}>
            <div className="space-y-4">
                <FormField label={t.projectBudgets.addCategoryModal.categoryName} required>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="form-input"
                        autoFocus
                    />
                </FormField>
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button onClick={onClose} className="btn-secondary">{t.common.cancel}</button>
                    <button onClick={handleSave} className="btn-primary">{t.common.save}</button>
                </div>
            </div>
        </Modal>
    );
};

const ProjectBudgetsPage: React.FC<ProjectBudgetsPageProps> = ({ projects, projectBudgets, setProjectBudgets, expenditures, permissions, logActivity }) => {
    const { t, language } = useTranslation();
    const { showToast } = useToast();
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [editingBudget, setEditingBudget] = useState<ProjectBudget | null>(null);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

    const activeBudget = useMemo(() => 
        projectBudgets.find(b => b.projectId === selectedProjectId),
    [projectBudgets, selectedProjectId]);

    const handleCreateBudget = () => {
        if (!selectedProjectId) return;
        setEditingBudget({
            id: `budget-${Date.now()}`,
            projectId: selectedProjectId,
            lines: []
        });
    };
    
    const handleEditBudget = () => {
        if (activeBudget) {
            setEditingBudget(JSON.parse(JSON.stringify(activeBudget)));
        }
    };
    
    const handleSaveBudget = () => {
        if (!editingBudget) return;
        setProjectBudgets(prev => {
            const exists = prev.some(b => b.id === editingBudget.id);
            if (exists) {
                return prev.map(b => b.id === editingBudget.id ? editingBudget : b);
            }
            return [...prev, editingBudget];
        });
        logActivity({actionType: 'update', entityType: 'ProjectBudget', entityName: `Budget for project ${selectedProjectId}`});
        showToast(t.common.updatedSuccess, 'success');
        setEditingBudget(null);
    };

    const handleLineChange = useCallback((index: number, field: keyof BudgetLine, value: any) => {
        setEditingBudget(prev => {
            if (!prev) return null;
            const newLines = [...prev.lines];
            const line = { ...newLines[index] };
            (line as any)[field] = value;
            line.totalCost = (line.quantity || 0) * (line.unitCost || 0) * (line.duration || 1) * ((line.percentage || 100) / 100);
            newLines[index] = line;
            return { ...prev, lines: newLines };
        });
    }, []);

    const addLineItem = useCallback((category: string) => {
        setEditingBudget(prev => {
            if (!prev) return null;
            const newLine: BudgetLine = {
                id: `line-${Date.now()}`,
                category: category,
                code: '', descriptionAr: '', descriptionEn: '', unit: '', quantity: 1, unitCost: 0, duration: 1, percentage: 100, totalCost: 0
            };
            return { ...prev, lines: [...prev.lines, newLine] };
        });
    }, []);

    const removeLineItem = useCallback((id: string) => {
        setEditingBudget(prev => {
            if (!prev) return null;
            return { ...prev, lines: prev.lines.filter((l: BudgetLine) => l.id !== id) };
        });
        showToast(t.common.deletedSuccess, 'success');
    }, [showToast, t.common.deletedSuccess]);
    
    const removeCategory = useCallback((category: string) => {
        setEditingBudget(prev => {
            if (!prev) return null;
            return { ...prev, lines: prev.lines.filter(l => l.category !== category) };
        });
        showToast(t.common.deletedSuccess, 'success');
    }, [showToast, t.common.deletedSuccess]);

    const handleAddCategory = (categoryName: string) => {
        if (editingBudget && !editingBudget.lines.some(l => l.category === categoryName)) {
             addLineItem(categoryName); // Add a line to create the category section
        }
        setIsCategoryModalOpen(false);
    };

    const budgetData = useMemo(() => {
        const budgetToDisplay = editingBudget || activeBudget;
        if (!budgetToDisplay) return { categories: {}, grandTotal: { total: 0, spent: 0, remaining: 0 } };

        const categoryMap: Record<string, { lines: any[], total: number, spent: number, remaining: number }> = {};
        
        budgetToDisplay.lines.forEach(line => {
            if (!categoryMap[line.category]) {
                categoryMap[line.category] = { lines: [], total: 0, spent: 0, remaining: 0 };
            }
            const spent = expenditures.filter(e => e.budgetLineId === line.id).reduce((sum, e) => sum + e.originalAmount, 0);
            const remaining = line.totalCost - spent;
            
            categoryMap[line.category].lines.push({ ...line, spent, remaining });
            categoryMap[line.category].total += line.totalCost;
            categoryMap[line.category].spent += spent;
            categoryMap[line.category].remaining += remaining;
        });

        const grandTotal = Object.values(categoryMap).reduce((acc, cat) => {
            acc.total += cat.total;
            acc.spent += cat.spent;
            acc.remaining += cat.remaining;
            return acc;
        }, { total: 0, spent: 0, remaining: 0 });

        return { categories: categoryMap, grandTotal };

    }, [activeBudget, editingBudget, expenditures]);

    const inputClasses = "w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:cursor-not-allowed";
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
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
             <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-6">{t.nav.projectBudgets}</h1>
            
            <div className="mb-6 p-4 bg-slate-50 border rounded-lg">
                <FormField label={t.projectBudgets.selectProject}>
                    <select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} className="form-input">
                        <option value="">-- {t.projects.selectProject} --</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{language === 'ar' ? p.nameAr : p.nameEn}</option>)}
                    </select>
                </FormField>
            </div>

            {selectedProjectId && (
                <div>
                    {!activeBudget && !editingBudget && (
                        <div className="text-center py-12">
                            <p className="text-slate-500 mb-4">{t.projectBudgets.noBudget}</p>
                            <button onClick={handleCreateBudget} disabled={!permissions.create} className="btn-primary">{t.projectBudgets.createBudget}</button>
                        </div>
                    )}
                    {(activeBudget || editingBudget) && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-slate-800">{t.projectBudgets.budgetFor} "{projects.find(p=>p.id===selectedProjectId)?.nameEn}"</h2>
                                {editingBudget ? (
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditingBudget(null)} className="btn-secondary">{t.common.cancel}</button>
                                        <button onClick={handleSaveBudget} className="btn-primary">{t.projectBudgets.saveBudget}</button>
                                    </div>
                                ) : (
                                    <button onClick={handleEditBudget} disabled={!permissions.update} className="btn-primary flex items-center gap-2">
                                        <PencilIcon/> {t.projectBudgets.editBudget}
                                    </button>
                                )}
                            </div>
                            
                            <div className="overflow-x-auto border rounded-lg">
                                <table className="w-full text-xs">
                                     <thead className="bg-slate-100 text-slate-600 uppercase">
                                        <tr>
                                            {Object.values(t.projectBudgets.headers).map(h => <th key={h as string} className="p-2 text-left font-semibold">{h as string}</th>)}
                                            {editingBudget && <th></th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {/* FIX: Cast `data` to any to resolve type inference issue. */}
                                        {Object.entries(budgetData.categories).map(([category, data]: [string, any]) => (
                                            <React.Fragment key={category}>
                                                <tr className="bg-slate-200 font-bold">
                                                    <td className="p-2 text-slate-800" colSpan={editingBudget ? 9 : 8}>
                                                        <div className="flex justify-between items-center">
                                                            {category}
                                                            {editingBudget && <button onClick={() => removeCategory(category)} className="text-red-500"><TrashIcon/></button>}
                                                        </div>
                                                    </td>
                                                    <td className="p-2 text-right text-slate-800">{data.total.toFixed(2)}</td>
                                                    <td className="p-2 text-right text-red-600">{data.spent.toFixed(2)}</td>
                                                    <td className="p-2 text-right text-green-600">{data.remaining.toFixed(2)}</td>
                                                    {editingBudget && <td></td>}
                                                </tr>
                                                {/* FIX: Property 'lines' does not exist on type 'unknown'. */}
                                                {(data as any).lines.map((line: any, index: number) => (
                                                    <tr key={line.id} className="hover:bg-slate-50 group">
                                                        <td><input value={line.code} onChange={e => handleLineChange(index, 'code', e.target.value)} readOnly={!editingBudget} className="form-input"/></td>
                                                        <td><input value={language === 'ar' ? line.descriptionAr : line.descriptionEn} onChange={e => handleLineChange(index, language==='ar' ? 'descriptionAr' : 'descriptionEn', e.target.value)} readOnly={!editingBudget} className="form-input"/></td>
                                                        <td><input value={line.unit} onChange={e => handleLineChange(index, 'unit', e.target.value)} readOnly={!editingBudget} className="form-input"/></td>
                                                        <td><input type="number" value={line.quantity} onChange={e => handleLineChange(index, 'quantity', parseFloat(e.target.value))} readOnly={!editingBudget} className="form-input"/></td>
                                                        <td><input type="number" value={line.unitCost} onChange={e => handleLineChange(index, 'unitCost', parseFloat(e.target.value))} readOnly={!editingBudget} className="form-input"/></td>
                                                        <td><input type="number" value={line.duration} onChange={e => handleLineChange(index, 'duration', parseFloat(e.target.value))} readOnly={!editingBudget} className="form-input"/></td>
                                                        <td><input type="number" value={line.percentage} onChange={e => handleLineChange(index, 'percentage', parseFloat(e.target.value))} readOnly={!editingBudget} className="form-input"/></td>
                                                        <td className="p-2 text-right font-mono">{line.totalCost.toFixed(2)}</td>
                                                        <td className="p-2 text-right font-mono text-red-600">{line.spent.toFixed(2)}</td>
                                                        <td className="p-2 text-right font-mono text-green-600">{line.remaining.toFixed(2)}</td>
                                                        {editingBudget && <td><button onClick={()=>removeLineItem(line.id)} className="text-red-500"><TrashIcon/></button></td>}
                                                    </tr>
                                                ))}
                                                {editingBudget && (
                                                    <tr>
                                                        <td colSpan={12} className="p-2">
                                                            <button onClick={() => addLineItem(category)} className="text-indigo-600 text-xs font-semibold flex items-center gap-1"><PlusIcon/>{t.projectBudgets.addLine}</button>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-slate-200 font-bold">
                                            <td className="p-2" colSpan={7}>{t.projectBudgets.grandTotal}</td>
                                            {/* FIX: Cast `grandTotal` properties to any to resolve type inference issue. */}
                                            <td className="p-2 text-right">{(budgetData.grandTotal as any).total.toFixed(2)}</td>
                                            <td className="p-2 text-right text-red-600">{(budgetData.grandTotal as any).spent.toFixed(2)}</td>
                                            <td className="p-2 text-right text-green-600">{(budgetData.grandTotal as any).remaining.toFixed(2)}</td>
                                            {editingBudget && <td></td>}
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            {editingBudget && <button onClick={()=>setIsCategoryModalOpen(true)} className="mt-4 text-indigo-600 font-semibold flex items-center gap-2"><PlusIcon/>{t.projectBudgets.addCategory}</button>}
                        </div>
                    )}
                </div>
            )}
             <AddCategoryModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} onSave={handleAddCategory} />
        </div>
    );
};

export default ProjectBudgetsPage;