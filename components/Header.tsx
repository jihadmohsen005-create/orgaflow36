import React, { useState, useEffect } from 'react';
import { Page, User, RolePermissions } from '../types';
import { 
    DashboardIcon, SuppliersIcon, ItemsIcon, PurchaseOrderIcon, ContractsIcon, PurchaseRequestIcon, 
    ProjectIcon, UsersIcon, LogoutIcon, ActivityLogIcon, BuildingOfficeIcon, ApprovalIcon,
    FinanceIcon, WarehouseIcon, ArchiveIcon, SettingsIcon, ChevronDownIcon, BoardOfDirectorsIcon,
    BoardMembersIcon,
    BoardMeetingsIcon,
    HumanResourcesIcon,
    SearchIcon,
    DonorIcon,
    ProcurementPlanIcon,
    ProcurementTrackingIcon,
    OrgaFlowLogo,
    PoliciesIcon,
    FleetIcon,
    CubeIcon as FuelIcon,
    EnvelopeIcon,
    BackupIcon,
    ShelfIcon,
    DocumentTextIcon,
    BriefcaseIcon,
    ChartBarIcon,
    CurrencyEuroIcon,
    ClipboardDocumentCheckIcon
} from './icons';
import { useTranslation } from '../LanguageContext';

interface HeaderProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  onLogout: () => void;
  currentUser: User;
  permissions: RolePermissions;
}

interface NavItemProps {
  page: Page;
  label: string;
  icon: React.ReactNode;
  activePage: Page;
  onClick: () => void;
  isSubItem?: boolean;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ page, label, icon, activePage, onClick, isSubItem = false, isActive }) => {
    const { language } = useTranslation();
    return (
        <li
            className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors duration-200 ${
                isActive
                    ? 'bg-indigo-700 text-white shadow-inner'
                    : `text-gray-300 hover:bg-slate-800 hover:text-white ${isSubItem ? 'bg-slate-800/50' : ''}`
            }`}
            style={{ paddingRight: language === 'ar' && isSubItem ? '2.5rem' : undefined, paddingLeft: language !== 'ar' && isSubItem ? '2.5rem' : undefined }}
            onClick={onClick}
        >
            {icon}
            <span className={`${language === 'ar' ? 'mr-4' : 'ml-4'} font-medium ${isSubItem ? 'text-sm' : 'text-lg'}`}>{label}</span>
        </li>
    );
};

type NavSubItem = { page: Page; label: string; icon: React.ReactNode; };


interface NavGroup {
  id: string;
  label: string;
  icon: React.ReactNode;
  subItems: NavSubItem[];
}


const Header: React.FC<HeaderProps> = ({ activePage, setActivePage, onLogout, currentUser, permissions }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, toggleLanguage, t } = useTranslation();

  const allNavGroups: NavGroup[] = [
    {
        id: 'administrative',
        label: t.nav.administrative,
        icon: <BuildingOfficeIcon className="w-5 h-5" />,
        subItems: [
            { page: 'organization', label: t.nav.organization, icon: <BuildingOfficeIcon className="w-5 h-5" /> },
            { page: 'departments', label: t.nav.departments, icon: <BuildingOfficeIcon className="w-5 h-5" /> },
            { page: 'policiesAndManuals', label: t.nav.policiesAndManuals, icon: <PoliciesIcon className="w-5 h-5" /> },
            { page: 'projects', label: t.nav.projects, icon: <ProjectIcon className="w-5 h-5" /> },
            { page: 'donors', label: t.nav.donors, icon: <DonorIcon className="w-5 h-5" /> },
            { page: 'correspondence', label: t.nav.correspondence, icon: <EnvelopeIcon className="w-5 h-5" /> },
        ]
    },
    {
        id: 'boardAffairs',
        label: t.nav.boardAffairs,
        icon: <BoardOfDirectorsIcon className="w-5 h-5" />,
        subItems: [
            { page: 'boardMembers', label: t.nav.boardMembers, icon: <BoardMembersIcon className="w-5 h-5" /> },
            { page: 'boardOfDirectors', label: t.nav.boardOfDirectors, icon: <BoardOfDirectorsIcon className="w-5 h-5" /> },
            { page: 'boardMeetings', label: t.nav.boardMeetings, icon: <BoardMeetingsIcon className="w-5 h-5" /> },
            { page: 'meetingSearch', label: t.nav.meetingSearch, icon: <SearchIcon className="w-5 h-5" /> },
        ]
    },
    {
        id: 'humanResources',
        label: t.nav.humanResources,
        icon: <HumanResourcesIcon className="w-5 h-5" />,
        subItems: [
            { page: 'employees', label: t.nav.employees, icon: <UsersIcon className="w-5 h-5" /> },
        ]
    },
    {
        id: 'finance',
        label: t.nav.finance,
        icon: <FinanceIcon className="w-5 h-5" />,
        subItems: [
            { page: 'financialDashboard', label: t.nav.financialDashboard, icon: <ChartBarIcon className="w-5 h-5" /> },
            { page: 'exchangeRates', label: t.nav.exchangeRates, icon: <CurrencyEuroIcon className="w-5 h-5" /> },
            { page: 'bankAccounts', label: t.nav.bankAccounts, icon: <BuildingOfficeIcon className="w-5 h-5" /> },
            { page: 'revenues', label: t.nav.revenues, icon: <FinanceIcon className="w-5 h-5" /> },
            { page: 'projectBudgets', label: t.nav.projectBudgets, icon: <FinanceIcon className="w-5 h-5" /> },
            { page: 'expenditures', label: t.nav.expenditures, icon: <FinanceIcon className="w-5 h-5" /> },
            { page: 'budgetForecast', label: t.nav.budgetForecast, icon: <FinanceIcon className="w-5 h-5" /> },
            { page: 'monthlyForecastReview', label: t.nav.monthlyForecastReview, icon: <FinanceIcon className="w-5 h-5" /> },
        ]
    },
    {
        id: 'procurement',
        label: t.nav.procurement,
        icon: <PurchaseRequestIcon className="w-5 h-5" />,
        subItems: [
            { page: 'suppliers', label: t.nav.suppliers, icon: <SuppliersIcon className="w-5 h-5" /> },
            { page: 'items', label: t.nav.items, icon: <ItemsIcon className="w-5 h-5" /> },
            { page: 'procurementPlans', label: t.nav.procurementPlans, icon: <ProcurementPlanIcon className="w-5 h-5" /> },
            { page: 'procurementTracking', label: t.nav.procurementTracking, icon: <ProcurementTrackingIcon className="w-5 h-5" /> },
            { page: 'purchaseRequests', label: t.nav.purchaseRequests, icon: <PurchaseRequestIcon className="w-5 h-5" /> },
            { page: 'approvals', label: t.nav.approvals, icon: <ApprovalIcon className="w-5 h-5" /> },
            { page: 'purchaseOrders', label: t.nav.purchaseOrders, icon: <PurchaseOrderIcon className="w-5 h-5" /> },
            { page: 'contracts', label: t.nav.contracts, icon: <ContractsIcon className="w-5 h-5" /> },
        ]
    },
    {
        id: 'logistics',
        label: t.nav.logistics,
        icon: <FleetIcon className="w-5 h-5" />,
        subItems: [
            { page: 'fuel', label: t.nav.fuel, icon: <FuelIcon className="w-5 h-5" /> },
            { page: 'fleet', label: t.nav.fleet, icon: <FleetIcon className="w-5 h-5" /> },
            { page: 'workers', label: t.nav.workers, icon: <UsersIcon className="w-5 h-5" /> },
            { page: 'warehouses', label: t.nav.warehouses, icon: <WarehouseIcon className="w-5 h-5" /> },
            { page: 'assets', label: t.nav.assets, icon: <BriefcaseIcon className="w-5 h-5" /> },
        ]
    },
    {
        id: 'archive',
        label: t.nav.archive,
        icon: <ArchiveIcon className="w-5 h-5" />,
        subItems: [
            { page: 'transactionTracking', label: t.nav.transactionTracking, icon: <ClipboardDocumentCheckIcon className="w-5 h-5" /> },
            { page: 'archiveLocations', label: t.nav.archiveLocations, icon: <ShelfIcon className="w-5 h-5" /> },
            { page: 'archiveClassifications', label: t.nav.archiveClassifications, icon: <ArchiveIcon className="w-5 h-5" /> },
            { page: 'documents', label: t.nav.documents, icon: <DocumentTextIcon className="w-5 h-5" /> },
        ]
    },
    {
        id: 'settings',
        label: t.nav.settings,
        icon: <SettingsIcon className="w-5 h-5" />,
        subItems: [
            { page: 'users', label: t.nav.users, icon: <UsersIcon className="w-5 h-5" /> },
            { page: 'activityLog', label: t.nav.activityLog, icon: <ActivityLogIcon className="w-5 h-5" /> },
            { page: 'backup', label: t.nav.backup, icon: <BackupIcon className="w-5 h-5" /> },
        ]
    }
  ];

  const getInitialOpenGroup = () => {
    const activeGroup = allNavGroups.find(group => group.subItems.some(item => item.page === activePage));
    return activeGroup ? activeGroup.id : null;
  };
  
  const [openGroup, setOpenGroup] = useState<string | null>(getInitialOpenGroup);
  
  useEffect(() => {
    setOpenGroup(getInitialOpenGroup());
  }, [activePage]);

  const handleNavClick = (page: Page) => {
    setActivePage(page);
    setIsMenuOpen(false);
  };
  
  const handleGroupClick = (groupId: string) => {
    setOpenGroup(prev => (prev === groupId ? null : groupId));
  };
  
  const LanguageSwitcher: React.FC = () => (
    <div className="flex items-center gap-1">
        <button onClick={() => {if(language !== 'en') toggleLanguage()}} className={`px-2 py-1 rounded text-sm font-bold ${
            (language === 'en' ? 'text-white bg-slate-800' : 'text-gray-400 hover:text-white')
        }`}>EN</button>
        <span className={"text-slate-600"}>|</span>
        <button onClick={() => {if(language !== 'ar') toggleLanguage()}} className={`px-2 py-1 rounded text-sm font-bold ${
             (language === 'ar' ? 'text-white bg-slate-800' : 'text-gray-400 hover:text-white')
        }`}>AR</button>
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden flex justify-between items-center p-4 bg-slate-900 shadow-md w-full sticky top-0 z-30">
        <div className="flex items-center">
            <OrgaFlowLogo className="w-8 h-8" />
            <h1 className={`text-xl font-extrabold text-white ${language === 'ar' ? 'mr-2' : 'ml-2'}`}>{t.appName}</h1>
        </div>
        <div className="flex items-center gap-4">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
        </div>
      </header>

      {/* Sidebar Overlay for Mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}
        onClick={() => setIsMenuOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside className={`fixed md:relative top-0 ${language === 'ar' ? 'right-0' : 'left-0'} h-full md:h-auto z-40 bg-slate-900 text-white w-72 md:w-64 flex-shrink-0 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : (language === 'ar' ? 'translate-x-full' : '-translate-x-full')} md:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="p-4 flex items-center justify-between border-b border-slate-700">
            <div className="flex items-center">
              <OrgaFlowLogo className="w-8 h-8" />
              <h1 className={`text-xl font-extrabold text-white ${language === 'ar' ? 'mr-3' : 'ml-3'}`}>{t.appName}</h1>
            </div>
            <button onClick={() => setIsMenuOpen(false)} className="md:hidden text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <nav className="flex-grow p-4 overflow-y-auto">
            <ul>
                {permissions.dashboard.read && <NavItem page="dashboard" label={t.nav.dashboard} icon={<DashboardIcon />} activePage={activePage} onClick={() => handleNavClick('dashboard')} isActive={activePage === 'dashboard'} />}
                {allNavGroups.map(group => {
                    const visibleSubItems = group.subItems.filter(item => permissions[item.page]?.read);
                    if (visibleSubItems.length === 0) return null;
                    
                    return (
                        <li key={group.id}>
                            <div className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors duration-200 text-gray-300 hover:bg-slate-800 hover:text-white`} onClick={() => handleGroupClick(group.id)}>
                                {group.icon}
                                <span className={`${language === 'ar' ? 'mr-4' : 'ml-4'} font-medium text-lg flex-grow`}>{group.label}</span>
                                <ChevronDownIcon className={`w-5 h-5 transition-transform ${openGroup === group.id ? 'rotate-180' : ''}`} />
                            </div>
                            {openGroup === group.id && (
                                <ul className="mt-1">
                                    {visibleSubItems.map(item => (
                                        <NavItem key={item.page} {...item} activePage={activePage} onClick={() => handleNavClick(item.page)} isSubItem isActive={activePage === item.page} />
                                    ))}
                                </ul>
                            )}
                        </li>
                    )
                })}
            </ul>
          </nav>
          <div className="p-4 border-t border-slate-700 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                    <p className="font-semibold">{currentUser.name}</p>
                </div>
                <LanguageSwitcher />
              </div>
              <button onClick={onLogout} className="w-full flex items-center justify-center gap-3 p-3 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/40 hover:text-red-300 transition-colors">
                  <LogoutIcon className="w-5 h-5" />
                  <span className="font-bold">{t.nav.logout}</span>
              </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Header;