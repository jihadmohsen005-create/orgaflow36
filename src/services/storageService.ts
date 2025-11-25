import { supabase } from '../lib/supabase';

/**
 * خدمة إدارة الملفات في Supabase Storage
 * 
 * هذه الخدمة توفر وظائف لرفع، حذف، وتحميل الملفات من Supabase Storage
 */

/**
 * رفع ملف إلى Supabase Storage
 * 
 * @param file - الملف المراد رفعه
 * @param folder - المجلد (مثل: 'suppliers', 'projects', 'meetings')
 * @param entityId - معرف الكيان (مثل: supplier_id, project_id)
 * @returns URL العام للملف
 */
export const uploadFile = async (
  file: File,
  folder: string,
  entityId: string
): Promise<string> => {
  try {
    // إنشاء اسم فريد للملف
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${timestamp}-${sanitizedFileName}`;
    const filePath = `${folder}/${entityId}/${fileName}`;

    console.log(`📤 رفع الملف: ${filePath}`);

    // رفع الملف إلى Supabase Storage
    const { data, error } = await supabase.storage
      .from('attachments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('❌ فشل رفع الملف:', error);
      console.error('تفاصيل الخطأ:', {
        message: error.message,
        statusCode: error.statusCode,
        error: error.error,
        hint: error.hint
      });
      throw new Error(`فشل رفع الملف: ${error.message || error.error || 'خطأ غير معروف'}`);
    }

    // الحصول على URL العام
    const { data: { publicUrl } } = supabase.storage
      .from('attachments')
      .getPublicUrl(filePath);

    console.log(`✅ تم رفع الملف بنجاح: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error('❌ خطأ في رفع الملف:', error);
    throw error;
  }
};

/**
 * حذف ملف من Supabase Storage
 * 
 * @param fileUrl - URL الملف المراد حذفه
 */
export const deleteFile = async (fileUrl: string): Promise<void> => {
  try {
    // استخراج المسار من URL
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.indexOf('attachments');
    
    if (bucketIndex === -1) {
      throw new Error('Invalid file URL');
    }
    
    const filePath = pathParts.slice(bucketIndex + 1).join('/');

    console.log(`🗑️ حذف الملف: ${filePath}`);

    const { error } = await supabase.storage
      .from('attachments')
      .remove([filePath]);

    if (error) {
      console.error('❌ فشل حذف الملف:', error);
      throw error;
    }

    console.log(`✅ تم حذف الملف بنجاح`);
  } catch (error) {
    console.error('❌ خطأ في حذف الملف:', error);
    throw error;
  }
};

/**
 * تحميل ملف من Supabase Storage
 * 
 * @param fileUrl - URL الملف المراد تحميله
 * @returns Blob الملف
 */
export const downloadFile = async (fileUrl: string): Promise<Blob> => {
  try {
    console.log(`📥 تحميل الملف: ${fileUrl}`);

    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const blob = await response.blob();
    
    console.log(`✅ تم تحميل الملف بنجاح (${blob.size} bytes)`);
    return blob;
  } catch (error) {
    console.error('❌ خطأ في تحميل الملف:', error);
    throw error;
  }
};

/**
 * الحصول على قائمة جميع الملفات في مجلد معين
 * 
 * @param folder - المجلد (مثل: 'suppliers', 'projects')
 * @param entityId - معرف الكيان (اختياري)
 * @returns قائمة الملفات
 */
export const listFiles = async (
  folder: string,
  entityId?: string
): Promise<any[]> => {
  try {
    const path = entityId ? `${folder}/${entityId}` : folder;
    
    console.log(`📋 الحصول على قائمة الملفات في: ${path}`);

    const { data, error } = await supabase.storage
      .from('attachments')
      .list(path, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error('❌ فشل الحصول على قائمة الملفات:', error);
      throw error;
    }

    console.log(`✅ تم الحصول على ${data?.length || 0} ملف`);
    return data || [];
  } catch (error) {
    console.error('❌ خطأ في الحصول على قائمة الملفات:', error);
    throw error;
  }
};

