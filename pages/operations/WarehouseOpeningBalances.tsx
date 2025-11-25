// pages/operations/WarehouseOpeningBalances.tsx
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from '../../LanguageContext';
import { PermissionActions, WarehouseItemOpeningBalance, WarehouseItem, Warehouse } from '../../types';
import { ManagementComponent, FormField } from './WarehouseComponents';

interface WarehouseOpeningBalancesProps {
    permissions: PermissionActions;
    logActivity: (args: any) => void;
    warehouseItemOpeningBalances: WarehouseItemOpeningBalance[]; 
    setWarehouseItemOpeningBalances: React.Dispatch<React.SetStateAction<WarehouseItemOpeningBalance[]>>;
    warehouseItems: WarehouseItem[];
    warehouses: Warehouse[];
}

const WarehouseOpeningBalances: React.FC<WarehouseOpeningBalancesProps> = (props) => {
    const { t } = useTranslation();
    const getInitialFormState = useCallback(() => ({ itemId: '', warehouseId: '', unit: '', quantity: 0, balanceDate: new Date().toISOString().split('T')[0] }), []);
    const itemsWithName = useMemo(() => (props.warehouseItemOpeningBalances || []).map(item => ({
        ...item,
        name: `${props.warehouseItems.find(i=>i.id===item.itemId)?.name || 'N/A'} @ ${props.warehouses.find(w=>w.id===item.warehouseId)?.name || 'N/A'}`
    })), [props.warehouseItemOpeningBalances, props.warehouseItems, props.warehouses]);
    
    return <ManagementComponent<WarehouseItemOpeningBalance>
        items={itemsWithName}
        setItems={props.setWarehouseItemOpeningBalances}
        getInitialFormState={getInitialFormState}
        renderForm={(formData, handleInputChange, isReadOnly) => (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label={t.operations.warehousesManagement.itemBalances.item} required><select name="itemId" value={formData.itemId} onChange={handleInputChange} disabled={isReadOnly} className="form-input" required><option value="">--</option>{props.warehouseItems.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}</select></FormField>
                <FormField label={t.operations.warehousesManagement.itemBalances.warehouse} required><select name="warehouseId" value={formData.warehouseId} onChange={handleInputChange} disabled={isReadOnly} className="form-input" required><option value="">--</option>{props.warehouses.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select></FormField>
                <FormField label={t.operations.warehousesManagement.itemBalances.unit}><input type="text" name="unit" value={formData.unit} onChange={handleInputChange} readOnly={isReadOnly} className="form-input"/></FormField>
                <FormField label={t.operations.warehousesManagement.itemBalances.quantity} required><input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} readOnly={isReadOnly} className="form-input" required/></FormField>
                <FormField label={t.operations.warehousesManagement.itemBalances.date} required><input type="date" name="balanceDate" value={formData.balanceDate} onChange={handleInputChange} readOnly={isReadOnly} className="form-input" required/></FormField>
            </div>
        )}
        title={t.operations.warehousesManagement.itemBalances.title}
        selectLabel={t.operations.warehousesManagement.itemBalances.select}
        selectPlaceholder={t.operations.warehousesManagement.itemBalances.selectPlaceholder}
        entityType="WarehouseItemOpeningBalance"
        logActivity={props.logActivity}
        permissions={props.permissions}
    />
};

export default WarehouseOpeningBalances;