# 👨‍💻 دليل المطورين - OrgaFlow36

## 📋 نظرة عامة

هذا الدليل موجه للمطورين الذين يريدون فهم بنية النظام والمساهمة في تطويره.

---

## 🏗️ البنية المعمارية

### نمط المعمارية: Layered Architecture

```
┌─────────────────────────────────────┐
│     Presentation Layer (React)      │  ← المكونات والصفحات
├─────────────────────────────────────┤
│   Data Access Layer (React Query)   │  ← Custom Hooks
├─────────────────────────────────────┤
│    Business Logic (Services)        │  ← معالجة البيانات
├─────────────────────────────────────┤
│   Database Layer (Supabase)         │  ← قاعدة البيانات
└─────────────────────────────────────┘
```

---

## 📁 هيكل المشروع

```
orgaflow36/
├── public/                    # الملفات الثابتة
├── src/
│   ├── components/           # المكونات المشتركة
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── ...
│   ├── pages/                # صفحات التطبيق
│   │   ├── suppliers/
│   │   ├── items/
│   │   ├── projects/
│   │   └── ...
│   ├── services/             # طبقة الخدمات
│   │   ├── userService.ts
│   │   ├── supplierService.ts
│   │   ├── itemService.ts
│   │   ├── projectService.ts
│   │   └── purchaseRequestService.ts
│   ├── hooks/                # Custom Hooks
│   │   └── useSupabaseData.ts
│   ├── providers/            # Context Providers
│   │   └── QueryProvider.tsx
│   ├── lib/                  # المكتبات والأدوات
│   │   └── supabase.ts
│   ├── types.ts              # TypeScript Types
│   ├── translations.ts       # الترجمات
│   ├── mockData.ts           # البيانات الوهمية (للتطوير)
│   ├── LanguageContext.tsx   # إدارة اللغات
│   ├── ToastContext.tsx      # إدارة الإشعارات
│   └── App.tsx               # المكون الرئيسي
├── supabase/                 # قاعدة البيانات
│   ├── schema.sql
│   ├── schema_part2.sql
│   ├── schema_part3.sql
│   ├── seed_data.sql
│   └── README.md
├── index.html
├── index.tsx                 # نقطة الدخول
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .env.example
```

---

## 🔧 التقنيات المستخدمة

### Frontend
- **React 19.2.0** - مكتبة UI
- **TypeScript** - لغة البرمجة
- **Vite 6.2.0** - أداة البناء
- **Tailwind CSS** - التنسيق (عبر CDN)

### Backend & Database
- **Supabase** - قاعدة بيانات PostgreSQL
- **@supabase/supabase-js** - مكتبة الاتصال

### State Management & Data Fetching
- **@tanstack/react-query** - إدارة حالة الخادم
- **React Context** - إدارة الحالة المحلية

### Additional Libraries
- **jsPDF** - تصدير PDF
- **html2canvas** - تحويل HTML إلى صور
- **XLSX** - تصدير Excel

---

## 🎯 المفاهيم الأساسية

### 1. Services Layer

كل خدمة مسؤولة عن التعامل مع نوع معين من البيانات:

```typescript
// src/services/supplierService.ts
export const fetchSuppliers = async (): Promise<Supplier[]> => {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('name_ar');

  if (error) throw error;
  return data || [];
};
```

**المسؤوليات:**
- ✅ الاتصال بقاعدة البيانات
- ✅ معالجة الأخطاء
- ✅ تحويل البيانات من/إلى تنسيق قاعدة البيانات

### 2. Custom Hooks

توفر واجهة سهلة للمكونات للتعامل مع البيانات:

```typescript
// src/hooks/useSupabaseData.ts
export const useSuppliers = () => {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: supplierService.fetchSuppliers,
  });
};
```

**المزايا:**
- ✅ Cache تلقائي
- ✅ إعادة التحميل التلقائي
- ✅ معالجة حالات التحميل والأخطاء

### 3. React Query

نستخدم React Query لإدارة حالة الخادم:

```typescript
const { data, isLoading, error } = useSuppliers();
const createSupplier = useCreateSupplier();

// استخدام في المكون
if (isLoading) return <Loading />;
if (error) return <Error message={error.message} />;

return <SuppliersList suppliers={data} />;
```

---

## 🔄 تدفق البيانات (Data Flow)

### قراءة البيانات (Read)

```
Component → useSuppliers() → React Query → supplierService.fetchSuppliers() → Supabase → Database
                                ↓
                            Cache ← Data
```

### كتابة البيانات (Write)

```
Component → createSupplier.mutateAsync() → supplierService.createSupplier() → Supabase → Database
                                                        ↓
                                            React Query invalidates cache
                                                        ↓
                                            Auto refetch data
```

---

## 🎨 نمط الكود (Code Style)

### تسمية الملفات
- **Components**: PascalCase (e.g., `Header.tsx`)
- **Services**: camelCase (e.g., `userService.ts`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useSupabaseData.ts`)

### تسمية المتغيرات
- **camelCase** للمتغيرات والدوال
- **PascalCase** للمكونات والأنواع
- **UPPER_CASE** للثوابت

### TypeScript Types

```typescript
// استخدم interfaces للكائنات
interface User {
  id: string;
  name: string;
  roleId: string;
}

// استخدم type للأنواع المعقدة
type Status = 'PENDING' | 'APPROVED' | 'REJECTED';
```

---

## 🔐 الأمان

### Environment Variables

```typescript
// ✅ صحيح
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// ❌ خطأ - لا تضع المفاتيح مباشرة في الكود
const supabaseUrl = 'https://xxxxx.supabase.co';
```

### معالجة الأخطاء

```typescript
// ✅ صحيح
try {
  const data = await createSupplier(supplierData);
  showToast('تم الحفظ بنجاح', 'success');
} catch (error) {
  console.error('Error:', error);
  showToast('فشل في الحفظ', 'error');
}

// ❌ خطأ - عدم معالجة الأخطاء
const data = await createSupplier(supplierData);
```

---

## 📝 إضافة ميزة جديدة

### مثال: إضافة إدارة الفواتير

#### 1. إنشاء جدول في قاعدة البيانات

```sql
CREATE TABLE "invoices" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "invoice_number" TEXT UNIQUE NOT NULL,
    "supplier_id" UUID REFERENCES "suppliers"("id"),
    "amount" NUMERIC(15, 2),
    "date" DATE,
    "status" TEXT CHECK ("status" IN ('PENDING', 'PAID', 'CANCELLED'))
);
```

#### 2. إضافة Type في types.ts

```typescript
export interface Invoice {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  amount: number;
  date: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
}
```

#### 3. إنشاء Service

```typescript
// src/services/invoiceService.ts
import { supabase } from '../lib/supabase';
import { Invoice } from '../types';

export const fetchInvoices = async (): Promise<Invoice[]> => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('date', { ascending: false });

  if (error) throw error;
  
  return (data || []).map(inv => ({
    id: inv.id,
    invoiceNumber: inv.invoice_number,
    supplierId: inv.supplier_id,
    amount: inv.amount,
    date: inv.date,
    status: inv.status,
  }));
};

export const createInvoice = async (invoice: Omit<Invoice, 'id'>): Promise<Invoice> => {
  const { data, error } = await supabase
    .from('invoices')
    .insert([{
      invoice_number: invoice.invoiceNumber,
      supplier_id: invoice.supplierId,
      amount: invoice.amount,
      date: invoice.date,
      status: invoice.status,
    }])
    .select()
    .single();

  if (error) throw error;
  
  return {
    id: data.id,
    invoiceNumber: data.invoice_number,
    supplierId: data.supplier_id,
    amount: data.amount,
    date: data.date,
    status: data.status,
  };
};
```

#### 4. إضافة Hooks

```typescript
// في src/hooks/useSupabaseData.ts
import * as invoiceService from '../services/invoiceService';

export const useInvoices = () => {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: invoiceService.fetchInvoices,
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: invoiceService.createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};
```

#### 5. إنشاء المكون

```typescript
// src/pages/invoices/InvoicesPage.tsx
import { useInvoices, useCreateInvoice } from '../../hooks/useSupabaseData';

export const InvoicesPage = () => {
  const { data: invoices, isLoading } = useInvoices();
  const createInvoice = useCreateInvoice();

  if (isLoading) return <div>جاري التحميل...</div>;

  return (
    <div>
      {/* UI للفواتير */}
    </div>
  );
};
```

---

## 🧪 الاختبار

### اختبار الخدمات

```typescript
// __tests__/services/supplierService.test.ts
import { fetchSuppliers } from '../../services/supplierService';

describe('supplierService', () => {
  it('should fetch suppliers', async () => {
    const suppliers = await fetchSuppliers();
    expect(suppliers).toBeInstanceOf(Array);
  });
});
```

---

## 📚 موارد إضافية

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Docs](https://supabase.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [Vite Guide](https://vitejs.dev/guide/)

---

**Happy Coding! 🚀**

