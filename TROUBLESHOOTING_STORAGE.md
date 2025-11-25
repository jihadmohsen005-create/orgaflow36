# 🔧 دليل حل مشاكل Supabase Storage

## 📋 المشكلة الشائعة: "فشل حفظ المراسلة"

### الأسباب المحتملة:

#### 1️⃣ **Bucket غير موجود**
**الحل:**
```sql
-- في Supabase Dashboard → Storage → Create Bucket
اسم Bucket: attachments
Public: نعم
```

#### 2️⃣ **سياسات الأمان (RLS Policies) غير مُعدة**
**الحل:**
```sql
-- في Supabase Dashboard → Storage → Policies

-- سياسة القراءة العامة
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'attachments' );

-- سياسة الرفع للمستخدمين المسجلين
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'attachments' );

-- سياسة الحذف للمستخدمين المسجلين
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'attachments' );
```

#### 3️⃣ **حجم الملف كبير جداً**
**الحد الأقصى:**
- Free Tier: 50 MB لكل ملف
- Pro: 5 GB لكل ملف

**الحل:**
```javascript
// في CorrespondencePage.tsx
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
        const file = e.target.files[0];
        const maxSize = 50 * 1024 * 1024; // 50 MB
        
        if (file.size > maxSize) {
            showToast('حجم الملف كبير جداً (الحد الأقصى 50 MB)', 'error');
            return;
        }
        
        setSelectedFile(file);
    }
};
```

#### 4️⃣ **اسم الملف يحتوي على أحرف غير مدعومة**
**الحل:** تم إصلاحه في `storageService.ts`:
```javascript
const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
```

#### 5️⃣ **مشكلة في الاتصال بـ Supabase**
**الحل:**
- تحقق من `.env` أو `src/lib/supabase.ts`
- تأكد من صحة `VITE_SUPABASE_URL` و `VITE_SUPABASE_ANON_KEY`

---

## 🧪 خطوات التشخيص

### 1. افتح صفحة الاختبار
```
http://localhost:3000/test-storage.html
```

### 2. اختبر الاتصال
- اضغط "اختبار الاتصال"
- يجب أن ترى: ✅ الاتصال ناجح!

### 3. تحقق من Bucket
- اضغط "فحص Bucket"
- يجب أن ترى: ✅ Bucket "attachments" موجود!

### 4. اختبر رفع ملف
- اختر ملف صغير (< 1 MB)
- اضغط "رفع ملف تجريبي"
- يجب أن ترى: ✅ تم رفع الملف بنجاح!

### 5. افحص Console في المتصفح
```
F12 → Console
```
ابحث عن رسائل الخطأ التفصيلية:
- `❌ فشل رفع الملف:`
- `Error uploading file:`
- `Error saving correspondence:`

---

## 🔍 رسائل الخطأ الشائعة وحلولها

### ❌ "Bucket not found"
**السبب:** Bucket غير موجود  
**الحل:** أنشئ bucket باسم `attachments` في Supabase Dashboard

### ❌ "new row violates row-level security policy"
**السبب:** سياسات RLS غير مُعدة  
**الحل:** أضف السياسات المذكورة أعلاه

### ❌ "The resource already exists"
**السبب:** ملف بنفس الاسم موجود  
**الحل:** تم إصلاحه - نستخدم timestamp فريد

### ❌ "Invalid file URL"
**السبب:** URL الملف غير صحيح  
**الحل:** تحقق من أن URL يبدأ بـ `https://...supabase.co/storage/v1/object/public/attachments/...`

---

## ✅ التحسينات المُطبقة

### 1. رسائل خطأ تفصيلية
```javascript
// قبل
showToast('فشل حفظ المراسلة', 'error');

// بعد
const errorMessage = error?.message || error?.error_description || 'خطأ غير معروف';
showToast(`فشل حفظ المراسلة: ${errorMessage}`, 'error');
```

### 2. معالجة أخطاء أفضل في storageService.ts
```javascript
throw new Error(`فشل رفع الملف: ${error.message || error.error || 'خطأ غير معروف'}`);
```

### 3. تنظيف أسماء الملفات
```javascript
const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
```

---

## 📝 الخطوات التالية

1. ✅ افتح `test-storage.html` واختبر جميع الوظائف
2. ✅ تأكد من وجود bucket "attachments"
3. ✅ تأكد من إعداد سياسات RLS
4. ✅ جرّب رفع ملف في صفحة المراسلات
5. ✅ افحص Console للحصول على رسالة الخطأ التفصيلية
6. ✅ أرسل رسالة الخطأ للحصول على مساعدة إضافية

---

## 🆘 الحصول على المساعدة

إذا استمرت المشكلة:
1. افتح Console (F12)
2. انسخ رسالة الخطأ الكاملة
3. التقط screenshot من صفحة test-storage.html
4. شارك المعلومات للحصول على مساعدة

---

**آخر تحديث:** 2025-01-25

