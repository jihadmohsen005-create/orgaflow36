// pages/operations/WarehouseInvoices.tsx
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from '../../LanguageContext';
import { 
    PermissionActions, 
    Warehouse, WarehouseEntity, WarehouseItem, WarehouseInvoice, WarehouseItemOpeningBalance, WarehouseStockTransfer,
    Project, WarehouseInvoiceDetail
} from '../../types';
import { ManagementComponent, FormField } from './WarehouseComponents';
import { PlusIcon, TrashIcon } from '../../components/icons';
import { useToast } from '../../ToastContext';

interface WarehouseInvoicesProps {
    permissions: PermissionActions;
    logActivity: (args: any) => void;
    warehouses: Warehouse[];
    warehouseEntities: WarehouseEntity[];
    warehouseItems: WarehouseItem[];
    warehouseInvoices: WarehouseInvoice[]; 
    setWarehouseInvoices: React.Dispatch<React.SetStateAction<WarehouseInvoice[]>>;
    warehouseItemOpeningBalances: WarehouseItemOpeningBalance[];
    warehouseStockTransfers: WarehouseStockTransfer[];
    projects: Project[];
    invoiceType: 'Supply' | 'Dispatch';
}

const WarehouseInvoices: React.FC<WarehouseInvoicesProps> = (props) => {
    const { t, language } = useTranslation();
    const { invoiceType } = props;
    const { showToast } = useToast();
    const title = invoiceType === 'Supply' ? t.operations.warehousesManagement.supplyInvoices.title : t.operations.warehousesManagement.dispatchInvoices.title;

    const getInitialFormState = useCallback((): Omit<WarehouseInvoice, 'id'> => ({
        invoiceNumber: '',
        invoiceType: invoiceType,
        warehouseId: '',
        entityId: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        projectId: '',
        remarks: '',
        details: [],
    }), [invoiceType]);
    
    const itemsWithName = useMemo(() => (props.warehouseInvoices || []).filter(i => i.invoiceType === invoiceType).map(item => ({
        ...item,
        name: `${item.invoiceNumber} - ${item.invoiceDate}`
    })), [props.warehouseInvoices, invoiceType]);
    
    const handleBeforeDispatchSave = useCallback(async (formData: Omit<WarehouseInvoice, 'id'>, mode: 'new' | 'edit', selectedId: string): Promise<boolean> => {
        if (formData.invoiceType !== 'Dispatch') return true;
        
        const calculateStock = (itemId: string, warehouseId: string, invoiceToExcludeId?: string): number => {
            let balance = 0;
            (props.warehouseItemOpeningBalances || []).filter(b => b.itemId === itemId && b.warehouseId === warehouseId).forEach(b => balance += b.quantity);
            (props.warehouseInvoices || []).forEach(inv => {
                if (inv.id === invoiceToExcludeId) return;
                if (inv.warehouseId === warehouseId) {
                    (inv.details || []).forEach(d => {
                        if (d.itemId === itemId) {
                            if (inv.invoiceType === 'Supply') balance += d.quantity;
                            else if (inv.invoiceType === 'Dispatch') balance -= d.quantity;
                        }
                    });
                }
            });
            (props.warehouseStockTransfers || []).forEach(transfer => {
                if (transfer.itemId === itemId) {
                    if (transfer.toWarehouseId === warehouseId) balance += transfer.quantity;
                    if (transfer.fromWarehouseId === warehouseId) balance -= transfer.quantity;
                }
            });
            return balance;
        };
        
        for (const detail of (formData.details || [])) {
            if (!detail.itemId || detail.quantity <= 0) continue;
            const item = props.warehouseItems.find(i => i.id === detail.itemId);
            if (!item) continue;
            const availableStock = calculateStock(detail.itemId, formData.warehouseId, mode === 'edit' ? selectedId : undefined);
            if (detail.quantity > availableStock) {
                showToast(
                    t.operations.warehousesManagement.invoices.stockAvailabilityWarning
                        .replace('{itemName}', item.name)
                        .replace('{quantity}', String(detail.quantity))
                        .replace('{availableStock}', String(availableStock)),
                    'error'
                );
                return false;
            }
        }
        return true;
    }, [t, showToast, props.warehouseInvoices, props.warehouseItemOpeningBalances, props.warehouseStockTransfers, props.warehouseItems]);

    const renderForm = useCallback((
        formData: Omit<WarehouseInvoice, 'id'>, 
        handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void, 
        isReadOnly: boolean, 
        setFormData: React.Dispatch<React.SetStateAction<Omit<WarehouseInvoice, 'id'>>>
    ) => {
        const handleDetailChange = (index: number, field: keyof WarehouseInvoiceDetail, value: any) => {
            const newDetails = [...(formData.details || [])];
            (newDetails[index] as any)[field] = value;
            setFormData(prev => ({ ...prev, details: newDetails }));
        };

        const addDetail = () => {
            const newDetail = { id: `detail-${Date.now()}`, itemId: '', quantity: 0, unit: '', note: '' };
            setFormData(prev => ({...prev, details: [...(prev.details || []), newDetail]}));
        };

        const removeDetail = (index: number) => {
            setFormData(prev => ({...prev, details: (prev.details || []).filter((_, i) => i !== index)}));
        };
        
        const filteredEntities = props.warehouseEntities.filter(e => 
            invoiceType === 'Supply' ? e.entityType === 'Deliverer' : e.entityType === 'Receiver'
        );

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg bg-slate-50">
                    <FormField label={t.operations.warehousesManagement.invoices.invoiceNumber} required><input type="text" name="invoiceNumber" value={formData.invoiceNumber} onChange={handleInputChange} readOnly={isReadOnly} className="form-input" required/></FormField>
                    <FormField label={t.operations.warehousesManagement.invoices.date} required><input type="date" name="invoiceDate" value={formData.invoiceDate} onChange={handleInputChange} readOnly={isReadOnly} className="form-input" required/></FormField>
                    <FormField label={t.operations.warehousesManagement.invoices.warehouse} required><select name="warehouseId" value={formData.warehouseId} onChange={handleInputChange} disabled={isReadOnly} className="form-input" required><option value="">--</option>{props.warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></FormField>
                    <FormField label={t.operations.warehousesManagement.invoices.entity} required><select name="entityId" value={formData.entityId} onChange={handleInputChange} disabled={isReadOnly} className="form-input" required><option value="">--</option>{filteredEntities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></FormField>
                    <FormField label={t.operations.warehousesManagement.invoices.project}><select name="projectId" value={formData.projectId} onChange={handleInputChange} disabled={isReadOnly} className="form-input"><option value="">--</option>{props.projects.map(p => <option key={p.id} value={p.id}>{language === 'ar' ? p.nameAr : p.nameEn}</option>)}</select></FormField>
                    <div className="lg:col-span-3"><FormField label={t.operations.warehousesManagement.invoices.remarks}><textarea name="remarks" value={formData.remarks} onChange={handleInputChange} readOnly={isReadOnly} className="form-input" rows={2}></textarea></FormField></div>
                </div>
                
                <div>
                    <h3 className="text-lg font-bold text-slate-700 mb-2">{t.operations.warehousesManagement.invoices.details}</h3>
                    <div className="space-y-2">
                        {(formData.details || []).map((detail, index) => (
                            <div key={detail.id} className="grid grid-cols-1 sm:grid-cols-[3fr_1fr_1fr_2fr_auto] gap-2 items-end p-2 border rounded-md bg-white">
                                <FormField label={t.operations.warehousesManagement.invoices.item}><select value={detail.itemId} onChange={e => handleDetailChange(index, 'itemId', e.target.value)} disabled={isReadOnly} className="form-input"><option value="">--</option>{props.warehouseItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}</select></FormField>
                                 <FormField label={t.operations.warehousesManagement.invoices.quantity}><input type="number" value={detail.quantity} onChange={e => handleDetailChange(index, 'quantity', parseFloat(e.target.value))} readOnly={isReadOnly} className="form-input"/></FormField>
                                 <FormField label={t.operations.warehousesManagement.invoices.unit}><input type="text" value={detail.unit} onChange={e => handleDetailChange(index, 'unit', e.target.value)} readOnly={isReadOnly} className="form-input"/></FormField>
                                 <FormField label={t.operations.warehousesManagement.invoices.note}><input type="text" value={detail.note} onChange={e => handleDetailChange(index, 'note', e.target.value)} readOnly={isReadOnly} className="form-input"/></FormField>
                                 {!isReadOnly && <button onClick={() => removeDetail(index)} className="p-2 text-red-500 hover:text-red-700 h-10"><TrashIcon/></button>}
                            </div>
                        ))}
                    </div>
                     {!isReadOnly && <button onClick={addDetail} className="mt-2 flex items-center gap-1 text-sm font-semibold text-indigo-600"><PlusIcon className="w-4 h-4"/>{t.operations.warehousesManagement.invoices.addItem}</button>}
                </div>
            </div>
        );
    }, [t, language, props.warehouses, props.warehouseEntities, props.projects, props.warehouseItems, invoiceType]);

    return <ManagementComponent<WarehouseInvoice>
        items={itemsWithName}
        setItems={props.setWarehouseInvoices}
        getInitialFormState={getInitialFormState}
        renderForm={renderForm}
        title={title}
        selectLabel={t.operations.warehousesManagement.invoices.select}
        selectPlaceholder={t.operations.warehousesManagement.invoices.selectPlaceholder}
        entityType="WarehouseInvoice"
        logActivity={props.logActivity}
        permissions={props.permissions}
        onBeforeSave={invoiceType === 'Dispatch' ? handleBeforeDispatchSave : undefined}
    />
};

export default WarehouseInvoices;