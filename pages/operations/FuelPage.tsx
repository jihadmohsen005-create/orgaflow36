// pages/operations/FuelPage.tsx
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from '../../LanguageContext';
import { 
    PermissionActions, 
    FuelType, Warehouse, FuelOpeningBalance, FuelSupplier, FuelSupply, FuelTransfer, FuelDisbursement,
    Driver, Project, FuelRecipientType, Employee
} from '../../types';
import { PlusIcon, PencilIcon, TrashIcon, FleetIcon, CheckCircleIcon, CubeIcon as FuelIcon, UsersIcon, PurchaseOrderIcon, PrinterIcon } from '../../components/icons';
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
      logActivity({ actionType: 'create', entityType, entityName: formData.nameEn });
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
interface FuelPageProps {
    permissions: PermissionActions;
    logActivity: (args: any) => void;
    fuelTypes: FuelType[]; setFuelTypes: React.Dispatch<React.SetStateAction<FuelType[]>>;
    warehouses: Warehouse[];
    fuelOpeningBalances: FuelOpeningBalance[]; setFuelOpeningBalances: React.Dispatch<React.SetStateAction<FuelOpeningBalance[]>>;
    fuelSuppliers: FuelSupplier[]; setFuelSuppliers: React.Dispatch<React.SetStateAction<FuelSupplier[]>>;
    fuelSupplies: FuelSupply[]; setFuelSupplies: React.Dispatch<React.SetStateAction<FuelSupply[]>>;
    fuelTransfers: FuelTransfer[]; setFuelTransfers: React.Dispatch<React.SetStateAction<FuelTransfer[]>>;
    fuelDisbursements: FuelDisbursement[]; setFuelDisbursements: React.Dispatch<React.SetStateAction<FuelDisbursement[]>>;
    fuelRecipientTypes: FuelRecipientType[]; setFuelRecipientTypes: React.Dispatch<React.SetStateAction<FuelRecipientType[]>>;
    projects: Project[];
    drivers: Driver[];
    employees: Employee[];
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

// #region Fuel Management Components
const FuelDashboardComponent: React.FC<FuelPageProps & { setView: (view: string) => void }> = (props) => {
    const { t, language } = useTranslation();
    const { setView } = props;

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const { totalStock, incoming, outgoing, stockByWarehouse, stockByFuelType, breakdown } = useMemo(() => {
        let currentStock = 0;
        let incoming30d = 0;
        let outgoing30d = 0;
        const warehouseStock: Record<string, number> = {};
        const fuelTypeStock: Record<string, number> = {};
        
        // Breakdowns by fuel type for the stat cards
        const stockBreakdown: Record<string, number> = {};
        const incomingBreakdown: Record<string, number> = {};
        const outgoingBreakdown: Record<string, number> = {};

        // Initialize counters
        props.warehouses.forEach(w => warehouseStock[w.id] = 0);
        props.fuelTypes.forEach(f => {
            fuelTypeStock[f.id] = 0;
            stockBreakdown[f.id] = 0;
            incomingBreakdown[f.id] = 0;
            outgoingBreakdown[f.id] = 0;
        });

        props.fuelOpeningBalances.forEach(b => {
            currentStock += b.quantity;
            if(warehouseStock[b.warehouseId] !== undefined) warehouseStock[b.warehouseId] += b.quantity;
            if(fuelTypeStock[b.fuelTypeId] !== undefined) {
                fuelTypeStock[b.fuelTypeId] += b.quantity;
                stockBreakdown[b.fuelTypeId] += b.quantity;
            }
        });

        props.fuelSupplies.forEach(s => {
            currentStock += s.quantitySupplied;
            if(warehouseStock[s.warehouseId] !== undefined) warehouseStock[s.warehouseId] += s.quantitySupplied;
            if(fuelTypeStock[s.fuelTypeId] !== undefined) {
                fuelTypeStock[s.fuelTypeId] += s.quantitySupplied;
                stockBreakdown[s.fuelTypeId] += s.quantitySupplied;
            }
            
            if(new Date(s.supplyDate) >= thirtyDaysAgo) {
                incoming30d += s.quantitySupplied;
                if(incomingBreakdown[s.fuelTypeId] !== undefined) incomingBreakdown[s.fuelTypeId] += s.quantitySupplied;
            }
        });

        props.fuelDisbursements.forEach(d => {
            currentStock -= d.quantityIssued;
            if(warehouseStock[d.warehouseId] !== undefined) warehouseStock[d.warehouseId] -= d.quantityIssued;
            if(fuelTypeStock[d.fuelTypeId] !== undefined) {
                fuelTypeStock[d.fuelTypeId] -= d.quantityIssued;
                stockBreakdown[d.fuelTypeId] -= d.quantityIssued;
            }
            
            if(new Date(d.issueDate) >= thirtyDaysAgo) {
                outgoing30d += d.quantityIssued;
                if(outgoingBreakdown[d.fuelTypeId] !== undefined) outgoingBreakdown[d.fuelTypeId] += d.quantityIssued;
            }
        });

        // Transfers logic (Internal movements, don't affect global stock or external In/Out)
        props.fuelTransfers.forEach(transfer => {
            if(warehouseStock[transfer.fromWarehouseId] !== undefined) warehouseStock[transfer.fromWarehouseId] -= transfer.quantity;
            if(warehouseStock[transfer.toWarehouseId] !== undefined) warehouseStock[transfer.toWarehouseId] += transfer.quantity;
        });

        const warehouseChartData = Object.entries(warehouseStock).map(([id, value]) => {
            const warehouse = props.warehouses.find(w => w.id === id);
            return { label: warehouse?.name || 'Unknown', value };
        });
        
        const fuelTypeChartData = Object.entries(fuelTypeStock).map(([id, value]) => {
            const fuelType = props.fuelTypes.find(f => f.id === id);
            return { label: fuelType?.name || 'Unknown', value };
        });

        // Helper to format breakdown arrays
        const formatBreakdown = (map: Record<string, number>) => {
            return Object.entries(map)
                .filter(([_, val]) => val !== 0)
                .map(([id, val]) => ({
                    label: props.fuelTypes.find(f => f.id === id)?.name || 'Unknown',
                    value: val
                }));
        };

        return { 
            totalStock: currentStock, 
            incoming: incoming30d, 
            outgoing: outgoing30d, 
            stockByWarehouse: warehouseChartData, 
            stockByFuelType: fuelTypeChartData,
            breakdown: {
                stock: formatBreakdown(stockBreakdown),
                incoming: formatBreakdown(incomingBreakdown),
                outgoing: formatBreakdown(outgoingBreakdown),
            }
        };
    }, [props.fuelOpeningBalances, props.fuelSupplies, props.fuelDisbursements, props.fuelTransfers, props.warehouses, props.fuelTypes]);
    
    const navCards = [
        { id: 'types', title: t.operations.fuelTabs.types, icon: <FuelIcon className="w-8 h-8"/>, color: 'text-blue-500' },
        { id: 'suppliers', title: t.operations.fuelTabs.suppliers, icon: <UsersIcon className="w-8 h-8"/>, color: 'text-teal-500' },
        { id: 'openingBalances', title: t.operations.fuelTabs.openingBalances, icon: <CheckCircleIcon className="w-8 h-8"/>, color: 'text-green-500' },
        { id: 'supplies', title: t.operations.fuelTabs.supplies, icon: <PlusIcon className="w-8 h-8"/>, color: 'text-sky-500' },
        { id: 'transfers', title: t.operations.fuelTabs.transfers, icon: <FleetIcon className="w-8 h-8"/>, color: 'text-orange-500' },
        { id: 'disbursements', title: t.operations.fuelTabs.disbursements, icon: <TrashIcon className="w-8 h-8"/>, color: 'text-red-500' },
        { id: 'reports', title: t.operations.fuelTabs.reports, icon: <PurchaseOrderIcon className="w-8 h-8"/>, color: 'text-purple-500' },
    ];

    const StatCard: React.FC<{title: string, value: number, unit: string, icon: React.ReactNode, breakdown?: {label: string, value: number}[]}> = ({ title, value, unit, icon, breakdown }) => (
        <div className="bg-slate-100 p-6 rounded-lg border border-slate-200 flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-full shadow-sm">{icon}</div>
                <div>
                    <p className="text-sm font-semibold text-slate-600">{title}</p>
                    <p className="text-3xl font-bold text-indigo-700">{value.toLocaleString()} <span className="text-lg font-medium text-slate-500">{unit}</span></p>
                </div>
            </div>
            {breakdown && breakdown.length > 0 && (
                <div className="border-t border-slate-200 pt-3 mt-1 space-y-1">
                    {breakdown.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs font-medium text-slate-600">
                            <span>{item.label}</span>
                            <span>{item.value.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
    
    const BarChart: React.FC<{ data: { label: string; value: number }[] }> = ({ data }) => {
        const maxValue = Math.max(...data.map(d => d.value), 1);
        return (
            <div className="w-full space-y-3 p-4 bg-slate-100 rounded-lg border">
                {data.map(item => (
                    <div key={item.label} className="grid grid-cols-3 items-center gap-2 text-sm">
                        <span className="col-span-1 text-slate-600 font-medium truncate text-right">{item.label}</span>
                        <div className="col-span-2 flex items-center gap-2">
                            <div className="w-full bg-slate-200 rounded-full h-5">
                                <div className="bg-indigo-500 h-5 rounded-full flex items-center justify-end pr-2 text-white text-xs font-bold" style={{ width: `${(item.value / maxValue) * 100}%` }}>
                                    {item.value.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                 {data.length === 0 && <p className="text-center text-slate-500 py-4">{t.operations.fuelDashboard.noStock}</p>}
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title={t.operations.fuelDashboard.totalFuelStock} 
                    value={totalStock} 
                    unit={t.operations.fuelDashboard.liters} 
                    icon={<FuelIcon className="w-8 h-8 text-indigo-600"/>}
                    breakdown={breakdown.stock}
                />
                <StatCard 
                    title={t.operations.fuelDashboard.incoming} 
                    value={incoming} 
                    unit={t.operations.fuelDashboard.liters} 
                    icon={<PlusIcon className="w-8 h-8 text-green-600"/>} 
                    breakdown={breakdown.incoming}
                />
                <StatCard 
                    title={t.operations.fuelDashboard.outgoing} 
                    value={outgoing} 
                    unit={t.operations.fuelDashboard.liters} 
                    icon={<TrashIcon className="w-8 h-8 text-red-600"/>} 
                    breakdown={breakdown.outgoing}
                />
            </div>

            <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">{t.operations.fuelTabs.dashboard}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    {navCards.map(card => (
                        <button key={card.id} onClick={() => setView(card.id)} className="group p-4 bg-white rounded-lg border-2 border-slate-200 hover:border-indigo-500 hover:shadow-lg transition-all text-center flex flex-col items-center justify-center h-32">
                            <div className={`mb-2 ${card.color}`}>{card.icon}</div>
                            <p className="font-bold text-slate-700 group-hover:text-indigo-600">{card.title}</p>
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">{t.operations.fuelDashboard.stockByWarehouse}</h3>
                    <BarChart data={stockByWarehouse} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">{t.operations.fuelTabs.types}</h3>
                    <BarChart data={stockByFuelType} />
                </div>
            </div>
        </div>
    );
};

const FuelTypesComponent: React.FC<FuelPageProps> = (props) => {
    const { t } = useTranslation();
    const getInitialFormState = useCallback(() => ({ name: '', description: '' }), []);
    const inputClasses = "w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 transition focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 read-only:bg-slate-100 disabled:bg-slate-100";
    return <ManagementComponent<FuelType>
        items={props.fuelTypes}
        setItems={props.setFuelTypes}
        getInitialFormState={getInitialFormState}
        renderForm={(formData, handleInputChange, isReadOnly) => (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label={t.operations.fuelTypes.name} required>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required/>
                </FormField>
                <FormField label={t.operations.fuelTypes.description}>
                    <input type="text" name="description" value={formData.description} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} />
                </FormField>
            </div>
        )}
        title={t.operations.fuelTypes.title}
        selectLabel={t.operations.fuelTypes.select}
        selectPlaceholder={t.operations.fuelTypes.selectPlaceholder}
        entityType="FuelType"
        logActivity={props.logActivity}
        permissions={props.permissions}
    />
};

const FuelSuppliersComponent: React.FC<FuelPageProps> = (props) => {
    const { t } = useTranslation();
    const getInitialFormState = useCallback(() => ({ name: '', contactNumber: '', address: '', contactPerson: '', notes: '' }), []);
    const inputClasses = "w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 transition focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 read-only:bg-slate-100 disabled:bg-slate-100";
    return <ManagementComponent<FuelSupplier>
        items={props.fuelSuppliers}
        setItems={props.setFuelSuppliers}
        getInitialFormState={getInitialFormState}
        renderForm={(formData, handleInputChange, isReadOnly) => (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label={t.operations.fuelSuppliers.name} required><input type="text" name="name" value={formData.name} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required/></FormField>
                <FormField label={t.operations.fuelSuppliers.contactNumber}><input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} /></FormField>
                <FormField label={t.operations.fuelSuppliers.address}><input type="text" name="address" value={formData.address} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} /></FormField>
                <FormField label={t.operations.fuelSuppliers.contactPerson}><input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} /></FormField>
                <div className="md:col-span-2"><FormField label={t.operations.fuelSuppliers.notes}><textarea name="notes" value={formData.notes} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} rows={3}></textarea></FormField></div>
            </div>
        )}
        title={t.operations.fuelSuppliers.title}
        selectLabel={t.operations.fuelSuppliers.select}
        selectPlaceholder={t.operations.fuelSuppliers.selectPlaceholder}
        entityType="FuelSupplier"
        logActivity={props.logActivity}
        permissions={props.permissions}
    />
};

const FuelOpeningBalancesComponent: React.FC<FuelPageProps> = (props) => {
    const { t } = useTranslation();
    const itemsWithName = useMemo(() => props.fuelOpeningBalances.map(item => {
        const warehouse = props.warehouses.find(w => w.id === item.warehouseId)?.name || 'N/A';
        const fuelType = props.fuelTypes.find(f => f.id === item.fuelTypeId)?.name || 'N/A';
        return { ...item, name: `${warehouse} - ${fuelType} @ ${item.balanceDate}` };
    }), [props.fuelOpeningBalances, props.warehouses, props.fuelTypes]);
    const getInitialFormState = useCallback(() => ({ warehouseId: '', fuelTypeId: '', quantity: 0, balanceDate: new Date().toISOString().split('T')[0], notes: '' }), []);
    const inputClasses = "w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 transition focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 read-only:bg-slate-100 disabled:bg-slate-100";

    return <ManagementComponent<FuelOpeningBalance>
        items={itemsWithName}
        setItems={props.setFuelOpeningBalances}
        getInitialFormState={getInitialFormState}
        renderForm={(formData, handleInputChange, isReadOnly) => (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label={t.operations.openingBalances.warehouse} required>
                    <select name="warehouseId" value={formData.warehouseId} onChange={handleInputChange} disabled={isReadOnly} className={inputClasses} required>
                        <option value="">--</option>
                        {props.warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                </FormField>
                <FormField label={t.operations.openingBalances.fuelType} required>
                    <select name="fuelTypeId" value={formData.fuelTypeId} onChange={handleInputChange} disabled={isReadOnly} className={inputClasses} required>
                        <option value="">--</option>
                        {props.fuelTypes.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                </FormField>
                <FormField label={t.operations.openingBalances.quantity} required><input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required/></FormField>
                <FormField label={t.operations.openingBalances.date} required><input type="date" name="balanceDate" value={formData.balanceDate} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required/></FormField>
                <div className="md:col-span-2"><FormField label={t.operations.openingBalances.notes}><textarea name="notes" value={formData.notes} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} rows={3}></textarea></FormField></div>
            </div>
        )}
        title={t.operations.openingBalances.title}
        selectLabel={t.operations.openingBalances.select}
        selectPlaceholder={t.operations.openingBalances.selectPlaceholder}
        entityType="FuelOpeningBalance"
        logActivity={props.logActivity}
        permissions={props.permissions}
    />
};
const FuelSupplyComponent: React.FC<FuelPageProps> = (props) => {
    const { t, language } = useTranslation();
    const itemsWithName = useMemo(() => props.fuelSupplies.map(item => {
        const supplier = props.fuelSuppliers.find(s => s.id === item.supplierId)?.name || 'N/A';
        return { ...item, name: `${item.invoiceNumber} - ${supplier}` };
    }), [props.fuelSupplies, props.fuelSuppliers]);
    const getInitialFormState = useCallback(() => ({ supplierId: '', warehouseId: '', fuelTypeId: '', quantitySupplied: 0, unitPrice: 0, supplyDate: new Date().toISOString().split('T')[0], invoiceNumber: '', projectId: '', notes: '' }), []);
    const inputClasses = "w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 transition focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 read-only:bg-slate-100 disabled:bg-slate-100";

    return <ManagementComponent<FuelSupply>
        items={itemsWithName}
        setItems={props.setFuelSupplies}
        getInitialFormState={getInitialFormState}
        renderForm={(formData, handleInputChange, isReadOnly) => (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField label={t.operations.supply.supplier} required><select name="supplierId" value={formData.supplierId} onChange={handleInputChange} disabled={isReadOnly} className={inputClasses} required><option value="">--</option>{props.fuelSuppliers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></FormField>
                <FormField label={t.operations.supply.warehouse} required><select name="warehouseId" value={formData.warehouseId} onChange={handleInputChange} disabled={isReadOnly} className={inputClasses} required><option value="">--</option>{props.warehouses.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select></FormField>
                <FormField label={t.operations.supply.fuelType} required><select name="fuelTypeId" value={formData.fuelTypeId} onChange={handleInputChange} disabled={isReadOnly} className={inputClasses} required><option value="">--</option>{props.fuelTypes.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}</select></FormField>
                <FormField label={t.operations.supply.quantity} required><input type="number" name="quantitySupplied" value={formData.quantitySupplied} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required/></FormField>
                <FormField label={t.operations.supply.unitPrice} required><input type="number" name="unitPrice" value={formData.unitPrice} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required/></FormField>
                <FormField label={t.operations.supply.supplyDate} required><input type="date" name="supplyDate" value={formData.supplyDate} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required/></FormField>
                <FormField label={t.operations.supply.invoiceNumber} required><input type="text" name="invoiceNumber" value={formData.invoiceNumber} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required/></FormField>
                <FormField label={t.operations.supply.project}><select name="projectId" value={formData.projectId} onChange={handleInputChange} disabled={isReadOnly} className={inputClasses}><option value="">--</option>{props.projects.map(p=><option key={p.id} value={p.id}>{language === 'ar' ? p.nameAr : p.nameEn}</option>)}</select></FormField>
                <div className="lg:col-span-3"><FormField label={t.operations.supply.notes}><textarea name="notes" value={formData.notes} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} rows={2}></textarea></FormField></div>
            </div>
        )}
        title={t.operations.supply.title}
        selectLabel={t.operations.supply.select}
        selectPlaceholder={t.operations.supply.selectPlaceholder}
        entityType="FuelSupply"
        logActivity={props.logActivity}
        permissions={props.permissions}
    />
};
const FuelTransferComponent: React.FC<FuelPageProps> = (props) => {
    const { t } = useTranslation();
    const itemsWithName = useMemo(() => props.fuelTransfers.map(item => {
        const from = props.warehouses.find(w => w.id === item.fromWarehouseId)?.name || 'N/A';
        const to = props.warehouses.find(w => w.id === item.toWarehouseId)?.name || 'N/A';
        return { ...item, name: `From ${from} to ${to} on ${item.transferDate}` };
    }), [props.fuelTransfers, props.warehouses]);
    const getInitialFormState = useCallback(() => ({ fromWarehouseId: '', toWarehouseId: '', fuelTypeId: '', quantity: 0, transferDate: new Date().toISOString().split('T')[0], notes: '' }), []);
    const inputClasses = "w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 transition focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 read-only:bg-slate-100 disabled:bg-slate-100";

    return <ManagementComponent<FuelTransfer>
        items={itemsWithName}
        setItems={props.setFuelTransfers}
        getInitialFormState={getInitialFormState}
        renderForm={(formData, handleInputChange, isReadOnly) => {
            const availableToWarehouses = props.warehouses.filter(w => w.id !== formData.fromWarehouseId);
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label={t.operations.transfers.fromWarehouse} required>
                        <select name="fromWarehouseId" value={formData.fromWarehouseId} onChange={handleInputChange} disabled={isReadOnly} className={inputClasses} required>
                            <option value="">--</option>
                            {props.warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                    </FormField>
                    <FormField label={t.operations.transfers.toWarehouse} required>
                        <select name="toWarehouseId" value={formData.toWarehouseId} onChange={handleInputChange} disabled={isReadOnly || !formData.fromWarehouseId} className={inputClasses} required>
                            <option value="">--</option>
                            {availableToWarehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                    </FormField>
                    <FormField label={t.operations.transfers.fuelType} required>
                        <select name="fuelTypeId" value={formData.fuelTypeId} onChange={handleInputChange} disabled={isReadOnly} className={inputClasses} required>
                            <option value="">--</option>
                            {props.fuelTypes.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                    </FormField>
                    <FormField label={t.operations.transfers.quantity} required><input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required/></FormField>
                    <FormField label={t.operations.transfers.transferDate} required><input type="date" name="transferDate" value={formData.transferDate} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required/></FormField>
                    <div className="md:col-span-2"><FormField label={t.operations.transfers.notes}><textarea name="notes" value={formData.notes} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} rows={3}></textarea></FormField></div>
                </div>
            )
        }}
        title={t.operations.transfers.title}
        selectLabel={t.operations.transfers.select}
        selectPlaceholder={t.operations.transfers.selectPlaceholder}
        entityType="FuelTransfer"
        logActivity={props.logActivity}
        permissions={props.permissions}
    />
};

const FuelDisbursementForm: React.FC<{
    formData: Omit<FuelDisbursement, 'id'>;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    isReadOnly: boolean;
    setFormData: React.Dispatch<React.SetStateAction<Omit<FuelDisbursement, 'id'>>>;
    props: FuelPageProps;
    onManageRecipientTypes: () => void;
}> = ({ formData, handleInputChange, isReadOnly, setFormData, props, onManageRecipientTypes }) => {
    const { t, language } = useTranslation();
    const inputClasses = "w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 transition focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 read-only:bg-slate-100 disabled:bg-slate-100";

    const recipientOptions = useMemo(() => {
        // Find the type details
        const currentType = props.fuelRecipientTypes.find(t => t.id === formData.recipientType);
        const typeNameEn = currentType?.nameEn || formData.recipientType;
        
        // Match by English name to determine behavior
        if (typeNameEn === 'Driver') return props.drivers.map(d => ({id: d.id, name: d.name}));
        if (typeNameEn === 'Employee') return props.employees.map(e => ({id: e.id, name: e.fullName}));
        if (typeNameEn === 'Vehicle') return [{id: 'some-vehicle-id', name: 'Vehicle-123'}];
        if (typeNameEn === 'Generator') return [{id: 'gen-main', name: 'Main Generator'}];
        
        return []; // For unknown types or no entities found
    }, [formData.recipientType, props.drivers, props.employees, props.fuelRecipientTypes]);

    useEffect(() => {
        const hasOptions = recipientOptions.length > 0;
        const isValid = recipientOptions.some(r => r.id === formData.recipientId);
        
        if (hasOptions && !isValid && formData.recipientId) {
             setFormData(prev => ({ ...prev, recipientId: '' }));
        }
    }, [formData.recipientType, recipientOptions, setFormData, formData.recipientId]);

    return (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormField label={t.operations.disbursements.recipientType} required>
                <div className="flex gap-2">
                    <select name="recipientType" value={formData.recipientType} onChange={handleInputChange} disabled={isReadOnly} className={`${inputClasses} flex-1`} required>
                        <option value="">--</option>
                        {props.fuelRecipientTypes.map(type => <option key={type.id} value={type.id}>{language === 'ar' ? type.nameAr : type.nameEn}</option>)}
                    </select>
                    <button onClick={onManageRecipientTypes} disabled={isReadOnly} className="p-2 bg-slate-200 rounded-md hover:bg-slate-300 disabled:bg-slate-100 disabled:cursor-not-allowed" title={t.operations.disbursements.manageRecipientTypes}>
                        <PencilIcon className="w-5 h-5" />
                    </button>
                </div>
            </FormField>
            <FormField label={t.operations.disbursements.recipient} required>
                {recipientOptions.length > 0 ? (
                    <select name="recipientId" value={formData.recipientId} onChange={handleInputChange} disabled={isReadOnly || !formData.recipientType} className={inputClasses} required>
                        <option value="">--</option>
                        {recipientOptions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                ) : (
                    <input 
                        type="text" 
                        name="recipientId"
                        value={formData.recipientId} 
                        onChange={handleInputChange} 
                        readOnly={isReadOnly || !formData.recipientType} 
                        className={inputClasses} 
                        placeholder={formData.recipientType ? "Enter Recipient Name/ID" : ""}
                    />
                )}
            </FormField>
            <FormField label={t.operations.disbursements.warehouse} required><select name="warehouseId" value={formData.warehouseId} onChange={handleInputChange} disabled={isReadOnly} className={inputClasses} required><option value="">--</option>{props.warehouses.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select></FormField>
            <FormField label={t.operations.disbursements.fuelType} required><select name="fuelTypeId" value={formData.fuelTypeId} onChange={handleInputChange} disabled={isReadOnly} className={inputClasses} required><option value="">--</option>{props.fuelTypes.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}</select></FormField>
            <FormField label={t.operations.disbursements.quantityIssued} required><input type="number" name="quantityIssued" value={formData.quantityIssued} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required/></FormField>
            <FormField label={t.operations.disbursements.issueDate} required><input type="date" name="issueDate" value={formData.issueDate} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required/></FormField>
            <FormField label={t.operations.disbursements.project}><select name="projectId" value={formData.projectId || ''} onChange={handleInputChange} disabled={isReadOnly} className={inputClasses}><option value="">--</option>{props.projects.map(p=><option key={p.id} value={p.id}>{language === 'ar' ? p.nameAr : p.nameEn}</option>)}</select></FormField>
            <div className="lg:col-span-3"><FormField label={t.operations.disbursements.notes}><textarea name="notes" value={formData.notes} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} rows={2}></textarea></FormField></div>
        </div>
    );
};

const FuelDisbursementComponent: React.FC<FuelPageProps> = (props) => {
    const { t, language } = useTranslation();
    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);

    // Helper to resolve recipient name for display in dropdown list
    const resolveRecipientName = useCallback((recipientType: string, recipientId: string) => {
        const currentType = props.fuelRecipientTypes.find(t => t.id === recipientType);
        const typeNameEn = currentType?.nameEn || recipientType;

        if (typeNameEn === 'Driver') {
            return props.drivers.find(d => d.id === recipientId)?.name || recipientId;
        }
        if (typeNameEn === 'Employee') {
            return props.employees.find(e => e.id === recipientId)?.fullName || recipientId;
        }
        if (typeNameEn === 'Vehicle') {
            return recipientId === 'some-vehicle-id' ? 'Vehicle-123' : recipientId;
        }
        if (typeNameEn === 'Generator') {
            return recipientId === 'gen-main' ? 'Main Generator' : recipientId;
        }
        return recipientId; // Fallback
    }, [props.drivers, props.employees, props.fuelRecipientTypes]);

    const itemsWithName = useMemo(() => props.fuelDisbursements.map(item => {
        const warehouse = props.warehouses.find(w => w.id === item.warehouseId)?.name || 'N/A';
        const recipientName = resolveRecipientName(item.recipientType, item.recipientId);
        return { ...item, name: `${recipientName} - ${item.quantityIssued}L from ${warehouse}` };
    }), [props.fuelDisbursements, props.warehouses, resolveRecipientName]);
    
    const getInitialFormState = useCallback(() => ({ recipientType: props.fuelRecipientTypes.length > 0 ? props.fuelRecipientTypes[0].id : '', recipientId: '', warehouseId: '', fuelTypeId: '', quantityIssued: 0, issueDate: new Date().toISOString().split('T')[0], projectId: '', notes: '' }), [props.fuelRecipientTypes]);

    return (
        <>
            <ManagementComponent<FuelDisbursement>
                items={itemsWithName}
                setItems={props.setFuelDisbursements}
                getInitialFormState={getInitialFormState}
                renderForm={(formData, handleInputChange, isReadOnly, setFormData) => (
                    <FuelDisbursementForm 
                        formData={formData} 
                        handleInputChange={handleInputChange}
                        isReadOnly={isReadOnly}
                        setFormData={setFormData}
                        props={props}
                        onManageRecipientTypes={() => setIsTypeModalOpen(true)}
                    />
                )}
                title={t.operations.disbursements.title}
                selectLabel={t.operations.disbursements.select}
                selectPlaceholder={t.operations.disbursements.selectPlaceholder}
                entityType="FuelDisbursement"
                logActivity={props.logActivity}
                permissions={props.permissions}
            />
            {isTypeModalOpen && <AttributeModal 
                isOpen={isTypeModalOpen}
                onClose={() => setIsTypeModalOpen(false)}
                items={props.fuelRecipientTypes}
                setItems={props.setFuelRecipientTypes}
                title={t.operations.disbursements.manageRecipientTypes}
                nameArLabel={t.operations.disbursements.recipientTypeNameAr}
                nameEnLabel={t.operations.disbursements.recipientTypeNameEn}
                permissions={props.permissions}
                logActivity={props.logActivity}
                entityType="FuelRecipientType"
            />}
        </>
    );
};

const FuelReportsComponent: React.FC<FuelPageProps> = (props) => {
    const { t, language } = useTranslation();
    const printableRef = useRef<HTMLDivElement>(null);
    const [filters, setFilters] = useState({
        warehouseId: 'ALL',
        fuelTypeId: 'ALL',
        supplierId: 'ALL',
        projectId: 'ALL',
        recipientId: 'ALL',
        startDate: '',
        endDate: new Date().toISOString().split('T')[0],
    });
    const [reportData, setReportData] = useState<any[] | null>(null);
    const inputClasses = "w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 transition focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleGenerateReport = () => {
        const { startDate, endDate, warehouseId, fuelTypeId, supplierId, projectId, recipientId } = filters;
        const sDate = startDate ? new Date(startDate) : null;
        if (sDate) sDate.setHours(0, 0, 0, 0);
        const eDate = endDate ? new Date(endDate) : null;
        if (eDate) eDate.setHours(23, 59, 59, 999);

        let transactions: any[] = [];
        props.fuelOpeningBalances.forEach(b => transactions.push({ ...b, type: 'OpeningBalanceEntry', date: b.balanceDate, inQty: b.quantity, outQty: 0, notes: b.notes || t.operations.fuelReports.openingBalance }));
        props.fuelSupplies.forEach(s => transactions.push({ ...s, type: 'Supply', date: s.supplyDate, inQty: s.quantitySupplied, outQty: 0 }));
        props.fuelDisbursements.forEach(d => transactions.push({ ...d, type: 'Disbursement', date: d.issueDate, inQty: 0, outQty: d.quantityIssued }));
        props.fuelTransfers.forEach(t => {
            transactions.push({ ...t, type: 'TransferOut', date: t.transferDate, warehouseId: t.fromWarehouseId, inQty: 0, outQty: t.quantity });
            transactions.push({ ...t, type: 'TransferIn', date: t.transferDate, warehouseId: t.toWarehouseId, inQty: t.quantity, outQty: 0 });
        });

        let filteredTransactions = transactions.filter(tx => 
            (warehouseId === 'ALL' || tx.warehouseId === warehouseId) &&
            (fuelTypeId === 'ALL' || tx.fuelTypeId === fuelTypeId) &&
            (supplierId === 'ALL' || (tx.type === 'Supply' && tx.supplierId === supplierId)) &&
            (projectId === 'ALL' || tx.projectId === projectId) &&
            (recipientId === 'ALL' || (tx.type === 'Disbursement' && tx.recipientId === recipientId))
        );
        filteredTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        let runningBalance = 0;
        let finalReportRows: any[] = [];

        if (sDate) {
            const preTransactions = filteredTransactions.filter(t => new Date(t.date) < sDate);
            preTransactions.forEach(t => { runningBalance += (t.inQty - t.outQty); });
            finalReportRows.push({ date: startDate, invoiceNumber: '-', type: t.operations.fuelReports.openingBalance, notes: '-', inQty: 0, outQty: 0, balance: runningBalance });
            filteredTransactions = filteredTransactions.filter(t => new Date(t.date) >= sDate && (!eDate || new Date(t.date) <= eDate));
        } else if (eDate) {
             filteredTransactions = filteredTransactions.filter(t => new Date(t.date) <= eDate);
        }

        filteredTransactions.forEach(t => {
            runningBalance += (t.inQty - t.outQty);
            finalReportRows.push({ ...t, balance: runningBalance });
        });
        setReportData(finalReportRows);
    };

    const handlePrint = () => {
        if (!printableRef.current) return;
        const { jsPDF } = window.jspdf;
        const input = printableRef.current;
        window.html2canvas(input, { scale: 2, useCORS: true }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'l', unit: 'mm', format: 'a4' });
            pdf.addImage(imgData, 'PNG', 10, 10, pdf.internal.pageSize.getWidth() - 20, 0);
            pdf.save(`Fuel-Report.pdf`);
        });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800">{t.operations.fuelReports.title}</h2>
            <div className="p-4 bg-slate-50 border rounded-lg space-y-4">
                <h3 className="text-lg font-semibold text-slate-700">{t.operations.fuelReports.filters}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     <FormField label={t.operations.fuelReports.warehouse}><select name="warehouseId" value={filters.warehouseId} onChange={handleFilterChange} className={inputClasses}><option value="ALL">{t.common.all}</option>{props.warehouses.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select></FormField>
                     <FormField label={t.operations.fuelReports.fuelType}><select name="fuelTypeId" value={filters.fuelTypeId} onChange={handleFilterChange} className={inputClasses}><option value="ALL">{t.common.all}</option>{props.fuelTypes.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}</select></FormField>
                     <FormField label={t.operations.fuelReports.supplier}><select name="supplierId" value={filters.supplierId} onChange={handleFilterChange} className={inputClasses}><option value="ALL">{t.common.all}</option>{props.fuelSuppliers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></FormField>
                     <FormField label={t.operations.fuelReports.project}><select name="projectId" value={filters.projectId} onChange={handleFilterChange} className={inputClasses}><option value="ALL">{t.common.all}</option>{props.projects.map(p=><option key={p.id} value={p.id}>{language==='ar' ? p.nameAr:p.nameEn}</option>)}</select></FormField>
                     <FormField label={t.operations.fuelReports.recipient}><select name="recipientId" value={filters.recipientId} onChange={handleFilterChange} className={inputClasses}><option value="ALL">{t.common.all}</option>{props.drivers.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></FormField>
                    <FormField label={t.operations.fuelReports.startDate}><input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className={inputClasses}/></FormField>
                    <FormField label={t.operations.fuelReports.endDate}><input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className={inputClasses}/></FormField>
                </div>
                <div className="pt-4 border-t">
                    <button onClick={handleGenerateReport} className="py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700">{t.operations.fuelReports.generateReport}</button>
                </div>
            </div>
             <div ref={printableRef} className="p-4 bg-white border rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-800">{t.operations.fuelReports.title}</h3>
                    {reportData && <button onClick={handlePrint} className="flex items-center gap-2 py-2 px-4 text-sm font-semibold bg-slate-600 text-white hover:bg-slate-700 rounded-lg"><PrinterIcon/> {t.operations.fuelReports.printReport}</button>}
                </div>
                {reportData ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead><tr className="bg-slate-100">
                                {Object.values(t.operations.fuelReports.headers).map(h=><th key={h} className="p-2 text-left font-semibold text-slate-700">{h}</th>)}
                            </tr></thead>
                            <tbody>{reportData.map((tx, i) => (
                                <tr key={String(i)} className="border-b">
                                     <td className="p-2 text-slate-800">{tx.date}</td>
                                     <td className="p-2 text-slate-800">{tx.invoiceNumber || tx.id || '-'}</td>
                                     <td className="p-2 text-slate-800">{tx.type}</td>
                                     <td className="p-2 text-slate-800">{tx.notes}</td>
                                     <td className="p-2 text-green-700 font-medium">{(tx.inQty > 0) ? tx.inQty.toFixed(2) : '-'}</td>
                                     <td className="p-2 text-red-700 font-medium">{(tx.outQty > 0) ? tx.outQty.toFixed(2) : '-'}</td>
                                     <td className="p-2 text-slate-800 font-bold">{tx.balance.toFixed(2)}</td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                ) : <div className="text-center p-8 bg-slate-100 rounded-lg">{t.operations.fuelReports.noReport}</div>}
            </div>
        </div>
    )
}

const FuelPage: React.FC<FuelPageProps> = (props) => {
    const { t } = useTranslation();
    const [view, setView] = useState('dashboard');
    
    const views = [
        { id: 'dashboard', title: t.operations.fuelTabs.dashboard },
        { id: 'types', title: t.operations.fuelTabs.types },
        { id: 'suppliers', title: t.operations.fuelTabs.suppliers },
        { id: 'openingBalances', title: t.operations.fuelTabs.openingBalances },
        { id: 'supplies', title: t.operations.fuelTabs.supplies },
        { id: 'transfers', title: t.operations.fuelTabs.transfers },
        { id: 'disbursements', title: t.operations.fuelTabs.disbursements },
        { id: 'reports', title: t.operations.fuelTabs.reports },
    ];

    const renderContent = () => {
        switch (view) {
            case 'dashboard': return <FuelDashboardComponent {...props} setView={setView} />;
            case 'types': return <FuelTypesComponent {...props} />;
            case 'suppliers': return <FuelSuppliersComponent {...props} />;
            case 'openingBalances': return <FuelOpeningBalancesComponent {...props} />;
            case 'supplies': return <FuelSupplyComponent {...props} />;
            case 'transfers': return <FuelTransferComponent {...props} />;
            case 'disbursements': return <FuelDisbursementComponent {...props} />;
            case 'reports': return <FuelReportsComponent {...props} />;
            default: return null;
        }
    };
    
    return (
        <div className="space-y-6">
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
        </div>
    );
}

export default FuelPage;