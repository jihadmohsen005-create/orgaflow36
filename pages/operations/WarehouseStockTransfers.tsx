// pages/operations/WarehouseStockTransfers.tsx
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from '../../LanguageContext';
import { PermissionActions, WarehouseStockTransfer, WarehouseItem, Warehouse } from '../../types';
import { ManagementComponent, FormField } from './WarehouseComponents';

interface WarehouseStockTransfersProps {
    permissions: PermissionActions;
    logActivity: (args: any) => void;
    warehouseStockTransfers: WarehouseStockTransfer[]; 
    setWarehouseStockTransfers: React.Dispatch<React.SetStateAction<WarehouseStockTransfer[]>>;
    warehouseItems: WarehouseItem[];
    warehouses: Warehouse[];
}

const WarehouseStockTransfers: React.FC<WarehouseStockTransfersProps> = (props) => {
    const { t } = useTranslation();
    const getInitialFormState = useCallback(() => ({ itemId: '', fromWarehouseId: '', toWarehouseId: '', quantity: 0, transferDate: new Date().toISOString().split('T')[0], notes: '' }), []);
    const itemsWithName = useMemo(() => (props.warehouseStockTransfers || []).map(item => ({
        ...item,
        name: `${props.warehouseItems.find(i=>i.id===item.itemId)?.name || 'N/A'}: ${item.quantity} on ${item.transferDate}`
    })), [props.warehouseStockTransfers, props.warehouseItems]);
    
     return <ManagementComponent<WarehouseStockTransfer>
        items={itemsWithName}
        setItems={props.setWarehouseStockTransfers}
        getInitialFormState={getInitialFormState}
        renderForm={(formData, handleInputChange, isReadOnly) => (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label={t.operations.warehousesManagement.stockTransfers.item} required><select name="itemId" value={formData.itemId} onChange={handleInputChange} disabled={isReadOnly} className="form-input" required><option value="">--</option>{props.warehouseItems.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}</select></FormField>
                <FormField label={t.operations.warehousesManagement.stockTransfers.quantity} required><input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} readOnly={isReadOnly} className="form-input" required/></FormField>
                <FormField label={t.operations.warehousesManagement.stockTransfers.fromWarehouse} required><select name="fromWarehouseId" value={formData.fromWarehouseId} onChange={handleInputChange} disabled={isReadOnly} className="form-input" required><option value="">--</option>{props.warehouses.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select></FormField>
                <FormField label={t.operations.warehousesManagement.stockTransfers.toWarehouse} required><select name="toWarehouseId" value={formData.toWarehouseId} onChange={handleInputChange} disabled={isReadOnly} className="form-input" required><option value="">--</option>{props.warehouses.filter(w => w.id !== formData.fromWarehouseId).map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select></FormField>
                <FormField label={t.operations.warehousesManagement.stockTransfers.date} required><input type="date" name="transferDate" value={formData.transferDate} onChange={handleInputChange} readOnly={isReadOnly} className="form-input" required/></FormField>
                <div className="md:col-span-2"><FormField label={t.operations.warehousesManagement.stockTransfers.notes}><textarea name="notes" value={formData.notes} onChange={handleInputChange} readOnly={isReadOnly} className="form-input" rows={2}></textarea></FormField></div>
            </div>
        )}
        title={t.operations.warehousesManagement.stockTransfers.title}
        selectLabel={t.operations.warehousesManagement.stockTransfers.select}
        selectPlaceholder={t.operations.warehousesManagement.stockTransfers.selectPlaceholder}
        entityType="WarehouseStockTransfer"
        logActivity={props.logActivity}
        permissions={props.permissions}
    />
};

export default WarehouseStockTransfers;