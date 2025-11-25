import React, { useState, useMemo } from 'react';
import { Project, ProjectGrantPayment, PermissionActions } from '../types';
import { useTranslation } from '../LanguageContext';
import { useToast } from '../ToastContext';
import Modal from '../components/Modal';
import { FinanceIcon } from '../components/icons';

interface RevenuesPageProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
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

const RevenuesPage: React.FC<RevenuesPageProps> = ({ projects, setProjects, permissions, logActivity }) => {
    const { t, language } = useTranslation();
    const { showToast } = useToast();

    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [modalState, setModalState] = useState<{ isOpen: boolean; payment: ProjectGrantPayment | null }>({ isOpen: false, payment: null });
    const [receiptData, setReceiptData] = useState({ actualAmount: 0, receiptDate: new Date().toISOString().split('T')[0] });

    const selectedProject = useMemo(() => 
        projects.find(p => p.id === selectedProjectId),
    [projects, selectedProjectId]);

    const plannedPayments = selectedProject?.grantPayments || [];

    const openRecordModal = (payment: ProjectGrantPayment) => {
        setModalState({ isOpen: true, payment });
        setReceiptData({ actualAmount: payment.plannedAmount, receiptDate: new Date().toISOString().split('T')[0] });
    };

    const handleSaveReceipt = () => {
        if (!modalState.payment || !selectedProject) return;

        if (receiptData.actualAmount <= 0 || !receiptData.receiptDate) {
            showToast(t.common.fillRequiredFields, 'error');
            return;
        }

        const updatedProjects = projects.map(p => {
            if (p.id === selectedProject.id) {
                const updatedPayments = (p.grantPayments || []).map(gp => {
                    if (gp.id === modalState.payment!.id) {
                        return {
                            ...gp,
                            status: 'Paid' as 'Paid',
                            actualAmount: receiptData.actualAmount,
                            receiptDate: receiptData.receiptDate,
                        };
                    }
                    return gp;
                });
                return { ...p, grantPayments: updatedPayments };
            }
            return p;
        });

        setProjects(updatedProjects);
        logActivity({
            actionType: 'update',
            entityType: 'RevenueReceipt',
            entityName: `Payment #${modalState.payment.payNum} for ${selectedProject.nameEn}`
        });
        showToast(t.revenues.receiptSaved, 'success');
        setModalState({ isOpen: false, payment: null });
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-green-100 rounded-lg"><FinanceIcon className="w-8 h-8 text-green-700"/></div>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{t.revenues.title}</h1>
            </div>

            <div className="p-4 bg-slate-50 border rounded-lg mb-6">
                <FormField label={t.revenues.selectProject}>
                    <select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} className="form-input">
                        <option value="">-- {t.projects.selectProject} --</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{language === 'ar' ? p.nameAr : p.nameEn}</option>)}
                    </select>
                </FormField>
            </div>

            {!selectedProjectId ? (
                <div className="text-center py-16 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                    {t.revenues.noProjectSelected}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Planned Payments (Read-only view) */}
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 mb-4">{t.revenues.plannedPayments}</h2>
                        <div className="space-y-3">
                            {plannedPayments.length > 0 ? plannedPayments.map(p => (
                                <div key={p.id} className={`p-3 border-l-4 rounded-r-lg ${p.status === 'Paid' ? 'border-green-500 bg-green-50' : 'border-slate-300 bg-white border'}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-slate-800">Payment #{p.payNum}</p>
                                            <p className="text-sm text-slate-600">{t.projects.plannedDate}: {p.plannedDate}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg text-slate-900">{p.plannedAmount.toLocaleString()}</p>
                                            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${p.status === 'Paid' ? 'bg-green-200 text-green-800' : 'bg-slate-200 text-slate-800'}`}>
                                                {t.revenues[p.status === 'Paid' ? 'statusPaid' : 'statusPending']}
                                            </span>
                                        </div>
                                    </div>
                                    {p.status === 'Paid' && (
                                         <div className="mt-2 pt-2 border-t text-xs text-slate-600">
                                            <p><strong>{t.projects.actualAmount}:</strong> {p.actualAmount.toLocaleString()}</p>
                                            <p><strong>{t.projects.receiptDate}:</strong> {p.receiptDate}</p>
                                        </div>
                                    )}
                                </div>
                            )) : <p className="text-slate-500">{t.revenues.noPlannedPayments}</p>}
                        </div>
                    </div>
                    {/* Record Payments */}
                    <div>
                         <h2 className="text-xl font-bold text-slate-800 mb-4">{t.revenues.receivedPayments}</h2>
                        <div className="space-y-2">
                             {plannedPayments.filter(p => p.status === 'Pending').map(p => (
                                <div key={p.id} className="p-3 border rounded-lg bg-white flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-slate-800">Payment #{p.payNum}</p>
                                        <p className="text-sm text-slate-600">{p.plannedDate} - {p.plannedAmount.toLocaleString()}</p>
                                    </div>
                                    <button onClick={() => openRecordModal(p)} className="px-3 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                        {t.revenues.recordReceipt}
                                    </button>
                                </div>
                            ))}
                             {plannedPayments.filter(p => p.status === 'Pending').length === 0 && <p className="text-slate-500">All payments recorded.</p>}
                        </div>
                    </div>
                </div>
            )}

            {modalState.isOpen && modalState.payment && (
                <Modal 
                    isOpen={modalState.isOpen} 
                    onClose={() => setModalState({isOpen: false, payment: null})} 
                    title={t.revenues.recordReceiptFor.replace('{payNum}', modalState.payment.payNum.toString())}
                >
                    <div className="space-y-4">
                        <FormField label={t.projects.actualAmount} required>
                            <input 
                                type="number"
                                value={receiptData.actualAmount}
                                onChange={e => setReceiptData(p => ({...p, actualAmount: parseFloat(e.target.value) || 0}))}
                                className="form-input"
                            />
                        </FormField>
                         <FormField label={t.projects.receiptDate} required>
                            <input 
                                type="date"
                                value={receiptData.receiptDate}
                                onChange={e => setReceiptData(p => ({...p, receiptDate: e.target.value}))}
                                className="form-input"
                            />
                        </FormField>
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button onClick={() => setModalState({isOpen: false, payment: null})} className="btn-secondary">{t.common.cancel}</button>
                            <button onClick={handleSaveReceipt} className="btn-primary">{t.common.save}</button>
                        </div>
                    </div>
                </Modal>
            )}

             <style>{`
                .form-input { width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background-color: #ffffff; color: #0f172a; }
                .btn-primary { padding: 0.75rem 1.5rem; background-color: #4f46e5; color: white; border-radius: 0.5rem; font-weight: 600; }
                .btn-secondary { padding: 0.75rem 1.5rem; background-color: #e2e8f0; color: #1e293b; border-radius: 0.5rem; font-weight: 600; }
            `}</style>
        </div>
    );
};

export default RevenuesPage;