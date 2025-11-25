import React, { useState, useMemo } from 'react';
import { ActivityLog, User, PermissionActions } from '../types';
import { useTranslation } from '../LanguageContext';

interface ActivityLogPageProps {
  logs: ActivityLog[];
  users: User[];
  permissions: PermissionActions;
}

const initialFilters = {
  userId: 'ALL',
  startDate: '',
  endDate: '',
};

const ActivityLogPage: React.FC<ActivityLogPageProps> = ({ logs, users, permissions }) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState(initialFilters);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };
  
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const logDate = new Date(log.timestamp);
      
      const userMatch = filters.userId === 'ALL' || log.userId === filters.userId;
      
      const startDateMatch = !filters.startDate || logDate >= new Date(filters.startDate);
      
      const endDate = filters.endDate ? new Date(filters.endDate) : null;
      if (endDate) {
        endDate.setHours(23, 59, 59, 999);
      }
      const endDateMatch = !endDate || logDate <= endDate;
      
      return userMatch && startDateMatch && endDateMatch;
    });
  }, [logs, filters]);
  
  const getActionBadge = (action: 'create' | 'update' | 'delete') => {
      const colors = {
          create: 'bg-green-100 text-green-700',
          update: 'bg-amber-100 text-amber-700',
          delete: 'bg-red-100 text-red-700',
      };
      return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${colors[action]}`}>{t.activityLog.actionType[action]}</span>;
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
      <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-6">{t.activityLog.title}</h1>

      <div className="p-4 mb-6 bg-slate-50 border border-slate-200 rounded-lg">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-slate-700">{t.activityLog.filters}</h2>
          <button 
            onClick={handleResetFilters}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            {t.common.clearFilters}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">{t.activityLog.user}</label>
            <select name="userId" value={filters.userId} onChange={handleFilterChange} className="w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-slate-900">
              <option value="ALL">{t.activityLog.allUsers}</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">{t.activityLog.fromDate}</label>
            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-slate-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">{t.activityLog.toDate}</label>
            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-slate-900" />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-start font-semibold text-slate-700 uppercase tracking-wider">{t.activityLog.user}</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-700 uppercase tracking-wider">{t.activityLog.action}</th>
              <th className="px-4 py-3 text-start font-semibold text-slate-700 uppercase tracking-wider">{t.activityLog.entity}</th>
              <th className="px-4 py-3 text-start font-semibold text-slate-700 uppercase tracking-wider">{t.activityLog.entityName}</th>
              <th className="px-4 py-3 text-start font-semibold text-slate-700 uppercase tracking-wider">{t.activityLog.timestamp}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredLogs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 whitespace-nowrap text-slate-800">{log.userName}</td>
                <td className="px-4 py-3 whitespace-nowrap text-center">{getActionBadge(log.actionType)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-600">{log.entityType}</td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-800 font-medium">{log.entityName}</td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-600">{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
             {filteredLogs.length === 0 && (
                <tr>
                    <td colSpan={5} className="text-center py-10 text-slate-500">
                       {t.activityLog.noLogs}
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityLogPage;