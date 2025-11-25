

import React, { useState, useMemo, useEffect } from 'react';
import { ArchiveClassification, Department, PermissionActions, DocumentType } from '../../types';
import { useTranslation } from '../../LanguageContext';
import { useToast } from '../../ToastContext';
import Modal from '../../components/Modal';
import { PlusIcon, PencilIcon, TrashIcon, TagIcon, FolderIcon } from '../../components/icons';

interface ArchiveClassificationsPageProps {
    archiveClassifications: ArchiveClassification[];
    setArchiveClassifications: React.Dispatch<React.SetStateAction<ArchiveClassification[]>>;
    departments: Department[];
    permissions: PermissionActions;
    logActivity: (args: any) => void;
    documentTypes: DocumentType[];
}

const ArchiveClassificationsPage: React.FC<ArchiveClassificationsPageProps> = ({ archiveClassifications, setArchiveClassifications, departments, permissions, logActivity, documentTypes }) => {
    const { t, language } = useTranslation();
    const { showToast } = useToast();

    const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'Document' | 'Transaction'>('Document');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ArchiveClassification | null>(null);
    const [formData, setFormData] = useState<Omit<ArchiveClassification, 'id'>>({
        departmentId: '',
        nameAr: '',
        nameEn: '',
        type: 'Document',
        requiredDocumentTypeIds: []
    });

    const filteredList = useMemo(() => {
        return archiveClassifications.filter(ac => 
            ac.departmentId === selectedDepartmentId && ac.type === activeTab
        );
    }, [archiveClassifications, selectedDepartmentId, activeTab]);

    const openModal = (item: ArchiveClassification | null = null) => {
        if (!selectedDepartmentId) {
            showToast(t.archive.classifications.selectDepartmentFirst, 'error');
            return;
        }
        if (item) {
            setEditingItem(item);
            setFormData(item);
        } else {
            setEditingItem(null);
            setFormData({ departmentId: selectedDepartmentId, nameAr: '', nameEn: '', type: activeTab, requiredDocumentTypeIds: [] });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (updatedFormData: Omit<ArchiveClassification, 'id'>) => {
        if (!updatedFormData.nameAr || !updatedFormData.nameEn) {
            showToast(t.common.fillRequiredFields, 'error');
            return;
        }

        if (editingItem) {
            setArchiveClassifications(prev => prev.map(ac => ac.id === editingItem.id ? { ...ac, ...updatedFormData } : ac));
            logActivity({ actionType: 'update', entityType: 'ArchiveClassification', entityName: updatedFormData.nameEn });
            showToast(t.common.updatedSuccess, 'success');
        } else {
            const newItem = { id: `ac-${Date.now()}`, ...updatedFormData };
            setArchiveClassifications(prev => [...prev, newItem]);
            logActivity({ actionType: 'create', entityType: 'ArchiveClassification', entityName: newItem.nameEn });
            showToast(t.common.createdSuccess, 'success');
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: string) => {
        if (window.confirm(t.common.deleteConfirm)) {
            const toDelete = archiveClassifications.find(ac => ac.id === id);
            if(toDelete) logActivity({ actionType: 'delete', entityType: 'ArchiveClassification', entityName: toDelete.nameEn });
            setArchiveClassifications(prev => prev.filter(ac => ac.id !== id));
            showToast(t.common.deletedSuccess, 'success');
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
             <div className="flex justify-between items-center mb-6">
                 <h1 className="text-2xl font-bold text-slate-800">{t.archive.classifications.title}</h1>
             </div>

             <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-xl mb-8">
                 <label className="block text-sm font-bold text-indigo-900 mb-2">{t.archive.classifications.selectDepartment}</label>
                 <select 
                    value={selectedDepartmentId} 
                    onChange={(e) => setSelectedDepartmentId(e.target.value)}
                    className="w-full p-3 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-lg"
                 >
                     <option value="">{t.archive.classifications.selectDepartmentPlaceholder}</option>
                     {departments.map(d => (
                         <option key={d.id} value={d.id}>{language === 'ar' ? d.nameAr : d.nameEn}</option>
                     ))}
                 </select>
             </div>
             
             <div className="mb-6 border-b border-slate-200 flex justify-between items-end">
                 <nav className="-mb-px flex space-x-8">
                    <button 
                        onClick={() => setActiveTab('Transaction')}
                        className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'Transaction' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                    >
                        <FolderIcon className="w-5 h-5" />
                        {t.archive.classifications.tabs.transactionTypes}
                    </button>
                    <button 
                        onClick={() => setActiveTab('Document')}
                        className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'Document' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                    >
                        <TagIcon className="w-5 h-5" />
                        {t.archive.classifications.tabs.documentTypes}
                    </button>
                 </nav>
                 
                 <button 
                    onClick={() => openModal()} 
                    disabled={!selectedDepartmentId || !permissions.create}
                    className="mb-2 flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-slate-300"
                 >
                    <PlusIcon className="w-5 h-5" /> {t.common.add}
                 </button>
             </div>

             <div className="bg-white rounded-lg border overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-1/3">{t.archive.classifications.nameEn}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-1/3">{t.archive.classifications.nameAr}</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">{t.users.actions}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {filteredList.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">{item.nameEn}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium text-right">{item.nameAr}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                     <div className="flex items-center justify-center gap-4">
                                        <button onClick={() => openModal(item)} disabled={!permissions.update} className="text-indigo-600 hover:text-indigo-900 disabled:text-slate-300"><PencilIcon/></button>
                                        <button onClick={() => handleDelete(item.id)} disabled={!permissions.delete} className="text-red-600 hover:text-red-900 disabled:text-slate-300"><TrashIcon/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredList.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                                    {selectedDepartmentId ? t.archive.classifications.noTypes : t.archive.classifications.selectDepartmentFirst}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
             </div>

             {isModalOpen && (
                <ClassificationModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleSubmit}
                    initialData={formData}
                    documentTypes={documentTypes}
                    permissions={permissions}
                />
             )}
        </div>
    );
};

interface ClassificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<ArchiveClassification, 'id'>) => void;
    initialData: Omit<ArchiveClassification, 'id'>;
    documentTypes: DocumentType[];
    permissions: PermissionActions;
}

const ClassificationModal: React.FC<ClassificationModalProps> = ({ isOpen, onClose, onSubmit, initialData, documentTypes, permissions }) => {
    const { t, language } = useTranslation();
    const [formData, setFormData] = useState(initialData);

    useEffect(() => {
        setFormData(initialData);
    }, [initialData, isOpen]);

    const handleDocTypeToggle = (docId: string) => {
        const currentRequired = formData.requiredDocumentTypeIds || [];
        const newRequired = currentRequired.includes(docId)
            ? currentRequired.filter(id => id !== docId)
            : [...currentRequired, docId];
        setFormData(prev => ({ ...prev, requiredDocumentTypeIds: newRequired }));
    };

    const isEdit = !!initialData.nameEn;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? t.archive.classifications.editType : t.archive.classifications.addType} size="max-w-3xl">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.archive.classifications.nameEn} <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.nameEn} onChange={e => setFormData(prev => ({ ...prev, nameEn: e.target.value }))} className="w-full p-2 border border-slate-300 rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.archive.classifications.nameAr} <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.nameAr} onChange={e => setFormData(prev => ({ ...prev, nameAr: e.target.value }))} className="w-full p-2 border border-slate-300 rounded-md" />
                </div>

                {formData.type === 'Transaction' && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Required Documents</label>
                        <div className="mt-2 space-y-2 border p-3 rounded-md max-h-48 overflow-y-auto bg-slate-50">
                            {documentTypes.map(docType => (
                                <div key={docType.id} className="flex items-center">
                                    <input 
                                        type="checkbox" 
                                        id={`doc-${docType.id}`} 
                                        checked={(formData.requiredDocumentTypeIds || []).includes(docType.id)}
                                        onChange={() => handleDocTypeToggle(docType.id)}
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor={`doc-${docType.id}`} className="ml-3 text-sm text-gray-700">
                                        {language === 'ar' ? docType.nameAr : docType.nameEn}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300 transition-colors">{t.common.cancel}</button>
                    <button onClick={() => onSubmit(formData)} disabled={isEdit ? !permissions.update : !permissions.create} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-300">{t.common.save}</button>
                </div>
            </div>
        </Modal>
    );
};


export default ArchiveClassificationsPage;