import React, { useState, useEffect, useMemo } from 'react';
import { ProcurementPlan, ProcurementPlanDetail, Project, PermissionActions, PurchaseRequestMethod, ProcurementPlanItemStatus } from '../types';
import { useTranslation } from '../LanguageContext';
import { useToast } from '../ToastContext';
import { PlusIcon, TrashIcon } from '../components/icons';

interface ProcurementPlanPageProps {
  procurementPlans: ProcurementPlan[];
  setProcurementPlans: React.Dispatch<React.SetStateAction<ProcurementPlan[]>>;
  projects: Project[];
  permissions: PermissionActions;
  logActivity: (args: { actionType: 'create' | 'update' | 'delete'; entityType: string; entityName: string; }) => void;
}

const getInitialFormState = (planId: number): Omit<ProcurementPlan, 'id'> => ({
    planId,
    projectId: '',
    fromDate: '',
    toDate: '',
    note: '',
    details: [],
});

const getInitialDetailState = (): Omit<ProcurementPlanDetail, 'id'> => ({
    budgetCode: '',
    item: '',
    description: '',
    unit: '',
    currency: 'USD',
    estimatedCost: 0,
    quantity: 0,
    procurementMethod: PurchaseRequestMethod.QUOTATION,
    publicationDate: '',
    deliveryDate: '',
    status: 'PENDING',
});

const FormField: React.FC<{ label: string; children: React.ReactNode; required?: boolean }> = ({ label, children, required }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
    </div>
);

const ProcurementPlanPage: React.FC<ProcurementPlanPageProps> = ({ procurementPlans, setProcurementPlans, projects, permissions, logActivity }) => {
    const { t, language } = useTranslation();
    const { showToast } = useToast();
    
    const [mode, setMode] = useState<'new' | 'view' | 'edit'>('new');
    const [selectedPlanId, setSelectedPlanId] = useState<string>('');
    const [formData, setFormData] = useState<Omit<ProcurementPlan, 'id'>>(() => getInitialFormState(procurementPlans.length + 1));
    
    useEffect(() => {
        if (selectedPlanId) {
            const plan = procurementPlans.find(p => p.id === selectedPlanId);
            if (plan) {
                setFormData(plan);
                setMode('view');
            }
        } else {
            const nextPlanId = procurementPlans.length > 0 ? Math.max(...procurementPlans.map(p => p.planId)) + 1 : 1;
            setFormData(getInitialFormState(nextPlanId));
            setMode('new');
        }
    }, [selectedPlanId, procurementPlans]);

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedPlanId(e.target.value);
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };
    
    const handleDetailChange = (index: number, field: keyof ProcurementPlanDetail, value: any) => {
        const newDetails = [...formData.details];
        (newDetails[index] as any)[field] = value;
        setFormData(prev => ({...prev, details: newDetails}));
    };
    
    const addDetailRow = () => {
        const newDetail: ProcurementPlanDetail = { id: `detail-${Date.now()}`, ...getInitialDetailState() };
        setFormData(prev => ({...prev, details: [...prev.details, newDetail]}));
    };
    
    const removeDetailRow = (index: number) => {
        setFormData(prev => ({...prev, details: prev.details.filter((_, i) => i !== index)}));
    };

    const handleAction = (action: 'new' | 'save' | 'edit' | 'delete') => {
        if (action === 'new') {
            setSelectedPlanId('');
            setMode('new');
            return;
        }

        if (action === 'save') {
            if (!formData.projectId || !formData.fromDate || !formData.toDate) {
                showToast(t.common.fillRequiredFields, 'error');
                return;
            }

            if (mode === 'new') {
                const newPlan: ProcurementPlan = { id: `pp-${Date.now()}`, ...formData };
                setProcurementPlans(prev => [...prev, newPlan]);
                logActivity({actionType: 'create', entityType: 'ProcurementPlan', entityName: `Plan #${newPlan.planId}`});
                setSelectedPlanId(newPlan.id);
                showToast(t.common.createdSuccess, 'success');
            } else if (mode === 'edit') {
                setProcurementPlans(prev => prev.map(p => p.id === selectedPlanId ? {id: p.id, ...formData} : p));
                logActivity({actionType: 'update', entityType: 'ProcurementPlan', entityName: `Plan #${formData.planId}`});
                setMode('view');
                showToast(t.common.updatedSuccess, 'success');
            }
        }
        
        if (!selectedPlanId) return;

        if (action === 'edit') setMode('edit');

        if (action === 'delete') {
            logActivity({actionType: 'delete', entityType: 'ProcurementPlan', entityName: `Plan #${formData.planId}`});
            setProcurementPlans(prev => prev.filter(p => p.id !== selectedPlanId));
            setSelectedPlanId('');
            showToast(t.common.deletedSuccess, 'success');
        }
    };

    const isReadOnly = mode === 'view' || !permissions.update;
    const inputClasses = `w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-slate-900 transition focus:ring-2 focus:ring-indigo-500 read-only:bg-slate-100 disabled:bg-slate-100`;
    const baseButtonClass = "px-6 py-2.5 text-white font-semibold rounded-md shadow-sm transition-colors disabled:bg-slate-400";
    
    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-6">{t.procurementPlans.title}</h1>
            
            <div className="mb-6 p-4 bg-slate-50 border rounded-lg">
                <FormField label={t.procurementPlans.selectPlan}>
                    <select value={selectedPlanId} onChange={handleSelectChange} className={inputClasses}>
                        <option value="">{t.procurementPlans.selectPlanPlaceholder}</option>
                        {procurementPlans.map(p => <option key={p.id} value={p.id}>Plan #{p.planId}</option>)}
                    </select>
                </FormField>
            </div>
            
            <div className="space-y-5 border-t pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end bg-slate-50 p-4 rounded-lg border">
                    <FormField label={t.procurementPlans.planId}>
                        <input type="text" value={formData.planId} readOnly className={`${inputClasses} bg-slate-200`} />
                    </FormField>
                    <FormField label={t.procurementPlans.projectId} required>
                        <select name="projectId" value={formData.projectId} onChange={handleInputChange} disabled={isReadOnly} className={inputClasses}>
                            <option value="">-- {t.projects.selectProject} --</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{language === 'ar' ? p.nameAr : p.nameEn}</option>)}
                        </select>
                    </FormField>
                    <FormField label={t.procurementPlans.fromDate} required><input type="date" name="fromDate" value={formData.fromDate} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} /></FormField>
                    <FormField label={t.procurementPlans.toDate} required><input type="date" name="toDate" value={formData.toDate} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} /></FormField>
                    <div className="lg:col-span-4">
                        <FormField label={t.procurementPlans.note}><textarea name="note" value={formData.note} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} rows={2}></textarea></FormField>
                    </div>
                </div>

                <div className="pt-4">
                    <h3 className="text-xl font-semibold text-indigo-700 mb-3">{t.procurementPlans.details}</h3>
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-100 text-slate-700 font-semibold">
                                <tr>
                                    <th className="p-2 text-left">{t.procurementPlans.budgetCode}</th>
                                    <th className="p-2 text-left">{t.procurementPlans.item}</th>
                                    <th className="p-2 text-left">{t.procurementPlans.descriptionOfActivity}</th>
                                    <th className="p-2 text-left">{t.procurementPlans.unit}</th>
                                    <th className="p-2 text-left">{t.procurementPlans.currency}</th>
                                    <th className="p-2 text-left">{t.procurementPlans.estimatedCost}</th>
                                    <th className="p-2 text-left">{t.procurementPlans.quantity}</th>
                                    <th className="p-2 text-left">{t.procurementPlans.totalAmount}</th>
                                    <th className="p-2 text-left">{t.procurementPlans.procurementMethod}</th>
                                    <th className="p-2 text-left">{t.procurementPlans.publicationDate}</th>
                                    <th className="p-2 text-left">{t.procurementPlans.deliveryDate}</th>
                                    {!isReadOnly && <th></th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {formData.details.map((detail, index) => {
                                    const total = (detail.estimatedCost || 0) * (detail.quantity || 0);
                                    return (
                                        <tr key={detail.id}>
                                            <td><input type="text" value={detail.budgetCode} onChange={e => handleDetailChange(index, 'budgetCode', e.target.value)} readOnly={isReadOnly} className={inputClasses} /></td>
                                            <td><input type="text" value={detail.item} onChange={e => handleDetailChange(index, 'item', e.target.value)} readOnly={isReadOnly} className={`${inputClasses} min-w-[200px]`} /></td>
                                            <td><input type="text" value={detail.description} onChange={e => handleDetailChange(index, 'description', e.target.value)} readOnly={isReadOnly} className={`${inputClasses} min-w-[250px]`} /></td>
                                            <td><input type="text" value={detail.unit} onChange={e => handleDetailChange(index, 'unit', e.target.value)} readOnly={isReadOnly} className={`${inputClasses} w-20`} /></td>
                                            <td><select value={detail.currency} onChange={e => handleDetailChange(index, 'currency', e.target.value)} disabled={isReadOnly} className={`${inputClasses} w-24`}>
                                                <option value="USD">USD</option><option value="ILS">ILS</option><option value="EUR">EUR</option></select></td>
                                            <td><input type="number" value={detail.estimatedCost} onChange={e => handleDetailChange(index, 'estimatedCost', parseFloat(e.target.value))} readOnly={isReadOnly} className={`${inputClasses} w-28`} /></td>
                                            <td><input type="number" value={detail.quantity} onChange={e => handleDetailChange(index, 'quantity', parseInt(e.target.value))} readOnly={isReadOnly} className={`${inputClasses} w-24`} /></td>
                                            <td><input type="text" value={total.toFixed(2)} readOnly className={`${inputClasses} w-32 bg-slate-100`} /></td>
                                            <td><select value={detail.procurementMethod} onChange={e => handleDetailChange(index, 'procurementMethod', e.target.value)} disabled={isReadOnly} className={inputClasses}>
                                                {Object.values(PurchaseRequestMethod).map(m => <option key={m} value={m}>{t.purchaseRequests.purchaseMethods[m]}</option>)}</select></td>
                                            <td><input type="date" value={detail.publicationDate} onChange={e => handleDetailChange(index, 'publicationDate', e.target.value)} readOnly={isReadOnly} className={inputClasses} /></td>
                                            <td><input type="date" value={detail.deliveryDate} onChange={e => handleDetailChange(index, 'deliveryDate', e.target.value)} readOnly={isReadOnly} className={inputClasses} /></td>
                                            {!isReadOnly && <td><button onClick={() => removeDetailRow(index)} className="p-2 text-red-500"><TrashIcon/></button></td>}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                     {!isReadOnly && <button onClick={addDetailRow} className="mt-3 flex items-center gap-2 text-sm font-semibold text-indigo-600"><PlusIcon/>{t.procurementPlans.addDetail}</button>}
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 flex justify-center items-center gap-3">
                <button onClick={() => handleAction('new')} disabled={!permissions.create} className={`${baseButtonClass} bg-indigo-600 hover:bg-indigo-700`}>{t.common.new}</button>
                <button onClick={() => handleAction('save')} disabled={mode === 'view' || !permissions.update} className={`${baseButtonClass} bg-blue-600 hover:bg-blue-700`}>{t.common.save}</button>
                <button onClick={() => handleAction('edit')} disabled={mode !== 'view' || !permissions.update} className={`${baseButtonClass} bg-amber-500 hover:bg-amber-600`}>{t.common.edit}</button>
                <button onClick={() => handleAction('delete')} disabled={mode !== 'view' || !permissions.delete} className={`${baseButtonClass} bg-red-600 hover:bg-red-700`}>{t.common.delete}</button>
            </div>
        </div>
    );
};

export default ProcurementPlanPage;