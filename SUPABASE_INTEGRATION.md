# 🔗 دليل دمج Supabase مع OrgaFlow36

## 📋 نظرة عامة

تم دمج نظام OrgaFlow36 مع قاعدة بيانات Supabase لتوفير:
- ✅ تخزين دائم للبيانات
- ✅ مزامنة تلقائية بين المستخدمين
- ✅ نسخ احتياطي تلقائي
- ✅ أداء محسّن مع React Query
- ✅ إمكانية التوسع المستقبلي

---

## 🏗️ البنية المعمارية

### 1. طبقة قاعدة البيانات (Supabase)
```
supabase/
├── schema.sql          # الجداول الأساسية (المستخدمين، الأدوار، الموردين، الأصناف)
├── schema_part2.sql    # العقود، الموارد البشرية، المالية
├── schema_part3.sql    # العمليات، الوقود، الأصول
├── seed_data.sql       # البيانات الأولية للاختبار
└── README.md           # دليل الإعداد
```

### 2. طبقة الخدمات (Services Layer)
```
src/services/
├── userService.ts              # إدارة المستخدمين والأدوار
├── supplierService.ts          # إدارة الموردين
├── itemService.ts              # إدارة الأصناف
├── projectService.ts           # إدارة المشاريع والجهات المانحة
└── purchaseRequestService.ts   # إدارة طلبات الشراء
```

### 3. طبقة React Query (Data Fetching)
```
src/hooks/
└── useSupabaseData.ts   # Custom hooks لجميع العمليات
```

### 4. طبقة الاتصال (Client)
```
src/lib/
└── supabase.ts          # تكوين Supabase Client
```

---

## 🚀 كيفية الاستخدام

### إعداد المشروع

1. **تثبيت المكتبات**:
```bash
npm install
```

2. **إعداد Supabase**:
   - اتبع التعليمات في `supabase/README.md`
   - أنشئ ملف `.env.local` بالمفاتيح المطلوبة

3. **تشغيل التطبيق**:
```bash
npm run dev
```

---

## 💻 أمثلة الاستخدام

### مثال 1: جلب المستخدمين

```typescript
import { useUsers } from './hooks/useSupabaseData';

function UsersPage() {
  const { data: users, isLoading, error } = useUsers();

  if (isLoading) return <div>جاري التحميل...</div>;
  if (error) return <div>خطأ: {error.message}</div>;

  return (
    <div>
      {users?.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### مثال 2: إضافة مورد جديد

```typescript
import { useCreateSupplier } from './hooks/useSupabaseData';

function AddSupplierForm() {
  const createSupplier = useCreateSupplier();

  const handleSubmit = async (supplierData) => {
    try {
      await createSupplier.mutateAsync(supplierData);
      alert('تم إضافة المورد بنجاح!');
    } catch (error) {
      alert('فشل في إضافة المورد');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### مثال 3: تحديث طلب شراء

```typescript
import { useUpdatePurchaseRequest } from './hooks/useSupabaseData';

function EditPurchaseRequest({ requestId }) {
  const updateRequest = useUpdatePurchaseRequest();

  const handleUpdate = async (updates) => {
    await updateRequest.mutateAsync({ id: requestId, updates });
  };

  return (
    // Component JSX
  );
}
```

---

## 🔄 تحويل من mockData إلى Supabase

### قبل (mockData):
```typescript
const [users, setUsers] = useState<User[]>(initialUsers);

// إضافة مستخدم
const addUser = (user: User) => {
  setUsers([...users, user]);
};
```

### بعد (Supabase):
```typescript
const { data: users } = useUsers();
const createUser = useCreateUser();

// إضافة مستخدم
const addUser = async (user: Omit<User, 'id'>) => {
  await createUser.mutateAsync(user);
  // React Query سيقوم بتحديث البيانات تلقائياً
};
```

---

## 📊 الجداول المتوفرة

### الجداول الأساسية
- ✅ `users` - المستخدمون
- ✅ `roles` - الأدوار
- ✅ `role_permissions` - صلاحيات الأدوار
- ✅ `approval_workflow` - سير عمل الموافقات
- ✅ `organization_info` - معلومات المنظمة
- ✅ `departments` - الأقسام
- ✅ `document_types` - أنواع المستندات
- ✅ `payment_methods` - طرق الدفع
- ✅ `purchase_methods` - طرق الشراء

### المشتريات والموردين
- ✅ `suppliers` - الموردين
- ✅ `supplier_types` - أنواع الموردين
- ✅ `business_types` - أنواع الأعمال
- ✅ `items` - الأصناف
- ✅ `item_categories` - فئات الأصناف
- ✅ `purchase_requests` - طلبات الشراء
- ✅ `purchase_orders` - أوامر الشراء
- ✅ `contracts` - العقود

### المشاريع والجهات المانحة
- ✅ `projects` - المشاريع
- ✅ `donors` - الجهات المانحة
- ✅ `project_objectives` - أهداف المشاريع
- ✅ `project_activities` - أنشطة المشاريع
- ✅ `grant_payments` - دفعات المنح

### الموارد البشرية
- ✅ `employees` - الموظفون
- ✅ `master_board_members` - أعضاء مجلس الإدارة
- ✅ `board_sessions` - دورات المجلس
- ✅ `board_meetings` - اجتماعات المجلس

### المالية
- ✅ `banks` - البنوك
- ✅ `bank_sub_accounts` - الحسابات الفرعية
- ✅ `project_budgets` - ميزانيات المشاريع
- ✅ `budget_lines` - بنود الميزانية
- ✅ `expenditures` - المصروفات
- ✅ `exchange_rates` - أسعار الصرف

### العمليات
- ✅ `warehouses` - المخازن
- ✅ `fuel_types` - أنواع الوقود
- ✅ `drivers` - السائقون
- ✅ `fleet_trips` - رحلات الأسطول
- ✅ `workers` - العمال
- ✅ `assets` - الأصول

---

## 🔐 الأمان

### الممارسات الحالية
- ✅ استخدام Environment Variables للمفاتيح
- ✅ عدم تخزين المفاتيح في الكود
- ⚠️ مصادقة بسيطة (يجب تحسينها)

### التحسينات المستقبلية
- 🔜 استخدام Supabase Auth
- 🔜 تفعيل Row Level Security (RLS)
- 🔜 تشفير كلمات المرور
- 🔜 JWT Tokens

---

## 📈 الأداء

### مزايا React Query
- ✅ Cache تلقائي للبيانات
- ✅ تحديث تلقائي في الخلفية
- ✅ إعادة المحاولة عند الفشل
- ✅ تحديث متفائل (Optimistic Updates)

### الإعدادات الحالية
```typescript
{
  refetchOnWindowFocus: false,  // عدم إعادة التحميل عند التركيز
  retry: 1,                     // محاولة واحدة عند الفشل
  staleTime: 5 * 60 * 1000,    // البيانات صالحة لمدة 5 دقائق
}
```

---

## 🐛 استكشاف الأخطاء

### خطأ: "Failed to fetch"
- تحقق من اتصال الإنترنت
- تحقق من صحة SUPABASE_URL في .env.local

### خطأ: "Invalid API key"
- تحقق من SUPABASE_ANON_KEY في .env.local
- تأكد من نسخ المفتاح الصحيح من Supabase Dashboard

### البيانات لا تظهر
- تحقق من تشغيل seed_data.sql
- افتح Console (F12) وتحقق من الأخطاء
- تحقق من Supabase Logs

---

## 📚 الخطوات التالية

1. ✅ إكمال دمج جميع الصفحات مع Supabase
2. 🔜 إضافة Real-time Subscriptions
3. 🔜 تحسين نظام المصادقة
4. 🔜 إضافة File Upload إلى Supabase Storage
5. 🔜 إضافة اختبارات (Tests)

---

**تم إنشاء هذا الدليل لنظام OrgaFlow36** 🚀

