import React, { useState, useEffect, useMemo } from 'react';
import { BoardMeeting, BoardSession, MasterBoardMember, PermissionActions, MeetingAttachment, MeetingPoint } from '../types';
import { useTranslation } from '../LanguageContext';
import { useToast } from '../ToastContext';
import { PaperClipIcon, TrashIcon, PlusIcon } from '../components/icons';

interface BoardMeetingsPageProps {
  meetings: BoardMeeting[];
  setMeetings: React.Dispatch<React.SetStateAction<BoardMeeting[]>>;
  sessions: BoardSession[];
  masterBoardMembers: MasterBoardMember[];
  permissions: PermissionActions;
  logActivity: (args: { actionType: 'create' | 'update' | 'delete'; entityType: string; entityName: string; }) => void;
}

const getInitialFormState = (): Omit<BoardMeeting, 'id'> => ({
    sessionId: '',
    meetingNumber: '',
    meetingDate: new Date().toISOString().split('T')[0],
    attendees: [],
    absentees: [],
    agenda: [{ id: `agenda-${Date.now()}`, text: '' }],
    decisions: [{ id: `dec-${Date.now()}`, text: '' }],
    attachments: [],
});

const FormField: React.FC<{ label: string; children: React.ReactNode; required?: boolean }> = ({ label, children, required }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
    </div>
);

const BoardMeetingsPage: React.FC<BoardMeetingsPageProps> = ({ meetings, setMeetings, sessions, masterBoardMembers, permissions, logActivity }) => {
    const { t } = useTranslation();
    const { showToast } = useToast();

    const [mode, setMode] = useState<'new' | 'view' | 'edit'>('new');
    const [selectedMeetingId, setSelectedMeetingId] = useState<string>('');
    const [formData, setFormData] = useState<Omit<BoardMeeting, 'id'>>(getInitialFormState());

    const sessionMembers = useMemo(() => {
        if (!formData.sessionId) return [];
        const selectedSession = sessions.find(s => s.id === formData.sessionId);
        if (!selectedSession) return [];
        return selectedSession.members.map(member => 
            masterBoardMembers.find(master => master.id === member.masterMemberId)
        ).filter((member): member is MasterBoardMember => member !== undefined);
    }, [formData.sessionId, sessions, masterBoardMembers]);

    useEffect(() => {
        if (selectedMeetingId) {
            const meeting = meetings.find(m => m.id === selectedMeetingId);
            if (meeting) {
                setFormData(meeting);
                setMode('view');
            }
        } else {
            setFormData(getInitialFormState());
            setMode('new');
        }
    }, [selectedMeetingId, meetings]);

    useEffect(() => {
        if (mode === 'new' || mode === 'edit') {
            const allMemberIds = sessionMembers.map(m => m.id);
            const currentAttendees = new Set(formData.attendees);
            
            // If it's a new meeting and a session is chosen, default all to attendees
            if (mode === 'new' && formData.attendees.length === 0 && formData.absentees.length === 0) {
                 setFormData(prev => ({ ...prev, attendees: allMemberIds, absentees: [] }));
            } else {
                const newAttendees = allMemberIds.filter(id => currentAttendees.has(id));
                const newAbsentees = allMemberIds.filter(id => !currentAttendees.has(id));
                setFormData(prev => ({ ...prev, attendees: newAttendees, absentees: newAbsentees, }));
            }
        }
    }, [sessionMembers, formData.sessionId, mode]);


    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedMeetingId(e.target.value);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAttendanceChange = (memberId: string, isAttending: boolean) => {
        setFormData(prev => {
            const attendees = new Set(prev.attendees);
            if (isAttending) {
                attendees.add(memberId);
            } else {
                attendees.delete(memberId);
            }
            const allMemberIds = sessionMembers.map(m => m.id);
            const newAttendees = Array.from(attendees);
            const newAbsentees = allMemberIds.filter(id => !newAttendees.includes(id));

            return { ...prev, attendees: newAttendees, absentees: newAbsentees };
        });
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
          Array.from(e.target.files).forEach((file: File) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              const newAttachment: MeetingAttachment = {
                id: `att-${Date.now()}-${Math.random()}`,
                name: file.name,
                data: event.target?.result as string,
                type: file.type,
              };
              setFormData(prev => ({ ...prev, attachments: [...(prev.attachments || []), newAttachment] }));
            };
            reader.readAsDataURL(file);
          });
          e.target.value = ''; // Reset file input
        }
    };
    
    const removeAttachment = (id: string) => {
        setFormData(prev => ({...prev, attachments: prev.attachments.filter(att => att.id !== id) }));
    };

     const handlePointChange = (type: 'agenda' | 'decisions', index: number, text: string) => {
        const newPoints = [...formData[type]];
        newPoints[index].text = text;
        setFormData(prev => ({ ...prev, [type]: newPoints }));
    };

    const addPoint = (type: 'agenda' | 'decisions') => {
        const newPoint = { id: `${type}-${Date.now()}`, text: '' };
        setFormData(prev => ({ ...prev, [type]: [...prev[type], newPoint] }));
    };

    const removePoint = (type: 'agenda' | 'decisions', index: number) => {
        if (formData[type].length <= 1) {
            handlePointChange(type, index, '');
            return;
        }
        setFormData(prev => ({ ...prev, [type]: prev[type].filter((_, i) => i !== index) }));
    };

    const handleAction = (action: 'new' | 'save' | 'edit' | 'delete') => {
        if (action === 'new') {
            setSelectedMeetingId('');
            return;
        }

        if (action === 'save') {
            const requiredFields: (keyof Pick<BoardMeeting, 'sessionId' | 'meetingNumber' | 'meetingDate'>)[] = ['sessionId', 'meetingNumber', 'meetingDate'];
            const missing = requiredFields.filter(f => !formData[f]);
            if(missing.length > 0) {
                showToast(t.common.fillRequiredFields, 'error');
                return;
            }
            
            const finalFormData = {
                ...formData,
                agenda: formData.agenda.filter(p => p.text.trim() !== ''),
                decisions: formData.decisions.filter(p => p.text.trim() !== ''),
            };

            if (mode === 'new') {
                const newMeeting = { id: `meet-${Date.now()}`, ...finalFormData };
                setMeetings(prev => [newMeeting, ...prev]);
                logActivity({ actionType: 'create', entityType: 'BoardMeeting', entityName: newMeeting.meetingNumber });
                setSelectedMeetingId(newMeeting.id);
                showToast(t.common.createdSuccess, 'success');
            } else if (mode === 'edit') {
                setMeetings(prev => prev.map(m => m.id === selectedMeetingId ? { id: m.id, ...finalFormData } : m));
                logActivity({ actionType: 'update', entityType: 'BoardMeeting', entityName: formData.meetingNumber });
                setMode('view');
                showToast(t.common.updatedSuccess, 'success');
            }
            return;
        }

        if (!selectedMeetingId) return;

        if (action === 'edit') setMode('edit');

        if (action === 'delete') {
            if (window.confirm(t.boardMeetings.confirmDelete)) {
                const toDelete = meetings.find(m => m.id === selectedMeetingId);
                if(toDelete) logActivity({ actionType: 'delete', entityType: 'BoardMeeting', entityName: toDelete.meetingNumber });
                setMeetings(prev => prev.filter(m => m.id !== selectedMeetingId));
                setSelectedMeetingId('');
                showToast(t.common.deletedSuccess, 'success');
            }
        }
    };

    const isReadOnly = mode === 'view' || (mode === 'edit' && !permissions.update);
    const inputClasses = `w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-slate-900 transition focus:ring-2 focus:ring-indigo-500 read-only:bg-slate-100 disabled:bg-slate-100`;
    const baseButtonClass = "px-6 py-2.5 text-white font-semibold rounded-md shadow-sm transition-colors disabled:bg-slate-400";
    
    const allMemberIdsInSession = useMemo(() => sessionMembers.map(m => m.id), [sessionMembers]);

    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-6">{t.boardMeetings.title}</h1>

            <div className="mb-6 p-4 bg-slate-50 border rounded-lg">
                <FormField label={t.boardMeetings.selectMeeting}>
                    <select value={selectedMeetingId} onChange={handleSelectChange} className={inputClasses}>
                        <option value="">{t.boardMeetings.selectMeetingPlaceholder}</option>
                        {meetings.map(m => <option key={m.id} value={m.id}>{m.meetingNumber} ({m.meetingDate})</option>)}
                    </select>
                </FormField>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField label={t.boardMeetings.selectSession} required>
                        <select name="sessionId" value={formData.sessionId} onChange={handleInputChange} disabled={isReadOnly} className={inputClasses} required>
                            <option value="">{t.boardMeetings.selectSessionPlaceholder}</option>
                            {sessions.map(s => <option key={s.id} value={s.id}>{s.sessionNumber}</option>)}
                        </select>
                    </FormField>
                    <FormField label={t.boardMeetings.meetingNumber} required><input type="text" name="meetingNumber" value={formData.meetingNumber} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required/></FormField>
                    <FormField label={t.boardMeetings.meetingDate} required><input type="date" name="meetingDate" value={formData.meetingDate} onChange={handleInputChange} readOnly={isReadOnly} className={inputClasses} required/></FormField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t">
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold text-slate-800 mb-2">{t.boardMeetings.attendees} / {t.boardMeetings.absentees}</h3>
                        <div className="p-3 bg-slate-50 border rounded-md space-y-2 min-h-[150px]">
                             {allMemberIdsInSession.length > 0 ? allMemberIdsInSession.map(memberId => {
                                 const member = masterBoardMembers.find(m => m.id === memberId);
                                 if (!member) return null;
                                 return (
                                    <div key={member.id} className="flex items-center">
                                        <input type="checkbox" checked={formData.attendees.includes(member.id)} disabled={isReadOnly} onChange={(e) => handleAttendanceChange(member.id, e.target.checked)} id={`att-${member.id}`} className="w-4 h-4" />
                                        <label htmlFor={`att-${member.id}`} className="ml-2 text-slate-700">{member.fullName}</label>
                                    </div>
                                 );
                             }) : <p className="text-sm text-slate-500">{t.boardMeetings.noMembersInSession}</p>}
                        </div>
                    </div>
                    
                    <div>
                         <FormField label={t.boardMeetings.attachments}>
                            {!isReadOnly && <input type="file" multiple onChange={handleFileChange} className={`${inputClasses} cursor-pointer`} />}
                             <div className="mt-2 p-3 bg-slate-50 border rounded-md space-y-2 min-h-[100px]">
                                {formData.attachments && formData.attachments.length > 0 ? formData.attachments.map(att => (
                                    <div key={att.id} className="flex items-center justify-between p-2 bg-white rounded-md border">
                                        <a href={att.data} download={att.name} className="flex items-center gap-2 text-sm text-indigo-600 hover:underline truncate">
                                            <PaperClipIcon className="w-4 h-4" />
                                            <span className="truncate">{att.name}</span>
                                        </a>
                                        {!isReadOnly && <button onClick={() => removeAttachment(att.id)} className="text-red-500 hover:text-red-700 p-1"><TrashIcon className="w-4 h-4"/></button>}
                                    </div>
                                )) : <p className="text-sm text-slate-500 text-center">No attachments</p>}
                            </div>
                        </FormField>
                    </div>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField label={t.boardMeetings.agenda}>
                        <div className="space-y-2">
                            {formData.agenda.map((point, index) => (
                                <div key={point.id} className="flex items-center gap-2">
                                    <span className="text-slate-500 font-semibold">{index + 1}.</span>
                                    <input
                                        type="text"
                                        value={point.text}
                                        onChange={(e) => handlePointChange('agenda', index, e.target.value)}
                                        readOnly={isReadOnly}
                                        className={inputClasses}
                                    />
                                    {!isReadOnly && (
                                        <button onClick={() => removePoint('agenda', index)} className="p-2 text-red-500 hover:text-red-700 disabled:text-slate-300">
                                            <TrashIcon />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {!isReadOnly && (
                                <button onClick={() => addPoint('agenda')} className="mt-2 flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                                    <PlusIcon className="w-4 h-4" /> {t.boardMeetings.addPoint}
                                </button>
                            )}
                        </div>
                    </FormField>
                    <FormField label={t.boardMeetings.decisions}>
                         <div className="space-y-2">
                            {formData.decisions.map((point, index) => (
                                <div key={point.id} className="flex items-center gap-2">
                                    <span className="text-slate-500 font-semibold">{index + 1}.</span>
                                    <input
                                        type="text"
                                        value={point.text}
                                        onChange={(e) => handlePointChange('decisions', index, e.target.value)}
                                        readOnly={isReadOnly}
                                        className={inputClasses}
                                    />
                                    {!isReadOnly && (
                                        <button onClick={() => removePoint('decisions', index)} className="p-2 text-red-500 hover:text-red-700 disabled:text-slate-300">
                                            <TrashIcon />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {!isReadOnly && (
                                <button onClick={() => addPoint('decisions')} className="mt-2 flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                                    <PlusIcon className="w-4 h-4" /> {t.boardMeetings.addPoint}
                                </button>
                            )}
                        </div>
                    </FormField>
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

export default BoardMeetingsPage;