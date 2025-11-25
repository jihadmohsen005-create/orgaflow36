-- =============================================
-- OrgaFlow36 - Schema Part 3
-- Operations: Fuel, Fleet, Workers, Warehouse, Assets
-- =============================================

-- =============================================
-- Fuel Management
-- =============================================

CREATE TABLE "fuel_types" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT
);

CREATE TABLE "warehouses" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "manager_name" TEXT,
    "contact_number" TEXT,
    "latitude" NUMERIC(10, 8),
    "longitude" NUMERIC(11, 8),
    "address" TEXT,
    "google_map_link" TEXT
);

CREATE TABLE "fuel_opening_balances" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "warehouse_id" UUID NOT NULL REFERENCES "warehouses"("id") ON DELETE CASCADE,
    "fuel_type_id" UUID NOT NULL REFERENCES "fuel_types"("id") ON DELETE CASCADE,
    "quantity" NUMERIC(12, 2),
    "balance_date" DATE,
    "notes" TEXT
);

CREATE TABLE "fuel_suppliers" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "contact_number" TEXT,
    "address" TEXT,
    "contact_person" TEXT,
    "notes" TEXT
);

CREATE TABLE "fuel_supplies" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "supplier_id" UUID REFERENCES "fuel_suppliers"("id") ON DELETE SET NULL,
    "warehouse_id" UUID REFERENCES "warehouses"("id") ON DELETE CASCADE,
    "fuel_type_id" UUID REFERENCES "fuel_types"("id") ON DELETE CASCADE,
    "quantity_supplied" NUMERIC(12, 2),
    "unit_price" NUMERIC(12, 2),
    "supply_date" DATE,
    "invoice_number" TEXT,
    "project_id" UUID REFERENCES "projects"("id"),
    "notes" TEXT
);

CREATE TABLE "fuel_transfers" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "from_warehouse_id" UUID REFERENCES "warehouses"("id") ON DELETE CASCADE,
    "to_warehouse_id" UUID REFERENCES "warehouses"("id") ON DELETE CASCADE,
    "fuel_type_id" UUID REFERENCES "fuel_types"("id") ON DELETE CASCADE,
    "quantity" NUMERIC(12, 2),
    "transfer_date" DATE,
    "notes" TEXT
);

CREATE TABLE "fuel_recipient_types" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL
);

CREATE TABLE "fuel_disbursements" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "recipient_type" TEXT,
    "recipient_id" TEXT,
    "recipient_name" TEXT,
    "warehouse_id" UUID REFERENCES "warehouses"("id") ON DELETE CASCADE,
    "fuel_type_id" UUID REFERENCES "fuel_types"("id") ON DELETE CASCADE,
    "quantity_issued" NUMERIC(12, 2),
    "issue_date" DATE,
    "project_id" UUID REFERENCES "projects"("id"),
    "notes" TEXT
);

-- =============================================
-- Fleet Management
-- =============================================

CREATE TABLE "drivers" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "mobile" TEXT,
    "car_type" TEXT,
    "car_number" TEXT,
    "payment_method_id" UUID REFERENCES "payment_methods"("id"),
    "bank_name" TEXT,
    "account_number" TEXT,
    "iban" TEXT
);

CREATE TABLE "fleet_trips" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "driver_id" UUID REFERENCES "drivers"("id") ON DELETE CASCADE,
    "project_id" UUID REFERENCES "projects"("id"),
    "date" DATE,
    "distance_km" NUMERIC(10, 2),
    "odometer_start" NUMERIC(10, 2),
    "odometer_end" NUMERIC(10, 2),
    "km_per_litre" NUMERIC(6, 2),
    "fuel_required" NUMERIC(10, 2),
    "cost_required" NUMERIC(12, 2),
    "cost_currency" TEXT CHECK ("cost_currency" IN ('ILS', 'USD', 'EUR')),
    "from_location" TEXT,
    "to_location" TEXT,
    "movement_type" TEXT,
    "details" TEXT
);

-- =============================================
-- Workers Management
-- =============================================

CREATE TABLE "work_types" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL
);

CREATE TABLE "workers" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "mobile" TEXT,
    "id_number" TEXT,
    "payment_method_id" UUID REFERENCES "payment_methods"("id"),
    "bank_name" TEXT,
    "account_number" TEXT,
    "iban" TEXT
);

CREATE TABLE "worker_transactions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "worker_id" UUID REFERENCES "workers"("id") ON DELETE CASCADE,
    "date" DATE,
    "work_type" TEXT,
    "location" TEXT,
    "project_id" UUID REFERENCES "projects"("id"),
    "amount_due" NUMERIC(12, 2),
    "currency" TEXT CHECK ("currency" IN ('ILS', 'USD', 'EUR')),
    "notes" TEXT
);

-- =============================================
-- Warehouse Management
-- =============================================

CREATE TABLE "warehouse_entities" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "entity_type" TEXT CHECK ("entity_type" IN ('Receiver', 'Deliverer')),
    "contact_person" TEXT,
    "contact_number" TEXT,
    "address" TEXT,
    "notes" TEXT
);

CREATE TABLE "warehouse_items" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "unit" TEXT,
    "sku" TEXT,
    "minimum_stock" INTEGER
);

CREATE TABLE "warehouse_item_opening_balances" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "item_id" UUID REFERENCES "warehouse_items"("id") ON DELETE CASCADE,
    "warehouse_id" UUID REFERENCES "warehouses"("id") ON DELETE CASCADE,
    "unit" TEXT,
    "quantity" NUMERIC(12, 2),
    "balance_date" DATE,
    "notes" TEXT
);

CREATE TABLE "warehouse_invoices" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "invoice_number" TEXT UNIQUE NOT NULL,
    "invoice_type" TEXT CHECK ("invoice_type" IN ('Supply', 'Dispatch')),
    "warehouse_id" UUID REFERENCES "warehouses"("id") ON DELETE CASCADE,
    "entity_id" UUID REFERENCES "warehouse_entities"("id"),
    "invoice_date" DATE,
    "project_id" UUID REFERENCES "projects"("id"),
    "remarks" TEXT
);

CREATE TABLE "warehouse_invoice_details" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "invoice_id" UUID NOT NULL REFERENCES "warehouse_invoices"("id") ON DELETE CASCADE,
    "item_id" UUID REFERENCES "warehouse_items"("id") ON DELETE CASCADE,
    "quantity" NUMERIC(12, 2),
    "unit" TEXT,
    "note" TEXT
);

CREATE TABLE "warehouse_stock_transfers" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "item_id" UUID REFERENCES "warehouse_items"("id") ON DELETE CASCADE,
    "from_warehouse_id" UUID REFERENCES "warehouses"("id") ON DELETE CASCADE,
    "to_warehouse_id" UUID REFERENCES "warehouses"("id") ON DELETE CASCADE,
    "quantity" NUMERIC(12, 2),
    "transfer_date" DATE,
    "notes" TEXT
);

-- =============================================
-- Assets Management
-- =============================================

CREATE TABLE "asset_categories" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "code" TEXT UNIQUE
);

CREATE TABLE "asset_locations" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL
);

CREATE TABLE "assets" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "asset_tag" TEXT UNIQUE NOT NULL,
    "name" TEXT NOT NULL,
    "category_id" UUID REFERENCES "asset_categories"("id") ON DELETE SET NULL,
    "project_id" UUID REFERENCES "projects"("id"),
    "location_id" UUID REFERENCES "asset_locations"("id"),
    "serial_number" TEXT,
    "purchase_date" DATE,
    "purchase_price" NUMERIC(12, 2),
    "currency" TEXT CHECK ("currency" IN ('ILS', 'USD', 'EUR')),
    "status" TEXT CHECK ("status" IN ('In Stock', 'In Use', 'Under Maintenance', 'Retired')),
    "specifications" TEXT,
    "description" TEXT,
    "total_quantity" INTEGER
);

CREATE TABLE "asset_custody" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "asset_id" UUID REFERENCES "assets"("id") ON DELETE CASCADE,
    "employee_id" UUID REFERENCES "employees"("id") ON DELETE CASCADE,
    "custody_date" DATE,
    "return_date" DATE,
    "notes" TEXT,
    "specifications" TEXT,
    "quantity" INTEGER
);

-- =============================================
-- Backup Settings (stored as single row)
-- =============================================

CREATE TABLE "backup_settings" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "auto_backup" BOOLEAN DEFAULT false,
    "frequency" TEXT CHECK ("frequency" IN ('Daily', 'Weekly', 'Monthly')),
    "last_backup" TIMESTAMPTZ
);

-- =============================================
-- Approval Workflow Configuration
-- =============================================

CREATE TABLE "approval_workflow" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "step_order" INTEGER NOT NULL,
    "role_id" TEXT NOT NULL REFERENCES "roles"("id"),
    UNIQUE("step_order")
);

-- =============================================
-- Role Permissions
-- =============================================

CREATE TABLE "role_permissions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "role_id" TEXT NOT NULL REFERENCES "roles"("id"),
    "page" TEXT NOT NULL,
    "can_create" BOOLEAN DEFAULT false,
    "can_read" BOOLEAN DEFAULT false,
    "can_update" BOOLEAN DEFAULT false,
    "can_delete" BOOLEAN DEFAULT false,
    UNIQUE("role_id", "page")
);

