import React, { useState } from 'react';
import { OrganizationInfo, PermissionActions } from '../types';
import { useTranslation } from '../LanguageContext';
import { useToast } from '../ToastContext';

interface OrganizationPageProps {
  organizationInfo: OrganizationInfo;
  setOrganizationInfo: React.Dispatch<React.SetStateAction<OrganizationInfo>>;
  permissions: PermissionActions;
  logActivity: (args: { actionType: 'create' | 'update' | 'delete'; entityType: string; entityName: string; }) => void;
}

const FormField: React.FC<{ label: string; children: React.ReactNode; required?: boolean }> = ({ label, children, required }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const OrganizationPage: React.FC<OrganizationPageProps> = ({ organizationInfo, setOrganizationInfo, permissions, logActivity }) => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    
    const [mode, setMode] = useState<'view' | 'edit'>('view');
    const [formData, setFormData] = useState<OrganizationInfo>(organizationInfo);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleAction = (action: 'edit' | 'save' | 'cancel') => {
        if (action === 'edit') {
            setMode('edit');
        } else if (action === 'cancel') {
            setFormData(organizationInfo); // Revert changes
            setMode('view');
        } else if (action === 'save') {
            if (!formData.nameAr || !formData.nameEn) {
                showToast(t.common.fillRequiredFields, 'error');
                return;
            }
            setOrganizationInfo(formData);
            logActivity({
                actionType: 'update',
                entityType: 'OrganizationInfo',
                entityName: formData.nameEn,
            });
            setMode('view');
            showToast(t.common.updatedSuccess, 'success');
        }
    };

    const isReadOnly = mode === 'view';
    const inputClasses = "w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-slate-900 transition focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 read-only:bg-slate-100 disabled:bg-slate-100 read-only:cursor-not-allowed disabled:cursor-not-allowed";
    const baseButtonClass = "px-6 py-2.5 text-white font-semibold rounded-md shadow-sm transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed";

    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
                <h1 className="text-3xl font-bold text-slate-800">{t.organization.title}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Form fields */}
                <div className="md:col-span-2 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <FormField label={t.organization.nameAr} required>
                            <input type="text" name="nameAr" value={formData.nameAr} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required />
                        </FormField>
                        <FormField label={t.organization.nameEn} required>
                            <input type="text" name="nameEn" value={formData.nameEn} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required />
                        </FormField>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <FormField label={t.organization.abbreviation}>
                            <input type="text" name="abbreviation" value={formData.abbreviation} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} />
                        </FormField>
                        <FormField label={t.organization.licenseNumber}>
                            <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} />
                        </FormField>
                    </div>
                     <FormField label={t.organization.establishmentDate}>
                        <input type="date" name="establishmentDate" value={formData.establishmentDate} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} />
                    </FormField>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <FormField label={t.organization.phone}>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} />
                        </FormField>
                        <FormField label={t.organization.mobile}>
                            <input type="tel" name="mobile" value={formData.mobile} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} />
                        </FormField>
                        <FormField label={t.organization.fax}>
                            <input type="tel" name="fax" value={formData.fax} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} />
                        </FormField>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <FormField label={t.organization.email}>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} />
                        </FormField>
                        <FormField label={t.organization.website}>
                            <input type="text" name="website" value={formData.website || ''} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} />
                        </FormField>
                    </div>
                    <FormField label={t.organization.address}>
                        <input type="text" name="address" value={formData.address} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} />
                    </FormField>
                </div>

                {/* Logo section */}
                <div className="md:col-span-1">
                    <FormField label={t.organization.logo}>
                        <div className="mt-1 flex flex-col items-center justify-center p-6 border-2 border-slate-300 border-dashed rounded-md">
                            <div className="w-40 h-40 bg-slate-100 rounded-md flex items-center justify-center overflow-hidden mb-4">
                                {formData.logoUrl ? (
                                    <img src={formData.logoUrl} alt="Logo Preview" className="h-full w-full object-contain" />
                                ) : (
                                    <span className="text-slate-500 text-sm text-center">No Logo</span>
                                )}
                            </div>
                            {!isReadOnly && (
                                <>
                                    <label htmlFor="logo-upload" className="cursor-pointer bg-white py-2 px-3 border border-slate-300 rounded-md shadow-sm text-sm leading-4 font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                        <span>{t.organization.changeLogo}</span>
                                        <input id="logo-upload" name="logoUrl" type="file" className="sr-only" accept="image/png, image/jpeg, image/svg+xml" onChange={handleLogoChange} />
                                    </label>
                                    <p className="text-xs text-slate-500 mt-2">{t.organization.logoHelpText}</p>
                                </>
                            )}
                        </div>
                    </FormField>
                </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap justify-center items-center gap-3">
                {mode === 'view' ? (
                    <button onClick={() => handleAction('edit')} disabled={!permissions.update} className={`${baseButtonClass} bg-amber-500 hover:bg-amber-600`}>
                        {t.common.edit}
                    </button>
                ) : (
                    <>
                        <button onClick={() => handleAction('cancel')} className={`${baseButtonClass} bg-slate-600 hover:bg-slate-700`}>
                            {t.common.cancel}
                        </button>
                        <button onClick={() => handleAction('save')} disabled={!permissions.update} className={`${baseButtonClass} bg-indigo-600 hover:bg-indigo-700`}>
                            {t.common.save}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default OrganizationPage;