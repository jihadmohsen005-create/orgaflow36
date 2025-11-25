
import React, { useState, useEffect } from 'react';
import { useTranslation } from '../LanguageContext';
import { useToast } from '../ToastContext';
import { PermissionActions, BackupSettings } from '../types';
import { CloudArrowUpIcon, CloudArrowDownIcon, ClockIcon } from '../components/icons';
import { exportDatabaseBackup, importDatabaseBackup, getDatabaseStats, exportStorageFiles, importStorageFiles, getStorageStats } from '../src/services/backupService';

interface BackupPageProps {
    permissions: PermissionActions;
    onExport: () => void;
    onImport: (file: File) => Promise<void>;
    backupSettings: BackupSettings;
    setBackupSettings: React.Dispatch<React.SetStateAction<BackupSettings>>;
    logActivity: (args: any) => void;
}

const BackupPage: React.FC<BackupPageProps> = ({ permissions, onExport, onImport, backupSettings, setBackupSettings, logActivity }) => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [importFile, setImportFile] = useState<File | null>(null);
    const [storageImportFile, setStorageImportFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isExportingStorage, setIsExportingStorage] = useState(false);
    const [isImportingStorage, setIsImportingStorage] = useState(false);
    const [dbStats, setDbStats] = useState<Record<string, number>>({});
    const [storageStats, setStorageStats] = useState<{ totalFiles: number; totalSize: number; folders: Record<string, number> }>({ totalFiles: 0, totalSize: 0, folders: {} });
    const [loadingStats, setLoadingStats] = useState(false);

    // تحميل إحصائيات قاعدة البيانات وStorage عند فتح الصفحة
    useEffect(() => {
        loadDatabaseStats();
        loadStorageStats();
    }, []);

    const loadDatabaseStats = async () => {
        setLoadingStats(true);
        try {
            const stats = await getDatabaseStats();
            setDbStats(stats);
        } catch (error) {
            console.error('فشل تحميل إحصائيات قاعدة البيانات:', error);
        } finally {
            setLoadingStats(false);
        }
    };

    const loadStorageStats = async () => {
        try {
            const stats = await getStorageStats();
            setStorageStats(stats);
        } catch (error) {
            console.error('فشل تحميل إحصائيات Storage:', error);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setImportFile(e.target.files[0]);
        }
    };

    const handleImportClick = async () => {
        if (!importFile) return;
        if (window.confirm(t.backup.restoreWarning)) {
            setIsLoading(true);
            try {
                await importDatabaseBackup(importFile);
                logActivity({ actionType: 'update', entityType: 'System', entityName: 'Full Database Restore from Supabase' });
                showToast(t.backup.restoreSuccess, 'success');
                setImportFile(null);
                // إعادة تحميل الإحصائيات بعد الاستيراد
                await loadDatabaseStats();
            } catch (error) {
                console.error("Import failed", error);
                showToast("فشل الاستيراد: " + (error as any).message, 'error');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleExportClick = async () => {
        setIsExporting(true);
        try {
            await exportDatabaseBackup();
            logActivity({ actionType: 'create', entityType: 'System', entityName: 'Full Database Backup from Supabase' });
            showToast('تم تصدير النسخة الاحتياطية بنجاح', 'success');
        } catch (error) {
            console.error("Export failed", error);
            showToast("فشل التصدير: " + (error as any).message, 'error');
        } finally {
            setIsExporting(false);
        }
    };

    const handleExportStorageClick = async () => {
        setIsExportingStorage(true);
        try {
            await exportStorageFiles();
            logActivity({ actionType: 'create', entityType: 'System', entityName: 'Storage Files Backup' });
            showToast('تم تصدير ملفات Storage بنجاح', 'success');
        } catch (error) {
            console.error("Storage export failed", error);
            showToast("فشل تصدير ملفات Storage: " + (error as any).message, 'error');
        } finally {
            setIsExportingStorage(false);
        }
    };

    const handleStorageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setStorageImportFile(e.target.files[0]);
        }
    };

    const handleImportStorageClick = async () => {
        if (!storageImportFile) {
            showToast('الرجاء اختيار ملف ZIP للاستيراد', 'error');
            return;
        }

        if (!storageImportFile.name.endsWith('.zip')) {
            showToast('الرجاء اختيار ملف ZIP فقط', 'error');
            return;
        }

        const confirmed = window.confirm(
            'هل أنت متأكد من استيراد ملفات Storage؟\n' +
            'سيتم رفع جميع الملفات من ملف ZIP إلى Supabase Storage.'
        );

        if (!confirmed) return;

        setIsImportingStorage(true);
        try {
            await importStorageFiles(storageImportFile);
            logActivity({ actionType: 'update', entityType: 'System', entityName: 'Storage Files Import' });
            showToast('تم استيراد ملفات Storage بنجاح', 'success');
            setStorageImportFile(null);
            // تحديث الإحصائيات
            await loadStorageStats();
        } catch (error) {
            console.error("Storage import failed", error);
            showToast("فشل استيراد ملفات Storage: " + (error as any).message, 'error');
        } finally {
            setIsImportingStorage(false);
        }
    }

    const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setBackupSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSaveSettings = () => {
        showToast(t.backup.settingsSaved, 'success');
        // In a real app, this would persist to backend
    };

    // حساب إجمالي السجلات
    const totalRecords = Object.values(dbStats).reduce((sum, count) => sum + count, 0);
    const totalTables = Object.keys(dbStats).length;

    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-6">{t.backup.title}</h1>

            {/* Database Statistics */}
            <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    </svg>
                    إحصائيات قاعدة البيانات
                </h2>

                {loadingStats ? (
                    <div className="text-center py-4">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-slate-600">جاري تحميل الإحصائيات...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                            <p className="text-sm text-slate-600 mb-1">إجمالي الجداول</p>
                            <p className="text-3xl font-bold text-blue-600">{totalTables}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                            <p className="text-sm text-slate-600 mb-1">إجمالي السجلات</p>
                            <p className="text-3xl font-bold text-indigo-600">{totalRecords.toLocaleString()}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                            <p className="text-sm text-slate-600 mb-1">آخر تحديث</p>
                            <p className="text-lg font-semibold text-slate-700">{new Date().toLocaleDateString('ar-EG')}</p>
                            <button
                                onClick={loadDatabaseStats}
                                className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                🔄 تحديث
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Storage Statistics */}
            <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    إحصائيات ملفات Storage
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                        <p className="text-sm text-slate-600 mb-1">إجمالي الملفات</p>
                        <p className="text-3xl font-bold text-green-600">{storageStats.totalFiles}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                        <p className="text-sm text-slate-600 mb-1">الحجم الإجمالي</p>
                        <p className="text-2xl font-bold text-emerald-600">
                            {(storageStats.totalSize / 1024 / 1024).toFixed(2)} MB
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                        <p className="text-sm text-slate-600 mb-1">المجلدات</p>
                        <p className="text-3xl font-bold text-teal-600">{Object.keys(storageStats.folders).length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                        <p className="text-sm text-slate-600 mb-1">آخر تحديث</p>
                        <p className="text-lg font-semibold text-slate-700">{new Date().toLocaleDateString('ar-EG')}</p>
                        <button
                            onClick={loadStorageStats}
                            className="mt-2 text-sm text-green-600 hover:text-green-700 font-medium"
                        >
                            🔄 تحديث
                        </button>
                    </div>
                </div>

                {/* تفاصيل المجلدات */}
                {Object.keys(storageStats.folders).length > 0 && (
                    <div className="mt-4 bg-white p-4 rounded-lg shadow-sm border border-green-100">
                        <p className="text-sm font-semibold text-slate-700 mb-2">توزيع الملفات حسب المجلد:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {Object.entries(storageStats.folders).map(([folder, count]) => (
                                <div key={folder} className="text-sm">
                                    <span className="text-slate-600">{folder}:</span>{' '}
                                    <span className="font-semibold text-green-600">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Export Card */}
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col items-center text-center">
                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full mb-4">
                        <CloudArrowDownIcon className="w-10 h-10" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">{t.backup.exportTitle}</h2>
                    <p className="text-slate-600 mb-6 text-sm">{t.backup.exportDesc}</p>
                    <button
                        onClick={handleExportClick}
                        disabled={!permissions.read || isExporting}
                        className="mt-auto w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-slate-300 transition-colors flex items-center justify-center gap-2"
                    >
                        {isExporting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                جاري التصدير...
                            </>
                        ) : (
                            t.backup.exportBtn
                        )}
                    </button>
                </div>

                {/* Import Card */}
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col items-center text-center">
                    <div className="p-3 bg-amber-100 text-amber-600 rounded-full mb-4">
                        <CloudArrowUpIcon className="w-10 h-10" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">{t.backup.importTitle}</h2>
                    <p className="text-slate-600 mb-6 text-sm">{t.backup.importDesc}</p>
                    
                    <div className="w-full mt-auto space-y-3">
                        <input 
                            type="file" 
                            accept=".json" 
                            onChange={handleFileChange}
                            disabled={!permissions.update || isLoading}
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                        <button
                            onClick={handleImportClick}
                            disabled={!importFile || !permissions.update || isLoading}
                            className="w-full py-2 px-4 bg-amber-600 text-white font-semibold rounded-md hover:bg-amber-700 disabled:bg-slate-300 transition-colors flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    جاري الاستيراد...
                                </>
                            ) : (
                                t.backup.importBtn
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Storage Backup Section */}
            <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                    </svg>
                    نسخ احتياطي لملفات Storage
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Export Storage Files */}
                    <div className="bg-white p-6 rounded-lg border border-purple-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                            </svg>
                            تصدير ملفات Storage
                        </h3>
                        <p className="text-slate-600 mb-4 text-sm">
                            تصدير جميع الملفات المرفوعة في Supabase Storage كملف ZIP
                        </p>
                        <button
                            onClick={handleExportStorageClick}
                            disabled={isExportingStorage || storageStats.totalFiles === 0}
                            className="w-full py-3 px-4 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 disabled:bg-slate-300 transition-colors flex items-center justify-center gap-2"
                        >
                            {isExportingStorage ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    جاري التصدير...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                    </svg>
                                    تصدير ملفات Storage ({storageStats.totalFiles} ملف)
                                </>
                            )}
                        </button>
                    </div>

                    {/* Import Storage Files */}
                    <div className="bg-white p-6 rounded-lg border border-purple-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            استيراد ملفات Storage
                        </h3>
                        <p className="text-slate-600 mb-4 text-sm">
                            استيراد ملفات من ملف ZIP إلى Supabase Storage
                        </p>
                        <div className="space-y-3">
                            <input
                                type="file"
                                accept=".zip"
                                onChange={handleStorageFileChange}
                                disabled={isImportingStorage}
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                            />
                            <button
                                onClick={handleImportStorageClick}
                                disabled={!storageImportFile || isImportingStorage}
                                className="w-full py-3 px-4 bg-pink-600 text-white font-semibold rounded-md hover:bg-pink-700 disabled:bg-slate-300 transition-colors flex items-center justify-center gap-2"
                            >
                                {isImportingStorage ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        جاري الاستيراد...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        استيراد ملفات Storage
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                        <strong>⚠️ ملاحظة:</strong> نسخ Storage منفصل عن نسخ قاعدة البيانات.
                        للحصول على نسخة احتياطية كاملة، قم بتصدير كل من قاعدة البيانات وملفات Storage.
                    </p>
                </div>
            </div>

            <div className="mt-8">
                {/* Auto Backup Settings Card */}
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                         <div className="p-2 bg-green-100 text-green-600 rounded-full">
                            <ClockIcon className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">{t.backup.autoBackupTitle}</h2>
                    </div>
                    <p className="text-slate-600 mb-6 text-sm">{t.backup.autoBackupDesc}</p>
                    
                    <div className="space-y-4 flex-grow">
                         <div className="flex items-center gap-2">
                            <input 
                                type="checkbox" 
                                id="autoBackup" 
                                name="autoBackup" 
                                checked={backupSettings.autoBackup} 
                                onChange={handleSettingChange}
                                disabled={!permissions.update}
                                className="h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                            />
                            <label htmlFor="autoBackup" className="font-medium text-slate-800">{t.backup.enableAutoBackup}</label>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t.backup.frequency}</label>
                            <select 
                                name="frequency" 
                                value={backupSettings.frequency} 
                                onChange={handleSettingChange}
                                disabled={!backupSettings.autoBackup || !permissions.update}
                                className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 disabled:bg-slate-100"
                            >
                                <option value="Daily">{t.backup.frequencies.Daily}</option>
                                <option value="Weekly">{t.backup.frequencies.Weekly}</option>
                                <option value="Monthly">{t.backup.frequencies.Monthly}</option>
                            </select>
                        </div>
                    </div>

                    <button 
                        onClick={handleSaveSettings}
                        disabled={!permissions.update}
                        className="mt-6 w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-slate-300 transition-colors"
                    >
                        {t.backup.saveSettings}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BackupPage;
