import React, { useState, useEffect } from 'react';
import { MasterBoardMember, PermissionActions } from '../types';
import { useTranslation } from '../LanguageContext';
import { useToast } from '../ToastContext';
import { ArrowDownTrayIcon } from '../components/icons';

interface BoardMembersPageProps {
  members: MasterBoardMember[];
  setMembers: React.Dispatch<React.SetStateAction<MasterBoardMember[]>>;
  permissions: PermissionActions;
  logActivity: (args: { actionType: 'create' | 'update' | 'delete'; entityType: string; entityName: string; }) => void;
}

const getInitialFormState = (): Omit<MasterBoardMember, 'id'> => ({
    fullName: '',
    idNumber: '',
    dateOfBirth: '',
    qualification: '',
    address: '',
    phone: '',
    gender: 'Male',
    occupation: '',
});

const FormField: React.FC<{ label: string; children: React.ReactNode; required?: boolean }> = ({ label, children, required }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
    </div>
);

const BoardMembersPage: React.FC<BoardMembersPageProps> = ({ members, setMembers, permissions, logActivity }) => {
    const { t } = useTranslation();
    const { showToast } = useToast();

    const [mode, setMode] = useState<'new' | 'view' | 'edit'>('new');
    const [selectedMemberId, setSelectedMemberId] = useState<string>('');
    const [formData, setFormData] = useState<Omit<MasterBoardMember, 'id'>>(getInitialFormState());

    useEffect(() => {
        if (selectedMemberId) {
            const member = members.find(p => p.id === selectedMemberId);
            if (member) {
                setFormData(member);
                setMode('view');
            }
        } else {
            setFormData(getInitialFormState());
            setMode('new');
        }
    }, [selectedMemberId, members]);

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedMemberId(e.target.value);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAction = (action: 'new' | 'save' | 'edit' | 'delete') => {
        if (action === 'new') {
            setSelectedMemberId('');
            setMode('new');
            return;
        }

        if (action === 'save') {
            if (!formData.fullName || !formData.idNumber) {
                const missingFields = [];
                if (!formData.fullName) missingFields.push(`'${t.boardMembers.fullName}'`);
                if (!formData.idNumber) missingFields.push(`'${t.boardMembers.idNumber}'`);
                showToast(`${t.common.fillRequiredFields}: ${missingFields.join(', ')}`, 'error');
                return;
            }

            if (mode === 'new') {
                const newMember = { id: `mbm-${Date.now()}`, ...formData };
                setMembers(prev => [...prev, newMember]);
                logActivity({ actionType: 'create', entityType: 'BoardMember', entityName: newMember.fullName });
                setSelectedMemberId(newMember.id);
                setMode('view');
                showToast(t.common.createdSuccess, 'success');
            } else if (mode === 'edit') {
                setMembers(prev => prev.map(p => p.id === selectedMemberId ? { id: p.id, ...formData } : p));
                logActivity({ actionType: 'update', entityType: 'BoardMember', entityName: formData.fullName });
                setMode('view');
                showToast(t.common.updatedSuccess, 'success');
            }
            return;
        }

        if (!selectedMemberId) return;

        if (action === 'edit') {
            setMode('edit');
        }

        if (action === 'delete') {
            const memberToDelete = members.find(p => p.id === selectedMemberId);
            if (memberToDelete) {
                logActivity({ actionType: 'delete', entityType: 'BoardMember', entityName: memberToDelete.fullName });
            }
            setMembers(prev => prev.filter(p => p.id !== selectedMemberId));
            setSelectedMemberId('');
            showToast(t.common.deletedSuccess, 'success');
        }
    };

    const handleExport = () => {
        const dataToExport = members.map(m => ({
            [t.boardMembers.fullName]: m.fullName,
            [t.boardMembers.idNumber]: m.idNumber,
            [t.boardMembers.dateOfBirth]: m.dateOfBirth,
            [t.boardMembers.qualification]: m.qualification,
            [t.boardMembers.address]: m.address,
            [t.boardMembers.phone]: m.phone,
            [t.boardMembers.gender]: m.gender,
            [t.boardMembers.occupation]: m.occupation,
        }));

        const ws = window.XLSX.utils.json_to_sheet(dataToExport);
        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, "BoardMembers");
        window.XLSX.writeFile(wb, "BoardMembers.xlsx");
        showToast(t.common.exportSuccess, 'success');
    };

    const isReadOnly = mode === 'view' || (mode === 'edit' && !permissions.update);
    const inputClasses = `w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-slate-900 transition focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 read-only:bg-slate-100 disabled:bg-slate-100 read-only:cursor-not-allowed disabled:cursor-not-allowed`;
    const baseButtonClass = "px-6 py-2.5 text-white font-semibold rounded-md shadow-sm transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed";

    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-200">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">{t.boardMembers.title}</h1>
                 <button onClick={handleExport} className="flex items-center gap-2 bg-green-600 text-white py-2 px-4 rounded-md shadow hover:bg-green-700 transition-colors font-semibold text-sm">
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    {t.common.export}
                </button>
            </div>

            <div className="mb-6 p-4 bg-slate-50 border rounded-lg">
                <FormField label={t.boardMembers.selectMember}>
                    <select value={selectedMemberId} onChange={handleSelectChange} className={inputClasses}>
                        <option value="">{t.boardMembers.selectMemberPlaceholder}</option>
                        {members.map(e => (
                            <option key={e.id} value={e.id}>{e.fullName}</option>
                        ))}
                    </select>
                </FormField>
            </div>
            
            <div className="space-y-5">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FormField label={t.boardMembers.fullName} required><input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required/></FormField>
                    <FormField label={t.boardMembers.idNumber} required><input type="text" name="idNumber" value={formData.idNumber} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required/></FormField>
                    <FormField label={t.boardMembers.dateOfBirth}><input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses}/></FormField>
                    <FormField label={t.boardMembers.qualification}><input type="text" name="qualification" value={formData.qualification} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses}/></FormField>
                    <FormField label={t.boardMembers.address}><input type="text" name="address" value={formData.address} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses}/></FormField>
                    <FormField label={t.boardMembers.phone}><input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses}/></FormField>
                    <FormField label={t.boardMembers.gender}>
                        <select name="gender" value={formData.gender} onChange={handleInputChange} disabled={isReadOnly} className={inputClasses}>
                            {Object.entries(t.boardMembers.genders).map(([key, value]) => <option key={key} value={key}>{value as string}</option>)}
                        </select>
                    </FormField>
                    <FormField label={t.boardMembers.occupation}><input type="text" name="occupation" value={formData.occupation} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses}/></FormField>
                </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap justify-center items-center gap-3">
                <button onClick={() => handleAction('new')} disabled={!permissions.create} className={`${baseButtonClass} bg-indigo-600 hover:bg-indigo-700`}>{t.common.new}</button>
                <button onClick={() => handleAction('save')} disabled={mode === 'view' || (mode === 'new' ? !permissions.create : !permissions.update)} className={`${baseButtonClass} bg-blue-600 hover:bg-blue-700`}>{t.common.save}</button>
                <button onClick={() => handleAction('edit')} disabled={mode !== 'view' || !permissions.update} className={`${baseButtonClass} bg-amber-500 hover:bg-amber-600`}>{t.common.edit}</button>
                <button onClick={() => handleAction('delete')} disabled={mode !== 'view' || !permissions.delete} className={`${baseButtonClass} bg-red-600 hover:bg-red-700`}>{t.common.delete}</button>
            </div>
        </div>
    );
};

export default BoardMembersPage;