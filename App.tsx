

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    Page, Supplier, Item, PurchaseOrder, Contract, ItemCategory, Project, PurchaseRequest, 
    SupplierQuotation, ContractAmendment, User, Role, RolePermissions, ActivityLog, 
    OrganizationInfo, BoardSession, Employee, MasterBoardMember, BoardMeeting, Donor, 
    SupplierType, BusinessType, ProcurementPlan, PolicyManual, FuelType, Warehouse, 
    FuelOpeningBalance, FuelSupplier, FuelSupply, FuelTransfer, FuelDisbursement, Worker, 
    WorkerTransaction, Driver, FleetTrip, WarehouseEntity, WarehouseItem, WarehouseInvoice, 
    WarehouseItemOpeningBalance, WarehouseStockTransfer, PaymentMethod, FuelRecipientType, 
    Correspondence, BackupSettings, Department, ArchiveLocation, ArchiveClassification, 
    DocumentType, PhysicalDocument, WorkType, AssetCategory, Asset, AssetCustody, AssetLocation,
    ProjectBudget, Expenditure, POStatus, PurchaseRequestMethod, PurchaseRequestStatus, ApprovalStatus, Bank,
    PurchaseMethod, ExchangeRate, Transaction, TransactionMovement
} from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import SuppliersPage from './pages/SuppliersPage';
import ItemsPage from './pages/ItemsPage';
import PurchaseOrdersPage from './pages/PurchaseOrdersPage';
import ContractsPage from './pages/ContractsPage';
import PurchaseRequestsPage from './pages/PurchaseRequestsPage';
import ProjectsPage from './pages/ProjectsPage';
import UsersPage from './pages/UsersPage';
import ActivityLogPage from './pages/ActivityLogPage';
import OrganizationPage from './pages/OrganizationPage';
import ApprovalsPage from './pages/ApprovalsPage';
import BoardOfDirectorsPage from './pages/BoardOfDirectorsPage';
import EmployeesPage from './pages/EmployeesPage';
import BoardMembersPage from './pages/BoardMembersPage';
import BoardMeetingsPage from './pages/BoardMeetingsPage';
import MeetingSearchPage from './pages/MeetingSearchPage';
import DonorsPage from './pages/DonorsPage';
import ProcurementPlanPage from './pages/ProcurementPlanPage';
import ProcurementTrackingPage from './pages/ProcurementTrackingPage';
import PoliciesAndManualsPage from './pages/PoliciesAndManualsPage';
import CorrespondencePage from './pages/CorrespondencePage';
import BackupPage from './pages/BackupPage';
import DepartmentsPage from './pages/DepartmentsPage';
import ArchiveLocationsPage from './pages/archive/ArchiveLocationsPage';
import ArchiveClassificationsPage from './pages/archive/ArchiveClassificationsPage';
import DocumentsPage from './pages/archive/DocumentsPage';
import FuelPage from './pages/operations/FuelPage';
import FleetPage from './pages/operations/FleetPage';
import WorkersPage from './pages/operations/WorkersPage';
import WarehousePage from './pages/operations/WarehousePage';
import AssetsPage from './pages/AssetsPage';
import ProjectBudgetsPage from './pages/ProjectBudgetsPage';
import ExpendituresPage from './pages/ExpendituresPage';
import BudgetForecastPage from './pages/BudgetForecastPage';
import MonthlyForecastReviewPage from './pages/MonthlyForecastReviewPage';
import BankAccountsPage from './pages/BankAccountsPage';
import RevenuesPage from './pages/RevenuesPage';
import FinancialDashboardPage from './pages/FinancialDashboardPage';
import ExchangeRatesPage from './pages/ExchangeRatesPage';
import TransactionTrackingPage from './pages/archive/TransactionTrackingPage';
import { 
    initialUsers, initialRoles, initialPermissionsByRole, initialApprovalWorkflow, initialOrganizationInfo,
    initialDonors, initialProjects, initialSupplierTypes, initialBusinessTypes, initialSuppliers,
    initialItemCategories, initialItems, initialPurchaseRequests, initialSupplierQuotations, initialPurchaseOrders,
    initialContracts, initialProjectBudgets, initialExpenditures, initialPaymentMethods, initialPurchaseMethods,
    initialBanks, initialMasterBoardMembers, initialEmployees, initialWarehouses, initialFuelTypes,
    initialDrivers, initialAssetCategories, initialAssetLocations, initialWorkTypes, initialFuelRecipientTypes, initialExchangeRates,
    initialTransactions, initialTransactionMovements, initialDocumentTypes, initialArchiveClassifications
} from './mockData';
import { useTranslation } from './LanguageContext';

const App: React.FC = () => {
  const { language } = useTranslation();
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Data State
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [permissionsByRole, setPermissionsByRole] = useState<Record<string, RolePermissions>>(initialPermissionsByRole);
  const [approvalWorkflow, setApprovalWorkflow] = useState<string[]>(initialApprovalWorkflow);
  
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [supplierTypes, setSupplierTypes] = useState<SupplierType[]>(initialSupplierTypes);
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>(initialBusinessTypes);
  const [itemCategories, setItemCategories] = useState<ItemCategory[]>(initialItemCategories);
  const [items, setItems] = useState<Item[]>(initialItems);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(initialPurchaseOrders);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>(initialPurchaseRequests);
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [supplierQuotations, setSupplierQuotations] = useState<SupplierQuotation[]>(initialSupplierQuotations);
  const [contractAmendments, setContractAmendments] = useState<ContractAmendment[]>([]);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [donors, setDonors] = useState<Donor[]>(initialDonors);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [organizationInfo, setOrganizationInfo] = useState<OrganizationInfo>(initialOrganizationInfo);
  const [masterBoardMembers, setMasterBoardMembers] = useState<MasterBoardMember[]>(initialMasterBoardMembers);
  const [boardSessions, setBoardSessions] = useState<BoardSession[]>([]);
  const [boardMeetings, setBoardMeetings] = useState<BoardMeeting[]>([]);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [procurementPlans, setProcurementPlans] = useState<ProcurementPlan[]>([]);
  const [policiesAndManuals, setPoliciesAndManuals] = useState<PolicyManual[]>([]);
  const [correspondenceList, setCorrespondenceList] = useState<Correspondence[]>([]);
  const [backupSettings, setBackupSettings] = useState<BackupSettings>({ autoBackup: false, frequency: 'Weekly' });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [archiveLocations, setArchiveLocations] = useState<ArchiveLocation[]>([]);
  const [archiveClassifications, setArchiveClassifications] = useState<ArchiveClassification[]>(initialArchiveClassifications);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>(initialDocumentTypes);
  const [physicalDocuments, setPhysicalDocuments] = useState<PhysicalDocument[]>([]);
  const [fuelTypes, setFuelTypes] = useState<FuelType[]>(initialFuelTypes);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(initialWarehouses);
  const [fuelOpeningBalances, setFuelOpeningBalances] = useState<FuelOpeningBalance[]>([]);
  const [fuelSuppliers, setFuelSuppliers] = useState<FuelSupplier[]>([]);
  const [fuelSupplies, setFuelSupplies] = useState<FuelSupply[]>([]);
  const [fuelTransfers, setFuelTransfers] = useState<FuelTransfer[]>([]);
  const [fuelDisbursements, setFuelDisbursements] = useState<FuelDisbursement[]>([]);
  const [fuelRecipientTypes, setFuelRecipientTypes] = useState<FuelRecipientType[]>(initialFuelRecipientTypes);
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [fleetTrips, setFleetTrips] = useState<FleetTrip[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(initialPaymentMethods);
  const [purchaseMethods, setPurchaseMethods] = useState<PurchaseMethod[]>(initialPurchaseMethods);
  const [workTypes, setWorkTypes] = useState<WorkType[]>(initialWorkTypes);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [workerTransactions, setWorkerTransactions] = useState<WorkerTransaction[]>([]);
  const [warehouseEntities, setWarehouseEntities] = useState<WarehouseEntity[]>([]);
  const [warehouseItems, setWarehouseItems] = useState<WarehouseItem[]>([]);
  const [warehouseInvoices, setWarehouseInvoices] = useState<WarehouseInvoice[]>([]);
  const [warehouseItemOpeningBalances, setWarehouseItemOpeningBalances] = useState<WarehouseItemOpeningBalance[]>([]);
  const [warehouseStockTransfers, setWarehouseStockTransfers] = useState<WarehouseStockTransfer[]>([]);
  const [assetCategories, setAssetCategories] = useState<AssetCategory[]>(initialAssetCategories);
  const [assetLocations, setAssetLocations] = useState<AssetLocation[]>(initialAssetLocations);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetCustody, setAssetCustody] = useState<AssetCustody[]>([]);
  const [projectBudgets, setProjectBudgets] = useState<ProjectBudget[]>(initialProjectBudgets);
  const [expenditures, setExpenditures] = useState<Expenditure[]>(initialExpenditures);
  const [banks, setBanks] = useState<Bank[]>(initialBanks);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>(initialExchangeRates);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [transactionMovements, setTransactionMovements] = useState<TransactionMovement[]>(initialTransactionMovements);

  const userPermissions = useMemo(() => {
    if (currentUser) {
      return permissionsByRole[currentUser.roleId];
    }
    const noPermissions = {} as RolePermissions;
    Object.keys(initialPermissionsByRole.exec_director).forEach(page => {
        noPermissions[page as Page] = { create: false, read: false, update: false, delete: false };
    });
    return noPermissions;
  }, [currentUser, permissionsByRole]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const logActivity = useCallback((args: { actionType: 'create' | 'update' | 'delete'; entityType: string; entityName: string; }) => {
    if (!currentUser) return;
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      timestamp: new Date().toISOString(),
      ...args
    };
    setActivityLog(prev => [newLog, ...prev]);
  }, [currentUser]);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard 
          suppliersCount={suppliers.length}
          itemsCount={items.length}
          poCount={purchaseOrders.length}
          contractsCount={contracts.length}
          projects={projects}
          purchaseRequests={purchaseRequests}
          setActivePage={setActivePage}
          organizationInfo={organizationInfo}
        />;
      case 'suppliers':
        return <SuppliersPage suppliers={suppliers} setSuppliers={setSuppliers} supplierTypes={supplierTypes} setSupplierTypes={setSupplierTypes} businessTypes={businessTypes} setBusinessTypes={setBusinessTypes} permissions={userPermissions.suppliers} logActivity={logActivity} />;
      case 'items':
        return <ItemsPage items={items} setItems={setItems} itemCategories={itemCategories} setItemCategories={setItemCategories} permissions={userPermissions.items} logActivity={logActivity} />;
      case 'purchaseRequests':
        return <PurchaseRequestsPage purchaseRequests={purchaseRequests} setPurchaseRequests={setPurchaseRequests} projects={projects} items={items} suppliers={suppliers} supplierQuotations={supplierQuotations} setSupplierQuotations={setSupplierQuotations} permissions={userPermissions.purchaseRequests} currentUser={currentUser!} organizationInfo={organizationInfo} logActivity={logActivity} approvalWorkflow={approvalWorkflow} />;
      case 'purchaseOrders':
        return <PurchaseOrdersPage purchaseOrders={purchaseOrders} setPurchaseOrders={setPurchaseOrders} purchaseRequests={purchaseRequests} setPurchaseRequests={setPurchaseRequests} suppliers={suppliers} items={items} projects={projects} supplierQuotations={supplierQuotations} setContracts={setContracts} permissions={userPermissions.purchaseOrders} logActivity={logActivity} organizationInfo={organizationInfo} />;
      case 'contracts':
        return <ContractsPage contracts={contracts} setContracts={setContracts} suppliers={suppliers} purchaseOrders={purchaseOrders} purchaseRequests={purchaseRequests} contractAmendments={contractAmendments} setContractAmendments={setContractAmendments} permissions={userPermissions.contracts} logActivity={logActivity} />;
      case 'projects':
        return <ProjectsPage projects={projects} setProjects={setProjects} donors={donors} permissions={userPermissions.projects} logActivity={logActivity} />;
      case 'users':
        return <UsersPage users={users} setUsers={setUsers} roles={roles} setRoles={setRoles} permissionsByRole={permissionsByRole} setPermissionsByRole={setPermissionsByRole} permissions={userPermissions.users} logActivity={logActivity} approvalWorkflow={approvalWorkflow} setApprovalWorkflow={setApprovalWorkflow} />;
      case 'activityLog':
        return <ActivityLogPage logs={activityLog} users={users} permissions={userPermissions.activityLog} />;
      case 'organization':
        return <OrganizationPage organizationInfo={organizationInfo} setOrganizationInfo={setOrganizationInfo} permissions={userPermissions.organization} logActivity={logActivity} />;
      case 'approvals':
        return <ApprovalsPage purchaseRequests={purchaseRequests} setPurchaseRequests={setPurchaseRequests} currentUser={currentUser!} items={items} projects={projects} suppliers={suppliers} roles={roles} organizationInfo={organizationInfo} logActivity={logActivity} />;
      case 'boardMembers':
        return <BoardMembersPage members={masterBoardMembers} setMembers={setMasterBoardMembers} permissions={userPermissions.boardMembers} logActivity={logActivity} />;
      case 'boardOfDirectors':
        return <BoardOfDirectorsPage sessions={boardSessions} setSessions={setBoardSessions} masterBoardMembers={masterBoardMembers} permissions={userPermissions.boardOfDirectors} logActivity={logActivity} />;
      case 'boardMeetings':
        return <BoardMeetingsPage meetings={boardMeetings} setMeetings={setBoardMeetings} sessions={boardSessions} masterBoardMembers={masterBoardMembers} permissions={userPermissions.boardMeetings} logActivity={logActivity} />;
      case 'meetingSearch':
        return <MeetingSearchPage meetings={boardMeetings} sessions={boardSessions} masterBoardMembers={masterBoardMembers} permissions={userPermissions.meetingSearch} />;
      case 'employees':
        return <EmployeesPage employees={employees} setEmployees={setEmployees} permissions={userPermissions.employees} logActivity={logActivity} />;
      case 'donors':
        return <DonorsPage donors={donors} setDonors={setDonors} permissions={userPermissions.donors} logActivity={logActivity} />;
      case 'procurementPlans':
        return <ProcurementPlanPage procurementPlans={procurementPlans} setProcurementPlans={setProcurementPlans} projects={projects} permissions={userPermissions.procurementPlans} logActivity={logActivity} />;
      case 'procurementTracking':
        return <ProcurementTrackingPage procurementPlans={procurementPlans} setProcurementPlans={setProcurementPlans} projects={projects} />;
      case 'policiesAndManuals':
        return <PoliciesAndManualsPage policies={policiesAndManuals} setPolicyManuals={setPoliciesAndManuals} permissions={userPermissions.policiesAndManuals} logActivity={logActivity} />;
      case 'correspondence':
        return <CorrespondencePage correspondenceList={correspondenceList} setCorrespondenceList={setCorrespondenceList} projects={projects} permissions={userPermissions.correspondence} logActivity={logActivity} />;
      case 'backup':
        return <BackupPage permissions={userPermissions.backup} onExport={() => {}} onImport={async () => {}} backupSettings={backupSettings} setBackupSettings={setBackupSettings} logActivity={logActivity} />;
      case 'departments':
        return <DepartmentsPage departments={departments} setDepartments={setDepartments} permissions={userPermissions.departments} logActivity={logActivity} />;
      case 'archiveLocations':
        return <ArchiveLocationsPage archiveLocations={archiveLocations} setArchiveLocations={setArchiveLocations} permissions={userPermissions.archiveLocations} logActivity={logActivity} organizationInfo={organizationInfo} />;
      case 'archiveClassifications':
        return <ArchiveClassificationsPage archiveClassifications={archiveClassifications} setArchiveClassifications={setArchiveClassifications} departments={departments} permissions={userPermissions.archiveClassifications} logActivity={logActivity} documentTypes={documentTypes} />;
      case 'documents':
        return <DocumentsPage documents={physicalDocuments} setDocuments={setPhysicalDocuments} documentTypes={documentTypes} setDocumentTypes={setDocumentTypes} archiveLocations={archiveLocations} projects={projects} permissions={userPermissions.documents} logActivity={logActivity} />;
      case 'assets':
        return <AssetsPage assets={assets} setAssets={setAssets} assetCategories={assetCategories} setAssetCategories={setAssetCategories} assetCustody={assetCustody} setAssetCustody={setAssetCustody} employees={employees} permissions={userPermissions.assets} logActivity={logActivity} projects={projects} assetLocations={assetLocations} setAssetLocations={setAssetLocations} />;
      case 'fuel':
        return <FuelPage
            permissions={userPermissions.fuel}
            logActivity={logActivity}
            fuelTypes={fuelTypes} setFuelTypes={setFuelTypes}
            warehouses={warehouses}
            fuelOpeningBalances={fuelOpeningBalances} setFuelOpeningBalances={setFuelOpeningBalances}
            fuelSuppliers={fuelSuppliers} setFuelSuppliers={setFuelSuppliers}
            fuelSupplies={fuelSupplies} setFuelSupplies={setFuelSupplies}
            fuelTransfers={fuelTransfers} setFuelTransfers={setFuelTransfers}
            fuelDisbursements={fuelDisbursements} setFuelDisbursements={setFuelDisbursements}
            fuelRecipientTypes={fuelRecipientTypes} setFuelRecipientTypes={setFuelRecipientTypes}
            projects={projects}
            drivers={drivers}
            employees={employees}
        />;
      case 'fleet':
        return <FleetPage
            permissions={userPermissions.fleet}
            logActivity={logActivity}
            drivers={drivers} setDrivers={setDrivers}
            fleetTrips={fleetTrips} setFleetTrips={setFleetTrips}
            projects={projects}
            paymentMethods={paymentMethods} setPaymentMethods={setPaymentMethods}
            fuelDisbursements={fuelDisbursements}
        />;
      case 'workers':
        return <WorkersPage
            permissions={userPermissions.workers}
            logActivity={logActivity}
            workers={workers} setWorkers={setWorkers}
            workTypes={workTypes} setWorkTypes={setWorkTypes}
            workerTransactions={workerTransactions} setWorkerTransactions={setWorkerTransactions}
            projects={projects}
            paymentMethods={paymentMethods} setPaymentMethods={setPaymentMethods}
        />;
      case 'warehouses':
        return <WarehousePage
            permissions={userPermissions.warehouses}
            logActivity={logActivity}
            warehouses={warehouses} setWarehouses={setWarehouses}
            warehouseEntities={warehouseEntities} setWarehouseEntities={setWarehouseEntities}
            warehouseItems={warehouseItems} setWarehouseItems={setWarehouseItems}
            warehouseInvoices={warehouseInvoices} setWarehouseInvoices={setWarehouseInvoices}
            warehouseItemOpeningBalances={warehouseItemOpeningBalances} setWarehouseItemOpeningBalances={setWarehouseItemOpeningBalances}
            warehouseStockTransfers={warehouseStockTransfers} setWarehouseStockTransfers={setWarehouseStockTransfers}
            projects={projects}
        />;
      case 'projectBudgets':
          return <ProjectBudgetsPage projects={projects} projectBudgets={projectBudgets} setProjectBudgets={setProjectBudgets} expenditures={expenditures} permissions={userPermissions.projectBudgets} logActivity={logActivity}/>;
      case 'expenditures':
          return <ExpendituresPage projects={projects} projectBudgets={projectBudgets} expenditures={expenditures} setExpenditures={setExpenditures} paymentMethods={paymentMethods} setPaymentMethods={setPaymentMethods} purchaseMethods={purchaseMethods} setPurchaseMethods={setPurchaseMethods} permissions={userPermissions.expenditures} logActivity={logActivity} exchangeRates={exchangeRates}/>;
      case 'budgetForecast':
          return <BudgetForecastPage projects={projects} projectBudgets={projectBudgets} setProjectBudgets={setProjectBudgets} expenditures={expenditures} permissions={userPermissions.budgetForecast} logActivity={logActivity} />;
      case 'monthlyForecastReview':
          return <MonthlyForecastReviewPage projects={projects} projectBudgets={projectBudgets} expenditures={expenditures} permissions={userPermissions.monthlyForecastReview} logActivity={logActivity} />;
      case 'bankAccounts':
          return <BankAccountsPage banks={banks} setBanks={setBanks} permissions={userPermissions.bankAccounts} logActivity={logActivity} />;
      case 'revenues':
          return <RevenuesPage projects={projects} setProjects={setProjects} permissions={userPermissions.revenues} logActivity={logActivity} />;
      case 'financialDashboard':
          return <FinancialDashboardPage projects={projects} projectBudgets={projectBudgets} expenditures={expenditures} donors={donors} />;
      case 'exchangeRates':
        return <ExchangeRatesPage exchangeRates={exchangeRates} setExchangeRates={setExchangeRates} permissions={userPermissions.exchangeRates} logActivity={logActivity} currentUser={currentUser!} />;
      case 'transactionTracking':
        return <TransactionTrackingPage
            transactions={transactions}
            setTransactions={setTransactions}
            movements={transactionMovements}
            setMovements={setTransactionMovements}
            users={users}
            projects={projects}
            currentUser={currentUser!}
            permissions={userPermissions.transactionTracking}
            logActivity={logActivity}
            archiveLocations={archiveLocations}
            organizationInfo={organizationInfo}
            documentTypes={documentTypes}
            archiveClassifications={archiveClassifications}
        />;
      default:
        return <div>Page not found</div>;
    }
  };

  if (!currentUser) {
    return <LoginPage users={users} onLogin={handleLogin} organizationInfo={organizationInfo} />;
  }

  return (
    <div className={`flex flex-col md:flex-row min-h-screen bg-slate-100`}>
      <Header
        activePage={activePage}
        setActivePage={setActivePage}
        onLogout={handleLogout}
        currentUser={currentUser}
        permissions={userPermissions}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;