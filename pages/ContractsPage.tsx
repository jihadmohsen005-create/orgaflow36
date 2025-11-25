
import React, { useState, useMemo, useEffect } from 'react';
import { Contract, Supplier, PurchaseOrder, PurchaseRequest, ContractAmendment, ContractAmendmentJustification, PermissionActions } from '../types';
import { useTranslation } from '../LanguageContext';
import { PlusIcon, PencilIcon, TrashIcon, DocumentDuplicateIcon } from '../components/icons';
import Modal from '../components/Modal';
import { useToast } from '../ToastContext';

interface ContractsPageProps {
  contracts: Contract[];
  setContracts: React.Dispatch<React.SetStateAction<Contract[]>>;
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  purchaseRequests: PurchaseRequest[];
  contractAmendments: ContractAmendment[];
  setContractAmendments: React.Dispatch<React.SetStateAction<ContractAmendment[]>>;
  permissions: PermissionActions;
  logActivity: (args: { actionType: 'create' | 'update' | 'delete'; entityType: string; entityName: string; }) => void;
}

const getInitialFormData = (request?: PurchaseRequest, po?: PurchaseOrder): Omit<Contract, 'id'> => ({
    contractNumber: '',
    purchaseRequestId: request?.id || '',
    supplierId: po?.supplierId || '',
    totalAmount: po?.totalAmount || 0,
    currency: request?.currency || 'USD',
    terms: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
});

// Amendments Modal Component
interface AmendmentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    contract: Contract;
    amendments: ContractAmendment[];
    setAmendments: React.Dispatch<React.SetStateAction<ContractAmendment[]>>;
    setContracts: React.Dispatch<React.SetStateAction<Contract[]>>;
    permissions: PermissionActions;
    logActivity: ContractsPageProps['logActivity'];
}
const AmendmentsModal: React.FC<AmendmentsModalProps> = ({ isOpen, onClose, contract, amendments, setAmendments, setContracts, permissions, logActivity }) => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const initialAmendmentForm = {
        amendmentDate: new Date().toISOString().split('T')[0],
        newEndDate: contract.endDate,
        newTotalAmount: contract.totalAmount,
        justifications: [{ id: `just-${Date.now()}`, text: '' }],
    };
    const [formData, setFormData] = useState(initialAmendmentForm);
    const [isAdding, setIsAdding] = useState(false);

    const handleJustificationChange = (index: number, text: string) => {
        const newJustifications = [...formData.justifications];
        newJustifications[index].text = text;
        setFormData(prev => ({ ...prev, justifications: newJustifications }));
    };

    const addJustificationField = () => {
        setFormData(prev => ({
            ...prev,
            justifications: [...prev.justifications, { id: `just-${Date.now()}`, text: '' }],
        }));
    };
    
    const removeJustificationField = (id: string) => {
        setFormData(prev => ({
            ...prev,
            justifications: prev.justifications.filter(j => j.id !== id),
        }));
    };

    const handleSave = () => {
        if (formData.justifications.some(j => !j.text.trim())) {
            showToast(t.amendments.justificationPlaceholder, 'error');
            return;
        }

        const newAmendment: ContractAmendment = {
            id: `amend-${Date.now()}`,
            contractId: contract.id,
            amendmentDate: formData.amendmentDate,
            newEndDate: formData.newEndDate,
            newTotalAmount: formData.newTotalAmount,
            justifications: formData.justifications,
        };
        
        setAmendments(prev => [...prev, newAmendment]);
        
        // Update the parent contract
        setContracts(prev => prev.map(c => 
            c.id === contract.id 
                ? { ...c, endDate: newAmendment.newEndDate, totalAmount: newAmendment.newTotalAmount } 
                : c
        ));
        
        logActivity({
            actionType: 'create',
            entityType: 'ContractAmendment',
            entityName: `for contract ${contract.contractNumber}`
        });

        showToast(t.amendments.amendmentSaved, 'success');
        setIsAdding(false);
        setFormData(initialAmendmentForm);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`${t.amendments.title} - ${contract.contractNumber}`} size="max-w-4xl">
            <div className="space-y-6">
                {/* List of existing amendments */}
                <div>
                    {amendments.length === 0 && !isAdding ? (
                        <p className="text-center text-slate-500 py-4">{t.amendments.noAmendments}</p>
                    ) : (
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {amendments.map(amend => (
                                <div key={amend.id} className="p-3 border rounded-lg bg-slate-50">
                                    <div className="flex justify-between items-center font-semibold text-slate-700">
                                        <p>{t.amendments.amendmentDate}: {amend.amendmentDate}</p>
                                        <p>{amend.newTotalAmount.toFixed(2)} {contract.currency}</p>
                                        <p>{t.contracts.endDate}: {amend.newEndDate}</p>
                                    </div>
                                    <ul className="list-disc pl-5 mt-2 text-sm text-slate-600">
                                        {amend.justifications.map(j => <li key={j.id}>{j.text}</li>)}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {isAdding ? (
                    <div className="p-4 border-t-2">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">{t.amendments.newAmendment}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                           <FormField label={t.amendments.amendmentDate} required>
                                <input type="date" value={formData.amendmentDate} onChange={e => setFormData(f => ({...f, amendmentDate: e.target.value}))} className="form-input" required/>
                           </FormField>
                            <FormField label={t.amendments.newEndDate} required>
                                <input type="date" value={formData.newEndDate} onChange={e => setFormData(f => ({...f, newEndDate: e.target.value}))} className="form-input" required/>
                           </FormField>
                           <FormField label={t.amendments.newTotalAmount} required>
                                <input type="number" value={formData.newTotalAmount} onChange={e => setFormData(f => ({...f, newTotalAmount: parseFloat(e.target.value) || 0}))} className="form-input" required/>
                           </FormField>
                        </div>
                        <div>
                             <h4 className="font-semibold text-slate-700 mb-2">{t.amendments.justifications} <span className="text-red-500">*</span></h4>
                             <div className="space-y-2">
                                 {formData.justifications.map((just, index) => (
                                     <div key={just.id} className="flex items-center gap-2">
                                         <input type="text" value={just.text} onChange={e => handleJustificationChange(index, e.target.value)} placeholder={t.amendments.justificationPlaceholder} className="form-input flex-grow" required/>
                                         {formData.justifications.length > 1 && <button onClick={() => removeJustificationField(just.id)} className="text-red-500 hover:text-red-700 p-1" title={t.amendments.deleteJustification}><TrashIcon /></button>}
                                     </div>
                                 ))}
                             </div>
                             <button onClick={addJustificationField} className="text-sm text-indigo-600 hover:underline mt-2 flex items-center gap-1"><PlusIcon className="w-4 h-4"/> {t.amendments.addJustification}</button>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                           <button onClick={() => setIsAdding(false)} className="px-5 py-2 bg-slate-200 rounded-lg hover:bg-slate-300">{t.common.cancel}</button>
                            <button onClick={handleSave} disabled={!permissions.update} className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300">{t.common.save}</button>
                        </div>
                    </div>
                ) : (
                     <div className="flex justify-center pt-4 border-t">
                        <button onClick={() => setIsAdding(true)} disabled={!permissions.update} className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-300">
                            <PlusIcon /> {t.amendments.newAmendment}
                        </button>
                    </div>
                )}
            </div>
        </Modal>
    )
}

const ContractsPage: React.FC<ContractsPageProps> = ({ contracts, setContracts, suppliers, purchaseOrders, purchaseRequests, contractAmendments, setContractAmendments, permissions, logActivity }) => {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  
  const [mode, setMode] = useState<'list' | 'new' | 'edit'>('list');
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Contract, 'id'>>(getInitialFormData());

  const [requestFilter, setRequestFilter] = useState('ALL');
  const [supplierFilter, setSupplierFilter] = useState('ALL');
  const [amendmentsModalState, setAmendmentsModalState] = useState<{ isOpen: boolean; contract: Contract | null }>({ isOpen: false, contract: null });


  // Memoize awarded requests to avoid re-computation
  const awardedRequests = useMemo(() => {
    const poRequestIds = new Set(purchaseOrders.map(po => po.purchaseRequestId));
    return purchaseRequests.filter(pr => poRequestIds.has(pr.id));
  }, [purchaseOrders, purchaseRequests]);

  const availableSuppliers = useMemo(() => {
    if (!formData.purchaseRequestId) return [];
    const supplierIdsWithPOs = new Set(
      purchaseOrders
        .filter(po => po.purchaseRequestId === formData.purchaseRequestId)
        .map(po => po.supplierId)
    );
    return suppliers.filter(s => supplierIdsWithPOs.has(s.id));
  }, [formData.purchaseRequestId, purchaseOrders, suppliers]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isNumber = type === 'number';

    setFormData(prev => {
        const newState = { ...prev, [name]: isNumber ? parseFloat(value) || 0 : value };
        
        if (name === 'purchaseRequestId') {
            newState.supplierId = '';
            newState.totalAmount = 0;
            const request = purchaseRequests.find(pr => pr.id === value);
            if(request) newState.currency = request.currency;
        }

        if (name === 'supplierId') {
            const relevantPO = purchaseOrders.find(po => 
                po.purchaseRequestId === newState.purchaseRequestId && 
                po.supplierId === value
            );
            newState.totalAmount = relevantPO ? relevantPO.totalAmount : 0;
        }
        
        return newState;
    });
  };

  const handleNew = () => {
    setSelectedContractId(null);
    
    const currentYear = new Date().getFullYear();
    const contractsThisYear = contracts.filter(c => {
        const parts = c.contractNumber.split('-');
        return parts.length === 4 && parts[0] === 'PEF' && parts[1] === 'Contract' && parseInt(parts[3]) === currentYear;
    });

    let nextSerial = 1;
    if (contractsThisYear.length > 0) {
        const serials = contractsThisYear.map(c => parseInt(c.contractNumber.split('-')[2]));
        nextSerial = Math.max(...serials) + 1;
    }

    const newContractNumber = `PEF-Contract-${String(nextSerial).padStart(3, '0')}-${currentYear}`;
    
    const initialData = getInitialFormData();
    initialData.contractNumber = newContractNumber;

    setFormData(initialData);
    setMode('new');
  };

  const handleEdit = (contract: Contract) => {
    setSelectedContractId(contract.id);
    setFormData(contract);
    setMode('edit');
  };

  const handleCancel = () => {
    setMode('list');
    setSelectedContractId(null);
  };
  
  const handleSave = () => {
      const missingFields = [];
      if (!formData.purchaseRequestId) missingFields.push(`'${t.contracts.selectRequest}'`);
      if (!formData.supplierId) missingFields.push(`'${t.contracts.selectSupplier}'`);
      if (!formData.contractNumber.trim()) missingFields.push(`'${t.contracts.contractNumber}'`);
      if (!formData.startDate) missingFields.push(`'${t.contracts.startDate}'`);
      if (!formData.endDate) missingFields.push(`'${t.contracts.endDate}'`);

      if (missingFields.length > 0) {
          showToast(`${t.common.fillRequiredFields}: ${missingFields.join(', ')}`, 'error');
          return;
      }

      if (mode === 'new') {
        const newContract: Contract = { id: `con-${Date.now()}`, ...formData };
        setContracts(prev => [newContract, ...prev]);
        logActivity({ actionType: 'create', entityType: 'Contract', entityName: newContract.contractNumber });
        showToast(t.common.createdSuccess, 'success');
        setMode('list');
        setSelectedContractId(null);
      } else if (selectedContractId) {
          setContracts(prev => prev.map(c => c.id === selectedContractId ? { ...formData, id: c.id } : c));
          logActivity({ actionType: 'update', entityType: 'Contract', entityName: formData.contractNumber });
          showToast(t.common.updatedSuccess, 'success');
          setMode('list');
          setSelectedContractId(null);
      }
  };
  
  const handleDelete = (id: string) => {
    const contractToDelete = contracts.find(c => c.id === id);
    if (contractToDelete) {
      logActivity({ actionType: 'delete', entityType: 'Contract', entityName: contractToDelete.contractNumber });
    }
    setContracts(prev => prev.filter(c => c.id !== id));
    showToast(t.common.deletedSuccess, 'success');
  };

  const handleResetFilters = () => {
    setRequestFilter('ALL');
    setSupplierFilter('ALL');
  };

  const filteredContracts = useMemo(() => {
      return contracts
        .filter(c => requestFilter === 'ALL' || c.purchaseRequestId === requestFilter)
        .filter(c => supplierFilter === 'ALL' || c.supplierId === supplierFilter);
  }, [contracts, requestFilter, supplierFilter]);
  
  const openAmendmentsModal = (contract: Contract) => {
    setAmendmentsModalState({ isOpen: true, contract });
  };


  if (mode === 'new' || mode === 'edit') {
    const title = mode === 'new' ? t.contracts.newContractTitle : t.contracts.editContractTitle;
    return (
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">{title}</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label={t.contracts.selectRequest} required>
              <select name="purchaseRequestId" value={formData.purchaseRequestId} onChange={handleInputChange} className="form-input" disabled={mode === 'edit'} required>
                  <option value="">{t.contracts.selectRequestPlaceholder}</option>
                  {awardedRequests.map(pr => <option key={pr.id} value={pr.id}>{pr.nameAr || pr.nameEn}</option>)}
              </select>
            </FormField>
             <FormField label={t.contracts.selectSupplier} required>
               <select name="supplierId" value={formData.supplierId} onChange={handleInputChange} className="form-input" disabled={mode === 'edit' || !formData.purchaseRequestId} required>
                  <option value="">{t.contracts.selectSupplierPlaceholder}</option>
                  {availableSuppliers.map(s => <option key={s.id} value={s.id}>{language === 'ar' ? s.nameAr : s.nameEn}</option>)}
              </select>
            </FormField>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField label={t.contracts.contractNumber} required>
                <input type="text" name="contractNumber" value={formData.contractNumber} className="form-input bg-slate-100" readOnly />
            </FormField>
            <FormField label={t.contracts.totalAmount}>
                <div className="flex items-center">
                    <input type="number" name="totalAmount" value={formData.totalAmount} onChange={handleInputChange} className="form-input rounded-r-none" />
                    <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md h-full">
                        {formData.currency}
                    </span>
                </div>
            </FormField>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField label={t.contracts.startDate} required>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="form-input" required />
            </FormField>
            <FormField label={t.contracts.endDate} required>
                <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} className="form-input" required />
            </FormField>
           </div>
           <div>
             <FormField label={t.contracts.terms}>
                <textarea name="terms" value={formData.terms} onChange={handleInputChange} rows={5} className="form-input"></textarea>
            </FormField>
           </div>
        </div>
        <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end gap-3">
            <button onClick={handleCancel} className="px-5 py-2 bg-slate-200 rounded-lg hover:bg-slate-300">{t.common.cancel}</button>
            <button onClick={handleSave} disabled={mode === 'new' ? !permissions.create : !permissions.update} className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300">{t.common.save}</button>
        </div>
        <FormStyle/>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{t.contracts.title}</h1>
        <button onClick={handleNew} disabled={!permissions.create} className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-300">
            <PlusIcon className="w-5 h-5" /> {t.contracts.newContract}
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
        <div className="mb-6 p-4 bg-slate-50 rounded-lg border">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-slate-700">{t.activityLog.filters}</h3>
                <button 
                    onClick={handleResetFilters}
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                    {t.common.clearFilters}
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium text-slate-600 block mb-1">{t.contracts.filterByRequest}</label>
                    <select value={requestFilter} onChange={e => setRequestFilter(e.target.value)} className="form-input">
                        <option value="ALL">{t.purchaseOrders.all}</option>
                        {purchaseRequests.map(pr => <option key={pr.id} value={pr.id}>{pr.nameAr || pr.nameEn}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-600 block mb-1">{t.contracts.filterBySupplier}</label>
                    <select value={supplierFilter} onChange={e => setSupplierFilter(e.target.value)} className="form-input">
                        <option value="ALL">{t.purchaseOrders.all}</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{language === 'ar' ? s.nameAr : s.nameEn}</option>)}
                    </select>
                </div>
            </div>
        </div>

        <div className="space-y-4">
            {filteredContracts.map(contract => {
              const supplier = suppliers.find(s => s.id === contract.supplierId);
              const request = purchaseRequests.find(pr => pr.id === contract.purchaseRequestId);
              const supplierName = supplier ? (language === 'ar' ? supplier.nameAr : supplier.nameEn) : '---';
              const requestName = request ? (language === 'ar' ? request.nameAr : request.nameEn) : '---';

              return (
                <div key={contract.id} className={`bg-white p-4 rounded-lg shadow-sm border ${language === 'ar' ? 'border-r-4' : 'border-l-4'} border-indigo-500`}>
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-indigo-800">{contract.contractNumber}</h3>
                      <p className="text-slate-600 text-sm">{t.contracts.supplier}: {supplierName}</p>
                      <p className="text-slate-500 text-xs">{t.contracts.linkedToRequest}: {requestName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                         <div className="text-sm text-right">
                            <p className="font-semibold text-slate-800">{contract.totalAmount.toFixed(2)} {contract.currency}</p>
                            <p className="text-slate-600">{contract.startDate} {t.contracts.to} {contract.endDate}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button onClick={() => handleEdit(contract)} disabled={!permissions.update} className="text-slate-500 hover:text-blue-600 disabled:text-slate-300" title={t.common.edit}><PencilIcon /></button>
                            <button onClick={() => handleDelete(contract.id)} disabled={!permissions.delete} className="text-slate-500 hover:text-red-600 disabled:text-slate-300" title={t.common.delete}><TrashIcon /></button>
                            <button onClick={() => openAmendmentsModal(contract)} className="text-slate-500 hover:text-teal-600" title={t.amendments.viewAmendments}><DocumentDuplicateIcon /></button>
                        </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredContracts.length === 0 && (
              <div className="text-center py-10 text-slate-500">
                <p>{t.contracts.noContracts}</p>
              </div>
            )}
        </div>
      </div>

      {amendmentsModalState.isOpen && amendmentsModalState.contract && (
        <AmendmentsModal 
            isOpen={amendmentsModalState.isOpen}
            onClose={() => setAmendmentsModalState({isOpen: false, contract: null})}
            contract={amendmentsModalState.contract}
            amendments={contractAmendments.filter(a => a.contractId === amendmentsModalState.contract?.id)}
            setAmendments={setContractAmendments}
            setContracts={setContracts}
            permissions={permissions}
            logActivity={logActivity}
        />
      )}

      <FormStyle />
    </div>
  );
};

const FormField: React.FC<{ label: string; children: React.ReactNode; required?: boolean; }> = ({ label, children, required }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
    </div>
);

const FormStyle: React.FC = () => (
    <style>{`
        .form-input {
            width: 100%;
            padding: 0.5rem 0.75rem;
            border: 1px solid #cbd5e1;
            border-radius: 0.375rem;
            background-color: #f8fafc;
            color: #0f172a;
            transition: box-shadow 0.15s ease-in-out, border-color 0.15s ease-in-out;
            height: 42px;
        }
        .form-input:focus {
            outline: none;
            border-color: #4f46e5;
            box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.3);
        }
        .form-input:disabled {
            background-color: #e2e8f0;
            cursor: not-allowed;
        }
    `}</style>
);


export default ContractsPage;
