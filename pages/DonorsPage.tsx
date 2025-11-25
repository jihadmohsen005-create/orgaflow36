import React, { useState, useEffect } from 'react';
import { Donor, PermissionActions } from '../types';
import { useTranslation } from '../LanguageContext';
import { ArrowDownTrayIcon } from '../components/icons';
import { useToast } from '../ToastContext';

interface DonorsPageProps {
  donors: Donor[];
  setDonors: React.Dispatch<React.SetStateAction<Donor[]>>;
  permissions: PermissionActions;
  logActivity: (args: { actionType: 'create' | 'update' | 'delete'; entityType: string; entityName: string; }) => void;
}

const initialFormState: Omit<Donor, 'id'> = {
  nameAr: '',
  nameEn: '',
  donorCode: '',
  contactPerson: '',
  phoneNumber: '',
  email: '',
  website: '',
};

const FormField: React.FC<{ label: string; children: React.ReactNode; required?: boolean }> = ({ label, children, required }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const DonorsPage: React.FC<DonorsPageProps> = ({ donors, setDonors, permissions, logActivity }) => {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  
  const [mode, setMode] = useState<'new' | 'view' | 'edit'>('new');
  const [selectedDonorId, setSelectedDonorId] = useState<string>('');
  const [formData, setFormData] = useState<Omit<Donor, 'id'>>(initialFormState);

  useEffect(() => {
    if (selectedDonorId) {
        const donor = donors.find(d => d.id === selectedDonorId);
        if (donor) {
            setFormData(donor);
            setMode('view');
        }
    } else {
        setFormData(initialFormState);
        setMode('new');
    }
  }, [selectedDonorId, donors]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const id = e.target.value;
      setSelectedDonorId(id);
  };

  const handleAction = (action: 'new' | 'save' | 'edit' | 'delete') => {
    if (action === 'new') {
      setSelectedDonorId('');
      setMode('new');
      return;
    }
    
    if (action === 'save') {
        const requiredFields = ['nameAr', 'nameEn'];
        const missing = requiredFields.filter(f => !formData[f as keyof typeof formData]);
        if(missing.length > 0) {
            showToast(t.common.fillRequiredFields, 'error');
            return;
        }

        if (mode === 'new') {
            const newDonor = { id: `donor${Date.now()}`, ...formData };
            setDonors(prev => [...prev, newDonor]);
            logActivity({ actionType: 'create', entityType: 'Donor', entityName: newDonor.nameEn });
            setSelectedDonorId(newDonor.id);
            setMode('view');
            showToast(t.common.createdSuccess, 'success');
        } else if (mode === 'edit') {
            setDonors(prev => prev.map(d => d.id === selectedDonorId ? { ...d, ...formData } : d));
            logActivity({ actionType: 'update', entityType: 'Donor', entityName: formData.nameEn });
            setMode('view');
            showToast(t.common.updatedSuccess, 'success');
        }
        return;
    }
    
    if (!selectedDonorId) return;

    if (action === 'edit') {
      setMode('edit');
    }
    
    if (action === 'delete') {
      // Future check: ensure donor is not linked to any project.
      const donorToDelete = donors.find(d => d.id === selectedDonorId);
      if (donorToDelete) {
        logActivity({ actionType: 'delete', entityType: 'Donor', entityName: donorToDelete.nameEn });
      }
      setDonors(prev => prev.filter(d => d.id !== selectedDonorId));
      setSelectedDonorId('');
      showToast(t.common.deletedSuccess, 'success');
    }
  };

  const handleExport = () => {
    const dataToExport = donors.map(d => ({
        [t.donors.nameAr]: d.nameAr,
        [t.donors.nameEn]: d.nameEn,
        [t.donors.donorCode]: d.donorCode,
        [t.donors.contactPerson]: d.contactPerson,
        [t.donors.phoneNumber]: d.phoneNumber,
        [t.donors.email]: d.email,
        [t.donors.website]: d.website,
    }));

    const ws = window.XLSX.utils.json_to_sheet(dataToExport);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Donors");
    window.XLSX.writeFile(wb, "Donors.xlsx");
    showToast(t.common.exportSuccess, 'success');
  };

  const isReadOnly = mode === 'view' || (mode === 'edit' && !permissions.update);
  const inputClasses = "w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-slate-900 transition focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 read-only:bg-slate-100 disabled:bg-slate-100 read-only:cursor-not-allowed disabled:cursor-not-allowed";
  const baseButtonClass = "px-6 py-2.5 text-white font-semibold rounded-md shadow-sm transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed";

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">{t.donors.title}</h1>
        <button onClick={handleExport} className="flex items-center gap-2 bg-green-600 text-white py-2 px-4 rounded-md shadow hover:bg-green-700 transition-colors font-semibold text-sm">
            <ArrowDownTrayIcon className="w-5 h-5" />
            {t.common.export}
        </button>
      </div>

      <div className="mb-6 p-4 bg-slate-50 border rounded-lg">
        <FormField label={t.donors.selectDonor}>
          <select value={selectedDonorId} onChange={handleSelectChange} className={inputClasses}>
            <option value="">{t.donors.selectDonorPlaceholder}</option>
            {donors.map(d => (
              <option key={d.id} value={d.id}>{language === 'ar' ? d.nameAr : d.nameEn}</option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
        <FormField label={t.donors.nameAr} required><input type="text" name="nameAr" value={formData.nameAr} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required/></FormField>
        <FormField label={t.donors.nameEn} required><input type="text" name="nameEn" value={formData.nameEn} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required/></FormField>
        <FormField label={t.donors.donorCode}><input type="text" name="donorCode" value={formData.donorCode} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} /></FormField>
        <FormField label={t.donors.contactPerson}><input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} /></FormField>
        <FormField label={t.donors.phoneNumber}><input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} /></FormField>
        <FormField label={t.donors.email}><input type="email" name="email" value={formData.email} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} /></FormField>
        <FormField label={t.donors.website}><input type="text" name="website" value={formData.website} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} /></FormField>
      </div>
      
      <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap justify-center items-center gap-3">
          <button onClick={() => handleAction('new')} disabled={!permissions.create} className={`${baseButtonClass} bg-indigo-600 hover:bg-indigo-700`}>{t.common.new}</button>
          <button onClick={() => handleAction('save')} disabled={mode === 'view' || (mode === 'new' ? !permissions.create : !permissions.update)} className={`${baseButtonClass} bg-blue-600 hover:bg-blue-700`}>{mode === 'new' ? t.common.add : t.common.save}</button>
          <button onClick={() => handleAction('edit')} disabled={mode !== 'view' || !permissions.update} className={`${baseButtonClass} bg-amber-500 hover:bg-amber-600`}>{t.common.edit}</button>
          <button onClick={() => handleAction('delete')} disabled={mode !== 'view' || !permissions.delete} className={`${baseButtonClass} bg-red-600 hover:bg-red-700`}>{t.common.delete}</button>
      </div>
    </div>
  );
};

export default DonorsPage;