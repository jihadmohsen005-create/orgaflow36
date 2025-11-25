import { supabase } from '../lib/supabase';

/**
 * خدمة النسخ الاحتياطي لقاعدة البيانات
 * Database Backup Service
 */

// قائمة الجداول المطلوب نسخها احتياطياً
const TABLES_TO_BACKUP = [
  // Core tables
  'organization_info',
  'roles',
  'users',
  'departments',
  'document_types',
  'payment_methods',
  'purchase_methods',
  
  // Suppliers & Items
  'supplier_types',
  'business_types',
  'suppliers',
  'supplier_attachments',
  'item_categories',
  'items',
  
  // Projects & Donors
  'donors',
  'projects',
  'project_objectives',
  'project_activities',
  'project_extensions',
  'project_attachments',
  'project_reports',
  'project_grant_payments',
  
  // Purchase Cycle
  'purchase_requests',
  'purchase_request_items',
  'purchase_request_notes',
  'purchase_request_approvals',
  'supplier_quotations',
  'quoted_items',
  'purchase_orders',
  'purchase_order_items',
  
  // Contracts
  'contracts',
  'contract_amendments',
  'contract_amendment_justifications',
  
  // Archive
  'archive_locations',
  'archive_classifications',
  'physical_documents',
  'transactions',
  'transaction_documents',
  'transaction_movements',
  
  // HR & Board
  'employees',
  'master_board_members',
  'board_sessions',
  'board_members',
  'board_meetings',
  'board_meeting_attendees',
  'board_meeting_agenda',
  'board_meeting_decisions',
  'board_meeting_attachments',
  
  // Procurement & Finance
  'procurement_plans',
  'procurement_plan_details',
  'policy_manuals',
  'correspondence',
  'banks',
  'bank_sub_accounts',
  'exchange_rates',
  'project_budgets',
  'budget_lines',
  'expenditures',
  
  // Operations
  'fuel_types',
  'fuel_opening_balances',
  'fuel_suppliers',
  'fuel_supplies',
  'fuel_transfers',
  'fuel_recipient_types',
  'fuel_disbursements',
  'drivers',
  'fleet_trips',
  'work_types',
  'workers',
  'worker_transactions',
  'warehouses',
  'warehouse_entities',
  'warehouse_items',
  'warehouse_item_opening_balances',
  'warehouse_invoices',
  'warehouse_invoice_details',
  'warehouse_stock_transfers',
  
  // Assets
  'asset_categories',
  'asset_locations',
  'assets',
  'asset_custody',
  
  // Settings
  'backup_settings',
  'approval_workflow',
  'role_permissions',
  'activity_logs',
];

/**
 * تصدير نسخة احتياطية كاملة من قاعدة البيانات
 * Export full database backup
 */
export const exportDatabaseBackup = async (): Promise<void> => {
  try {
    const backup: Record<string, any[]> = {};
    const metadata = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      tables: TABLES_TO_BACKUP.length,
    };

    // جلب البيانات من كل جدول
    for (const tableName of TABLES_TO_BACKUP) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*');

        if (error) {
          console.warn(`تحذير: فشل تصدير جدول ${tableName}:`, error.message);
          backup[tableName] = [];
        } else {
          backup[tableName] = data || [];
          console.log(`✓ تم تصدير ${data?.length || 0} سجل من جدول ${tableName}`);
        }
      } catch (err) {
        console.warn(`خطأ في تصدير جدول ${tableName}:`, err);
        backup[tableName] = [];
      }
    }

    // إنشاء ملف JSON
    const backupData = {
      metadata,
      data: backup,
    };

    // تحميل الملف
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orgaflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('✅ تم تصدير النسخة الاحتياطية بنجاح');
  } catch (error) {
    console.error('❌ فشل تصدير النسخة الاحتياطية:', error);
    throw error;
  }
};

/**
 * استيراد نسخة احتياطية من ملف JSON
 * Import database backup from JSON file
 */
export const importDatabaseBackup = async (file: File): Promise<void> => {
  try {
    // قراءة الملف
    const fileContent = await file.text();
    const backupData = JSON.parse(fileContent);

    if (!backupData.metadata || !backupData.data) {
      throw new Error('ملف النسخة الاحتياطية غير صالح');
    }

    console.log(`📥 بدء استيراد النسخة الاحتياطية من ${backupData.metadata.exportDate}`);

    let successCount = 0;
    let errorCount = 0;

    // استيراد البيانات لكل جدول
    for (const tableName of TABLES_TO_BACKUP) {
      const tableData = backupData.data[tableName];

      if (!tableData || tableData.length === 0) {
        console.log(`⊘ تخطي جدول ${tableName} (لا توجد بيانات)`);
        continue;
      }

      try {
        // حذف البيانات الحالية (اختياري - يمكن تعطيله للدمج بدلاً من الاستبدال)
        // await supabase.from(tableName).delete().neq('id', '00000000-0000-0000-0000-000000000000');

        // إدراج البيانات الجديدة
        const { error } = await supabase
          .from(tableName)
          .upsert(tableData, { onConflict: 'id' });

        if (error) {
          console.error(`❌ فشل استيراد جدول ${tableName}:`, error.message);
          errorCount++;
        } else {
          console.log(`✓ تم استيراد ${tableData.length} سجل إلى جدول ${tableName}`);
          successCount++;
        }
      } catch (err) {
        console.error(`خطأ في استيراد جدول ${tableName}:`, err);
        errorCount++;
      }
    }

    console.log(`✅ اكتمل الاستيراد: ${successCount} جدول نجح، ${errorCount} جدول فشل`);

    if (errorCount > 0) {
      throw new Error(`فشل استيراد ${errorCount} جدول من أصل ${TABLES_TO_BACKUP.length}`);
    }
  } catch (error) {
    console.error('❌ فشل استيراد النسخة الاحتياطية:', error);
    throw error;
  }
};

/**
 * تصدير جدول واحد فقط
 * Export single table
 */
export const exportSingleTable = async (tableName: string): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*');

    if (error) throw error;

    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        tableName,
        recordCount: data?.length || 0,
      },
      data: data || [],
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tableName}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`✅ تم تصدير جدول ${tableName} بنجاح`);
  } catch (error) {
    console.error(`❌ فشل تصدير جدول ${tableName}:`, error);
    throw error;
  }
};

/**
 * الحصول على إحصائيات قاعدة البيانات
 * Get database statistics
 */
export const getDatabaseStats = async (): Promise<Record<string, number>> => {
  const stats: Record<string, number> = {};

  for (const tableName of TABLES_TO_BACKUP) {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (!error) {
        stats[tableName] = count || 0;
      }
    } catch (err) {
      stats[tableName] = 0;
    }
  }

  return stats;
};

/**
 * تصدير جميع ملفات Supabase Storage
 * Export all files from Supabase Storage
 */
export const exportStorageFiles = async (): Promise<void> => {
  try {
    console.log('📦 بدء تصدير ملفات Storage...');

    // الحصول على قائمة جميع الملفات
    const { data: files, error: listError } = await supabase.storage
      .from('attachments')
      .list('', {
        limit: 1000,
        offset: 0,
      });

    if (listError) {
      throw listError;
    }

    if (!files || files.length === 0) {
      console.log('⚠️ لا توجد ملفات للتصدير');
      alert('لا توجد ملفات في Storage للتصدير');
      return;
    }

    console.log(`📋 تم العثور على ${files.length} مجلد/ملف`);

    // استيراد مكتبة JSZip ديناميكياً
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    let totalFiles = 0;

    // تحميل جميع الملفات من كل مجلد
    for (const folder of files) {
      if (folder.name && !folder.id) {
        // هذا مجلد، نحتاج لجلب محتوياته
        const { data: folderFiles, error: folderError } = await supabase.storage
          .from('attachments')
          .list(folder.name, {
            limit: 1000,
            offset: 0,
          });

        if (!folderError && folderFiles) {
          for (const subFolder of folderFiles) {
            if (subFolder.name && !subFolder.id) {
              // مجلد فرعي (مثل: suppliers/supplier-id/)
              const { data: subFolderFiles, error: subFolderError } = await supabase.storage
                .from('attachments')
                .list(`${folder.name}/${subFolder.name}`, {
                  limit: 1000,
                  offset: 0,
                });

              if (!subFolderError && subFolderFiles) {
                for (const file of subFolderFiles) {
                  if (file.id) {
                    // هذا ملف فعلي
                    const filePath = `${folder.name}/${subFolder.name}/${file.name}`;
                    console.log(`📥 تحميل: ${filePath}`);

                    const { data: fileData, error: downloadError } = await supabase.storage
                      .from('attachments')
                      .download(filePath);

                    if (!downloadError && fileData) {
                      zip.file(filePath, fileData);
                      totalFiles++;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    if (totalFiles === 0) {
      console.log('⚠️ لا توجد ملفات للتصدير');
      alert('لا توجد ملفات في Storage للتصدير');
      return;
    }

    console.log(`📦 ضغط ${totalFiles} ملف...`);

    // إنشاء ملف ZIP
    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    // تحميل الملف
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `storage-backup-${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`✅ تم تصدير ${totalFiles} ملف بنجاح`);
    alert(`✅ تم تصدير ${totalFiles} ملف من Storage بنجاح`);
  } catch (error) {
    console.error('❌ فشل تصدير ملفات Storage:', error);
    alert('❌ فشل تصدير ملفات Storage. راجع Console للتفاصيل.');
    throw error;
  }
};

/**
 * استيراد ملفات إلى Supabase Storage من ملف ZIP
 * Import files to Supabase Storage from ZIP file
 */
export const importStorageFiles = async (zipFile: File): Promise<void> => {
  try {
    console.log('📦 بدء استيراد ملفات Storage...');

    // استيراد مكتبة JSZip ديناميكياً
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(zipFile);

    let totalFiles = 0;
    let successCount = 0;
    let errorCount = 0;

    // رفع كل ملف
    for (const [fileName, file] of Object.entries(zip.files)) {
      if (!file.dir) {
        totalFiles++;
        console.log(`📤 رفع: ${fileName}`);

        try {
          const blob = await file.async('blob');

          const { error } = await supabase.storage
            .from('attachments')
            .upload(fileName, blob, {
              upsert: true,
              contentType: 'application/octet-stream',
            });

          if (error) {
            console.error(`❌ فشل رفع ${fileName}:`, error);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (err) {
          console.error(`❌ خطأ في رفع ${fileName}:`, err);
          errorCount++;
        }
      }
    }

    console.log(`✅ تم استيراد ${successCount} من ${totalFiles} ملف`);

    if (errorCount > 0) {
      alert(`⚠️ تم استيراد ${successCount} ملف بنجاح، فشل ${errorCount} ملف`);
    } else {
      alert(`✅ تم استيراد ${successCount} ملف بنجاح`);
    }
  } catch (error) {
    console.error('❌ فشل استيراد ملفات Storage:', error);
    alert('❌ فشل استيراد ملفات Storage. راجع Console للتفاصيل.');
    throw error;
  }
};

/**
 * الحصول على إحصائيات Storage
 * Get Storage statistics
 */
export const getStorageStats = async (): Promise<{
  totalFiles: number;
  totalSize: number;
  folders: Record<string, number>;
}> => {
  try {
    const stats = {
      totalFiles: 0,
      totalSize: 0,
      folders: {} as Record<string, number>,
    };

    // الحصول على قائمة المجلدات الرئيسية
    const { data: folders, error } = await supabase.storage
      .from('attachments')
      .list('', {
        limit: 1000,
        offset: 0,
      });

    if (error || !folders) {
      return stats;
    }

    // حساب عدد الملفات في كل مجلد
    for (const folder of folders) {
      if (folder.name && !folder.id) {
        const { data: subFolders } = await supabase.storage
          .from('attachments')
          .list(folder.name, {
            limit: 1000,
            offset: 0,
          });

        if (subFolders) {
          let folderFileCount = 0;

          for (const subFolder of subFolders) {
            if (subFolder.name && !subFolder.id) {
              const { data: files } = await supabase.storage
                .from('attachments')
                .list(`${folder.name}/${subFolder.name}`, {
                  limit: 1000,
                  offset: 0,
                });

              if (files) {
                const fileCount = files.filter(f => f.id).length;
                folderFileCount += fileCount;

                // حساب الحجم
                files.forEach(f => {
                  if (f.id && f.metadata?.size) {
                    stats.totalSize += f.metadata.size;
                  }
                });
              }
            }
          }

          stats.folders[folder.name] = folderFileCount;
          stats.totalFiles += folderFileCount;
        }
      }
    }

    return stats;
  } catch (error) {
    console.error('❌ فشل الحصول على إحصائيات Storage:', error);
    return {
      totalFiles: 0,
      totalSize: 0,
      folders: {},
    };
  }
};
