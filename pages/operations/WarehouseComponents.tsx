// pages/operations/WarehouseComponents.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../LanguageContext';
import { useToast } from '../../ToastContext';
import { PermissionActions } from '../../types';

export const FormField: React.FC<{ label: string; children: React.ReactNode; required?: boolean }> = ({ label, children, required }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
    </div>
);

export const ActionButtons: React.FC<{
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
    onBeforeSave?: (formData: Omit<T, 'id'>, mode: 'new' | 'edit', selectedId: string) => Promise<boolean>;
}

export const ManagementComponent = <T extends { id: string; name?: string } & Record<string, any>>({
    items, setItems, getInitialFormState, renderForm, title, selectLabel, selectPlaceholder, entityType, logActivity, permissions, onBeforeSave
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

    const handleAction = async (action: 'new' | 'save' | 'edit' | 'delete') => {
        if (action === 'new') {
            setSelectedId('');
            setMode('new');
            return;
        }

        if (action === 'save') {
            if (onBeforeSave) {
                const proceed = await onBeforeSave(formData, mode as 'new' | 'edit', selectedId);
                if (!proceed) {
                    return; // Stop the save process
                }
            }
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
             <style>{`
                .form-input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.375rem; background-color: #ffffff; color: #0f172a; }
                .form-input:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.3); }
                .form-input:read-only, .form-input:disabled { background-color: #f1f5f9; cursor: not-allowed; }
            `}</style>
        </div>
    );
};