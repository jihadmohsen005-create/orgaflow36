import React, { useState, useEffect, useMemo } from 'react';
import { PurchaseRequest, Project, Item, PurchaseRequestMethod, PurchaseRequestItem, PurchaseRequestNote, Supplier, SupplierQuotation, QuotedItem, PurchaseRequestStatus, PermissionActions, User, ApprovalStep, ApprovalStatus, Role, OrganizationInfo } from '../types';
import { useTranslation } from '../LanguageContext';
import Modal from '../components/Modal';
import { PlusIcon, TrashIcon, PrinterIcon } from '../components/icons';
import { useToast } from '../ToastContext';
import { initialRoles } from '../mockData';
import PriceComparisonPrintable from '../components/PriceComparisonPrintable';

const getInitialFormData = (requesterName: string, requestCode: string): Omit<PurchaseRequest, 'id'> => ({
    requestCode,
    projectId: '',
    nameAr: '',
    nameEn: '',
    currency: 'ILS',
    purchaseMethod: PurchaseRequestMethod.DIRECT,
    requestDate: new Date().toISOString().split('T')[0],
    publicationDate: '',
    deadlineDate: '',
    requesterName: requesterName,
    items: [],
    notes: [],
    status: PurchaseRequestStatus.DRAFT,
    approvals: [],
});

interface PurchaseRequestsPageProps {
  purchaseRequests: PurchaseRequest[];
  setPurchaseRequests: React.Dispatch<React.SetStateAction<PurchaseRequest[]>>;
  projects: Project[];
  items: Item[];
  suppliers: Supplier[];
  supplierQuotations: SupplierQuotation[];
  setSupplierQuotations: React.Dispatch<React.SetStateAction<SupplierQuotation[]>>;
  permissions: PermissionActions;
  currentUser: User;
  organizationInfo: OrganizationInfo;
  logActivity: (args: { actionType: 'create' | 'update' | 'delete'; entityType: string; entityName: string; }) => void;
  approvalWorkflow: string[];
}

const PurchaseRequestsPage: React.FC<PurchaseRequestsPageProps> = ({ purchaseRequests, setPurchaseRequests, projects, items, suppliers, supplierQuotations, setSupplierQuotations, permissions, currentUser, organizationInfo, logActivity, approvalWorkflow }) => {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  
  const [mode, setMode] = useState<'new' | 'view' | 'edit'>('new');
  const [selectedRequestId, setSelectedRequestId] = useState('');
  const [formData, setFormData] = useState<Omit<PurchaseRequest, 'id'>>(() => getInitialFormData(currentUser.name, `REQ-${Date.now()}`));
  
  const [isItemsModalOpen, setIsItemsModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [rejectionModal, setRejectionModal] = useState<{ isOpen: boolean; onConfirm: (comments: string) => void }>({ isOpen: false, onConfirm: () => {} });
  const [isComparisonPrintModalOpen, setIsComparisonPrintModalOpen] = useState(false);
  const [analysisDataForPrint, setAnalysisDataForPrint] = useState<any>(null);
  
  useEffect(() => {
    if (selectedRequestId) {
        const request = purchaseRequests.find(pr => pr.id === selectedRequestId);
        if (request) {
            setFormData(request);
            setMode('view');
        }
    } else {
        setFormData(getInitialFormData(currentUser.name, `REQ-${Date.now()}`));
        setMode('new');
    }
  }, [selectedRequestId, purchaseRequests, currentUser.name]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRequestId(e.target.value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const updatePurchaseRequest = (updatedRequest: PurchaseRequest) => {
    setPurchaseRequests(prev => prev.map(pr => pr.id === updatedRequest.id ? updatedRequest : pr));
    setFormData(updatedRequest);
  };

  const handlePrintComparison = (data: any) => {
    setAnalysisDataForPrint(data);
    setIsComparisonPrintModalOpen(true);
  };

  const handleSubmitForApproval = () => {
      if (formData.items.length === 0) {
          showToast('Please add items to the request before submitting.', 'error');
          return;
      }
      const initialApprovals = approvalWorkflow.map(roleId => ({
          roleId,
          status: ApprovalStatus.PENDING,
      }));
      const updatedRequest = {
          ...formData,
          id: selectedRequestId,
          status: PurchaseRequestStatus.PENDING_APPROVAL,
          approvals: initialApprovals
      };
      updatePurchaseRequest(updatedRequest as PurchaseRequest);
      logActivity({ actionType: 'update', entityType: 'PurchaseRequest', entityName: `Submitted for approval: ${formData.nameEn}` });
      showToast('Request submitted for approval.', 'success');
  };
  
  const handleAction = (action: 'new' | 'save' | 'edit' | 'delete') => {
    if (action === 'new') {
        setSelectedRequestId('');
        return;
    }
    
    if (action === 'save') {
        const missingFields = [];
        if (!formData.projectId) missingFields.push(`'${t.purchaseRequests.projectName}'`);
        if (!formData.nameAr) missingFields.push(`'${t.purchaseRequests.requestNameAr}'`);
        if (!formData.nameEn) missingFields.push(`'${t.purchaseRequests.requestNameEn}'`);
        
        if (missingFields.length > 0) {
            showToast(`${t.common.fillRequiredFields}: ${missingFields.join(', ')}`, 'error');
            return;
        }

        if (mode === 'new') {
            const newRequest = { id: `pr-${Date.now()}`, ...formData };
            setPurchaseRequests(prev => [...prev, newRequest]);
            logActivity({ actionType: 'create', entityType: 'PurchaseRequest', entityName: newRequest.nameEn || newRequest.nameAr });
            setSelectedRequestId(newRequest.id);
            showToast(t.purchaseRequests.requestSaved, 'success');
        } else if (mode === 'edit') {
            const updatedRequest = { ...formData, id: selectedRequestId };
            updatePurchaseRequest(updatedRequest as PurchaseRequest);
            logActivity({ actionType: 'update', entityType: 'PurchaseRequest', entityName: formData.nameEn || formData.nameAr });
            setMode('view');
            showToast(t.purchaseRequests.requestSaved, 'success');
        }
        return;
    }
    
    if (!selectedRequestId) return;
    
    if (action === 'edit') {
        setMode('edit');
    }
    
    if (action === 'delete') {
        const requestToDelete = purchaseRequests.find(pr => pr.id === selectedRequestId);
        if (requestToDelete) {
            logActivity({ actionType: 'delete', entityType: 'PurchaseRequest', entityName: requestToDelete.nameEn || requestToDelete.nameAr });
        }
        setPurchaseRequests(prev => prev.filter(pr => pr.id !== selectedRequestId));
        setSelectedRequestId('');
        showToast(t.purchaseRequests.requestDeleted, 'success');
    }
  };
  
  const handleApprove = () => {
      if (!selectedRequest) return;
      const currentStepIndex = selectedRequest.approvals.findIndex(a => a.status === ApprovalStatus.PENDING);
      if (currentStepIndex === -1) return;

      const newApprovals = [...selectedRequest.approvals];
      newApprovals[currentStepIndex] = {
          ...newApprovals[currentStepIndex],
          status: ApprovalStatus.APPROVED,
          userId: currentUser.id,
          userName: currentUser.name,
          date: new Date().toISOString().split('T')[0],
      };

      const isLastApproval = currentStepIndex === newApprovals.length - 1;
      const newStatus = isLastApproval ? PurchaseRequestStatus.APPROVED : selectedRequest.status;

      const updatedRequest = { ...selectedRequest, approvals: newApprovals, status: newStatus };
      updatePurchaseRequest(updatedRequest);
      logActivity({ actionType: 'update', entityType: 'PurchaseRequestApproval', entityName: `Approved: ${selectedRequest.nameEn}` });
      showToast('Request Approved', 'success');
  };

  const handleReject = (comments: string) => {
      if (!selectedRequest) return;
      const currentStepIndex = selectedRequest.approvals.findIndex(a => a.status === ApprovalStatus.PENDING);
      if (currentStepIndex === -1) return;

      const newApprovals = [...selectedRequest.approvals];
      newApprovals[currentStepIndex] = {
          ...newApprovals[currentStepIndex],
          status: ApprovalStatus.REJECTED,
          userId: currentUser.id,
          userName: currentUser.name,
          date: new Date().toISOString().split('T')[0],
          comments: comments,
      };

      const updatedRequest = { ...selectedRequest, approvals: newApprovals, status: PurchaseRequestStatus.REJECTED };
      updatePurchaseRequest(updatedRequest);
      logActivity({ actionType: 'update', entityType: 'PurchaseRequestApproval', entityName: `Rejected: ${selectedRequest.nameEn}` });
      showToast('Request Rejected', 'error');
  };

  const openRejectionModal = () => {
    setRejectionModal({
      isOpen: true,
      onConfirm: (comments) => {
        handleReject(comments);
        setRejectionModal({ isOpen: false, onConfirm: () => {} });
      }
    });
  };
  
  const isReadOnly = formData.status !== PurchaseRequestStatus.DRAFT || mode === 'view' || (mode === 'edit' && !permissions.update);
  const selectedRequest = useMemo(() => purchaseRequests.find(pr => pr.id === selectedRequestId), [selectedRequestId, purchaseRequests]);
  const baseButtonClass = "text-white font-semibold py-2 px-5 rounded-lg shadow-md transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed";
  
  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 pb-4 border-b-2 border-slate-200 bg-slate-50 -m-8 p-8 rounded-t-xl">
             <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-800">{t.purchaseRequests.pageTitle}</h2>
                {selectedRequest && <StatusBadge status={selectedRequest.status} />}
             </div>
            <div className="flex items-center gap-4">
                <label htmlFor="requestCode" className="font-bold text-lg text-slate-700">{t.purchaseRequests.requestCode}</label>
                 {isReadOnly ? (
                    <span className="px-4 py-2 bg-slate-200 text-slate-800 font-mono rounded-md">{formData.requestCode}</span>
                ) : (
                    <input 
                        type="text" 
                        id="requestCode"
                        name="requestCode"
                        value={formData.requestCode || ''}
                        onChange={handleInputChange}
                        className="form-input w-48 font-mono bg-slate-50"
                    />
                )}
            </div>
        </div>

        {/* Selector */}
        <div className="my-6">
            <FormRow label={t.purchaseRequests.selectRequest}>
                <select value={selectedRequestId} onChange={handleSelectChange} className="form-input">
                    <option value="">{t.purchaseRequests.selectRequestPlaceholder}</option>
                    {purchaseRequests.map(pr => (
                        <option key={pr.id} value={pr.id}>{pr.nameAr || pr.nameEn} ({pr.requestCode})</option>
                    ))}
                </select>
            </FormRow>
        </div>

        <div className="mt-6">
            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 mb-6 pb-6 border-b-2 border-slate-200">
                <button onClick={() => handleAction('new')} disabled={!permissions.create} className={`${baseButtonClass} bg-indigo-600 hover:bg-indigo-700`}>{t.common.new}</button>
                <button onClick={() => handleAction('save')} disabled={formData.status !== PurchaseRequestStatus.DRAFT || (mode === 'new' ? !permissions.create : !permissions.update)} className={`${baseButtonClass} bg-blue-600 hover:bg-blue-700`}>{t.common.save}</button>
                <button onClick={() => handleAction('edit')} disabled={!selectedRequestId || formData.status !== PurchaseRequestStatus.DRAFT || mode === 'edit' || !permissions.update} className={`${baseButtonClass} bg-yellow-500 hover:bg-yellow-600`}>{t.common.edit}</button>
                <button onClick={() => handleAction('delete')} disabled={!selectedRequestId || !permissions.delete} className={`${baseButtonClass} bg-red-600 hover:bg-red-700`}>{t.common.delete}</button>
                <button onClick={() => setIsItemsModalOpen(true)} disabled={isReadOnly} className={`${baseButtonClass} bg-slate-600 hover:bg-slate-700`}>{t.purchaseRequests.addItemsBtn}</button>
                <button onClick={() => setIsNotesModalOpen(true)} disabled={isReadOnly} className={`${baseButtonClass} bg-slate-600 hover:bg-slate-700`}>{t.purchaseRequests.addNoteBtn}</button>
                <button onClick={() => setIsAnalysisModalOpen(true)} disabled={!selectedRequestId || selectedRequest?.status !== PurchaseRequestStatus.APPROVED} className={`${baseButtonClass} bg-teal-600 hover:bg-teal-700`}>{t.purchaseRequests.analyzePricesBtn}</button>
                <button onClick={handleSubmitForApproval} disabled={!selectedRequestId || selectedRequest?.status !== PurchaseRequestStatus.DRAFT} className={`${baseButtonClass} bg-green-600 hover:bg-green-700`}>{t.purchaseRequests.submitForApproval}</button>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 gap-y-5">
                <FormRow label={t.purchaseRequests.projectName} required>
                    <select name="projectId" value={formData.projectId} onChange={handleInputChange} className="form-input" disabled={isReadOnly} required>
                        <option value="">{t.purchaseRequests.selectProjectPlaceholder}</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{language === 'ar' ? p.nameAr : p.nameEn}</option>)}
                    </select>
                </FormRow>
                <FormRow label={t.purchaseRequests.requestNameAr} required><input type="text" name="nameAr" value={formData.nameAr} onChange={handleInputChange} className="form-input" readOnly={isReadOnly} required /></FormRow>
                <FormRow label={t.purchaseRequests.requestNameEn} required><input type="text" name="nameEn" value={formData.nameEn} onChange={handleInputChange} className="form-input" readOnly={isReadOnly} required/></FormRow>
                <FormRow label={t.purchaseRequests.currency}>
                    <select name="currency" value={formData.currency} onChange={handleInputChange} className="form-input" disabled={isReadOnly}>
                        <option value="ILS">ILS</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                    </select>
                </FormRow>
                <FormRow label={t.purchaseRequests.purchaseMethod}>
                    <select name="purchaseMethod" value={formData.purchaseMethod} onChange={handleInputChange} className="form-input" disabled={isReadOnly}>
                        <option value={PurchaseRequestMethod.DIRECT}>{t.purchaseRequests.purchaseMethods.DIRECT}</option>
                        <option value={PurchaseRequestMethod.QUOTATION}>{t.purchaseRequests.purchaseMethods.QUOTATION}</option>
                        <option value={PurchaseRequestMethod.TENDER}>{t.purchaseRequests.purchaseMethods.TENDER}</option>
                    </select>
                </FormRow>
                <FormRow label={t.purchaseRequests.requestDate}><input type="date" name="requestDate" value={formData.requestDate} onChange={handleInputChange} className="form-input bg-slate-200" readOnly /></FormRow>
                <FormRow label={t.purchaseRequests.publicationDate}><input type="date" name="publicationDate" value={formData.publicationDate} onChange={handleInputChange} className="form-input" readOnly={isReadOnly} /></FormRow>
                <FormRow label={t.purchaseRequests.deadlineDate}><input type="date" name="deadlineDate" value={formData.deadlineDate} onChange={handleInputChange} className="form-input" readOnly={isReadOnly} /></FormRow>
                <FormRow label={t.purchaseRequests.requesterName} required>
                    <input type="text" name="requesterName" value={formData.requesterName} className="form-input bg-slate-100 cursor-not-allowed" readOnly />
                </FormRow>
            </div>
             {selectedRequest && selectedRequest.status !== PurchaseRequestStatus.DRAFT && (
                <div className="mt-8">
                    <ApprovalStatusTracker request={selectedRequest} currentUser={currentUser} onApprove={handleApprove} onReject={openRejectionModal} />
                </div>
            )}
        </div>

        {/* Items and Notes Display */}
        <div className="mt-8 pt-6 border-t border-slate-200">
             <h3 className="text-xl font-bold text-slate-800 mb-3">{t.purchaseRequests.items}</h3>
            {formData.items.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t.purchaseRequests.itemTableName}</th>
                                <th scope="col" className="px-6 py-3">{t.purchaseRequests.itemTableQuantity}</th>
                                {!isReadOnly && <th scope="col" className="px-6 py-3">{t.purchaseRequests.itemTableAction}</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {formData.items.map((reqItem, index) => {
                                const itemDetail = items.find(i => i.id === reqItem.itemId);
                                return (
                                    <tr key={index} className="bg-white border-b">
                                        <td className="px-6 py-4">{itemDetail ? (language === 'ar' ? itemDetail.nameAr : itemDetail.nameEn) : 'Unknown Item'}</td>
                                        <td className="px-6 py-4">{reqItem.quantity}</td>
                                        {!isReadOnly && <td className="px-6 py-4">
                                            <button onClick={() => {
                                                setFormData(f => ({...f, items: f.items.filter((_, i) => i !== index)}))
                                            }} className="text-red-500 hover:text-red-700">
                                                <TrashIcon/>
                                            </button>
                                        </td>}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : <p className="text-slate-500">{t.purchaseRequests.noItems}</p>}
        </div>
        
        <ItemsModal 
            isOpen={isItemsModalOpen}
            onClose={() => setIsItemsModalOpen(false)}
            allItems={items}
            currentItems={formData.items}
            setItems={(newItems) => setFormData(f => ({...f, items: newItems}))}
        />
        <NotesModal
            isOpen={isNotesModalOpen}
            onClose={() => setIsNotesModalOpen(false)}
            currentUser={currentUser}
            currentNotes={formData.notes}
            setNotes={(newNotes) => setFormData(f => ({...f, notes: newNotes}))}
        />
        <RejectionModal 
          isOpen={rejectionModal.isOpen} 
          onClose={() => setRejectionModal({ ...rejectionModal, isOpen: false })} 
          onConfirm={rejectionModal.onConfirm}
        />
        {selectedRequest && <PriceAnalysisModal 
            isOpen={isAnalysisModalOpen}
            onClose={() => setIsAnalysisModalOpen(false)}
            request={selectedRequest}
            allItems={items}
            allSuppliers={suppliers}
            quotations={supplierQuotations.filter(q => q.purchaseRequestId === selectedRequest.id)}
            onSave={(updatedQuotes) => {
                const otherQuotes = supplierQuotations.filter(q => q.purchaseRequestId !== selectedRequest.id);
                setSupplierQuotations([...otherQuotes, ...updatedQuotes]);
                logActivity({
                    actionType: 'update',
                    entityType: 'SupplierQuotations',
                    entityName: `For Request: ${selectedRequest.requestCode}`
                });
            }}
            permissions={permissions}
            onPrint={handlePrintComparison}
        />}
        {selectedRequest && isComparisonPrintModalOpen && analysisDataForPrint && (
            <Modal
                isOpen={isComparisonPrintModalOpen}
                onClose={() => setIsComparisonPrintModalOpen(false)}
                title={t.priceComparison.title}
                size="max-w-5xl"
            >
                <PriceComparisonPrintable
                    request={selectedRequest}
                    project={projects.find(p => p.id === selectedRequest.projectId)}
                    organizationInfo={organizationInfo}
                    suppliers={suppliers}
                    analysisData={analysisDataForPrint}
                />
            </Modal>
        )}
        <style>{`
            .form-input {
                width: 100%;
                padding: 0.5rem 0.75rem;
                border: 1px solid #cbd5e1;
                border-radius: 0.375rem;
                background-color: #f8fafc;
                color: #0f172a;
                transition: box-shadow 0.15s ease-in-out;
            }
            .form-input:focus {
                outline: none;
                border-color: #4f46e5;
                box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.3);
            }
            .form-input:read-only, .form-input:disabled {
                background-color: #e2e8f0;
                cursor: not-allowed;
            }
        `}</style>
    </div>
  );
};


const FormRow: React.FC<{ label: string; children: React.ReactNode; required?: boolean }> = ({ label, children, required }) => {
    const { language } = useTranslation();
    return (
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-1 md:gap-4">
             <label className={`font-semibold text-slate-700 ${language === 'ar' ? 'md:text-right' : 'md:text-left'}`}>
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {children}
        </div>
    );
};

const StatusBadge: React.FC<{ status: PurchaseRequestStatus }> = ({ status }) => {
  const { t } = useTranslation();
  const statusText = t.purchaseRequests.status[status] || status;
  const colorClasses = {
    [PurchaseRequestStatus.DRAFT]: 'bg-slate-200 text-slate-800',
    [PurchaseRequestStatus.PENDING_APPROVAL]: 'bg-yellow-200 text-yellow-800',
    [PurchaseRequestStatus.APPROVED]: 'bg-green-200 text-green-800',
    [PurchaseRequestStatus.REJECTED]: 'bg-red-200 text-red-800',
    [PurchaseRequestStatus.AWARDED]: 'bg-blue-200 text-blue-800',
  };
  return <span className={`px-3 py-1 text-sm font-bold rounded-full ${colorClasses[status]}`}>{statusText}</span>;
};

// Items Modal Component
interface ItemsModalProps {
    isOpen: boolean;
    onClose: () => void;
    allItems: Item[];
    currentItems: PurchaseRequestItem[];
    setItems: (items: PurchaseRequestItem[]) => void;
}
const ItemsModal: React.FC<ItemsModalProps> = ({ isOpen, onClose, allItems, currentItems, setItems }) => {
    const { t, language } = useTranslation();
    const { showToast } = useToast();
    const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});

    useEffect(() => {
        if(isOpen) {
            const initialSelection = currentItems.reduce((acc, item) => {
                acc[item.itemId] = item.quantity;
                return acc;
            }, {} as Record<string, number>);
            setSelectedItems(initialSelection);
        }
    }, [isOpen, currentItems]);

    const handleItemToggle = (itemId: string) => {
        const newSelection = {...selectedItems};
        if (newSelection[itemId]) {
            delete newSelection[itemId];
        } else {
            newSelection[itemId] = 1;
        }
        setSelectedItems(newSelection);
    };

    const handleQuantityChange = (itemId: string, quantity: number) => {
        if(quantity > 0) {
            setSelectedItems(prev => ({...prev, [itemId]: quantity}));
        }
    };
    
    const handleSave = () => {
        const newItemsList = Object.entries(selectedItems).map(([itemId, quantity]) => ({ itemId, quantity }));
        setItems(newItemsList);
        showToast(t.common.updatedSuccess, 'success');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t.purchaseRequests.addItemsTitle}>
            <div className="max-h-96 overflow-y-auto space-y-2">
                {allItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2 rounded-md bg-slate-50">
                        <div className="flex items-center">
                            <input 
                                type="checkbox"
                                id={`item-${item.id}`}
                                checked={!!selectedItems[item.id]}
                                onChange={() => handleItemToggle(item.id)}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label htmlFor={`item-${item.id}`} className="ml-3 min-w-0 flex-1 text-slate-800">
                                {language === 'ar' ? item.nameAr : item.nameEn}
                            </label>
                        </div>
                        {selectedItems[item.id] && (
                             <input 
                                type="number" 
                                value={selectedItems[item.id]}
                                onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                                className="w-24 p-1 border border-slate-300 rounded-md text-slate-900 bg-slate-50"
                                min="1"
                            />
                        )}
                    </div>
                ))}
            </div>
            <div className="mt-6 flex justify-end gap-3">
                <button onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-md hover:bg-slate-300">{t.common.cancel}</button>
                <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">{t.common.add}</button>
            </div>
        </Modal>
    );
};


// Notes Modal Component
interface NotesModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentNotes: PurchaseRequestNote[];
    setNotes: (notes: PurchaseRequestNote[]) => void;
    currentUser: User;
}
const NotesModal: React.FC<NotesModalProps> = ({ isOpen, onClose, currentNotes, setNotes, currentUser }) => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [newNoteText, setNewNoteText] = useState('');
    
    const handleAddNote = () => {
        if(newNoteText.trim()) {
            const newNote: PurchaseRequestNote = {
                id: `note-${Date.now()}`,
                text: newNoteText,
                date: new Date().toISOString().split('T')[0],
                user: currentUser.name
            };
            setNotes([...currentNotes, newNote]);
            setNewNoteText('');
            showToast(t.common.createdSuccess, 'success');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t.purchaseRequests.notesTitle}>
            <div className="space-y-4">
                <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                    {currentNotes.length > 0 ? currentNotes.map(note => (
                        <div key={note.id} className="p-3 bg-slate-100 rounded-lg">
                            <p className="text-slate-800">{note.text}</p>
                            <p className="text-xs text-slate-500 mt-1 text-right">{note.user} - {note.date}</p>
                        </div>
                    )) : <p className="text-slate-500 text-center">{t.purchaseRequests.noNotes}</p>}
                </div>
                <div className="pt-4 border-t">
                    <textarea 
                        value={newNoteText} 
                        onChange={(e) => setNewNoteText(e.target.value)}
                        placeholder={t.purchaseRequests.addNotePlaceholder}
                        rows={3} 
                        className="w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-slate-900"
                    />
                    <div className="mt-2 flex justify-end">
                        <button onClick={handleAddNote} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">{t.purchaseRequests.addNoteBtn}</button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (comments: string) => void;
}
const RejectionModal: React.FC<RejectionModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const { t } = useTranslation();
    const [comments, setComments] = useState('');
    
    const handleConfirm = () => {
        if (!comments.trim()) {
            alert(t.purchaseRequests.approvals.rejectionComments);
            return;
        }
        onConfirm(comments);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t.purchaseRequests.approvals.rejectionReason}>
            <div className="space-y-4">
                <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={4}
                    className="w-full p-2 border rounded-md bg-slate-50 text-slate-900"
                    placeholder={t.purchaseRequests.approvals.rejectionComments}
                />
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-lg">{t.common.cancel}</button>
                    <button onClick={handleConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg">{t.purchaseRequests.approvals.submitReject}</button>
                </div>
            </div>
        </Modal>
    );
};

interface ApprovalStatusTrackerProps {
    request: PurchaseRequest;
    currentUser: User;
    onApprove: () => void;
    onReject: () => void;
}
const ApprovalStatusTracker: React.FC<ApprovalStatusTrackerProps> = ({ request, currentUser, onApprove, onReject }) => {
    const { t, language } = useTranslation();
    const roles: Role[] = initialRoles;

    const currentStepIndex = request.approvals.findIndex(a => a.status === ApprovalStatus.PENDING);
    const canApprove = currentStepIndex !== -1 && request.approvals[currentStepIndex].roleId === currentUser.roleId;

    const getStatusChip = (status: ApprovalStatus) => {
        const styles = {
            [ApprovalStatus.PENDING]: "bg-yellow-100 text-yellow-800",
            [ApprovalStatus.APPROVED]: "bg-green-100 text-green-800",
            [ApprovalStatus.REJECTED]: "bg-red-100 text-red-800",
        };
        return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[status]}`}>{t.purchaseRequests.approvals.status[status]}</span>
    };

    return (
        <div className="p-4 border rounded-lg bg-slate-50">
            <h3 className="text-lg font-bold text-slate-800 mb-4">{t.purchaseRequests.approvals.title}</h3>
            <div className="space-y-4">
                {request.approvals.map((step, index) => {
                    const role = roles.find(r => r.id === step.roleId);
                    const isCurrent = index === currentStepIndex;
                    return (
                         <div key={index} className={`p-3 rounded-lg border-l-4 ${isCurrent ? 'bg-white border-indigo-500 shadow' : 'bg-slate-100 border-slate-300'}`}>
                            <div className="flex justify-between items-center">
                                <div className="font-bold text-slate-700">
                                    {t.purchaseRequests.approvals.step} {index + 1}: {role ? (language === 'ar' ? role.nameAr : role.nameEn) : ''}
                                </div>
                                {getStatusChip(step.status)}
                            </div>
                            {step.status !== ApprovalStatus.PENDING && (
                                <div className="text-xs text-slate-500 mt-1">
                                    <span>{step.userName} - {step.date}</span>
                                    {step.comments && <p className="mt-1 italic">"{step.comments}"</p>}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            {canApprove && (
                <div className="mt-4 pt-4 border-t flex justify-end gap-3">
                    <button onClick={onReject} className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold">{t.purchaseRequests.approvals.reject}</button>
                    <button onClick={onApprove} className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold">{t.purchaseRequests.approvals.approve}</button>
                </div>
            )}
        </div>
    );
};

interface PriceAnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    request: PurchaseRequest;
    allItems: Item[];
    allSuppliers: Supplier[];
    quotations: SupplierQuotation[];
    onSave: (updatedQuotations: SupplierQuotation[]) => void;
    permissions: PermissionActions;
    onPrint: (data: any) => void;
}

const PriceAnalysisModal: React.FC<PriceAnalysisModalProps> = ({ isOpen, onClose, request, allItems, allSuppliers, quotations, onSave, permissions, onPrint }) => {
    const { t, language } = useTranslation();
    const { showToast } = useToast();
    const isReadOnly = !permissions.update;

    const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>([]);
    const [prices, setPrices] = useState<Record<string, Record<string, string>>>({}); // { [itemId]: { [supplierId]: price } }
    const [discounts, setDiscounts] = useState<Record<string, string>>({}); // { [supplierId]: discount }
    const [supplierToAdd, setSupplierToAdd] = useState('');
    
    useEffect(() => {
        if (isOpen) {
            const supplierIds = Array.from(new Set(quotations.map(q => q.supplierId)));
            setSelectedSupplierIds(supplierIds);
            
            const initialPrices: Record<string, Record<string, string>> = {};
            const initialDiscounts: Record<string, string> = {};

            quotations.forEach(q => {
                q.items.forEach(item => {
                    if (!initialPrices[item.itemId]) initialPrices[item.itemId] = {};
                    initialPrices[item.itemId][q.supplierId] = String(item.price);
                });
                if (q.discount) {
                    initialDiscounts[q.supplierId] = String(q.discount);
                }
            });
            setPrices(initialPrices);
            setDiscounts(initialDiscounts);
        }
    }, [isOpen, quotations]);

    const availableSuppliersToAdd = useMemo(() => {
        // Show all suppliers that are not already selected for comparison.
        // This allows adding any supplier to enter their prices, not just those with existing quotations.
        return allSuppliers.filter(s => !selectedSupplierIds.includes(s.id));
    }, [allSuppliers, selectedSupplierIds]);

    const handleAddSupplier = () => {
        if (supplierToAdd && !selectedSupplierIds.includes(supplierToAdd)) {
            setSelectedSupplierIds(prev => [...prev, supplierToAdd]);
            setSupplierToAdd('');
        }
    };
    
    const handleRemoveSupplier = (supplierId: string) => {
        setSelectedSupplierIds(prev => prev.filter(id => id !== supplierId));
        // Optionally remove price data for the removed supplier
    };

    const handlePriceChange = (itemId: string, supplierId: string, value: string) => {
        setPrices(p => ({
            ...p,
            [itemId]: { ...(p[itemId] || {}), [supplierId]: value }
        }));
    };
    const handleDiscountChange = (supplierId: string, value: string) => {
        setDiscounts(d => ({...d, [supplierId]: value}));
    };

    const rows = useMemo(() => {
        return request.items.map(reqItem => {
            const itemInfo = allItems.find(i => i.id === reqItem.itemId);
            const itemPrices = prices[reqItem.itemId] || {};
            const priceValues = selectedSupplierIds.map(supId => parseFloat(itemPrices[supId]) || 0).filter(p => p > 0);
            const lowestPrice = priceValues.length > 0 ? Math.min(...priceValues) : 0;
            return { reqItem, itemInfo, lowestPrice };
        });
    }, [request.items, allItems, prices, selectedSupplierIds]);

    const totals = useMemo(() => {
        const res: Record<string, number> = {};
        for(const supId of selectedSupplierIds) {
            res[supId] = rows.reduce((acc, row) => {
                const price = parseFloat(prices[row.reqItem.itemId]?.[supId] || '0');
                return acc + (price * row.reqItem.quantity);
            }, 0);
        }
        return res;
    }, [rows, prices, selectedSupplierIds]);

    const finalTotals = useMemo(() => {
        const res: Record<string, number> = {};
        for(const supId of selectedSupplierIds) {
            const total = totals[supId] || 0;
            const discount = parseFloat(discounts[supId] || '0');
            res[supId] = total * (1 - discount / 100);
        }
        return res;
    }, [totals, discounts, selectedSupplierIds]);

    const handleSave = () => {
        const updatedQuotations: SupplierQuotation[] = selectedSupplierIds.map(supId => {
            const items: QuotedItem[] = request.items.map(reqItem => ({
                itemId: reqItem.itemId,
                price: parseFloat(prices[reqItem.itemId]?.[supId] || '0')
            }));
            const existingQuotation = quotations.find(q => q.supplierId === supId && q.purchaseRequestId === request.id);
            return {
                id: existingQuotation?.id || `qt-${Date.now()}-${supId}`,
                purchaseRequestId: request.id,
                supplierId: supId,
                items,
                quotationDate: existingQuotation?.quotationDate || new Date().toISOString().split('T')[0],
                discount: parseFloat(discounts[supId] || '0'),
            };
        });
        onSave(updatedQuotations);
        showToast(t.common.updatedSuccess, 'success');
        onClose();
    };

    const handlePrintClick = () => {
        if (selectedSupplierIds.length === 0) {
            showToast(t.priceAnalysis.noSuppliersSelected, 'error');
            return;
        }
        onPrint({
            rows: rows.map(r => ({ ...r, prices: selectedSupplierIds.map(supId => parseFloat(prices[r.reqItem.itemId]?.[supId]) || 0)})),
            totals,
            finalTotals,
            discounts,
            selectedSupplierIds
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t.priceAnalysis.title} size="max-w-7xl">
            <div className="flex items-center gap-3 mb-4 p-4 bg-slate-50 border rounded-lg">
                <label className="font-semibold text-slate-700">{t.priceAnalysis.addSupplier}:</label>
                <select value={supplierToAdd} onChange={e => setSupplierToAdd(e.target.value)} className="form-input flex-grow">
                    <option value="">{t.priceAnalysis.selectSupplierPlaceholder}</option>
                    {availableSuppliersToAdd.map(s => (
                        <option key={s.id} value={s.id}>{language === 'ar' ? s.nameAr : s.nameEn}</option>
                    ))}
                </select>
                <button onClick={handleAddSupplier} disabled={!supplierToAdd || isReadOnly} className="py-2 px-4 bg-indigo-600 text-white rounded-md flex items-center gap-2 disabled:bg-indigo-300">
                    <PlusIcon /> {t.common.add}
                </button>
            </div>

            <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="p-3 text-start font-bold text-slate-700 w-1/4">{t.priceAnalysis.item}</th>
                            {selectedSupplierIds.map(supId => {
                                 const sup = allSuppliers.find(s => s.id === supId);
                                 return <th key={supId} className="p-3 border-l text-center font-bold text-slate-700">
                                     <div className="flex items-center justify-center gap-2">
                                        <span>{sup ? (language === 'ar' ? sup.nameAr : sup.nameEn) : ''}</span>
                                        {!isReadOnly && <button onClick={() => handleRemoveSupplier(supId)} className="text-slate-400 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>}
                                     </div>
                                 </th>
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(({reqItem, itemInfo, lowestPrice}) => (
                            <tr key={reqItem.itemId} className="border-t">
                                <td className="p-2 border-r font-medium text-slate-800">
                                    {itemInfo ? (language === 'ar' ? itemInfo.nameAr : itemInfo.nameEn) : ''}
                                    <span className="text-slate-500 text-xs block">({t.items.quantity}: {reqItem.quantity})</span>
                                </td>
                                {selectedSupplierIds.map(supId => {
                                    const priceVal = prices[reqItem.itemId]?.[supId];
                                    const price = parseFloat(priceVal || '0');
                                    const isLowest = price > 0 && price === lowestPrice;
                                    return (
                                    <td key={supId} className={`p-2 border-l ${isLowest ? 'bg-green-100' : ''}`}>
                                        <input type="number" value={priceVal || ''} onChange={e => handlePriceChange(reqItem.itemId, supId, e.target.value)} readOnly={isReadOnly} className="w-full p-2 border rounded text-center" placeholder={t.priceAnalysis.priceFor + ' ' + (itemInfo?.unit || '')} />
                                    </td>
                                )})}
                            </tr>
                        ))}
                    </tbody>
                     <tfoot className="font-semibold text-slate-800">
                        <tr className="border-t-2 bg-slate-50">
                            <td className="p-3 text-start">{t.priceAnalysis.totalBeforeDiscount}</td>
                            {selectedSupplierIds.map(supId => (
                                <td key={supId} className="p-3 text-center border-l font-mono">
                                    {(totals[supId] || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                            ))}
                        </tr>
                        <tr>
                            <td className="p-3 text-start">{t.priceAnalysis.discount}</td>
                            {selectedSupplierIds.map(supId => (
                                <td key={supId} className="p-3 text-center border-l">
                                    <input
                                        type="number"
                                        value={discounts[supId] || ''}
                                        onChange={e => handleDiscountChange(supId, e.target.value)}
                                        className="w-24 p-1 text-center border rounded mx-auto"
                                        disabled={isReadOnly}
                                        placeholder="%"
                                    />
                                </td>
                            ))}
                        </tr>
                        <tr className="bg-green-50 border-t-2">
                            <td className="p-3 text-start font-bold">{t.priceAnalysis.totalAfterDiscount}</td>
                            {selectedSupplierIds.map(supId => (
                                <td key={supId} className="p-3 text-center border-l font-bold font-mono">
                                    {(finalTotals[supId] || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                            ))}
                        </tr>
                    </tfoot>
                </table>
            </div>
            <div className="mt-6 flex justify-end gap-3">
                <button onClick={handleSave} disabled={isReadOnly} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300">{t.priceAnalysis.savePrices}</button>
                <button onClick={handlePrintClick} className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 flex items-center gap-2">
                    <PrinterIcon className="w-5 h-5"/>
                    {t.priceComparison.print}
                </button>
            </div>
        </Modal>
    );
};

export default PurchaseRequestsPage;