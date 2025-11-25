import React, { useState, useMemo } from 'react';
import { BoardMeeting, BoardSession, MasterBoardMember, PermissionActions, MeetingAttachment, MeetingPoint } from '../types';
import { useTranslation } from '../LanguageContext';
import Modal from '../components/Modal';
import { SearchIcon, PaperClipIcon } from '../components/icons';

interface MeetingSearchPageProps {
  meetings: BoardMeeting[];
  sessions: BoardSession[];
  masterBoardMembers: MasterBoardMember[];
  permissions: PermissionActions;
}

const MeetingSearchPage: React.FC<MeetingSearchPageProps> = ({ meetings, sessions, masterBoardMembers, permissions }) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<BoardMeeting[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState<BoardMeeting | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) {
            setResults([]);
            return;
        }
        setIsSearching(true);
        const lowerCaseTerm = searchTerm.toLowerCase();
        const filtered = meetings.filter(m => 
            (m.agenda && m.agenda.some(p => p.text.toLowerCase().includes(lowerCaseTerm))) || 
            (m.decisions && m.decisions.some(p => p.text.toLowerCase().includes(lowerCaseTerm)))
        );
        setResults(filtered);
        setIsSearching(false);
    };
    
    const generateSnippet = (points: MeetingPoint[], term: string): React.ReactNode => {
        if (!points || !term) return '';
        const lowerTerm = term.toLowerCase();

        for (const point of points) {
            const text = point.text;
            if (text) {
                const lowerText = text.toLowerCase();
                const index = lowerText.indexOf(lowerTerm);
                if (index !== -1) {
                    const start = Math.max(0, index - 30);
                    const end = Math.min(text.length, index + term.length + 30);
                    const prefix = start > 0 ? '...' : '';
                    const suffix = end < text.length ? '...' : '';
                    const part = text.substring(start, end);
                    const termInPartIndex = part.toLowerCase().indexOf(lowerTerm);
                    
                    return (
                        <span>
                            {prefix}
                            {part.substring(0, termInPartIndex)}
                            <strong className="bg-yellow-200 font-bold">{part.substring(termInPartIndex, termInPartIndex + term.length)}</strong>
                            {part.substring(termInPartIndex + term.length)}
                            {suffix}
                        </span>
                    );
                }
            }
        }
        return '';
    };

    const ResultCard: React.FC<{ meeting: BoardMeeting }> = ({ meeting }) => {
        const session = sessions.find(s => s.id === meeting.sessionId);
        const agendaSnippet = generateSnippet(meeting.agenda, searchTerm);
        const decisionsSnippet = generateSnippet(meeting.decisions, searchTerm);

        return (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-indigo-700">{meeting.meetingNumber}</h3>
                        <p className="text-sm text-slate-500">
                            {t.boardOfDirectors.sessionNumber}: {session?.sessionNumber} | {t.boardMeetings.meetingDate}: {meeting.meetingDate}
                        </p>
                    </div>
                    <button onClick={() => setSelectedMeeting(meeting)} className="text-sm font-semibold text-indigo-600 hover:underline">
                        {t.meetingSearch.viewDetails}
                    </button>
                </div>
                <div className="mt-3 pt-3 border-t text-sm space-y-2 text-slate-700">
                    {agendaSnippet && <p><span className="font-semibold text-slate-500">{t.meetingSearch.foundInAgenda}: </span>{agendaSnippet}</p>}
                    {decisionsSnippet && <p><span className="font-semibold text-slate-500">{t.meetingSearch.foundInDecisions}: </span>{decisionsSnippet}</p>}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-6">{t.meetingSearch.title}</h1>
            <form onSubmit={handleSearch} className="flex items-center gap-3 mb-8">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder={t.meetingSearch.placeholder}
                    className="flex-grow p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <button type="submit" className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors">
                    <SearchIcon className="w-5 h-5" />
                    {t.meetingSearch.search}
                </button>
            </form>

            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-4">{t.meetingSearch.resultsTitle}</h2>
                {isSearching ? <p>Searching...</p> : (
                    results.length > 0 ? (
                        <div className="space-y-4">
                            {results.map(meeting => <ResultCard key={meeting.id} meeting={meeting} />)}
                        </div>
                    ) : (
                        <p className="text-center text-slate-500 py-8">{t.meetingSearch.noResults}</p>
                    )
                )}
            </div>

            {selectedMeeting && (
                <Modal isOpen={!!selectedMeeting} onClose={() => setSelectedMeeting(null)} title={t.meetingSearch.meetingDetails} size="max-w-3xl">
                    <MeetingDetailsModalContent meeting={selectedMeeting} masterBoardMembers={masterBoardMembers} />
                </Modal>
            )}
        </div>
    );
};


interface MeetingDetailsModalContentProps {
    meeting: BoardMeeting;
    masterBoardMembers: MasterBoardMember[];
}
const MeetingDetailsModalContent: React.FC<MeetingDetailsModalContentProps> = ({ meeting, masterBoardMembers }) => {
    const { t } = useTranslation();
    
    const getMemberName = (id: string) => masterBoardMembers.find(m => m.id === id)?.fullName || 'Unknown Member';

    return (
        <div className="space-y-4 text-sm text-slate-900">
            <div className="grid grid-cols-2 gap-4">
                <p><strong>{t.boardMeetings.meetingNumber}:</strong> {meeting.meetingNumber}</p>
                <p><strong>{t.boardMeetings.meetingDate}:</strong> {meeting.meetingDate}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <h4 className="font-bold mb-1">{t.boardMeetings.attendees}:</h4>
                    <ul className="list-disc pl-5 bg-slate-50 p-2 border rounded-md">
                        {meeting.attendees.map(id => <li key={id}>{getMemberName(id)}</li>)}
                    </ul>
                </div>
                 <div>
                    <h4 className="font-bold mb-1">{t.boardMeetings.absentees}:</h4>
                    <ul className="list-disc pl-5 bg-slate-50 p-2 border rounded-md">
                        {meeting.absentees.map(id => <li key={id}>{getMemberName(id)}</li>)}
                    </ul>
                </div>
            </div>
            <div>
                <h4 className="font-bold mb-1">{t.boardMeetings.agenda}:</h4>
                <ul className="list-decimal list-inside bg-slate-50 p-3 border rounded-md space-y-1">
                    {meeting.agenda.map(point => <li key={point.id}>{point.text}</li>)}
                </ul>
            </div>
            <div>
                <h4 className="font-bold mb-1">{t.boardMeetings.decisions}:</h4>
                <ul className="list-decimal list-inside bg-slate-50 p-3 border rounded-md space-y-1">
                    {meeting.decisions.map(point => <li key={point.id}>{point.text}</li>)}
                </ul>
            </div>
            {meeting.attachments && meeting.attachments.length > 0 && (
                 <div>
                    <h4 className="font-bold mb-1">{t.boardMeetings.attachments}:</h4>
                     <div className="space-y-2 bg-slate-50 p-3 border rounded-md">
                        {meeting.attachments.map((att: MeetingAttachment) => (
                             <a key={att.id} href={att.data} download={att.name} className="flex items-center gap-2 text-indigo-600 hover:underline p-1">
                                <PaperClipIcon className="w-4 h-4" />
                                {att.name}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


export default MeetingSearchPage;