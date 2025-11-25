import React, { useState, useMemo } from 'react';
import { ProcurementPlan, Project, ProcurementPlanDetail, ProcurementPlanItemStatus } from '../types';
import { useTranslation } from '../LanguageContext';
import { useToast } from '../ToastContext';
import { CheckCircleIcon } from '../components/icons';

// Props interface
interface ProcurementTrackingPageProps {
  procurementPlans: ProcurementPlan[];
  setProcurementPlans: React.Dispatch<React.SetStateAction<ProcurementPlan[]>>;
  projects: Project[];
}

// Main component
const ProcurementTrackingPage: React.FC<ProcurementTrackingPageProps> = ({ procurementPlans, setProcurementPlans, projects }) => {
  const { t, language } = useTranslation();
  const { showToast } = useToast();

  // State for filters
  const [projectFilter, setProjectFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Memoized and flattened list of all procurement items
  const allItems = useMemo(() => {
    return procurementPlans.flatMap(plan =>
      plan.details.map(detail => {
        const project = projects.find(p => p.id === plan.projectId);
        return {
          ...detail,
          planId: plan.planId,
          projectId: plan.projectId,
          projectName: project ? (language === 'ar' ? project.nameAr : project.nameEn) : 'Unknown Project',
        };
      })
    );
  }, [procurementPlans, projects, language]);

  type TimelineStatus = 'UPCOMING' | 'IN_PROGRESS' | 'OVERDUE' | 'COMPLETED';

  // Function to calculate timeline status
  const getTimelineStatus = (item: (typeof allItems)[0]): TimelineStatus => {
    if (item.status === 'COMPLETED') {
      return 'COMPLETED';
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const pubDate = new Date(item.publicationDate);
    const delDate = new Date(item.deliveryDate);

    if (today > delDate) {
      return 'OVERDUE';
    }
    if (today >= pubDate && today <= delDate) {
      return 'IN_PROGRESS';
    }
    return 'UPCOMING';
  };

  // Filtered items based on state
  const filteredItems = useMemo(() => {
    return allItems
      .filter(item => projectFilter === 'ALL' || item.projectId === projectFilter)
      .filter(item => {
        if (statusFilter === 'ALL') return true;
        return getTimelineStatus(item) === statusFilter;
      })
      .sort((a, b) => new Date(a.publicationDate).getTime() - new Date(b.publicationDate).getTime());
  }, [allItems, projectFilter, statusFilter]);

  // Handler to mark an item as completed
  const handleMarkAsCompleted = (planId: number, detailId: string) => {
    setProcurementPlans(prevPlans => {
      return prevPlans.map(plan => {
        if (plan.planId === planId) {
          return {
            ...plan,
            details: plan.details.map(detail => {
              if (detail.id === detailId) {
                return { ...detail, status: 'COMPLETED' as ProcurementPlanItemStatus };
              }
              return detail;
            }),
          };
        }
        return plan;
      });
    });
    showToast(t.common.updatedSuccess, 'success');
  };

  const handleResetFilters = () => {
    setProjectFilter('ALL');
    setStatusFilter('ALL');
  };

  // Status component
  const StatusBadge: React.FC<{ status: TimelineStatus }> = ({ status }) => {
    const statusInfo = {
      UPCOMING: { text: t.procurementTracking.statuses.UPCOMING, color: 'bg-blue-100 text-blue-800' },
      IN_PROGRESS: { text: t.procurementTracking.statuses.IN_PROGRESS, color: 'bg-yellow-100 text-yellow-800' },
      OVERDUE: { text: t.procurementTracking.statuses.OVERDUE, color: 'bg-red-100 text-red-800' },
      COMPLETED: { text: t.procurementTracking.statuses.COMPLETED, color: 'bg-green-100 text-green-800' },
    };
    const info = statusInfo[status];
    return <span className={`px-3 py-1 text-xs font-bold rounded-full ${info.color}`}>{info.text}</span>;
  };

  // Timeline bar component
  const TimelineBar: React.FC<{ startDate: string; endDate: string; status: TimelineStatus }> = ({ startDate, endDate, status }) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    start.setHours(0,0,0,0);
    end.setHours(0,0,0,0);

    const totalDuration = Math.max(1, end.getTime() - start.getTime());
    const elapsedDuration = Math.max(0, today.getTime() - start.getTime());
    let progress = (elapsedDuration / totalDuration) * 100;
    progress = Math.min(100, Math.max(0, progress));

    const color = {
      UPCOMING: 'bg-blue-500',
      IN_PROGRESS: 'bg-yellow-500',
      OVERDUE: 'bg-red-500',
      COMPLETED: 'bg-green-500',
    }[status];

    return (
      <div className="w-full bg-slate-200 rounded-full h-2.5 my-2 relative">
        <div className={`${color} h-2.5 rounded-full`} style={{ width: `${status === 'COMPLETED' ? 100 : progress}%` }}></div>
        {status !== 'COMPLETED' && status !== 'UPCOMING' && (
          <div className="absolute top-0 h-full w-0.5 bg-slate-800" style={{ left: `${progress}%` }} title="Today">
            <div className="absolute -top-1.5 -translate-x-1/2 w-3 h-3 bg-slate-800 rounded-full border-2 border-white"></div>
          </div>
        )}
      </div>
    );
  };
  
  // Render the page
  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
      <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-6">{t.procurementTracking.title}</h1>

      <div className="mb-6 p-4 bg-slate-50 rounded-lg border">
          <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold text-slate-700">{t.activityLog.filters}</h3>
              <button 
                  onClick={handleResetFilters}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                  {t.common.clearFilters}
              </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                  <label className="text-sm font-medium text-slate-600 block mb-1">{t.procurementTracking.filterByProject}</label>
                  <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900">
                      <option value="ALL">{t.procurementTracking.allProjects}</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{language === 'ar' ? p.nameAr : p.nameEn}</option>)}
                  </select>
              </div>
              <div>
                  <label className="text-sm font-medium text-slate-600 block mb-1">{t.procurementTracking.filterByStatus}</label>
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900">
                      {Object.entries(t.procurementTracking.statuses).map(([key, value]) => <option key={key} value={key}>{value as string}</option>)}
                  </select>
              </div>
          </div>
      </div>
      
      <div className="space-y-4">
          {filteredItems.length > 0 ? (
            filteredItems.map(item => {
              const timelineStatus = getTimelineStatus(item);
              return (
                <div key={item.id} className="bg-slate-50 border border-slate-200 p-4 rounded-lg shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-4 items-start">
                    {/* Col 1: Title and Description */}
                    <div>
                      <h3 className="font-bold text-lg text-indigo-800">{item.item}</h3>
                      <p className="text-sm text-slate-600">{item.description}</p>
                      <p className="text-xs text-slate-500 font-semibold mt-1">{t.projects.title}: {item.projectName} - {t.procurementTracking.plan} #{item.planId}</p>
                    </div>
                    
                    {/* Col 2: Status and Actions */}
                    <div className="flex flex-row justify-between items-center md:flex-col md:items-end md:justify-start gap-2">
                      <StatusBadge status={timelineStatus} />
                       {timelineStatus !== 'COMPLETED' && (
                         <button
                           onClick={() => handleMarkAsCompleted(item.planId, item.id)}
                           className="flex items-center gap-1 text-sm font-semibold text-green-600 hover:text-green-800"
                         >
                           <CheckCircleIcon className="w-4 h-4" />
                           {t.procurementTracking.markAsCompleted}
                         </button>
                       )}
                    </div>

                    {/* Col 3: Dates */}
                    <div className="grid grid-cols-2 gap-4 text-center text-sm w-full md:w-auto">
                       <div>
                         <p className="font-semibold text-slate-500">{t.procurementTracking.publicationDate}</p>
                         <p className="font-mono text-slate-800">{item.publicationDate}</p>
                       </div>
                       <div>
                         <p className="font-semibold text-slate-500">{t.procurementTracking.deliveryDate}</p>
                         <p className="font-mono text-slate-800">{item.deliveryDate}</p>
                       </div>
                    </div>
                  </div>
                  <div className="mt-3">
                     <TimelineBar startDate={item.publicationDate} endDate={item.deliveryDate} status={timelineStatus} />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 text-slate-700 bg-slate-50 rounded-lg">
              <p>{t.procurementTracking.noItems}</p>
            </div>
          )}
      </div>

    </div>
  );
};

export default ProcurementTrackingPage;