import React, { useState, useEffect } from 'react';
import { Bank, BankSubAccount, PermissionActions } from '../types';
import { useTranslation } from '../LanguageContext';
import { useToast } from '../ToastContext';
import Modal from '../components/Modal';
import { PlusIcon, PencilIcon, TrashIcon, BuildingOfficeIcon } from '../components/icons';

const FormField: React.FC<{ label: string; children: React.ReactNode; required?: boolean }> = ({ label, children, required }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
    </div>
);

interface BankAccountsPageProps {
  banks: Bank[];
  setBanks: React.Dispatch<React.SetStateAction<Bank[]>>;
  permissions: PermissionActions;
  logActivity: (args: { actionType: 'create' | 'update' | 'delete'; entityType: string; entityName: string; }) => void;
}

const BankAccountsPage: React.FC<BankAccountsPageProps> = ({ banks, setBanks, permissions, logActivity }) => {
  const { t, language } = useTranslation();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'view' | 'new' | 'edit'>('view');
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Bank, 'id' | 'subAccounts'>>({ nameAr: '', nameEn: '', mainBranch: '', accountNumber: '' });
  
  const [subAccountModalOpen, setSubAccountModalOpen] = useState(false);
  const [editingSubAccount, setEditingSubAccount] = useState<BankSubAccount | null>(null);

  const initialFormState = { nameAr: '', nameEn: '', mainBranch: '', accountNumber: '' };

  useEffect(() => {
    if (selectedBankId) {
      const bank = banks.find(b => b.id === selectedBankId);
      if (bank) {
        setFormData({ nameAr: bank.nameAr, nameEn: bank.nameEn, mainBranch: bank.mainBranch, accountNumber: bank.accountNumber });
        setMode('view');
      }
    } else {
      if (mode !== 'new') {
        setFormData(initialFormState);
        setMode('view'); // show placeholder
      }
    }
  }, [selectedBankId, banks]);

  const handleSelectBank = (id: string) => {
    setSelectedBankId(id);
  };
  
  const handleNewBank = () => {
    setSelectedBankId(null);
    setMode('new');
    setFormData(initialFormState);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSaveBank = () => {
    if (!formData.nameAr || !formData.nameEn || !formData.mainBranch || !formData.accountNumber) {
        showToast(t.common.fillRequiredFields, 'error');
        return;
    }
    
    if (mode === 'edit' && selectedBankId) { // Update existing bank
        const updatedBank = { ...banks.find(b => b.id === selectedBankId)!, ...formData };
        setBanks(prev => prev.map(b => b.id === selectedBankId ? updatedBank : b));
        logActivity({actionType: 'update', entityType: 'Bank', entityName: formData.nameEn});
        showToast(t.common.updatedSuccess, 'success');
        setMode('view');
    } else if (mode === 'new') { // Create new bank
        const newBank: Bank = { id: `bank-${Date.now()}`, ...formData, subAccounts: [] };
        setBanks(prev => [...prev, newBank]);
        logActivity({actionType: 'create', entityType: 'Bank', entityName: newBank.nameEn});
        setSelectedBankId(newBank.id);
        showToast(t.common.createdSuccess, 'success');
    }
  };

  const handleDeleteBank = (id: string) => {
    if(window.confirm(t.common.deleteConfirm)) {
        const toDelete = banks.find(b => b.id === id);
        if(toDelete) logActivity({actionType: 'delete', entityType: 'Bank', entityName: toDelete.nameEn});
        setBanks(prev => prev.filter(b => b.id !== id));
        if (selectedBankId === id) setSelectedBankId(null);
        showToast(t.common.deletedSuccess, 'success');
    }
  };
  
  // --- Sub-Account Logic ---
  const handleSaveSubAccount = (subAccount: Omit<BankSubAccount, 'id'>, id: string | null) => {
      if (!selectedBankId) return;

      setBanks(prev => prev.map(bank => {
          if (bank.id === selectedBankId) {
              let newSubAccounts;
              if (id) { // Update
                  newSubAccounts = bank.subAccounts.map(sa => sa.id === id ? { ...sa, ...subAccount } : sa);
              } else { // Create
                  const newSub: BankSubAccount = { id: `sub-${Date.now()}`, ...subAccount };
                  newSubAccounts = [...bank.subAccounts, newSub];
              }
              return { ...bank, subAccounts: newSubAccounts };
          }
          return bank;
      }));
      showToast(t.common.updatedSuccess, 'success');
      setSubAccountModalOpen(false);
  };
  
  const handleDeleteSubAccount = (subAccountId: string) => {
      if (!selectedBankId || !window.confirm(t.common.deleteConfirm)) return;
      setBanks(prev => prev.map(bank => {
          if (bank.id === selectedBankId) {
              return { ...bank, subAccounts: bank.subAccounts.filter(sa => sa.id !== subAccountId) };
          }
          return bank;
      }));
       showToast(t.common.deletedSuccess, 'success');
  }

  const selectedBank = banks.find(b => b.id === selectedBankId);
  const isReadOnly = mode === 'view';

  // Tailwind classes for consistency
  const inputClasses = "w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-slate-900 transition focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 read-only:bg-slate-200 read-only:cursor-not-allowed";
  const btnPrimary = "px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 disabled:cursor-not-allowed";
  const btnPrimarySm = "px-4 py-2 text-sm " + btnPrimary;
  const btnSecondary = "px-5 py-2 bg-white text-slate-700 font-semibold rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors shadow-sm";

  return (
    <div className="bg-slate-50 p-6 rounded-2xl">
      <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-8">{t.bankAccounts.title}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Panel: Bank List */}
        <div className="lg:col-span-1 bg-white p-4 rounded-xl border border-slate-200 flex flex-col h-fit shadow-sm">
            <div className="flex justify-between items-center mb-4 pb-3 border-b">
                <h2 className="text-lg font-bold text-slate-800">{t.bankAccounts.mainBanks}</h2>
                <button onClick={handleNewBank} disabled={!permissions.create} className={`${btnPrimarySm} flex items-center gap-1.5`}>
                    <PlusIcon className="w-4 h-4" /> {t.bankAccounts.newBank}
                </button>
            </div>
            <div className="space-y-2">
                {banks.map(bank => (
                    <div
                        key={bank.id}
                        onClick={() => handleSelectBank(bank.id)}
                        className={`p-3 rounded-lg cursor-pointer flex justify-between items-center transition-all group ${selectedBankId === bank.id ? 'bg-indigo-100 ring-2 ring-indigo-300' : 'hover:bg-slate-100'}`}
                    >
                        <div>
                            <p className="font-semibold text-slate-800">{language === 'ar' ? bank.nameAr : bank.nameEn}</p>
                            <p className="text-xs text-slate-500">{bank.accountNumber}</p>
                        </div>
                         <button onClick={(e) => { e.stopPropagation(); handleDeleteBank(bank.id); }} disabled={!permissions.delete} className="text-slate-400 hover:text-red-500 disabled:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"><TrashIcon /></button>
                    </div>
                ))}
            </div>
        </div>

        {/* Right Panel: Details */}
        <div className="lg:col-span-2 space-y-6">
            {mode === 'view' && !selectedBank ? (
                 <div className="p-6 bg-white rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center h-full min-h-[400px]">
                    <BuildingOfficeIcon className="w-16 h-16 text-slate-300 mb-4" />
                    <h3 className="text-xl font-bold text-slate-700">{t.bankAccounts.selectBank}</h3>
                </div>
            ) : (
                <>
                {/* Main Bank Card */}
                <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-800">
                            {mode === 'new' ? t.bankAccounts.newBank : t.bankAccounts.bankDetails}
                        </h3>
                        {mode === 'view' && selectedBank && (
                            <button onClick={() => setMode('edit')} className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                                <PencilIcon /> {t.common.edit}
                            </button>
                        )}
                    </div>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label={t.bankAccounts.bankNameAr} required><input name="nameAr" value={formData.nameAr} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required /></FormField>
                            <FormField label={t.bankAccounts.bankNameEn} required><input name="nameEn" value={formData.nameEn} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required /></FormField>
                            <FormField label={t.bankAccounts.mainBranch} required><input name="mainBranch" value={formData.mainBranch} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required /></FormField>
                            <FormField label={t.bankAccounts.mainAccountNumber} required><input name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required /></FormField>
                        </div>
                    </div>
                     {mode !== 'view' && (
                        <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
                            <button onClick={() => { if(selectedBank) { handleSelectBank(selectedBank.id) } else { handleNewBank() }; setMode('view') }} className={btnSecondary}>{t.common.cancel}</button>
                            <button onClick={handleSaveBank} disabled={(mode === 'new' ? !permissions.create : !permissions.update)} className={btnPrimary}>
                                {mode === 'new' ? t.common.add : t.common.save}
                            </button>
                        </div>
                    )}
                </div>
                
                {selectedBank && (
                     <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-slate-800">{t.bankAccounts.subAccounts}</h3>
                            <button onClick={() => { setEditingSubAccount(null); setSubAccountModalOpen(true); }} disabled={!permissions.create} className={`${btnPrimarySm} flex items-center gap-1.5`}>
                                <PlusIcon className="w-4 h-4"/> {t.bankAccounts.addSubAccount}
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-slate-600 bg-slate-50">
                                    <tr>
                                        <th className="p-3 text-left font-semibold">{t.bankAccounts.subAccountNumber}</th>
                                        <th className="p-3 text-left font-semibold">{t.bankAccounts.iban}</th>
                                        <th className="p-3 text-center font-semibold">{t.bankAccounts.currency}</th>
                                        <th className="p-3 text-left font-semibold">{t.bankAccounts.accountSymbol}</th>
                                        <th className="p-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {selectedBank.subAccounts.map(sa => (
                                        <tr key={sa.id}>
                                            <td className="p-3 font-mono text-slate-700">{sa.accountNumber}</td>
                                            <td className="p-3 font-mono text-slate-700">{sa.iban}</td>
                                            <td className="p-3 text-center font-semibold text-slate-700">{sa.currency}</td>
                                            <td className="p-3 text-slate-700">{sa.accountSymbol}</td>
                                            <td className="p-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => { setEditingSubAccount(sa); setSubAccountModalOpen(true); }} disabled={!permissions.update} className="text-slate-500 hover:text-indigo-600 p-1"><PencilIcon /></button>
                                                    <button onClick={() => handleDeleteSubAccount(sa.id)} disabled={!permissions.delete} className="text-slate-500 hover:text-red-600 p-1"><TrashIcon /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                             {selectedBank.subAccounts.length === 0 && <p className="text-center text-slate-500 py-8">{t.bankAccounts.noSubAccounts}</p>}
                        </div>
                     </div>
                )}
                </>
            )}
        </div>
      </div>
      
      {subAccountModalOpen && (
          <SubAccountModal
            isOpen={subAccountModalOpen}
            onClose={() => setSubAccountModalOpen(false)}
            subAccount={editingSubAccount}
            onSave={handleSaveSubAccount}
            inputClasses={inputClasses}
            btnPrimary={btnPrimary}
            btnSecondary={btnSecondary}
          />
      )}
    </div>
  );
};

// Sub-account Add/Edit Modal
interface SubAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    subAccount: BankSubAccount | null;
    onSave: (data: Omit<BankSubAccount, 'id'>, id: string | null) => void;
    inputClasses: string;
    btnPrimary: string;
    btnSecondary: string;
}

const SubAccountModal: React.FC<SubAccountModalProps> = ({ isOpen, onClose, subAccount, onSave, inputClasses, btnPrimary, btnSecondary }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<Omit<BankSubAccount, 'id'>>({
        accountNumber: '', iban: '', currency: 'USD', accountSymbol: '',
    });

    useEffect(() => {
        setFormData({
            accountNumber: subAccount?.accountNumber || '',
            iban: subAccount?.iban || '',
            currency: subAccount?.currency || 'USD',
            accountSymbol: subAccount?.accountSymbol || '',
        });
    }, [subAccount, isOpen]);
    
    const handleSubmit = () => {
        onSave(formData, subAccount?.id || null);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={subAccount ? t.bankAccounts.editSubAccount : t.bankAccounts.addSubAccount}>
            <div className="space-y-4">
                 <FormField label={t.bankAccounts.subAccountNumber} required><input value={formData.accountNumber} onChange={e => setFormData(p => ({...p, accountNumber: e.target.value}))} className={inputClasses} /></FormField>
                 <FormField label={t.bankAccounts.iban} required><input value={formData.iban} onChange={e => setFormData(p => ({...p, iban: e.target.value}))} className={inputClasses} /></FormField>
                 <div className="grid grid-cols-2 gap-4">
                    <FormField label={t.bankAccounts.currency}><select value={formData.currency} onChange={e => setFormData(p => ({...p, currency: e.target.value as any}))} className={inputClasses}><option>USD</option><option>ILS</option><option>EUR</option></select></FormField>
                    <FormField label={t.bankAccounts.accountSymbol} required><input value={formData.accountSymbol} onChange={e => setFormData(p => ({...p, accountSymbol: e.target.value}))} className={inputClasses} /></FormField>
                 </div>
                 <div className="flex justify-end gap-3 pt-4 border-t">
                    <button onClick={onClose} className={btnSecondary}>{t.common.cancel}</button>
                    <button onClick={handleSubmit} className={btnPrimary}>{t.common.save}</button>
                </div>
            </div>
        </Modal>
    );
};

export default BankAccountsPage;
