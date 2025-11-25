# 🔄 خطة الانتقال إلى Supabase Storage

## 📋 نظرة عامة

هذا الدليل يشرح كيفية الانتقال من تخزين المرفقات كـ Base64 في PostgreSQL إلى استخدام Supabase Storage.

---

## 🎯 الأهداف

1. ✅ تقليل حجم قاعدة البيانات بنسبة 90%
2. ✅ تحسين الأداء
3. ✅ تقليل التكلفة
4. ✅ دعم ملفات أكبر (حتى 50 MB)
5. ✅ استخدام CDN للتحميل الأسرع

---

## 📊 المقارنة

### **قبل (Base64):**
```
100 ملف × 1 MB = 133 MB في PostgreSQL
تكلفة: عالية
أداء: بطيء
```

### **بعد (Supabase Storage):**
```
100 ملف × 1 MB = 100 MB في Storage
100 URL × 100 bytes = 10 KB في PostgreSQL
تكلفة: منخفضة
أداء: سريع
```

---

## 🛠️ خطوات التنفيذ

### **المرحلة 1: إعداد Supabase Storage**

#### **1.1 إنشاء Bucket في Supabase**

```sql
-- في Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', true);
```

أو من لوحة التحكم:
1. اذهب إلى **Storage** في Supabase Dashboard
2. اضغط **Create a new bucket**
3. الاسم: `attachments`
4. Public: ✅ (للسماح بالوصول المباشر)

#### **1.2 إعداد السياسات (Policies)**

```sql
-- السماح بالقراءة للجميع
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'attachments');

-- السماح بالرفع للمستخدمين المسجلين فقط
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'attachments' AND auth.role() = 'authenticated');

-- السماح بالحذف للمستخدمين المسجلين فقط
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'attachments' AND auth.role() = 'authenticated');
```

---

### **المرحلة 2: إنشاء خدمة رفع الملفات**

#### **2.1 إنشاء `src/services/storageService.ts`**

```typescript
import { supabase } from '../lib/supabase';

/**
 * رفع ملف إلى Supabase Storage
 */
export const uploadFile = async (
  file: File,
  folder: string,
  entityId: string
): Promise<string> => {
  try {
    // إنشاء اسم فريد للملف
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const filePath = `${folder}/${entityId}/${fileName}`;

    // رفع الملف
    const { data, error } = await supabase.storage
      .from('attachments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    // الحصول على URL العام
    const { data: { publicUrl } } = supabase.storage
      .from('attachments')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('فشل رفع الملف:', error);
    throw error;
  }
};

/**
 * حذف ملف من Supabase Storage
 */
export const deleteFile = async (fileUrl: string): Promise<void> => {
  try {
    // استخراج المسار من URL
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts.slice(pathParts.indexOf('attachments') + 1).join('/');

    const { error } = await supabase.storage
      .from('attachments')
      .remove([filePath]);

    if (error) throw error;
  } catch (error) {
    console.error('فشل حذف الملف:', error);
    throw error;
  }
};

/**
 * تحميل ملف من Supabase Storage
 */
export const downloadFile = async (fileUrl: string): Promise<Blob> => {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error('فشل تحميل الملف');
    return await response.blob();
  } catch (error) {
    console.error('فشل تحميل الملف:', error);
    throw error;
  }
};
```

---

### **المرحلة 3: تحديث خدمة الموردين**

#### **3.1 تعديل `src/services/supplierService.ts`**

```typescript
import { uploadFile, deleteFile } from './storageService';

export const createSupplier = async (supplier: Partial<Supplier>): Promise<Supplier> => {
  const { attachments, ...supplierData } = supplier;

  // إدراج المورد
  const { data, error } = await supabase
    .from('suppliers')
    .insert([supplierData])
    .select()
    .single();

  if (error) throw error;

  // رفع المرفقات إلى Storage
  if (attachments && attachments.length > 0) {
    const uploadedAttachments = [];

    for (const att of attachments) {
      // رفع الملف إلى Storage
      const fileUrl = await uploadFile(
        att.file,           // File object
        'suppliers',        // folder
        data.id             // entityId
      );

      // حفظ معلومات المرفق في قاعدة البيانات
      const { data: attachmentData, error: attError } = await supabase
        .from('supplier_attachments')
        .insert({
          supplier_id: data.id,
          name: att.name,
          description: att.description,
          file_url: fileUrl,  // ← URL حقيقي، ليس Base64
          file_type: att.type,
        })
        .select()
        .single();

      if (!attError) {
        uploadedAttachments.push(attachmentData);
      }
    }
  }

  return data;
};
```

---

### **المرحلة 4: تحديث واجهة المستخدم**

#### **4.1 تعديل `pages/SuppliersPage.tsx`**

```typescript
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!newAttachmentDesc.trim()) {
    showToast(t.suppliers.attachmentDescriptionRequired, 'error');
    return;
  }

  if (e.target.files?.[0]) {
    const file = e.target.files[0];

    // لا حاجة لتحويل إلى Base64!
    // فقط حفظ File object
    const newAttachment = {
      id: `att-${Date.now()}`,
      name: file.name,
      description: newAttachmentDesc,
      file: file,  // ← File object مباشرة
      type: file.type,
    };

    setFormData(prev => ({
      ...prev,
      attachments: [...(prev.attachments || []), newAttachment],
    }));

    setNewAttachmentDesc('');
  }
};
```

---

### **المرحلة 5: تحديث نظام النسخ الاحتياطي**

#### **5.1 إضافة وظائف جديدة في `backupService.ts`**

```typescript
/**
 * تصدير ملفات Storage
 */
export const exportStorageFiles = async (): Promise<void> => {
  try {
    // الحصول على قائمة جميع الملفات
    const { data: files, error } = await supabase.storage
      .from('attachments')
      .list('', {
        limit: 1000,
        offset: 0,
      });

    if (error) throw error;

    // تحميل كل ملف
    const downloadedFiles = [];
    for (const file of files) {
      const { data, error } = await supabase.storage
        .from('attachments')
        .download(file.name);

      if (!error && data) {
        downloadedFiles.push({
          name: file.name,
          data: data,
        });
      }
    }

    // إنشاء ZIP file
    // (يحتاج مكتبة JSZip)
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    for (const file of downloadedFiles) {
      zip.file(file.name, file.data);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });

    // تحميل ZIP
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `storage-backup-${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('✅ تم تصدير ملفات Storage بنجاح');
  } catch (error) {
    console.error('❌ فشل تصدير ملفات Storage:', error);
    throw error;
  }
};

/**
 * استيراد ملفات Storage
 */
export const importStorageFiles = async (zipFile: File): Promise<void> => {
  try {
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(zipFile);

    // رفع كل ملف
    for (const [fileName, file] of Object.entries(zip.files)) {
      if (!file.dir) {
        const blob = await file.async('blob');
        
        await supabase.storage
          .from('attachments')
          .upload(fileName, blob, {
            upsert: true,
          });
      }
    }

    console.log('✅ تم استيراد ملفات Storage بنجاح');
  } catch (error) {
    console.error('❌ فشل استيراد ملفات Storage:', error);
    throw error;
  }
};
```

---

## 📦 المكتبات المطلوبة

```bash
npm install jszip
npm install @types/jszip --save-dev
```

---

## 🔄 خطة الترحيل التدريجي

### **الخيار 1: الترحيل الكامل (Big Bang)**

1. إيقاف النظام
2. ترحيل جميع الملفات الموجودة
3. تحديث الكود
4. إعادة تشغيل النظام

### **الخيار 2: الترحيل التدريجي (Recommended)**

1. ✅ إضافة دعم Supabase Storage للملفات الجديدة
2. ✅ الملفات القديمة تبقى Base64
3. ✅ ترحيل الملفات القديمة تدريجياً في الخلفية
4. ✅ حذف Base64 بعد التأكد من نجاح الترحيل

---

## ⚠️ ملاحظات مهمة

1. **النسخ الاحتياطي قبل الترحيل:**
   ```bash
   # تصدير نسخة احتياطية كاملة
   npm run backup
   ```

2. **اختبار على بيئة Development أولاً**

3. **مراقبة حجم Storage:**
   - Supabase Free Tier: 1 GB
   - Supabase Pro: 100 GB

4. **تكلفة Storage:**
   - $0.021 لكل GB شهرياً (بعد 1 GB)

---

**هل تريد مني البدء في تنفيذ هذه الخطة؟** 🚀

