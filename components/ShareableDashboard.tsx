import React from 'react';
import { OrganizationInfo, Project, PurchaseRequest, PurchaseRequestStatus } from '../types';
import { useTranslation } from '../LanguageContext';
import { ArrowDownTrayIcon, ProjectIcon, PurchaseRequestIcon, ItemsIcon, SuppliersIcon } from './icons';

interface ShareableDashboardProps {
    organizationInfo: OrganizationInfo;
    suppliersCount: number;
    itemsCount: number;
    projects: Project[];
    purchaseRequests: PurchaseRequest[];
}

const BarChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="w-full space-y-3 p-4 bg-slate-50 rounded-lg border">
            {data.map(item => (
                <div key={item.label} className="grid grid-cols-4 items-center gap-2 text-sm">
                    <span className="col-span-1 text-slate-600 font-medium truncate text-right">{item.label}</span>
                    <div className="col-span-3 flex items-center gap-2">
                        <div className="w-full bg-slate-200 rounded-full h-4">
                            <div
                                className={`${item.color} h-4 rounded-full`}
                                style={{ width: `${(item.value / maxValue) * 100}%` }}
                            ></div>
                        </div>
                        <span className="font-bold text-slate-800 w-8 text-left">{item.value}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};


const ShareableDashboard: React.FC<ShareableDashboardProps> = ({ organizationInfo, suppliersCount, itemsCount, projects, purchaseRequests }) => {
    const { t, language } = useTranslation();

    const handleDownloadPdf = () => {
        const { jsPDF } = window.jspdf;
        const input = document.getElementById('shareable-report');

        if (input) {
            const printButton = input.querySelector('#print-button-container');
            if (printButton) (printButton as HTMLElement).style.display = 'none';

            window.html2canvas(input, { scale: 2, useCORS: true }).then(canvas => {
                if (printButton) (printButton as HTMLElement).style.display = 'block';

                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({
                    orientation: 'p',
                    unit: 'mm',
                    format: 'a4',
                });
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const ratio = canvasWidth / canvasHeight;

                let imgWidth = pdfWidth;
                let imgHeight = pdfWidth / ratio;
                if(imgHeight > pdfHeight) {
                    imgHeight = pdfHeight;
                    imgWidth = pdfHeight * ratio;
                }
                
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                pdf.save(`Dashboard-Report-${new Date().toISOString().split('T')[0]}.pdf`);
            });
        }
    };

    const statusCounts = purchaseRequests.reduce((acc, req) => {
        acc[req.status] = (acc[req.status] || 0) + 1;
        return acc;
    }, {} as Record<PurchaseRequestStatus, number>);

    const chartData = [
        { label: t.purchaseRequests.status.DRAFT, value: statusCounts.DRAFT || 0, color: 'bg-slate-400' },
        { label: t.purchaseRequests.status.PENDING_APPROVAL, value: statusCounts.PENDING_APPROVAL || 0, color: 'bg-yellow-400' },
        { label: t.purchaseRequests.status.APPROVED, value: statusCounts.APPROVED || 0, color: 'bg-blue-400' },
        { label: t.purchaseRequests.status.AWARDED, value: statusCounts.AWARDED || 0, color: 'bg-green-400' },
        { label: t.purchaseRequests.status.REJECTED, value: statusCounts.REJECTED || 0, color: 'bg-red-400' },
    ];
    
    const recentProjects = projects.slice(0, 5);
    const recentRequests = purchaseRequests.slice(0, 5);
    
    return (
        <div>
            <div id="shareable-report" className="p-2 bg-white" style={{ fontFamily: "'Cairo', sans-serif" }}>
                <div className="w-[210mm] min-h-[297mm] p-8 mx-auto border border-slate-200 bg-slate-50 shadow-lg text-slate-800">
                    {/* Header */}
                    <header className="flex justify-between items-center pb-6 border-b-2 border-slate-300">
                        <div className="flex items-center gap-4">
                            {organizationInfo.logoUrl && (
                                <img src={organizationInfo.logoUrl} alt="Logo" className="h-20 w-20 object-contain" />
                            )}
                            <div>
                                <h1 className="text-2xl font-bold">{language === 'ar' ? organizationInfo.nameAr : organizationInfo.nameEn}</h1>
                                <p className="text-slate-600">{organizationInfo.website}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-3xl font-extrabold text-indigo-700">{t.dashboard.shareTitle}</h2>
                            <p className="font-semibold text-slate-500">{t.dashboard.reportDate}: {new Date().toLocaleDateString()}</p>
                        </div>
                    </header>

                    {/* Body */}
                    <main className="mt-8">
                        {/* Key Metrics */}
                        <section>
                            <h3 className="text-xl font-bold mb-4">{t.dashboard.keyMetrics}</h3>
                            <div className="grid grid-cols-4 gap-6 text-center">
                                <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm"><SuppliersIcon className="mx-auto w-8 h-8 text-indigo-500 mb-2" /><p className="text-3xl font-bold">{suppliersCount}</p><p className="text-slate-500">{t.nav.suppliers}</p></div>
                                <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm"><ItemsIcon className="mx-auto w-8 h-8 text-teal-500 mb-2" /><p className="text-3xl font-bold">{itemsCount}</p><p className="text-slate-500">{t.nav.items}</p></div>
                                <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm"><ProjectIcon className="mx-auto w-8 h-8 text-sky-500 mb-2" /><p className="text-3xl font-bold">{projects.length}</p><p className="text-slate-500">{t.nav.projects}</p></div>
                                <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm"><PurchaseRequestIcon className="mx-auto w-8 h-8 text-amber-500 mb-2" /><p className="text-3xl font-bold">{purchaseRequests.length}</p><p className="text-slate-500">{t.nav.purchaseRequests}</p></div>
                            </div>
                        </section>

                        {/* Chart and Lists */}
                        <section className="grid grid-cols-2 gap-8 mt-10">
                            {/* Chart */}
                            <div className="col-span-1">
                                <h3 className="text-xl font-bold mb-4">{t.dashboard.statusDistribution}</h3>
                                <BarChart data={chartData} />
                            </div>
                            
                            {/* Lists */}
                            <div className="col-span-1 space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold mb-4">{t.dashboard.projectsSummary}</h3>
                                    <div className="space-y-2">
                                        {recentProjects.length > 0 ? recentProjects.map(p => (
                                            <div key={p.id} className="p-2 bg-white border rounded-md text-sm">
                                                <p className="font-semibold truncate">{language === 'ar' ? p.nameAr : p.nameEn}</p>
                                                <p className="text-xs text-slate-500">{p.startDate} - {p.endDate}</p>
                                            </div>
                                        )) : <p className="text-slate-500 text-sm">{t.dashboard.noRecentProjects}</p>}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-4">{t.dashboard.requestsSummary}</h3>
                                    <div className="space-y-2">
                                        {recentRequests.length > 0 ? recentRequests.map(pr => (
                                            <div key={pr.id} className="p-2 bg-white border rounded-md text-sm">
                                                <p className="font-semibold truncate">{language === 'ar' ? pr.nameAr : pr.nameEn}</p>
                                                <p className="text-xs text-slate-500">{pr.requestCode} - {pr.requestDate}</p>
                                            </div>
                                        )) : <p className="text-slate-500 text-sm">{t.dashboard.noRecentRequests}</p>}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </main>
                </div>
            </div>
            <div id="print-button-container" className="mt-6 pt-6 border-t flex justify-end">
                <button
                    onClick={handleDownloadPdf}
                    className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <ArrowDownTrayIcon />
                    {t.dashboard.downloadPDF}
                </button>
            </div>
        </div>
    );
};

export default ShareableDashboard;