

import React, { useState, useEffect } from 'react';
import { Department, PermissionActions } from '../types';
import { useTranslation } from '../LanguageContext';
import { useToast } from '../ToastContext';
import Modal from '../components/Modal';
import { PlusIcon, PencilIcon, TrashIcon } from '../components/icons';

interface DepartmentsPageProps {
  departments: Department[];
  setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
  permissions: PermissionActions;
  logActivity: (args: { actionType: 'create' | 'update' | 'delete'; entityType: string; entityName: string; }) => void;
}

const FormField: React.FC<{ label: string; children: React.ReactNode; required?: boolean }> = ({ label, children, required }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
    </div>
);

const DepartmentsPage: React.FC<DepartmentsPageProps> = ({ departments, setDepartments, permissions, logActivity }) => {
    const { t, language } = useTranslation();
    const { showToast } = useToast();

    const [mode, setMode] = useState<'new' | 'view' | 'edit'>('new');
    const [selectedId, setSelectedId] = useState<string>('');
    const [formData, setFormData] = useState<Omit<Department, 'id'>>({ nameAr: '', nameEn: '' });

    useEffect(() => {
        if (selectedId) {
            const dept = departments.find(d => d.id === selectedId);
            if (dept) {
                setFormData(dept);
                setMode('view');
            }
        } else {
            setFormData({ nameAr: '', nameEn: '' });
            setMode('new');
        }
    }, [selectedId, departments]);

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedId(e.target.value);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAction = (action: 'new' | 'save' | 'edit' | 'delete') => {
        if (action === 'new') {
            setSelectedId('');
            setMode('new');
            return;
        }

        if (action === 'save') {
            if (!formData.nameAr || !formData.nameEn) {
                showToast(t.common.fillRequiredFields, 'error');
                return;
            }

            if (mode === 'new') {
                const newDept = { id: `dept-${Date.now()}`, ...formData };
                setDepartments(prev => [...prev, newDept]);
                logActivity({ actionType: 'create', entityType: 'Department', entityName: newDept.nameEn });
                setSelectedId(newDept.id);
                setMode('view');
                showToast(t.departments.createdSuccess, 'success');
            } else if (mode === 'edit') {
                setDepartments(prev => prev.map(d => d.id === selectedId ? { ...d, ...formData } : d));
                logActivity({ actionType: 'update', entityType: 'Department', entityName: formData.nameEn });
                setMode('view');
                showToast(t.departments.updatedSuccess, 'success');
            }
            return;
        }

        if (!selectedId) return;

        if (action === 'edit') {
            setMode('edit');
        }

        if (action === 'delete') {
            const toDelete = departments.find(d => d.id === selectedId);
            if (toDelete) {
                logActivity({ actionType: 'delete', entityType: 'Department', entityName: toDelete.nameEn });
            }
            setDepartments(prev => prev.filter(d => d.id !== selectedId));
            setSelectedId('');
            showToast(t.departments.deletedSuccess, 'success');
        }
    };

    const isReadOnly = mode === 'view' || (mode === 'edit' && !permissions.update);
    const inputClasses = `w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-slate-900 transition focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 read-only:bg-slate-100 disabled:bg-slate-100 read-only:cursor-not-allowed disabled:cursor-not-allowed`;
    const baseButtonClass = "px-6 py-2.5 text-white font-semibold rounded-md shadow-sm transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed";

    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-6">{t.departments.title}</h1>

            <div className="mb-6 p-4 bg-slate-50 border rounded-lg">
                <FormField label={t.departments.select}>
                    <select value={selectedId} onChange={handleSelectChange} className={inputClasses}>
                        <option value="">{t.departments.selectPlaceholder}</option>
                        {departments.map(d => (
                            <option key={d.id} value={d.id}>{language === 'ar' ? d.nameAr : d.nameEn}</option>
                        ))}
                    </select>
                </FormField>
            </div>

            <div className="space-y-5 border-t pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label={t.departments.nameAr} required>
                        <input type="text" name="nameAr" value={formData.nameAr} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required />
                    </FormField>
                    <FormField label={t.departments.nameEn} required>
                        <input type="text" name="nameEn" value={formData.nameEn} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required />
                    </FormField>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 flex justify-center items-center gap-3">
                <button onClick={() => handleAction('new')} disabled={!permissions.create} className={`${baseButtonClass} bg-indigo-600 hover:bg-indigo-700`}>{t.common.new}</button>
                <button onClick={() => handleAction('save')} disabled={mode === 'view' || (mode === 'new' ? !permissions.create : !permissions.update)} className={`${baseButtonClass} bg-blue-600 hover:bg-blue-700`}>{t.common.save}</button>
                <button onClick={() => handleAction('edit')} disabled={mode !== 'view' || !permissions.update} className={`${baseButtonClass} bg-amber-500 hover:bg-amber-600`}>{t.common.edit}</button>
                <button onClick={() => handleAction('delete')} disabled={mode !== 'view' || !permissions.delete} className={`${baseButtonClass} bg-red-600 hover:bg-red-700`}>{t.common.delete}</button>
            </div>
        </div>
    );
};

export default DepartmentsPage;
