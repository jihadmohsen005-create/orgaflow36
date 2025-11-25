// pages/operations/WarehouseManagement.tsx
import React, { useCallback } from 'react';
import { useTranslation } from '../../LanguageContext';
import { PermissionActions, Warehouse } from '../../types';
import { ManagementComponent, FormField } from './WarehouseComponents';

interface WarehouseManagementProps {
    permissions: PermissionActions;
    logActivity: (args: any) => void;
    warehouses: Warehouse[]; 
    setWarehouses: React.Dispatch<React.SetStateAction<Warehouse[]>>;
}

const WarehouseManagement: React.FC<WarehouseManagementProps> = (props) => {
    const { t } = useTranslation();
    const getInitialFormState = useCallback(() => ({ name: '', managerName: '', contactNumber: '', latitude: 0, longitude: 0, address: '', googleMapLink: '' }), []);
    return <ManagementComponent<Warehouse>
        items={props.warehouses}
        setItems={props.setWarehouses}
        getInitialFormState={getInitialFormState}
        renderForm={(formData, handleInputChange, isReadOnly) => (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label={t.operations.warehousesManagement.warehouses.name} required><input type="text" name="name" value={formData.name} onChange={handleInputChange} readOnly={isReadOnly} className="form-input" required/></FormField>
                <FormField label={t.operations.warehousesManagement.warehouses.manager}><input type="text" name="managerName" value={formData.managerName} onChange={handleInputChange} readOnly={isReadOnly} className="form-input" /></FormField>
                <FormField label={t.operations.warehousesManagement.warehouses.contact}><input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} readOnly={isReadOnly} className="form-input" /></FormField>
                <FormField label={t.operations.warehousesManagement.warehouses.address}><input type="text" name="address" value={formData.address} onChange={handleInputChange} readOnly={isReadOnly} className="form-input" /></FormField>
                <FormField label={t.operations.warehousesManagement.warehouses.latitude}><input type="number" name="latitude" value={formData.latitude} onChange={handleInputChange} readOnly={isReadOnly} className="form-input" /></FormField>
                <FormField label={t.operations.warehousesManagement.warehouses.longitude}><input type="number" name="longitude" value={formData.longitude} onChange={handleInputChange} readOnly={isReadOnly} className="form-input" /></FormField>
                <div className="md:col-span-2"><FormField label={t.operations.warehousesManagement.warehouses.googleMapLink}><input type="text" name="googleMapLink" value={formData.googleMapLink} onChange={handleInputChange} readOnly={isReadOnly} className="form-input" /></FormField></div>
            </div>
        )}
        title={t.operations.warehousesManagement.warehouses.title}
        selectLabel={t.operations.warehousesManagement.warehouses.select}
        selectPlaceholder={t.operations.warehousesManagement.warehouses.selectPlaceholder}
        entityType="Warehouse"
        logActivity={props.logActivity}
        permissions={props.permissions}
    />
};

export default WarehouseManagement;