import React, { useState } from 'react';
import { SuppliersIcon, ItemsIcon, PurchaseOrderIcon, ContractsIcon, ProjectIcon, PurchaseRequestIcon, PlusIcon, ShareIcon } from '../components/icons';
import { useTranslation } from '../LanguageContext';
import { Project, PurchaseRequest, Page, PurchaseRequestStatus, OrganizationInfo } from '../types';
import Modal from '../components/Modal';
import ShareableDashboard from '../components/ShareableDashboard';

interface DashboardProps {
    suppliersCount: number;
    itemsCount: number;
    poCount: number;
    contractsCount: number;
    projects: Project[];
    purchaseRequests: PurchaseRequest[];
    setActivePage: (page: Page) => void;
    organizationInfo: OrganizationInfo;
}

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactElement<{ className?: string }>; iconBgColor: string, iconTextColor: string }> = ({ title, value, icon, iconBgColor, iconTextColor }) => {
    const { language } = useTranslation();
    return (
        <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200 flex items-center justify-between transition-all hover:shadow-md hover:-translate-y-1">
            <div className={language === 'ar' ? "text-right" : "text-left"}>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <p className="text-3xl font-bold text-slate-800">{value}</p>
            </div>
             <div className={`p-3 rounded-lg ${iconBgColor}`}>
                {React.cloneElement(icon, { className: `w-7 h-7 ${iconTextColor}` })}
            </div>
        </div>
    );
};

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
  return <span className={`px-3 py-1 text-xs font-medium rounded-full ${colorClasses[status]}`}>{statusText}</span>;
};

interface InteractiveCardProps {
    title: string;
    icon: React.ReactNode;
    items: any[];
    renderItem: (item: any) => React.ReactNode;
    viewAllAction: () => void;
    addAction: () => void;
    viewAllText: string;
    addText: string;
    noItemsText: string;
}

const InteractiveCard: React.FC<InteractiveCardProps> = ({ title, icon, items, renderItem, viewAllAction, addAction, viewAllText, addText, noItemsText }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
            <div className="bg-slate-100 p-2 rounded-lg">
                {icon}
            </div>
            <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        </div>
        <div className="flex-grow space-y-2 mb-4">
            {items.length > 0 ? items.map(renderItem) : (
                <p className="text-slate-500 text-center py-4">{noItemsText}</p>
            )}
        </div>
        <div className="mt-auto pt-4 border-t border-slate-200 flex justify-between items-center gap-2">
            <button onClick={viewAllAction} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                {viewAllText}
            </button>
            <button onClick={addAction} className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold py-2 px-3 rounded-lg hover:bg-indigo-700 transition-colors">
                <PlusIcon className="w-4 h-4" />
                {addText}
            </button>
        </div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ suppliersCount, itemsCount, poCount, contractsCount, projects, purchaseRequests, setActivePage, organizationInfo }) => {
  const { t, language } = useTranslation();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .slice(0, 3);

  const recentPurchaseRequests = [...purchaseRequests]
    .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())
    .slice(0, 3);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">{t.dashboard.title}</h1>
        <button 
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-2 bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors shadow-sm">
            <ShareIcon />
            {t.dashboard.shareWithFunders}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title={t.dashboard.totalSuppliers} value={suppliersCount} icon={<SuppliersIcon />} iconBgColor="bg-indigo-100" iconTextColor="text-indigo-600" />
          <StatCard title={t.dashboard.totalItems} value={itemsCount} icon={<ItemsIcon />} iconBgColor="bg-teal-100" iconTextColor="text-teal-600" />
          <StatCard title={t.dashboard.purchaseOrders} value={poCount} icon={<PurchaseOrderIcon />} iconBgColor="bg-amber-100" iconTextColor="text-amber-600" />
          <StatCard title={t.dashboard.activeContracts} value={contractsCount} icon={<ContractsIcon />} iconBgColor="bg-sky-100" iconTextColor="text-sky-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
        <InteractiveCard
            title={t.nav.projects}
            icon={<ProjectIcon className="w-6 h-6 text-slate-600"/>}
            items={recentProjects}
            renderItem={(project: Project) => (
                <div key={project.id} className="bg-slate-50 p-2 rounded-md text-sm">
                    <p className="font-semibold text-slate-700 truncate">{language === 'ar' ? project.nameAr : project.nameEn}</p>
                </div>
            )}
            viewAllAction={() => setActivePage('projects')}
            addAction={() => setActivePage('projects')}
            viewAllText={t.nav.projects}
            addText={t.projects.newProject}
            noItemsText={t.dashboard.noRecentProjects}
        />

        <InteractiveCard
            title={t.nav.purchaseRequests}
            icon={<PurchaseRequestIcon className="w-6 h-6 text-slate-600"/>}
            items={recentPurchaseRequests}
            renderItem={(pr: PurchaseRequest) => (
                <div key={pr.id} className="bg-slate-50 p-2 rounded-md text-sm flex justify-between items-center">
                    <p className="font-semibold text-slate-700 truncate">{language === 'ar' ? pr.nameAr : pr.nameEn}</p>
                    <RequestStatusBadge status={pr.status} />
                </div>
            )}
            viewAllAction={() => setActivePage('purchaseRequests')}
            addAction={() => setActivePage('purchaseRequests')}
            viewAllText={t.nav.purchaseRequests}
            addText={t.common.new}
            noItemsText={t.dashboard.noRecentRequests}
        />
      </div>

      <div className="mt-10 bg-white p-8 rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">{t.dashboard.welcomeTitle}</h2>
        <p className="text-slate-600 leading-relaxed">
          {t.dashboard.welcomeMessage}
        </p>
      </div>
      
      <Modal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} title={t.dashboard.shareTitle} size="max-w-5xl">
        <ShareableDashboard
          organizationInfo={organizationInfo}
          suppliersCount={suppliersCount}
          itemsCount={itemsCount}
          projects={projects}
          purchaseRequests={purchaseRequests}
        />
      </Modal>
    </div>
  );
};

export default Dashboard;