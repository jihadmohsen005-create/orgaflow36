

import { User, Role, RolePermissions, Page, PermissionActions, OrganizationInfo, Donor, Project, SupplierType, BusinessType, Supplier, ItemCategory, Item, PurchaseRequest, PurchaseRequestMethod, PurchaseRequestStatus, ApprovalStatus, SupplierQuotation, PurchaseOrder, POStatus, Contract, ProjectBudget, PaymentMethod, PurchaseMethod, Bank, Expenditure, MasterBoardMember, Employee, Warehouse, FuelType, AssetCategory, AssetLocation, Driver, WorkType, FuelRecipientType, FuelSupplier, FuelSupply, FuelTransfer, FuelDisbursement, FleetTrip, Worker, WorkerTransaction, WarehouseEntity, WarehouseItem, WarehouseInvoice, WarehouseItemOpeningBalance, WarehouseStockTransfer, Asset, AssetCustody, FuelOpeningBalance, ExchangeRate, Transaction, TransactionMovement } from './types';

export const initialRoles: Role[] = [
    { id: 'exec_director', nameAr: 'مدير تنفيذي', nameEn: 'Executive Director' },
    { id: 'finance_manager', nameAr: 'مدير مالي', nameEn: 'Finance Manager' },
    { id: 'procurement_officer', nameAr: 'موظف مشتريات', nameEn: 'Procurement Officer' },
    { id: 'warehouse_keeper', nameAr: 'أمين مخازن', nameEn: 'Warehouse Keeper' },
    { id: 'warehouse_supervisor', nameAr: 'مشرف مخازن', nameEn: 'Warehouse Supervisor' },
    { id: 'project_coordinator', nameAr: 'منسق مشروع', nameEn: 'Project Coordinator' },
    { id: 'employee', nameAr: 'موظف', nameEn: 'Employee' },
    { id: 'accountant', nameAr: 'محاسب', nameEn: 'Accountant' },
    { id: 'auditor', nameAr: 'مدقق', nameEn: 'Auditor' },
];

export const initialUsers: User[] = [
    { id: 'user1', name: 'Executive Director', username: 'director', password: '123', roleId: 'exec_director' },
    { id: 'user2', name: 'Finance Manager', username: 'finance', password: '123', roleId: 'finance_manager' },
    { id: 'user3', name: 'Procurement Officer', username: 'procurement', password: '123', roleId: 'procurement_officer' },
    { id: 'user4', name: 'Accountant', username: 'accountant', password: '123', roleId: 'accountant' },
    { id: 'user5', name: 'Auditor', username: 'auditor', password: '123', roleId: 'auditor' },
];

// Defines the sequential approval workflow for Purchase Requests.
export const initialApprovalWorkflow: string[] = ['procurement_officer', 'finance_manager', 'exec_director'];

export const initialOrganizationInfo: OrganizationInfo = {
  nameAr: 'OrgaFlow',
  nameEn: 'OrgaFlow',
  abbreviation: 'TA',
  establishmentDate: '2023-01-01',
  licenseNumber: 'RA-123-B',
  phone: '08-282-5333',
  mobile: '059-555-3348',
  fax: '08-282-5333',
  email: 'info@orgaflow.ps',
  address: 'Gaza, Palestine',
  logoUrl: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxwYXRoIGQ9Ik01MCA1QzI1LjE0NzIgNSAgNSAyNS4xNDcyIDUgNTBDNSA3NC44NTI4IDI1LjE0NzIgOTUgNTAgOTVDNzQuODUyOCA5NSA5NSA3NC44NTI4IDk1IDUwIiBzdHJva2U9InJnYig3OSwgNzAsIDIyOSkiIHN0cm9rZS13aWR0aD0iNiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CiAgICA8cGF0aCBkPSJNOTUgNTBDOTUgMjUuMTQ3MiA3NC44NTI4IDUgNTAgNSIgc3Ryb2tlPSJyZ2IoMTI5LCAxNDAsIDI0OCkiIHN0cm9rZS13aWR0aD0iNiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2UtZGFzaGFycmF5PSIxNSAxNSIvPgogICAgPHBhdGggZD0iTTMwIDcwTDcwIDMwIiBzdHJva2U9InJnYig3OSwgNzAsIDIyOSkiIHN0cm9rZS13aWR0aD0iNiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiAvPgogICAgPHBhdGggZD0iTTMwIDMwSDcwIiBzdHJva2U9InJnYigxMjksIDE0MCwgMjQ4KSIgc3Ryb2tlLXdpZHRoPSI2IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIC8+CiAgICA8cGF0aCBkPSJNMzAgNTBINzAiIHN0cm9rZT0icmdiKDk5LCAxMDIsIDI0MSkiIHN0cm9rZS13aWR0aD0iNiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiAvPgo8L3N2Zz4=', // Or a real base64 logo
  website: 'www.orgaflow.ps',
};

export const initialDonors: Donor[] = [
    { id: 'donor1', nameAr: 'الصندوق العربي للإنماء الاقتصادي والاجتماعي', nameEn: 'Arab Fund for Economic and Social Development', donorCode: 'AFESD', contactPerson: 'Mr. Ali', phoneNumber: '+965-1234567', email: 'info@afesd.org', website: 'www.afesd.org' },
    { id: 'donor2', nameAr: 'البنك الإسلامي للتنمية', nameEn: 'Islamic Development Bank', donorCode: 'IsDB', contactPerson: 'Ms. Fatima', phoneNumber: '+966-12-636-1400', email: 'info@isdb.org', website: 'www.isdb.org' }
];

export const initialProjects: Project[] = [
    {
        id: 'proj1', nameAr: 'مشروع دعم الشباب', nameEn: 'Youth Support Project', projectCode: 'YSP-2024', projectNumber: 'P-PS-001',
        startDate: '2024-01-01', endDate: '2024-12-31', budget: 50000, currency: 'USD', location: 'Gaza', donorId: 'donor1',
        partner: '', directBeneficiaries: 100, indirectBeneficiaries: 500, descriptionAr: 'وصف مشروع دعم الشباب', descriptionEn: 'Description for Youth Support Project',
        grantAmount: 50000, overhead: 5000, deductions: 1000,
        grantPayments: [
            { id: 'gp1', payNum: 1, plannedDate: '2024-02-01', plannedAmount: 20000, per: 40, status: 'Paid', actualAmount: 20000, receiptDate: '2024-02-05', nextReqSpend: 80 },
            { id: 'gp2', payNum: 2, plannedDate: '2024-07-01', plannedAmount: 30000, per: 60, status: 'Pending', actualAmount: 0, nextReqSpend: 80 },
        ],
        objectives: [{id: 'obj1', objectiveAr: 'الهدف الأول', objectiveEn: 'First Objective'}],
        activities: [{id: 'act1', activityAr: 'النشاط الأول', activityEn: 'First Activity'}],
        extensions: [], attachments: [], reports: []
    },
    {
        id: 'proj2', nameAr: 'مشروع التمكين الاقتصادي للمرأة', nameEn: 'Women Economic Empowerment', projectCode: 'WEE-2024', projectNumber: 'P-PS-002',
        startDate: '2024-03-01', endDate: '2025-02-28', budget: 75000, currency: 'USD', location: 'West Bank', donorId: 'donor2',
        partner: 'Partner Org', directBeneficiaries: 150, indirectBeneficiaries: 600, descriptionAr: 'وصف مشروع التمكين', descriptionEn: 'Description for WEE Project',
        grantAmount: 75000,
        grantPayments: [
            { id: 'gp3', payNum: 1, plannedDate: '2025-10-10', plannedAmount: 60000, per: 80, status: 'Pending', actualAmount: 0, receiptDate: 'dd/mm/yyyy', nextReqSpend: 80},
            { id: 'gp4', payNum: 2, plannedDate: '2026-10-10', plannedAmount: 15000, per: 20, status: 'Pending', actualAmount: 0, receiptDate: 'dd/mm/yyyy', nextReqSpend: 80},
        ], objectives: [], activities: [], extensions: [], attachments: [], reports: []
    }
];

export const initialSupplierTypes: SupplierType[] = [
    { id: 'st1', nameAr: 'مورد محلي', nameEn: 'Local Supplier' },
    { id: 'st2', nameAr: 'مورد دولي', nameEn: 'International Supplier' }
];

export const initialBusinessTypes: BusinessType[] = [
    { id: 'bt1', nameAr: 'تجارة عامة', nameEn: 'General Trade' },
    { id: 'bt2', nameAr: 'تصنيع', nameEn: 'Manufacturing' },
    { id: 'bt3', nameAr: 'خدمات', nameEn: 'Services' },
];

export const initialSuppliers: Supplier[] = [
    { id: 'sup1', nameAr: 'شركة ألفا للتوريدات', nameEn: 'Alpha Supplies Co.', phone: '0501234567', phone2: '', address: 'الرياض', licensedDealer: '1010123456', typeId: 'st1', email: 'info@alpha.com', authorizedPerson: 'أحمد محمود', chairman: 'خالد عبدالله', idNumber: '1234567890', businessId: 'bt1', attachments: [] },
    { id: 'sup2', nameAr: 'مؤسسة بيتا التجارية', nameEn: 'Beta Trading Est.', phone: '0557654321', phone2: '', address: 'جدة', licensedDealer: '1010654321', typeId: 'st1', email: 'contact@beta.com', authorizedPerson: 'فاطمة علي', chairman: 'سارة إبراهيم', idNumber: '0987654321', businessId: 'bt3', attachments: [] },
    { id: 'sup3', nameAr: 'مصنع جاما للصناعات', nameEn: 'Gamma Industries', phone: '0533334444', phone2: '', address: 'الدمام', licensedDealer: '1010789012', typeId: 'st1', email: 'sales@gamma.com', authorizedPerson: 'يوسف حسن', chairman: 'محمد سالم', idNumber: '1122334455', businessId: 'bt2', attachments: [] },
];

export const initialItemCategories: ItemCategory[] = [
    { id: 'cat1', nameAr: 'أجهزة إلكترونية', nameEn: 'Electronics' },
    { id: 'cat2', nameAr: 'قرطاسية ومستلزمات مكتبية', nameEn: 'Stationery & Office Supplies' },
    { id: 'cat3', nameAr: 'مواد تدريبية', nameEn: 'Training Materials' },
];

export const initialItems: Item[] = [
    { id: 'item1', categoryId: 'cat1', nameAr: 'جهاز حاسوب محمول', nameEn: 'Laptop Computer', descriptionAr: 'مواصفات قياسية', descriptionEn: 'Standard specifications', unit: 'قطعة', estimatedPrice: 1000, currency: 'USD', notes: '' },
    { id: 'item2', categoryId: 'cat2', nameAr: 'ورق طباعة A4', nameEn: 'A4 Printing Paper', descriptionAr: 'حزمة 500 ورقة', descriptionEn: 'Pack of 500 sheets', unit: 'حزمة', estimatedPrice: 5, currency: 'USD', notes: '' },
    { id: 'item3', categoryId: 'cat3', nameAr: 'كتيب تدريبي', nameEn: 'Training Manual', descriptionAr: 'كتيب ملون', descriptionEn: 'Colored manual', unit: 'كتيب', estimatedPrice: 15, currency: 'USD', notes: '' },
];

export const initialPurchaseRequests: PurchaseRequest[] = [
    {
        id: 'pr1', requestCode: 'REQ-2024-001', projectId: 'proj1', nameAr: 'شراء أجهزة كمبيوتر للمشروع', nameEn: 'Purchase of Laptops for Project',
        currency: 'USD', purchaseMethod: PurchaseRequestMethod.QUOTATION, requestDate: '2024-01-15', publicationDate: '', deadlineDate: '', requesterName: 'Procurement Officer',
        items: [{ itemId: 'item1', quantity: 2 }], notes: [], status: PurchaseRequestStatus.AWARDED,
        approvals: [
            { roleId: 'procurement_officer', status: ApprovalStatus.APPROVED, userName: 'Procurement Officer', date: '2024-01-15' },
            { roleId: 'finance_manager', status: ApprovalStatus.APPROVED, userName: 'Finance Manager', date: '2024-01-16' },
            { roleId: 'exec_director', status: ApprovalStatus.APPROVED, userName: 'Executive Director', date: '2024-01-17' },
        ]
    },
    {
        id: 'pr2', requestCode: 'REQ-2024-002', projectId: 'proj2', nameAr: 'شراء قرطاسية لورشة عمل', nameEn: 'Purchase of Stationery for Workshop',
        currency: 'USD', purchaseMethod: PurchaseRequestMethod.DIRECT, requestDate: '2024-02-20', publicationDate: '', deadlineDate: '', requesterName: 'Procurement Officer',
        items: [{ itemId: 'item2', quantity: 10 }, { itemId: 'item3', quantity: 20 }], notes: [], status: PurchaseRequestStatus.APPROVED,
        approvals: [
             { roleId: 'procurement_officer', status: ApprovalStatus.APPROVED, userName: 'Procurement Officer', date: '2024-02-20' },
            { roleId: 'finance_manager', status: ApprovalStatus.PENDING },
            { roleId: 'exec_director', status: ApprovalStatus.PENDING },
        ]
    }
];

export const initialSupplierQuotations: SupplierQuotation[] = [
    { id: 'q1', purchaseRequestId: 'pr1', supplierId: 'sup1', items: [{itemId: 'item1', price: 950}], quotationDate: '2024-01-20', discount: 2},
    { id: 'q2', purchaseRequestId: 'pr1', supplierId: 'sup2', items: [{itemId: 'item1', price: 980}], quotationDate: '2024-01-21'},
];

export const initialPurchaseOrders: PurchaseOrder[] = [
    { id: 'po1', poNumber: 'PO-2024-001', supplierId: 'sup1', purchaseRequestId: 'pr1', items: [{ itemId: 'item1', quantity: 2, price: 950 }], totalAmount: 1862, status: POStatus.AWARDED, creationDate: '2024-01-25'}
];

export const initialContracts: Contract[] = [
    { id: 'con1', contractNumber: 'PEF-Contract-001-2024', purchaseRequestId: 'pr1', supplierId: 'sup1', totalAmount: 1862, currency: 'USD', terms: 'Standard terms apply.', startDate: '2024-02-01', endDate: '2024-03-01' }
];

export const initialPaymentMethods: PaymentMethod[] = [
    { id: 'pm1', nameAr: 'تحويل بنكي', nameEn: 'Bank Transfer'},
    { id: 'pm2', nameAr: 'شيك', nameEn: 'Cheque'},
    { id: 'pm3', nameAr: 'نقدي', nameEn: 'Cash'},
];
export const initialPurchaseMethods: PurchaseMethod[] = [
    { id: 'purm1', nameAr: 'شراء مباشر', nameEn: 'Direct Purchase'},
    { id: 'purm2', nameAr: 'عرض أسعار', nameEn: 'Quotation'},
];

export const initialBanks: Bank[] = [
    { id: 'bank1', nameAr: 'بنك فلسطين', nameEn: 'Bank of Palestine', mainBranch: 'Gaza', accountNumber: '123456', subAccounts: [
        { id: 'sub1', accountNumber: '123456-1', iban: 'PSXXPALN000000000123456001', currency: 'USD', accountSymbol: 'PROJ1-USD' }
    ]}
];

export const initialProjectBudgets: ProjectBudget[] = [
    {
        id: 'bud1', projectId: 'proj1', lines: [
            { id: 'line1.1', category: 'Personnel', code: '1.1', descriptionAr: 'راتب منسق المشروع', descriptionEn: 'Project Coordinator Salary', unit: 'شهر', quantity: 12, unitCost: 1000, duration: 1, percentage: 100, totalCost: 12000 },
            { id: 'line1.2', category: 'Personnel', code: '1.2', descriptionAr: 'راتب محاسب', descriptionEn: 'Accountant Salary', unit: 'شهر', quantity: 12, unitCost: 800, duration: 1, percentage: 100, totalCost: 9600 },
            { id: 'line2.1', category: 'Activities', code: '2.1', descriptionAr: 'ورشة عمل تدريبية', descriptionEn: 'Training Workshop', unit: 'ورشة', quantity: 2, unitCost: 2500, duration: 1, percentage: 100, totalCost: 5000 },
        ]
    },
    {
        id: 'bud2', projectId: 'proj2', lines: [
            { id: 'line3.1', category: 'Personnel', code: '1.1', descriptionAr: 'راتب مديرة المشروع', descriptionEn: 'Project Manager Salary', unit: 'شهر', quantity: 12, unitCost: 1200, duration: 1, percentage: 100, totalCost: 14400 },
        ]
    }
];

export const initialExpenditures: Expenditure[] = [
    { id: 'exp1', projectId: 'proj1', budgetLineId: 'line1.1', pvNumber: 'PV-001', paymentDate: '2024-01-31', description: 'January Salary - Coordinator', paymentMethodId: 'pm1', purchaseMethodId: 'purm1', originalAmount: 1000, originalCurrency: 'USD', paymentAmount: 1000, paymentCurrency: 'USD', allocationPercentage: 100, exchangeRate: 1 },
    { id: 'exp2', projectId: 'proj1', budgetLineId: 'line1.2', pvNumber: 'PV-002', paymentDate: '2024-01-31', description: 'January Salary - Accountant', paymentMethodId: 'pm1', purchaseMethodId: 'purm1', originalAmount: 800, originalCurrency: 'USD', paymentAmount: 800, paymentCurrency: 'USD', allocationPercentage: 100, exchangeRate: 1 },
    { id: 'exp3', projectId: 'proj1', budgetLineId: 'line2.1', pvNumber: 'PV-003', paymentDate: '2024-02-15', description: 'Workshop #1 materials', paymentMethodId: 'pm2', chequeNumber: 'CHK123', purchaseMethodId: 'purm2', originalAmount: 500, originalCurrency: 'ILS', paymentAmount: 250, paymentCurrency: 'USD', allocationPercentage: 50, exchangeRate: 2.0 },
    { id: 'exp4', projectId: 'proj1', budgetLineId: 'line1.1', paymentDate: '2025-11-23', pvNumber: '5555', invoiceNumber: 'بب5544', description: 'بيب', paymentMethodId: 'pm1', purchaseMethodId: 'purm1', originalAmount: 500.00, originalCurrency: 'ILS', paymentAmount: 142.86, paymentCurrency: 'USD', allocationPercentage: 100, exchangeRate: 3.5},
];

export const initialMasterBoardMembers: MasterBoardMember[] = [
    { id: 'mbm1', fullName: 'John Doe', idNumber: '123456789', dateOfBirth: '1970-01-01', qualification: 'PhD', address: 'Gaza', phone: '0599111222', gender: 'Male', occupation: 'University Professor' },
    { id: 'mbm2', fullName: 'Jane Smith', idNumber: '987654321', dateOfBirth: '1975-05-05', qualification: 'M.A.', address: 'Gaza', phone: '0599333444', gender: 'Female', occupation: 'Consultant' }
];

export const initialEmployees: Employee[] = [
    { id: 'emp1', fullName: 'Employee One', idNumber: '987654321', dateOfBirth: '1990-01-01', socialStatus: 'Married', nationality: 'Palestinian', address: 'Gaza', phone: '0599123456', email: 'emp1@example.com', familyMembers: 4, bloodType: 'O+', qualification: 'M.A.', specialization: 'Development' }
];

export const initialWarehouses: Warehouse[] = [
    { id: 'wh1', name: 'Main Warehouse', managerName: 'Mr. Warehouse', contactNumber: '123', address: 'Gaza', googleMapLink: '', latitude: 0, longitude: 0 },
    { id: 'wh2', name: 'Project Warehouse', managerName: 'Mr. Site', contactNumber: '456', address: 'Site', googleMapLink: '', latitude: 0, longitude: 0 },
];
export const initialFuelTypes: FuelType[] = [
    { id: 'ft1', name: 'Diesel', description: 'For generators' },
    { id: 'ft2', name: 'Gasoline 95', description: 'For vehicles' },
];

export const initialAssetCategories: AssetCategory[] = [
    { id: 'ac1', nameAr: 'أجهزة كمبيوتر', nameEn: 'Computers', code: 'CP' },
    { id: 'ac2', nameAr: 'أثاث', nameEn: 'Furniture', code: 'FU' }
];
export const initialAssetLocations: AssetLocation[] = [
    { id: 'al1', name: 'Main Office' },
    { id: 'al2', name: 'Project YSP-2024 Office' }
];

export const initialWorkTypes: WorkType[] = [
    { id: 'wt1', nameAr: 'تحميل وتنزيل', nameEn: 'Loading/Unloading' },
    { id: 'wt2', nameAr: 'حراسة', nameEn: 'Guarding' },
];

export const initialFuelRecipientTypes: FuelRecipientType[] = [
    { id: 'frt1', nameAr: 'سائق', nameEn: 'Driver' },
    { id: 'frt2', nameAr: 'مولد كهربائي', nameEn: 'Generator' },
];

// --- Operations Mock Data ---

export const initialDrivers: Driver[] = [
    {id: 'drv1', name: 'Driver One', mobile: '0599000000', carType: 'Hyundai', carNumber: '12345', paymentMethodId: 'pm3', bankName: '', accountNumber: '', iban: '' },
    {id: 'drv2', name: 'Driver Two', mobile: '0599111111', carType: 'Toyota', carNumber: '67890', paymentMethodId: 'pm1', bankName: 'Bank of Palestine', accountNumber: '9050', iban: '' },
    {id: 'drv3', name: 'Driver Three', mobile: '0599222222', carType: 'Kia', carNumber: '11223', paymentMethodId: 'pm3', bankName: '', accountNumber: '', iban: '' }
];

export const initialFuelSuppliers: FuelSupplier[] = [
    { id: 'fuelsup1', name: 'Gaza Fuel Station', contactPerson: 'Abu Ahmed', contactNumber: '0599-111-222', address: 'Gaza', notes: '' },
    { id: 'fuelsup2', name: 'Al-Shati Station', contactPerson: 'Hassan', contactNumber: '0599-333-444', address: 'Gaza', notes: 'Good prices' }
];

export const initialFuelOpeningBalances: FuelOpeningBalance[] = [
    { id: 'fob1', warehouseId: 'wh1', fuelTypeId: 'ft1', quantity: 5000, balanceDate: '2024-01-01', notes: 'Initial diesel balance' },
    { id: 'fob2', warehouseId: 'wh1', fuelTypeId: 'ft2', quantity: 1000, balanceDate: '2024-01-01', notes: 'Initial gasoline balance' },
    { id: 'fob3', warehouseId: 'wh2', fuelTypeId: 'ft1', quantity: 800, balanceDate: '2024-01-01', notes: 'Project site diesel' }
];

export const initialFuelSupplies: FuelSupply[] = [
    { id: 'fs1', supplierId: 'fuelsup1', warehouseId: 'wh1', fuelTypeId: 'ft1', quantitySupplied: 2000, unitPrice: 1.5, supplyDate: '2024-01-10', invoiceNumber: 'INV-F-101', projectId: 'proj1', notes: ''},
    { id: 'fs2', supplierId: 'fuelsup2', warehouseId: 'wh1', fuelTypeId: 'ft2', quantitySupplied: 500, unitPrice: 1.8, supplyDate: '2024-01-11', invoiceNumber: 'INV-F-102', projectId: 'proj1', notes: ''},
    { id: 'fs3', supplierId: 'fuelsup1', warehouseId: 'wh2', fuelTypeId: 'ft1', quantitySupplied: 1000, unitPrice: 1.55, supplyDate: '2024-01-18', invoiceNumber: 'INV-F-103', projectId: 'proj2', notes: ''},
    { id: 'fs4', supplierId: 'fuelsup2', warehouseId: 'wh2', fuelTypeId: 'ft1', quantitySupplied: 500, unitPrice: 1.6, supplyDate: '2024-02-05', invoiceNumber: 'INV-F-104', projectId: 'proj2', notes: 'Emergency supply'},
    { id: 'fs5', supplierId: 'fuelsup1', warehouseId: 'wh1', fuelTypeId: 'ft2', quantitySupplied: 1000, unitPrice: 1.85, supplyDate: '2024-02-10', invoiceNumber: 'INV-F-105', projectId: 'proj1', notes: 'Monthly restock'},
];

export const initialFuelDisbursements: FuelDisbursement[] = [
    { id: 'fd1', recipientType: 'frt1', recipientId: 'drv1', warehouseId: 'wh1', fuelTypeId: 'ft2', quantityIssued: 50, issueDate: '2024-01-12', projectId: 'proj1', notes: 'Trip to site' },
    { id: 'fd2', recipientType: 'frt2', recipientId: 'Main Generator', warehouseId: 'wh1', fuelTypeId: 'ft1', quantityIssued: 100, issueDate: '2024-01-15', notes: 'Power for office' },
    { id: 'fd3', recipientType: 'frt1', recipientId: 'drv2', warehouseId: 'wh1', fuelTypeId: 'ft2', quantityIssued: 60, issueDate: '2024-01-20', projectId: 'proj2', notes: 'Field visit' },
    { id: 'fd4', recipientType: 'frt2', recipientId: 'Project Generator', warehouseId: 'wh2', fuelTypeId: 'ft1', quantityIssued: 80, issueDate: '2024-01-22', notes: 'Power for project site' },
    { id: 'fd5', recipientType: 'frt1', recipientId: 'drv3', warehouseId: 'wh1', fuelTypeId: 'ft2', quantityIssued: 45, issueDate: '2024-02-01', projectId: 'proj1', notes: 'New driver first trip' },
    { id: 'fd6', recipientType: 'frt2', recipientId: 'Main Generator', warehouseId: 'wh1', fuelTypeId: 'ft1', quantityIssued: 200, issueDate: '2024-02-08', notes: 'Weekly generator run' },
    { id: 'fd7', recipientType: 'frt1', recipientId: 'drv1', warehouseId: 'wh2', fuelTypeId: 'ft2', quantityIssued: 30, issueDate: '2024-02-12', projectId: 'proj2', notes: 'Field visit in the south' },
];

export const initialFuelTransfers: FuelTransfer[] = [
    { id: 'ftr1', fromWarehouseId: 'wh1', toWarehouseId: 'wh2', fuelTypeId: 'ft1', quantity: 500, transferDate: '2024-01-20', notes: 'Stock for project site' },
    { id: 'ftr2', fromWarehouseId: 'wh1', toWarehouseId: 'wh2', fuelTypeId: 'ft2', quantity: 200, transferDate: '2024-01-25', notes: 'Replenish gasoline stock' },
];

export const initialFleetTrips: FleetTrip[] = [
    { id: 'trip1', driverId: 'drv1', projectId: 'proj1', date: '2024-01-12', distanceKm: 150, odometerStart: 10000, odometerEnd: 10150, kmPerLitre: 10, fuelRequired: 15, costRequired: 22.5, costCurrency: 'USD', fromLocation: 'Office', toLocation: 'Site A', movementType: 'Field Visit' },
    { id: 'trip2', driverId: 'drv2', projectId: 'proj2', date: '2024-01-20', distanceKm: 80, odometerStart: 50000, odometerEnd: 50080, kmPerLitre: 8, fuelRequired: 10, costRequired: 18, costCurrency: 'USD', fromLocation: 'Office', toLocation: 'Partner Office', movementType: 'Meeting' },
    { id: 'trip3', driverId: 'drv1', projectId: 'proj1', date: '2024-01-28', distanceKm: 200, odometerStart: 10150, odometerEnd: 10350, kmPerLitre: 10, fuelRequired: 20, costRequired: 30, costCurrency: 'USD', fromLocation: 'Office', toLocation: 'Site B', movementType: 'Distribution' },
    { id: 'trip4', driverId: 'drv3', projectId: 'proj1', date: '2024-02-01', distanceKm: 120, odometerStart: 25000, odometerEnd: 25120, kmPerLitre: 9, fuelRequired: 13.33, costRequired: 24, costCurrency: 'USD', fromLocation: 'Office', toLocation: 'Warehouse', movementType: 'Logistics' },
    { id: 'trip5', driverId: 'drv2', projectId: 'proj2', date: '2024-02-09', distanceKm: 300, odometerStart: 50080, odometerEnd: 50380, kmPerLitre: 8, fuelRequired: 37.5, costRequired: 67.5, costCurrency: 'USD', fromLocation: 'West Bank Office', toLocation: 'Jerusalem', movementType: 'Coordination Meeting' },
];

export const initialWorkers: Worker[] = [
    { id: 'worker1', name: 'Ahmed Ali', mobile: '0598-111-222', idNumber: '900000001', paymentMethodId: 'pm3', bankName: '', accountNumber: '', iban: '' },
    { id: 'worker2', name: 'Mohammed Hassan', mobile: '0598-222-333', idNumber: '900000002', paymentMethodId: 'pm3', bankName: '', accountNumber: '', iban: '' }
];

export const initialWorkerTransactions: WorkerTransaction[] = [
    { id: 'wtx1', workerId: 'worker1', date: '2024-01-18', workType: 'wt1', location: 'Main Warehouse', projectId: 'proj1', amountDue: 100, currency: 'ILS', notes: 'Unloading supplies' },
    { id: 'wtx2', workerId: 'worker2', date: '2024-01-19', workType: 'wt2', location: 'Project Site', projectId: 'proj2', amountDue: 150, currency: 'ILS', notes: 'Night guard duty' },
    { id: 'wtx3', workerId: 'worker1', date: '2024-01-25', workType: 'wt1', location: 'Main Warehouse', projectId: 'proj1', amountDue: 120, currency: 'ILS', notes: 'Loading distribution truck' },
    { id: 'wtx4', workerId: 'worker2', date: '2024-02-10', workType: 'wt1', location: 'Project Site', projectId: 'proj2', amountDue: 200, currency: 'ILS', notes: 'Preparing materials for workshop' },
    { id: 'wtx5', workerId: 'worker1', date: '2024-02-15', workType: 'wt2', location: 'Main Warehouse', projectId: 'proj1', amountDue: 180, currency: 'ILS', notes: 'Overnight guard duty' },
];

export const initialWarehouseItems: WarehouseItem[] = [
    { id: 'whitem1', name: 'Blankets', description: 'Wool blankets, 150x200 cm', category: 'Relief Items', unit: 'Piece', sku: 'BL-001', minimumStock: 50 },
    { id: 'whitem2', name: 'Water Bottles', description: '1.5L bottles, Box of 12', category: 'Food Items', unit: 'Box', sku: 'WB-001', minimumStock: 20 },
    { id: 'whitem3', name: 'Food Parcel - Type A', description: 'Standard food parcel for family of 5', category: 'Relief Items', unit: 'Parcel', sku: 'FP-A-001', minimumStock: 100 },
    { id: 'whitem4', name: 'Hygiene Kit', description: 'Standard hygiene kit', category: 'Relief Items', unit: 'Kit', sku: 'HK-001', minimumStock: 100 },
];

export const initialWarehouseItemOpeningBalances: WarehouseItemOpeningBalance[] = [
    { id: 'whob1', itemId: 'whitem1', warehouseId: 'wh1', unit: 'Piece', quantity: 500, balanceDate: '2024-01-01' },
    { id: 'whob2', itemId: 'whitem3', warehouseId: 'wh1', unit: 'Parcel', quantity: 200, balanceDate: '2024-01-01' },
    { id: 'whob3', itemId: 'whitem4', warehouseId: 'wh2', unit: 'Kit', quantity: 300, balanceDate: '2024-01-01' },
];

export const initialWarehouseEntities: WarehouseEntity[] = [
    { id: 'whe1', name: 'Local Partner Org', entityType: 'Receiver', contactPerson: 'Sami', contactNumber: '0597-222-333', address: 'Khan Younis', notes: '' },
    { id: 'whe2', name: 'Goods Supplier Inc.', entityType: 'Deliverer', contactPerson: 'Nadia', contactNumber: '0592-333-444', address: 'Gaza', notes: '' },
    { id: 'whe3', name: 'Rafah Distribution Point', entityType: 'Receiver', contactPerson: 'Ismail', contactNumber: '0595-444-555', address: 'Rafah', notes: '' },
];

export const initialWarehouseInvoices: WarehouseInvoice[] = [
    { id: 'whinv1', invoiceNumber: 'SUP-001', invoiceType: 'Supply', warehouseId: 'wh1', entityId: 'whe2', invoiceDate: '2024-01-15', projectId: 'proj2', remarks: 'First batch of relief items', details: [
        {id: 'd1', itemId: 'whitem1', quantity: 200, unit: 'Piece', note: ''},
        {id: 'd2', itemId: 'whitem2', quantity: 100, unit: 'Box', note: ''},
    ]},
    { id: 'whinv2', invoiceNumber: 'DIS-001', invoiceType: 'Dispatch', warehouseId: 'wh1', entityId: 'whe1', invoiceDate: '2024-01-25', projectId: 'proj2', remarks: 'Distribution for families', details: [
        {id: 'd3', itemId: 'whitem1', quantity: 50, unit: 'Piece', note: ''},
    ]},
    { id: 'whinv3', invoiceNumber: 'SUP-002', invoiceType: 'Supply', warehouseId: 'wh2', entityId: 'whe2', invoiceDate: '2024-01-28', projectId: 'proj1', remarks: 'Hygiene kits supply', details: [
        {id: 'd4', itemId: 'whitem4', quantity: 150, unit: 'Kit', note: ''},
    ]},
    { id: 'whinv4', invoiceNumber: 'DIS-002', invoiceType: 'Dispatch', warehouseId: 'wh2', entityId: 'whe3', invoiceDate: '2024-02-05', projectId: 'proj1', remarks: 'Urgent dispatch to Rafah', details: [
        {id: 'd5', itemId: 'whitem4', quantity: 100, unit: 'Kit', note: ''},
        {id: 'd6', itemId: 'whitem1', quantity: 20, unit: 'Piece', note: 'From transferred stock'},
    ]},
    { id: 'whinv5', invoiceNumber: 'SUP-003', invoiceType: 'Supply', warehouseId: 'wh1', entityId: 'whe2', invoiceDate: '2024-02-11', projectId: 'proj1', remarks: 'Additional food parcels', details: [
        {id: 'd7', itemId: 'whitem3', quantity: 150, unit: 'Parcel', note: ''}
    ]},
    { id: 'whinv6', invoiceNumber: 'DIS-003', invoiceType: 'Dispatch', warehouseId: 'wh1', entityId: 'whe1', invoiceDate: '2024-02-20', projectId: 'proj1', remarks: 'Emergency dispatch', details: [
        {id: 'd8', itemId: 'whitem3', quantity: 75, unit: 'Parcel', note: ''},
        {id: 'd9', itemId: 'whitem2', quantity: 50, unit: 'Box', note: ''}
    ]},
];

export const initialWarehouseStockTransfers: WarehouseStockTransfer[] = [
    { id: 'whst1', itemId: 'whitem1', fromWarehouseId: 'wh1', toWarehouseId: 'wh2', quantity: 100, transferDate: '2024-01-30', notes: 'For upcoming distribution' },
    { id: 'whst2', itemId: 'whitem3', fromWarehouseId: 'wh1', toWarehouseId: 'wh2', quantity: 50, transferDate: '2024-02-01', notes: 'Support Rafah distribution point' },
    { id: 'whst3', itemId: 'whitem2', fromWarehouseId: 'wh1', toWarehouseId: 'wh2', quantity: 30, transferDate: '2024-02-18', notes: 'Stock for Rafah point' },
];

export const initialAssets: Asset[] = [
    { id: 'asset1', assetTag: 'CP-2024-0001', name: 'Dell Laptop', categoryId: 'ac1', projectId: 'proj1', locationId: 'al1', serialNumber: 'SN12345', purchaseDate: '2024-01-20', purchasePrice: 1200, currency: 'USD', status: 'In Use', specifications: 'Core i7, 16GB RAM, 512GB SSD', description: 'Laptop for Project Coordinator', totalQuantity: 1 },
    { id: 'asset2', assetTag: 'CP-2024-0002', name: 'HP Printer', categoryId: 'ac1', projectId: 'proj1', locationId: 'al1', serialNumber: 'SN67890', purchaseDate: '2024-01-22', purchasePrice: 300, currency: 'USD', status: 'In Stock', specifications: 'LaserJet Pro M404dn', description: 'Office printer', totalQuantity: 1 }
];

export const initialAssetCustody: AssetCustody[] = [
    { id: 'cust1', assetId: 'asset1', employeeId: 'emp1', custodyDate: '2024-01-21', notes: 'Primary device', quantity: 1 },
];

// Mock Data for Transaction Tracking
export const initialTransactions: Transaction[] = [
    {
        id: 'tr1',
        referenceNumber: 'TR-2024-0001',
        subject: 'Leave Request - Employee One',
        typeId: '', // Would link to ArchiveClassification type 'Transaction'
        projectId: 'proj1',
        priority: 'Normal',
        status: 'Active',
        creationDate: '2024-03-01',
        createdByUserId: 'user1',
        currentHolderId: 'user2', // Finance Manager
        description: 'Annual leave request for approval.',
    },
    {
        id: 'tr2',
        referenceNumber: 'TR-2024-0002',
        subject: 'Purchase Approval - Laptops',
        typeId: '',
        projectId: 'proj2',
        priority: 'Urgent',
        status: 'Completed',
        creationDate: '2024-02-25',
        createdByUserId: 'user3',
        currentHolderId: 'user3', // Returned to creator/archivist
        description: 'Urgent purchase approval for project launch.',
    },
    {
        id: 'tr3',
        referenceNumber: 'TR-2024-0003',
        subject: 'مراجعة قالب عقد تقديم خدمات',
        typeId: '',
        projectId: 'proj1',
        priority: 'Normal',
        status: 'Active',
        creationDate: '2024-05-10T10:00:00Z',
        createdByUserId: 'user2', // Finance Manager
        currentHolderId: 'user3', // Procurement Officer
        description: 'يرجى مراجعة التعديلات على قالب عقد تقديم الخدمات وإبداء الرأي.',
    },
    {
        id: 'tr4',
        referenceNumber: 'TR-2024-0004',
        subject: 'مسودة السياسة الجديدة للموارد البشرية',
        typeId: '',
        priority: 'Normal',
        status: 'Active',
        creationDate: new Date().toISOString(),
        createdByUserId: 'user1', // Director
        currentHolderId: 'user1', // Director
        description: 'مسودة أولية لسياسة الموارد البشرية الجديدة للمراجعة الأولية.',
    },
    {
        id: 'tr5',
        referenceNumber: 'TR-2023-0105',
        subject: 'التقرير النهائي لمشروع YSP-2023',
        typeId: '',
        projectId: 'proj1',
        priority: 'Normal',
        status: 'Archived',
        creationDate: '2023-12-01T11:00:00Z',
        createdByUserId: 'user4', // Accountant
        currentHolderId: 'user4', // Accountant
        archiveLocationId: 'archloc1', 
        physicalLocation: 'Shelf 4, Box A',
        description: 'التقرير المالي والإداري النهائي للمشروع المؤرشف.',
    },
    {
        id: 'tr6',
        referenceNumber: 'TR-2024-0006',
        subject: 'تقرير الفروقات المالية للربع الأول',
        typeId: '',
        priority: 'Urgent',
        status: 'Active',
        creationDate: '2024-06-01T09:30:00Z',
        createdByUserId: 'user2', // Finance
        currentHolderId: 'user1', // Director (this will be INBOX for director)
        description: 'تقرير يوضح الفروقات بين الموازنة والمصروف الفعلي للربع الأول من العام.',
    },
    {
        id: 'tr7',
        referenceNumber: 'TR-2024-0007',
        subject: 'متابعة ملاحظات المدقق الخارجي',
        typeId: '',
        priority: 'Top Priority',
        status: 'Active',
        creationDate: '2024-05-20T15:00:00Z',
        createdByUserId: 'user5', // Auditor
        currentHolderId: 'user2', // Finance Manager
        description: 'متابعة عاجلة بخصوص ملاحظات تقرير التدقيق الخارجي الأخير.',
    }
];

export const initialTransactionMovements: TransactionMovement[] = [
    {
        id: 'mov1',
        transactionId: 'tr1',
        fromUserId: 'user1',
        toUserId: 'user3', // HR / Procurement Officer acts as HR here for mock
        date: '2024-03-01T09:00:00',
        action: 'Forwarded',
        notes: 'Please review leave balance.',
        isRead: true
    },
    {
        id: 'mov2',
        transactionId: 'tr1',
        fromUserId: 'user3',
        toUserId: 'user2', // Finance
        date: '2024-03-01T14:30:00',
        action: 'Forwarded',
        notes: 'Balance confirmed. Forwarding for financial clearance.',
        isRead: false
    },
    {
        id: 'mov3',
        transactionId: 'tr2',
        fromUserId: 'user3',
        toUserId: 'user2',
        date: '2024-02-25T10:00:00',
        action: 'Review Request',
        notes: 'Urgent approval needed.',
        isRead: true
    },
    {
        id: 'mov4',
        transactionId: 'tr2',
        fromUserId: 'user2',
        toUserId: 'user1', // Director
        date: '2024-02-26T09:00:00',
        action: 'Approved & Forwarded',
        notes: 'Budget available. Recommended for approval.',
        isRead: true
    },
    {
        id: 'mov5',
        transactionId: 'tr2',
        fromUserId: 'user1',
        toUserId: 'user3', // Back to requester
        date: '2024-02-27T11:00:00',
        action: 'Final Approval',
        notes: 'Approved. Proceed with purchase.',
        isRead: true
    },
    {
        id: 'mov6',
        transactionId: 'tr3',
        fromUserId: 'user2',
        toUserId: 'user3',
        date: '2024-05-10T10:05:00Z',
        action: 'Forwarded',
        notes: 'للمراجعة من ناحية المشتريات.',
        isRead: false
    },
    {
        id: 'mov7',
        transactionId: 'tr4',
        fromUserId: 'user1',
        toUserId: 'user1',
        date: new Date().toISOString(),
        action: 'Created',
        notes: 'تم إنشاء المعاملة.',
        isRead: true
    },
    {
        id: 'mov8',
        transactionId: 'tr5',
        fromUserId: 'user4',
        toUserId: 'user2',
        date: '2023-12-02T10:00:00Z',
        action: 'Forwarded',
        notes: 'للتدقيق المالي قبل الأرشفة.',
        isRead: true
    },
     {
        id: 'mov9',
        transactionId: 'tr5',
        fromUserId: 'user2',
        toUserId: 'user1',
        date: '2023-12-03T12:00:00Z',
        action: 'Forwarded',
        notes: 'للاعتماد النهائي.',
        isRead: true
    },
    {
        id: 'mov10',
        transactionId: 'tr5',
        fromUserId: 'user1',
        toUserId: 'user4',
        date: '2023-12-05T16:00:00Z',
        action: 'Returned',
        notes: 'تم الاعتماد، يرجى الأرشفة.',
        isRead: true
    },
    {
        id: 'mov11',
        transactionId: 'tr5',
        fromUserId: 'user4',
        toUserId: 'user4',
        date: '2023-12-06T09:00:00Z',
        action: 'Archived',
        notes: 'تمت الأرشفة بنجاح.',
        isRead: true
    },
    {
        id: 'mov12',
        transactionId: 'tr6',
        fromUserId: 'user2',
        toUserId: 'user1',
        date: '2024-06-01T09:35:00Z',
        action: 'Forwarded',
        notes: 'للاطلاع والموافقة.',
        isRead: false
    },
    {
        id: 'mov13',
        transactionId: 'tr7',
        fromUserId: 'user5',
        toUserId: 'user1',
        date: '2024-05-20T15:05:00Z',
        action: 'Forwarded',
        notes: 'تحويل للمدير التنفيذي للمتابعة.',
        isRead: true
    },
    {
        id: 'mov14',
        transactionId: 'tr7',
        fromUserId: 'user1',
        toUserId: 'user2',
        date: '2024-05-21T11:00:00Z',
        action: 'Forwarded',
        notes: 'يرجى إعداد الردود المالية على الملاحظات.',
        isRead: false
    }
];

export const initialContractAmendments: any[] = [];
export const initialActivityLog: any[] = [];
export const initialBoardSessions: any[] = [];
export const initialBoardMeetings: any[] = [];
export const initialProcurementPlans: any[] = [];
export const initialPoliciesAndManuals: any[] = [];
export const initialCorrespondenceList: any[] = [];
export const initialBackupSettings = { autoBackup: false, frequency: 'Weekly' };
export const initialDepartments: any[] = [];
export const initialArchiveLocations: any[] = [];
export const initialArchiveClassifications: any[] = [];
export const initialDocumentTypes: any[] = [];
export const initialPhysicalDocuments: any[] = [];

// --- Permissions ---

const createPermissions = (permissions: Partial<Record<Page, Partial<PermissionActions>>>): RolePermissions => {
    const allPages: Page[] = [
        'dashboard', 'suppliers', 'items', 'purchaseOrders', 'contracts', 'purchaseRequests', 
        'projects', 'users', 'activityLog', 'organization', 'approvals', 'boardOfDirectors', 'boardMembers', 
        'employees', 'boardMeetings', 'meetingSearch', 'donors', 'procurementPlans', 'procurementTracking', 
        'policiesAndManuals', 'correspondence', 'backup', 'departments', 'archiveLocations', 
        'archiveClassifications', 'documents', 'fuel', 'fleet', 'workers', 'warehouses', 'assets', 
        'projectBudgets', 'expenditures', 'budgetForecast', 'monthlyForecastReview', 'bankAccounts', 'revenues',
        'financialDashboard', 'exchangeRates', 'transactionTracking'
    ];
    
    const fullPermissions = {} as RolePermissions;

    for (const page of allPages) {
        const pagePerms = permissions[page] || {};
        fullPermissions[page] = {
            create: pagePerms.create ?? false,
            read: pagePerms.read ?? false,
            update: pagePerms.update ?? false,
            delete: pagePerms.delete ?? false,
        };
        // If any write permission is true, read should also be true
        if ((fullPermissions[page].create || fullPermissions[page].update || fullPermissions[page].delete) && pagePerms.read !== false) {
            fullPermissions[page].read = true;
        }
    }
    return fullPermissions;
};

const fullPageAccess: PermissionActions = { create: true, read: true, update: true, delete: true };
const readOnlyAccess: PermissionActions = { create: false, read: true, update: false, delete: false };

export const initialPermissionsByRole: Record<string, RolePermissions> = {
    exec_director: createPermissions({
        dashboard: { read: true }, suppliers: fullPageAccess, items: fullPageAccess, purchaseOrders: fullPageAccess,
        contracts: fullPageAccess, purchaseRequests: fullPageAccess, projects: fullPageAccess, users: fullPageAccess,
        activityLog: { read: true }, organization: fullPageAccess, approvals: fullPageAccess, boardOfDirectors: fullPageAccess,
        boardMembers: fullPageAccess, employees: fullPageAccess, boardMeetings: fullPageAccess, meetingSearch: { read: true },
        donors: fullPageAccess, procurementPlans: fullPageAccess, procurementTracking: { read: true }, policiesAndManuals: fullPageAccess,
        correspondence: fullPageAccess, backup: fullPageAccess, departments: fullPageAccess, archiveLocations: fullPageAccess,
        archiveClassifications: fullPageAccess, documents: fullPageAccess, fuel: fullPageAccess, fleet: fullPageAccess,
        workers: fullPageAccess, warehouses: fullPageAccess, assets: fullPageAccess, projectBudgets: fullPageAccess,
        expenditures: fullPageAccess, budgetForecast: fullPageAccess, monthlyForecastReview: fullPageAccess, bankAccounts: fullPageAccess,
        revenues: fullPageAccess, financialDashboard: { read: true }, exchangeRates: fullPageAccess, transactionTracking: fullPageAccess
    }),
    finance_manager: createPermissions({
        dashboard: { read: true }, approvals: fullPageAccess, projectBudgets: fullPageAccess, expenditures: fullPageAccess,
        budgetForecast: fullPageAccess, monthlyForecastReview: fullPageAccess, bankAccounts: fullPageAccess, revenues: fullPageAccess,
        projects: { read: true }, suppliers: { read: true }, purchaseRequests: { read: true }, purchaseOrders: { read: true },
        contracts: { read: true }, financialDashboard: { read: true }, exchangeRates: fullPageAccess, transactionTracking: fullPageAccess
    }),
    procurement_officer: createPermissions({
        dashboard: { read: true }, suppliers: fullPageAccess, items: fullPageAccess, purchaseRequests: fullPageAccess,
        approvals: { read: true, update: true }, purchaseOrders: fullPageAccess, contracts: fullPageAccess,
        procurementPlans: fullPageAccess, procurementTracking: { read: true }, projects: { read: true }, transactionTracking: { read: true, create: true, update: true }
    }),
    accountant: createPermissions({
        dashboard: { read: true }, expenditures: { create: true, read: true, update: true },
        revenues: { read: true, update: true }, bankAccounts: { read: true },
        projectBudgets: { read: true }, financialDashboard: { read: true }, exchangeRates: fullPageAccess, transactionTracking: { read: true, update: true }
    }),
    auditor: createPermissions({
        dashboard: { read: true }, suppliers: { read: true }, items: { read: true }, purchaseOrders: { read: true },
        contracts: { read: true }, purchaseRequests: { read: true }, projects: { read: true }, activityLog: { read: true },
        projectBudgets: { read: true }, expenditures: { read: true }, bankAccounts: { read: true }, revenues: { read: true },
        financialDashboard: { read: true }, exchangeRates: fullPageAccess, transactionTracking: { read: true }
    }),
    warehouse_keeper: createPermissions({ warehouses: { read: true } }),
    warehouse_supervisor: createPermissions({ warehouses: fullPageAccess }),
    project_coordinator: createPermissions({
        dashboard: { read: true },
        projects: { read: true, update: true },
        purchaseRequests: { create: true, read: true, update: true, delete: true },
        transactionTracking: { read: true, create: true, update: true }
    }),
    employee: createPermissions({
        dashboard: { read: true },
        transactionTracking: { read: true, create: true, update: true }
    }),
};

export const initialExchangeRates: ExchangeRate[] = [
    { id: 'rate1', year: 2024, month: 7, fromCurrency: 'USD', toCurrency: 'EUR', rate: 0.92, approvedBy: 'Finance Manager', approvedDate: '2024-07-15' },
    { id: 'rate2', year: 2024, month: 7, fromCurrency: 'ILS', toCurrency: 'EUR', rate: 0.25, approvedBy: 'Finance Manager', approvedDate: '2024-07-15' },
    { id: 'rate3', year: 2024, month: 6, fromCurrency: 'USD', toCurrency: 'EUR', rate: 0.91, approvedBy: 'Finance Manager', approvedDate: '2024-06-15' },
    { id: 'rate4', year: 2023, month: 12, fromCurrency: 'USD', toCurrency: 'EUR', rate: 0.90, approvedBy: 'Finance Manager', approvedDate: '2023-12-15' },
];