-- =============================================
-- OrgaFlow36 - Schema Part 2
-- Contracts, HR, Board, Finance, Operations
-- =============================================

-- =============================================
-- Contracts
-- =============================================

CREATE TABLE "contracts" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "contract_number" TEXT UNIQUE NOT NULL,
    "purchase_request_id" UUID REFERENCES "purchase_requests"("id") ON DELETE SET NULL,
    "supplier_id" UUID REFERENCES "suppliers"("id") ON DELETE RESTRICT,
    "total_amount" NUMERIC(15, 2),
    "currency" TEXT CHECK ("currency" IN ('ILS', 'USD', 'EUR')),
    "terms" TEXT,
    "start_date" DATE,
    "end_date" DATE
);

CREATE TABLE "contract_amendments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "contract_id" UUID NOT NULL REFERENCES "contracts"("id") ON DELETE CASCADE,
    "amendment_date" DATE,
    "new_end_date" DATE,
    "new_total_amount" NUMERIC(15, 2)
);

CREATE TABLE "contract_amendment_justifications" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "amendment_id" UUID NOT NULL REFERENCES "contract_amendments"("id") ON DELETE CASCADE,
    "text" TEXT
);

-- =============================================
-- Archive & Transaction Tracking
-- =============================================

CREATE TABLE "archive_locations" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "code" TEXT UNIQUE,
    "location" TEXT,
    "shelves_count" INTEGER
);

CREATE TABLE "archive_classifications" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "department_id" UUID REFERENCES "departments"("id") ON DELETE SET NULL,
    "name_ar" TEXT,
    "name_en" TEXT,
    "type" TEXT CHECK ("type" IN ('Transaction', 'Document')),
    "required_document_type_ids" UUID[]
);

CREATE TABLE "physical_documents" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT,
    "project_code" TEXT,
    "creation_date" DATE,
    "year" TEXT,
    "size" TEXT CHECK ("size" IN ('Small', 'Medium', 'Large')),
    "type_id" UUID REFERENCES "document_types"("id"),
    "location_id" UUID REFERENCES "archive_locations"("id"),
    "shelf_number" INTEGER,
    "description" TEXT
);

CREATE TABLE "transactions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "reference_number" TEXT UNIQUE,
    "subject" TEXT,
    "type_id" UUID REFERENCES "archive_classifications"("id"),
    "project_id" UUID REFERENCES "projects"("id"),
    "priority" TEXT CHECK ("priority" IN ('Normal', 'Urgent', 'Top Priority')),
    "status" TEXT CHECK ("status" IN ('Active', 'Completed', 'Archived')),
    "creation_date" TIMESTAMPTZ DEFAULT now(),
    "created_by_user_id" UUID REFERENCES "users"("id"),
    "current_holder_id" UUID REFERENCES "users"("id"),
    "description" TEXT,
    "archive_location_id" UUID REFERENCES "archive_locations"("id"),
    "physical_location" TEXT
);

CREATE TABLE "transaction_documents" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "transaction_id" UUID NOT NULL REFERENCES "transactions"("id") ON DELETE CASCADE,
    "document_type_id" UUID REFERENCES "document_types"("id"),
    "file_name" TEXT,
    "file_url" TEXT,
    "file_type" TEXT,
    "status" TEXT CHECK ("status" IN ('Pending', 'Approved', 'Rejected')),
    "notes" TEXT,
    "reviewed_by_user_id" UUID REFERENCES "users"("id"),
    "review_date" TIMESTAMPTZ
);

CREATE TABLE "transaction_movements" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "transaction_id" UUID NOT NULL REFERENCES "transactions"("id") ON DELETE CASCADE,
    "from_user_id" UUID REFERENCES "users"("id"),
    "to_user_id" UUID REFERENCES "users"("id"),
    "date" TIMESTAMPTZ DEFAULT now(),
    "action" TEXT,
    "notes" TEXT,
    "is_read" BOOLEAN DEFAULT false
);

-- =============================================
-- Human Resources
-- =============================================

CREATE TABLE "employees" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "full_name" TEXT NOT NULL,
    "id_number" TEXT,
    "date_of_birth" DATE,
    "social_status" TEXT CHECK ("social_status" IN ('Single', 'Married', 'Divorced', 'Widowed')),
    "nationality" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "family_members" INTEGER,
    "spouse_name" TEXT,
    "spouse_id_number" TEXT,
    "blood_type" TEXT,
    "qualification" TEXT,
    "specialization" TEXT
);

CREATE TABLE "master_board_members" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "full_name" TEXT NOT NULL,
    "id_number" TEXT,
    "date_of_birth" DATE,
    "qualification" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "gender" TEXT CHECK ("gender" IN ('Male', 'Female')),
    "occupation" TEXT
);

CREATE TABLE "board_sessions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "session_number" TEXT UNIQUE NOT NULL,
    "start_date" DATE,
    "end_date" DATE
);

CREATE TABLE "board_members" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "session_id" UUID NOT NULL REFERENCES "board_sessions"("id") ON DELETE CASCADE,
    "master_member_id" UUID NOT NULL REFERENCES "master_board_members"("id") ON DELETE CASCADE,
    "position" TEXT CHECK ("position" IN ('Chairman', 'ViceChairman', 'Secretary', 'Treasurer', 'Member'))
);

CREATE TABLE "board_meetings" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "session_id" UUID NOT NULL REFERENCES "board_sessions"("id") ON DELETE CASCADE,
    "meeting_number" TEXT NOT NULL,
    "meeting_date" DATE
);

CREATE TABLE "board_meeting_attendees" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "meeting_id" UUID NOT NULL REFERENCES "board_meetings"("id") ON DELETE CASCADE,
    "master_member_id" UUID NOT NULL REFERENCES "master_board_members"("id") ON DELETE CASCADE,
    "attendance_status" TEXT CHECK ("attendance_status" IN ('Present', 'Absent'))
);

CREATE TABLE "board_meeting_agenda" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "meeting_id" UUID NOT NULL REFERENCES "board_meetings"("id") ON DELETE CASCADE,
    "text" TEXT
);

CREATE TABLE "board_meeting_decisions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "meeting_id" UUID NOT NULL REFERENCES "board_meetings"("id") ON DELETE CASCADE,
    "text" TEXT
);

CREATE TABLE "board_meeting_attachments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "meeting_id" UUID NOT NULL REFERENCES "board_meetings"("id") ON DELETE CASCADE,
    "name" TEXT,
    "file_url" TEXT,
    "file_type" TEXT
);

-- =============================================
-- Procurement Plans & Policies
-- =============================================

CREATE TABLE "procurement_plans" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "plan_id" INTEGER,
    "project_id" UUID REFERENCES "projects"("id") ON DELETE CASCADE,
    "from_date" DATE,
    "to_date" DATE,
    "note" TEXT
);

CREATE TABLE "procurement_plan_details" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "procurement_plan_id" UUID NOT NULL REFERENCES "procurement_plans"("id") ON DELETE CASCADE,
    "budget_code" TEXT,
    "item" TEXT,
    "description" TEXT,
    "unit" TEXT,
    "currency" TEXT CHECK ("currency" IN ('ILS', 'USD', 'EUR')),
    "estimated_cost" NUMERIC(12, 2),
    "quantity" INTEGER,
    "procurement_method" TEXT CHECK ("procurement_method" IN ('DIRECT', 'QUOTATION', 'TENDER')),
    "publication_date" DATE,
    "delivery_date" DATE,
    "status" TEXT CHECK ("status" IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED'))
);

CREATE TABLE "policy_manuals" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "year" TEXT,
    "attachment_name" TEXT,
    "attachment_url" TEXT,
    "attachment_type" TEXT,
    "notes" TEXT,
    "issue_date" DATE
);

CREATE TABLE "correspondence" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "type" TEXT CHECK ("type" IN ('Outgoing', 'Incoming')),
    "title" TEXT,
    "entity" TEXT,
    "date" DATE,
    "serial_number" TEXT,
    "sequence" INTEGER,
    "year" INTEGER,
    "project_id" UUID REFERENCES "projects"("id"),
    "attachment_name" TEXT,
    "attachment_url" TEXT,
    "attachment_type" TEXT
);

-- =============================================
-- Finance Module
-- =============================================

CREATE TABLE "banks" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "main_branch" TEXT,
    "account_number" TEXT
);

CREATE TABLE "bank_sub_accounts" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "bank_id" UUID NOT NULL REFERENCES "banks"("id") ON DELETE CASCADE,
    "account_number" TEXT,
    "iban" TEXT,
    "currency" TEXT CHECK ("currency" IN ('ILS', 'USD', 'EUR')),
    "account_symbol" TEXT
);

CREATE TABLE "exchange_rates" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "from_currency" TEXT NOT NULL,
    "to_currency" TEXT NOT NULL,
    "rate" NUMERIC(10, 6) NOT NULL,
    "approved_by" TEXT,
    "approved_date" DATE,
    UNIQUE("year", "month", "from_currency", "to_currency")
);

CREATE TABLE "project_budgets" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
    UNIQUE("project_id")
);

CREATE TABLE "budget_lines" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "project_budget_id" UUID NOT NULL REFERENCES "project_budgets"("id") ON DELETE CASCADE,
    "category" TEXT,
    "code" TEXT,
    "description_ar" TEXT,
    "description_en" TEXT,
    "unit" TEXT,
    "quantity" INTEGER,
    "unit_cost" NUMERIC(12, 2),
    "duration" INTEGER,
    "percentage" NUMERIC(5, 2),
    "total_cost" NUMERIC(15, 2),
    "forecast" JSONB
);

CREATE TABLE "expenditures" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "project_id" UUID REFERENCES "projects"("id") ON DELETE CASCADE,
    "budget_line_id" UUID REFERENCES "budget_lines"("id") ON DELETE SET NULL,
    "pv_number" TEXT,
    "payment_date" DATE,
    "invoice_number" TEXT,
    "description" TEXT,
    "payment_method_id" UUID REFERENCES "payment_methods"("id"),
    "cheque_number" TEXT,
    "purchase_method_id" UUID REFERENCES "purchase_methods"("id"),
    "original_amount" NUMERIC(15, 2),
    "original_currency" TEXT CHECK ("original_currency" IN ('ILS', 'USD', 'EUR')),
    "payment_amount" NUMERIC(15, 2),
    "payment_currency" TEXT CHECK ("payment_currency" IN ('ILS', 'USD', 'EUR')),
    "allocation_percentage" NUMERIC(5, 2),
    "exchange_rate" NUMERIC(10, 6)
);

