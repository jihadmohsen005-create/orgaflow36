
import React, { useState, useMemo, useEffect } from 'react';
import { PurchaseOrder, Supplier, Item, POStatus, Contract, PurchaseRequest, PurchaseRequestStatus, SupplierQuotation, Project, PurchaseOrderItem, PermissionActions, Role, OrganizationInfo } from '../types';
import Modal from '../components/Modal';
import { PlusIcon, CheckCircleIcon, PencilIcon, TrashIcon, PrinterIcon } from '../components/icons';
import { useTranslation } from '../LanguageContext';
import { useToast } from '../ToastContext';
import PrintablePurchaseOrder from '../components/PrintablePurchaseOrder';

interface PurchaseOrdersPageProps {
  purchaseOrders: PurchaseOrder[];
  setPurchaseOrders: React.Dispatch<React.SetStateAction<PurchaseOrder[]>>;
  purchaseRequests: PurchaseRequest[];
  setPurchaseRequests: React.Dispatch<React.SetStateAction<PurchaseRequest[]>>;
  suppliers: Supplier[];
  items: Item[];
  projects: Project[];
  supplierQuotations: SupplierQuotation[];
  setContracts: React.Dispatch<React.SetStateAction<Contract[]>>;
  permissions: PermissionActions;
  logActivity: (args: { actionType: 'create' | 'update' | 'delete'; entityType: string; entityName: string; }) => void;
  organizationInfo: OrganizationInfo;
}

const RequestStatusBadge: React.FC<{ status: PurchaseRequestStatus }> = ({ status }) => {
  const { t } = useTranslation();
  const statusText = t.purchaseRequests.status[status] || status;
  const colorClasses = {
    [PurchaseRequestStatus.DRAFT]: 'bg-slate-100 text-slate-700',
    [PurchaseRequestStatus.PENDING_APPROVAL]: 'bg-yellow-100 text-yellow-700',
    [PurchaseRequestStatus.APPROVED]: 'bg-blue-100 text-blue-700',
    [PurchaseRequestStatus.REJECTED]: 'bg-red-100 text-red-700',
    [PurchaseRequestStatus.AWARDED]: 'bg-green-100 text-green-700',
  };
  return <span className={`px-3 py-1 text-sm font-medium rounded-full ${colorClasses[status]}`}>{statusText}</span>;
};


interface EditablePOItem {
  id: string;
  nameAr: string;
  nameEn: string;
  quantity: number;
  price: number;
}


// Create/Edit PO Modal Component
interface POModalProps {
    isOpen: boolean;
    onClose: () => void;
    request: PurchaseRequest;
    poToEdit: PurchaseOrder | null;
    suppliers: Supplier[];
    items: Item[];
    quotations: SupplierQuotation[];
    onPOCreate: (newPO: PurchaseOrder) => void;
    onPOUpdate: (updatedPO: PurchaseOrder) => void;
    permissions: PermissionActions;
}

const POModal: React.FC<POModalProps> = ({ isOpen, onClose, request, poToEdit, suppliers, items, quotations, onPOCreate, onPOUpdate, permissions }) => {
    const { t, language } = useTranslation();
    const isEditMode = !!poToEdit;
    
    const [selectedSupplierId, setSelectedSupplierId] = useState('');
    const [editableItems, setEditableItems] = useState<EditablePOItem[]>([]);

    const availableSuppliers = useMemo(() => {
        if (isEditMode) return suppliers;
        const quotedSupplierIds = new Set(quotations.map(q => q.supplierId));
        return suppliers.filter(s => quotedSupplierIds.has(s.id));
    }, [quotations, suppliers, isEditMode]);

    useEffect(() => {
        if (!isOpen) return;

        if (isEditMode && poToEdit) {
            setSelectedSupplierId(poToEdit.supplierId);
            const initialItems = poToEdit.items.map(poItem => {
                const itemDetails = items.find(i => i.id === poItem.itemId);
                return {
                    id: poItem.itemId,
                    nameAr: itemDetails?.nameAr || 'Unknown',
                    nameEn: itemDetails?.nameEn || 'Unknown',
                    quantity: poItem.quantity,
                    price: poItem.price,
                };
            });
            setEditableItems(initialItems);
        } else if (!isEditMode) {
            setSelectedSupplierId('');
            setEditableItems([]);
        }

    }, [isOpen, isEditMode, poToEdit, items]);

    useEffect(() => {
        if (isEditMode || !selectedSupplierId) {
             if (!isEditMode) setEditableItems([]);
            return;
        };

        const quotation = quotations.find(q => q.supplierId === selectedSupplierId);
        if (!quotation) {
            setEditableItems([]);
            return;
        }

        const initialItems = quotation.items.map(qItem => {
            const requestItem = request.items.find(rItem => rItem.itemId === qItem.itemId);
            const itemDetails = items.find(i => i.id === qItem.itemId);
            if (!requestItem || !itemDetails) return null;

            return {
                id: itemDetails.id,
                nameAr: itemDetails.nameAr,
                nameEn: itemDetails.nameEn,
                quantity: requestItem.quantity,
                price: qItem.price,
            };
        }).filter((item): item is EditablePOItem => item !== null);

        setEditableItems(initialItems);

    }, [selectedSupplierId, quotations, request.items, items, isEditMode]);

    const handleItemChange = (index: number, field: 'quantity' | 'price', value: string) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue) && value !== '') return;

        const updatedItems = [...editableItems];
        updatedItems[index] = { ...updatedItems[index], [field]: numValue };
        setEditableItems(updatedItems);
    };

    const totalData = useMemo(() => {
        const quotation = quotations.find(q => q.supplierId === selectedSupplierId);
        const subTotal = editableItems.reduce((acc, item) => acc + ((item.quantity || 0) * (item.price || 0)), 0);
        const discount = (isEditMode && poToEdit) ? 0 : (quotation?.discount || 0); // Discounts applied before PO, not on edit
        const totalAfterDiscount = subTotal * (1 - discount / 100);
        return { totalAmount: totalAfterDiscount };
    }, [editableItems, selectedSupplierId, quotations, isEditMode, poToEdit]);
    

    const handleSubmit = () => {
        if (!selectedSupplierId || editableItems.length === 0) return;

        const poItems: PurchaseOrderItem[] = editableItems.map(item => ({
            itemId: item.id,
            quantity: item.quantity || 0,
            price: item.price || 0,
        }));

        if (isEditMode && poToEdit) {
            const updatedPO: PurchaseOrder = {
                ...poToEdit,
                items: poItems,
                totalAmount: totalData.totalAmount,
            };
            onPOUpdate(updatedPO);
        } else {
            const poNumber = `PO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
            const newPO: PurchaseOrder = {
                id: `po${Date.now()}`,
                poNumber,
                purchaseRequestId: request.id,
                supplierId: selectedSupplierId,
                items: poItems,
                totalAmount: totalData.totalAmount,
                status: POStatus.AWARDED,
                creationDate: new Date().toISOString().split('T')[0],
            };
            onPOCreate(newPO);
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? t.purchaseOrders.editModalTitle : t.purchaseOrders.addModalTitle} size="max-w-4xl">
            <div className="space-y-5">
                {/* Request Info Box */}
                <div className="p-3 bg-slate-100 rounded-lg border flex justify-between items-center">
                    <span className="font-bold text-slate-800">{request.nameAr}</span>
                    <span className="text-sm text-slate-500 font-mono">{request.requestCode}</span>
                </div>

                {/* Supplier Select */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.purchaseOrders.selectSupplier} <span className="text-red-500">*</span></label>
                    <select value={selectedSupplierId} onChange={e => setSelectedSupplierId(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-400" disabled={isEditMode} required>
                        <option value="">{t.purchaseOrders.selectSupplierPlaceholder}</option>
                        {availableSuppliers.map(s => (
                            <option key={s.id} value={s.id}>{language === 'ar' ? s.nameAr : s.nameEn}</option>
                        ))}
                    </select>
                     {!isEditMode && availableSuppliers.length === 0 && <p className="text-xs text-red-500 mt-1">{t.purchaseOrders.noQuotations}</p>}
                </div>
                
                {/* Items Table and Total */}
                {editableItems.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-slate-800 mb-2">{t.purchaseOrders.awardedItems}</h4>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-100">
                                    <tr className="border-b border-slate-200">
                                        <th className="p-3 text-start font-bold text-slate-700">{t.items.itemNameAr}</th>
                                        <th className="p-3 text-center font-bold text-slate-700">{t.items.quantity}</th>
                                        <th className="p-3 text-center font-bold text-slate-700">{t.items.price}</th>
                                        <th className="p-3 text-end font-bold text-slate-700">{t.priceAnalysis.total}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {editableItems.map((item, index) => (
                                        <tr key={item.id} className="border-t border-slate-200">
                                            <td className="p-3 text-start font-medium text-slate-900">{language === 'ar' ? item.nameAr : item.nameEn}</td>
                                            <td className="p-2 text-center">
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                    className="w-24 p-2 text-center border border-slate-300 rounded-md bg-slate-50 text-slate-900 focus:ring-1 focus:ring-indigo-500"
                                                    readOnly={isEditMode && !permissions.update}
                                                />
                                            </td>
                                            <td className="p-2 text-center">
                                                <input
                                                    type="number"
                                                    value={item.price}
                                                    onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                                    className="w-28 p-2 text-center border border-slate-300 rounded-md bg-slate-50 text-slate-900 focus:ring-1 focus:ring-indigo-500"
                                                    step="0.01"
                                                    readOnly={isEditMode && !permissions.update}
                                                />
                                            </td>
                                            <td className="p-3 text-end font-medium text-slate-700 font-mono">{((item.quantity || 0) * (item.price || 0)).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 mt-1 bg-green-50 rounded-lg flex justify-end items-center border border-green-200">
                          <span className="font-bold text-lg text-green-800">{t.purchaseOrders.totalAmount}: </span>
                          <span className="font-bold text-lg text-green-800 ml-2 font-mono">{totalData.totalAmount.toFixed(2)} {request.currency}</span>
                        </div>
                    </div>
                )}

                {/* Buttons */}
                <div className="flex justify-start gap-3 pt-5 mt-5 border-t border-slate-200">
                    <button onClick={handleSubmit} disabled={!selectedSupplierId || (isEditMode ? !permissions.update : !permissions.create)} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors">
                        {isEditMode ? t.common.save : t.purchaseOrders.createOrder}
                    </button>
                     <button onClick={onClose} className="px-6 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 transition-colors">{t.common.cancel}</button>
                </div>
            </div>
        </Modal>
    )
}


const PurchaseOrdersPage: React.FC<PurchaseOrdersPageProps> = ({ purchaseOrders, setPurchaseOrders, purchaseRequests, setPurchaseRequests, suppliers, items, projects, supplierQuotations, setContracts, permissions, logActivity, organizationInfo }) => {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const [modalState, setModalState] = useState<{isOpen: boolean; request: PurchaseRequest | null}>({isOpen: false, request: null});
  const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);
  const [printModalState, setPrintModalState] = useState<{isOpen: boolean; po: PurchaseOrder | null;}>({ isOpen: false, po: null });
  
  const [statusFilter, setStatusFilter] = useState<'ALL' | PurchaseRequestStatus>('ALL');
  const [projectFilter, setProjectFilter] = useState<string>('ALL');
  const [requestFilter, setRequestFilter] = useState<string>('ALL');

  const availableProjects = useMemo(() => {
    const projectIdsInRequests = new Set(purchaseRequests.map(pr => pr.projectId));
    return projects.filter(p => projectIdsInRequests.has(p.id));
  }, [purchaseRequests, projects]);

  const availableRequests = useMemo(() => {
    if (projectFilter === 'ALL') {
      return purchaseRequests;
    }
    return purchaseRequests.filter(pr => pr.projectId === projectFilter);
  }, [purchaseRequests, projectFilter]);

  useEffect(() => {
    setRequestFilter('ALL');
  }, [projectFilter]);

  const filteredRequests = useMemo(() => {
    return purchaseRequests
      .filter(pr => pr.status === PurchaseRequestStatus.APPROVED || pr.status === PurchaseRequestStatus.AWARDED) // Only show awardable requests
      .filter(pr => statusFilter === 'ALL' || pr.status === statusFilter)
      .filter(pr => projectFilter === 'ALL' || pr.projectId === projectFilter)
      .filter(pr => requestFilter === 'ALL' || pr.id === requestFilter);
  }, [purchaseRequests, statusFilter, projectFilter, requestFilter]);


  const handleOpenCreateModal = (request: PurchaseRequest) => {
    setEditingPO(null);
    setModalState({isOpen: true, request});
  };
  
  const handleCloseModal = () => {
    setModalState({isOpen: false, request: null});
    setEditingPO(null);
  };

  const handlePOCreate = (newPO: PurchaseOrder) => {
      setPurchaseOrders(prev => [newPO, ...prev]);
      
      setPurchaseRequests(prev => prev.map(pr => 
        pr.id === newPO.purchaseRequestId && pr.status === PurchaseRequestStatus.APPROVED 
            ? { ...pr, status: PurchaseRequestStatus.AWARDED } 
            : pr
      ));

      logActivity({ actionType: 'create', entityType: 'PurchaseOrder', entityName: newPO.poNumber });
      handleCloseModal();
      showToast(t.purchaseOrders.poCreatedSuccess, 'success');
  };

  const handlePOUpdate = (updatedPO: PurchaseOrder) => {
      setPurchaseOrders(prev => prev.map(po => po.id === updatedPO.id ? updatedPO : po));
      logActivity({ actionType: 'update', entityType: 'PurchaseOrder', entityName: updatedPO.poNumber });
      handleCloseModal();
      showToast(t.purchaseOrders.poUpdatedSuccess, 'success');
  };
  
  const handlePODelete = (poId: string) => {
    const poToDelete = purchaseOrders.find(po => po.id === poId);
    if (poToDelete) {
      logActivity({ actionType: 'delete', entityType: 'PurchaseOrder', entityName: poToDelete.poNumber });
    }
    setPurchaseOrders(prev => prev.filter(po => po.id !== poId));
    showToast(t.common.deletedSuccess, 'success');
  };
  
  const handleOpenEditModal = (po: PurchaseOrder) => {
      const request = purchaseRequests.find(pr => pr.id === po.purchaseRequestId);
      if (request) {
          setEditingPO(po);
          setModalState({isOpen: true, request});
      }
  };

  const handlePrintPO = (po: PurchaseOrder) => {
    setPrintModalState({ isOpen: true, po: po });
  };

  const handleResetFilters = () => {
    setStatusFilter('ALL');
    setProjectFilter('ALL');
    setRequestFilter('ALL');
  };
  
  const requestForModal = modalState.request;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{t.purchaseOrders.title}</h1>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4 pb-3 border-b">{t.purchaseOrders.listTitle}</h2>
        
        {/* Filters */}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="text-sm font-medium text-slate-600 block mb-1">{t.purchaseOrders.filterByStatus}</label>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-slate-900">
                        <option value="ALL">{t.purchaseOrders.all}</option>
                        <option value={PurchaseRequestStatus.APPROVED}>{t.purchaseRequests.status.APPROVED}</option>
                        <option value={PurchaseRequestStatus.AWARDED}>{t.purchaseRequests.status.AWARDED}</option>
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-600 block mb-1">{t.purchaseOrders.filterByProject}</label>
                    <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-slate-900">
                        <option value="ALL">{t.purchaseOrders.all}</option>
                        {availableProjects.map(p => <option key={p.id} value={p.id}>{language === 'ar' ? p.nameAr : p.nameEn}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-600 block mb-1">{t.purchaseOrders.filterByRequest}</label>
                    <select value={requestFilter} onChange={e => setRequestFilter(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-slate-900" disabled={projectFilter === 'ALL' && statusFilter === 'ALL'}>
                        <option value="ALL">{t.purchaseOrders.all}</option>
                        {availableRequests.map(pr => <option key={pr.id} value={pr.id}>{pr.nameAr || pr.nameEn}</option>)}
                    </select>
                </div>
            </div>
        </div>

        <div className="space-y-4">
            {filteredRequests.map(pr => {
                const linkedPOs = purchaseOrders.filter(po => po.purchaseRequestId === pr.id);
                const hasPOs = linkedPOs.length > 0;

                return (
                    <div key={pr.id} className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
                        <div className="flex flex-wrap justify-between items-center gap-4">
                            <div>
                                <h3 className="font-bold text-indigo-700">{pr.nameAr}</h3>
                                <p className="text-sm text-slate-500">{pr.requestCode} - {pr.requestDate}</p>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <RequestStatusBadge status={pr.status} />
                                {(pr.status === PurchaseRequestStatus.APPROVED || pr.status === PurchaseRequestStatus.AWARDED) && (
                                     <button 
                                        onClick={() => handleOpenCreateModal(pr)}
                                        className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-300"
                                        disabled={!permissions.create}
                                    >
                                        <PlusIcon className="w-4 h-4" />
                                        {t.purchaseOrders.createPOForRequest}
                                    </button>
                                )}
                            </div>
                        </div>
                        {hasPOs && (
                             <div className="mt-4 pt-4 border-t border-slate-200">
                                <h4 className="font-semibold text-sm text-slate-600 mb-2">{t.purchaseOrders.existingPOs}:</h4>
                                <div className="space-y-2">
                                    {linkedPOs.map(po => {
                                        const supplier = suppliers.find(s => s.id === po.supplierId);
                                        return (
                                            <div key={po.id} className="flex flex-col md:grid md:grid-cols-[1fr_1.5fr_1fr_auto] gap-2 md:gap-4 items-start md:items-center p-3 bg-white rounded border border-slate-200">
                                                <p className="text-sm font-medium text-slate-700"><span className="md:hidden font-semibold">PO #: </span>{po.poNumber}</p>
                                                <p className="text-sm text-slate-600"><span className="md:hidden font-semibold">Supplier: </span>{supplier ? (language === 'ar' ? supplier.nameAr : supplier.nameEn) : '...'}</p>
                                                <p className="text-sm font-semibold text-slate-800 md:text-left"><span className="md:hidden font-semibold">Total: </span>{po.totalAmount.toFixed(2)} {pr.currency}</p>
                                                <div className="flex items-center gap-2 self-end md:self-center">
                                                    <button onClick={() => handleOpenEditModal(po)} className="text-slate-500 hover:text-blue-600 disabled:text-slate-300" title={t.purchaseOrders.editPO} disabled={!permissions.update}><PencilIcon /></button>
                                                    <button onClick={() => handlePODelete(po.id)} className="text-slate-500 hover:text-red-600 disabled:text-slate-300" title={t.purchaseOrders.deletePO} disabled={!permissions.delete}><TrashIcon /></button>
                                                    <button onClick={() => handlePrintPO(po)} className="text-slate-500 hover:text-gray-700" title={t.purchaseOrders.printPO}><PrinterIcon /></button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )
            })}
             {filteredRequests.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                    <p>{t.purchaseOrders.noPurchaseRequests}</p>
                </div>
            )}
        </div>
      </div>
      
      {requestForModal && (
        <POModal 
            isOpen={modalState.isOpen}
            onClose={handleCloseModal}
            request={requestForModal}
            poToEdit={editingPO}
            suppliers={suppliers}
            items={items}
            quotations={supplierQuotations.filter(q => q.purchaseRequestId === requestForModal.id)}
            onPOCreate={handlePOCreate}
            onPOUpdate={handlePOUpdate}
            permissions={permissions}
        />
      )}
      {printModalState.isOpen && printModalState.po && (
        <Modal
            isOpen={printModalState.isOpen}
            onClose={() => setPrintModalState({ isOpen: false, po: null })}
            title={`${t.purchaseOrderPrintable.title} - ${printModalState.po.poNumber}`}
            size="max-w-4xl"
        >
            <PrintablePurchaseOrder
                purchaseOrder={printModalState.po}
                request={purchaseRequests.find(pr => pr.id === printModalState.po!.purchaseRequestId)!}
                project={projects.find(p => p.id === purchaseRequests.find(pr => pr.id === printModalState.po!.purchaseRequestId)?.projectId)!}
                supplier={suppliers.find(s => s.id === printModalState.po!.supplierId)!}
                items={items}
                organizationInfo={organizationInfo}
            />
        </Modal>
      )}
    </div>
  );
};

export default PurchaseOrdersPage;
