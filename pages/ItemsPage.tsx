

import React, { useState, useEffect } from 'react';
import { Item, ItemCategory, PermissionActions } from '../types';
import Modal from '../components/Modal';
import { CategoryIcon, PlusIcon, TrashIcon, PencilIcon, ArrowDownTrayIcon } from '../components/icons';
import { useTranslation } from '../LanguageContext';
import { useToast } from '../ToastContext';

interface ItemCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ItemCategory[];
  setCategories: React.Dispatch<React.SetStateAction<ItemCategory[]>>;
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  permissions: PermissionActions;
  logActivity: (args: { actionType: 'create' | 'update' | 'delete'; entityType: string; entityName: string; }) => void;
}

const ItemCategoryModal: React.FC<ItemCategoryModalProps> = ({ isOpen, onClose, categories, setCategories, items, setItems, permissions, logActivity }) => {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [mode, setMode] = useState<'new' | 'edit'>('new');
  const [formData, setFormData] = useState({ nameAr: '', nameEn: '' });

  useEffect(() => {
    if (isOpen && categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
    if (!isOpen) {
      setSelectedCategoryId(null);
    }
  }, [isOpen, categories]);
  
  useEffect(() => {
    if (selectedCategoryId) {
      const category = categories.find(c => c.id === selectedCategoryId);
      if (category) {
        setFormData({ nameAr: category.nameAr, nameEn: category.nameEn });
        setMode('edit');
      }
    } else {
      setFormData({ nameAr: '', nameEn: '' });
      setMode('new');
    }
  }, [selectedCategoryId, categories]);
  
  const handleSelect = (id: string) => {
    setSelectedCategoryId(id);
  };

  const handleNew = () => {
    setSelectedCategoryId(null);
  };
  
  const handleDelete = (id: string) => {
    const categoryToDelete = categories.find(c => c.id === id);
    if (categoryToDelete) {
      logActivity({ actionType: 'delete', entityType: 'ItemCategory', entityName: categoryToDelete.nameEn });
    }
    // Unlink items from this category
    setItems(prevItems => 
      prevItems.map(item => 
          item.categoryId === id ? { ...item, categoryId: '' } : item
      )
    );
    // Delete category
    setCategories(prev => prev.filter(c => c.id !== id));
    
    // If the deleted category was the selected one, reset selection
    if(selectedCategoryId === id) {
        setSelectedCategoryId(categories.length > 1 ? categories.find(c => c.id !== id)!.id : null);
    }
    showToast(t.common.deletedSuccess, 'success');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameAr || !formData.nameEn) {
        showToast(t.common.fillRequiredFields, 'error');
        return;
    }

    if (mode === 'new') {
      const newCategory = { id: `cat${Date.now()}`, ...formData };
      setCategories(prev => [...prev, newCategory]);
      logActivity({ actionType: 'create', entityType: 'ItemCategory', entityName: newCategory.nameEn });
      setSelectedCategoryId(newCategory.id);
      showToast(t.common.createdSuccess, 'success');
    } else if (mode === 'edit' && selectedCategoryId) {
      setCategories(prev => prev.map(c => c.id === selectedCategoryId ? { ...c, ...formData } : c));
      logActivity({ actionType: 'update', entityType: 'ItemCategory', entityName: formData.nameEn });
      showToast(t.common.updatedSuccess, 'success');
    }
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.itemCategories.title} size="max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ minHeight: '400px' }}>
            {/* Left Column: Category List */}
            <div className="md:col-span-1 bg-slate-50 p-3 rounded-lg border flex flex-col">
                <button onClick={handleNew} disabled={!permissions.create} className="w-full mb-3 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:bg-indigo-300">
                    <PlusIcon /> {t.common.new}
                </button>
                <div className="flex-grow overflow-y-auto">
                    {categories.map(cat => (
                        <div 
                            key={cat.id} 
                            onClick={() => handleSelect(cat.id)}
                            className={`p-3 rounded-md cursor-pointer mb-2 flex justify-between items-center transition-colors ${selectedCategoryId === cat.id ? 'bg-indigo-200 text-indigo-900 font-semibold' : 'hover:bg-slate-200'}`}
                        >
                            <span>{language === 'ar' ? cat.nameAr : cat.nameEn}</span>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(cat.id); }} disabled={!permissions.delete} className="text-slate-400 hover:text-red-500 disabled:text-slate-300 disabled:cursor-not-allowed">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Column: Form */}
            <div className="md:col-span-2 p-2">
                <h3 className="text-xl font-bold text-slate-800 mb-4 pb-2 border-b">
                    {mode === 'new' ? t.itemCategories.addCategoryTitle : t.itemCategories.editCategory}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t.itemCategories.categoryNameAr} <span className="text-red-500">*</span></label>
                        <input type="text" value={formData.nameAr} onChange={e => setFormData(f => ({...f, nameAr: e.target.value}))} className="w-full p-2 border rounded-md bg-slate-50 text-slate-900 border-slate-300" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t.itemCategories.categoryNameEn} <span className="text-red-500">*</span></label>
                        <input type="text" value={formData.nameEn} onChange={e => setFormData(f => ({...f, nameEn: e.target.value}))} className="w-full p-2 border rounded-md bg-slate-50 text-slate-900 border-slate-300" required />
                    </div>
                    <div className="pt-4 flex justify-end">
                        <button type="submit" disabled={mode === 'new' ? !permissions.create : !permissions.update} className="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors disabled:bg-indigo-300">
                           {mode === 'new' ? t.common.add : t.common.save}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </Modal>
  );
};


interface ItemsPageProps {
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  itemCategories: ItemCategory[];
  setItemCategories: React.Dispatch<React.SetStateAction<ItemCategory[]>>;
  permissions: PermissionActions;
  logActivity: (args: { actionType: 'create' | 'update' | 'delete'; entityType: string; entityName: string; }) => void;
}

const initialFormState: Omit<Item, 'id'> = {
  categoryId: '',
  nameAr: '',
  nameEn: '',
  descriptionAr: '',
  descriptionEn: '',
  unit: '',
  estimatedPrice: 0,
  currency: 'ILS',
  notes: '',
};

const FormField: React.FC<{ label: string; children: React.ReactNode; required?: boolean }> = ({ label, children, required }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);


const ItemsPage: React.FC<ItemsPageProps> = ({ items, setItems, itemCategories, setItemCategories, permissions, logActivity }) => {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const [mode, setMode] = useState<'new' | 'view' | 'edit'>('new');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Omit<Item, 'id'>>(initialFormState);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isNumber = type === 'number';
    setFormData(prev => ({
      ...prev,
      [name]: isNumber ? parseFloat(value) || 0 : value,
    }));
  };

  const filteredItems = items.filter(i => 
    i.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.nameEn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const id = e.target.value;
      setSelectedItemId(id);
      if (id) {
          const item = items.find(i => i.id === id);
          if (item) {
              setFormData(item);
              setMode('view');
          }
      } else {
          setFormData(initialFormState);
          setMode('new');
      }
  };

  const validateAndSave = () => {
    const missingFields = [];
    if (!formData.categoryId) missingFields.push(`'${t.items.groupName}'`);
    if (!formData.nameAr) missingFields.push(`'${t.items.itemNameAr}'`);
    if (!formData.nameEn) missingFields.push(`'${t.items.itemNameEn}'`);
    if (!formData.descriptionAr) missingFields.push(`'${t.items.descriptionAr}'`);
    if (!formData.descriptionEn) missingFields.push(`'${t.items.descriptionEn}'`);

    if (missingFields.length > 0) {
        showToast(`${t.common.fillRequiredFields}: ${missingFields.join(', ')}`, 'error');
        return false;
    }
    return true;
  }

  const handleAction = (action: 'add' | 'save' | 'edit' | 'delete') => {
    if (action === 'add') {
      if (mode === 'edit' || mode === 'view') {
        setSelectedItemId('');
        setFormData(initialFormState);
        setMode('new');
      } else { // mode === 'new'
        if (validateAndSave()) {
            const newItem: Item = { id: `item${Date.now()}`, ...formData };
            setItems(prev => [...prev, newItem]);
            logActivity({ actionType: 'create', entityType: 'Item', entityName: newItem.nameEn });
            setSelectedItemId(newItem.id);
            setMode('view');
            showToast(t.items.itemAddedSuccess, 'success');
        }
      }
      return;
    }
    
    if (!selectedItemId) return;

    if (action === 'edit') {
      setMode('edit');
    }
    
    if (action === 'delete') {
        const itemToDelete = items.find(i => i.id === selectedItemId);
        if (itemToDelete) {
          logActivity({ actionType: 'delete', entityType: 'Item', entityName: itemToDelete.nameEn });
        }
        setItems(prev => prev.filter(i => i.id !== selectedItemId));
        setSelectedItemId('');
        setFormData(initialFormState);
        setMode('new');
        showToast(t.common.deletedSuccess, 'success');
    }

    if (action === 'save') {
       if (validateAndSave()) {
            setItems(prev => prev.map(i => i.id === selectedItemId ? { ...i, ...formData } : i));
            logActivity({ actionType: 'update', entityType: 'Item', entityName: formData.nameEn });
            setMode('view');
            showToast(t.common.updatedSuccess, 'success');
       }
    }
  };

  const handleExport = () => {
    const dataToExport = items.map(item => {
        const category = itemCategories.find(c => c.id === item.categoryId);
        return {
            [t.items.groupName]: category ? (language === 'ar' ? category.nameAr : category.nameEn) : '',
            [t.items.itemNameAr]: item.nameAr,
            [t.items.itemNameEn]: item.nameEn,
            [t.items.descriptionAr]: item.descriptionAr,
            [t.items.descriptionEn]: item.descriptionEn,
            [t.items.unit]: item.unit,
            [t.items.estimatedPrice]: item.estimatedPrice,
            [t.items.currency]: item.currency,
            [t.items.notes]: item.notes,
        };
    });

    const ws = window.XLSX.utils.json_to_sheet(dataToExport);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Items");
    window.XLSX.writeFile(wb, "Items.xlsx");
    showToast(t.common.exportSuccess, 'success');
  };

  const isReadOnly = mode === 'view' || (mode === 'edit' && !permissions.update);
  const inputClasses = "w-full p-2 border border-slate-300 rounded-md bg-slate-50 transition focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 read-only:bg-slate-100 disabled:bg-slate-100 read-only:cursor-not-allowed disabled:cursor-not-allowed text-slate-900";
  const baseButtonClass = "px-6 py-2.5 text-white font-semibold rounded-md shadow-sm transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed";

  return (
    <>
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
            <h1 className="text-3xl font-bold text-slate-800">{t.items.formTitle}</h1>
            <button onClick={handleExport} className="flex items-center gap-2 bg-green-600 text-white py-2 px-4 rounded-md shadow hover:bg-green-700 transition-colors font-semibold text-sm">
                <ArrowDownTrayIcon className="w-5 h-5" />
                {t.common.export}
            </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 bg-slate-50 border rounded-lg">
            <FormField label={t.suppliers.search}>
                <input 
                    type="text" 
                    placeholder={t.items.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={inputClasses}
                />
            </FormField>
            <FormField label={t.items.selectItem}>
                <select
                    value={selectedItemId}
                    onChange={handleSelectChange}
                    className={inputClasses}
                >
                    <option value="">{t.items.selectItemPlaceholder}</option>
                    {filteredItems.map(i => (
                        <option key={i.id} value={i.id}>{language === 'ar' ? i.nameAr : i.nameEn}</option>
                    ))}
                </select>
            </FormField>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200 space-y-5">
            <FormField label={t.items.groupName} required>
                <div className="flex items-center gap-2 w-full">
                    <button type="button" onClick={() => setIsCategoryModalOpen(true)} className="p-2.5 border border-slate-300 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors">
                        <CategoryIcon />
                    </button>
                    <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} className={inputClasses} required disabled={isReadOnly}>
                        <option value="">{t.items.selectCategoryPlaceholder}</option>
                        {itemCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{language === 'ar' ? cat.nameAr : cat.nameEn}</option>
                        ))}
                    </select>
                </div>
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label={t.items.itemNameAr} required><input type="text" name="nameAr" value={formData.nameAr} onChange={handleInputChange} className={inputClasses} required readOnly={isReadOnly} /></FormField>
                <FormField label={t.items.itemNameEn} required><input type="text" name="nameEn" value={formData.nameEn} onChange={handleInputChange} className={inputClasses} required readOnly={isReadOnly} /></FormField>
                <FormField label={t.items.descriptionAr} required><textarea name="descriptionAr" value={formData.descriptionAr} onChange={handleInputChange} rows={2} className={inputClasses} required readOnly={isReadOnly}></textarea></FormField>
                <FormField label={t.items.descriptionEn} required><textarea name="descriptionEn" value={formData.descriptionEn} onChange={handleInputChange} rows={2} className={inputClasses} required readOnly={isReadOnly}></textarea></FormField>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label={t.items.unit}><input type="text" name="unit" value={formData.unit} onChange={handleInputChange} className={inputClasses} readOnly={isReadOnly} /></FormField>
                <FormField label={t.items.estimatedPrice}>
                    <div className="flex items-center gap-2 w-full">
                        <input type="number" name="estimatedPrice" value={formData.estimatedPrice} onChange={handleInputChange} className={inputClasses} min="0" step="0.01" readOnly={isReadOnly} />
                        <select name="currency" value={formData.currency} onChange={handleInputChange} className={inputClasses + " max-w-[100px]"} disabled={isReadOnly}>
                            <option value="ILS">ILS</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                        </select>
                    </div>
                </FormField>
            </div>

            <FormField label={t.items.notes}><textarea name="notes" value={formData.notes} onChange={handleInputChange} rows={2} className={inputClasses} readOnly={isReadOnly}></textarea></FormField>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-200 flex justify-center items-center gap-3">
            <button onClick={() => handleAction('add')} disabled={!permissions.create} className={`${baseButtonClass} bg-indigo-600 hover:bg-indigo-700`}>{t.common.add}</button>
            <button onClick={() => handleAction('save')} disabled={mode !== 'edit' || !permissions.update} className={`${baseButtonClass} bg-indigo-600 hover:bg-indigo-700`}>{t.common.save}</button>
            <button onClick={() => handleAction('edit')} disabled={mode !== 'view' || !permissions.update} className={`${baseButtonClass} bg-amber-500 hover:bg-amber-600`}>{t.common.edit}</button>
            <button onClick={() => handleAction('delete')} disabled={mode !== 'view' || !permissions.delete} className={`${baseButtonClass} bg-red-600 hover:bg-red-700`}>{t.common.delete}</button>
        </div>
      </div>

      <ItemCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={itemCategories}
        setCategories={setItemCategories}
        items={items}
        setItems={setItems}
        permissions={permissions}
        logActivity={logActivity}
      />
    </>
  );
};

export default ItemsPage;