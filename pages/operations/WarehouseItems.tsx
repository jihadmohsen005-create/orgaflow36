// pages/operations/WarehouseItems.tsx
import React, { useCallback } from 'react';
import { useTranslation } from '../../LanguageContext';
import { PermissionActions, WarehouseItem } from '../../types';
import { ManagementComponent, FormField } from './WarehouseComponents';

interface WarehouseItemsProps {
    permissions: PermissionActions;
    logActivity: (args: any) => void;
    warehouseItems: WarehouseItem[]; 
    setWarehouseItems: React.Dispatch<React.SetStateAction<WarehouseItem[]>>;
}

const WarehouseItems: React.FC<WarehouseItemsProps> = (props) => {
    const { t } = useTranslation();
    const getInitialFormState = useCallback(() => ({ name: '', description: '', category: '', unit: '', sku: '', minimumStock: 0 }), []);
     return <ManagementComponent<WarehouseItem>
        items={props.warehouseItems}
        setItems={props.setWarehouseItems}
        getInitialFormState={getInitialFormState}
        renderForm={(formData, handleInputChange, isReadOnly) => (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label={t.operations.warehousesManagement.items.name} required><input type="text" name="name" value={formData.name} onChange={handleInputChange} readOnly={isReadOnly} className="form-input" required/></FormField>
                <FormField label={t.operations.warehousesManagement.items.category}><input type="text" name="category" value={formData.category} onChange={handleInputChange} readOnly={isReadOnly} className="form-input"/></FormField>
                <FormField label={t.operations.warehousesManagement.items.unit}><input type="text" name="unit" value={formData.unit} onChange={handleInputChange} readOnly={isReadOnly} className="form-input"/></FormField>
                <FormField label={t.operations.warehousesManagement.items.sku}><input type="text" name="sku" value={formData.sku} onChange={handleInputChange} readOnly={isReadOnly} className="form-input"/></FormField>
                <FormField label={t.operations.warehousesManagement.items.minimumStock}><input type="number" name="minimumStock" value={formData.minimumStock} onChange={handleInputChange} readOnly={isReadOnly} className="form-input"/></FormField>
                <div className="md:col-span-2"><FormField label={t.operations.warehousesManagement.items.description}><textarea name="description" value={formData.description} onChange={handleInputChange} readOnly={isReadOnly} className="form-input" rows={2}></textarea></FormField></div>
            </div>
        )}
        title={t.operations.warehousesManagement.items.title}
        selectLabel={t.operations.warehousesManagement.items.select}
        selectPlaceholder={t.operations.warehousesManagement.items.selectPlaceholder}
        entityType="WarehouseItem"
        logActivity={props.logActivity}
        permissions={props.permissions}
    />
};

export default WarehouseItems;