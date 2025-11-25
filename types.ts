

export interface SupplierType {
  id: string;
  nameAr: string;
  nameEn: string;
}

export interface BusinessType {
  id: string;
  nameAr: string;
  nameEn: string;
}

export interface SupplierAttachment {
  id: string;
  name: string;
  description: string;
  data: string; // Base64 Data URL
  type: string;
}

export interface Supplier {
  id: string;
  nameAr: string;
  nameEn: string;
  phone: string;
  phone2: string;
  address: string;
  licensedDealer: string;
  typeId: string;
  email: string;
  authorizedPerson: string;
  chairman: string;
  idNumber: string;
  businessId: string;
  attachments?: SupplierAttachment[];
}

export interface ItemCategory {
  id: string;
  nameAr: string;
  nameEn: string;
}

export interface Item {
  id: string;
  categoryId: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  unit: string;
  estimatedPrice: number;
  currency: 'ILS' | 'USD' | 'EUR';
  notes: string;
}

export enum POStatus {
  PENDING = 'PENDING',
  AWARDED = 'AWARDED',
  COMPLETED = 'COMPLETED',
}

export interface PurchaseOrderItem {
  itemId: string;
  quantity: number;
  price: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  purchaseRequestId: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: POStatus;
  creationDate: string;
}

export interface Contract {
  id: string;
  contractNumber: string;
  purchaseRequestId: string;
  supplierId: string;
  totalAmount: number;
  currency: 'ILS' | 'USD' | 'EUR';
  terms: string;
  startDate: string;
  endDate: string;
}

export interface ProjectObjective {
  id: string;
  objectiveAr: string;
  objectiveEn: string;
}

export interface ProjectActivity {
  id: string;
  activityAr: string;
  activityEn: string;
}

export interface ProjectExtension {
  id: string;
  amendmentDate: string;
  newEndDate: string;
  newTotalBudget: number;
  notes: string;
  attachment: {
    name: string;
    data: string;
    type: string;
  };
}

export type ProjectAttachmentType = 'Technical Reports' | 'Financial Reports' | 'Financial files' | 'Baseline-Endline' | 'MEAL Plan' | 'Success Stories' | 'Logframe' | 'Procurement Plan' | 'Technical Specifications' | 'Minutes of Meetings' | 'MoU' | 'Letters' | 'Project Proposal' | 'Agreement' | 'Budget' | 'Other';
export interface ProjectAttachment {
  id: string;
  attachmentType: ProjectAttachmentType;
  description: string;
  file: {
    name: string;
    data: string;
    type: string;
  };
}

export type ProjectReportType = 'Financial' | 'Technical' | 'Logistics' | 'Final' | 'Monthly' | 'Admin';
export type ProjectReportStatus = 'Pending' | 'Submitted' | 'Approved';
export interface ProjectReport {
  id: string;
  reportType: ProjectReportType;
  dueDate: string;
  submitDate?: string;
  reportStatus: ProjectReportStatus;
  notes: string;
}

export type ProjectGrantPaymentStatus = 'Paid' | 'Pending';
export interface ProjectGrantPayment {
  id: string;
  payNum: number;
  plannedDate: string;
  plannedAmount: number;
  per: number;
  status: ProjectGrantPaymentStatus;
  actualAmount: number;
  receiptDate?: string;
  nextReqSpend: number;
}

export interface Project {
  id: string;
  nameAr: string;
  nameEn: string;
  projectCode: string;
  projectNumber: string;
  startDate: string;
  endDate: string;
  budget: number;
  currency: 'ILS' | 'USD' | 'EUR';
  location: string;
  donorId: string;
  partner: string;
  directBeneficiaries: number;
  indirectBeneficiaries: number;
  descriptionAr: string;
  descriptionEn: string;

  // Grant fields
  grantAmount?: number;
  overhead?: number;
  deductions?: number;

  // Sub-modules
  objectives?: ProjectObjective[];
  activities?: ProjectActivity[];
  extensions?: ProjectExtension[];
  attachments?: ProjectAttachment[];
  reports?: ProjectReport[];
  grantPayments?: ProjectGrantPayment[];
}

export interface Donor {
  id: string;
  nameAr: string;
  nameEn: string;
  donorCode: string;
  contactPerson: string;
  phoneNumber: string;
  email: string;
  website: string;
}

export enum PurchaseRequestMethod {
  DIRECT = 'DIRECT',
  QUOTATION = 'QUOTATION',
  TENDER = 'TENDER',
}

export interface PurchaseRequestItem {
  itemId: string;
  quantity: number;
}

export interface PurchaseRequestNote {
  id: string;
  text: string;
  date: string;
  user: string;
}

export enum PurchaseRequestStatus {
    DRAFT = 'DRAFT',
    PENDING_APPROVAL = 'PENDING_APPROVAL',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    AWARDED = 'AWARDED',
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface ApprovalStep {
  roleId: string;
  status: ApprovalStatus;
  userId?: string;
  userName?: string;
  date?: string;
  comments?: string;
}


export interface PurchaseRequest {
  id:string;
  requestCode: string;
  projectId: string;
  nameAr: string;
  nameEn: string;
  currency: 'ILS' | 'USD' | 'EUR';
  purchaseMethod: PurchaseRequestMethod;
  requestDate: string;
  publicationDate: string;
  deadlineDate: string;
  requesterName: string;
  items: PurchaseRequestItem[];
  notes: PurchaseRequestNote[];
  status: PurchaseRequestStatus;
  approvals: ApprovalStep[];
}

export interface QuotedItem {
  itemId: string;
  price: number;
}

export interface SupplierQuotation {
  id: string;
  purchaseRequestId: string;
  supplierId: string;
  items: QuotedItem[];
  quotationDate: string;
  discount?: number;
}

export interface ContractAmendmentJustification {
  id: string;
  text: string;
}

export interface ContractAmendment {
  id: string;
  contractId: string;
  amendmentDate: string;
  newEndDate: string;
  newTotalAmount: number;
  justifications: ContractAmendmentJustification[];
}

export interface OrganizationInfo {
  nameAr: string;
  nameEn: string;
  abbreviation: string;
  establishmentDate: string;
  licenseNumber: string;
  phone: string;
  mobile: string;
  fax: string;
  email: string;
  address: string;
  logoUrl: string; // Base64 Data URL
  website: string;
}

export interface BoardMember {
  id: string;
  masterMemberId: string;
  position: 'Chairman' | 'ViceChairman' | 'Secretary' | 'Treasurer' | 'Member';
}

export interface BoardSession {
  id: string;
  sessionNumber: string;
  startDate: string;
  endDate: string;
  members: BoardMember[];
}

export interface MeetingAttachment {
  id: string;
  name: string;
  data: string; // Base64 Data URL
  type: string;
}

export interface MeetingPoint {
  id: string;
  text: string;
}

export interface BoardMeeting {
  id: string;
  sessionId: string;
  meetingNumber: string;
  meetingDate: string;
  attendees: string[]; // Array of masterMemberId
  absentees: string[]; // Array of masterMemberId
  agenda: MeetingPoint[];
  decisions: MeetingPoint[];
  attachments: MeetingAttachment[];
}

export interface MasterBoardMember {
  id: string;
  fullName: string;
  idNumber: string;
  dateOfBirth: string;
  qualification: string;
  address: string;
  phone: string;
  gender: 'Male' | 'Female';
  occupation: string;
}

export interface Employee {
  id: string;
  fullName: string;
  idNumber: string;
  dateOfBirth: string;
  socialStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  nationality: string;
  address: string;
  phone: string;
  email: string;
  familyMembers: number;
  spouseName?: string;
  spouseIdNumber?: string;
  bloodType: string;
  qualification: string;
  specialization: string;
}

export type ProcurementPlanItemStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';

export interface ProcurementPlanDetail {
  id: string;
  budgetCode: string;
  item: string;
  description: string;
  unit: string;
  currency: 'ILS' | 'USD' | 'EUR';
  estimatedCost: number;
  quantity: number;
  procurementMethod: PurchaseRequestMethod;
  publicationDate: string;
  deliveryDate: string;
  status: ProcurementPlanItemStatus;
}

export interface ProcurementPlan {
  id: string;
  planId: number;
  projectId: string;
  fromDate: string;
  toDate: string;
  note: string;
  details: ProcurementPlanDetail[];
}

export interface PolicyManual {
  id: string;
  name: string;
  year: string;
  attachment: {
    name: string;
    data: string; // Base64 Data URL
    type: string;
  };
  notes: string;
  issueDate: string;
}

// Fleet & Warehouse Management Types
export interface FuelType {
  id: string;
  name: string;
  description: string;
}

export interface Warehouse {
  id: string;
  name: string;
  managerName: string;
  contactNumber: string;
  latitude: number;
  longitude: number;
  address: string;
  googleMapLink: string;
}

export interface FuelOpeningBalance {
  id: string;
  warehouseId: string;
  fuelTypeId: string;
  quantity: number;
  balanceDate: string;
  notes: string;
}

export interface FuelSupplier {
  id: string;
  name: string;
  contactNumber: string;
  address: string;
  contactPerson: string;
  notes: string;
}

export interface FuelSupply {
  id: string;
  supplierId: string;
  warehouseId: string;
  fuelTypeId: string;
  quantitySupplied: number;
  unitPrice: number;
  supplyDate: string;
  invoiceNumber: string;
  projectId: string;
  notes: string;
}

export interface FuelTransfer {
  id: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  fuelTypeId: string;
  quantity: number;
  transferDate: string;
  notes: string;
}

export interface FuelRecipientType {
    id: string;
    nameAr: string;
    nameEn: string;
}

export interface FuelDisbursement {
  id: string;
  recipientType: string; // Changed from union to string to support dynamic types
  recipientId: string; // Driver ID, Vehicle ID, etc. OR just a name if no entity exists
  recipientName?: string; // Optional fallback for non-entity recipients
  warehouseId: string;
  fuelTypeId: string;
  quantityIssued: number;
  issueDate: string;
  projectId?: string;
  notes: string;
}

export interface WorkType {
  id: string;
  nameAr: string;
  nameEn: string;
}

export interface Worker {
  id: string;
  name: string;
  mobile: string;
  idNumber: string;
  paymentMethodId: string;
  bankName: string;
  accountNumber: string;
  iban: string;
}

export interface WorkerTransaction {
  id: string;
  workerId: string;
  date: string;
  workType: string;
  location: string;
  projectId: string;
  amountDue: number;
  currency: 'ILS' | 'USD' | 'EUR';
  notes: string;
}

export interface PaymentMethod {
  id: string;
  nameAr: string;
  nameEn: string;
}

export interface PurchaseMethod {
  id: string;
  nameAr: string;
  nameEn: string;
}

export interface Driver {
  id: string;
  name: string;
  mobile: string;
  carType: string;
  carNumber: string;
  paymentMethodId: string;
  bankName: string;
  accountNumber: string;
  iban: string;
}

export interface FleetTrip {
  id: string;
  driverId: string;
  projectId: string;
  date: string;
  distanceKm: number;
  odometerStart: number;
  odometerEnd: number;
  kmPerLitre: number;
  fuelRequired: number;
  costRequired: number;
  costCurrency: 'ILS' | 'USD' | 'EUR';
  fromLocation: string;
  toLocation: string;
  movementType: string;
  details?: string;
}

export interface WarehouseEntity {
    id: string;
    name: string;
    entityType: 'Receiver' | 'Deliverer';
    contactPerson: string;
    contactNumber: string;
    address: string;
    notes: string;
}

export interface WarehouseItem {
  id: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  sku: string;
  minimumStock: number;
}

export interface WarehouseInvoice {
  id: string;
  invoiceNumber: string;
  invoiceType: 'Supply' | 'Dispatch';
  warehouseId: string;
  entityId: string;
  invoiceDate: string;
  projectId: string;
  remarks: string;
  details: WarehouseInvoiceDetail[];
}

export interface WarehouseInvoiceDetail {
  id: string;
  itemId: string;
  quantity: number;
  unit: string;
  note: string;
}

export interface WarehouseItemOpeningBalance {
  id: string;
  itemId: string;
  warehouseId: string;
  unit: string;
  quantity: number;
  balanceDate: string;
  notes?: string;
}

export interface WarehouseStockTransfer {
  id: string;
  itemId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  quantity: number;
  transferDate: string;
  notes: string;
}

export interface Correspondence {
    id: string;
    type: 'Outgoing' | 'Incoming';
    title: string;
    entity: string; // Receiver for Outgoing, Sender for Incoming
    date: string;
    serialNumber: string;
    sequence: number;
    year: number;
    projectId: string;
    attachment?: {
        name: string;
        data: string;
        type: string;
    };
}

export interface BackupSettings {
    autoBackup: boolean;
    frequency: 'Daily' | 'Weekly' | 'Monthly';
    lastBackup?: string;
}

// Departments & Archive Types
export interface Department {
    id: string;
    nameAr: string;
    nameEn: string;
}

export interface ArchiveLocation {
    id: string;
    name: string;
    code: string;
    location: string;
    shelvesCount: number;
}

export interface ArchiveClassification {
    id: string;
    departmentId: string;
    nameAr: string;
    nameEn: string;
    type: 'Transaction' | 'Document';
    requiredDocumentTypeIds?: string[];
}

export interface DocumentType {
    id: string;
    nameAr: string;
    nameEn: string;
}

export type DocumentSize = 'Small' | 'Medium' | 'Large';

export interface PhysicalDocument {
    id: string;
    name: string;
    projectCode: string;
    creationDate: string; // Automatic
    year: string;
    size: DocumentSize;
    typeId: string;
    locationId: string;
    shelfNumber: number;
    description?: string;
}

// Transaction Tracking Types
export type TransactionPriority = 'Normal' | 'Urgent' | 'Top Priority';
export type TransactionStatus = 'Active' | 'Completed' | 'Archived';
export type TransactionDocumentStatus = 'Pending' | 'Approved' | 'Rejected';

export interface TransactionDocument {
    id: string;
    documentTypeId: string;
    file: {
        name: string;
        data: string;
        type: string;
    };
    status: TransactionDocumentStatus;
    notes?: string;
    reviewedByUserId?: string;
    reviewDate?: string;
}

export interface Transaction {
    id: string;
    referenceNumber: string; // Auto-generated e.g., TR-2024-0001
    subject: string;
    typeId: string; // Links to ArchiveClassification (Transaction Type)
    projectId?: string;
    priority: TransactionPriority;
    status: TransactionStatus;
    creationDate: string;
    createdByUserId: string;
    currentHolderId: string; // The user currently responsible
    description?: string;
    documents?: TransactionDocument[];
    archiveLocationId?: string; // Physical location when archived
    physicalLocation?: string; // Additional text details about location if needed
}

export interface TransactionMovement {
    id: string;
    transactionId: string;
    fromUserId: string;
    toUserId: string;
    date: string; // ISO Date
    action: string; // e.g., "Forwarded", "Approved", "Review Request", "Received"
    notes?: string;
    isRead: boolean;
}

// Assets and Custody
export interface AssetCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  code: string; // e.g. 'CP' for Computers
}

export interface AssetLocation {
    id: string;
    name: string;
}

export type AssetStatus = 'In Stock' | 'In Use' | 'Under Maintenance' | 'Retired';

export interface Asset {
  id: string;
  assetTag: string; // Auto-generated e.g. CP-2023-0001
  name: string;
  categoryId: string;
  projectId: string;
  locationId: string;
  serialNumber?: string;
  purchaseDate: string;
  purchasePrice: number;
  currency: 'ILS' | 'USD' | 'EUR';
  status: AssetStatus;
  specifications: string;
  description: string;
  totalQuantity: number;
}

export interface AssetCustody {
  id: string;
  assetId: string;
  employeeId: string;
  custodyDate: string;
  returnDate?: string;
  notes: string;
  specifications?: string;
  quantity: number;
}

// Finance Module Types
export interface BudgetLine {
  id: string;
  category: string;
  code: string;
  descriptionAr: string;
  descriptionEn: string;
  unit: string;
  quantity: number;
  unitCost: number;
  duration: number; // in months
  percentage: number;
  totalCost: number;
  forecast?: Record<string, number>; // YYYY-MM -> amount
}

export interface ProjectBudget {
  id: string;
  projectId: string;
  lines: BudgetLine[];
}

export interface Expenditure {
  id: string;
  projectId: string;
  budgetLineId: string;
  pvNumber?: string;
  paymentDate: string;
  invoiceNumber?: string;
  description: string;
  paymentMethodId: string;
  chequeNumber?: string;
  purchaseMethodId: string;
  originalAmount: number;
  originalCurrency: 'ILS' | 'USD' | 'EUR';
  paymentAmount: number;
  paymentCurrency: 'ILS' | 'USD' | 'EUR';
  allocationPercentage: number;
  exchangeRate: number;
}

export interface BankSubAccount {
  id: string;
  accountNumber: string;
  iban: string;
  currency: 'ILS' | 'USD' | 'EUR';
  accountSymbol: string;
}

export interface Bank {
  id: string;
  nameAr: string;
  nameEn: string;
  mainBranch: string;
  accountNumber: string;
  subAccounts: BankSubAccount[];
}

export interface ExchangeRate {
  id: string;
  year: number;
  month: number;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  approvedBy: string; // User's name
  approvedDate: string;
}


export type Page = 'dashboard' | 'suppliers' | 'items' | 'purchaseOrders' | 'contracts' | 'purchaseRequests' | 
'projects' | 'users' | 'activityLog' | 'organization' | 'approvals' | 'boardOfDirectors' | 'boardMembers' | 
'employees' | 'boardMeetings' | 'meetingSearch' | 'donors' | 'procurementPlans' | 'procurementTracking' | 
'policiesAndManuals' | 'correspondence' | 'backup' | 'departments' | 'archiveLocations' | 
'archiveClassifications' | 'documents' | 'fuel' | 'fleet' | 'workers' | 'warehouses' | 'assets' | 
'projectBudgets' | 'expenditures' | 'budgetForecast' | 'monthlyForecastReview' | 'bankAccounts' | 'revenues' | 
'financialDashboard' | 'exchangeRates' | 'transactionTracking';

// User and Role Management Types
export interface PermissionActions {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export type RolePermissions = Record<Page, PermissionActions>;

export interface Role {
  id: string;
  nameAr: string;
  nameEn: string;
}

export interface User {
  id: string;
  username: string;
  password?: string; // Should be hashed in a real app
  roleId: string;
  name: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  actionType: 'create' | 'update' | 'delete';
  entityType: string;
  entityName: string;
  timestamp: string;
}

declare global {
  interface Window {
    jspdf: any;
    html2canvas: (element: HTMLElement, options?: any) => Promise<HTMLCanvasElement>;
    XLSX: any;
  }
}