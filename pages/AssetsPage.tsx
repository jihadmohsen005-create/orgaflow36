import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from '../LanguageContext';
import { 
    PermissionActions, 
    AssetCategory, Asset, AssetCustody, Employee, AssetStatus,
    Project, AssetLocation
} from '../types';
import { PlusIcon, PencilIcon, TrashIcon, BriefcaseIcon, SearchIcon } from '../components/icons';
import { useToast } from '../ToastContext';
import Modal from '../components/Modal';

// #region Helper Components & Interfaces
interface AssetsPageProps {
    permissions: PermissionActions;
    logActivity: (args: any) => void;
    assetCategories: AssetCategory[]; setAssetCategories: React.Dispatch<React.SetStateAction<AssetCategory[]>>;
    assets: Asset[]; setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
    assetCustody: AssetCustody[]; setAssetCustody: React.Dispatch<React.SetStateAction<AssetCustody[]>>;
    employees: Employee[];
    projects: Project[];
    assetLocations: AssetLocation[];
    setAssetLocations: React.Dispatch<React.SetStateAction<AssetLocation[]>>;
}

const FormField: React.FC<{ label: string; children: React.ReactNode; required?: boolean }> = ({ label, children, required }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
    </div>
);
// #endregion

// #region Sub-Components (Assets, Custody, Categories)

// A single modal for managing both Categories and Locations
const AttributeModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    items: (AssetCategory | AssetLocation)[];
    setItems: React.Dispatch<React.SetStateAction<any[]>>;
    title: string;
    entityType: 'AssetCategory' | 'AssetLocation';
    permissions: PermissionActions;
    logActivity: (args: any) => void;
}> = ({ isOpen, onClose, items, setItems, title, entityType, permissions, logActivity }) => {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const [formData, setFormData] = useState<{ id: string | null; name: string; nameAr?: string; nameEn?: string; code?: string }>({ id: null, name: '', nameAr: '', nameEn: '', code: '' });

  const handleSelect = (item: AssetCategory | AssetLocation) => {
    if ('nameAr' in item) { // AssetCategory
        setFormData({ id: item.id, name: '', nameAr: item.nameAr, nameEn: item.nameEn, code: item.code });
    } else { // AssetLocation
        setFormData({ id: item.id, name: item.name, nameAr: '', nameEn: '', code: '' });
    }
  };
  const handleNew = () => setFormData({ id: null, name: '', nameAr: '', nameEn: '', code: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (entityType === 'AssetCategory' && (!formData.nameAr || !formData.nameEn || !formData.code)) {
        showToast(t.common.fillRequiredFields, 'error');
        return;
    }
    if (entityType === 'AssetLocation' && !formData.name) {
        showToast(t.common.fillRequiredFields, 'error');
        return;
    }
    
    if (formData.id) { // Update
      setItems(prev => prev.map(item => item.id === formData.id ? { ...item, ...formData } : item));
      logActivity({ actionType: 'update', entityType, entityName: formData.nameEn || formData.name });
    } else { // Create
      const newItem = { id: `${entityType.toLowerCase()}-${Date.now()}`, ...formData };
      setItems(prev => [...prev, newItem]);
      logActivity({ actionType: 'create', entityType, entityName: formData.nameEn || formData.name });
      setFormData(newItem as any);
    }
    showToast(t.common.updatedSuccess, 'success');
  };
  
  const handleDelete = (id: string) => {
    const toDelete = items.find(i => i.id === id);
    if(toDelete) logActivity({ actionType: 'delete', entityType, entityName: (toDelete as any).nameEn || (toDelete as any).name });
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
                            <span className="text-slate-800">{'name' in item ? item.name : (language === 'ar' ? item.nameAr : item.nameEn)}</span>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} disabled={!permissions.delete} className="text-slate-400 hover:text-red-500 disabled:text-slate-300"><TrashIcon className="w-4 h-4" /></button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="md:col-span-2 p-2">
                <h3 className="text-xl font-bold text-slate-800 mb-4">{formData.id ? t.common.edit : t.common.add}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {entityType === 'AssetCategory' ? (
                        <>
                        <FormField label={t.assets.categoryNameAr} required><input type="text" value={formData.nameAr || ''} onChange={e => setFormData(f => ({...f, nameAr: e.target.value}))} className="form-input bg-white text-gray-900 border-gray-300" required /></FormField>
                        <FormField label={t.assets.categoryNameEn} required><input type="text" value={formData.nameEn || ''} onChange={e => setFormData(f => ({...f, nameEn: e.target.value}))} className="form-input bg-white text-gray-900 border-gray-300" required /></FormField>
                        <FormField label={t.assets.categoryCode} required>
                            <input type="text" value={formData.code || ''} onChange={e => setFormData(f => ({...f, code: e.target.value.toUpperCase()}))} className="form-input bg-white text-gray-900 border-gray-300" maxLength={2} required />
                        </FormField>
                        </>
                    ) : (
                        <FormField label={t.assets.locationName} required><input type="text" value={formData.name} onChange={e => setFormData(f => ({...f, name: e.target.value}))} className="form-input bg-white text-gray-900 border-gray-300" required /></FormField>
                    )}
                    <div className="pt-4 flex justify-end">
                        <button type="submit" disabled={formData.id ? !permissions.update : !permissions.create} className="btn-primary disabled:bg-indigo-300">{t.common.save}</button>
                    </div>
                </form>
            </div>
       </div>
    </Modal>
  )
}


const AssetsComponent: React.FC<AssetsPageProps & { availableQuantities: Record<string, number> }> = ({ assets, setAssets, assetCategories, permissions, logActivity, availableQuantities, projects, assetLocations }) => {
    const { t, language } = useTranslation();
    const { showToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

    const [filters, setFilters] = useState({
        text: '',
        projectId: 'ALL',
        status: 'ALL',
        locationId: 'ALL',
        categoryId: 'ALL',
    });

    const filteredAssets = useMemo(() => {
        return assets.filter(asset => {
            const textMatch = filters.text === '' || 
                              asset.name.toLowerCase().includes(filters.text.toLowerCase()) || 
                              (asset.assetTag && asset.assetTag.toLowerCase().includes(filters.text.toLowerCase()));
            const projectMatch = filters.projectId === 'ALL' || asset.projectId === filters.projectId;
            const statusMatch = filters.status === 'ALL' || asset.status === filters.status;
            const locationMatch = filters.locationId === 'ALL' || asset.locationId === filters.locationId;
            const categoryMatch = filters.categoryId === 'ALL' || asset.categoryId === filters.categoryId;
            return textMatch && projectMatch && statusMatch && locationMatch && categoryMatch;
        });
    }, [assets, filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };
    
    const initialFormState: Omit<Asset, 'id'> = {
        assetTag: '',
        name: '',
        categoryId: '',
        projectId: '',
        locationId: '',
        serialNumber: '',
        purchaseDate: '',
        purchasePrice: 0,
        currency: 'USD',
        status: 'In Stock',
        specifications: '',
        description: '',
        totalQuantity: 1
    };
    const [formData, setFormData] = useState<Omit<Asset, 'id'>>(initialFormState);

    useEffect(() => {
        if (formData.serialNumber && formData.serialNumber.trim() !== '') {
            if (formData.totalQuantity !== 1) {
                setFormData(prev => ({ ...prev, totalQuantity: 1 }));
            }
        }
    }, [formData.serialNumber, formData.totalQuantity]);

    const openModal = (asset: Asset | null = null) => {
        if (asset) {
            setEditingAsset(asset);
            setFormData(asset);
        } else {
            setEditingAsset(null);
            setFormData(initialFormState);
        }
        setIsModalOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = () => {
        if (!formData.name || !formData.categoryId) {
            showToast(t.common.fillRequiredFields, 'error');
            return;
        }

        if (editingAsset) {
            setAssets(prev => prev.map(a => a.id === editingAsset.id ? { ...a, ...formData } : a));
            logActivity({ actionType: 'update', entityType: 'Asset', entityName: formData.name });
            showToast(t.common.updatedSuccess, 'success');
        } else {
            const category = assetCategories.find(c => c.id === formData.categoryId);
            const categoryCode = category ? category.code : 'XX';
            const year = new Date(formData.purchaseDate || Date.now()).getFullYear();
            const assetsInYearWithCategory = assets.filter(a => {
                const cat = assetCategories.find(c => c.id === a.categoryId);
                const aYear = a.purchaseDate ? new Date(a.purchaseDate).getFullYear() : 0;
                return cat?.code === categoryCode && aYear === year;
            });
            const serial = (assetsInYearWithCategory.length + 1).toString().padStart(4, '0');
            const assetTag = `${categoryCode}-${year}-${serial}`;
            
            const newAsset: Asset = { id: `asset-${Date.now()}`, ...formData, assetTag };
            setAssets(prev => [newAsset, ...prev]);
            logActivity({ actionType: 'create', entityType: 'Asset', entityName: newAsset.name });
            showToast(t.common.createdSuccess, 'success');
        }
        setIsModalOpen(false);
    };

    const handleDelete = (assetId: string) => {
        const toDelete = assets.find(a => a.id === assetId);
        if (toDelete) {
            logActivity({ actionType: 'delete', entityType: 'Asset', entityName: toDelete.name });
            setAssets(prev => prev.filter(a => a.id !== assetId));
            showToast(t.common.deletedSuccess, 'success');
        }
    };

    const StatusBadge: React.FC<{ status: AssetStatus }> = ({ status }) => {
        const statusInfo = {
            'In Stock': 'bg-green-100 text-green-800',
            'In Use': 'bg-blue-100 text-blue-800',
            'Under Maintenance': 'bg-yellow-100 text-yellow-800',
            'Retired': 'bg-slate-100 text-slate-800',
        };
        return <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusInfo[status]}`}>{t.assets.statuses[status]}</span>;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800">{t.assets.tabs.assets}</h3>
                <button onClick={() => openModal()} disabled={!permissions.create} className="btn-primary flex items-center gap-2"><PlusIcon />{t.common.add}</button>
            </div>
            
            <div className="p-4 bg-slate-50 border rounded-lg mb-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-3">
                        <div className="relative">
                           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon className="h-5 w-5 text-slate-400" /></div>
                           <input type="text" name="text" value={filters.text} onChange={handleFilterChange} placeholder={t.assets.filters.searchAssets} className="form-input pl-10" />
                        </div>
                    </div>
                     <select name="projectId" value={filters.projectId} onChange={handleFilterChange} className="form-input"><option value="ALL">{t.assets.filters.allProjects}</option>{projects.map(p=><option key={p.id} value={p.id}>{language==='ar'?p.nameAr:p.nameEn}</option>)}</select>
                     <select name="status" value={filters.status} onChange={handleFilterChange} className="form-input"><option value="ALL">{t.assets.filters.allStatuses}</option>{Object.keys(t.assets.statuses).map(s=><option key={s} value={s}>{t.assets.statuses[s as AssetStatus]}</option>)}</select>
                     <select name="locationId" value={filters.locationId} onChange={handleFilterChange} className="form-input"><option value="ALL">{t.assets.filters.allLocations}</option>{assetLocations.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}</select>
                     <select name="categoryId" value={filters.categoryId} onChange={handleFilterChange} className="form-input"><option value="ALL">{t.assets.filters.allCategories}</option>{assetCategories.map(c=><option key={c.id} value={c.id}>{language==='ar'?c.nameAr:c.nameEn}</option>)}</select>
                </div>
                 <button onClick={() => setFilters({text: '', projectId: 'ALL', status: 'ALL', locationId: 'ALL', categoryId: 'ALL'})} className="text-sm text-indigo-600 hover:underline">{t.common.clearFilters}</button>
            </div>

            <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="p-3 text-left font-semibold text-slate-700">{t.assets.assetName}</th>
                            <th className="p-3 text-left font-semibold text-slate-700">{t.assets.serialNumber}</th>
                            <th className="p-3 text-left font-semibold text-slate-700">{t.assets.totalQuantity}</th>
                            <th className="p-3 text-left font-semibold text-slate-700">{t.assets.availableQuantity}</th>
                            <th className="p-3 text-left font-semibold text-slate-700">{t.assets.status}</th>
                            <th className="p-3 text-center font-semibold text-slate-700">{t.users.actions}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {filteredAssets.map(asset => {
                            const category = assetCategories.find(c => c.id === asset.categoryId);
                            return (
                                <tr key={asset.id} className="hover:bg-slate-50">
                                    <td className="p-3 font-medium text-slate-900">{asset.name}<span className="text-xs text-slate-500 block">{category ? (language === 'ar' ? category.nameAr : category.nameEn) : ''}</span></td>
                                    <td className="p-3 text-slate-600 font-mono">{asset.serialNumber || '-'}</td>
                                    <td className="p-3 text-slate-600 font-medium">{asset.totalQuantity}</td>
                                    <td className="p-3 text-slate-600 font-bold">{availableQuantities[asset.id] ?? asset.totalQuantity}</td>
                                    <td className="p-3"><StatusBadge status={asset.status} /></td>
                                    <td className="p-3 text-center">
                                        <div className="flex justify-center gap-4">
                                            <button onClick={() => openModal(asset)} disabled={!permissions.update} className="text-indigo-600"><PencilIcon /></button>
                                            <button onClick={() => handleDelete(asset.id)} disabled={!permissions.delete || asset.status === 'In Use'} className="text-red-600 disabled:text-slate-300"><TrashIcon /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingAsset ? t.common.edit : t.common.add} size="max-w-3xl">
                <div className="space-y-4">
                    {editingAsset && <FormField label={t.assets.assetTag}><input value={formData.assetTag} readOnly className="form-input bg-slate-200"/></FormField>}
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label={t.assets.assetName} required><input name="name" value={formData.name} onChange={handleInputChange} className="form-input"/></FormField>
                        <FormField label={t.assets.category} required><select name="categoryId" value={formData.categoryId} onChange={handleInputChange} className="form-input"><option value="">--</option>{assetCategories.map(c=><option key={c.id} value={c.id}>{language==='ar' ? c.nameAr: c.nameEn}</option>)}</select></FormField>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label={t.assets.project}><select name="projectId" value={formData.projectId} onChange={handleInputChange} className="form-input"><option value="">--</option>{projects.map(p=><option key={p.id} value={p.id}>{language==='ar' ? p.nameAr: p.nameEn}</option>)}</select></FormField>
                        <FormField label={t.assets.location}><select name="locationId" value={formData.locationId} onChange={handleInputChange} className="form-input"><option value="">--</option>{assetLocations.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}</select></FormField>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <FormField label={t.assets.serialNumber}><input name="serialNumber" value={formData.serialNumber || ''} onChange={handleInputChange} className="form-input"/></FormField>
                        <FormField label={t.assets.totalQuantity} required><input type="number" name="totalQuantity" value={formData.totalQuantity} onChange={handleInputChange} readOnly={!!formData.serialNumber} className="form-input" min="1"/></FormField>
                    </div>
                     <p className="text-xs text-slate-500 -mt-2">{t.assets.serialLocksQuantity}</p>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label={t.assets.purchaseDate}><input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleInputChange} className="form-input"/></FormField>
                        <FormField label={t.assets.purchasePrice}><div className="flex"><input type="number" name="purchasePrice" value={formData.purchasePrice} onChange={handleInputChange} className="form-input"/><select name="currency" value={formData.currency} onChange={handleInputChange} className="form-input w-24"><option>USD</option><option>ILS</option><option>EUR</option></select></div></FormField>
                    </div>
                    <FormField label={t.assets.specifications}><textarea name="specifications" value={formData.specifications} onChange={handleInputChange} className="form-input" rows={2}></textarea></FormField>
                    <FormField label={t.assets.description}><textarea name="description" value={formData.description} onChange={handleInputChange} className="form-input" rows={2}></textarea></FormField>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button onClick={() => setIsModalOpen(false)} className="btn-secondary">{t.common.cancel}</button>
                        <button onClick={handleSubmit} className="btn-primary">{t.common.save}</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

const CustodyComponent: React.FC<AssetsPageProps> = ({ assets, setAssets, assetCustody, setAssetCustody, employees, permissions, logActivity }) => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustody, setEditingCustody] = useState<AssetCustody | null>(null);

    const initialFormState = { assetId: '', employeeId: '', notes: '', custodyDate: new Date().toISOString().split('T')[0], specifications: '', quantity: 1 };
    const [formData, setFormData] = useState(initialFormState);
    
    // Filters
    const [employeeFilter, setEmployeeFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Returned'>('ALL');

    const { availableAssets, availableQuantities } = useMemo(() => {
        const inUseCounts: Record<string, number> = {};
        assetCustody.filter(c => !c.returnDate).forEach(c => {
            inUseCounts[c.assetId] = (inUseCounts[c.assetId] || 0) + c.quantity;
        });

        const available: Record<string, number> = {};
        const availableForCustody: Asset[] = [];

        assets.forEach(asset => {
            const availableCount = asset.totalQuantity - (inUseCounts[asset.id] || 0);
            available[asset.id] = availableCount;
            if (availableCount > 0 && asset.status !== 'Retired' && asset.status !== 'Under Maintenance') {
                availableForCustody.push(asset);
            }
        });
        
        return { availableAssets: availableForCustody, availableQuantities: available };
    }, [assets, assetCustody]);

    const filteredCustodyRecords = useMemo(() => {
        return assetCustody
            .filter(c => employeeFilter === 'ALL' || c.employeeId === employeeFilter)
            .filter(c => {
                if (statusFilter === 'ALL') return true;
                if (statusFilter === 'Active') return !c.returnDate;
                if (statusFilter === 'Returned') return !!c.returnDate;
                return false;
            })
            .sort((a, b) => new Date(b.custodyDate).getTime() - new Date(a.custodyDate).getTime());
    }, [assetCustody, employeeFilter, statusFilter]);

    const openModal = (custody: AssetCustody | null = null) => {
        if (custody) {
            setEditingCustody(custody);
            setFormData({
                assetId: custody.assetId,
                employeeId: custody.employeeId,
                custodyDate: custody.custodyDate,
                notes: custody.notes,
                specifications: custody.specifications || '',
                quantity: custody.quantity,
            });
        } else {
            setEditingCustody(null);
            setFormData(initialFormState);
        }
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!formData.assetId || !formData.employeeId || !formData.custodyDate || formData.quantity < 1) {
            showToast(t.common.fillRequiredFields, 'error');
            return;
        }
        
        const availableCountForEdit = (availableQuantities[formData.assetId] ?? 0) + (editingCustody?.quantity ?? 0);
        if (formData.quantity > availableCountForEdit) {
            showToast(t.assets.quantityError.replace('{available}', String(availableCountForEdit)), 'error');
            return;
        }

        if (editingCustody) {
            const updatedCustody: AssetCustody = { ...editingCustody, ...formData };
            setAssetCustody(prev => prev.map(c => c.id === editingCustody.id ? updatedCustody : c));
            logActivity({ actionType: 'update', entityType: 'AssetCustody', entityName: `Custody ID ${editingCustody.id}` });
            showToast(t.common.updatedSuccess, 'success');
        } else {
            const newCustody: AssetCustody = { id: `custody-${Date.now()}`, returnDate: undefined, ...formData };
            setAssetCustody(prev => [...prev, newCustody]);
            logActivity({ actionType: 'create', entityType: 'AssetCustody', entityName: `Asset ${formData.assetId} to Employee ${formData.employeeId}` });
            showToast(t.assets.custodySuccess, 'success');
        }
        setIsModalOpen(false);
    };
    
    const handleReturn = (custodyId: string) => {
        setAssetCustody(prev => prev.map(c => c.id === custodyId ? { ...c, returnDate: new Date().toISOString().split('T')[0] } : c));
        const custodyRecord = assetCustody.find(c => c.id === custodyId);
        if(custodyRecord) {
            logActivity({ actionType: 'update', entityType: 'AssetCustody', entityName: `Return Asset ${custodyRecord.assetId}` });
            showToast(t.assets.returnSuccess, 'success');
        }
    };
    
    const handleDelete = (custodyId: string) => {
        if (window.confirm(t.common.deleteConfirm)) {
            const toDelete = assetCustody.find(c => c.id === custodyId);
            if (toDelete) logActivity({ actionType: 'delete', entityType: 'AssetCustody', entityName: `Custody ID ${custodyId}` });
            setAssetCustody(prev => prev.filter(c => c.id !== custodyId));
            showToast(t.common.deletedSuccess, 'success');
        }
    };
    
    const selectedAssetForModal = assets.find(a => a.id === formData.assetId);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800">{t.assets.custodyTitle}</h3>
                <button onClick={() => openModal()} disabled={!permissions.create} className="btn-primary flex items-center gap-2"><PlusIcon />{t.assets.newCustody}</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-slate-50 border rounded-lg">
                <FormField label={t.assets.filterByEmployee}><select value={employeeFilter} onChange={e => setEmployeeFilter(e.target.value)} className="form-input"><option value="ALL">{t.assets.allEmployees}</option>{employees.map(e=><option key={e.id} value={e.id}>{e.fullName}</option>)}</select></FormField>
                {/* FIX: Use `t.assets.filters.allStatuses` instead of `t.assets.allStatuses` */}
<FormField label={t.assets.filterByStatus}><select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="form-input"><option value="ALL">{t.assets.filters.allStatuses}</option><option value="Active">{t.assets.activeCustody}</option><option value="Returned">{t.assets.returnedCustody}</option></select></FormField>
            </div>

            <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="p-3 text-left font-semibold text-slate-700">{t.assets.assetName}</th>
                            <th className="p-3 text-left font-semibold text-slate-700">{t.assets.quantity}</th>
                            <th className="p-3 text-left font-semibold text-slate-700">{t.assets.employee}</th>
                            <th className="p-3 text-left font-semibold text-slate-700">{t.assets.custodyDate}</th>
                            <th className="p-3 text-left font-semibold text-slate-700">{t.assets.status}</th>
                            <th className="p-3 text-left font-semibold text-slate-700">{t.assets.notes}</th>
                            <th className="p-3 text-center font-semibold text-slate-700">{t.users.actions}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {filteredCustodyRecords.map(custody => {
                            const asset = assets.find(a => a.id === custody.assetId);
                            const employee = employees.find(e => e.id === custody.employeeId);
                            const isReturned = !!custody.returnDate;
                            return (
                                <tr key={custody.id} className={`hover:bg-slate-50 ${isReturned ? 'bg-slate-100 text-slate-500' : ''}`}>
                                    <td className="p-3 font-medium text-slate-900">{asset?.name}</td>
                                    <td className="p-3 font-bold">{custody.quantity}</td>
                                    <td className="p-3">{employee?.fullName}</td>
                                    <td className="p-3">{custody.custodyDate}</td>
                                    <td className="p-3"><span className={`px-2 py-1 text-xs font-bold rounded-full ${isReturned ? 'bg-gray-200' : 'bg-green-100 text-green-800'}`}>{isReturned ? t.assets.returned : t.assets.active}</span> {isReturned && <span className="text-xs block mt-1">{custody.returnDate}</span>}</td>
                                    <td className="p-3 text-xs">
                                        {custody.specifications && <div className="font-semibold">Specs: <span className="font-normal">{custody.specifications}</span></div>}
                                        {custody.notes && <div>Notes: <span className="font-normal">{custody.notes}</span></div>}
                                    </td>
                                    <td className="p-3 text-center">
                                        <div className="flex justify-center gap-2">
                                            {!isReturned && <button onClick={() => handleReturn(custody.id)} disabled={!permissions.update} className="text-sm font-semibold text-blue-600 hover:text-blue-800">{t.assets.returnCustody}</button>}
                                            <button onClick={() => openModal(custody)} disabled={!permissions.update} className="p-1 hover:bg-slate-200 rounded"><PencilIcon className="w-4 h-4 text-slate-600"/></button>
                                            <button onClick={() => handleDelete(custody.id)} disabled={!permissions.delete} className="p-1 hover:bg-red-100 rounded"><TrashIcon className="w-4 h-4 text-red-600"/></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCustody ? t.assets.editCustody : t.assets.newCustody} size="max-w-2xl">
                 <div className="space-y-4">
                    <FormField label={t.assets.assetName} required>
                        <select value={formData.assetId} onChange={e => setFormData(p => ({...p, assetId: e.target.value}))} className="form-input" disabled={!!editingCustody}>
                            <option value="">{t.assets.selectAvailableAsset}</option>
                            {availableAssets.map(a => <option key={a.id} value={a.id}>{a.name} {a.serialNumber ? `(${a.serialNumber})` : `(${t.assets.availableQuantity}: ${availableQuantities[a.id]})`}</option>)}
                        </select>
                    </FormField>
                    <FormField label={t.assets.quantity} required>
                        <input type="number" value={formData.quantity} onChange={e => setFormData(p => ({...p, quantity: parseInt(e.target.value) || 1}))} className="form-input" min="1" max={selectedAssetForModal && !selectedAssetForModal.serialNumber ? ((availableQuantities[formData.assetId] || 0) + (editingCustody?.quantity || 0)) : 1} readOnly={!!selectedAssetForModal?.serialNumber}/>
                        {selectedAssetForModal && !selectedAssetForModal.serialNumber && <p className="text-xs text-slate-500 mt-1">{t.assets.availableQuantity}: {(availableQuantities[formData.assetId] || 0) + (editingCustody && editingCustody.assetId === formData.assetId ? editingCustody.quantity : 0)}</p>}
                    </FormField>
                    <FormField label={t.assets.employee} required>
                         <select value={formData.employeeId} onChange={e => setFormData(p => ({...p, employeeId: e.target.value}))} className="form-input">
                            <option value="">{t.assets.selectEmployee}</option>
                            {employees.map(e => <option key={e.id} value={e.id}>{e.fullName}</option>)}
                        </select>
                    </FormField>
                    <FormField label={t.assets.custodyDate} required>
                        <input type="date" value={formData.custodyDate} onChange={e => setFormData(p => ({...p, custodyDate: e.target.value}))} className="form-input" />
                    </FormField>
                    <FormField label={t.assets.specifications}>
                        <textarea value={formData.specifications} onChange={e => setFormData(p => ({...p, specifications: e.target.value}))} className="form-input" rows={3}></textarea>
                    </FormField>
                    <FormField label={t.assets.notes}><textarea value={formData.notes} onChange={e => setFormData(p => ({...p, notes: e.target.value}))} className="form-input" rows={3}></textarea></FormField>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button onClick={() => setIsModalOpen(false)} className="btn-secondary">{t.common.cancel}</button>
                        <button onClick={handleSave} className="btn-primary">{t.common.save}</button>
                    </div>
                 </div>
            </Modal>
        </div>
    );
};

const AssetAttributesComponent: React.FC<AssetsPageProps> = (props) => {
    const { t } = useTranslation();
    const [modalState, setModalState] = useState<{ isOpen: boolean; type: 'AssetCategory' | 'AssetLocation' | null }>({ isOpen: false, type: null });

    const openModal = (type: 'AssetCategory' | 'AssetLocation') => {
        setModalState({ isOpen: true, type });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800">{t.assets.manageAttributes}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border rounded-lg bg-slate-50">
                     <h4 className="font-bold text-lg text-slate-700 mb-2">{t.assets.tabs.categories}</h4>
                     <button onClick={() => openModal('AssetCategory')} className="text-sm font-semibold text-indigo-600 hover:underline">{t.assets.manageCategories}</button>
                </div>
                <div className="p-4 border rounded-lg bg-slate-50">
                     <h4 className="font-bold text-lg text-slate-700 mb-2">{t.assets.assetLocations}</h4>
                      <button onClick={() => openModal('AssetLocation')} className="text-sm font-semibold text-indigo-600 hover:underline">{t.assets.assetLocations}</button>
                </div>
            </div>
            {modalState.isOpen && modalState.type && (
                <AttributeModal
                    isOpen={modalState.isOpen}
                    onClose={() => setModalState({ isOpen: false, type: null })}
                    items={modalState.type === 'AssetCategory' ? props.assetCategories : props.assetLocations}
                    setItems={modalState.type === 'AssetCategory' ? props.setAssetCategories as any : props.setAssetLocations as any}
                    title={modalState.type === 'AssetCategory' ? t.assets.manageCategories : t.assets.assetLocations}
                    entityType={modalState.type}
                    permissions={props.permissions}
                    logActivity={props.logActivity}
                />
            )}
        </div>
    );
};

// #endregion

// Main Page Component
const AssetsPage: React.FC<AssetsPageProps> = (props) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'assets' | 'custody' | 'categories'>('assets');
    const { assets, setAssets, assetCustody } = props;

    // This effect handles automatic status updates based on custody records
    useEffect(() => {
        const inUseCounts: Record<string, number> = {};
        assetCustody.filter(c => !c.returnDate).forEach(c => {
            inUseCounts[c.assetId] = (inUseCounts[c.assetId] || 0) + c.quantity;
        });

        const updatedAssets = assets.map(asset => {
            const inUseCount = inUseCounts[asset.id] || 0;
            let newStatus: AssetStatus = asset.status;
            
            // Only change between In Stock and In Use. Don't touch Maintenance/Retired
            if (asset.status === 'In Stock' || asset.status === 'In Use') {
                newStatus = inUseCount > 0 ? 'In Use' : 'In Stock';
            }
            
            if (newStatus !== asset.status) {
                return { ...asset, status: newStatus };
            }
            return asset;
        });

        // Check for actual changes to prevent infinite render loops
        if (JSON.stringify(assets) !== JSON.stringify(updatedAssets)) {
            setAssets(updatedAssets);
        }

    }, [assetCustody, assets, setAssets]);

    const availableQuantities = useMemo(() => {
        const inUseCounts: Record<string, number> = {};
        assetCustody.filter(c => !c.returnDate).forEach(c => {
            inUseCounts[c.assetId] = (inUseCounts[c.assetId] || 0) + c.quantity;
        });

        const available: Record<string, number> = {};
        assets.forEach(asset => {
            available[asset.id] = asset.totalQuantity - (inUseCounts[asset.id] || 0);
        });
        return available;
    }, [assets, assetCustody]);
    
    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-6">{t.assets.title}</h1>

            <div className="border-b border-slate-200 mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button onClick={() => setActiveTab('assets')} className={`${activeTab === 'assets' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>{t.assets.tabs.assets}</button>
                    <button onClick={() => setActiveTab('custody')} className={`${activeTab === 'custody' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>{t.assets.tabs.custody}</button>
                    <button onClick={() => setActiveTab('categories')} className={`${activeTab === 'categories' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>{t.assets.tabs.categories}</button>
                </nav>
            </div>
            
            <div>
                {activeTab === 'assets' && <AssetsComponent {...props} availableQuantities={availableQuantities} />}
                {activeTab === 'custody' && <CustodyComponent {...props} />}
                {activeTab === 'categories' && <AssetAttributesComponent {...props} />}
            </div>

            <style>{`
                 .form-input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.375rem; background-color: #ffffff; color: #0f172a; }
                .btn-primary { padding: 0.5rem 1rem; background-color: #4f46e5; color: white; border-radius: 0.375rem; font-weight: 600; }
                .btn-primary:disabled { background-color: #a5b4fc; cursor: not-allowed; }
                .btn-secondary { padding: 0.5rem 1rem; background-color: #e2e8f0; color: #1e293b; border-radius: 0.375rem; font-weight: 600; }
            `}</style>
        </div>
    );
};

export default AssetsPage;