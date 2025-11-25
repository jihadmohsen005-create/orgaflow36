// pages/operations/WarehouseEntities.tsx
import React, { useCallback } from 'react';
import { useTranslation } from '../../LanguageContext';
import { PermissionActions, WarehouseEntity } from '../../types';
import { ManagementComponent, FormField } from './WarehouseComponents';

interface WarehouseEntitiesProps {
    permissions: PermissionActions;
    logActivity: (args: any) => void;
    warehouseEntities: WarehouseEntity[]; 
    setWarehouseEntities: React.Dispatch<React.SetStateAction<WarehouseEntity[]>>;
}

const WarehouseEntities: React.FC<WarehouseEntitiesProps> = (props) => {
    const { t } = useTranslation();
    const getInitialFormState = useCallback(() => ({ name: '', entityType: 'Receiver' as 'Receiver', contactPerson: '', contactNumber: '', address: '', notes: '' }), []);
    return <ManagementComponent<WarehouseEntity>
        items={props.warehouseEntities}
        setItems={props.setWarehouseEntities}
        getInitialFormState={getInitialFormState}
        renderForm={(formData, handleInputChange, isReadOnly) => (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label={t.operations.warehousesManagement.entities.name} required><input type="text" name="name" value={formData.name} onChange={handleInputChange} readOnly={isReadOnly} className="form-input" required/></FormField>
                <FormField label={t.operations.warehousesManagement.entities.type}><select name="entityType" value={formData.entityType} onChange={handleInputChange} disabled={isReadOnly} className="form-input"><option value="Receiver">{t.operations.warehousesManagement.entities.types.Receiver}</option><option value="Deliverer">{t.operations.warehousesManagement.entities.types.Deliverer}</option></select></FormField>
                <FormField label={t.operations.warehousesManagement.entities.contactPerson}><input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} readOnly={isReadOnly} className="form-input"/></FormField>
                <FormField label={t.operations.warehousesManagement.entities.contactNumber}><input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} readOnly={isReadOnly} className="form-input"/></FormField>
                <div className="md:col-span-2"><FormField label={t.operations.warehousesManagement.entities.address}><input type="text" name="address" value={formData.address} onChange={handleInputChange} readOnly={isReadOnly} className="form-input"/></FormField></div>
                <div className="md:col-span-2"><FormField label={t.operations.warehousesManagement.entities.notes}><textarea name="notes" value={formData.notes} onChange={handleInputChange} readOnly={isReadOnly} className="form-input" rows={2}></textarea></FormField></div>
            </div>
        )}
        title={t.operations.warehousesManagement.entities.title}
        selectLabel={t.operations.warehousesManagement.entities.select}
        selectPlaceholder={t.operations.warehousesManagement.entities.selectPlaceholder}
        entityType="WarehouseEntity"
        logActivity={props.logActivity}
        permissions={props.permissions}
    />
};

export default WarehouseEntities;