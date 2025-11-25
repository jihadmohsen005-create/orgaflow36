// pages/operations/WorkersPage.tsx
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from '../../LanguageContext';
import { 
    PermissionActions, 
    Project, PaymentMethod, Worker, WorkerTransaction, WorkType
} from '../../types';
import { PlusIcon, TrashIcon, UsersIcon, FinanceIcon, PurchaseOrderIcon, PrinterIcon, PencilIcon } from '../../components/icons';
import { useToast } from '../../ToastContext';
import Modal from '../../components/Modal';

// #region Helper Components
const FormField: React.FC<{ label: string; children: React.ReactNode; required?: boolean }> = ({ label, children, required }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
    </div>
);

const ActionButtons: React.FC<{
    mode: 'new' | 'view' | 'edit';
    permissions: PermissionActions;
    onAction: (action: 'new' | 'save' | 'edit' | 'delete') => void;
    hasSelection: boolean;
}> = ({ mode, permissions, onAction, hasSelection }) => {
    const { t } = useTranslation();
    const baseButtonClass = "px-6 py-2.5 text-white font-semibold rounded-md shadow-sm transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed";

    return (
        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap justify-center items-center gap-3">
            <button onClick={() => onAction('new')} disabled={!permissions.create} className={`${baseButtonClass} bg-indigo-600 hover:bg-indigo-700`}>{t.common.add}</button>
            <button onClick={() => onAction('save')} disabled={mode === 'view' || (mode === 'new' ? !permissions.create : !permissions.update)} className={`${baseButtonClass} bg-blue-600 hover:bg-blue-700`}>{t.common.save}</button>
            <button onClick={() => onAction('edit')} disabled={!hasSelection || mode === 'edit' || !permissions.update} className={`${baseButtonClass} bg-amber-500 hover:bg-amber-600`}>{t.common.edit}</button>
            <button onClick={() => onAction('delete')} disabled={!hasSelection || !permissions.delete} className={`${baseButtonClass} bg-red-600 hover:bg-red-700`}>{t.common.delete}</button>
        </div>
    );
};

interface AttributeModalProps<T extends { id: string; nameAr: string; nameEn: string }> {
  isOpen: boolean;
  onClose: () => void;
  items: T[];
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  title: string;
  nameArLabel: string;
  nameEnLabel: string;
  permissions: PermissionActions;
  logActivity: (args: any) => void;
  entityType: string;
}

const AttributeModal = <T extends { id: string; nameAr: string; nameEn: string }>({ isOpen, onClose, items, setItems, title, nameArLabel, nameEnLabel, permissions, logActivity, entityType }: AttributeModalProps<T>) => {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const [formData, setFormData] = useState<{ id: string | null; nameAr: string; nameEn: string }>({ id: null, nameAr: '', nameEn: '' });
  const inputClass = "w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500";

  const handleSelect = (item: T) => setFormData({ id: item.id, nameAr: item.nameAr, nameEn: item.nameEn });
  const handleNew = () => setFormData({ id: null, nameAr: '', nameEn: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameAr || !formData.nameEn) {
        showToast(t.common.fillRequiredFields, 'error');
        return;
    }
    if (formData.id) { // Update
      const updatedItem = { ...formData, id: formData.id } as T;
      setItems(prev => prev.map(item => item.id === formData.id ? updatedItem : item));
      logActivity({ actionType: 'update', entityType, entityName: formData.nameEn });
      showToast(t.common.updatedSuccess, 'success');
    } else { // Create
      const newItem = { ...formData, id: `${entityType.toLowerCase()}-${Date.now()}` } as T;
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
// #endregion

// #region Page Props Interface
interface WorkersPageProps {
    permissions: PermissionActions;
    logActivity: (args: any) => void;
    workers: Worker[]; setWorkers: React.Dispatch<React.SetStateAction<Worker[]>>;
    workTypes: WorkType[]; setWorkTypes: React.Dispatch<React.SetStateAction<WorkType[]>>;
    workerTransactions: WorkerTransaction[]; setWorkerTransactions: React.Dispatch<React.SetStateAction<WorkerTransaction[]>>;
    projects: Project[];
    paymentMethods: PaymentMethod[]; setPaymentMethods: React.Dispatch<React.SetStateAction<PaymentMethod[]>>;
}
// #endregion

// #region Generic Management Component
interface ManagementComponentProps<T extends { id: string; name?: string } & Record<string, any>> {
    items: (T & {name?: string})[];
    setItems: React.Dispatch<React.SetStateAction<T[]>>;
    getInitialFormState: () => Omit<T, 'id'>;
    renderForm: (
        formData: Omit<T, 'id'>,
        handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void,
        isReadOnly: boolean,
        setFormData: React.Dispatch<React.SetStateAction<Omit<T, 'id'>>>
    ) => React.ReactNode;
    title: string;
    selectLabel: string;
    selectPlaceholder: string;
    entityType: string;
    logActivity: (args: any) => void;
    permissions: PermissionActions;
}

const ManagementComponent = <T extends { id: string; name?: string } & Record<string, any>>({
    items, setItems, getInitialFormState, renderForm, title, selectLabel, selectPlaceholder, entityType, logActivity, permissions
}: ManagementComponentProps<T>) => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [mode, setMode] = useState<'new' | 'view' | 'edit'>('new');
    const [selectedId, setSelectedId] = useState('');
    const [formData, setFormData] = useState<Omit<T, 'id'>>(getInitialFormState());
    const inputClasses = "w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 transition focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 read-only:bg-slate-100 disabled:bg-slate-100";

    useEffect(() => {
        if (selectedId) {
            const item = items.find(i => i.id === selectedId);
            if (item) {
                const { id, ...rest } = item;
                if ('name' in rest && !Object.prototype.hasOwnProperty.call(getInitialFormState(), 'name')) {
                    delete (rest as any).name;
                }
                setFormData(rest as Omit<T, 'id'>);
                setMode('view');
            }
        } else {
            setFormData(getInitialFormState());
            setMode('new');
        }
    }, [selectedId, items, getInitialFormState]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const isNumber = type === 'number';
        setFormData(prev => ({ ...prev, [name]: isNumber ? parseFloat(value) || 0 : value }));
    };

    const handleAction = (action: 'new' | 'save' | 'edit' | 'delete') => {
        if (action === 'new') {
            setSelectedId('');
            setMode('new');
            return;
        }

        if (action === 'save') {
            if (mode === 'new') {
                const newId = `${entityType.toLowerCase()}-${Date.now()}`;
                const newItem = { id: newId, ...formData } as T;
                setItems(prev => [...prev, newItem]);
                logActivity({ actionType: 'create', entityType, entityName: (newItem as any).name || (formData as any).name || newItem.id });
                setSelectedId(newId);
                showToast(t.common.createdSuccess, 'success');
            } else if (mode === 'edit') {
                setItems(prev => prev.map(item => item.id === selectedId ? { id: item.id, ...formData } as T : item));
                logActivity({ actionType: 'update', entityType, entityName: (formData as any).name || selectedId });
                setMode('view');
                showToast(t.common.updatedSuccess, 'success');
            }
        }

        if (!selectedId) return;
        if (action === 'edit') setMode('edit');
        if (action === 'delete') {
            const itemToDelete = items.find(i => i.id === selectedId);
            if (itemToDelete) logActivity({ actionType: 'delete', entityType, entityName: (itemToDelete as any).name || itemToDelete.id });
            setItems(prev => prev.filter(i => i.id !== selectedId));
            setSelectedId('');
            showToast(t.common.deletedSuccess, 'success');
        }
    };

    const isReadOnly = mode === 'view' || (mode === 'edit' && !permissions.update);

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800">{title}</h2>
             <div className="p-4 bg-slate-50 border rounded-lg">
                <FormField label={selectLabel}>
                    <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className={inputClasses}>
                        <option value="">{selectPlaceholder}</option>
                        {items.map(item => <option key={item.id} value={item.id}>{item.name || item.id}</option>)}
                    </select>
                </FormField>
            </div>
            <div className="border-t pt-6">{renderForm(formData, handleInputChange, isReadOnly, setFormData)}</div>
            <ActionButtons mode={mode} permissions={permissions} onAction={handleAction} hasSelection={!!selectedId} />
        </div>
    );
};
// #endregion

// #region Workers Management Components
const WorkersDashboardComponent: React.FC<WorkersPageProps & { setView: (view: string) => void }> = (props) => {
    const { t } = useTranslation();
    
    const stats = useMemo(() => {
        const totalAmountDue = props.workerTransactions.reduce((acc, transaction) => acc + (transaction.amountDue || 0), 0);
        return {
            totalWorkers: props.workers.length,
            totalAmountDue: totalAmountDue,
        };
    }, [props.workers, props.workerTransactions]);
    
    const navCards = [
        { id: 'workers', title: t.operations.tabs.workersManagement, icon: <UsersIcon className="w-8 h-8"/>, color: 'text-blue-500' },
        { id: 'workerTransactions', title: t.operations.workerTransactions.title, icon: <FinanceIcon className="w-8 h-8"/>, color: 'text-teal-500' },
        { id: 'reports', title: t.operations.workersDashboard.reports, icon: <PurchaseOrderIcon className="w-8 h-8"/>, color: 'text-green-500' },
    ];
    
    const StatCard: React.FC<{title: string, value: number, unit: string, icon: React.ReactNode}> = ({ title, value, unit, icon }) => (
        <div className="bg-slate-100 p-6 rounded-lg border border-slate-200 flex items-center gap-4">
            <div className="bg-white p-3 rounded-full shadow-sm">{icon}</div>
            <div>
                <p className="text-sm font-semibold text-slate-600">{title}</p>
                <p className="text-3xl font-bold text-indigo-700">{value.toLocaleString()} <span className="text-lg font-medium text-slate-500">{unit}</span></p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard title={t.operations.workersDashboard.totalWorkers} value={stats.totalWorkers} unit="" icon={<UsersIcon className="w-8 h-8 text-indigo-600"/>} />
                <StatCard title={t.operations.workersDashboard.totalAmountDue} value={stats.totalAmountDue} unit="" icon={<FinanceIcon className="w-8 h-8 text-green-600"/>} />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
                {navCards.map(card => (
                    <button key={card.id} onClick={() => props.setView(card.id)} className="group p-4 bg-white rounded-lg border-2 border-slate-200 hover:border-indigo-500 hover:shadow-lg transition-all text-center flex flex-col items-center justify-center h-32">
                        <div className={`mb-2 ${card.color}`}>{card.icon}</div>
                        <p className="font-bold text-slate-700 group-hover:text-indigo-600">{card.title}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

const WorkersComponent: React.FC<WorkersPageProps> = (props) => {
    const { t, language } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const getInitialFormState = useCallback(() => ({ name: '', mobile: '', idNumber: '', paymentMethodId: '', bankName: '', accountNumber: '', iban: '' }), []);
    const inputClasses = "w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 transition focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 read-only:bg-slate-100 disabled:bg-slate-100";

    return (
        <div>
            <ManagementComponent<Worker>
                items={props.workers}
                setItems={props.setWorkers}
                getInitialFormState={getInitialFormState}
                renderForm={(formData, handleInputChange, isReadOnly) => (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FormField label={t.operations.workers.name} required><input type="text" name="name" value={formData.name} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required/></FormField>
                        <FormField label={t.operations.workers.mobile}><input type="text" name="mobile" value={formData.mobile} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} /></FormField>
                        <FormField label={t.operations.workers.idNumber}><input type="text" name="idNumber" value={formData.idNumber} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} /></FormField>
                        <FormField label={t.operations.workers.paymentMethod}>
                            <div className="flex gap-2">
                                <select name="paymentMethodId" value={formData.paymentMethodId} onChange={handleInputChange} disabled={isReadOnly} className={`${inputClasses} flex-grow`}><option value="">--</option>{props.paymentMethods.map(p=><option key={p.id} value={p.id}>{language === 'ar' ? p.nameAr : p.nameEn}</option>)}</select>
                                <button onClick={() => setIsModalOpen(true)} className="p-2 bg-slate-200 rounded-md hover:bg-slate-300"><PencilIcon /></button>
                            </div>
                        </FormField>
                        <FormField label={t.operations.workers.bankName}><input type="text" name="bankName" value={formData.bankName} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} /></FormField>
                        <FormField label={t.operations.workers.accountNumber}><input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} /></FormField>
                        <FormField label={t.operations.workers.iban}><input type="text" name="iban" value={formData.iban} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} /></FormField>
                    </div>
                )}
                title={t.operations.workers.title}
                selectLabel={t.operations.workers.select}
                selectPlaceholder={t.operations.workers.selectPlaceholder}
                entityType="Worker"
                logActivity={props.logActivity}
                permissions={props.permissions}
            />
            {isModalOpen && <AttributeModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                items={props.paymentMethods}
                setItems={props.setPaymentMethods}
                title={t.operations.drivers.managePaymentMethods}
                nameArLabel={t.operations.drivers.paymentMethodNameAr}
                nameEnLabel={t.operations.drivers.paymentMethodNameEn}
                permissions={props.permissions}
                logActivity={props.logActivity}
                entityType="PaymentMethod"
            />}
        </div>
    );
};

const WorkerTransactionsComponent: React.FC<WorkersPageProps> = (props) => {
    const { t, language } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const inputClasses = "w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 transition focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 read-only:bg-slate-100 disabled:bg-slate-100";
    
    const itemsWithName = useMemo(() => props.workerTransactions.map(item => {
        const worker = props.workers.find(d => d.id === item.workerId)?.name || 'N/A';
        return { ...item, name: `${worker} - ${item.date}` };
    }), [props.workerTransactions, props.workers, language]);

    const getInitialFormState = useCallback(() => ({ workerId: '', date: new Date().toISOString().split('T')[0], workType: '', location: '', projectId: '', amountDue: 0, currency: 'ILS' as 'ILS', notes: '' }), []);
    
    return (
        <div>
            <ManagementComponent<WorkerTransaction>
                items={itemsWithName}
                setItems={props.setWorkerTransactions}
                getInitialFormState={getInitialFormState}
                renderForm={(formData, handleInputChange, isReadOnly) => (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FormField label={t.operations.workerTransactions.worker} required><select name="workerId" value={formData.workerId} onChange={handleInputChange} disabled={isReadOnly} className={inputClasses} required><option value="">--</option>{props.workers.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select></FormField>
                        <FormField label={t.operations.workerTransactions.date} required><input type="date" name="date" value={formData.date} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required/></FormField>
                        <FormField label={t.operations.workerTransactions.workType}>
                             <div className="flex gap-2">
                                <select name="workType" value={formData.workType} onChange={handleInputChange} disabled={isReadOnly} className={`${inputClasses} flex-grow`}><option value="">--</option>{props.workTypes.map(w=><option key={w.id} value={w.id}>{language === 'ar' ? w.nameAr : w.nameEn}</option>)}</select>
                                 <button onClick={() => setIsModalOpen(true)} className="p-2 bg-slate-200 rounded-md hover:bg-slate-300"><PencilIcon /></button>
                            </div>
                        </FormField>
                        <FormField label={t.operations.workerTransactions.location}><input type="text" name="location" value={formData.location} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} /></FormField>
                        <FormField label={t.operations.workerTransactions.project}><select name="projectId" value={formData.projectId} onChange={handleInputChange} disabled={isReadOnly} className={inputClasses}><option value="">--</option>{props.projects.map(p=><option key={p.id} value={p.id}>{language === 'ar' ? p.nameAr : p.nameEn}</option>)}</select></FormField>
                        <FormField label={t.operations.workerTransactions.amountDue}><div className="flex"><input type="number" name="amountDue" value={formData.amountDue} onChange={handleInputChange} readOnly={isReadOnly} className={`${inputClasses} rounded-r-none`} /><select name="currency" value={formData.currency} onChange={handleInputChange} disabled={isReadOnly} className={`${inputClasses} rounded-l-none w-24`}><option value="ILS">ILS</option><option value="USD">USD</option></select></div></FormField>
                        <div className="lg:col-span-3"><FormField label={t.operations.workerTransactions.notes}><textarea name="notes" value={formData.notes} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} rows={2}></textarea></FormField></div>
                    </div>
                )}
                title={t.operations.workerTransactions.title}
                selectLabel={t.operations.workerTransactions.select}
                selectPlaceholder={t.operations.workerTransactions.selectPlaceholder}
                entityType="WorkerTransaction"
                logActivity={props.logActivity}
                permissions={props.permissions}
            />
            {isModalOpen && <AttributeModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                items={props.workTypes}
                setItems={props.setWorkTypes}
                title={t.operations.workerTransactions.manageWorkTypes}
                nameArLabel={t.operations.workerTransactions.workTypeNameAr}
                nameEnLabel={t.operations.workerTransactions.workTypeNameEn}
                permissions={props.permissions}
                logActivity={props.logActivity}
                entityType="WorkType"
            />}
        </div>
    );
};

const WorkerReportsComponent: React.FC<WorkersPageProps> = (props) => {
    const { t, language } = useTranslation();
    const [reportType, setReportType] = useState<'workerStatement' | 'allWorkersSummary'>('workerStatement');
    const [filters, setFilters] = useState({ workerId: 'ALL', projectId: 'ALL', startDate: '', endDate: new Date().toISOString().split('T')[0] });
    const [reportData, setReportData] = useState<any[] | null>(null);
    const [reportTitle, setReportTitle] = useState('');
    const inputClasses = "w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900";

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setReportData(null);
    };

    const handleGenerateReport = () => {
        const { workerId, projectId, startDate, endDate } = filters;
        let data = props.workerTransactions.filter(tx => {
            const txDate = new Date(tx.date);
            const sDate = startDate ? new Date(startDate) : null;
            const eDate = endDate ? new Date(endDate) : null;
            if (eDate) eDate.setHours(23, 59, 59, 999);
            return (
                (workerId === 'ALL' || tx.workerId === workerId) &&
                (projectId === 'ALL' || tx.projectId === projectId) &&
                (!sDate || txDate >= sDate) &&
                (!eDate || txDate <= eDate)
            );
        });

        if (reportType === 'workerStatement') {
            if (workerId === 'ALL') {
                alert('Please select a specific worker for this report.');
                return;
            }
            setReportTitle(t.operations.workerReports.reportTitles.workerStatement);
            setReportData(data);
        } else if (reportType === 'allWorkersSummary') {
            const summary = data.reduce((acc, tx) => {
                acc[tx.workerId] = (acc[tx.workerId] || 0) + tx.amountDue;
                return acc;
            }, {} as Record<string, number>);
            
            const summaryData = Object.keys(summary).map(workerId => ({
                workerName: props.workers.find(w => w.id === workerId)?.name || 'Unknown',
                totalAmountDue: summary[workerId],
            }));
            setReportTitle(t.operations.workerReports.reportTitles.allWorkersSummary);
            setReportData(summaryData);
        }
    };
    
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800">{t.operations.workerReports.title}</h2>
            <div className="p-4 bg-slate-50 border rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField label={t.operations.workerReports.worker}><select name="workerId" value={filters.workerId} onChange={handleFilterChange} className={inputClasses}><option value="ALL">{t.common.all}</option>{props.workers.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select></FormField>
                    <FormField label={t.operations.workerReports.project}><select name="projectId" value={filters.projectId} onChange={handleFilterChange} className={inputClasses}><option value="ALL">{t.common.all}</option>{props.projects.map(p=><option key={p.id} value={p.id}>{language==='ar' ? p.nameAr:p.nameEn}</option>)}</select></FormField>
                    <FormField label={t.operations.workerReports.startDate}><input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className={inputClasses}/></FormField>
                    <FormField label={t.operations.workerReports.endDate}><input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className={inputClasses}/></FormField>
                </div>
                <div className="flex items-center gap-4 pt-4 border-t">
                    <button onClick={() => setReportType('workerStatement')} className={`px-4 py-2 text-sm font-semibold rounded-md ${reportType === 'workerStatement' ? 'bg-indigo-600 text-white' : 'bg-white border'}`}>{t.operations.workerReports.buttons.workerStatement}</button>
                    <button onClick={() => setReportType('allWorkersSummary')} className={`px-4 py-2 text-sm font-semibold rounded-md ${reportType === 'allWorkersSummary' ? 'bg-indigo-600 text-white' : 'bg-white border'}`}>{t.operations.workerReports.buttons.allWorkersSummary}</button>
                    <button onClick={handleGenerateReport} className="py-2 px-4 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700">{t.operations.workerReports.generateReport}</button>
                </div>
            </div>
             <div className="p-4 bg-white border rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-800">{reportTitle}</h3>
                    {reportData && <button className="flex items-center gap-2 py-2 px-4 text-sm font-semibold bg-slate-600 text-white hover:bg-slate-700 rounded-lg"><PrinterIcon/> {t.operations.workerReports.printReport}</button>}
                </div>
                {reportData ? (
                    reportType === 'workerStatement' ? (
                        <div className="overflow-x-auto"><table className="w-full text-sm">
                            <thead className="bg-slate-100"><tr>{Object.values(t.operations.workerReports.headers).filter(h => h !== 'Worker Name').map(h=><th key={h} className="p-2 text-left">{h}</th>)}</tr></thead>
                            <tbody>{reportData.map((d,i)=>(<tr key={String(i)} className="border-b"><td className="p-2">{d.date}</td><td className="p-2">{props.projects.find(p=>p.id === d.projectId)?.[language==='ar'?'nameAr':'nameEn']}</td><td className="p-2">{props.workTypes.find(w=>w.id === d.workType)?.[language==='ar'?'nameAr':'nameEn']}</td><td className="p-2">{d.location}</td><td className="p-2">{d.amountDue} {d.currency}</td><td className="p-2">{d.notes}</td></tr>))}</tbody>
                        </table></div>
                    ) : (
                         <div className="overflow-x-auto"><table className="w-full text-sm">
                            <thead className="bg-slate-100"><tr><th className="p-2 text-left">{t.operations.workerReports.headers.workerName}</th><th className="p-2 text-left">{t.operations.workerReports.headers.totalAmountDue}</th></tr></thead>
                            <tbody>{reportData.map((d,i)=>(<tr key={String(i)} className="border-b"><td className="p-2">{d.workerName}</td><td className="p-2">{d.totalAmountDue.toFixed(2)}</td></tr>))}</tbody>
                        </table></div>
                    )
                ) : <div className="text-center p-8 bg-slate-100 rounded-lg">{t.operations.workerReports.noReport}</div>}
            </div>
        </div>
    )
};
// #endregion

// #region Main Workers Page Component
const WorkersPage: React.FC<WorkersPageProps> = (props) => {
    const { t } = useTranslation();
    const [view, setView] = useState('dashboard');

    const views = [
        { id: 'dashboard', title: t.operations.workersDashboard.title },
        { id: 'workers', title: t.operations.tabs.workersManagement },
        { id: 'workerTransactions', title: t.operations.workerTransactions.title },
        { id: 'reports', title: t.operations.workersDashboard.reports },
    ];
    
    const renderContent = () => {
        switch (view) {
            case 'dashboard': return <WorkersDashboardComponent {...props} setView={setView} />;
            case 'workers': return <WorkersComponent {...props} />;
            case 'workerTransactions': return <WorkerTransactionsComponent {...props} />;
            case 'reports': return <WorkerReportsComponent {...props} />;
            default: return <div>Component is under construction.</div>;
        }
    };

    return (
        <div>
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {views.map(v => (
                        <button key={v.id} onClick={() => setView(v.id)}
                            className={`${view === v.id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-700 hover:text-slate-800 hover:border-slate-400'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >{v.title}</button>
                    ))}
                </nav>
            </div>
            <div className="mt-6">
                {renderContent()}
            </div>
             <style>{`
                .form-input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.375rem; background-color: #ffffff; color: #0f172a; }
                .btn-primary { padding: 0.5rem 1rem; background-color: #4f46e5; color: white; border-radius: 0.375rem; font-weight: 600; }
                .btn-primary:disabled { background-color: #a5b4fc; cursor: not-allowed; }
            `}</style>
        </div>
    );
};

export default WorkersPage;
// #endregion