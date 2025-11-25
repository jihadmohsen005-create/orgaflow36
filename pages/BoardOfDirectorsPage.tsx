import React, { useState, useEffect } from 'react';
import { BoardSession, BoardMember, PermissionActions, MasterBoardMember } from '../types';
import { useTranslation } from '../LanguageContext';
import { useToast } from '../ToastContext';
import { PlusIcon, TrashIcon } from '../components/icons';

interface BoardOfDirectorsPageProps {
  sessions: BoardSession[];
  setSessions: React.Dispatch<React.SetStateAction<BoardSession[]>>;
  masterBoardMembers: MasterBoardMember[];
  permissions: PermissionActions;
  logActivity: (args: { actionType: 'create' | 'update' | 'delete'; entityType: string; entityName: string; }) => void;
}

const getInitialFormState = (): Omit<BoardSession, 'id'> => ({
    sessionNumber: '',
    startDate: '',
    endDate: '',
    members: [],
});

const FormField: React.FC<{ label: string; children: React.ReactNode; required?: boolean }> = ({ label, children, required }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
    </div>
);

const BoardOfDirectorsPage: React.FC<BoardOfDirectorsPageProps> = ({ sessions, setSessions, masterBoardMembers, permissions, logActivity }) => {
    const { t } = useTranslation();
    const { showToast } = useToast();

    const [mode, setMode] = useState<'new' | 'view' | 'edit'>('new');
    const [selectedSessionId, setSelectedSessionId] = useState<string>('');
    const [formData, setFormData] = useState<Omit<BoardSession, 'id'>>(getInitialFormState());

    useEffect(() => {
        if (selectedSessionId) {
            const session = sessions.find(s => s.id === selectedSessionId);
            if (session) {
                setFormData(session);
                setMode('view');
            }
        } else {
            setFormData(getInitialFormState());
            setMode('new');
        }
    }, [selectedSessionId, sessions]);

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSessionId(e.target.value);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMemberChange = (index: number, field: keyof Omit<BoardMember, 'id'>, value: string) => {
        const newMembers = [...formData.members];
        (newMembers[index] as any)[field] = value;
        setFormData(prev => ({ ...prev, members: newMembers }));
    };

    const addMember = () => {
        const newMember: BoardMember = { id: `mem-${Date.now()}`, masterMemberId: '', position: 'Member' };
        setFormData(prev => ({ ...prev, members: [...prev.members, newMember] }));
    };

    const removeMember = (index: number) => {
        setFormData(prev => ({ ...prev, members: prev.members.filter((_, i) => i !== index) }));
    };
    
    const handleAction = (action: 'new' | 'save' | 'edit' | 'delete') => {
        if (action === 'new') {
            setSelectedSessionId('');
            setMode('new');
            return;
        }

        if (action === 'save') {
            if (!formData.sessionNumber || !formData.startDate || !formData.endDate) {
                showToast(t.common.fillRequiredFields, 'error');
                return;
            }

            if (mode === 'new') {
                const newSession = { id: `sess${Date.now()}`, ...formData };
                setSessions(prev => [...prev, newSession]);
                logActivity({ actionType: 'create', entityType: 'BoardSession', entityName: newSession.sessionNumber });
                setSelectedSessionId(newSession.id);
                setMode('view');
                showToast(t.common.createdSuccess, 'success');
            } else if (mode === 'edit') {
                setSessions(prev => prev.map(s => s.id === selectedSessionId ? { id: s.id, ...formData } : s));
                logActivity({ actionType: 'update', entityType: 'BoardSession', entityName: formData.sessionNumber });
                setMode('view');
                showToast(t.common.updatedSuccess, 'success');
            }
            return;
        }

        if (!selectedSessionId) return;

        if (action === 'edit') {
            setMode('edit');
        }

        if (action === 'delete') {
            const sessionToDelete = sessions.find(s => s.id === selectedSessionId);
            if (sessionToDelete) {
                logActivity({ actionType: 'delete', entityType: 'BoardSession', entityName: sessionToDelete.sessionNumber });
            }
            setSessions(prev => prev.filter(s => s.id !== selectedSessionId));
            setSelectedSessionId('');
            showToast(t.common.deletedSuccess, 'success');
        }
    };

    const isReadOnly = mode === 'view' || (mode === 'edit' && !permissions.update);
    const inputClasses = `w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-slate-900 transition focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 read-only:bg-slate-100 disabled:bg-slate-100 read-only:cursor-not-allowed disabled:cursor-not-allowed`;
    const baseButtonClass = "px-6 py-2.5 text-white font-semibold rounded-md shadow-sm transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed";

    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-6">{t.boardOfDirectors.title}</h1>

            <div className="mb-6 p-4 bg-slate-50 border rounded-lg">
                <FormField label={t.boardOfDirectors.selectSession}>
                    <select value={selectedSessionId} onChange={handleSelectChange} className={inputClasses}>
                        <option value="">{t.boardOfDirectors.selectSessionPlaceholder}</option>
                        {sessions.map(s => (
                            <option key={s.id} value={s.id}>{s.sessionNumber}</option>
                        ))}
                    </select>
                </FormField>
            </div>
            
            <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField label={t.boardOfDirectors.sessionNumber} required><input type="text" name="sessionNumber" value={formData.sessionNumber} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required/></FormField>
                    <FormField label={t.boardOfDirectors.startDate} required><input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required/></FormField>
                    <FormField label={t.boardOfDirectors.endDate} required><input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required/></FormField>
                </div>

                <div className="pt-4">
                    <h3 className="text-xl font-semibold text-indigo-700 mb-3">{t.boardOfDirectors.boardMembers}</h3>
                    <div className="space-y-3 p-4 border rounded-lg bg-slate-50">
                        {formData.members.map((member, index) => {
                            const addedMemberIds = formData.members.map(m => m.masterMemberId);
                            return (
                                <div key={member.id} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-center">
                                    <select
                                        value={member.masterMemberId}
                                        onChange={e => handleMemberChange(index, 'masterMemberId', e.target.value)}
                                        disabled={isReadOnly}
                                        className={inputClasses}
                                    >
                                        <option value="">{t.boardMembers.selectMemberPlaceholder}</option>
                                        {masterBoardMembers
                                            .filter(m => !addedMemberIds.includes(m.id) || m.id === member.masterMemberId)
                                            .map(m => (
                                                <option key={m.id} value={m.id}>{m.fullName}</option>
                                            ))
                                        }
                                    </select>
                                    <select value={member.position} onChange={e => handleMemberChange(index, 'position', e.target.value)} disabled={isReadOnly} className={inputClasses}>
                                        {Object.entries(t.boardOfDirectors.positions).map(([key, value]) => <option key={key} value={key}>{value as string}</option>)}
                                    </select>
                                    <button onClick={() => removeMember(index)} disabled={isReadOnly} className="p-2 text-red-500 hover:text-red-700 disabled:text-slate-300 disabled:cursor-not-allowed">
                                        <TrashIcon />
                                    </button>
                                </div>
                            );
                        })}
                         {!isReadOnly && <button onClick={addMember} className="mt-2 flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                            <PlusIcon className="w-4 h-4" /> {t.boardOfDirectors.addMember}
                        </button>}
                    </div>
                </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-200 flex justify-center items-center gap-3">
                <button onClick={() => handleAction('new')} disabled={!permissions.create} className={`${baseButtonClass} bg-indigo-600 hover:bg-indigo-700`}>{t.common.new}</button>
                <button onClick={() => handleAction('save')} disabled={mode === 'view' || (mode === 'new' ? !permissions.create : !permissions.update)} className={`${baseButtonClass} bg-blue-600 hover:bg-blue-700`}>{t.common.save}</button>
                <button onClick={() => handleAction('edit')} disabled={mode !== 'view' || !permissions.update} className={`${baseButtonClass} bg-amber-500 hover:bg-amber-600`}>{t.common.edit}</button>
                <button onClick={() => handleAction('delete')} disabled={mode !== 'view' || !permissions.delete} className={`${baseButtonClass} bg-red-600 hover:bg-red-700`}>{t.common.delete}</button>
            </div>
        </div>
    );
};
export default BoardOfDirectorsPage;