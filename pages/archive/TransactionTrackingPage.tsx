
import React, { useState, useMemo, useRef } from 'react';
import { Transaction, TransactionMovement, Project, User, PermissionActions, TransactionPriority, ArchiveLocation, OrganizationInfo } from '../../types';
import { useTranslation } from '../../LanguageContext';
import { useToast } from '../../ToastContext';
import Modal from '../../components/Modal';
import { PlusIcon, ClipboardDocumentCheckIcon, ArrowPathIcon, ClockIcon, PencilIcon, ArchiveIcon, TrashIcon, PaperClipIcon, PrinterIcon, CheckCircleIcon, ShelfIcon } from '../../components/icons';

interface TransactionTrackingPageProps {
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    movements: TransactionMovement[];
    setMovements: React.Dispatch<React.SetStateAction<TransactionMovement[]>>;
    users: User[];
    projects: Project[];
    currentUser: User;
    permissions: PermissionActions;
    logActivity: (args: any) => void;
    archiveLocations: ArchiveLocation[];
    organizationInfo: OrganizationInfo;
}

const FormField: React.FC<{ label: string; children: React.ReactNode; required?: boolean }> = ({ label, children, required }) => (
    <div className="mb-4">
        <label className="block text-sm font-bold text-slate-800 mb-1.5">
            {label} {required && <span className="text-red-600">*</span>}
        </label>
        {children}
    </div>
);

const TransactionTrackingPage: React.FC<TransactionTrackingPageProps> = ({
    transactions, setTransactions, movements, setMovements, users, projects, currentUser, permissions, logActivity, archiveLocations, organizationInfo
}) => {
    const { t, language } = useTranslation();
    const { showToast } = useToast();

    const [activeTab, setActiveTab] = useState<'inbox' | 'processing' | 'outbox' | 'all'>('inbox');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
    const [isCoverSheetOpen, setIsCoverSheetOpen] = useState(false);
    
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [formData, setFormData] = useState<Omit<Transaction, 'id'>>({
        referenceNumber: '', subject: '', typeId: '', projectId: '', priority: 'Normal', status: 'Active',
        creationDate: new Date().toISOString(), createdByUserId: currentUser.id, currentHolderId: currentUser.id, description: '', attachment: undefined
    });
    
    // Action Modal States
    const [forwardData, setForwardData] = useState({ toUserId: '', notes: '' });
    const [archiveData, setArchiveData] = useState({ locationId: '', physicalLocation: '', notes: '', file: null as File | null });

    // Helper to determine status of a transaction for the current user
    const getTransactionState = (tr: Transaction) => {
        const lastMovement = movements
            .filter(m => m.transactionId === tr.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        
        if (tr.status === 'Archived') return 'Archived';
        if (tr.currentHolderId !== currentUser.id) return 'Outbox'; // Not with me
        
        // It is with me. Do I need to receive it?
        // If I created it, I don't need to receive it.
        if (tr.createdByUserId === currentUser.id && movements.length <= 1) return 'Processing'; 
        
        // If the last action was "Forwarded" (to me) or "Return" (to me), I need to Receive.
        if (lastMovement && (lastMovement.action === 'Forwarded' || lastMovement.action === 'Returned')) return 'Inbox';
        
        return 'Processing'; // I have Received it
    };

    const filteredTransactions = useMemo(() => {
        let list = [];
        if (activeTab === 'inbox') {
            list = transactions.filter(tr => getTransactionState(tr) === 'Inbox');
        } else if (activeTab === 'processing') {
            list = transactions.filter(tr => getTransactionState(tr) === 'Processing');
        } else if (activeTab === 'outbox') {
            list = transactions.filter(tr => tr.currentHolderId !== currentUser.id && tr.status !== 'Archived' && (
                tr.createdByUserId === currentUser.id || movements.some(m => m.fromUserId === currentUser.id && m.transactionId === tr.id)
            ));
        } else {
            list = transactions;
        }
        return list.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
    }, [transactions, movements, activeTab, currentUser.id]);

    // --- Actions ---

    const openCreateModal = () => {
        const refNum = `TR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        setFormData({
            referenceNumber: refNum, subject: '', typeId: '', projectId: '', priority: 'Normal', status: 'Active',
            creationDate: new Date().toISOString(), createdByUserId: currentUser.id, currentHolderId: currentUser.id, description: '', attachment: undefined
        });
        setSelectedTransaction(null);
        setIsModalOpen(true);
    };

    const handleSaveTransaction = () => {
        if (!formData.subject || !formData.priority) {
            showToast(t.common.fillRequiredFields, 'error');
            return;
        }
        if (selectedTransaction) {
            setTransactions(prev => prev.map(t => t.id === selectedTransaction.id ? { ...t, ...formData } : t));
            logActivity({ actionType: 'update', entityType: 'Transaction', entityName: formData.referenceNumber });
            showToast(t.common.updatedSuccess, 'success');
        } else {
            const newTransaction: Transaction = { id: `tr-${Date.now()}`, ...formData };
            setTransactions(prev => [newTransaction, ...prev]);
            const initialMovement: TransactionMovement = {
                id: `mov-${Date.now()}`, transactionId: newTransaction.id, fromUserId: currentUser.id, toUserId: currentUser.id,
                date: new Date().toISOString(), action: 'Created', notes: 'Initial creation', isRead: true
            };
            setMovements(prev => [...prev, initialMovement]);
            logActivity({ actionType: 'create', entityType: 'Transaction', entityName: formData.referenceNumber });
            showToast(t.common.createdSuccess, 'success');
        }
        setIsModalOpen(false);
    };

    const handleReceive = (tr: Transaction) => {
        const newMovement: TransactionMovement = {
            id: `mov-${Date.now()}`, transactionId: tr.id, fromUserId: currentUser.id, toUserId: currentUser.id,
            date: new Date().toISOString(), action: 'Received', notes: 'Custody accepted', isRead: true
        };
        setMovements(prev => [...prev, newMovement]);
        showToast(t.transactionTracking.receiveSuccess, 'success');
    };

    const handleForward = () => {
        if (!selectedTransaction || !forwardData.toUserId) return;
        const newMovement: TransactionMovement = {
            id: `mov-${Date.now()}`, transactionId: selectedTransaction.id, fromUserId: currentUser.id, toUserId: forwardData.toUserId,
            date: new Date().toISOString(), action: 'Forwarded', notes: forwardData.notes, isRead: false
        };
        setMovements(prev => [...prev, newMovement]);
        setTransactions(prev => prev.map(t => t.id === selectedTransaction.id ? { ...t, currentHolderId: forwardData.toUserId } : t));
        logActivity({ actionType: 'update', entityType: 'TransactionMovement', entityName: `Forwarded ${selectedTransaction.referenceNumber}` });
        showToast(t.transactionTracking.forwardSuccess, 'success');
        setIsForwardModalOpen(false);
    };

    const handleReturn = (tr: Transaction) => {
        // Find the last person who sent it to me
        const lastIncomingMovement = movements
            .filter(m => m.transactionId === tr.id && m.toUserId === currentUser.id && m.fromUserId !== currentUser.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

        if (!lastIncomingMovement) {
            showToast("Cannot return: Source unknown.", 'error');
            return;
        }

        const reason = prompt(t.transactionTracking.returnReason);
        if (!reason) return;

        const newMovement: TransactionMovement = {
            id: `mov-${Date.now()}`, transactionId: tr.id, fromUserId: currentUser.id, toUserId: lastIncomingMovement.fromUserId,
            date: new Date().toISOString(), action: 'Returned', notes: reason, isRead: false
        };
        setMovements(prev => [...prev, newMovement]);
        setTransactions(prev => prev.map(t => t.id === tr.id ? { ...t, currentHolderId: lastIncomingMovement.fromUserId } : t));
        showToast(t.transactionTracking.returnSuccess, 'success');
    };

    const handleArchive = async () => {
        if (!selectedTransaction) return;
        if (!archiveData.locationId) {
            showToast(t.common.fillRequiredFields, 'error');
            return;
        }

        // In a real app, upload the file
        let attachment = selectedTransaction.attachment;
        if (archiveData.file) {
             // Simulate upload
             const reader = new FileReader();
             reader.readAsDataURL(archiveData.file);
             await new Promise(resolve => { reader.onload = resolve; });
             attachment = { name: archiveData.file.name, data: reader.result as string, type: archiveData.file.type };
        }

        setTransactions(prev => prev.map(t => 
            t.id === selectedTransaction.id ? { ...t, status: 'Archived', archiveLocationId: archiveData.locationId, physicalLocation: archiveData.physicalLocation, attachment: attachment } : t
        ));
        
        const newMovement: TransactionMovement = {
            id: `mov-${Date.now()}`, transactionId: selectedTransaction.id, fromUserId: currentUser.id, toUserId: currentUser.id,
            date: new Date().toISOString(), action: 'Archived', notes: archiveData.notes, isRead: true
        };
        setMovements(prev => [...prev, newMovement]);

        logActivity({ actionType: 'update', entityType: 'Transaction', entityName: `Archived ${selectedTransaction.referenceNumber}` });
        showToast(t.transactionTracking.archiveSuccess, 'success');
        setIsArchiveModalOpen(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFormData(prev => ({ ...prev, attachment: { name: e.target.files![0].name, data: '', type: e.target.files![0].type } })); // Mock data for form
        }
    };

    const getPriorityColor = (priority: TransactionPriority) => {
        switch(priority) {
            case 'Top Priority': return 'bg-red-100 text-red-800';
            case 'Urgent': return 'bg-orange-100 text-orange-800';
            default: return 'bg-blue-100 text-blue-800';
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-slate-800">{t.transactionTracking.title}</h1>
                <button onClick={openCreateModal} disabled={!permissions.create} className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2.5 px-5 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-300">
                    <PlusIcon className="w-5 h-5" /> {t.transactionTracking.create}
                </button>
            </div>

            <div className="border-b border-slate-200 mb-6">
                <nav className="-mb-px flex space-x-8 overflow-x-auto">
                    {[
                        { id: 'inbox', label: t.transactionTracking.tabs.inbox, count: transactions.filter(tr => getTransactionState(tr) === 'Inbox').length, color: 'red' },
                        { id: 'processing', label: t.transactionTracking.tabs.processing, count: transactions.filter(tr => getTransactionState(tr) === 'Processing').length, color: 'indigo' },
                        { id: 'outbox', label: t.transactionTracking.tabs.outbox },
                        { id: 'all', label: t.transactionTracking.tabs.all }
                    ].map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                            className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                            {tab.count !== undefined && <span className={`bg-${tab.color}-500 text-white text-xs rounded-full px-2 py-0.5`}>{tab.count}</span>}
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="space-y-4">
                {filteredTransactions.map(tr => {
                    const state = getTransactionState(tr);
                    return (
                        <div key={tr.id} className={`border rounded-lg p-4 transition-all hover:shadow-md ${tr.status === 'Archived' ? 'bg-slate-50 opacity-75' : 'bg-white'}`}>
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="flex-grow">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded border">{tr.referenceNumber}</span>
                                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${getPriorityColor(tr.priority)}`}>{t.transactionTracking.priorities[tr.priority]}</span>
                                        {tr.status === 'Archived' && <span className="text-xs px-2 py-1 rounded-full bg-slate-600 text-white font-bold">{t.transactionTracking.statuses.Archived}</span>}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-1">{tr.subject}</h3>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                                        <span>{new Date(tr.creationDate).toLocaleDateString()}</span>
                                        <span>•</span>
                                        <span>{users.find(u => u.id === tr.createdByUserId)?.name}</span>
                                        <span>•</span>
                                        <span className="font-semibold text-indigo-600">{t.transactionTracking.currentHolder}: {users.find(u => u.id === tr.currentHolderId)?.name}</span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 items-start md:justify-end min-w-[200px]">
                                    <button onClick={() => { setSelectedTransaction(tr); setIsHistoryModalOpen(true); }} className="btn-icon-text bg-white border border-slate-300 text-slate-700 hover:bg-slate-50">
                                        <ClockIcon className="w-4 h-4" /> {t.transactionTracking.viewDetails}
                                    </button>
                                    
                                    {state === 'Inbox' && (
                                        <div className="flex gap-2">
                                            <button onClick={() => handleReturn(tr)} className="btn-icon-text bg-red-50 text-red-600 hover:bg-red-100 border border-red-200">
                                                {t.transactionTracking.return}
                                            </button>
                                            <button onClick={() => handleReceive(tr)} className="btn-icon-text bg-green-600 text-white hover:bg-green-700">
                                                <CheckCircleIcon className="w-4 h-4" /> {t.transactionTracking.receive}
                                            </button>
                                        </div>
                                    )}

                                    {state === 'Processing' && (
                                        <div className="flex gap-2">
                                            <button onClick={() => { setSelectedTransaction(tr); setIsCoverSheetOpen(true); }} className="btn-icon-text bg-slate-100 text-slate-700 hover:bg-slate-200">
                                                <PrinterIcon className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => { setSelectedTransaction(tr); setForwardData({ toUserId: '', notes: '' }); setIsForwardModalOpen(true); }} className="btn-icon-text bg-indigo-600 text-white hover:bg-indigo-700">
                                                <ArrowPathIcon className="w-4 h-4" /> {t.transactionTracking.forward}
                                            </button>
                                            <button onClick={() => { setSelectedTransaction(tr); setArchiveData({locationId: '', physicalLocation: '', notes: '', file: null}); setIsArchiveModalOpen(true); }} className="btn-icon-text bg-slate-800 text-white hover:bg-slate-900">
                                                <ArchiveIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {filteredTransactions.length === 0 && <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed"><p className="text-slate-500">{t.transactionTracking.noTransactions}</p></div>}
            </div>

            {/* Modals */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t.transactionTracking.create} size="max-w-3xl">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label={t.transactionTracking.referenceNumber}><input value={formData.referenceNumber} readOnly className="w-full p-2 bg-slate-100 border rounded cursor-not-allowed" /></FormField>
                        <FormField label={t.transactionTracking.priority} required><select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as any})} className="w-full p-2 border rounded">{Object.keys(t.transactionTracking.priorities).map(k=><option key={k} value={k}>{t.transactionTracking.priorities[k as TransactionPriority]}</option>)}</select></FormField>
                    </div>
                    <FormField label={t.transactionTracking.subject} required><input value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full p-2 border rounded" /></FormField>
                    <FormField label={t.archive.documents.description}><textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2 border rounded" rows={3}></textarea></FormField>
                    <div className="flex justify-end gap-3 pt-4"><button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-200 rounded">{t.common.cancel}</button><button onClick={handleSaveTransaction} className="px-4 py-2 bg-indigo-600 text-white rounded">{t.common.save}</button></div>
                </div>
            </Modal>

            <Modal isOpen={isForwardModalOpen} onClose={() => setIsForwardModalOpen(false)} title={t.transactionTracking.forward}>
                <div className="space-y-4">
                    <p className="p-3 bg-indigo-50 border border-indigo-100 rounded text-indigo-900 font-medium">{selectedTransaction?.referenceNumber} - {selectedTransaction?.subject}</p>
                    <FormField label={t.transactionTracking.forwardTo} required><select value={forwardData.toUserId} onChange={e => setForwardData({...forwardData, toUserId: e.target.value})} className="w-full p-2 border rounded"><option value="">-- {t.transactionTracking.selectUser} --</option>{users.filter(u => u.id !== currentUser.id).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></FormField>
                    <FormField label={t.transactionTracking.actionNote}><textarea value={forwardData.notes} onChange={e => setForwardData({...forwardData, notes: e.target.value})} className="w-full p-2 border rounded" rows={3}></textarea></FormField>
                    <div className="flex justify-end gap-3 pt-4"><button onClick={() => setIsForwardModalOpen(false)} className="px-4 py-2 bg-slate-200 rounded">{t.common.cancel}</button><button onClick={handleForward} className="px-4 py-2 bg-indigo-600 text-white rounded">{t.transactionTracking.forward}</button></div>
                </div>
            </Modal>

            <Modal isOpen={isArchiveModalOpen} onClose={() => setIsArchiveModalOpen(false)} title={t.transactionTracking.archive}>
                <div className="space-y-4">
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded text-amber-800 text-sm mb-4">Warning: Archiving closes the transaction permanently. Ensure you have the physical file ready.</div>
                    <FormField label={t.transactionTracking.selectArchiveLocation} required>
                        <select value={archiveData.locationId} onChange={e => setArchiveData({...archiveData, locationId: e.target.value})} className="w-full p-2 border rounded">
                            <option value="">-- Select Location --</option>
                            {archiveLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name} ({loc.code})</option>)}
                        </select>
                    </FormField>
                    <FormField label={t.transactionTracking.physicalLocation}><input value={archiveData.physicalLocation} onChange={e => setArchiveData({...archiveData, physicalLocation: e.target.value})} placeholder="e.g. Shelf 3, Box 12" className="w-full p-2 border rounded" /></FormField>
                    <FormField label={t.transactionTracking.scanFile}><input type="file" onChange={e => setArchiveData({...archiveData, file: e.target.files?.[0] || null})} className="w-full p-2 border rounded" /></FormField>
                    <div className="flex justify-end gap-3 pt-4"><button onClick={() => setIsArchiveModalOpen(false)} className="px-4 py-2 bg-slate-200 rounded">{t.common.cancel}</button><button onClick={handleArchive} className="px-4 py-2 bg-slate-800 text-white rounded">{t.transactionTracking.archive}</button></div>
                </div>
            </Modal>

            <Modal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} title={t.transactionTracking.history} size="max-w-4xl">
                <div className="flex flex-col h-[60vh]">
                    {selectedTransaction && (
                        <div className="flex-shrink-0 mb-6 p-4 bg-slate-50 rounded border grid grid-cols-2 gap-4">
                            <div><p className="text-sm text-slate-500">{t.transactionTracking.subject}</p><p className="font-bold">{selectedTransaction.subject}</p></div>
                            <div><p className="text-sm text-slate-500">Ref</p><p className="font-mono font-bold">{selectedTransaction.referenceNumber}</p></div>
                            {selectedTransaction.status === 'Archived' && (
                                <div className="col-span-2 p-2 bg-green-100 text-green-800 rounded border border-green-200 flex items-center gap-2">
                                    <ArchiveIcon className="w-5 h-5"/> Archived in: {archiveLocations.find(l => l.id === selectedTransaction.archiveLocationId)?.name} - {selectedTransaction.physicalLocation}
                                </div>
                            )}
                        </div>
                    )}
                    <div className="flex-grow overflow-y-auto pr-4 relative">
                        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                        {movements.filter(m => m.transactionId === selectedTransaction?.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((move) => (
                            <div key={move.id} className="relative mb-6 ml-8">
                                <div className="absolute -left-[38px] top-0 w-5 h-5 rounded-full bg-white border-4 border-indigo-500"></div>
                                <div className="bg-white p-3 rounded border shadow-sm">
                                    <div className="flex justify-between text-sm mb-1"><span className="font-bold text-indigo-700">{move.action}</span><span className="text-slate-500">{new Date(move.date).toLocaleString()}</span></div>
                                    <div className="text-sm text-slate-700 mb-2">{users.find(u => u.id === move.fromUserId)?.name} <span className="text-slate-400">➔</span> {users.find(u => u.id === move.toUserId)?.name}</div>
                                    {move.notes && <div className="text-sm bg-slate-50 p-2 rounded italic text-slate-600 border-l-2 border-indigo-200">"{move.notes}"</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>

            {selectedTransaction && isCoverSheetOpen && (
                <Modal isOpen={isCoverSheetOpen} onClose={() => setIsCoverSheetOpen(false)} title={t.transactionTracking.printCover} size="max-w-3xl">
                    <PrintableCoverSheet transaction={selectedTransaction} users={users} organizationInfo={organizationInfo} onClose={() => setIsCoverSheetOpen(false)} t={t} />
                </Modal>
            )}

            <style>{`
                .btn-icon-text { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 500; transition: all 0.2s; }
            `}</style>
        </div>
    );
};

const PrintableCoverSheet: React.FC<{ transaction: Transaction; users: User[]; organizationInfo: OrganizationInfo; onClose: () => void; t: any }> = ({ transaction, users, organizationInfo, onClose, t }) => {
    const handlePrint = () => {
        const content = document.getElementById('cover-sheet-content');
        if (content) {
            const printWindow = window.open('', '', 'width=800,height=600');
            printWindow?.document.write(`<html><head><title>Print</title><script src="https://cdn.tailwindcss.com"></script></head><body>${content.innerHTML}</body></html>`);
            printWindow?.document.close();
            printWindow?.focus();
            setTimeout(() => { printWindow?.print(); printWindow?.close(); }, 500);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div id="cover-sheet-content" className="p-8 bg-white border border-gray-300 shadow-sm mx-auto my-4 w-[210mm] min-h-[297mm] relative">
                <div className="text-center border-b-2 border-black pb-4 mb-6">
                    <h1 className="text-2xl font-bold uppercase">{organizationInfo.nameAr}</h1>
                    <h2 className="text-xl font-bold uppercase">{organizationInfo.nameEn}</h2>
                    <div className="mt-4 text-3xl font-black border-2 border-black inline-block px-6 py-2">{t.transactionTracking.coverSheetTitle}</div>
                </div>
                
                <div className="flex justify-between items-start mb-8">
                    <div className="w-2/3">
                        <div className="mb-4"><span className="font-bold text-lg block border-b border-gray-400 mb-1">{t.transactionTracking.subject}:</span><span className="text-xl">{transaction.subject}</span></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><span className="font-bold block border-b border-gray-400 mb-1">{t.transactionTracking.referenceNumber}:</span><span className="font-mono text-lg">{transaction.referenceNumber}</span></div>
                            <div><span className="font-bold block border-b border-gray-400 mb-1">{t.transactionTracking.date}:</span><span>{new Date(transaction.creationDate).toLocaleDateString()}</span></div>
                            <div><span className="font-bold block border-b border-gray-400 mb-1">{t.transactionTracking.priority}:</span><span className="uppercase">{transaction.priority}</span></div>
                            <div><span className="font-bold block border-b border-gray-400 mb-1">{t.activityLog.user}:</span><span>{users.find(u=>u.id===transaction.createdByUserId)?.name}</span></div>
                        </div>
                    </div>
                    <div className="w-1/3 flex flex-col items-center justify-center border-l-2 border-gray-300 pl-4">
                        <div className="w-32 h-32 bg-gray-200 flex items-center justify-center text-gray-500 mb-2">[QR CODE]</div>
                        <p className="text-xs text-center font-mono">{transaction.id}</p>
                    </div>
                </div>

                <div className="border-2 border-black mt-8">
                    <div className="bg-gray-200 text-center font-bold p-2 border-b-2 border-black">Chain of Custody / سجل التداول</div>
                    <div className="grid grid-cols-4 font-bold border-b border-black text-sm">
                        <div className="p-2 border-r border-black">From / من</div>
                        <div className="p-2 border-r border-black">To / إلى</div>
                        <div className="p-2 border-r border-black">Date / التاريخ</div>
                        <div className="p-2">Signature / التوقيع</div>
                    </div>
                    {/* Empty rows for physical signatures */}
                    {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="grid grid-cols-4 border-b border-gray-300 h-12">
                            <div className="border-r border-gray-300"></div>
                            <div className="border-r border-gray-300"></div>
                            <div className="border-r border-gray-300"></div>
                            <div></div>
                        </div>
                    ))}
                </div>

                <div className="absolute bottom-8 left-8 right-8 text-center text-sm text-gray-500">
                    Generated by OrgaFlow System
                </div>
            </div>
            <div className="flex justify-end gap-4 mt-4 pt-4 border-t">
                <button onClick={onClose} className="px-4 py-2 bg-slate-200 rounded">Close</button>
                <button onClick={handlePrint} className="px-4 py-2 bg-indigo-600 text-white rounded flex items-center gap-2"><PrinterIcon className="w-4 h-4"/> Print</button>
            </div>
        </div>
    );
};

export default TransactionTrackingPage;
