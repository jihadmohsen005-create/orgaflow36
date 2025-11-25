-- =============================================
-- OrgaFlow36 - Complete Supabase Schema
-- =============================================

-- Enable UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Core & Shared Tables
-- =============================================

CREATE TABLE "organization_info" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "abbreviation" TEXT,
    "establishment_date" DATE,
    "license_number" TEXT,
    "phone" TEXT,
    "mobile" TEXT,
    "fax" TEXT,
    "email" TEXT,
    "address" TEXT,
    "logo_url" TEXT, -- Should store a URL to Supabase Storage
    "website" TEXT
);

CREATE TABLE "departments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL
);

CREATE TABLE "document_types" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL
);

CREATE TABLE "payment_methods" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL
);

CREATE TABLE "purchase_methods" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL
);

-- =============================================
-- User & Role Management
-- =============================================

CREATE TABLE "roles" (
    "id" TEXT PRIMARY KEY, -- Using text for IDs like 'exec_director'
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL
);

CREATE TABLE "users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "username" TEXT UNIQUE NOT NULL,
    "password" TEXT, -- For demo purposes, in production use Supabase Auth
    "role_id" TEXT REFERENCES "roles"("id") ON DELETE SET NULL,
    "name" TEXT NOT NULL
);

CREATE TABLE "activity_logs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
    "user_name" TEXT,
    "action_type" TEXT CHECK ("action_type" IN ('create', 'update', 'delete')),
    "entity_type" TEXT,
    "entity_name" TEXT,
    "timestamp" TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- Procurement & Suppliers
-- =============================================

CREATE TABLE "supplier_types" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL
);

CREATE TABLE "business_types" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL
);

CREATE TABLE "suppliers" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "phone" TEXT,
    "phone2" TEXT,
    "address" TEXT,
    "licensed_dealer" TEXT,
    "type_id" UUID REFERENCES "supplier_types"("id") ON DELETE SET NULL,
    "email" TEXT,
    "authorized_person" TEXT,
    "chairman" TEXT,
    "id_number" TEXT,
    "business_id" UUID REFERENCES "business_types"("id") ON DELETE SET NULL
);

CREATE TABLE "supplier_attachments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "supplier_id" UUID NOT NULL REFERENCES "suppliers"("id") ON DELETE CASCADE,
    "name" TEXT,
    "description" TEXT,
    "file_url" TEXT, -- URL to Supabase Storage
    "file_type" TEXT
);

CREATE TABLE "item_categories" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL
);

CREATE TABLE "items" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "category_id" UUID REFERENCES "item_categories"("id") ON DELETE SET NULL,
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "description_ar" TEXT,
    "description_en" TEXT,
    "unit" TEXT,
    "estimated_price" NUMERIC(12, 2),
    "currency" TEXT CHECK ("currency" IN ('ILS', 'USD', 'EUR')),
    "notes" TEXT
);

-- =============================================
-- Projects & Donors
-- =============================================

CREATE TABLE "donors" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "donor_code" TEXT,
    "contact_person" TEXT,
    "phone_number" TEXT,
    "email" TEXT,
    "website" TEXT
);

CREATE TABLE "projects" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "project_code" TEXT UNIQUE,
    "project_number" TEXT,
    "start_date" DATE,
    "end_date" DATE,
    "budget" NUMERIC(15, 2),
    "currency" TEXT CHECK ("currency" IN ('ILS', 'USD', 'EUR')),
    "location" TEXT,
    "donor_id" UUID REFERENCES "donors"("id") ON DELETE SET NULL,
    "partner" TEXT,
    "direct_beneficiaries" INTEGER,
    "indirect_beneficiaries" INTEGER,
    "description_ar" TEXT,
    "description_en" TEXT,
    "grant_amount" NUMERIC(15, 2),
    "overhead" NUMERIC(15, 2),
    "deductions" NUMERIC(15, 2)
);

CREATE TABLE "project_objectives" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
    "objective_ar" TEXT,
    "objective_en" TEXT
);

CREATE TABLE "project_activities" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
    "activity_ar" TEXT,
    "activity_en" TEXT
);

CREATE TABLE "project_extensions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
    "amendment_date" DATE,
    "new_end_date" DATE,
    "new_total_budget" NUMERIC(15, 2),
    "notes" TEXT,
    "attachment_name" TEXT,
    "attachment_url" TEXT,
    "attachment_type" TEXT
);

CREATE TABLE "project_attachments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
    "attachment_type" TEXT,
    "description" TEXT,
    "file_name" TEXT,
    "file_url" TEXT,
    "file_type" TEXT
);

CREATE TABLE "project_reports" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
    "report_type" TEXT,
    "due_date" DATE,
    "submit_date" DATE,
    "report_status" TEXT,
    "notes" TEXT
);

CREATE TABLE "project_grant_payments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
    "pay_num" INTEGER,
    "planned_date" DATE,
    "planned_amount" NUMERIC(15, 2),
    "per" NUMERIC(5, 2),
    "status" TEXT,
    "actual_amount" NUMERIC(15, 2),
    "receipt_date" DATE,
    "next_req_spend" NUMERIC(5, 2)
);

-- =============================================
-- Purchase Cycle
-- =============================================

CREATE TABLE "purchase_requests" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "request_code" TEXT UNIQUE NOT NULL,
    "project_id" UUID REFERENCES "projects"("id") ON DELETE RESTRICT,
    "name_ar" TEXT,
    "name_en" TEXT,
    "currency" TEXT CHECK ("currency" IN ('ILS', 'USD', 'EUR')),
    "purchase_method" TEXT CHECK ("purchase_method" IN ('DIRECT', 'QUOTATION', 'TENDER')),
    "request_date" DATE,
    "publication_date" DATE,
    "deadline_date" DATE,
    "requester_name" TEXT,
    "status" TEXT NOT NULL
);

CREATE TABLE "purchase_request_items" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "purchase_request_id" UUID NOT NULL REFERENCES "purchase_requests"("id") ON DELETE CASCADE,
    "item_id" UUID NOT NULL REFERENCES "items"("id") ON DELETE RESTRICT,
    "quantity" INTEGER NOT NULL,
    UNIQUE("purchase_request_id", "item_id")
);

CREATE TABLE "purchase_request_notes" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "purchase_request_id" UUID NOT NULL REFERENCES "purchase_requests"("id") ON DELETE CASCADE,
    "text" TEXT,
    "date" DATE,
    "user_name" TEXT
);

CREATE TABLE "purchase_request_approvals" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "purchase_request_id" UUID NOT NULL REFERENCES "purchase_requests"("id") ON DELETE CASCADE,
    "role_id" TEXT NOT NULL REFERENCES "roles"("id"),
    "status" TEXT CHECK ("status" IN ('PENDING', 'APPROVED', 'REJECTED')),
    "user_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
    "user_name" TEXT,
    "date" TIMESTAMPTZ,
    "comments" TEXT
);

CREATE TABLE "supplier_quotations" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "purchase_request_id" UUID NOT NULL REFERENCES "purchase_requests"("id") ON DELETE CASCADE,
    "supplier_id" UUID NOT NULL REFERENCES "suppliers"("id") ON DELETE CASCADE,
    "quotation_date" DATE,
    "discount" NUMERIC(5, 2)
);

CREATE TABLE "quoted_items" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "quotation_id" UUID NOT NULL REFERENCES "supplier_quotations"("id") ON DELETE CASCADE,
    "item_id" UUID NOT NULL REFERENCES "items"("id") ON DELETE RESTRICT,
    "price" NUMERIC(12, 2) NOT NULL,
    UNIQUE("quotation_id", "item_id")
);

CREATE TABLE "purchase_orders" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "po_number" TEXT UNIQUE NOT NULL,
    "supplier_id" UUID REFERENCES "suppliers"("id") ON DELETE RESTRICT,
    "purchase_request_id" UUID REFERENCES "purchase_requests"("id") ON DELETE RESTRICT,
    "total_amount" NUMERIC(15, 2),
    "status" TEXT CHECK ("status" IN ('PENDING', 'AWARDED', 'COMPLETED')),
    "creation_date" DATE
);

CREATE TABLE "purchase_order_items" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "purchase_order_id" UUID NOT NULL REFERENCES "purchase_orders"("id") ON DELETE CASCADE,
    "item_id" UUID NOT NULL REFERENCES "items"("id") ON DELETE RESTRICT,
    "quantity" INTEGER NOT NULL,
    "price" NUMERIC(12, 2) NOT NULL
);

