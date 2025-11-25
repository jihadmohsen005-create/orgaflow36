import React, { useState, useMemo, useEffect } from 'react';
import { PolicyManual, PermissionActions } from '../types';
import { useTranslation } from '../LanguageContext';
import { useToast } from '../ToastContext';
import Modal from '../components/Modal';
import { PlusIcon, PencilIcon, TrashIcon, SearchIcon, PaperClipIcon } from '../components/icons';
import { supabase } from '../src/lib/supabase';
import { uploadFile, deleteFile } from '../src/services/storageService';

// Props
interface PoliciesAndManualsPageProps {
  policies: PolicyManual[];
  setPolicyManuals: React.Dispatch<React.SetStateAction<PolicyManual[]>>;
  permissions: PermissionActions;
  logActivity: (args: { actionType: 'create' | 'update' | 'delete'; entityType: string; entityName: string; }) => void;
}

// Initial form state
const initialFormState: Omit<PolicyManual, 'id' | 'attachment'> = {
  name: '',
  year: new Date().getFullYear().toString(),
  notes: '',
  issueDate: new Date().toISOString().split('T')[0],
};

const FormField: React.FC<{ label: string; children: React.ReactNode; required?: boolean }> = ({ label, children, required }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
    </div>
);

// Main component
const PoliciesAndManualsPage: React.FC<PoliciesAndManualsPageProps> = ({ policies, setPolicyManuals, permissions, logActivity }) => {
    const { t } = useTranslation();
    const { showToast } = useToast();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<PolicyManual | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Load policies from Supabase on mount
    useEffect(() => {
        const loadPolicies = async () => {
            try {
                setIsLoading(true);
                const { data, error } = await supabase
                    .from('policy_manuals')
                    .select('*')
                    .order('issue_date', { ascending: false });

                if (error) throw error;

                // Transform data to match PolicyManual type
                const transformedData: PolicyManual[] = (data || []).map(item => ({
                    id: item.id,
                    name: item.name,
                    year: item.year || new Date().getFullYear().toString(),
                    notes: item.notes || '',
                    issueDate: item.issue_date || new Date().toISOString().split('T')[0],
                    attachment: {
                        name: item.attachment_name || '',
                        data: item.attachment_url || '', // URL instead of Base64
                        type: item.attachment_type || ''
                    }
                }));

                setPolicyManuals(transformedData);
            } catch (error) {
                console.error('Error loading policies:', error);
                showToast('فشل تحميل السياسات', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        loadPolicies();
    }, []);

    const filteredPolicies = useMemo(() => {
        if (!searchTerm) return policies;
        const lowercasedTerm = searchTerm.toLowerCase();
        return policies.filter(p => 
            p.name.toLowerCase().includes(lowercasedTerm) ||
            p.year.toString().includes(lowercasedTerm) ||
            p.notes.toLowerCase().includes(lowercasedTerm)
        );
    }, [policies, searchTerm]);

    const openModal = (policy: PolicyManual | null = null) => {
        setEditingPolicy(policy);
        setIsModalOpen(true);
    };

    const handleDelete = async (policyId: string) => {
        const policyToDelete = policies.find(p => p.id === policyId);
        if (!policyToDelete) return;

        if (!window.confirm(t.common.confirmDelete || 'هل أنت متأكد من الحذف؟')) return;

        try {
            // Delete file from Storage if exists
            if (policyToDelete.attachment?.data) {
                try {
                    await deleteFile(policyToDelete.attachment.data);
                } catch (error) {
                    console.warn('Failed to delete file from storage:', error);
                }
            }

            // Delete from database
            const { error } = await supabase
                .from('policy_manuals')
                .delete()
                .eq('id', policyId);

            if (error) throw error;

            logActivity({ actionType: 'delete', entityType: 'PolicyManual', entityName: policyToDelete.name });
            setPolicyManuals(prev => prev.filter(p => p.id !== policyId));
            showToast(t.common.deletedSuccess, 'success');
        } catch (error) {
            console.error('Error deleting policy:', error);
            showToast('فشل حذف السياسة', 'error');
        }
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{t.nav.policiesAndManuals}</h1>
                <button onClick={() => openModal()} disabled={!permissions.create} className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-300">
                    <PlusIcon /> {t.common.add}
                </button>
            </div>

            <div className="mb-4">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder={t.policiesAndManuals.searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
            </div>

            <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">{t.policiesAndManuals.attachmentName}</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">{t.policiesAndManuals.year}</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">{t.policiesAndManuals.issueDate}</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">{t.policiesAndManuals.notes}</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">{t.policiesAndManuals.actions}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {filteredPolicies.map(policy => (
                            <tr key={policy.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <a href={policy.attachment.data} download={policy.attachment.name} className="flex items-center gap-2 text-indigo-600 hover:underline">
                                        <PaperClipIcon />
                                        <span className="font-medium">{policy.name}</span>
                                    </a>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-700">{policy.year}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-700">{policy.issueDate}</td>
                                <td className="px-6 py-4 text-slate-700 max-w-sm truncate">{policy.notes}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => openModal(policy)} disabled={!permissions.update} className="text-indigo-600 hover:text-indigo-900 disabled:text-slate-300"><PencilIcon/></button>
                                        <button onClick={() => handleDelete(policy.id)} disabled={!permissions.delete} className="text-red-600 hover:text-red-900 disabled:text-slate-300"><TrashIcon/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredPolicies.length === 0 && <p className="text-center p-8 text-slate-500">{t.policiesAndManuals.noPoliciesFound}</p>}
            </div>

            {isModalOpen && (
                <PolicyModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    policy={editingPolicy}
                    setPolicyManuals={setPolicyManuals}
                    logActivity={logActivity}
                    permissions={permissions}
                />
            )}
        </div>
    );
};

// Policy Add/Edit Modal
interface PolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
    policy: PolicyManual | null;
    setPolicyManuals: React.Dispatch<React.SetStateAction<PolicyManual[]>>;
    logActivity: (args: any) => void;
    permissions: PermissionActions;
}

const PolicyModal: React.FC<PolicyModalProps> = ({ isOpen, onClose, policy, setPolicyManuals, logActivity, permissions }) => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [formData, setFormData] = useState(policy ? { name: policy.name, year: policy.year, notes: policy.notes, issueDate: policy.issueDate } : initialFormState);
    const [file, setFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files?.[0]) {
            setFile(e.target.files[0]);
        }
    };
    
    const handleSubmit = async () => {
        if (!formData.name || !formData.year || !formData.issueDate) {
            showToast(t.common.fillRequiredFields, 'error');
            return;
        }
        if(!policy && !file) {
            showToast(t.policiesAndManuals.attachmentRequired, 'error');
            return;
        }

        try {
            setIsSaving(true);

            let attachmentUrl = policy?.attachment?.data || '';
            let attachmentName = policy?.attachment?.name || '';
            let attachmentType = policy?.attachment?.type || '';

            // Upload new file to Storage if provided
            if (file) {
                try {
                    // Delete old file if updating
                    if (policy?.attachment?.data) {
                        try {
                            await deleteFile(policy.attachment.data);
                        } catch (error) {
                            console.warn('Failed to delete old file:', error);
                        }
                    }

                    // Upload new file
                    const tempId = policy?.id || `pol-${Date.now()}`;
                    attachmentUrl = await uploadFile(file, 'policies', tempId);
                    attachmentName = file.name;
                    attachmentType = file.type;
                } catch (error) {
                    console.error('Error uploading file:', error);
                    showToast('فشل رفع الملف', 'error');
                    return;
                }
            }

            const policyData = {
                name: formData.name,
                year: formData.year,
                notes: formData.notes,
                issue_date: formData.issueDate,
                attachment_name: attachmentName,
                attachment_url: attachmentUrl,
                attachment_type: attachmentType
            };

            if (policy) {
                // Update existing policy
                const { error } = await supabase
                    .from('policy_manuals')
                    .update(policyData)
                    .eq('id', policy.id);

                if (error) throw error;

                const updatedPolicy: PolicyManual = {
                    ...policy,
                    ...formData,
                    attachment: { name: attachmentName, data: attachmentUrl, type: attachmentType }
                };
                setPolicyManuals(prev => prev.map(p => p.id === policy.id ? updatedPolicy : p));
                logActivity({ actionType: 'update', entityType: 'PolicyManual', entityName: formData.name });
                showToast(t.common.updatedSuccess, 'success');
            } else {
                // Create new policy
                const { data, error } = await supabase
                    .from('policy_manuals')
                    .insert([policyData])
                    .select()
                    .single();

                if (error) throw error;

                const newPolicy: PolicyManual = {
                    id: data.id,
                    ...formData,
                    attachment: { name: attachmentName, data: attachmentUrl, type: attachmentType }
                };
                setPolicyManuals(prev => [newPolicy, ...prev]);
                logActivity({ actionType: 'create', entityType: 'PolicyManual', entityName: formData.name });
                showToast(t.common.createdSuccess, 'success');
            }
            onClose();
        } catch (error) {
            console.error('Error saving policy:', error);
            showToast('فشل حفظ السياسة', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={policy ? t.policiesAndManuals.editPolicyManual : t.policiesAndManuals.addNewPolicyManual}>
            <div className="space-y-4">
                <FormField label={t.policiesAndManuals.attachmentName} required><input type="text" name="name" value={formData.name} onChange={handleChange} className="form-input" required /></FormField>
                <div className="grid grid-cols-2 gap-4">
                    <FormField label={t.policiesAndManuals.year} required><input type="number" name="year" value={formData.year} onChange={handleChange} className="form-input" required /></FormField>
                    <FormField label={t.policiesAndManuals.issueDate} required><input type="date" name="issueDate" value={formData.issueDate} onChange={handleChange} className="form-input" required /></FormField>
                </div>
                <FormField label={t.policiesAndManuals.notes}><textarea name="notes" value={formData.notes} onChange={handleChange} className="form-input" rows={3}></textarea></FormField>
                <FormField label="Attachment" required={!policy}>
                    <input type="file" onChange={handleFileChange} className="form-input" required={!policy} />
                    {policy && <p className="text-xs text-slate-500 mt-1">{t.policiesAndManuals.currentFile.replace('{fileName}', policy.attachment.name)}</p>}
                </FormField>

                 <div className="pt-4 flex justify-end gap-3">
                    <button onClick={onClose} disabled={isSaving} className="px-4 py-2 bg-slate-200 rounded-lg disabled:opacity-50">{t.common.cancel}</button>
                    <button onClick={handleSubmit} disabled={isSaving} className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50">
                        {isSaving ? 'جاري الحفظ...' : t.common.save}
                    </button>
                </div>
            </div>
            <style>{`.form-input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.375rem; background-color: #f8fafc; color: #0f172a; }`}</style>
        </Modal>
    );
};

export default PoliciesAndManualsPage;