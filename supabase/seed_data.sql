-- =============================================
-- OrgaFlow36 - Seed Data
-- Initial data for testing and development
-- =============================================

-- =============================================
-- Roles
-- =============================================

INSERT INTO "roles" ("id", "name_ar", "name_en") VALUES
('exec_director', 'مدير تنفيذي', 'Executive Director'),
('finance_manager', 'مدير مالي', 'Finance Manager'),
('procurement_officer', 'موظف مشتريات', 'Procurement Officer'),
('warehouse_keeper', 'أمين مخازن', 'Warehouse Keeper'),
('warehouse_supervisor', 'مشرف مخازن', 'Warehouse Supervisor'),
('project_coordinator', 'منسق مشروع', 'Project Coordinator'),
('employee', 'موظف', 'Employee'),
('accountant', 'محاسب', 'Accountant'),
('auditor', 'مدقق', 'Auditor');

-- =============================================
-- Users
-- =============================================

INSERT INTO "users" ("id", "username", "password", "role_id", "name") VALUES
('11111111-1111-1111-1111-111111111111', 'director', '123', 'exec_director', 'Executive Director'),
('22222222-2222-2222-2222-222222222222', 'finance', '123', 'finance_manager', 'Finance Manager'),
('33333333-3333-3333-3333-333333333333', 'procurement', '123', 'procurement_officer', 'Procurement Officer'),
('44444444-4444-4444-4444-444444444444', 'accountant', '123', 'accountant', 'Accountant'),
('55555555-5555-5555-5555-555555555555', 'auditor', '123', 'auditor', 'Auditor');

-- =============================================
-- Approval Workflow
-- =============================================

INSERT INTO "approval_workflow" ("step_order", "role_id") VALUES
(1, 'procurement_officer'),
(2, 'finance_manager'),
(3, 'exec_director');

-- =============================================
-- Organization Info
-- =============================================

INSERT INTO "organization_info" (
    "name_ar", "name_en", "abbreviation", "establishment_date", 
    "license_number", "phone", "mobile", "fax", "email", 
    "address", "website"
) VALUES (
    'OrgaFlow', 'OrgaFlow', 'TA', '2023-01-01',
    'RA-123-B', '08-282-5333', '059-555-3348', '08-282-5333',
    'info@orgaflow.ps', 'Gaza, Palestine', 'www.orgaflow.ps'
);

-- =============================================
-- Payment & Purchase Methods
-- =============================================

INSERT INTO "payment_methods" ("name_ar", "name_en") VALUES
('تحويل بنكي', 'Bank Transfer'),
('شيك', 'Cheque'),
('نقدي', 'Cash');

INSERT INTO "purchase_methods" ("name_ar", "name_en") VALUES
('شراء مباشر', 'Direct Purchase'),
('عرض أسعار', 'Quotation');

-- =============================================
-- Document Types
-- =============================================

INSERT INTO "document_types" ("id", "name_ar", "name_en") VALUES
('d1111111-1111-1111-1111-111111111111', 'عقد', 'Contract'),
('d2222222-2222-2222-2222-222222222222', 'فاتورة', 'Invoice'),
('d3333333-3333-3333-3333-333333333333', 'تقرير', 'Report');

-- =============================================
-- Donors
-- =============================================

INSERT INTO "donors" ("id", "name_ar", "name_en", "donor_code", "contact_person", "phone_number", "email", "website") VALUES
('donor111-1111-1111-1111-111111111111', 'الصندوق العربي للإنماء الاقتصادي والاجتماعي', 'Arab Fund for Economic and Social Development', 'AFESD', 'Mr. Ali', '+965-1234567', 'info@afesd.org', 'www.afesd.org'),
('donor222-2222-2222-2222-222222222222', 'البنك الإسلامي للتنمية', 'Islamic Development Bank', 'IsDB', 'Ms. Fatima', '+966-12-636-1400', 'info@isdb.org', 'www.isdb.org');

-- =============================================
-- Supplier Types & Business Types
-- =============================================

INSERT INTO "supplier_types" ("id", "name_ar", "name_en") VALUES
('st111111-1111-1111-1111-111111111111', 'مورد محلي', 'Local Supplier'),
('st222222-2222-2222-2222-222222222222', 'مورد دولي', 'International Supplier');

INSERT INTO "business_types" ("id", "name_ar", "name_en") VALUES
('bt111111-1111-1111-1111-111111111111', 'تجارة عامة', 'General Trade'),
('bt222222-2222-2222-2222-222222222222', 'تصنيع', 'Manufacturing'),
('bt333333-3333-3333-3333-333333333333', 'خدمات', 'Services');

-- =============================================
-- Suppliers
-- =============================================

INSERT INTO "suppliers" ("id", "name_ar", "name_en", "phone", "phone2", "address", "licensed_dealer", "type_id", "email", "authorized_person", "chairman", "id_number", "business_id") VALUES
('sup11111-1111-1111-1111-111111111111', 'شركة ألفا للتوريدات', 'Alpha Supplies Co.', '0501234567', '', 'الرياض', '1010123456', 'st111111-1111-1111-1111-111111111111', 'info@alpha.com', 'أحمد محمود', 'خالد عبدالله', '1234567890', 'bt111111-1111-1111-1111-111111111111'),
('sup22222-2222-2222-2222-222222222222', 'مؤسسة بيتا التجارية', 'Beta Trading Est.', '0557654321', '', 'جدة', '1010654321', 'st111111-1111-1111-1111-111111111111', 'contact@beta.com', 'فاطمة علي', 'سارة إبراهيم', '0987654321', 'bt333333-3333-3333-3333-333333333333'),
('sup33333-3333-3333-3333-333333333333', 'مصنع جاما للصناعات', 'Gamma Industries', '0533334444', '', 'الدمام', '1010789012', 'st111111-1111-1111-1111-111111111111', 'sales@gamma.com', 'يوسف حسن', 'محمد سالم', '1122334455', 'bt222222-2222-2222-2222-222222222222');

-- =============================================
-- Item Categories
-- =============================================

INSERT INTO "item_categories" ("id", "name_ar", "name_en") VALUES
('cat11111-1111-1111-1111-111111111111', 'أجهزة إلكترونية', 'Electronics'),
('cat22222-2222-2222-2222-222222222222', 'قرطاسية ومستلزمات مكتبية', 'Stationery & Office Supplies'),
('cat33333-3333-3333-3333-333333333333', 'مواد تدريبية', 'Training Materials');

-- =============================================
-- Items
-- =============================================

INSERT INTO "items" ("id", "category_id", "name_ar", "name_en", "description_ar", "description_en", "unit", "estimated_price", "currency", "notes") VALUES
('item1111-1111-1111-1111-111111111111', 'cat11111-1111-1111-1111-111111111111', 'جهاز حاسوب محمول', 'Laptop Computer', 'مواصفات قياسية', 'Standard specifications', 'قطعة', 1000, 'USD', ''),
('item2222-2222-2222-2222-222222222222', 'cat22222-2222-2222-2222-222222222222', 'ورق طباعة A4', 'A4 Printing Paper', 'حزمة 500 ورقة', 'Pack of 500 sheets', 'حزمة', 5, 'USD', ''),
('item3333-3333-3333-3333-333333333333', 'cat33333-3333-3333-3333-333333333333', 'كتيب تدريبي', 'Training Manual', 'كتيب ملون', 'Colored manual', 'كتيب', 15, 'USD', '');

-- =============================================
-- Fuel Types
-- =============================================

INSERT INTO "fuel_types" ("id", "name", "description") VALUES
('fuel1111-1111-1111-1111-111111111111', 'بنزين 95', 'Gasoline 95 Octane'),
('fuel2222-2222-2222-2222-222222222222', 'ديزل', 'Diesel');

-- =============================================
-- Warehouses
-- =============================================

INSERT INTO "warehouses" ("id", "name", "manager_name", "contact_number", "address") VALUES
('ware1111-1111-1111-1111-111111111111', 'المخزن الرئيسي', 'أحمد محمد', '0501234567', 'غزة'),
('ware2222-2222-2222-2222-222222222222', 'المخزن الفرعي', 'محمد علي', '0507654321', 'خان يونس');

-- =============================================
-- Asset Categories & Locations
-- =============================================

INSERT INTO "asset_categories" ("id", "name_ar", "name_en", "code") VALUES
('ascat111-1111-1111-1111-111111111111', 'أجهزة كمبيوتر', 'Computers', 'CP'),
('ascat222-2222-2222-2222-222222222222', 'أثاث', 'Furniture', 'FR'),
('ascat333-3333-3333-3333-333333333333', 'مركبات', 'Vehicles', 'VH');

INSERT INTO "asset_locations" ("id", "name") VALUES
('asloc111-1111-1111-1111-111111111111', 'المكتب الرئيسي'),
('asloc222-2222-2222-2222-222222222222', 'المكتب الفرعي');

-- =============================================
-- Work Types & Fuel Recipient Types
-- =============================================

INSERT INTO "work_types" ("id", "name_ar", "name_en") VALUES
('wt111111-1111-1111-1111-111111111111', 'بناء', 'Construction'),
('wt222222-2222-2222-2222-222222222222', 'صيانة', 'Maintenance');

INSERT INTO "fuel_recipient_types" ("id", "name_ar", "name_en") VALUES
('frt11111-1111-1111-1111-111111111111', 'سائق', 'Driver'),
('frt22222-2222-2222-2222-222222222222', 'مركبة', 'Vehicle'),
('frt33333-3333-3333-3333-333333333333', 'مولد كهربائي', 'Generator');

