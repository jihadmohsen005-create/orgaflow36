# 🗄️ تعليمات تشغيل ملفات SQL - OrgaFlow

## 📍 معلومات مشروعك

- **اسم المشروع**: OrgaFlow
- **Project URL**: https://dihtjatqgwyyuvilacdd.supabase.co
- **حالة `.env.local`**: ✅ تم التحديث

---

## 🎯 الخطوات المطلوبة

### 1️⃣ فتح SQL Editor

1. اذهب إلى: **https://app.supabase.com**
2. افتح مشروع **OrgaFlow**
3. في القائمة الجانبية اليسرى، انقر على **SQL Editor** (أيقونة 🔧)

---

### 2️⃣ تشغيل الملف الأول: `schema.sql`

**⚠️ هذا الملف يحتوي على الجداول الأساسية (314 سطر)**

#### الخطوات:

1. في SQL Editor، انقر على **+ New query**
2. افتح ملف `supabase/schema.sql` من مجلد المشروع على جهازك
3. **حدد الكل** (Ctrl+A) ثم **انسخ** (Ctrl+C)
4. **الصق** في محرر SQL في Supabase
5. انقر على زر **Run** ▶️ (أو اضغط Ctrl+Enter)
6. **انتظر** حتى ينتهي التنفيذ (قد يستغرق 5-10 ثواني)

#### النتيجة المتوقعة:

```
Success. No rows returned
```

أو رسالة تشير إلى إنشاء الجداول بنجاح.

#### ⚠️ إذا ظهر خطأ:

- **لا تكمل** إلى الملف التالي
- **انسخ رسالة الخطأ** كاملة
- **أخبرني** بالخطأ

---

### 3️⃣ تشغيل الملف الثاني: `schema_part2.sql`

**⚠️ هذا الملف يحتوي على العقود والموارد البشرية والمالية (319 سطر)**

#### الخطوات:

1. انقر على **+ New query** (استعلام جديد)
2. افتح ملف `supabase/schema_part2.sql`
3. **حدد الكل** (Ctrl+A) ثم **انسخ** (Ctrl+C)
4. **الصق** في محرر SQL الجديد
5. انقر على **Run** ▶️
6. **انتظر** حتى ينتهي التنفيذ

#### النتيجة المتوقعة:

```
Success. No rows returned
```

---

### 4️⃣ تشغيل الملف الثالث: `schema_part3.sql`

**⚠️ هذا الملف يحتوي على العمليات والأصول (297 سطر)**

#### الخطوات:

1. انقر على **+ New query**
2. افتح ملف `supabase/schema_part3.sql`
3. **حدد الكل** (Ctrl+A) ثم **انسخ** (Ctrl+C)
4. **الصق** في محرر SQL
5. انقر على **Run** ▶️
6. **انتظر** حتى ينتهي التنفيذ

#### النتيجة المتوقعة:

```
Success. No rows returned
```

---

### 5️⃣ تشغيل الملف الرابع: `seed_data.sql`

**⚠️ هذا الملف يحتوي على البيانات الأولية (150 سطر)**

#### الخطوات:

1. انقر على **+ New query**
2. افتح ملف `supabase/seed_data.sql`
3. **حدد الكل** (Ctrl+A) ثم **انسخ** (Ctrl+C)
4. **الصق** في محرر SQL
5. انقر على **Run** ▶️
6. **انتظر** حتى ينتهي التنفيذ

#### النتيجة المتوقعة:

```
Success. Rows affected: XX
```

أو رسائل تشير إلى إدراج البيانات بنجاح.

---

## ✅ التحقق من نجاح العملية

### الطريقة 1: عرض الجداول

1. في القائمة الجانبية، انقر على **Table Editor** (📊)
2. يجب أن تشاهد قائمة طويلة من الجداول:
   - `activity_logs`
   - `approval_workflow`
   - `archive_classifications`
   - `archive_locations`
   - `asset_categories`
   - `asset_custody`
   - `asset_locations`
   - `assets`
   - `backup_settings`
   - `bank_sub_accounts`
   - `banks`
   - `board_meeting_agenda`
   - `board_meeting_attachments`
   - `board_meeting_attendees`
   - `board_meeting_decisions`
   - `board_meetings`
   - `board_members`
   - `board_sessions`
   - `budget_lines`
   - `business_types`
   - `contract_amendment_justifications`
   - `contract_amendments`
   - `contracts`
   - `correspondence`
   - `departments`
   - `document_types`
   - `donors`
   - `drivers`
   - `employees`
   - `exchange_rates`
   - `expenditures`
   - `fleet_trips`
   - `fuel_disbursements`
   - `fuel_opening_balances`
   - `fuel_recipient_types`
   - `fuel_suppliers`
   - `fuel_supplies`
   - `fuel_transfers`
   - `fuel_types`
   - `grant_payments`
   - `item_categories`
   - `items`
   - `master_board_members`
   - `organization_info`
   - `payment_methods`
   - `physical_documents`
   - `policy_manuals`
   - `procurement_plan_details`
   - `procurement_plans`
   - `project_activities`
   - `project_attachments`
   - `project_budgets`
   - `project_extensions`
   - `project_objectives`
   - `project_reports`
   - `projects`
   - `purchase_methods`
   - `purchase_order_items`
   - `purchase_orders`
   - `purchase_request_approvals`
   - `purchase_request_items`
   - `purchase_request_notes`
   - `purchase_requests`
   - `quoted_items`
   - `role_permissions`
   - `roles`
   - `supplier_attachments`
   - `supplier_quotations`
   - `supplier_types`
   - `suppliers`
   - `transaction_documents`
   - `transaction_movements`
   - `transactions`
   - `users`
   - `warehouse_entities`
   - `warehouse_invoice_details`
   - `warehouse_invoices`
   - `warehouse_item_opening_balances`
   - `warehouse_items`
   - `warehouse_stock_transfers`
   - `warehouses`
   - `work_types`
   - `worker_transactions`
   - `workers`

**المجموع: 80+ جدول** ✅

---

### الطريقة 2: التحقق من البيانات

1. في **Table Editor**، انقر على جدول **`users`**
2. يجب أن تشاهد **5 مستخدمين**:
   - director
   - finance
   - procurement
   - accountant
   - auditor

3. انقر على جدول **`suppliers`**
4. يجب أن تشاهد **3 موردين**:
   - شركة النور للتجارة
   - مؤسسة الأمل
   - شركة الفجر العالمية

5. انقر على جدول **`items`**
6. يجب أن تشاهد **3 أصناف**:
   - أجهزة كمبيوتر محمولة
   - أثاث مكتبي
   - قرطاسية

---

## 🎉 إذا رأيت كل هذا، فقد نجحت!

**الآن أخبرني:**
- ✅ "تم تشغيل جميع الملفات بنجاح"
- ✅ "أرى الجداول والبيانات"

**أو إذا واجهت مشكلة:**
- ❌ "ظهر خطأ في الملف X"
- ❌ "لا أرى الجداول"

---

**بعد التأكد من نجاح هذه الخطوة، سننتقل إلى تشغيل التطبيق! 🚀**

