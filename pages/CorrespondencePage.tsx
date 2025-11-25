
import React, { useState, useMemo, useEffect } from 'react';
import { Correspondence, Project, PermissionActions } from '../types';
import { useTranslation } from '../LanguageContext';
import { useToast } from '../ToastContext';
import { PlusIcon, PaperClipIcon, TrashIcon, EnvelopeIcon, PaperAirplaneIcon, InboxIcon, SearchIcon } from '../components/icons';
import { supabase } from '../src/lib/supabase';
import { uploadFile, deleteFile } from '../src/services/storageService';

interface CorrespondencePageProps {
    correspondenceList: Correspondence[];
    setCorrespondenceList: React.Dispatch<React.SetStateAction<Correspondence[]>>;
    projects: Project[];
    permissions: PermissionActions;
    logActivity: (args: any) => void;
}

const FormField: React.FC<{ label: string; children: React.ReactNode; required?: boolean }> = ({ label, children, required }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
    </div>
);

const CorrespondencePage: React.FC<CorrespondencePageProps> = ({ correspondenceList, setCorrespondenceList, projects, permissions, logActivity }) => {
    const { t, language } = useTranslation();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'outgoing' | 'incoming' | 'reports'>('outgoing');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Load correspondence from Supabase on mount
    useEffect(() => {
        const loadCorrespondence = async () => {
            try {
                setIsLoading(true);
                const { data, error } = await supabase
                    .from('correspondence')
                    .select('*')
                    .order('sequence', { ascending: false });

                if (error) throw error;

                const transformedData: Correspondence[] = (data || []).map(item => ({
                    id: item.id,
                    type: item.type as 'Outgoing' | 'Incoming',
                    title: item.title || '',
                    entity: item.entity || '',
                    date: item.date || new Date().toISOString().split('T')[0],
                    serialNumber: item.serial_number || '',
                    sequence: item.sequence || 0,
                    year: item.year || new Date().getFullYear(),
                    projectId: item.project_id || '',
                    attachment: item.attachment_url ? {
                        name: item.attachment_name || '',
                        data: item.attachment_url,
                        type: item.attachment_type || ''
                    } : undefined
                }));

                setCorrespondenceList(transformedData);
            } catch (error) {
                console.error('Error loading correspondence:', error);
                showToast('فشل تحميل المراسلات', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        loadCorrespondence();
    }, []);

    // --- Shared Logic ---
    const [mode, setMode] = useState<'new' | 'edit' | 'view'>('new');
    const [selectedId, setSelectedId] = useState('');
    const [formData, setFormData] = useState<Omit<Correspondence, 'id'>>({
        type: 'Outgoing',
        title: '',
        entity: '',
        date: new Date().toISOString().split('T')[0],
        serialNumber: '',
        sequence: 0,
        year: new Date().getFullYear(),
        attachment: undefined
    });

    const [searchTerm, setSearchTerm] = useState('');

    // --- Auto Numbering ---
    const generateSerialNumber = (type: 'Outgoing' | 'Incoming', year: number) => {
        const existingInYear = correspondenceList.filter(c => c.type === type && c.year === year);
        const maxSeq = existingInYear.reduce((max, c) => (c.sequence > max ? c.sequence : max), 0);
        const nextSeq = maxSeq + 1;
        const prefix = type === 'Outgoing' ? 'OUT' : 'IN';
        // Format: PREFIX-YEAR-0001
        const serial = `${prefix}-${year}-${String(nextSeq).padStart(4, '0')}`;
        return { serial, sequence: nextSeq };
    };

    useEffect(() => {
        if (mode === 'new') {
            // Reset form based on active tab
            const currentYear = new Date().getFullYear();
            const type = activeTab === 'incoming' ? 'Incoming' : 'Outgoing';
            const { serial, sequence } = generateSerialNumber(type, currentYear);
            
            setFormData({
                type,
                title: '',
                entity: '',
                date: new Date().toISOString().split('T')[0],
                serialNumber: serial,
                sequence: sequence,
                year: currentYear,
                attachment: undefined
            });
        }
    }, [activeTab, mode, correspondenceList]); // Re-run when tab changes to reset form or when list updates

    // --- Handlers ---
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedId(id);
        if (id) {
            const item = correspondenceList.find(c => c.id === id);
            if (item) {
                setFormData(item);
                setMode('view');
            }
        } else {
            setMode('new');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // If date changes year, regenerate serial number if in new mode
        if (name === 'date' && mode === 'new') {
            const year = new Date(value).getFullYear();
            if (year !== formData.year) {
                const { serial, sequence } = generateSerialNumber(formData.type, year);
                setFormData(prev => ({ ...prev, year, serialNumber: serial, sequence, [name]: value }));
            }
        }
    };

    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleAction = async (action: 'new' | 'save' | 'edit' | 'delete') => {
        if (action === 'new') {
            setSelectedId('');
            setSelectedFile(null);
            setMode('new');
            return;
        }

        if (action === 'save') {
            if (!formData.title || !formData.entity || !formData.date) {
                showToast(t.common.fillRequiredFields, 'error');
                return;
            }

            try {
                setIsSaving(true);

                let attachmentUrl = formData.attachment?.data || '';
                let attachmentName = formData.attachment?.name || '';
                let attachmentType = formData.attachment?.type || '';

                // Upload new file if selected
                if (selectedFile) {
                    try {
                        // Delete old file if updating
                        if (mode === 'edit' && formData.attachment?.data) {
                            try {
                                await deleteFile(formData.attachment.data);
                            } catch (error) {
                                console.warn('Failed to delete old file:', error);
                            }
                        }

                        // Upload new file
                        const tempId = selectedId || `corr-${Date.now()}`;
                        attachmentUrl = await uploadFile(selectedFile, 'correspondence', tempId);
                        attachmentName = selectedFile.name;
                        attachmentType = selectedFile.type;
                    } catch (error: any) {
                        console.error('Error uploading file:', error);
                        const errorMessage = error?.message || error?.error?.message || 'خطأ غير معروف';
                        showToast(`فشل رفع الملف: ${errorMessage}`, 'error');
                        setIsSaving(false);
                        return;
                    }
                }

                const corrData = {
                    type: formData.type,
                    title: formData.title,
                    entity: formData.entity,
                    date: formData.date,
                    serial_number: formData.serialNumber,
                    sequence: formData.sequence,
                    year: formData.year,
                    project_id: null, // Always null for now - can be updated later if needed
                    attachment_name: attachmentName || null,
                    attachment_url: attachmentUrl || null,
                    attachment_type: attachmentType || null
                };

                if (mode === 'new') {
                    const { data, error } = await supabase
                        .from('correspondence')
                        .insert([corrData])
                        .select()
                        .single();

                    if (error) throw error;

                    const newItem: Correspondence = {
                        id: data.id,
                        ...formData,
                        attachment: attachmentUrl ? { name: attachmentName, data: attachmentUrl, type: attachmentType } : undefined
                    };
                    setCorrespondenceList(prev => [...prev, newItem]);
                    logActivity({ actionType: 'create', entityType: 'Correspondence', entityName: newItem.serialNumber });
                    setSelectedId(data.id);
                    showToast(t.common.createdSuccess, 'success');
                } else if (mode === 'edit') {
                    const { error } = await supabase
                        .from('correspondence')
                        .update(corrData)
                        .eq('id', selectedId);

                    if (error) throw error;

                    const updatedItem: Correspondence = {
                        id: selectedId,
                        ...formData,
                        attachment: attachmentUrl ? { name: attachmentName, data: attachmentUrl, type: attachmentType } : undefined
                    };
                    setCorrespondenceList(prev => prev.map(c => c.id === selectedId ? updatedItem : c));
                    logActivity({ actionType: 'update', entityType: 'Correspondence', entityName: formData.serialNumber });
                    setMode('view');
                    showToast(t.common.updatedSuccess, 'success');
                }
                setSelectedFile(null);
            } catch (error: any) {
                console.error('Error saving correspondence:', error);
                const errorMessage = error?.message || error?.error_description || error?.hint || 'خطأ غير معروف';
                showToast(`فشل حفظ المراسلة: ${errorMessage}`, 'error');
            } finally {
                setIsSaving(false);
            }
            return;
        }

        if (!selectedId) return;
        if (action === 'edit') setMode('edit');
        if (action === 'delete') {
            if (window.confirm(t.common.deleteConfirm)) {
                try {
                    const toDelete = correspondenceList.find(c => c.id === selectedId);

                    // Delete file from Storage if exists
                    if (toDelete?.attachment?.data) {
                        try {
                            await deleteFile(toDelete.attachment.data);
                        } catch (error) {
                            console.warn('Failed to delete file from storage:', error);
                        }
                    }

                    // Delete from database
                    const { error } = await supabase
                        .from('correspondence')
                        .delete()
                        .eq('id', selectedId);

                    if (error) throw error;

                    if(toDelete) logActivity({ actionType: 'delete', entityType: 'Correspondence', entityName: toDelete.serialNumber });
                    setCorrespondenceList(prev => prev.filter(c => c.id !== selectedId));
                    setSelectedId('');
                    setMode('new');
                    showToast(t.common.deletedSuccess, 'success');
                } catch (error) {
                    console.error('Error deleting correspondence:', error);
                    showToast('فشل حذف المراسلة', 'error');
                }
            }
        }
    };

    // --- Helpers for Lists ---
    const currentList = useMemo(() => {
        const type = activeTab === 'incoming' ? 'Incoming' : 'Outgoing';
        return correspondenceList.filter(c => c.type === type).sort((a, b) => b.sequence - a.sequence);
    }, [correspondenceList, activeTab]);

    // --- Search Logic ---
    const searchResults = useMemo(() => {
        if (!searchTerm.trim()) return [];
        const lowerTerm = searchTerm.toLowerCase();
        return correspondenceList.filter(c => 
            c.title.toLowerCase().includes(lowerTerm) ||
            c.entity.toLowerCase().includes(lowerTerm) ||
            c.serialNumber.toLowerCase().includes(lowerTerm) ||
            c.date.includes(lowerTerm) ||
            (c.projectId && projects.find(p => p.id === c.projectId)?.nameEn.toLowerCase().includes(lowerTerm)) ||
            (c.projectId && projects.find(p => p.id === c.projectId)?.nameAr.includes(lowerTerm))
        );
    }, [correspondenceList, searchTerm, projects]);


    // --- Render Logic ---
    const isReadOnly = mode === 'view' || (mode === 'edit' && !permissions.update);
    const inputClasses = `w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-slate-900 transition focus:ring-2 focus:ring-indigo-500 read-only:bg-slate-100 disabled:bg-slate-100`;
    const baseButtonClass = "px-6 py-2.5 text-white font-semibold rounded-md shadow-sm transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed";

    const renderForm = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 border rounded-lg">
                <FormField label={activeTab === 'outgoing' ? t.correspondence.outgoing.serialNumber : t.correspondence.incoming.serialNumber}>
                    <input type="text" name="serialNumber" value={formData.serialNumber} readOnly className={`${inputClasses} bg-slate-200 font-mono font-bold`} />
                </FormField>
                <FormField label={activeTab === 'outgoing' ? t.correspondence.outgoing.date : t.correspondence.incoming.date} required>
                    <input type="date" name="date" value={formData.date} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required />
                </FormField>
                 <FormField label={activeTab === 'outgoing' ? t.correspondence.outgoing.project : t.correspondence.incoming.project}>
                    <select name="projectId" value={formData.projectId || ''} onChange={handleInputChange} disabled={isReadOnly} className={inputClasses}>
                        <option value="">--</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{language === 'ar' ? p.nameAr : p.nameEn}</option>)}
                    </select>
                </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField label={activeTab === 'outgoing' ? t.correspondence.outgoing.titleLabel : t.correspondence.incoming.titleLabel} required>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required />
                </FormField>
                 <FormField label={activeTab === 'outgoing' ? t.correspondence.outgoing.receiver : t.correspondence.incoming.sender} required>
                    <input type="text" name="entity" value={formData.entity} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required />
                </FormField>
            </div>

            <div>
                <FormField label={activeTab === 'outgoing' ? t.correspondence.outgoing.attachment : t.correspondence.incoming.attachment}>
                     {!isReadOnly && <input type="file" onChange={handleFileChange} className={`${inputClasses} cursor-pointer`} />}
                     {formData.attachment && (
                        <div className="mt-2 flex items-center gap-2 p-2 bg-white border rounded-md w-fit">
                             <PaperClipIcon className="w-4 h-4 text-slate-500" />
                             <a href={formData.attachment.data} download={formData.attachment.name} className="text-indigo-600 hover:underline text-sm font-medium">{formData.attachment.name}</a>
                             {!isReadOnly && <button onClick={() => setFormData(prev => ({...prev, attachment: undefined}))} className="text-red-500 hover:text-red-700 ml-2"><TrashIcon className="w-4 h-4"/></button>}
                        </div>
                     )}
                </FormField>
            </div>
            
            <div className="pt-6 border-t border-slate-200 flex justify-center gap-3">
                <button onClick={() => handleAction('new')} disabled={!permissions.create} className={`${baseButtonClass} bg-indigo-600 hover:bg-indigo-700`}>{t.common.add}</button>
                <button onClick={() => handleAction('save')} disabled={mode === 'view' || (mode === 'new' ? !permissions.create : !permissions.update)} className={`${baseButtonClass} bg-blue-600 hover:bg-blue-700`}>{t.common.save}</button>
                <button onClick={() => handleAction('edit')} disabled={!selectedId || mode === 'edit' || !permissions.update} className={`${baseButtonClass} bg-amber-500 hover:bg-amber-600`}>{t.common.edit}</button>
                <button onClick={() => handleAction('delete')} disabled={!selectedId || !permissions.delete} className={`${baseButtonClass} bg-red-600 hover:bg-red-700`}>{t.common.delete}</button>
            </div>
        </div>
    );

    const renderReports = () => (
        <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-lg border">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={t.correspondence.reports.searchPlaceholder}
                        className={`${inputClasses} pl-10`}
                    />
                </div>
            </div>

            <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full text-sm">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="p-3 text-left font-semibold text-slate-700">{t.correspondence.reports.headers.serial}</th>
                            <th className="p-3 text-left font-semibold text-slate-700">{t.correspondence.reports.headers.type}</th>
                            <th className="p-3 text-left font-semibold text-slate-700">{t.correspondence.reports.headers.title}</th>
                            <th className="p-3 text-left font-semibold text-slate-700">{t.correspondence.reports.headers.entity}</th>
                            <th className="p-3 text-left font-semibold text-slate-700">{t.correspondence.reports.headers.date}</th>
                            <th className="p-3 text-left font-semibold text-slate-700">{t.correspondence.reports.headers.project}</th>
                            <th className="p-3 text-left font-semibold text-slate-700">{t.correspondence.reports.headers.attachment}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {searchResults.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50">
                                <td className="p-3 font-mono text-slate-900">{item.serialNumber}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.type === 'Incoming' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                        {item.type === 'Incoming' ? t.correspondence.tabs.incoming : t.correspondence.tabs.outgoing}
                                    </span>
                                </td>
                                <td className="p-3 text-slate-800">{item.title}</td>
                                <td className="p-3 text-slate-800">{item.entity}</td>
                                <td className="p-3 text-slate-800">{item.date}</td>
                                <td className="p-3 text-slate-800">{item.projectId ? (projects.find(p => p.id === item.projectId)?.nameAr || '') : '-'}</td>
                                <td className="p-3">
                                    {item.attachment ? (
                                        <a href={item.attachment.data} download={item.attachment.name} className="text-indigo-600 hover:text-indigo-800"><PaperClipIcon className="w-5 h-5" /></a>
                                    ) : '-'}
                                </td>
                            </tr>
                        ))}
                        {searchTerm && searchResults.length === 0 && (
                            <tr><td colSpan={7} className="p-8 text-center text-slate-500">{t.correspondence.reports.noResults}</td></tr>
                        )}
                        {!searchTerm && (
                            <tr><td colSpan={7} className="p-8 text-center text-slate-500">{t.correspondence.reports.searchPlaceholder}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 rounded-lg">
                    <EnvelopeIcon className="w-8 h-8 text-indigo-600" />
                </div>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{t.correspondence.title}</h1>
            </div>
            
            <div className="border-b border-slate-200 mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button onClick={() => setActiveTab('outgoing')} className={`${activeTab === 'outgoing' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-700 hover:text-slate-800 hover:border-slate-400'} flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        <PaperAirplaneIcon className="w-5 h-5" />
                        {t.correspondence.tabs.outgoing}
                    </button>
                    <button onClick={() => setActiveTab('incoming')} className={`${activeTab === 'incoming' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-700 hover:text-slate-800 hover:border-slate-400'} flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        <InboxIcon className="w-5 h-5" />
                        {t.correspondence.tabs.incoming}
                    </button>
                    <button onClick={() => setActiveTab('reports')} className={`${activeTab === 'reports' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-700 hover:text-slate-800 hover:border-slate-400'} flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        <SearchIcon className="w-5 h-5" />
                        {t.correspondence.tabs.reports}
                    </button>
                </nav>
            </div>

            {activeTab !== 'reports' && (
                <div className="space-y-6">
                    <div className="p-4 bg-slate-50 border rounded-lg">
                        <FormField label={activeTab === 'outgoing' ? t.correspondence.outgoing.select : t.correspondence.incoming.select}>
                            <select value={selectedId} onChange={handleSelectChange} className={inputClasses}>
                                <option value="">{activeTab === 'outgoing' ? t.correspondence.outgoing.selectPlaceholder : t.correspondence.incoming.selectPlaceholder}</option>
                                {currentList.map(item => (
                                    <option key={item.id} value={item.id}>{item.serialNumber} - {item.title}</option>
                                ))}
                            </select>
                        </FormField>
                    </div>
                    <div className="pt-4 border-t">
                        {renderForm()}
                    </div>
                </div>
            )}

            {activeTab === 'reports' && renderReports()}
        </div>
    );
};

export default CorrespondencePage;
