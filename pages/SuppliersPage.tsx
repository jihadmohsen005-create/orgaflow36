

import React, { useState, useEffect } from 'react';
import { Supplier, PermissionActions, SupplierAttachment, SupplierType, BusinessType } from '../types';
import { useTranslation } from '../LanguageContext';
import { GlobeIcon, ArrowDownTrayIcon, PaperClipIcon, TrashIcon, PlusIcon, PencilIcon } from '../components/icons';
import { useToast } from '../ToastContext';
import Modal from '../components/Modal';

interface AttributeModalProps<T extends { id: string; nameAr: string; nameEn: string }> {
  isOpen: boolean;
  onClose: () => void;
  items: T[];
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  title: string;
  nameArLabel: string;
  nameEnLabel: string;
  permissions: PermissionActions;
  logActivity: (args: any) => void;
  entityType: string;
}

const AttributeModal = <T extends { id: string; nameAr: string; nameEn: string }>({ isOpen, onClose, items, setItems, title, nameArLabel, nameEnLabel, permissions, logActivity, entityType }: AttributeModalProps<T>) => {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const [formData, setFormData] = useState<{ id: string | null; nameAr: string; nameEn: string }>({ id: null, nameAr: '', nameEn: '' });

  const handleSelect = (item: T) => setFormData({ id: item.id, nameAr: item.nameAr, nameEn: item.nameEn });
  const handleNew = () => setFormData({ id: null, nameAr: '', nameEn: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameAr || !formData.nameEn) {
        showToast(t.common.fillRequiredFields, 'error');
        return;
    }
    if (formData.id) { // Update
      const updatedItem = { ...formData, id: formData.id } as T;
      setItems(prev => prev.map(item => item.id === formData.id ? updatedItem : item));
      logActivity({ actionType: 'update', entityType, entityName: formData.nameEn });
      showToast(t.common.updatedSuccess, 'success');
    } else { // Create
      const newItem = { ...formData, id: `${entityType.toLowerCase()}-${Date.now()}` } as T;
      setItems(prev => [...prev, newItem]);
      logActivity({ actionType: 'create', entityType, entityName: formData.nameEn });
      setFormData(newItem);
      showToast(t.common.createdSuccess, 'success');
    }
  };
  
  const handleDelete = (id: string) => {
    // Note: Add check here to see if item is in use before deleting.
    const toDelete = items.find(i => i.id === id);
    if(toDelete) logActivity({ actionType: 'delete', entityType, entityName: toDelete.nameEn });
    setItems(prev => prev.filter(item => item.id !== id));
    if (formData.id === id) handleNew();
    showToast(t.common.deletedSuccess, 'success');
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="max-w-3xl">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ minHeight: '300px' }}>
            <div className="md:col-span-1 bg-slate-50 p-3 rounded-lg border flex flex-col">
                <button onClick={handleNew} disabled={!permissions.create} className="w-full mb-3 btn-primary flex items-center justify-center gap-2 disabled:bg-indigo-300">
                    <PlusIcon /> {t.common.new}
                </button>
                <div className="flex-grow overflow-y-auto">
                    {items.map(item => (
                        <div key={item.id} onClick={() => handleSelect(item)} className={`p-2 rounded-md cursor-pointer mb-1 flex justify-between items-center ${formData.id === item.id ? 'bg-indigo-200' : 'hover:bg-slate-200'}`}>
                            <span>{language === 'ar' ? item.nameAr : item.nameEn}</span>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} disabled={!permissions.delete} className="text-slate-400 hover:text-red-500 disabled:text-slate-300"><TrashIcon className="w-4 h-4" /></button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="md:col-span-2 p-2">
                <h3 className="text-xl font-bold text-slate-800 mb-4">{formData.id ? t.common.edit : t.common.add}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormField label={nameArLabel} required><input type="text" value={formData.nameAr} onChange={e => setFormData(f => ({...f, nameAr: e.target.value}))} className="form-input" required /></FormField>
                    <FormField label={nameEnLabel} required><input type="text" value={formData.nameEn} onChange={e => setFormData(f => ({...f, nameEn: e.target.value}))} className="form-input" required /></FormField>
                    <div className="pt-4 flex justify-end">
                        <button type="submit" disabled={formData.id ? !permissions.update : !permissions.create} className="btn-primary disabled:bg-indigo-300">{t.common.save}</button>
                    </div>
                </form>
            </div>
       </div>
    </Modal>
  )
}

interface SuppliersPageProps {
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  supplierTypes: SupplierType[];
  setSupplierTypes: React.Dispatch<React.SetStateAction<SupplierType[]>>;
  businessTypes: BusinessType[];
  setBusinessTypes: React.Dispatch<React.SetStateAction<BusinessType[]>>;
  permissions: PermissionActions;
  logActivity: (args: { actionType: 'create' | 'update' | 'delete'; entityType: string; entityName: string; }) => void;
}

const initialFormState: Omit<Supplier, 'id'> = {
  nameAr: '', nameEn: '', phone: '', phone2: '', address: '', licensedDealer: '',
  typeId: '', email: '', authorizedPerson: '', chairman: '', idNumber: '', businessId: '', attachments: [],
};

const FormField: React.FC<{ label: string; children: React.ReactNode; required?: boolean }> = ({ label, children, required }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const SuppliersPage: React.FC<SuppliersPageProps> = ({ suppliers, setSuppliers, supplierTypes, setSupplierTypes, businessTypes, setBusinessTypes, permissions, logActivity }) => {
  const { t, language, toggleLanguage } = useTranslation();
  const { showToast } = useToast();
  
  const [mode, setMode] = useState<'new' | 'view' | 'edit'>('new');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Omit<Supplier, 'id'>>(initialFormState);
  const [modalOpen, setModalOpen] = useState<'type' | 'business' | null>(null);
  const [newAttachmentDesc, setNewAttachmentDesc] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.nameEn.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const id = e.target.value;
      setSelectedSupplierId(id);
      if (id) {
          const supplier = suppliers.find(s => s.id === id);
          if (supplier) {
              setFormData({...initialFormState, ...supplier});
              setMode('view');
          }
      } else {
          setFormData(initialFormState);
          setMode('new');
      }
  };

  const handleAction = (action: 'add' | 'save' | 'edit' | 'delete' | 'back') => {
    if (action === 'back') {
      setSelectedSupplierId('');
      setFormData(initialFormState);
      setMode('new');
      return;
    }
    
    if (action === 'add') {
      if (mode === 'edit' || mode === 'view') {
        setSelectedSupplierId('');
        setFormData(initialFormState);
        setMode('new');
      } else {
         const missingFields = [];
         if (!formData.nameAr) missingFields.push(`'${t.suppliers.nameAr}'`);
         if (!formData.nameEn) missingFields.push(`'${t.suppliers.nameEn}'`);
         if (!formData.phone) missingFields.push(`'${t.suppliers.phone}'`);
         if (!formData.address) missingFields.push(`'${t.suppliers.address}'`);
         if (!formData.licensedDealer) missingFields.push(`'${t.suppliers.licensedDealer}'`);
         if (!formData.email) missingFields.push(`'${t.suppliers.email}'`);

         if (missingFields.length > 0) {
            showToast(`${t.common.fillRequiredFields}: ${missingFields.join(', ')}`, 'error');
            return;
         }
        const newSupplier = { id: `sup${Date.now()}`, ...formData };
        setSuppliers(prev => [...prev, newSupplier]);
        logActivity({ actionType: 'create', entityType: 'Supplier', entityName: newSupplier.nameEn });
        setSelectedSupplierId(newSupplier.id);
        setMode('view');
        showToast(t.common.createdSuccess, 'success');
      }
      return;
    }
    
    if (!selectedSupplierId) return;

    if (action === 'edit') {
      setMode('edit');
    }
    
    if (action === 'delete') {
      const supplierToDelete = suppliers.find(s => s.id === selectedSupplierId);
      if (supplierToDelete) {
        logActivity({ actionType: 'delete', entityType: 'Supplier', entityName: supplierToDelete.nameEn });
      }
      setSuppliers(prev => prev.filter(s => s.id !== selectedSupplierId));
      setSelectedSupplierId('');
      setFormData(initialFormState);
      setMode('new');
      showToast(t.common.deletedSuccess, 'success');
    }

    if (action === 'save') {
      const missingFields = [];
      if (!formData.nameAr) missingFields.push(`'${t.suppliers.nameAr}'`);
      if (!formData.nameEn) missingFields.push(`'${t.suppliers.nameEn}'`);
      if (!formData.phone) missingFields.push(`'${t.suppliers.phone}'`);
      if (!formData.address) missingFields.push(`'${t.suppliers.address}'`);
      if (!formData.licensedDealer) missingFields.push(`'${t.suppliers.licensedDealer}'`);
      if (!formData.email) missingFields.push(`'${t.suppliers.email}'`);

      if (missingFields.length > 0) {
          showToast(`${t.common.fillRequiredFields}: ${missingFields.join(', ')}`, 'error');
          return;
      }
      setSuppliers(prev => prev.map(s => s.id === selectedSupplierId ? { ...s, ...formData } : s));
      logActivity({ actionType: 'update', entityType: 'Supplier', entityName: formData.nameEn });
      setMode('view');
      showToast(t.common.updatedSuccess, 'success');
    }
  };

  const handleExport = () => {
    const dataToExport = suppliers.map(s => {
      const type = supplierTypes.find(t => t.id === s.typeId);
      const business = businessTypes.find(b => b.id === s.businessId);
      return {
        [t.suppliers.nameAr]: s.nameAr,
        [t.suppliers.nameEn]: s.nameEn,
        [t.suppliers.email]: s.email,
        [t.suppliers.phone]: s.phone,
        [t.suppliers.phone2]: s.phone2,
        [t.suppliers.address]: s.address,
        [t.suppliers.licensedDealer]: s.licensedDealer,
        [t.suppliers.idNumber]: s.idNumber,
        [t.suppliers.type]: type ? (language === 'ar' ? type.nameAr : type.nameEn) : '',
        [t.suppliers.business]: business ? (language === 'ar' ? business.nameAr : business.nameEn) : '',
        [t.suppliers.authorizedPerson]: s.authorizedPerson,
        [t.suppliers.chairman]: s.chairman,
      }
    });

    const ws = window.XLSX.utils.json_to_sheet(dataToExport);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Suppliers");
    window.XLSX.writeFile(wb, "Suppliers.xlsx");
    showToast(t.common.exportSuccess, 'success');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!newAttachmentDesc.trim()) {
        showToast(t.suppliers.attachmentDescriptionRequired, 'error');
        e.target.value = '';
        return;
    }
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
// FIX: Add missing 'data' and 'type' properties to conform to SupplierAttachment type.
        const newAttachment: SupplierAttachment = {
          id: `att-${Date.now()}`,
          name: file.name,
          description: newAttachmentDesc,
          data: reader.result as string,
          type: file.type,
        };
        setFormData(prev => ({
          ...prev,
          attachments: [...(prev.attachments || []), newAttachment],
        }));
        setNewAttachmentDesc('');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = (id: string) => {
    setFormData(prev => ({
        ...prev,
        attachments: prev.attachments?.filter(att => att.id !== id) || [],
    }));
  };
  
  const isReadOnly = mode === 'view' || (mode === 'edit' && !permissions.update);
  const inputClasses = "w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-slate-900 transition focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 read-only:bg-slate-100 disabled:bg-slate-100 read-only:cursor-not-allowed disabled:cursor-not-allowed";
  const baseButtonClass = "px-6 py-2.5 text-white font-semibold rounded-md shadow-sm transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed";
  
  return (
    <>
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
            <h1 className="text-3xl font-bold text-slate-800">{t.suppliers.formTitle}</h1>
            <button onClick={handleExport} className="flex items-center gap-2 bg-green-600 text-white py-2 px-4 rounded-md shadow hover:bg-green-700 transition-colors font-semibold text-sm">
                <ArrowDownTrayIcon className="w-5 h-5" />
                {t.common.export}
            </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 bg-slate-50 border rounded-lg">
            <FormField label={t.suppliers.search}>
                <input 
                    type="text" 
                    placeholder={t.suppliers.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={inputClasses}
                />
            </FormField>
            <FormField label={t.suppliers.select}>
                <select
                    value={selectedSupplierId}
                    onChange={handleSelectChange}
                    className={inputClasses}
                >
                    <option value="">{t.suppliers.selectPlaceholder}</option>
                    {filteredSuppliers.map(s => (
                        <option key={s.id} value={s.id}>{language === 'ar' ? s.nameAr : s.nameEn}</option>
                    ))}
                </select>
            </FormField>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
            <FormField label={t.suppliers.nameAr} required><input type="text" name="nameAr" value={formData.nameAr} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required /></FormField>
            <FormField label={t.suppliers.nameEn} required><input type="text" name="nameEn" value={formData.nameEn} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required /></FormField>
            <FormField label={t.suppliers.email} required><input type="email" name="email" value={formData.email} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required /></FormField>
            <FormField label={t.suppliers.phone} required><input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required /></FormField>
            <FormField label={t.suppliers.phone2}><input type="tel" name="phone2" value={formData.phone2} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} /></FormField>
            <FormField label={t.suppliers.address} required><input type="text" name="address" value={formData.address} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required /></FormField>
            <FormField label={t.suppliers.licensedDealer} required><input type="text" name="licensedDealer" value={formData.licensedDealer} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required /></FormField>
            <FormField label={t.suppliers.idNumber}><input type="text" name="idNumber" value={formData.idNumber} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} /></FormField>
            <FormField label={t.suppliers.type}>
                <div className="flex items-center gap-2 w-full">
                    <button type="button" onClick={() => setModalOpen('type')} className="p-2.5 border border-slate-300 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors">
                        <PencilIcon />
                    </button>
                    <select name="typeId" value={formData.typeId} onChange={handleInputChange} className={inputClasses} disabled={isReadOnly}>
                        <option value="">--</option>
                        {supplierTypes.map(t => <option key={t.id} value={t.id}>{language === 'ar' ? t.nameAr : t.nameEn}</option>)}
                    </select>
                </div>
            </FormField>
            <FormField label={t.suppliers.business}>
                 <div className="flex items-center gap-2 w-full">
                    <button type="button" onClick={() => setModalOpen('business')} className="p-2.5 border border-slate-300 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors">
                        <PencilIcon />
                    </button>
                    <select name="businessId" value={formData.businessId} onChange={handleInputChange} className={inputClasses} disabled={isReadOnly}>
                        <option value="">--</option>
                        {businessTypes.map(b => <option key={b.id} value={b.id}>{language === 'ar' ? b.nameAr : b.nameEn}</option>)}
                    </select>
                 </div>
            </FormField>
            <FormField label={t.suppliers.authorizedPerson}><input type="text" name="authorizedPerson" value={formData.authorizedPerson} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} /></FormField>
            <FormField label={t.suppliers.chairman}><input type="text" name="chairman" value={formData.chairman} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} /></FormField>
        </div>
        
        {/* Attachments Section */}
        <div className="mt-8 pt-6 border-t border-slate-200">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">{t.suppliers.attachments}</h3>
            {!isReadOnly && (
                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-3 p-3 border border-dashed border-slate-300 rounded-lg mb-4">
                    <input type="text" placeholder={t.suppliers.attachmentDescriptionPlaceholder} value={newAttachmentDesc} onChange={e => setNewAttachmentDesc(e.target.value)} className={inputClasses} />
                    <input type="file" onChange={handleFileChange} className={`${inputClasses} cursor-pointer`} />
                    <button className={`${baseButtonClass} bg-slate-600 hover:bg-slate-700`}>{t.suppliers.uploadFile}</button>
                </div>
            )}
            <div className="space-y-3">
                {formData.attachments && formData.attachments.map(att => (
                    <div key={att.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-md border">
                        <div className="flex-1 flex flex-col min-w-0">
                            <a href={att.data} download={att.name} className="flex items-center gap-2 text-sm text-indigo-600 hover:underline">
                                <PaperClipIcon className="w-4 h-4"/>
                                <span className="truncate">{att.name}</span>
                            </a>
                            <span className="text-xs text-slate-500 truncate">{att.description}</span>
                        </div>
                        <button onClick={() => removeAttachment(att.id)} disabled={mode === 'view'} className="text-red-500 hover:text-red-700 disabled:text-slate-300">
                            <TrashIcon />
                        </button>
                    </div>
                ))}
            </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 flex justify-center items-center gap-3">
            <button onClick={() => handleAction('add')} disabled={!permissions.create} className={`${baseButtonClass} bg-indigo-600 hover:bg-indigo-700`}>{t.common.add}</button>
            <button onClick={() => handleAction('save')} disabled={mode !== 'edit' || !permissions.update} className={`${baseButtonClass} bg-indigo-600 hover:bg-indigo-700`}>{t.common.save}</button>
            <button onClick={() => handleAction('edit')} disabled={mode !== 'view' || !permissions.update} className={`${baseButtonClass} bg-amber-500 hover:bg-amber-600`}>{t.common.edit}</button>
            <button onClick={() => handleAction('delete')} disabled={mode !== 'view' || !permissions.delete} className={`${baseButtonClass} bg-red-600 hover:bg-red-700`}>{t.common.delete}</button>
        </div>
      </div>
      
      {modalOpen === 'type' && <AttributeModal 
        isOpen={modalOpen === 'type'}
        onClose={() => setModalOpen(null)}
        items={supplierTypes}
        setItems={setSupplierTypes}
        title={t.suppliers.manageSupplierTypes}
        nameArLabel={t.suppliers.typeNameAr}
        nameEnLabel={t.suppliers.typeNameEn}
        permissions={permissions}
        logActivity={logActivity}
        entityType="SupplierType"
      />}

      {modalOpen === 'business' && <AttributeModal 
        isOpen={modalOpen === 'business'}
        onClose={() => setModalOpen(null)}
        items={businessTypes}
        setItems={setBusinessTypes}
        title={t.suppliers.manageBusinessTypes}
        nameArLabel={t.suppliers.businessNameAr}
        nameEnLabel={t.suppliers.businessNameEn}
        permissions={permissions}
        logActivity={logActivity}
        entityType="BusinessType"
      />}
    </>
  );
};

// FIX: Add missing default export.
export default SuppliersPage;
