import React, { useState, useEffect, useMemo } from 'react';
import { Employee, PermissionActions } from '../types';
import { useTranslation } from '../LanguageContext';
import { useToast } from '../ToastContext';
import { ArrowDownTrayIcon, SearchIcon } from '../components/icons';

interface EmployeesPageProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  permissions: PermissionActions;
  logActivity: (args: { actionType: 'create' | 'update' | 'delete'; entityType: string; entityName: string; }) => void;
}

const getInitialFormState = (): Omit<Employee, 'id'> => ({
    fullName: '',
    idNumber: '',
    dateOfBirth: '',
    socialStatus: 'Single',
    nationality: '',
    address: '',
    phone: '',
    email: '',
    familyMembers: 0,
    spouseName: '',
    spouseIdNumber: '',
    bloodType: '',
    qualification: '',
    specialization: '',
});

const FormField: React.FC<{ label: string; children: React.ReactNode; required?: boolean }> = ({ label, children, required }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
    </div>
);

const EmployeesPage: React.FC<EmployeesPageProps> = ({ employees, setEmployees, permissions, logActivity }) => {
    const { t } = useTranslation();
    const { showToast } = useToast();

    const [mode, setMode] = useState<'new' | 'view' | 'edit'>('new');
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
    const [formData, setFormData] = useState<Omit<Employee, 'id'>>(getInitialFormState());
    const [searchTerm, setSearchTerm] = useState('');

    const filteredEmployees = useMemo(() => {
        if (!searchTerm) return employees;
        const lowercasedTerm = searchTerm.toLowerCase();
        return employees.filter(e =>
            e.fullName.toLowerCase().includes(lowercasedTerm) ||
            e.idNumber.includes(lowercasedTerm)
        );
    }, [employees, searchTerm]);

    useEffect(() => {
        if (selectedEmployeeId) {
            const employee = employees.find(p => p.id === selectedEmployeeId);
            if (employee) {
                setFormData(employee);
                setMode('view');
            }
        } else {
            setFormData(getInitialFormState());
            setMode('new');
        }
    }, [selectedEmployeeId, employees]);

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedEmployeeId(e.target.value);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isNumber = type === 'number';
        setFormData(prev => ({ ...prev, [name]: isNumber ? parseInt(value) || 0 : value }));
    };

    const handleAction = (action: 'new' | 'save' | 'edit' | 'delete') => {
        if (action === 'new') {
            setSelectedEmployeeId('');
            setMode('new');
            return;
        }

        if (action === 'save') {
            if (!formData.fullName || !formData.idNumber) {
                const missingFields = [];
                if (!formData.fullName) missingFields.push(`'${t.humanResources.fullName}'`);
                if (!formData.idNumber) missingFields.push(`'${t.humanResources.idNumber}'`);
                showToast(`${t.common.fillRequiredFields}: ${missingFields.join(', ')}`, 'error');
                return;
            }

            if (mode === 'new') {
                const newEmployee = { id: `emp${Date.now()}`, ...formData };
                setEmployees(prev => [...prev, newEmployee]);
                logActivity({ actionType: 'create', entityType: 'Employee', entityName: newEmployee.fullName });
                setSelectedEmployeeId(newEmployee.id);
                setMode('view');
                showToast(t.common.createdSuccess, 'success');
            } else if (mode === 'edit') {
                setEmployees(prev => prev.map(p => p.id === selectedEmployeeId ? { id: p.id, ...formData } : p));
                logActivity({ actionType: 'update', entityType: 'Employee', entityName: formData.fullName });
                setMode('view');
                showToast(t.common.updatedSuccess, 'success');
            }
            return;
        }

        if (!selectedEmployeeId) return;

        if (action === 'edit') {
            setMode('edit');
        }

        if (action === 'delete') {
            const employeeToDelete = employees.find(p => p.id === selectedEmployeeId);
            if (employeeToDelete) {
                logActivity({ actionType: 'delete', entityType: 'Employee', entityName: employeeToDelete.fullName });
            }
            setEmployees(prev => prev.filter(p => p.id !== selectedEmployeeId));
            setSelectedEmployeeId('');
            showToast(t.common.deletedSuccess, 'success');
        }
    };

    const handleExport = () => {
        const dataToExport = employees.map(e => ({
            [t.humanResources.fullName]: e.fullName,
            [t.humanResources.idNumber]: e.idNumber,
            [t.humanResources.dateOfBirth]: e.dateOfBirth,
            [t.humanResources.socialStatus]: e.socialStatus,
            [t.humanResources.nationality]: e.nationality,
            [t.humanResources.address]: e.address,
            [t.humanResources.phone]: e.phone,
            [t.humanResources.email]: e.email,
            [t.humanResources.familyMembers]: e.familyMembers,
            [t.humanResources.spouseName]: e.spouseName || '',
            [t.humanResources.spouseIdNumber]: e.spouseIdNumber || '',
            [t.humanResources.bloodType]: e.bloodType,
            [t.humanResources.qualification]: e.qualification,
            [t.humanResources.specialization]: e.specialization,
        }));

        const ws = window.XLSX.utils.json_to_sheet(dataToExport);
        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, "Employees");
        window.XLSX.writeFile(wb, "Employees.xlsx");
        showToast(t.common.exportSuccess, 'success');
    };

    const isReadOnly = mode === 'view' || (mode === 'edit' && !permissions.update);
    const inputClasses = `w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-slate-900 transition focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 read-only:bg-slate-100 disabled:bg-slate-100 read-only:cursor-not-allowed disabled:cursor-not-allowed`;
    const baseButtonClass = "px-6 py-2.5 text-white font-semibold rounded-md shadow-sm transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed";
    
    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-200">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">{t.humanResources.title}</h1>
                <button onClick={handleExport} className="flex items-center gap-2 bg-green-600 text-white py-2 px-4 rounded-md shadow hover:bg-green-700 transition-colors font-semibold text-sm">
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    {t.common.export}
                </button>
            </div>

            <div className="mb-6 p-4 bg-slate-50 border rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label={t.humanResources.searchPlaceholder}>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder={t.humanResources.searchPlaceholder}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className={`${inputClasses} pl-10`}
                        />
                    </div>
                </FormField>
                <FormField label={t.humanResources.selectEmployee}>
                    <select value={selectedEmployeeId} onChange={handleSelectChange} className={inputClasses}>
                        <option value="">{t.humanResources.selectEmployeePlaceholder}</option>
                        {filteredEmployees.map(e => (
                            <option key={e.id} value={e.id}>{e.fullName}</option>
                        ))}
                    </select>
                </FormField>
            </div>
            
            <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FormField label={t.humanResources.fullName} required><input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required/></FormField>
                    <FormField label={t.humanResources.idNumber} required><input type="text" name="idNumber" value={formData.idNumber} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required/></FormField>
                    <FormField label={t.humanResources.dateOfBirth}><input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses}/></FormField>
                    <FormField label={t.humanResources.socialStatus}>
                        <select name="socialStatus" value={formData.socialStatus} onChange={handleInputChange} disabled={isReadOnly} className={inputClasses}>
                            {Object.entries(t.humanResources.socialStatuses).map(([key, value]) => <option key={key} value={key}>{value as string}</option>)}
                        </select>
                    </FormField>
                     {formData.socialStatus === 'Married' && (
                        <>
                            <FormField label={t.humanResources.spouseName}><input type="text" name="spouseName" value={formData.spouseName || ''} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses}/></FormField>
                            <FormField label={t.humanResources.spouseIdNumber}><input type="text" name="spouseIdNumber" value={formData.spouseIdNumber || ''} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses}/></FormField>
                        </>
                    )}
                    <FormField label={t.humanResources.familyMembers}><input type="number" name="familyMembers" value={formData.familyMembers} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses}/></FormField>
                    <FormField label={t.humanResources.bloodType}><input type="text" name="bloodType" value={formData.bloodType} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses}/></FormField>
                    <FormField label={t.humanResources.qualification}><input type="text" name="qualification" value={formData.qualification} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses}/></FormField>
                    <FormField label={t.humanResources.specialization}><input type="text" name="specialization" value={formData.specialization} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses}/></FormField>
                    <FormField label={t.humanResources.nationality}><input type="text" name="nationality" value={formData.nationality} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses}/></FormField>
                    <FormField label={t.humanResources.address}><input type="text" name="address" value={formData.address} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses}/></FormField>
                    <FormField label={t.humanResources.phone}><input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses}/></FormField>
                    <FormField label={t.humanResources.email}><input type="email" name="email" value={formData.email} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses}/></FormField>
                </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap justify-center items-center gap-3">
                <button onClick={() => handleAction('new')} disabled={!permissions.create} className={`${baseButtonClass} bg-indigo-600 hover:bg-indigo-700`}>{t.common.new}</button>
                <button onClick={() => handleAction('save')} disabled={mode === 'view' || (mode === 'new' ? !permissions.create : !permissions.update)} className={`${baseButtonClass} bg-blue-600 hover:bg-blue-700`}>{t.common.save}</button>
                <button onClick={() => handleAction('edit')} disabled={mode !== 'view' || !permissions.update} className={`${baseButtonClass} bg-amber-500 hover:bg-amber-600`}>{t.common.edit}</button>
                <button onClick={() => handleAction('delete')} disabled={mode !== 'view' || !permissions.delete} className={`${baseButtonClass} bg-red-600 hover:bg-red-700`}>{t.common.delete}</button>
            </div>
        </div>
    );
};

export default EmployeesPage;