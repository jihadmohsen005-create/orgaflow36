

import React, { useState, useEffect } from 'react';
import { Project, PermissionActions, Donor, ProjectObjective, ProjectActivity, ProjectExtension, ProjectAttachment, ProjectReport, ProjectGrantPayment, ProjectAttachmentType, ProjectReportType, ProjectReportStatus, ProjectGrantPaymentStatus } from '../types';
import { useTranslation } from '../LanguageContext';
import { useToast } from '../ToastContext';
import { ArrowDownTrayIcon, CheckCircleIcon, DocumentDuplicateIcon, FinanceIcon, ItemsIcon, PaperClipIcon, PlusIcon, PurchaseOrderIcon, TrashIcon } from '../components/icons';
import Modal from '../components/Modal';

// Re-usable FormField component
const FormField: React.FC<{ label: string; children: React.ReactNode; className?: string; required?: boolean }> = ({ label, children, className = '', required }) => (
    <div className={`flex flex-col ${className}`}>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
    </div>
);

// Helper function for file reading
const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
};

// #region Modal Components

// Objectives Modal
const ObjectivesModal: React.FC<{ isOpen: boolean; onClose: () => void; project: Project; setProjects: React.Dispatch<React.SetStateAction<Project[]>> }> = ({ isOpen, onClose, project, setProjects }) => {
    const { t } = useTranslation();
    const [objectives, setObjectives] = useState<ProjectObjective[]>(project.objectives || []);

    useEffect(() => {
        setObjectives(project.objectives || []);
    }, [project]);

    const handleObjectiveChange = (index: number, field: 'objectiveAr' | 'objectiveEn', value: string) => {
        const newObjectives = [...objectives];
        newObjectives[index][field] = value;
        setObjectives(newObjectives);
    };

    const addObjective = () => setObjectives([...objectives, { id: `obj-${Date.now()}`, objectiveAr: '', objectiveEn: '' }]);
    const removeObjective = (index: number) => setObjectives(objectives.filter((_, i) => i !== index));

    const handleSave = () => {
        const updatedProject = { ...project, objectives };
        setProjects(prev => prev.map(p => p.id === project.id ? updatedProject : p));
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`${t.projects.objectivesTitle} - ${project.nameAr}`} size="max-w-3xl">
            <div className="space-y-4">
                {objectives.map((obj, index) => (
                    <div key={obj.id} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end p-2 bg-slate-50 rounded-md border">
                        <FormField label={t.projects.objectiveAr}><input type="text" value={obj.objectiveAr} onChange={e => handleObjectiveChange(index, 'objectiveAr', e.target.value)} className="form-input" /></FormField>
                        <FormField label={t.projects.objectiveEn}><input type="text" value={obj.objectiveEn} onChange={e => handleObjectiveChange(index, 'objectiveEn', e.target.value)} className="form-input" /></FormField>
                        <button onClick={() => removeObjective(index)} className="p-2 text-red-500 hover:text-red-700 h-10"><TrashIcon /></button>
                    </div>
                ))}
                <button onClick={addObjective} className="text-indigo-600 font-semibold text-sm flex items-center gap-2"><PlusIcon /> {t.projects.addObjective}</button>
            </div>
            <div className="mt-6 pt-4 border-t flex justify-end gap-3">
                <button onClick={onClose} className="btn-secondary">{t.common.cancel}</button>
                <button onClick={handleSave} className="btn-primary">{t.common.save}</button>
            </div>
        </Modal>
    );
};

// Activities Modal (similar to Objectives)
const ActivitiesModal: React.FC<{ isOpen: boolean; onClose: () => void; project: Project; setProjects: React.Dispatch<React.SetStateAction<Project[]>> }> = ({ isOpen, onClose, project, setProjects }) => {
    const { t } = useTranslation();
    const [activities, setActivities] = useState<ProjectActivity[]>(project.activities || []);
     useEffect(() => { setActivities(project.activities || []) }, [project]);

    const handleChange = (index: number, field: 'activityAr' | 'activityEn', value: string) => {
        const newActivities = [...activities];
        newActivities[index][field] = value;
        setActivities(newActivities);
    };

    const addActivity = () => setActivities([...activities, { id: `act-${Date.now()}`, activityAr: '', activityEn: '' }]);
    const removeActivity = (index: number) => setActivities(activities.filter((_, i) => i !== index));

    const handleSave = () => {
        setProjects(prev => prev.map(p => p.id === project.id ? { ...project, activities } : p));
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`${t.projects.activitiesTitle} - ${project.nameAr}`} size="max-w-3xl">
            <div className="space-y-4">
                {activities.map((act, index) => (
                    <div key={act.id} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end p-2 bg-slate-50 rounded-md border">
                        <FormField label={t.projects.activityAr}><input type="text" value={act.activityAr} onChange={e => handleChange(index, 'activityAr', e.target.value)} className="form-input" /></FormField>
                        <FormField label={t.projects.activityEn}><input type="text" value={act.activityEn} onChange={e => handleChange(index, 'activityEn', e.target.value)} className="form-input" /></FormField>
                        <button onClick={() => removeActivity(index)} className="p-2 text-red-500 hover:text-red-700 h-10"><TrashIcon /></button>
                    </div>
                ))}
                <button onClick={addActivity} className="text-indigo-600 font-semibold text-sm flex items-center gap-2"><PlusIcon /> {t.projects.addActivity}</button>
            </div>
            <div className="mt-6 pt-4 border-t flex justify-end gap-3">
                <button onClick={onClose} className="btn-secondary">{t.common.cancel}</button>
                <button onClick={handleSave} className="btn-primary">{t.common.save}</button>
            </div>
        </Modal>
    );
};

// Extensions Modal
const ExtensionsModal: React.FC<{
    isOpen: boolean; onClose: () => void; project: Project; setProjects: React.Dispatch<React.SetStateAction<Project[]>>; logActivity: (args: any) => void;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
}> = ({ isOpen, onClose, project, setProjects, logActivity, setFormData }) => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [isAdding, setIsAdding] = useState(false);
    const [newExtension, setNewExtension] = useState({ newEndDate: '', newTotalBudget: project.budget, notes: '', attachment: null as File | null });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setNewExtension(prev => ({...prev, attachment: e.target.files![0] }));
        }
    };

    const handleSave = async () => {
        if (!newExtension.newEndDate || !newExtension.attachment) {
            showToast(t.common.fillRequiredFields, 'error');
            return;
        }

        const attachmentData = await readFileAsBase64(newExtension.attachment);
        const newExtPayload: ProjectExtension = {
            id: `ext-${Date.now()}`,
            amendmentDate: new Date().toISOString().split('T')[0],
            newEndDate: newExtension.newEndDate,
            newTotalBudget: newExtension.newTotalBudget,
            notes: newExtension.notes,
            attachment: {
                name: newExtension.attachment.name,
                data: attachmentData,
                type: newExtension.attachment.type,
            },
        };

        const updatedProject = {
            ...project,
            endDate: newExtPayload.newEndDate,
            budget: newExtPayload.newTotalBudget,
            extensions: [...(project.extensions || []), newExtPayload],
        };

        setProjects(prev => prev.map(p => p.id === project.id ? updatedProject : p));
        setFormData(updatedProject); // Update main form data
        logActivity({ actionType: 'update', entityType: 'Project', entityName: `Extension for ${project.nameEn}` });
        showToast(t.amendments.amendmentSaved, 'success');
        setIsAdding(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`${t.projects.extensionsTitle} - ${project.nameAr}`} size="max-w-4xl">
             <div className="space-y-4">
                {project.extensions && project.extensions.length > 0 ? (
                    project.extensions.map(ext => (
                        <div key={ext.id} className="p-3 border rounded-lg bg-slate-50 text-slate-800 space-y-1">
                            <p><strong>{t.amendments.amendmentDate}:</strong> {ext.amendmentDate}</p>
                            <p><strong>{t.amendments.newEndDate}:</strong> {ext.newEndDate}</p>
                            <p><strong>{t.amendments.newTotalAmount}:</strong> {ext.newTotalBudget.toLocaleString()}</p>
                            <p><strong>{t.projects.extensionNotes}:</strong> {ext.notes}</p>
                            <a href={ext.attachment.data} download={ext.attachment.name} className="text-indigo-600 flex items-center gap-2 pt-1"><PaperClipIcon />{ext.attachment.name}</a>
                        </div>
                    ))
                ) : !isAdding && <p className="text-center text-slate-500 py-4">{t.projects.noExtensions}</p>}
                
                {isAdding && (
                    <div className="p-4 border-t-2 mt-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField label={t.projects.newEndDate} required><input type="date" value={newExtension.newEndDate} onChange={e => setNewExtension(p => ({...p, newEndDate: e.target.value}))} className="form-input"/></FormField>
                            <FormField label={t.projects.newTotalBudget} required><input type="number" value={newExtension.newTotalBudget} onChange={e => setNewExtension(p => ({...p, newTotalBudget: parseFloat(e.target.value) || 0}))} className="form-input"/></FormField>
                        </div>
                        <FormField label={t.projects.extensionNotes}><textarea value={newExtension.notes} onChange={e => setNewExtension(p => ({...p, notes: e.target.value}))} className="form-input" rows={3}></textarea></FormField>
                        <FormField label={t.projects.extensionAttachment} required><input type="file" onChange={handleFileChange} className="form-input"/></FormField>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsAdding(false)} className="btn-secondary">{t.common.cancel}</button>
                            <button onClick={handleSave} className="btn-primary">{t.common.save}</button>
                        </div>
                    </div>
                )}
            </div>
            {!isAdding && <div className="mt-6 pt-4 border-t flex justify-center">
                <button onClick={() => setIsAdding(true)} className="btn-primary flex items-center gap-2"><PlusIcon />{t.projects.addExtension}</button>
            </div>}
        </Modal>
    );
};

// Attachments Modal
const AttachmentsModal: React.FC<{ isOpen: boolean; onClose: () => void; project: Project; setProjects: React.Dispatch<React.SetStateAction<Project[]>> }> = ({ isOpen, onClose, project, setProjects }) => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [newAttachment, setNewAttachment] = useState({ attachmentType: 'Other' as ProjectAttachmentType, description: '', file: null as File | null });

    const handleSave = async () => {
        if (!newAttachment.file) {
            showToast(t.common.fillRequiredFields, 'error');
            return;
        }
        const fileData = await readFileAsBase64(newAttachment.file);
        const newAtt: ProjectAttachment = {
            id: `patt-${Date.now()}`,
            attachmentType: newAttachment.attachmentType,
            description: newAttachment.description,
            file: { name: newAttachment.file.name, data: fileData, type: newAttachment.file.type }
        };
        const updatedProject = { ...project, attachments: [...(project.attachments || []), newAtt] };
        setProjects(prev => prev.map(p => p.id === project.id ? updatedProject : p));
        setNewAttachment({ attachmentType: 'Other', description: '', file: null });
        showToast(t.common.createdSuccess, 'success');
    };
    
    const removeAttachment = (id: string) => {
        const updatedProject = { ...project, attachments: project.attachments?.filter(a => a.id !== id) };
        setProjects(prev => prev.map(p => p.id === project.id ? updatedProject : p));
        showToast(t.common.deletedSuccess, 'success');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`${t.projects.attachmentsTitle} - ${project.nameAr}`} size="max-w-4xl">
            <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-slate-100 space-y-3">
                    <h3 className="font-bold">{t.projects.addAttachment}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_2fr_2fr_auto] gap-4 items-end">
                        <FormField label={t.projects.attachmentType}>
                            <select value={newAttachment.attachmentType} onChange={e => setNewAttachment(p => ({...p, attachmentType: e.target.value as ProjectAttachmentType}))} className="form-input">
                                {Object.keys(t.projects.attachmentTypes).map(key => <option key={key} value={key}>{t.projects.attachmentTypes[key as ProjectAttachmentType]}</option>)}
                            </select>
                        </FormField>
                        <FormField label={t.projects.attachmentDescription}><input type="text" value={newAttachment.description} onChange={e => setNewAttachment(p => ({...p, description: e.target.value}))} className="form-input"/></FormField>
                        <FormField label={t.projects.attachmentFile}><input type="file" onChange={e => setNewAttachment(p => ({...p, file: e.target.files?.[0] || null}))} className="form-input"/></FormField>
                        <button onClick={handleSave} className="btn-primary h-10">{t.common.add}</button>
                    </div>
                </div>

                <div className="space-y-2">
                    {project.attachments && project.attachments.length > 0 ? project.attachments.map(att => (
                        <div key={att.id} className="p-2 border rounded-md bg-white flex justify-between items-center">
                            <div>
                                <p><a href={att.file.data} download={att.file.name} className="font-semibold text-indigo-700 hover:underline">{att.file.name}</a></p>
                                <p className="text-sm text-slate-600">{t.projects.attachmentTypes[att.attachmentType]} - {att.description}</p>
                            </div>
                            <button onClick={() => removeAttachment(att.id)} className="p-2 text-red-500 hover:text-red-700"><TrashIcon/></button>
                        </div>
                    )) : <p className="text-slate-500 text-center py-4">{t.projects.noAttachments}</p>}
                </div>
            </div>
        </Modal>
    );
};

// Reports Modal
const ReportsModal: React.FC<{ isOpen: boolean; onClose: () => void; project: Project; setProjects: React.Dispatch<React.SetStateAction<Project[]>> }> = ({ isOpen, onClose, project, setProjects }) => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [reports, setReports] = useState<ProjectReport[]>(project.reports || []);

    useEffect(() => { setReports(project.reports || []); }, [project]);

    const handleChange = (index: number, field: keyof ProjectReport, value: string) => {
        const newReports = [...reports];
        (newReports[index] as any)[field] = value;
        setReports(newReports);
    };

    const addReport = () => setReports([...reports, { id: `rep-${Date.now()}`, reportType: 'Monthly', dueDate: '', reportStatus: 'Pending', notes: '' }]);
    const removeReport = (index: number) => setReports(reports.filter((_, i) => i !== index));

    const handleSave = () => {
        setProjects(prev => prev.map(p => p.id === project.id ? { ...project, reports } : p));
        showToast(t.common.updatedSuccess, 'success');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`${t.projects.reportsTitle} - ${project.nameAr}`} size="max-w-5xl">
            {reports.map((rep, index) => (
                <div key={rep.id} className="grid grid-cols-[auto_1fr_1fr_1fr_1.5fr_auto] gap-3 items-end p-2 mb-2 bg-slate-50 border rounded-md">
                    <span className="font-bold">{index + 1}.</span>
                    <FormField label={t.projects.reportType}><select value={rep.reportType} onChange={e => handleChange(index, 'reportType', e.target.value)} className="form-input">{Object.keys(t.projects.reportTypes).map(k=><option key={k} value={k}>{t.projects.reportTypes[k as ProjectReportType]}</option>)}</select></FormField>
                    <FormField label={t.projects.dueDate}><input type="date" value={rep.dueDate} onChange={e => handleChange(index, 'dueDate', e.target.value)} className="form-input"/></FormField>
                    <FormField label={t.projects.reportStatus}><select value={rep.reportStatus} onChange={e => handleChange(index, 'reportStatus', e.target.value)} className="form-input">{Object.keys(t.projects.reportStatuses).map(k=><option key={k} value={k}>{t.projects.reportStatuses[k as ProjectReportStatus]}</option>)}</select></FormField>
                    <FormField label={t.projects.reportNotes}><input type="text" value={rep.notes} onChange={e => handleChange(index, 'notes', e.target.value)} className="form-input"/></FormField>
                    <button onClick={() => removeReport(index)} className="p-2 text-red-500 hover:text-red-700 h-10"><TrashIcon /></button>
                </div>
            ))}
            <button onClick={addReport} className="text-indigo-600 font-semibold text-sm flex items-center gap-2 mt-2"><PlusIcon /> {t.projects.addReport}</button>
            <div className="mt-6 pt-4 border-t flex justify-end gap-3"><button onClick={onClose} className="btn-secondary">{t.common.cancel}</button><button onClick={handleSave} className="btn-primary">{t.common.save}</button></div>
        </Modal>
    );
};


// Grant Payments Modal
const GrantPaymentsModal: React.FC<{ isOpen: boolean; onClose: () => void; project: Project; setProjects: React.Dispatch<React.SetStateAction<Project[]>> }> = ({ isOpen, onClose, project, setProjects }) => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [localProject, setLocalProject] = useState(project);

    useEffect(() => {
        const initialProjectState = { ...project };
        if (initialProjectState.grantAmount === undefined || initialProjectState.grantAmount === null) {
            initialProjectState.grantAmount = initialProjectState.budget;
        }
        setLocalProject(initialProjectState);
    }, [project, isOpen]);

    const handleGrantFieldChange = (field: 'grantAmount' | 'overhead' | 'deductions', value: string) => {
        setLocalProject(p => ({ ...p, [field]: parseFloat(value) || 0 }));
    };

    const handlePaymentChange = (index: number, field: keyof ProjectGrantPayment, value: any) => {
        const newPayments = [...(localProject.grantPayments || [])];
        const numericFields: (keyof ProjectGrantPayment)[] = ['payNum', 'plannedAmount', 'per', 'actualAmount', 'nextReqSpend'];
        (newPayments[index] as any)[field] = numericFields.includes(field as keyof ProjectGrantPayment) ? parseFloat(value) || 0 : value;
        
        const finalGrantTotal = (localProject.grantAmount || 0) + (localProject.overhead || 0) - (localProject.deductions || 0);

        if (field === 'per') {
            const percentage = parseFloat(value) || 0;
            const plannedAmount = (finalGrantTotal * percentage) / 100;
            newPayments[index].plannedAmount = parseFloat(plannedAmount.toFixed(2));
        }

        setLocalProject(p => ({ ...p, grantPayments: newPayments }));
    };

    const addPayment = () => {
        const newPayNum = (localProject.grantPayments?.length || 0) + 1;
        const newPayment: ProjectGrantPayment = { 
            id: `gp-${Date.now()}`, 
            payNum: newPayNum, 
            plannedDate: '', 
            plannedAmount: 0, 
            per: 0, 
            status: 'Pending', 
            actualAmount: 0, 
            nextReqSpend: 80 
        };
        setLocalProject(p => ({ ...p, grantPayments: [...(p.grantPayments || []), newPayment] }));
    };

    const removePayment = (index: number) => setLocalProject(p => ({ ...p, grantPayments: p.grantPayments?.filter((_, i) => i !== index) }));

    const handleSave = () => {
        const finalGrantTotal = (localProject.grantAmount || 0) + (localProject.overhead || 0) - (localProject.deductions || 0);
        const totalPlannedAmount = (localProject.grantPayments || []).reduce((acc, p) => acc + (p.plannedAmount || 0), 0);
        
        if (totalPlannedAmount > finalGrantTotal) {
            showToast(
                t.projects.paymentsExceedGrant
                    .replace('{totalPlannedAmount}', totalPlannedAmount.toLocaleString())
                    .replace('{finalGrantTotal}', finalGrantTotal.toLocaleString()),
                'error'
            );
            return;
        }

        setProjects(prev => prev.map(p => p.id === project.id ? localProject : p));
        showToast(t.common.updatedSuccess, 'success');
        onClose();
    };

    const finalGrantTotal = (localProject.grantAmount || 0) + (localProject.overhead || 0) - (localProject.deductions || 0);
    const payments = localProject.grantPayments || [];
    const totalPlanned = payments.reduce((sum, p) => sum + (p.plannedAmount || 0), 0);
    const totalPercentage = payments.reduce((sum, p) => sum + (p.per || 0), 0);
    const totalActual = payments.reduce((sum, p) => sum + (p.actualAmount || 0), 0);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`${t.projects.grantTitle} - ${project.nameAr}`} size="max-w-7xl">
            <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 p-4 border rounded-lg bg-slate-50 text-slate-800">
                    <FormField label={t.projects.grantAmount}><input type="number" value={localProject.grantAmount || ''} onChange={e => handleGrantFieldChange('grantAmount', e.target.value)} className="form-input"/></FormField>
                    <FormField label={t.projects.overhead}><input type="number" value={localProject.overhead || ''} onChange={e => handleGrantFieldChange('overhead', e.target.value)} className="form-input"/></FormField>
                    <FormField label={t.projects.deductions}><input type="number" value={localProject.deductions || ''} onChange={e => handleGrantFieldChange('deductions', e.target.value)} className="form-input"/></FormField>
                    <FormField label={t.projects.finalGrantTotal}><input type="number" value={finalGrantTotal} readOnly className="form-input bg-slate-200 text-slate-900"/></FormField>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-slate-800">
                            <tr>
                                <th className="p-2 font-semibold text-left">{t.projects.payNum}</th>
                                <th className="p-2 font-semibold text-left">{t.projects.plannedDate}</th>
                                <th className="p-2 font-semibold text-left">{t.projects.plannedAmount}</th>
                                <th className="p-2 font-semibold text-left">{t.projects.percentage}</th>
                                <th className="p-2 font-semibold text-left">{t.projects.paymentStatus}</th>
                                <th className="p-2 font-semibold text-left">{t.projects.actualAmount}</th>
                                <th className="p-2 font-semibold text-left">{t.projects.receiptDate}</th>
                                <th className="p-2 font-semibold text-left">{t.projects.nextReqSpend}</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {(localProject.grantPayments || []).map((p, i) => (
                                <tr key={p.id}>
                                    <td><input type="number" value={p.payNum} onChange={e => handlePaymentChange(i, 'payNum', e.target.value)} className="form-input w-20"/></td>
                                    <td><input type="date" value={p.plannedDate} onChange={e => handlePaymentChange(i, 'plannedDate', e.target.value)} className="form-input"/></td>
                                    <td><input type="number" value={p.plannedAmount} onChange={e => handlePaymentChange(i, 'plannedAmount', e.target.value)} className="form-input"/></td>
                                    <td>
                                        <div className="flex items-center">
                                            <input type="number" value={p.per} onChange={e => handlePaymentChange(i, 'per', e.target.value)} className="form-input w-24"/>
                                            <span className="mx-1 font-semibold">%</span>
                                        </div>
                                    </td>
                                    <td><select value={p.status} onChange={e => handlePaymentChange(i, 'status', e.target.value)} className="form-input min-w-[140px]">{Object.keys(t.projects.paymentStatuses).map(k=><option key={k} value={k}>{t.projects.paymentStatuses[k as ProjectGrantPaymentStatus]}</option>)}</select></td>
                                    <td><input type="number" value={p.actualAmount} onChange={e => handlePaymentChange(i, 'actualAmount', e.target.value)} className="form-input"/></td>
                                    <td><input type="date" value={p.receiptDate || ''} onChange={e => handlePaymentChange(i, 'receiptDate', e.target.value)} className="form-input"/></td>
                                    <td>
                                        <div className="flex items-center">
                                            <input type="number" value={p.nextReqSpend} onChange={e => handlePaymentChange(i, 'nextReqSpend', e.target.value)} className="form-input w-24"/>
                                            <span className="mx-1 font-semibold">%</span>
                                        </div>
                                    </td>
                                    <td><button onClick={() => removePayment(i)} className="p-2 text-red-500"><TrashIcon/></button></td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-slate-200 font-bold border-t-2 border-slate-300">
                            <tr>
                                <td colSpan={2} className="p-2 text-right text-slate-800">{t.common.total}</td>
                                <td className="p-2 font-mono text-slate-800">{totalPlanned.toFixed(2)}</td>
                                <td className="p-2 font-mono text-slate-800">{totalPercentage.toFixed(2)}%</td>
                                <td></td>
                                <td className="p-2 font-mono text-slate-800">{totalActual.toFixed(2)}</td>
                                <td colSpan={3}></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                 <button onClick={addPayment} className="text-indigo-600 font-semibold text-sm flex items-center gap-2"><PlusIcon /> {t.projects.addPayment}</button>
            </div>
            <div className="mt-6 pt-4 border-t flex justify-end gap-3"><button onClick={onClose} className="btn-secondary">{t.common.cancel}</button><button onClick={handleSave} className="btn-primary">{t.common.save}</button></div>
        </Modal>
    );
};

// #endregion

interface ProjectsPageProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  donors: Donor[];
  permissions: PermissionActions;
  logActivity: (args: { actionType: 'create' | 'update' | 'delete'; entityType: string; entityName: string; }) => void;
}

const getInitialFormState = (): Omit<Project, 'id'> => ({
    nameAr: '',
    nameEn: '',
    projectCode: '',
    projectNumber: '',
    startDate: '',
    endDate: '',
    budget: 0,
    currency: 'USD',
    location: '',
    donorId: '',
    partner: '',
    directBeneficiaries: 0,
    indirectBeneficiaries: 0,
    descriptionAr: '',
    descriptionEn: '',
    objectives: [],
    activities: [],
    extensions: [],
    attachments: [],
    reports: [],
    grantPayments: [],
});




const ProjectsPage: React.FC<ProjectsPageProps> = ({ projects, setProjects, donors, permissions, logActivity }) => {
    const { t, language } = useTranslation();
    const { showToast } = useToast();

    const [mode, setMode] = useState<'new' | 'view' | 'edit'>('new');
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [formData, setFormData] = useState<Omit<Project, 'id'>>(getInitialFormState());

    // Modal states
    const [modalOpen, setModalOpen] = useState<'objectives' | 'activities' | 'extensions' | 'attachments' | 'reports' | 'grant' | null>(null);

    const selectedProject = projects.find(p => p.id === selectedProjectId);

    useEffect(() => {
        if (selectedProjectId) {
            const project = projects.find(p => p.id === selectedProjectId);
            if (project) {
                setFormData(project);
                setMode('view');
            }
        } else {
            setFormData(getInitialFormState());
            setMode('new');
        }
    }, [selectedProjectId, projects]);

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedProjectId(e.target.value);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const isNumber = type === 'number';
        setFormData(prev => ({ ...prev, [name]: isNumber ? parseFloat(value) || 0 : value }));
    };

    const handleAction = (action: 'new' | 'save' | 'edit' | 'delete') => {
        if (action === 'new') {
            setSelectedProjectId('');
            setMode('new');
            return;
        }

        if (action === 'save') {
            const missingFields = [];
            if (!formData.nameAr) missingFields.push(`'${t.projects.projectNameAr}'`);
            if (!formData.nameEn) missingFields.push(`'${t.projects.projectNameEn}'`);
            if (!formData.startDate) missingFields.push(`'${t.projects.startDate}'`);
            if (!formData.endDate) missingFields.push(`'${t.projects.endDate}'`);

            if (missingFields.length > 0) {
                showToast(`${t.common.fillRequiredFields}: ${missingFields.join(', ')}`, 'error');
                return;
            }

            if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
                showToast(t.projects.endDateBeforeStartDateError, 'error');
                return;
            }

            if (mode === 'new') {
                const newProject = { id: `proj${Date.now()}`, ...formData };
                setProjects(prev => [...prev, newProject]);
                logActivity({ actionType: 'create', entityType: 'Project', entityName: newProject.nameEn });
                setSelectedProjectId(newProject.id);
                setMode('view');
                showToast(t.common.createdSuccess, 'success');
            } else if (mode === 'edit') {
                setProjects(prev => prev.map(p => p.id === selectedProjectId ? { id: p.id, ...formData } : p));
                logActivity({ actionType: 'update', entityType: 'Project', entityName: formData.nameEn });
                setMode('view');
                showToast(t.common.updatedSuccess, 'success');
            }
            return;
        }

        if (!selectedProjectId) return;

        if (action === 'edit') {
            setMode('edit');
        }

        if (action === 'delete') {
            const projectToDelete = projects.find(p => p.id === selectedProjectId);
            if (projectToDelete) {
                logActivity({ actionType: 'delete', entityType: 'Project', entityName: projectToDelete.nameEn });
            }
            setProjects(prev => prev.filter(p => p.id !== selectedProjectId));
            setSelectedProjectId('');
            showToast(t.common.deletedSuccess, 'success');
        }
    };
    
    const handleExport = () => {
        const dataToExport = projects.map(p => {
            const donor = donors.find(d => d.id === p.donorId);
            return {
                [t.projects.projectNameAr]: p.nameAr,
                [t.projects.projectNameEn]: p.nameEn,
                [t.projects.projectCode]: p.projectCode,
                [t.projects.projectNumber]: p.projectNumber,
                [t.projects.startDate]: p.startDate,
                [t.projects.endDate]: p.endDate,
                [t.projects.budget]: p.budget,
                [t.projects.currency]: p.currency,
                [t.projects.location]: p.location,
                [t.projects.donor]: donor ? (language === 'ar' ? donor.nameAr : donor.nameEn) : '',
                [t.projects.partner]: p.partner,
                [t.projects.directBeneficiaries]: p.directBeneficiaries,
                [t.projects.indirectBeneficiaries]: p.indirectBeneficiaries,
            };
        });

        const ws = window.XLSX.utils.json_to_sheet(dataToExport);
        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, "Projects");
        window.XLSX.writeFile(wb, "Projects.xlsx");
        showToast(t.common.exportSuccess, 'success');
    };

    const isReadOnly = mode === 'view' || (mode === 'edit' && !permissions.update);
    const inputClasses = `w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-slate-900 transition focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 read-only:bg-slate-100 disabled:bg-slate-100 read-only:cursor-not-allowed disabled:cursor-not-allowed`;
    
    const moduleButtons = [
        { key: 'objectives', label: t.projects.objectives, icon: <CheckCircleIcon className="w-5 h-5"/>, color: 'bg-teal-100 hover:bg-teal-200 text-teal-800' },
        { key: 'activities', label: t.projects.activities, icon: <ItemsIcon className="w-5 h-5"/>, color: 'bg-sky-100 hover:bg-sky-200 text-sky-800' },
        { key: 'extensions', label: t.projects.extensions, icon: <DocumentDuplicateIcon className="w-5 h-5"/>, color: 'bg-amber-100 hover:bg-amber-200 text-amber-800' },
        { key: 'attachments', label: t.projects.attachments, icon: <PaperClipIcon className="w-5 h-5"/>, color: 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800' },
        { key: 'reports', label: t.projects.reports, icon: <PurchaseOrderIcon className="w-5 h-5"/>, color: 'bg-rose-100 hover:bg-rose-200 text-rose-800' },
        { key: 'grant', label: t.projects.grant, icon: <FinanceIcon className="w-5 h-5"/>, color: 'bg-lime-100 hover:bg-lime-200 text-lime-800' },
    ];

    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
             <style>{`
                .form-input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.375rem; background-color: #f8fafc; color: #0f172a; transition: box-shadow 0.15s ease-in-out; }
                .form-input:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.3); }
                .form-input:read-only, .form-input:disabled { background-color: #e2e8f0; cursor: not-allowed; }
                .btn-primary { padding: 0.5rem 1rem; background-color: #4f46e5; color: white; border-radius: 0.375rem; font-weight: 600; }
                .btn-secondary { padding: 0.5rem 1rem; background-color: #e2e8f0; color: #1e293b; border-radius: 0.375rem; font-weight: 600; }
            `}</style>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{t.projects.title}</h1>
                <button onClick={handleExport} className="flex items-center gap-2 bg-green-600 text-white py-2 px-4 rounded-md shadow hover:bg-green-700 transition-colors font-semibold text-sm">
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    {t.common.export}
                </button>
            </div>

             <div className="mb-6 p-4 bg-slate-50 border rounded-lg">
                <FormField label={t.projects.selectProject}>
                    <select value={selectedProjectId} onChange={handleSelectChange} className={inputClasses}>
                        <option value="">{t.projects.selectProjectPlaceholder}</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{language === 'ar' ? p.nameAr : p.nameEn}</option>
                        ))}
                    </select>
                </FormField>
            </div>

            {selectedProjectId && (
                <div className="my-6 p-3 bg-slate-100 border rounded-lg flex flex-wrap justify-center gap-3">
                    {moduleButtons.map(btn => (
                         <button key={btn.key} onClick={() => setModalOpen(btn.key as any)} className={`flex items-center gap-3 py-2 px-4 rounded-lg font-bold transition-colors ${btn.color}`}>
                            {React.cloneElement(btn.icon, { className: 'w-5 h-5' })}
                            {btn.label}
                        </button>
                    ))}
                </div>
            )}
            
            <div className="space-y-5 mt-6 border-t pt-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label={t.projects.projectNameAr} required>
                        <input type="text" name="nameAr" value={formData.nameAr} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required/>
                    </FormField>
                    <FormField label={t.projects.projectNameEn} required>
                        <input type="text" name="nameEn" value={formData.nameEn} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required/>
                    </FormField>
                    <FormField label={t.projects.projectCode}>
                        <input type="text" name="projectCode" value={formData.projectCode} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} />
                    </FormField>
                    <FormField label={t.projects.projectNumber}>
                        <input type="text" name="projectNumber" value={formData.projectNumber} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} />
                    </FormField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <FormField label={t.projects.startDate} required>
                        <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required />
                    </FormField>
                    <FormField label={t.projects.endDate} required>
                        <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} readOnly={isReadOnly || (formData.extensions && formData.extensions.length > 0)} className={inputClasses + (formData.extensions && formData.extensions.length > 0 ? " bg-slate-200" : "")} required />
                    </FormField>
                     <FormField label={t.projects.budget}>
                        <input type="number" name="budget" value={formData.budget} onChange={handleInputChange} readOnly={isReadOnly || (formData.extensions && formData.extensions.length > 0)} className={inputClasses + (formData.extensions && formData.extensions.length > 0 ? " bg-slate-200" : "")} />
                    </FormField>
                     <FormField label={t.projects.currency}>
                        <select name="currency" value={formData.currency} onChange={handleInputChange} disabled={isReadOnly} className={inputClasses}>
                            <option value="USD">{language === 'ar' ? 'دولار' : 'USD'}</option>
                            <option value="ILS">{language === 'ar' ? 'شيكل' : 'ILS'}</option>
                            <option value="EUR">{language === 'ar' ? 'يورو' : 'EUR'}</option>
                        </select>
                    </FormField>
                </div>
                
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField label={t.projects.location}>
                        <input type="text" name="location" value={formData.location} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} />
                    </FormField>
                     <FormField label={t.projects.donor}>
                        <select name="donorId" value={formData.donorId} onChange={handleInputChange} disabled={isReadOnly} className={inputClasses}>
                            <option value="">{t.projects.selectDonorPlaceholder}</option>
                            {donors.map(d => (
                                <option key={d.id} value={d.id}>{language === 'ar' ? d.nameAr : d.nameEn}</option>
                            ))}
                        </select>
                    </FormField>
                     <FormField label={t.projects.partner}>
                        <input type="text" name="partner" value={formData.partner} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} />
                    </FormField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label={t.projects.directBeneficiaries}>
                        <input type="number" name="directBeneficiaries" value={formData.directBeneficiaries} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} />
                    </FormField>
                     <FormField label={t.projects.indirectBeneficiaries}>
                        <input type="number" name="indirectBeneficiaries" value={formData.indirectBeneficiaries} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} />
                    </FormField>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <FormField label={t.projects.descriptionAr}>
                        <textarea name="descriptionAr" value={formData.descriptionAr} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} rows={3}></textarea>
                    </FormField>
                      <FormField label={t.projects.descriptionEn}>
                        <textarea name="descriptionEn" value={formData.descriptionEn} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} rows={3}></textarea>
                    </FormField>
                </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-200 flex justify-center items-center gap-3">
                <button onClick={() => handleAction('new')} disabled={!permissions.create} className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed">{t.common.new}</button>
                <button onClick={() => handleAction('save')} disabled={mode === 'view' || (mode === 'new' ? !permissions.create : !permissions.update)} className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed">{t.common.save}</button>
                <button onClick={() => handleAction('edit')} disabled={mode !== 'view' || !permissions.update} className="px-6 py-2.5 bg-amber-500 text-white font-semibold rounded-md shadow-sm hover:bg-amber-600 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed">{t.common.edit}</button>
                <button onClick={() => handleAction('delete')} disabled={mode !== 'view' || !permissions.delete} className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-md shadow-sm hover:bg-red-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed">{t.common.delete}</button>
            </div>
            {selectedProject && (
                <>
                    <ObjectivesModal 
                        isOpen={modalOpen === 'objectives'} 
                        onClose={() => setModalOpen(null)} 
                        project={selectedProject} 
                        setProjects={setProjects} 
                    />
                    <ActivitiesModal 
                        isOpen={modalOpen === 'activities'} 
                        onClose={() => setModalOpen(null)} 
                        project={selectedProject} 
                        setProjects={setProjects} 
                    />
                    <ExtensionsModal 
                        isOpen={modalOpen === 'extensions'} 
                        onClose={() => setModalOpen(null)} 
                        project={selectedProject} 
                        setProjects={setProjects} 
                        logActivity={logActivity}
                        setFormData={setFormData}
                    />
                    <AttachmentsModal 
                        isOpen={modalOpen === 'attachments'} 
                        onClose={() => setModalOpen(null)} 
                        project={selectedProject} 
                        setProjects={setProjects} 
                    />
                    <ReportsModal 
                        isOpen={modalOpen === 'reports'} 
                        onClose={() => setModalOpen(null)} 
                        project={selectedProject} 
                        setProjects={setProjects} 
                    />
                    <GrantPaymentsModal 
                        isOpen={modalOpen === 'grant'} 
                        onClose={() => setModalOpen(null)} 
                        project={selectedProject} 
                        setProjects={setProjects} 
                    />
                </>
            )}
        </div>
    );
};

export default ProjectsPage;