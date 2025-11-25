

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from '../LanguageContext';
import { 
    Project, ProjectBudget, BudgetLine, Expenditure, PermissionActions, PaymentMethod, PurchaseMethod, ExchangeRate
} from '../types';
import { useToast } from '../ToastContext';
import Modal from '../components/Modal';
import { PlusIcon, PencilIcon, TrashIcon } from '../components/icons';

interface ExpendituresPageProps {
    projects: Project[];
    projectBudgets: ProjectBudget[];
    expenditures: Expenditure[];
    setExpenditures: React.Dispatch<React.SetStateAction<Expenditure[]>>;
    paymentMethods: PaymentMethod[];
    setPaymentMethods: React.Dispatch<React.SetStateAction<PaymentMethod[]>>;
    purchaseMethods: PurchaseMethod[];
    setPurchaseMethods: React.Dispatch<React.SetStateAction<PurchaseMethod[]>>;
    permissions: PermissionActions;
    logActivity: (args: any) => void;
    exchangeRates: ExchangeRate[];
}

const FormField: React.FC<{ label: string; children: React.ReactNode; required?: boolean }> = ({ label, children, required }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
    </div>
);


const AttributeModal: React.FC<{
    isOpen: boolean; onClose: () => void; items: (PaymentMethod | PurchaseMethod)[]; setItems: React.Dispatch<React.SetStateAction<any[]>>; permissions: PermissionActions; logActivity: (args: any) => void;
    title: string; nameArLabel: string; nameEnLabel: string; entityType: string;
}> = ({ isOpen, onClose, items, setItems, permissions, logActivity, title, nameArLabel, nameEnLabel, entityType }) => {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const [formData, setFormData] = useState<{ id: string | null; nameAr: string; nameEn: string }>({ id: null, nameAr: '', nameEn: '' });
  const inputClass = "w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500";

  const handleSelect = (item: PaymentMethod | PurchaseMethod) => setFormData({ id: item.id, nameAr: item.nameAr, nameEn: item.nameEn });
  const handleNew = () => setFormData({ id: null, nameAr: '', nameEn: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameAr || !formData.nameEn) {
        showToast(t.common.fillRequiredFields, 'error');
        return;
    }
    if (formData.id) { // Update
      const updatedItem = { ...formData, id: formData.id };
      setItems(prev => prev.map(item => item.id === formData.id ? updatedItem : item));
      logActivity({ actionType: 'update', entityType, entityName: formData.nameEn });
      showToast(t.common.updatedSuccess, 'success');
    } else { // Create
      const newItem = { ...formData, id: `${entityType.toLowerCase()}-${Date.now()}` };
      setItems(prev => [...prev, newItem]);
      logActivity({ actionType: 'create', entityType, entityName: newItem.nameEn });
      setFormData(newItem);
      showToast(t.common.createdSuccess, 'success');
    }
  };
  
  const handleDelete = (id: string) => {
    const toDelete = items.find(i => i.id === id);
    if(toDelete) logActivity({ actionType: 'delete', entityType, entityName: toDelete.nameEn });
    setItems(prev => prev.filter(item => item.id !== id));
    if (formData.id === id) handleNew();
    showToast(t.common.deletedSuccess, 'success');
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="max-w-3xl">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ minHeight: '300px' }}>
            <div className="md:col-span-1 bg-slate-50 p-3 rounded-lg border flex flex-col">
                <button onClick={handleNew} disabled={!permissions.create} className="w-full mb-3 btn-primary flex items-center justify-center gap-2 disabled:bg-indigo-300">
                    <PlusIcon /> {t.common.new}
                </button>
                <div className="flex-grow overflow-y-auto">
                    {items.map(item => (
                        <div key={item.id} onClick={() => handleSelect(item)} className={`p-2 rounded-md cursor-pointer mb-1 flex justify-between items-center ${formData.id === item.id ? 'bg-indigo-200' : 'hover:bg-slate-200'}`}>
                            <span className="text-slate-800">{language === 'ar' ? item.nameAr : item.nameEn}</span>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} disabled={!permissions.delete} className="text-slate-400 hover:text-red-500 disabled:text-slate-300"><TrashIcon className="w-4 h-4" /></button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="md:col-span-2 p-2">
                <h3 className="text-xl font-bold text-slate-800 mb-4">{formData.id ? t.common.edit : t.common.add}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormField label={nameArLabel} required><input type="text" value={formData.nameAr} onChange={e => setFormData(f => ({...f, nameAr: e.target.value}))} className={inputClass} required /></FormField>
                    <FormField label={nameEnLabel} required><input type="text" value={formData.nameEn} onChange={e => setFormData(f => ({...f, nameEn: e.target.value}))} className={inputClass} required /></FormField>
                    <div className="pt-4 flex justify-end">
                        <button type="submit" disabled={formData.id ? !permissions.update : !permissions.create} className="btn-primary disabled:bg-indigo-300">{t.common.save}</button>
                    </div>
                </form>
            </div>
       </div>
    </Modal>
  )
}


const ExpenditureModal: React.FC<{
    isOpen: boolean; onClose: () => void; expenditure: Expenditure | null
} & ExpendituresPageProps> = ({
    isOpen, onClose, expenditure, setExpenditures, projects, projectBudgets, logActivity, permissions, paymentMethods, setPaymentMethods, purchaseMethods, setPurchaseMethods, exchangeRates
}) => {
    const { t, language } = useTranslation();
    const { showToast } = useToast();
    
    const [isPaymentMethodModalOpen, setIsPaymentMethodModalOpen] = useState(false);
    const [isPurchaseMethodModalOpen, setIsPurchaseMethodModalOpen] = useState(false);

    const initialFormState: Omit<Expenditure, 'id'> = {
        projectId: '',
        budgetLineId: '',
        pvNumber: '',
        paymentDate: new Date().toISOString().split('T')[0],
        invoiceNumber: '',
        description: '',
        paymentMethodId: '',
        chequeNumber: '',
        purchaseMethodId: '',
        originalAmount: 0,
        originalCurrency: 'ILS',
        paymentAmount: 0,
        paymentCurrency: 'ILS',
        allocationPercentage: 100,
        exchangeRate: 1
    };

    const [formData, setFormData] = useState<Omit<Expenditure, 'id'>>(initialFormState);

    useEffect(() => {
        if (expenditure) {
            setFormData(expenditure);
        } else {
            setFormData(initialFormState);
        }
    }, [expenditure, isOpen]);
    
    // Auto-populate exchange rate
    useEffect(() => {
        if (formData.paymentDate) {
            const date = new Date(formData.paymentDate);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const fromCurrency = formData.originalCurrency;
            const toCurrency = 'EUR'; // Hardcoded to convert to EUR for reporting consistency

            if (fromCurrency === toCurrency) {
                setFormData(p => ({ ...p, exchangeRate: 1, paymentCurrency: fromCurrency }));
                return;
            }

            // Find rate: FROM -> TO
            const directRate = exchangeRates.find(r => 
                r.year === year && r.month === month && 
                r.fromCurrency === fromCurrency && r.toCurrency === toCurrency
            );
            
            // Find rate: TO -> FROM
            const inverseRate = exchangeRates.find(r => 
                r.year === year && r.month === month && 
                r.fromCurrency === toCurrency && r.toCurrency === fromCurrency
            );

            let finalRate: number | null = null;
            
            // The expenditure form calculates payment amount by DIVISION (original / rate)
            // This means the rate must be in the format of (FROM / TO), e.g., 1.08 USD per 1 EUR
            if (directRate) {
                // My stored rate is a multiplier (TO = FROM * RATE). The form needs the inverse.
                if (directRate.rate !== 0) finalRate = 1 / directRate.rate;
            } else if (inverseRate) {
                // My stored inverse rate is a multiplier (FROM = TO * RATE). This is exactly what the form needs.
                finalRate = inverseRate.rate;
            }

            if (finalRate !== null) {
                setFormData(p => ({ ...p, exchangeRate: finalRate!, paymentCurrency: toCurrency }));
            }
        }
    }, [formData.paymentDate, formData.originalCurrency, exchangeRates]);


    useEffect(() => {
        if (formData.originalAmount > 0 && formData.exchangeRate > 0) {
            const calculatedPaymentAmount = formData.originalAmount / formData.exchangeRate;
            const roundedAmount = Math.round(calculatedPaymentAmount * 100) / 100;
            if (formData.paymentAmount !== roundedAmount) {
                 setFormData(p => ({ ...p, paymentAmount: roundedAmount }));
            }
        }
    }, [formData.originalAmount, formData.exchangeRate]);

    const budgetLinesForProject = useMemo(() => {
        if (!formData.projectId) return [];
        const budget = projectBudgets.find(b => b.projectId === formData.projectId);
        return budget?.lines || [];
    }, [formData.projectId, projectBudgets]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const isNumber = type === 'number';
        setFormData(p => ({ ...p, [name]: isNumber ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = () => {
        if (!formData.projectId || !formData.budgetLineId || !formData.paymentDate || !formData.originalAmount) {
            showToast(t.common.fillRequiredFields, 'error');
            return;
        }

        if (expenditure) {
            setExpenditures(prev => prev.map(e => e.id === expenditure.id ? {...e, ...formData} : e));
            logActivity({actionType: 'update', entityType: 'Expenditure', entityName: formData.description});
        } else {
            const newItem: Expenditure = {id: `exp-${Date.now()}`, ...formData};
            setExpenditures(prev => [...prev, newItem]);
             logActivity({actionType: 'create', entityType: 'Expenditure', entityName: formData.description});
        }
        showToast(t.common.updatedSuccess, 'success');
        onClose();
    };

    const selectedPaymentMethod = paymentMethods.find(pm => pm.id === formData.paymentMethodId);
    const showChequeField = selectedPaymentMethod?.nameEn.toLowerCase() === 'cheque';
    
    const totalInOriginalCurrency = formData.originalAmount * (formData.allocationPercentage / 100);
    const reportingAmount = formData.paymentAmount * (formData.allocationPercentage / 100);

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title={expenditure ? t.expenditures.editExpenditure : t.expenditures.newExpenditure} size="max-w-5xl">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <FormField label={t.expenditures.selectProject} required>
                            <select name="projectId" value={formData.projectId} onChange={handleInputChange} className="form-input">
                                <option value="">--</option>
                                {projects.map(p=><option key={p.id} value={p.id}>{language==='ar'?p.nameAr:p.nameEn}</option>)}
                            </select>
                         </FormField>
                         <FormField label={t.expenditures.budgetReference} required>
                            <select name="budgetLineId" value={formData.budgetLineId} onChange={handleInputChange} disabled={!formData.projectId} className="form-input">
                                <option value="">--</option>
                                {budgetLinesForProject.map(l=><option key={l.id} value={l.id}>{l.code} - {language==='ar'?l.descriptionAr:l.descriptionEn}</option>)}
                            </select>
                         </FormField>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <FormField label={t.expenditures.pvNumber}><input type="text" name="pvNumber" value={formData.pvNumber} onChange={handleInputChange} className="form-input"/></FormField>
                        <FormField label={t.expenditures.expenditureAmount} required>
                            <div className="flex">
                                <input type="number" name="originalAmount" value={formData.originalAmount} onChange={handleInputChange} className="form-input rounded-r-none"/>
                                <select name="originalCurrency" value={formData.originalCurrency} onChange={handleInputChange} className="form-input rounded-l-none w-24"><option>ILS</option><option>USD</option><option>EUR</option></select>
                            </div>
                        </FormField>
                        <FormField label={t.expenditures.paymentDate} required><input type="date" name="paymentDate" value={formData.paymentDate} onChange={handleInputChange} className="form-input"/></FormField>
                        <FormField label={t.expenditures.invoiceNumber}><input type="text" name="invoiceNumber" value={formData.invoiceNumber} onChange={handleInputChange} className="form-input"/></FormField>
                    </div>
                    <FormField label={t.expenditures.paymentDescription}><textarea name="description" value={formData.description} onChange={handleInputChange} rows={2} className="form-input"></textarea></FormField>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <FormField label={t.expenditures.purchaseMethod} required>
                            <div className="flex gap-2">
                                <select name="purchaseMethodId" value={formData.purchaseMethodId} onChange={handleInputChange} className="form-input flex-grow">
                                    <option value="">--</option>
                                    {purchaseMethods.map(pm=><option key={pm.id} value={pm.id}>{language==='ar'?pm.nameAr:pm.nameEn}</option>)}
                                </select>
                                <button onClick={() => setIsPurchaseMethodModalOpen(true)} className="p-2 bg-slate-200 rounded-md hover:bg-slate-300"><PencilIcon/></button>
                            </div>
                         </FormField>
                         <FormField label={t.expenditures.paymentMethod} required>
                            <div className="flex gap-2">
                                <select name="paymentMethodId" value={formData.paymentMethodId} onChange={handleInputChange} className="form-input flex-grow">
                                    <option value="">--</option>
                                    {paymentMethods.map(pm=><option key={pm.id} value={pm.id}>{language==='ar'?pm.nameAr:pm.nameEn}</option>)}
                                </select>
                                <button onClick={() => setIsPaymentMethodModalOpen(true)} className="p-2 bg-slate-200 rounded-md hover:bg-slate-300"><PencilIcon/></button>
                            </div>
                         </FormField>
                         <FormField label={t.expenditures.allocation}><input type="number" name="allocationPercentage" value={formData.allocationPercentage} onChange={handleInputChange} className="form-input" min="0" max="100"/></FormField>
                    </div>
                    {showChequeField && <div className="mt-4"><FormField label={t.expenditures.chequeNumber}><input type="text" name="chequeNumber" value={formData.chequeNumber || ''} onChange={handleInputChange} className="form-input"/></FormField></div>}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                        <FormField label={t.expenditures.exchangeRate} required>
                            <input type="number" name="exchangeRate" value={formData.exchangeRate} onChange={handleInputChange} className="form-input"/>
                            <p className="text-xs text-slate-500 mt-1">{t.exchangeRates.rateIsAuto}</p>
                        </FormField>
                        <FormField label={t.expenditures.paymentAmount} required>
                            <div className="flex">
                                <input type="number" name="paymentAmount" value={formData.paymentAmount} readOnly className="form-input rounded-r-none bg-slate-200"/>
                                <select name="paymentCurrency" value={formData.paymentCurrency} onChange={handleInputChange} disabled className="form-input rounded-l-none w-24 bg-slate-200"><option>ILS</option><option>USD</option><option>EUR</option></select>
                            </div>
                        </FormField>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-100 rounded-lg">
                        <div>
                            <p className="text-sm text-slate-600">{t.expenditures.totalInOriginalCurrency}</p>
                            <p className="font-bold text-lg text-slate-800">{totalInOriginalCurrency.toFixed(2)} {formData.originalCurrency}</p>
                        </div>
                        <div>
                             <p className="text-sm text-slate-600">{t.expenditures.reportingAmount}</p>
                            <p className="font-bold text-lg text-indigo-700">{reportingAmount.toFixed(2)}</p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t"><button onClick={onClose} className="btn-secondary">{t.common.cancel}</button><button onClick={handleSubmit} className="btn-primary">{t.common.save}</button></div>
                </div>
            </Modal>
             {isPaymentMethodModalOpen && <AttributeModal 
                isOpen={isPaymentMethodModalOpen}
                onClose={() => setIsPaymentMethodModalOpen(false)}
                items={paymentMethods}
                setItems={setPaymentMethods as any}
                permissions={permissions}
                logActivity={logActivity}
                title={t.expenditures.managePaymentMethods}
                nameArLabel={t.expenditures.paymentMethodNameAr}
                nameEnLabel={t.expenditures.paymentMethodNameEn}
                entityType="PaymentMethod"
            />}
             {isPurchaseMethodModalOpen && <AttributeModal 
                isOpen={isPurchaseMethodModalOpen}
                onClose={() => setIsPurchaseMethodModalOpen(false)}
                items={purchaseMethods}
                setItems={setPurchaseMethods as any}
                permissions={permissions}
                logActivity={logActivity}
                title={t.expenditures.managePurchaseMethods}
                nameArLabel={t.expenditures.purchaseMethodNameAr}
                nameEnLabel={t.expenditures.purchaseMethodNameEn}
                entityType="PurchaseMethod"
            />}
        </>
    )
};

const ExpendituresPage: React.FC<ExpendituresPageProps> = (props) => {
    const { t, language } = useTranslation();
    const { showToast } = useToast();
    const { expenditures, setExpenditures, permissions, logActivity, projectBudgets, projects } = props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpenditure, setEditingExpenditure] = useState<Expenditure | null>(null);

    const [filters, setFilters] = useState({
        projectId: 'ALL',
        budgetLineId: 'ALL',
        description: '',
        startDate: '',
        endDate: '',
    });

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleResetFilters = () => {
        setFilters({
            projectId: 'ALL',
            budgetLineId: 'ALL',
            description: '',
            startDate: '',
            endDate: '',
        });
    };

    const budgetLinesForFilter = useMemo(() => {
        if (filters.projectId === 'ALL') return [];
        const budget = projectBudgets.find(b => b.projectId === filters.projectId);
        return budget?.lines || [];
    }, [filters.projectId, projectBudgets]);

    useEffect(() => {
        setFilters(prev => ({...prev, budgetLineId: 'ALL'}));
    }, [filters.projectId]);

    const filteredExpenditures = useMemo(() => {
        return expenditures.filter(exp => {
            const projectMatch = filters.projectId === 'ALL' || exp.projectId === filters.projectId;
            const budgetLineMatch = filters.budgetLineId === 'ALL' || exp.budgetLineId === filters.budgetLineId;
            const descriptionMatch = filters.description === '' || exp.description.toLowerCase().includes(filters.description.toLowerCase());
            
            const expDate = new Date(exp.paymentDate);
            const startDateMatch = filters.startDate === '' || expDate >= new Date(filters.startDate);
            const endDateMatch = filters.endDate === '' || expDate <= new Date(filters.endDate);

            return projectMatch && budgetLineMatch && descriptionMatch && startDateMatch && endDateMatch;
        });
    }, [expenditures, filters]);

    const totals = useMemo(() => {
        const paymentTotals = filteredExpenditures.reduce((acc, exp) => {
            const currency = exp.paymentCurrency || 'USD';
            acc[currency] = (acc[currency] || 0) + (exp.paymentAmount || 0);
            return acc;
        }, {} as Record<string, number>);

        const reportingTotal = filteredExpenditures.reduce((acc, exp) => {
            const reportingAmount = (exp.paymentAmount || 0) * ((exp.allocationPercentage || 100) / 100);
            return acc + reportingAmount;
        }, 0);

        return { paymentTotals, reportingTotal };
    }, [filteredExpenditures]);


    const openModal = (exp: Expenditure | null = null) => {
        setEditingExpenditure(exp);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if(window.confirm(t.common.deleteConfirm)) {
            const toDelete = expenditures.find(e => e.id === id);
            if(toDelete) logActivity({actionType: 'delete', entityType: 'Expenditure', entityName: toDelete.description});
            setExpenditures(prev => prev.filter(e => e.id !== id));
            showToast(t.common.deletedSuccess, 'success');
        }
    };
    
    return (
        <div className="space-y-6">
            <style>{`
                .form-input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.375rem; background-color: #ffffff; color: #0f172a; transition: background-color .15s, border-color .15s; }
                .form-input:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 1px #4f46e5; }
                .btn-primary { padding: 0.625rem 1.25rem; background-color: #4f46e5; color: white; border-radius: 0.5rem; font-weight: 600; transition: background-color .15s; }
                .btn-primary:hover { background-color: #4338ca; }
                .btn-primary:disabled { background-color: #a5b4fc; cursor: not-allowed; }
                .btn-secondary { padding: 0.625rem 1.25rem; background-color: #e2e8f0; color: #1e293b; border-radius: 0.5rem; font-weight: 600; transition: background-color .15s; }
                .btn-secondary:hover { background-color: #cbd5e1; }
            `}</style>

            <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold text-slate-800">{t.nav.expenditures}</h1>
                <button onClick={() => openModal()} disabled={!permissions.create} className="btn-primary flex items-center gap-2">
                    <PlusIcon/>{t.expenditures.newExpenditure}
                </button>
            </div>

            <div className="p-4 bg-slate-50 border rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-700">{t.activityLog.filters}</h3>
                    <button onClick={handleResetFilters} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                        {t.common.clearFilters}
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField label={t.projects.title}>
                        <select name="projectId" value={filters.projectId} onChange={handleFilterChange} className="form-input">
                            <option value="ALL">{t.common.all}</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{language === 'ar' ? p.nameAr : p.nameEn}</option>)}
                        </select>
                    </FormField>
                    <FormField label={t.expenditures.budgetReference}>
                        <select name="budgetLineId" value={filters.budgetLineId} onChange={handleFilterChange} className="form-input" disabled={filters.projectId === 'ALL'}>
                            <option value="ALL">{t.common.all}</option>
                            {budgetLinesForFilter.map(bl => <option key={bl.id} value={bl.id}>{bl.code} - {language === 'ar' ? bl.descriptionAr : bl.descriptionEn}</option>)}
                        </select>
                    </FormField>
                    <FormField label={t.expenditures.paymentDescription}>
                        <input type="text" name="description" value={filters.description} onChange={handleFilterChange} className="form-input" />
                    </FormField>
                    <FormField label={t.activityLog.fromDate}>
                        <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="form-input" />
                    </FormField>
                    <FormField label={t.activityLog.toDate}>
                        <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="form-input" />
                    </FormField>
                </div>
            </div>
            
            <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
                        <tr>
                            <th className="p-3 text-left font-semibold">{t.expenditures.headers.pvNumber}</th>
                            <th className="p-3 text-left font-semibold">{t.expenditures.headers.date}</th>
                            <th className="p-3 text-left font-semibold">{t.expenditures.headers.description}</th>
                            <th className="p-3 text-left font-semibold">{t.expenditures.headers.budgetLine}</th>
                            <th className="p-3 text-right font-semibold">{t.expenditures.headers.paymentAmount}</th>
                            <th className="p-3 text-right font-semibold">{t.expenditures.headers.reportingAmount}</th>
                            <th className="p-3 text-left font-semibold">{t.expenditures.headers.actions}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {filteredExpenditures.map(exp => {
                            const budgetLine = projectBudgets.flatMap(b => b.lines).find(l => l.id === exp.budgetLineId);
                            const reportingAmount = (exp.paymentAmount || 0) * ((exp.allocationPercentage || 100) / 100);
                            
                            return (
                                <tr key={exp.id} className="hover:bg-slate-50">
                                    <td className="p-3 font-mono text-slate-700">{exp.pvNumber}</td>
                                    <td className="p-3 text-slate-700">{exp.paymentDate}</td>
                                    <td className="p-3 text-slate-700 max-w-xs truncate">{exp.description}</td>
                                    <td className="p-3 text-slate-700">{budgetLine ? `${budgetLine.code} - ${language==='ar' ? budgetLine.descriptionAr: budgetLine.descriptionEn}`: '-'}</td>
                                    <td className="p-3 font-semibold text-slate-800 font-mono text-right">{exp.paymentAmount.toFixed(2)} {exp.paymentCurrency}</td>
                                    <td className="p-3 font-semibold text-indigo-700 font-mono text-right">{reportingAmount.toFixed(2)}</td>
                                    <td className="p-3">
                                        <div className="flex gap-2">
                                            <button onClick={()=>openModal(exp)} disabled={!permissions.update} className="text-indigo-600"><PencilIcon/></button>
                                            <button onClick={()=>handleDelete(exp.id)} disabled={!permissions.delete} className="text-red-600"><TrashIcon/></button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                        {filteredExpenditures.length === 0 && <tr><td colSpan={7} className="text-center p-8 text-slate-500">{t.expenditures.noExpenditures}</td></tr>}
                    </tbody>
                    {filteredExpenditures.length > 0 && (
                        <tfoot className="bg-slate-100 border-t-2 border-slate-300">
                            <tr>
                                <td colSpan={4} className="p-3 text-right font-bold text-slate-800">{t.expenditures.total}</td>
                                <td className="p-3 text-right font-bold text-slate-800 font-mono">
                                    {Object.entries(totals.paymentTotals).map(([currency, total]) => (
                                        <div key={currency}>{(total as number).toFixed(2)} {currency}</div>
                                    ))}
                                </td>
                                <td className="p-3 text-right font-bold text-indigo-800 font-mono">
                                    {(totals.reportingTotal as number).toFixed(2)}
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>

            {isModalOpen && <ExpenditureModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} expenditure={editingExpenditure} {...props} />}
        </div>
    );
};

export default ExpendituresPage;