// pages/operations/FleetPage.tsx
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from '../../LanguageContext';
import { 
    PermissionActions, 
    Driver, FleetTrip, Project, PaymentMethod, FuelDisbursement
} from '../../types';
import { PlusIcon, PencilIcon, TrashIcon, FleetIcon, CubeIcon as FuelIcon, UsersIcon, PrinterIcon, PurchaseOrderIcon } from '../../components/icons';
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
interface FleetPageProps {
    permissions: PermissionActions;
    logActivity: (args: any) => void;
    drivers: Driver[]; setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>;
    fleetTrips: FleetTrip[]; setFleetTrips: React.Dispatch<React.SetStateAction<FleetTrip[]>>;
    fuelDisbursements: FuelDisbursement[];
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

// #region Fleet Management Components
const FleetDashboardComponent: React.FC<FleetPageProps & { setView: (view: string) => void }> = (props) => {
    const { t } = useTranslation();
    
    const stats = useMemo(() => {
        const totalDistance = props.fleetTrips.reduce((acc, trip) => acc + trip.distanceKm, 0);
        const totalFuel = props.fleetTrips.reduce((acc, trip) => acc + trip.fuelRequired, 0);
        return {
            totalDrivers: props.drivers.length,
            totalTrips: props.fleetTrips.length,
            totalDistance: totalDistance,
            totalFuel: totalFuel
        };
    }, [props.drivers, props.fleetTrips]);
    
    const navCards = [
        { id: 'drivers', title: t.operations.tabs.drivers, icon: <UsersIcon className="w-8 h-8"/>, color: 'text-blue-500' },
        { id: 'fleetTrips', title: t.operations.tabs.fleetTrips, icon: <FleetIcon className="w-8 h-8"/>, color: 'text-teal-500' },
        { id: 'reports', title: t.operations.tabs.reports, icon: <PurchaseOrderIcon className="w-8 h-8"/>, color: 'text-green-500' },
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title={t.operations.fleetDashboard.totalDrivers} value={stats.totalDrivers} unit="" icon={<UsersIcon className="w-8 h-8 text-indigo-600"/>} />
                <StatCard title={t.operations.fleetDashboard.totalTrips} value={stats.totalTrips} unit="" icon={<FleetIcon className="w-8 h-8 text-green-600"/>} />
                <StatCard title={t.operations.fleetDashboard.totalDistance} value={stats.totalDistance} unit="Km" icon={<FuelIcon className="w-8 h-8 text-amber-600"/>} />
                <StatCard title={t.operations.fleetDashboard.totalFuel} value={stats.totalFuel} unit="Litre" icon={<FuelIcon className="w-8 h-8 text-red-600"/>} />
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

const FleetTripForm: React.FC<{
    formData: Omit<FleetTrip, 'id'>;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    isReadOnly: boolean;
    setFormData: React.Dispatch<React.SetStateAction<Omit<FleetTrip, 'id'>>>;
    props: FleetPageProps;
}> = ({ formData, handleInputChange, isReadOnly, setFormData, props }) => {
    const { t, language } = useTranslation();
    const inputClasses = "w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 transition focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 read-only:bg-slate-100 disabled:bg-slate-100";
    
    useEffect(() => {
        if (formData.odometerStart && formData.odometerEnd && formData.odometerEnd > formData.odometerStart) {
            const distance = formData.odometerEnd - formData.odometerStart;
            setFormData(prev => ({...prev, distanceKm: distance}));
        }
    }, [formData.odometerStart, formData.odometerEnd, setFormData]);

    // Calculate fuel required based on distance and km/l
    useEffect(() => {
        if (formData.distanceKm && formData.kmPerLitre && formData.kmPerLitre > 0) {
            const calculatedFuel = formData.distanceKm / formData.kmPerLitre;
            const roundedFuel = Math.round(calculatedFuel * 100) / 100;
            setFormData(prev => {
                if (prev.fuelRequired === roundedFuel) return prev;
                return { ...prev, fuelRequired: roundedFuel };
            });
        }
    }, [formData.distanceKm, formData.kmPerLitre, setFormData]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormField label={t.operations.fleetTrips.driver} required><select name="driverId" value={formData.driverId} onChange={handleInputChange} disabled={isReadOnly} className={inputClasses} required><option value="">--</option>{props.drivers.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></FormField>
            <FormField label={t.operations.fleetTrips.project} required><select name="projectId" value={formData.projectId} onChange={handleInputChange} disabled={isReadOnly} className={inputClasses} required><option value="">--</option>{props.projects.map(p=><option key={p.id} value={p.id}>{language === 'ar' ? p.nameAr : p.nameEn}</option>)}</select></FormField>
            <FormField label={t.operations.fleetTrips.date} required><input type="date" name="date" value={formData.date} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required/></FormField>
            <FormField label={t.operations.fleetTrips.odometerStart}><input type="number" name="odometerStart" value={formData.odometerStart} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} /></FormField>
            <FormField label={t.operations.fleetTrips.odometerEnd}><input type="number" name="odometerEnd" value={formData.odometerEnd} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} /></FormField>
            <FormField label={t.operations.fleetTrips.distanceKm}><input type="number" name="distanceKm" value={formData.distanceKm} onChange={handleInputChange} readOnly={isReadOnly} className={`${inputClasses} bg-slate-100`} /></FormField>
            <FormField label={t.operations.fleetTrips.kmPerLitre}><input type="number" name="kmPerLitre" value={formData.kmPerLitre} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} /></FormField>
            <FormField label={t.operations.fleetTrips.fuelRequired}><input type="number" name="fuelRequired" value={formData.fuelRequired} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} /></FormField>
            <FormField label={t.operations.fleetTrips.costRequired}><div className="flex"><input type="number" name="costRequired" value={formData.costRequired} onChange={handleInputChange} readOnly={isReadOnly} className={`${inputClasses} rounded-r-none`} /><select name="costCurrency" value={formData.costCurrency} onChange={handleInputChange} disabled={isReadOnly} className={`${inputClasses} rounded-l-none w-24`}><option value="ILS">ILS</option><option value="USD">USD</option></select></div></FormField>
            <FormField label={t.operations.fleetTrips.fromLocation}><input type="text" name="fromLocation" value={formData.fromLocation} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses}/></FormField>
            <FormField label={t.operations.fleetTrips.toLocation}><input type="text" name="toLocation" value={formData.toLocation} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses}/></FormField>
            <FormField label={t.operations.fleetTrips.movementType}><input type="text" name="movementType" value={formData.movementType} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses}/></FormField>
            <div className="lg:col-span-3"><FormField label={t.operations.fleetTrips.movementDetails}><textarea name="details" value={formData.details} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} rows={2}></textarea></FormField></div>
        </div>
    );
};

const FleetTripsComponent: React.FC<FleetPageProps> = (props) => {
    const { t } = useTranslation();
    const itemsWithName = useMemo(() => props.fleetTrips.map(item => {
        const driver = props.drivers.find(d => d.id === item.driverId)?.name || 'N/A';
        return { ...item, name: `${driver} - ${item.date}` };
    }), [props.fleetTrips, props.drivers]);
    const getInitialFormState = useCallback(() => ({ driverId: '', projectId: '', date: new Date().toISOString().split('T')[0], distanceKm: 0, odometerStart: 0, odometerEnd: 0, kmPerLitre: 0, fuelRequired: 0, costRequired: 0, costCurrency: 'ILS' as 'ILS', fromLocation: '', toLocation: '', movementType: '', details: '' }), []);

    return <ManagementComponent<FleetTrip>
        items={itemsWithName}
        setItems={props.setFleetTrips}
        getInitialFormState={getInitialFormState}
        renderForm={(formData, handleInputChange, isReadOnly, setFormData) => (
            <FleetTripForm 
                formData={formData}
                handleInputChange={handleInputChange}
                isReadOnly={isReadOnly}
                setFormData={setFormData}
                props={props}
            />
        )}
        title={t.operations.fleetTrips.title}
        selectLabel={t.operations.fleetTrips.select}
        selectPlaceholder={t.operations.fleetTrips.select}
        entityType="FleetTrip"
        logActivity={props.logActivity}
        permissions={props.permissions}
    />
};

const DriversComponent: React.FC<FleetPageProps> = (props) => {
    const { t, language } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const getInitialFormState = useCallback(() => ({ name: '', mobile: '', carType: '', carNumber: '', paymentMethodId: '', bankName: '', accountNumber: '', iban: '' }), []);
    const inputClasses = "w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 transition focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 read-only:bg-slate-100 disabled:bg-slate-100";

    return (
        <div>
            <ManagementComponent<Driver>
                items={props.drivers}
                setItems={props.setDrivers}
                getInitialFormState={getInitialFormState}
                renderForm={(formData, handleInputChange, isReadOnly) => (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FormField label={t.operations.drivers.name} required><input type="text" name="name" value={formData.name} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required/></FormField>
                        <FormField label={t.operations.drivers.mobile}><input type="text" name="mobile" value={formData.mobile} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} /></FormField>
                        <FormField label={t.operations.drivers.carType}><input type="text" name="carType" value={formData.carType} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} /></FormField>
                        <FormField label={t.operations.drivers.carNumber}><input type="text" name="carNumber" value={formData.carNumber} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} /></FormField>
                        <FormField label={t.operations.drivers.paymentMethod}>
                            <div className="flex gap-2">
                                <select name="paymentMethodId" value={formData.paymentMethodId} onChange={handleInputChange} disabled={isReadOnly} className={`${inputClasses} flex-grow`}><option value="">--</option>{props.paymentMethods.map(p=><option key={p.id} value={p.id}>{language === 'ar' ? p.nameAr : p.nameEn}</option>)}</select>
                                <button onClick={() => setIsModalOpen(true)} className="p-2 bg-slate-200 rounded-md hover:bg-slate-300"><PencilIcon /></button>
                            </div>
                        </FormField>
                        <FormField label={t.operations.drivers.bankName}><input type="text" name="bankName" value={formData.bankName} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} /></FormField>
                        <FormField label={t.operations.drivers.accountNumber}><input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} /></FormField>
                        <FormField label={t.operations.drivers.iban}><input type="text" name="iban" value={formData.iban} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} /></FormField>
                    </div>
                )}
                title={t.operations.drivers.title}
                selectLabel={t.operations.drivers.title}
                selectPlaceholder={t.operations.drivers.title}
                entityType="Driver"
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

const FleetReportsComponent: React.FC<FleetPageProps> = (props) => {
    const { t, language } = useTranslation();
    const { showToast } = useToast();
    const printableRef = useRef<HTMLDivElement>(null);
    const inputClasses = "w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 transition focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";
    
    type ReportType = 'tripLog' | 'driverSummary';
    const [reportType, setReportType] = useState<ReportType>('tripLog');
    const [filters, setFilters] = useState({
        driverId: 'ALL',
        projectId: 'ALL',
        startDate: '',
        endDate: new Date().toISOString().split('T')[0],
    });
    const [reportData, setReportData] = useState<any[] | null>(null);
    const [reportTitle, setReportTitle] = useState('');

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setReportData(null);
    };

    const handleGenerateReport = () => {
        let data = props.fleetTrips.filter(tx => {
            const txDate = new Date(tx.date);
            const startDate = filters.startDate ? new Date(filters.startDate) : null;
            const endDate = filters.endDate ? new Date(filters.endDate) : null;
            if (endDate) endDate.setHours(23, 59, 59, 999);
            return (
                (filters.driverId === 'ALL' || tx.driverId === filters.driverId) &&
                (filters.projectId === 'ALL' || tx.projectId === filters.projectId) &&
                (!startDate || txDate >= startDate) &&
                (!endDate || txDate <= endDate)
            );
        });

        if (reportType === 'tripLog') {
            setReportTitle(t.operations.fleetReports.buttons.tripLog);
            setReportData(data);
        } else if (reportType === 'driverSummary') {
            const summary = data.reduce((acc, trip) => {
                const driver = acc[trip.driverId] || { distance: 0, fuelRequired: 0, fuelDispensed: 0 };
                driver.distance += trip.distanceKm;
                driver.fuelRequired += trip.fuelRequired;
                acc[trip.driverId] = driver;
                return acc;
            }, {} as Record<string, { distance: number, fuelRequired: number, fuelDispensed: number }>);
            
            // Add dispensed fuel
            props.fuelDisbursements
                .filter(d => d.recipientType === 'frt1') // Assuming 'frt1' is Driver type
                .forEach(d => {
                    if (summary[d.recipientId]) {
                        summary[d.recipientId].fuelDispensed += d.quantityIssued;
                    }
                });

            const summaryData = Object.keys(summary).map((driverId) => {
                const totals = summary[driverId];
                return {
                    driver: props.drivers.find(d => d.id === driverId)?.name || 'Unknown',
                    ...totals,
                    balance: totals.fuelDispensed - totals.fuelRequired,
                };
            });
            setReportTitle(t.operations.fleetReports.buttons.driverSummary);
            setReportData(summaryData);
        }
    };
    
    const handlePrint = () => { showToast('Print functionality not implemented yet.', 'info'); };
    
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800">{t.operations.fleetReports.title}</h2>
            <div className="p-4 bg-slate-50 border rounded-lg space-y-4">
                <h3 className="text-lg font-semibold text-slate-700">{t.operations.fleetReports.filters}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField label={t.operations.fleetReports.driver}>
                        <select name="driverId" value={filters.driverId} onChange={handleFilterChange} className={inputClasses}><option value="ALL">{t.common.all}</option>{props.drivers.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select>
                    </FormField>
                    <FormField label={t.operations.fleetReports.project}>
                        <select name="projectId" value={filters.projectId} onChange={handleFilterChange} className={inputClasses}><option value="ALL">{t.common.all}</option>{props.projects.map(p=><option key={p.id} value={p.id}>{language==='ar' ? p.nameAr : p.nameEn}</option>)}</select>
                    </FormField>
                    <FormField label={t.operations.fleetReports.startDate}><input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className={inputClasses}/></FormField>
                    <FormField label={t.operations.fleetReports.endDate}><input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className={inputClasses}/></FormField>
                </div>
                <div className="flex items-center gap-4 pt-4 border-t">
                    <button onClick={() => setReportType('tripLog')} className={`px-4 py-2 text-sm font-semibold rounded-md ${reportType === 'tripLog' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100 border'}`}>{t.operations.fleetReports.buttons.tripLog}</button>
                    <button onClick={() => setReportType('driverSummary')} className={`px-4 py-2 text-sm font-semibold rounded-md ${reportType === 'driverSummary' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100 border'}`}>{t.operations.fleetReports.buttons.driverSummary}</button>
                    <button onClick={handleGenerateReport} className="py-2 px-4 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700">{t.operations.fleetReports.generateReport}</button>
                </div>
            </div>
             <div ref={printableRef} className="p-4 bg-white border rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-800">{reportTitle}</h3>
                    {reportData && <button onClick={handlePrint} className="flex items-center gap-2 py-2 px-4 text-sm font-semibold bg-slate-600 text-white hover:bg-slate-700 rounded-lg"><PrinterIcon/> {t.operations.fleetReports.printReport}</button>}
                </div>
                {reportData ? (
                    reportType === 'tripLog' ? (
                        <div className="overflow-x-auto"><table className="w-full text-sm">
                            <thead className="bg-slate-100"><tr>{Object.values(t.operations.fleetReports.headers).map(h=><th key={h} className="p-2 text-left font-semibold text-slate-700">{h}</th>)}</tr></thead>
                            <tbody>{reportData.map(d=>(<tr key={d.id} className="border-b">
                                <td className="p-2">{d.date}</td>
                                <td className="p-2">{props.drivers.find(dr=>dr.id === d.driverId)?.name}</td>
                                <td className="p-2">{props.projects.find(p=>p.id === d.projectId)?.[language==='ar'?'nameAr':'nameEn']}</td>
                                <td className="p-2">{d.distanceKm}</td>
                                <td className="p-2">{d.fuelRequired}</td>
                                <td className="p-2">{d.costRequired} {d.costCurrency}</td>
                                <td className="p-2">{d.fromLocation}</td>
                                <td className="p-2">{d.toLocation}</td>
                            </tr>))}</tbody>
                        </table></div>
                    ) : (
                         <div className="overflow-x-auto"><table className="w-full text-sm">
                            <thead className="bg-slate-100"><tr>{Object.values(t.operations.fleetReports.summaryHeaders).map(h=><th key={h} className="p-2 text-left font-semibold text-slate-700">{h}</th>)}</tr></thead>
                            <tbody>{reportData.map((d,i)=>(<tr key={i} className="border-b"><td className="p-2">{d.driver}</td>
                                <td className="p-2">{d.distance.toFixed(2)}</td>
                                <td className="p-2">{d.fuelRequired.toFixed(2)}</td>
                                <td className="p-2">{d.fuelDispensed.toFixed(2)}</td>
                                <td className="p-2">{d.balance.toFixed(2)}</td>
                            </tr>))}</tbody>
                        </table></div>
                    )
                ) : <div className="text-center p-8 bg-slate-100 rounded-lg">{t.operations.fleetReports.noReport}</div>}
            </div>
        </div>
    )
};
// #endregion

// #region Main Fleet Page Component
const FleetPage: React.FC<FleetPageProps> = (props) => {
    const { t } = useTranslation();
    const [view, setView] = useState('dashboard');

    const views = [
        { id: 'dashboard', title: t.operations.fleetDashboard.title },
        { id: 'drivers', title: t.operations.tabs.drivers },
        { id: 'fleetTrips', title: t.operations.tabs.fleetTrips },
        { id: 'reports', title: t.operations.tabs.reports },
    ];

    const renderContent = () => {
        switch (view) {
            case 'dashboard': return <FleetDashboardComponent {...props} setView={setView} />;
            case 'drivers': return <DriversComponent {...props} />;
            case 'fleetTrips': return <FleetTripsComponent {...props} />;
            case 'reports': return <FleetReportsComponent {...props} />;
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

export default FleetPage;
// #endregion