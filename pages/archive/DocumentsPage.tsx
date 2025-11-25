

import React, { useState, useEffect, useMemo } from 'react';
import { PhysicalDocument, DocumentType, ArchiveLocation, PermissionActions, DocumentSize, Project } from '../../types';
import { useTranslation } from '../../LanguageContext';
import { useToast } from '../../ToastContext';
import Modal from '../../components/Modal';
import { PlusIcon, PencilIcon, TrashIcon, DocumentTextIcon, SearchIcon, ArchiveIcon } from '../../components/icons';

interface DocumentsPageProps {
    documents: PhysicalDocument[];
    setDocuments: React.Dispatch<React.SetStateAction<PhysicalDocument[]>>;
    documentTypes: DocumentType[];
    setDocumentTypes: React.Dispatch<React.SetStateAction<DocumentType[]>>;
    archiveLocations: ArchiveLocation[];
    projects: Project[];
    permissions: PermissionActions;
    logActivity: (args: any) => void;
}

const FormField: React.FC<{ label: string; children: React.ReactNode; required?: boolean; error?: string }> = ({ label, children, required, error }) => (
    <div className="mb-3">
        <label className="block text-sm font-bold text-slate-800 mb-1.5">
            {label} {required && <span className="text-red-600">*</span>}
        </label>
        {children}
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
);

// Attribute Modal for Managing Document Types
const TypeModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    types: DocumentType[];
    setTypes: React.Dispatch<React.SetStateAction<DocumentType[]>>;
    permissions: PermissionActions;
    logActivity: (args: any) => void;
}> = ({ isOpen, onClose, types, setTypes, permissions, logActivity }) => {
    const { t, language } = useTranslation();
    const { showToast } = useToast();
    const [formData, setFormData] = useState<{ id: string | null; nameAr: string; nameEn: string }>({ id: null, nameAr: '', nameEn: '' });

    const handleSubmit = () => {
        if (!formData.nameAr || !formData.nameEn) {
            showToast(t.common.fillRequiredFields, 'error');
            return;
        }
        if (formData.id) {
            setTypes(prev => prev.map(t => t.id === formData.id ? { ...t, nameAr: formData.nameAr, nameEn: formData.nameEn } : t));
            logActivity({ actionType: 'update', entityType: 'DocumentType', entityName: formData.nameEn });
        } else {
            const newType = { id: `dtype-${Date.now()}`, nameAr: formData.nameAr, nameEn: formData.nameEn };
            setTypes(prev => [...prev, newType]);
            logActivity({ actionType: 'create', entityType: 'DocumentType', entityName: formData.nameEn });
        }
        setFormData({ id: null, nameAr: '', nameEn: '' });
        showToast(t.common.updatedSuccess, 'success');
    };

    const handleDelete = (id: string) => {
        const toDelete = types.find(t => t.id === id);
        if (toDelete) logActivity({ actionType: 'delete', entityType: 'DocumentType', entityName: toDelete.nameEn });
        setTypes(prev => prev.filter(t => t.id !== id));
        if (formData.id === id) setFormData({ id: null, nameAr: '', nameEn: '' });
    };

    const inputClass = "w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t.archive.documents.manageTypes} size="max-w-3xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-100 p-4 rounded-lg border border-gray-200 h-[350px] flex flex-col">
                    <h4 className="text-sm font-bold text-gray-700 mb-2 border-b pb-2">Available Types</h4>
                    <div className="overflow-y-auto flex-grow space-y-2 pr-1">
                        {types.map(item => (
                            <div key={item.id} onClick={() => setFormData({ id: item.id, nameAr: item.nameAr, nameEn: item.nameEn })} className={`p-3 rounded-md cursor-pointer flex justify-between items-center border shadow-sm transition-colors ${formData.id === item.id ? 'bg-indigo-100 border-indigo-300 text-indigo-900' : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'}`}>
                                <span className="font-medium">{language === 'ar' ? item.nameAr : item.nameEn}</span>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} disabled={!permissions.delete} className="text-gray-400 hover:text-red-600 disabled:text-gray-300 p-1 rounded hover:bg-red-50"><TrashIcon className="w-4 h-4" /></button>
                            </div>
                        ))}
                    </div>
                     <button onClick={() => setFormData({ id: null, nameAr: '', nameEn: '' })} className="w-full mt-3 py-2 text-sm bg-white border border-indigo-200 text-indigo-700 font-semibold rounded shadow-sm hover:bg-indigo-50">+ {t.common.new}</button>
                </div>
                <div className="p-2">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">{formData.id ? t.common.edit : t.common.add}</h3>
                    <div className="space-y-4">
                        <FormField label={t.archive.documents.typeNameAr} required><input type="text" value={formData.nameAr} onChange={e => setFormData(p => ({...p, nameAr: e.target.value}))} className={inputClass} /></FormField>
                        <FormField label={t.archive.documents.typeNameEn} required><input type="text" value={formData.nameEn} onChange={e => setFormData(p => ({...p, nameEn: e.target.value}))} className={inputClass} /></FormField>
                    </div>
                    <div className="flex justify-end pt-6">
                         <button onClick={handleSubmit} disabled={formData.id ? !permissions.update : !permissions.create} className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 shadow-md transition-colors">{t.common.save}</button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

const DocumentsPage: React.FC<DocumentsPageProps> = ({ documents, setDocuments, documentTypes, setDocumentTypes, archiveLocations, projects, permissions, logActivity }) => {
    const { t, language } = useTranslation();
    const { showToast } = useToast();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [projectFilter, setProjectFilter] = useState('ALL');
    const [editingDoc, setEditingDoc] = useState<PhysicalDocument | null>(null);

    const initialFormState: Omit<PhysicalDocument, 'id'> = {
        name: '',
        projectCode: '',
        creationDate: new Date().toISOString().split('T')[0],
        year: new Date().getFullYear().toString(),
        size: 'Medium',
        typeId: '',
        locationId: '',
        shelfNumber: 1,
        description: ''
    };
    const [formData, setFormData] = useState(initialFormState);

    const filteredDocuments = useMemo(() => {
        let result = documents;
        if (projectFilter !== 'ALL') {
            result = result.filter(d => d.projectCode === projectFilter);
        }
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(d => 
                d.name.toLowerCase().includes(term) || 
                d.projectCode.toLowerCase().includes(term) ||
                d.year.includes(term)
            );
        }
        return result;
    }, [documents, searchTerm, projectFilter]);

    const openModal = (doc: PhysicalDocument | null = null) => {
        if (doc) {
            setEditingDoc(doc);
            setFormData(doc);
        } else {
            setEditingDoc(null);
            setFormData(initialFormState);
        }
        setIsModalOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const projectCode = e.target.value;
        setFormData(prev => ({...prev, projectCode: projectCode }));
    }

    const handleSubmit = () => {
        if (!formData.name || !formData.typeId || !formData.locationId || !formData.shelfNumber) {
            showToast(t.common.fillRequiredFields, 'error');
            return;
        }

        // Validate Shelf
        const location = archiveLocations.find(l => l.id === formData.locationId);
        if (location && formData.shelfNumber > location.shelvesCount) {
            showToast(t.archive.documents.shelfError.replace('{max}', location.shelvesCount.toString()), 'error');
            return;
        }

        if (editingDoc) {
            setDocuments(prev => prev.map(d => d.id === editingDoc.id ? { ...d, ...formData } : d));
            logActivity({ actionType: 'update', entityType: 'PhysicalDocument', entityName: formData.name });
            showToast(t.common.updatedSuccess, 'success');
        } else {
            const newDoc = { id: `doc-${Date.now()}`, ...formData };
            setDocuments(prev => [...prev, newDoc]);
            logActivity({ actionType: 'create', entityType: 'PhysicalDocument', entityName: formData.name });
            showToast(t.common.createdSuccess, 'success');
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: string) => {
        if (window.confirm(t.common.deleteConfirm)) {
            const toDelete = documents.find(d => d.id === id);
            if(toDelete) logActivity({ actionType: 'delete', entityType: 'PhysicalDocument', entityName: toDelete.name });
            setDocuments(prev => prev.filter(d => d.id !== id));
            showToast(t.common.deletedSuccess, 'success');
        }
    };

    const selectedLocationMaxShelves = archiveLocations.find(l => l.id === formData.locationId)?.shelvesCount || 0;
    
    // Styles ensuring visibility (White background, dark text)
    const inputClasses = "w-full p-2.5 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400 disabled:bg-gray-100 disabled:text-gray-500";
    const readOnlyInputClasses = "w-full p-2.5 border border-gray-300 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed";

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                     <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600"><DocumentTextIcon className="w-8 h-8"/></div>
                     <h1 className="text-2xl font-bold text-slate-800">{t.archive.documents.title}</h1>
                </div>
                <button onClick={() => openModal()} disabled={!permissions.create} className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2.5 px-5 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-300">
                    <PlusIcon className="w-5 h-5"/> {t.common.add}
                </button>
            </div>

            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input type="text" placeholder={t.archive.documents.searchPlaceholder} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900" />
                </div>
                <div className="w-full md:w-1/3">
                    <select 
                        value={projectFilter} 
                        onChange={(e) => setProjectFilter(e.target.value)} 
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
                    >
                        <option value="ALL">{t.archive.documents.allProjects}</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.projectCode}>
                                {language === 'ar' ? p.nameAr : p.nameEn}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-slate-700">{t.archive.documents.docName}</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-700">{t.archive.documents.docType}</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-700">{t.archive.documents.projectCode}</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-700">{t.archive.documents.year}</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-700">{t.archive.documents.location}</th>
                            <th className="px-4 py-3 text-center font-semibold text-slate-700">{t.users.actions}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                        {filteredDocuments.map(doc => {
                            const type = documentTypes.find(t => t.id === doc.typeId);
                            const loc = archiveLocations.find(l => l.id === doc.locationId);
                            // Find project name if code matches
                            const proj = projects.find(p => p.projectCode === doc.projectCode);
                            
                            return (
                                <tr key={doc.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium text-slate-900">{doc.name}</td>
                                    <td className="px-4 py-3 text-slate-600">{type ? (language === 'ar' ? type.nameAr : type.nameEn) : '-'}</td>
                                    <td className="px-4 py-3 text-slate-600">
                                        {doc.projectCode ? (
                                            <span>
                                                <span className="font-mono font-bold text-indigo-700">{doc.projectCode}</span>
                                                {proj && <span className="text-xs text-slate-500 block">{language === 'ar' ? proj.nameAr : proj.nameEn}</span>}
                                            </span>
                                        ) : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">{doc.year}</td>
                                    <td className="px-4 py-3 text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <ArchiveIcon className="w-4 h-4 text-slate-400 flex-shrink-0"/>
                                            <div>
                                                <div className="text-slate-800 font-medium">{loc?.location}</div>
                                                <div className="text-xs text-slate-500 flex items-center gap-1">
                                                    {loc?.name}
                                                    <span className="mx-1 text-slate-300">|</span>
                                                    <span className="font-semibold text-indigo-600">{t.archive.locations.shelf} {doc.shelfNumber}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => openModal(doc)} disabled={!permissions.update} className="text-indigo-600 hover:text-indigo-900 disabled:text-slate-300"><PencilIcon/></button>
                                            <button onClick={() => handleDelete(doc.id)} disabled={!permissions.delete} className="text-red-600 hover:text-red-900 disabled:text-slate-300"><TrashIcon/></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredDocuments.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-slate-500">{t.meetingSearch.noResults}</td></tr>}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingDoc ? t.archive.documents.editDocument : t.archive.documents.newDocument} size="max-w-4xl">
                <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormField label={t.archive.documents.docName} required><input type="text" name="name" value={formData.name} onChange={handleInputChange} className={inputClasses} /></FormField>
                        <FormField label={t.archive.documents.projectCode}>
                            <select name="projectCode" value={formData.projectCode} onChange={handleProjectChange} className={inputClasses}>
                                <option value="">{t.common.all} / None</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.projectCode}>
                                        {p.projectCode} - {language === 'ar' ? p.nameAr : p.nameEn}
                                    </option>
                                ))}
                            </select>
                        </FormField>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                         <FormField label={t.archive.documents.year}><input type="text" name="year" value={formData.year} onChange={handleInputChange} className={inputClasses} /></FormField>
                         <FormField label={t.archive.documents.creationDate}>
                            <input type="date" name="creationDate" value={formData.creationDate} className={readOnlyInputClasses} readOnly />
                         </FormField>
                         <FormField label={t.archive.documents.size}>
                            <select name="size" value={formData.size} onChange={handleInputChange} className={inputClasses}>
                                <option value="Small">{t.archive.documents.sizes.Small}</option>
                                <option value="Medium">{t.archive.documents.sizes.Medium}</option>
                                <option value="Large">{t.archive.documents.sizes.Large}</option>
                            </select>
                         </FormField>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-end">
                        <FormField label={t.archive.documents.docType} required>
                             <div className="flex gap-2">
                                <select name="typeId" value={formData.typeId} onChange={handleInputChange} className={inputClasses}>
                                    <option value="">{t.archive.documents.typePlaceholder}</option>
                                    {documentTypes.map(t => <option key={t.id} value={t.id}>{language === 'ar' ? t.nameAr : t.nameEn}</option>)}
                                </select>
                                <button onClick={() => setIsTypeModalOpen(true)} className="p-2.5 bg-white border border-gray-300 rounded hover:bg-gray-50 text-indigo-600"><PencilIcon/></button>
                             </div>
                        </FormField>
                        <div className="grid grid-cols-2 gap-3">
                             <FormField label={t.archive.documents.location} required>
                                <select name="locationId" value={formData.locationId} onChange={handleInputChange} className={inputClasses}>
                                    <option value="">{t.archive.documents.locationPlaceholder}</option>
                                    {archiveLocations.map(l => <option key={l.id} value={l.id}>{l.name} ({l.code})</option>)}
                                </select>
                            </FormField>
                            <FormField label={t.archive.documents.shelfNumber} required>
                                <input 
                                    type="number" 
                                    name="shelfNumber" 
                                    value={formData.shelfNumber} 
                                    onChange={(e) => setFormData(prev => ({...prev, shelfNumber: parseInt(e.target.value)}))} 
                                    className={inputClasses} 
                                    min="1"
                                    max={selectedLocationMaxShelves > 0 ? selectedLocationMaxShelves : undefined}
                                />
                            </FormField>
                        </div>
                    </div>
                    {formData.locationId && formData.shelfNumber > selectedLocationMaxShelves && (
                         <p className="text-xs text-red-600 font-semibold">{t.archive.documents.shelfError.replace('{max}', selectedLocationMaxShelves.toString())}</p>
                    )}
                    
                    <FormField label={t.archive.documents.description}>
                        <textarea name="description" value={formData.description || ''} onChange={handleInputChange} className={inputClasses} rows={3}></textarea>
                    </FormField>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium shadow-sm">{t.common.cancel}</button>
                        <button onClick={handleSubmit} className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm">{t.common.save}</button>
                    </div>
                </div>
            </Modal>

            {isTypeModalOpen && <TypeModal isOpen={isTypeModalOpen} onClose={() => setIsTypeModalOpen(false)} types={documentTypes} setTypes={setDocumentTypes} permissions={permissions} logActivity={logActivity} />}
        </div>
    );
};

export default DocumentsPage;