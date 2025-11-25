import React, { useState } from 'react';
import { PurchaseRequest, User, Item, Project, Supplier, Role, PurchaseRequestStatus, ApprovalStatus, OrganizationInfo } from '../types';
import { useTranslation } from '../LanguageContext';
import { useToast } from '../ToastContext';
import Modal from '../components/Modal';
import PrintableRequest from '../components/PrintableRequest';
import { PrinterIcon } from '../components/icons';

interface ApprovalsPageProps {
    purchaseRequests: PurchaseRequest[];
    setPurchaseRequests: React.Dispatch<React.SetStateAction<PurchaseRequest[]>>;
    currentUser: User;
    items: Item[];
    projects: Project[];
    suppliers: Supplier[];
    roles: Role[];
    organizationInfo: OrganizationInfo;
    logActivity: (args: { actionType: 'create' | 'update' | 'delete'; entityType: string; entityName: string; }) => void;
}

const StatusBadge: React.FC<{ status: PurchaseRequestStatus }> = ({ status }) => {
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


const ApprovalsPage: React.FC<ApprovalsPageProps> = ({ purchaseRequests, setPurchaseRequests, currentUser, items, projects, suppliers, roles, organizationInfo, logActivity }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'myRequests' | 'pendingApproval'>('myRequests');
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
    const { showToast } = useToast();

    const myRequests = purchaseRequests.filter(pr => pr.requesterName === currentUser.name);
    
    const pendingMyApproval = purchaseRequests.filter(pr => {
        if (pr.status !== PurchaseRequestStatus.PENDING_APPROVAL) return false;
        const currentStepIndex = pr.approvals.findIndex(a => a.status === ApprovalStatus.PENDING);
        if (currentStepIndex === -1) return false;
        return pr.approvals[currentStepIndex].roleId === currentUser.roleId;
    });
    
    const handleViewAndPrint = (request: PurchaseRequest) => {
        setSelectedRequest(request);
        setIsPrintModalOpen(true);
    };

    const handleApprove = (request: PurchaseRequest) => {
        const currentStepIndex = request.approvals.findIndex(a => a.status === ApprovalStatus.PENDING);
        if (currentStepIndex === -1) return;

        const newApprovals = [...request.approvals];
        newApprovals[currentStepIndex] = {
            ...newApprovals[currentStepIndex],
            status: ApprovalStatus.APPROVED,
            userId: currentUser.id,
            userName: currentUser.name,
            date: new Date().toISOString().split('T')[0],
        };
        const isLastApproval = currentStepIndex === newApprovals.length - 1;
        const newStatus = isLastApproval ? PurchaseRequestStatus.APPROVED : request.status;
        const updatedRequest = { ...request, approvals: newApprovals, status: newStatus };

        setPurchaseRequests(prev => prev.map(pr => pr.id === request.id ? updatedRequest : pr));
        logActivity({ actionType: 'update', entityType: 'PurchaseRequestApproval', entityName: `Approved: ${request.nameEn}` });
        showToast(t.approvalsPage.requestApproved, 'success');
    };

    const handleReject = (request: PurchaseRequest) => {
        const reason = prompt(t.purchaseRequests.approvals.rejectionComments);
        if (reason === null || reason.trim() === '') return;

        const currentStepIndex = request.approvals.findIndex(a => a.status === ApprovalStatus.PENDING);
        if (currentStepIndex === -1) return;

        const newApprovals = [...request.approvals];
        newApprovals[currentStepIndex] = {
            ...newApprovals[currentStepIndex],
            status: ApprovalStatus.REJECTED,
            userId: currentUser.id,
            userName: currentUser.name,
            date: new Date().toISOString().split('T')[0],
            comments: reason,
        };

        const updatedRequest = { ...request, approvals: newApprovals, status: PurchaseRequestStatus.REJECTED };
        setPurchaseRequests(prev => prev.map(pr => pr.id === request.id ? updatedRequest : pr));
        logActivity({ actionType: 'update', entityType: 'PurchaseRequestApproval', entityName: `Rejected: ${request.nameEn}` });
        showToast(t.approvalsPage.requestRejected, 'error');
    };

    const RequestCard: React.FC<{request: PurchaseRequest, children?: React.ReactNode}> = ({ request, children }) => (
        <div className="bg-white p-4 rounded-lg shadow-md border border-slate-200">
            <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                    <h3 className="text-lg font-bold text-indigo-800">{request.nameAr}</h3>
                    <p className="text-slate-600 text-sm">{request.requestCode}</p>
                    <p className="text-slate-500 text-xs">{request.requestDate}</p>
                </div>
                <div className="flex items-center gap-4">
                    <StatusBadge status={request.status} />
                    {children}
                </div>
            </div>
        </div>
    );

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-6">{t.approvalsPage.title}</h1>
            <div className="border-b border-slate-200 mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button onClick={() => setActiveTab('myRequests')} className={`${activeTab === 'myRequests' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-700 hover:text-slate-800 hover:border-slate-400'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>{t.approvalsPage.tabs.myRequests}</button>
                    <button onClick={() => setActiveTab('pendingApproval')} className={`${activeTab === 'pendingApproval' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-700 hover:text-slate-800 hover:border-slate-400'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>{t.approvalsPage.tabs.pendingMyApproval}</button>
                </nav>
            </div>
            
            {activeTab === 'myRequests' && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-800">{t.approvalsPage.myRequestsTitle}</h2>
                    {myRequests.length > 0 ? myRequests.map(pr => (
                        <RequestCard key={pr.id} request={pr}>
                            <button onClick={() => handleViewAndPrint(pr)} disabled={pr.status !== PurchaseRequestStatus.APPROVED && pr.status !== PurchaseRequestStatus.AWARDED} className="bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors disabled:bg-slate-300 flex items-center gap-2">
                                <PrinterIcon />
                                {t.approvalsPage.viewAndPrint}
                            </button>
                        </RequestCard>
                    )) : <p className="text-center text-slate-500 py-8">{t.approvalsPage.noMyRequests}</p>}
                </div>
            )}

            {activeTab === 'pendingApproval' && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-800">{t.approvalsPage.pendingMyApprovalTitle}</h2>
                    {pendingMyApproval.length > 0 ? pendingMyApproval.map(pr => (
                        <RequestCard key={pr.id} request={pr}>
                            <button onClick={() => handleViewAndPrint(pr)} className="bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300">{t.approvalsPage.viewDetails}</button>
                            <button onClick={() => handleReject(pr)} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700">{t.approvalsPage.reject}</button>
                            <button onClick={() => handleApprove(pr)} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700">{t.approvalsPage.approve}</button>
                        </RequestCard>
                    )) : <p className="text-center text-slate-500 py-8">{t.approvalsPage.noPendingApprovals}</p>}
                </div>
            )}
            
            {selectedRequest && <Modal isOpen={isPrintModalOpen} onClose={() => setIsPrintModalOpen(false)} title={t.approvalsPage.requestDetails} size="max-w-4xl">
                <PrintableRequest 
                    request={selectedRequest}
                    items={items}
                    project={projects.find(p => p.id === selectedRequest.projectId)}
                    organizationInfo={organizationInfo}
                    roles={roles}
                />
            </Modal>}
        </div>
    );
};

export default ApprovalsPage;
