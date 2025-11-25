import React, { useMemo, useState, useEffect } from 'react';
import { Project, ProjectBudget, Expenditure, ProjectGrantPayment, Donor } from '../types';
import { useTranslation } from '../LanguageContext';
import { FinanceIcon, CheckCircleIcon, SlidersIcon } from '../components/icons';

interface FinancialDashboardPageProps {
    projects: Project[];
    projectBudgets: ProjectBudget[];
    expenditures: Expenditure[];
    donors: Donor[];
}

// #region Helper & Chart Components
const InfoItem: React.FC<{ label: string; value: string; }> = ({ label, value }) => (
    <div className="text-center">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="font-bold text-slate-900 text-lg">{value}</p>
    </div>
);

const StatCard: React.FC<{ title: string; value: number; currency: string; colorClass?: string }> = ({ title, value, currency, colorClass = 'text-slate-800' }) => (
    <div className="bg-white p-4 rounded-xl border border-slate-200/80 text-center shadow-sm h-full flex flex-col justify-center transition-all hover:shadow-lg hover:-translate-y-1">
        <p className="text-sm font-semibold text-slate-500">{title}</p>
        <p className={`text-2xl font-bold ${colorClass}`}>
            {value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="text-xs text-slate-400 font-medium">{currency}</p>
    </div>
);

const ProgressBar: React.FC<{ label: string; percentage: number; color: string; }> = ({ label, percentage, color }) => {
    const [animatedPercentage, setAnimatedPercentage] = useState(0);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setAnimatedPercentage(percentage);
        }, 100);
        return () => clearTimeout(timeout);
    }, [percentage]);
    
    return (
    <div className="w-full">
        <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-slate-700">{label}</span>
            <span className="text-sm font-bold text-indigo-600">{percentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3.5">
            <div className={`${color} h-3.5 rounded-full transition-all duration-1000 ease-out`} style={{ width: `${animatedPercentage > 100 ? 100 : animatedPercentage}%` }}></div>
        </div>
    </div>
    );
};

const BarChartHorizontal: React.FC<{ data: { label: string; value: number }[] }> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="space-y-4">
            {data.map(item => (
                <div key={item.label} className="grid grid-cols-3 gap-2 items-center text-sm">
                    <span className="font-medium text-slate-600 truncate text-right">{item.label}</span>
                    <div className="col-span-2">
                        <div className="w-full bg-slate-200 rounded-full h-6 relative">
                             <div className="bg-teal-400 h-6 rounded-full flex items-center justify-end pr-2 text-white text-xs font-bold transition-all duration-500" style={{ width: `${(item.value / maxValue) * 100}%` }}>
                                 {item.value.toLocaleString()}
                             </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const GrantTimeline: React.FC<{ payments: ProjectGrantPayment[], currency: string }> = ({ payments, currency }) => {
    const { t } = useTranslation();
    if (!payments || payments.length === 0) {
        return <div className="flex items-center justify-center h-full"><p className="text-center text-slate-500 py-10">{t.revenues.noPlannedPayments}</p></div>;
    }

    return (
        <div className="relative pl-8 pt-2 h-full overflow-y-auto pr-2" style={{maxHeight: '250px'}}>
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-200" aria-hidden="true"></div>
            {payments.map((p) => {
                const isPaid = p.status === 'Paid';
                return (
                    <div key={p.id} className="relative mb-6">
                        <div className={`absolute -left-[18px] top-1 w-8 h-8 rounded-full flex items-center justify-center ring-4 ring-slate-100 ${isPaid ? 'bg-green-500' : 'bg-slate-300'}`}>
                            {isPaid ? <CheckCircleIcon className="w-5 h-5 text-white" /> : <div className="w-3 h-3 bg-white rounded-full"></div>}
                        </div>
                        <div className="ml-8 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                            <p className="font-bold text-slate-800">{t.projects.grantTitle} #{p.payNum}</p>
                            <div className="text-sm text-slate-600 mt-1">
                                <span>{p.plannedAmount.toLocaleString()} {currency}</span>
                                <span className="mx-2 text-slate-300">|</span>
                                <span>{p.plannedDate}</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const DoughnutChart: React.FC<{ percentage: number; label: string; color: string; currency?: string; amount?: number }> = ({ percentage, label, color, currency, amount }) => {
    const [animatedPercentage, setAnimatedPercentage] = useState(0);

    useEffect(() => {
        setAnimatedPercentage(0); // Reset on new data
        const timeout = setTimeout(() => {
            setAnimatedPercentage(percentage);
        }, 100);
        return () => clearTimeout(timeout);
    }, [percentage]);

    const radius = 60;
    const stroke = 12;
    const normalizedRadius = radius - stroke / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="relative">
                <svg
                    height={radius * 2}
                    width={radius * 2}
                    className="transform -rotate-90"
                >
                    <circle stroke="#e5e7eb" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
                    <circle stroke={color} fill="transparent" strokeWidth={stroke} strokeDasharray={circumference + ' ' + circumference} style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-out' }} strokeLinecap="round" r={normalizedRadius} cx={radius} cy={radius} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-bold text-slate-900">{percentage.toFixed(1)}%</span>
                    {amount !== undefined && currency && (
                        <span className="text-xs font-mono text-slate-500">{amount.toLocaleString()} {currency}</span>
                    )}
                </div>
            </div>
            <p className="mt-3 text-base font-semibold text-slate-700 text-center">{label}</p>
        </div>
    );
};

// #endregion

const SingleProjectView: React.FC<{ project: Project; donors: Donor[]; projectBudgets: ProjectBudget[]; expenditures: Expenditure[]; }> = ({ project, donors, projectBudgets, expenditures }) => {
    const { t, language } = useTranslation();

    const data = useMemo(() => {
        const projectExpenditures = expenditures.filter(e => e.projectId === project.id);
        const totalExpenses = projectExpenditures.reduce((sum, e) => sum + e.paymentAmount, 0);
        const paidPayments = (project.grantPayments || []).filter(p => p.status === 'Paid');
        const totalReceived = paidPayments.reduce((sum, p) => sum + p.actualAmount, 0);
        const lastPaidPayment = [...paidPayments].sort((a,b) => b.payNum - a.payNum)[0] || null;
        const nextPayment = (project.grantPayments || []).sort((a,b) => a.payNum - b.payNum).find(p => p.status === 'Pending') || null;
        let spendingThreshold = 0;
        let progressToNextGrant = 0;
        let remainingToThreshold = 0;
        if (lastPaidPayment && lastPaidPayment.nextReqSpend > 0) {
            spendingThreshold = totalReceived * (lastPaidPayment.nextReqSpend / 100);
            if (spendingThreshold > 0) {
                progressToNextGrant = Math.max(0, Math.min(100, (totalExpenses / spendingThreshold) * 100));
                remainingToThreshold = Math.max(0, spendingThreshold - totalExpenses);
            }
        }
        const expenditureByCategory = (() => {
            const categoryTotals: Record<string, number> = {};
            const budget = projectBudgets.find(b => b.projectId === project.id);
            if (!budget) return [];
            projectExpenditures.forEach(exp => {
                const line = budget.lines.find(l => l.id === exp.budgetLineId);
                if(line) categoryTotals[line.category] = (categoryTotals[line.category] || 0) + exp.paymentAmount;
            });
            return Object.entries(categoryTotals).map(([label, value]) => ({ label, value })).sort((a,b) => b.value - a.value);
        })();
        const totalGrant = project.budget || 0;
        return {
            totalGrant, totalExpenses, totalReceived,
            paymentsRemaining: totalGrant - totalReceived,
            financialVariance: totalGrant - totalExpenses,
            cashOnHand: totalReceived - totalExpenses,
            timelineProgress: (new Date().getTime() - new Date(project.startDate).getTime()) / (new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) * 100,
            progressToNextGrant, remainingToThreshold,
            lastPaidPayment, nextPayment,
            expenditureByCategory,
            donor: donors.find(d => d.id === project.donorId),
            spendingRate: totalGrant > 0 ? (totalExpenses / totalGrant) * 100 : 0,
            grantReceivedRate: totalGrant > 0 ? (totalReceived / totalGrant) * 100 : 0,
        };
    }, [project, expenditures, projectBudgets, donors]);

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                    <InfoItem label={t.projects.startDate} value={project.startDate} />
                    <InfoItem label={t.projects.endDate} value={project.endDate} />
                    <InfoItem label={t.financialDashboard.donor} value={data.donor ? (language === 'ar' ? data.donor.nameAr : data.donor.nameEn) : '-'} />
                    <InfoItem label={t.financialDashboard.partner} value={project.partner || '-'} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 grid grid-cols-2 gap-4">
                    <StatCard title={t.financialDashboard.totalBudget} value={data.totalGrant} currency={project.currency} colorClass="text-blue-600" />
                    <StatCard title={t.financialDashboard.totalReceivedGrants} value={data.totalReceived} currency={project.currency} colorClass="text-green-600" />
                    <StatCard title={t.financialDashboard.totalExpenditures} value={data.totalExpenses} currency={project.currency} colorClass="text-red-600" />
                    <StatCard title={t.financialDashboard.paymentsRemaining} value={data.paymentsRemaining} currency={project.currency} colorClass="text-amber-600" />
                    <StatCard title={t.financialDashboard.financialVariance} value={data.financialVariance} currency={project.currency} colorClass="text-teal-600" />
                    <StatCard title={t.financialDashboard.cashOnHand} value={data.cashOnHand} currency={project.currency} colorClass="text-indigo-600" />
                </div>
                <div className="lg:col-span-2 bg-white p-4 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
                    <DoughnutChart percentage={data.spendingRate} label={t.financialDashboard.spendingRate} color="#ef4444" amount={data.totalExpenses} currency={project.currency} />
                    <DoughnutChart percentage={data.grantReceivedRate} label={t.financialDashboard.grantReceivedRate} color="#22c55e" amount={data.totalReceived} currency={project.currency} />
                </div>
            </div>
            
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
                    <ProgressBar label={t.financialDashboard.projectTimeline} percentage={data.timelineProgress} color="bg-sky-500" />
                    <ProgressBar label={t.financialDashboard.progressToNextGrant} percentage={data.progressToNextGrant} color="bg-amber-500" />
                </div>
                 <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 grid grid-cols-3 gap-4 text-center divide-x items-center">
                    <InfoItem label={t.financialDashboard.lastPaidInstallment} value={data.lastPaidPayment?.payNum?.toString() || 'N/A'} />
                    <InfoItem label={t.financialDashboard.nextInstallment} value={data.nextPayment?.payNum?.toString() || 'N/A'} />
                    <div>
                        <p className="text-sm text-slate-500">{t.financialDashboard.remainingToThreshold}</p>
                        <p className="font-bold text-slate-900 text-lg">{data.remainingToThreshold.toLocaleString()}</p>
                        <p className="text-xs text-slate-400">{project.currency}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">{t.financialDashboard.expenditureByCategory}</h3>
                    {data.expenditureByCategory.length > 0 ? <BarChartHorizontal data={data.expenditureByCategory} /> : <p className="text-center text-slate-500 py-10">{t.financialDashboard.noData}</p>}
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">{t.projects.grantTitle}</h3>
                    <GrantTimeline payments={project.grantPayments || []} currency={project.currency}/>
                </div>
            </div>
        </div>
    );
};

const FinancialDashboardPage: React.FC<FinancialDashboardPageProps> = ({ projects, projectBudgets, expenditures, donors }) => {
    const { t, language } = useTranslation();
    const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || 'ALL');

    const selectedProjectData = useMemo(() => {
        if (selectedProjectId === 'ALL' || !projects.length) return null;
        const project = projects.find(p => p.id === selectedProjectId);
        if (!project) return null;
        return { project, donors, projectBudgets, expenditures };
    }, [selectedProjectId, projects, projectBudgets, expenditures, donors]);

    return (
        <div className="space-y-6 bg-slate-100/70 p-4 -m-4 sm:-m-6 lg:-m-8 sm:p-6 lg:p-8 min-h-full">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-slate-900">{t.financialDashboard.title}</h1>
                </div>
                <div className="w-full md:w-auto md:min-w-[400px] relative">
                    <select 
                        value={selectedProjectId} 
                        onChange={e => setSelectedProjectId(e.target.value)}
                        className="w-full p-3 pl-4 pr-10 border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 text-lg bg-white appearance-none font-bold text-slate-900"
                        style={{textOverflow: 'ellipsis'}}
                    >
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{language === 'ar' ? p.nameAr : p.nameEn}</option>
                        ))}
                         {projects.length === 0 && <option value="ALL">No projects available</option>}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                    </div>
                </div>
                <button className="p-3 bg-white rounded-lg shadow-sm border border-slate-200 text-slate-600 hover:bg-slate-50">
                    <SlidersIcon className="w-6 h-6" />
                </button>
            </div>

            {selectedProjectData ? (
                <SingleProjectView 
                    project={selectedProjectData.project}
                    donors={selectedProjectData.donors}
                    projectBudgets={selectedProjectData.projectBudgets}
                    expenditures={selectedProjectData.expenditures}
                />
            ) : (
                <div className="text-center py-24 text-slate-500 bg-white rounded-lg border border-dashed">
                    <p>Select a project to see the detailed financial dashboard.</p>
                </div>
            )}
        </div>
    );
};

export default FinancialDashboardPage;