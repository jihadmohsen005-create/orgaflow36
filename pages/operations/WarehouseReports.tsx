// pages/operations/WarehouseReports.tsx
import React, { useState, useRef } from 'react';
import { useTranslation } from '../../LanguageContext';
import { 
    PermissionActions, 
    Warehouse, WarehouseEntity, WarehouseItem, WarehouseItemOpeningBalance, WarehouseInvoice, WarehouseStockTransfer,
    Project
} from '../../types';
import { PrinterIcon } from '../../components/icons';
import { FormField } from './WarehouseComponents';

interface WarehouseReportsProps {
    permissions: PermissionActions;
    logActivity: (args: any) => void;
    warehouses: Warehouse[];
    warehouseEntities: WarehouseEntity[];
    warehouseItems: WarehouseItem[];
    warehouseInvoices: WarehouseInvoice[];
    warehouseItemOpeningBalances: WarehouseItemOpeningBalance[];
    warehouseStockTransfers: WarehouseStockTransfer[];
    projects: Project[];
}

const WarehouseReports: React.FC<WarehouseReportsProps> = (props) => {
    const { t, language } = useTranslation();
    const printableRef = useRef<HTMLDivElement>(null);
    const inputClasses = "w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 transition focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";
    
    type ReportType = 'itemByStatus' | 'reportByItem' | 'balancesOfAllItems' | 'cumulativeReport' | 'reportByEntity' | 'reportByProject' | 'warehouseStockSummary';

    const [activeReport, setActiveReport] = useState<ReportType | null>(null);
    const [filters, setFilters] = useState({
        warehouseId: 'ALL',
        projectId: 'ALL',
        entityId: 'ALL',
        itemId: 'ALL',
        startDate: '',
        endDate: new Date().toISOString().split('T')[0],
    });
    const [reportData, setReportData] = useState<any | null>(null);
    const [reportTitle, setReportTitle] = useState('');
    
    const reportTypes: { id: ReportType; label: keyof typeof t.operations.warehouseReports.buttons }[] = [
        { id: 'itemByStatus', label: 'itemByStatus' },
        { id: 'reportByItem', label: 'reportByItem' },
        { id: 'balancesOfAllItems', label: 'balancesOfAllItems' },
        { id: 'cumulativeReport', label: 'cumulativeReport' },
        { id: 'reportByEntity', label: 'reportByEntity' },
        { id: 'reportByProject', label: 'reportByProject' },
        { id: 'warehouseStockSummary', label: 'warehouseStockSummary' },
    ];
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setReportData(null);
        setReportTitle('');
    };
    
    const handleReportTypeChange = (rt: ReportType) => {
        setActiveReport(rt);
        setReportData(null);
        setReportTitle('');
        handleClearFilters();
    };

    const handleClearFilters = () => {
        setFilters({
            warehouseId: 'ALL',
            projectId: 'ALL',
            entityId: 'ALL',
            itemId: 'ALL',
            startDate: '',
            endDate: new Date().toISOString().split('T')[0],
        });
    };
    
    const calculateStock = (itemId: string, warehouseId: string, upToDate?: string): number => {
        let balance = 0;
        const endDate = upToDate ? new Date(upToDate) : null;
        if(endDate) endDate.setHours(23,59,59,999);
        
        (props.warehouseItemOpeningBalances || []).forEach(b => {
            if (b.itemId === itemId && b.warehouseId === warehouseId) {
                if (!endDate || new Date(b.balanceDate) <= endDate) {
                    balance += b.quantity;
                }
            }
        });

        (props.warehouseInvoices || []).forEach(inv => {
            if (!inv.details) inv.details = [];
            if (!endDate || new Date(inv.invoiceDate) <= endDate) {
                if (inv.warehouseId === warehouseId) {
                    (inv.details || []).forEach(d => {
                        if (d.itemId === itemId) {
                            if (inv.invoiceType === 'Supply') balance += d.quantity;
                            else if (inv.invoiceType === 'Dispatch') balance -= d.quantity;
                        }
                    });
                }
            }
        });

        (props.warehouseStockTransfers || []).forEach(transfer => {
            if (!endDate || new Date(transfer.transferDate) <= endDate) {
                if (transfer.itemId === itemId) {
                    if (transfer.toWarehouseId === warehouseId) balance += transfer.quantity;
                    if (transfer.fromWarehouseId === warehouseId) balance -= transfer.quantity;
                }
            }
        });
        return balance;
    };

    const handleGenerateReport = () => {
        if (!activeReport) {
            setReportData(null);
            return;
        }
        
        setReportTitle(t.operations.warehouseReports.reportTitles[activeReport]);
        
        switch (activeReport) {
            case 'itemByStatus': {
                const data: any[] = [];
                const relevantWarehouses = filters.warehouseId === 'ALL'
                    ? props.warehouses
                    : props.warehouses.filter(w => w.id === filters.warehouseId);
                
                props.warehouseItems.forEach(item => {
                    relevantWarehouses.forEach(warehouse => {
                        const currentStock = calculateStock(item.id, warehouse.id);
                        if (item.minimumStock > 0 && currentStock < item.minimumStock) {
                            data.push({
                                warehouse: warehouse.name,
                                item: item.name,
                                unit: item.unit,
                                currentStock: currentStock,
                                minimumStock: item.minimumStock,
                                shortage: item.minimumStock - currentStock,
                            });
                        }
                    });
                });
                setReportData(data);
                break;
            }
            case 'balancesOfAllItems': {
                 const data: any[] = [];
                const relevantWarehouses = filters.warehouseId === 'ALL'
                    ? props.warehouses
                    : props.warehouses.filter(w => w.id === filters.warehouseId);

                props.warehouseItems.forEach(item => {
                    relevantWarehouses.forEach(warehouse => {
                        const currentStock = calculateStock(item.id, warehouse.id);
                        if (currentStock !== 0) {
                             data.push({
                                warehouse: warehouse.name,
                                item: item.name,
                                unit: item.unit,
                                currentStock: currentStock,
                            });
                        }
                    });
                });
                setReportData(data);
                break;
            }
            case 'reportByProject': {
                if(filters.projectId === 'ALL') {
                    setReportData([]);
                    return;
                }
                const data: any[] = [];
                (props.warehouseInvoices || [])
                    .filter(inv => inv.projectId === filters.projectId)
                    .forEach(inv => {
                        if (!inv.details) inv.details = [];
                        (inv.details || []).forEach(d => {
                            const item = props.warehouseItems.find(i => i.id === d.itemId);
                            const entity = props.warehouseEntities.find(e => e.id === inv.entityId);
                            data.push({
                                date: inv.invoiceDate,
                                type: t.operations.warehousesManagement.invoices.types[inv.invoiceType],
                                item: item?.name || 'N/A',
                                quantity: d.quantity,
                                warehouse: props.warehouses.find(w => w.id === inv.warehouseId)?.name || 'N/A',
                                entity: entity?.name || 'N/A',
                            });
                        });
                    });
                setReportData(data.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
                break;
            }
            case 'reportByEntity': {
                if (filters.entityId === 'ALL') {
                    setReportData([]);
                    return;
                }
                const data: any[] = [];
                (props.warehouseInvoices || [])
                    .filter(inv => inv.entityId === filters.entityId)
                    .forEach(inv => {
                        if (!inv.details) inv.details = [];
                        (inv.details || []).forEach(d => {
                            const item = props.warehouseItems.find(i => i.id === d.itemId);
                            const project = props.projects.find(p => p.id === inv.projectId);
                            data.push({
                                date: inv.invoiceDate,
                                type: t.operations.warehousesManagement.invoices.types[inv.invoiceType],
                                item: item?.name || 'N/A',
                                quantity: d.quantity,
                                warehouse: props.warehouses.find(w => w.id === inv.warehouseId)?.name || 'N/A',
                                project: project ? (language === 'ar' ? project.nameAr : project.nameEn) : 'N/A',
                            });
                        });
                    });
                setReportData(data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
                break;
            }
            case 'cumulativeReport': {
                let data: any[] = [];
                const startDate = filters.startDate ? new Date(filters.startDate) : null;
                const endDate = filters.endDate ? new Date(filters.endDate) : null;
                if(endDate) endDate.setHours(23,59,59,999);
                
                const relevantWarehouses = filters.warehouseId === 'ALL'
                    ? props.warehouses.map(w => w.id)
                    : [filters.warehouseId];

                (props.warehouseInvoices || []).forEach(inv => {
                    const invDate = new Date(inv.invoiceDate);
                    if (!inv.details) inv.details = [];
                    if (
                        relevantWarehouses.includes(inv.warehouseId) &&
                        (!startDate || invDate >= startDate) &&
                        (!endDate || invDate <= endDate)
                    ) {
                        (inv.details || []).forEach(d => {
                             const item = props.warehouseItems.find(i => i.id === d.itemId);
                             const entity = props.warehouseEntities.find(e => e.id === inv.entityId);
                             data.push({
                                 date: inv.invoiceDate,
                                 transaction: inv.invoiceNumber,
                                 type: inv.invoiceType === 'Supply' ? t.operations.warehouseReports.transactionTypes.supply : t.operations.warehouseReports.transactionTypes.dispatch,
                                 item: item?.name,
                                 quantity: d.quantity,
                                 entity: entity?.name
                             });
                        });
                    }
                });
                
                (props.warehouseStockTransfers || []).forEach(transfer => {
                    const transferDate = new Date(transfer.transferDate);
                    if (
                        (!startDate || transferDate >= startDate) &&
                        (!endDate || transferDate <= endDate)
                    ) {
                        const item = props.warehouseItems.find(i => i.id === transfer.itemId);
                        if (relevantWarehouses.includes(transfer.fromWarehouseId)) {
                             data.push({
                                 date: transfer.transferDate,
                                 transaction: `TRN-${transfer.id.slice(-4)}`,
                                 type: t.operations.warehouseReports.transactionTypes.transferOut,
                                 item: item?.name,
                                 quantity: transfer.quantity,
                                 entity: props.warehouses.find(w => w.id === transfer.toWarehouseId)?.name
                             });
                        }
                        if (relevantWarehouses.includes(transfer.toWarehouseId)) {
                            data.push({
                                 date: transfer.transferDate,
                                 transaction: `TRN-${transfer.id.slice(-4)}`,
                                 type: t.operations.warehouseReports.transactionTypes.transferIn,
                                 item: item?.name,
                                 quantity: transfer.quantity,
                                 entity: props.warehouses.find(w => w.id === transfer.fromWarehouseId)?.name
                             });
                        }
                    }
                });

                setReportData(data.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
                break;
            }
            case 'warehouseStockSummary': {
                const warehouses = props.warehouses;
                const items = props.warehouseItems;
                const summary: Record<string, Record<string, number>> = {};

                items.forEach(item => {
                    summary[item.id] = {};
                    warehouses.forEach(wh => {
                        const stock = calculateStock(item.id, wh.id);
                        summary[item.id][wh.id] = stock;
                    });
                });

                const data = {
                    warehouses,
                    items,
                    summary,
                };
                setReportData(data);
                break;
            }
            case 'reportByItem': {
                if (filters.itemId === 'ALL') { setReportData([]); return; }

                const startDate = filters.startDate ? new Date(filters.startDate) : null;
                if(startDate) startDate.setHours(0,0,0,0);
                const endDate = filters.endDate ? new Date(filters.endDate) : null;
                if(endDate) endDate.setHours(23,59,59,999);

                let movements: any[] = [];

                const isWarehouseMatch = (wId: string) => filters.warehouseId === 'ALL' || wId === filters.warehouseId;

                props.warehouseItemOpeningBalances.forEach(ob => {
                    if (ob.itemId === filters.itemId && isWarehouseMatch(ob.warehouseId)) {
                        movements.push({ date: ob.balanceDate, type: 'OpeningBalanceEntry', quantity: ob.quantity, warehouseId: ob.warehouseId, details: t.operations.warehouseReports.transactionTypes.openingBalance });
                    }
                });

                props.warehouseInvoices.forEach(inv => {
                    if (isWarehouseMatch(inv.warehouseId)) {
                        (inv.details || []).forEach(d => {
                            if (d.itemId === filters.itemId) {
                                movements.push({ date: inv.invoiceDate, type: inv.invoiceType, quantity: d.quantity, warehouseId: inv.warehouseId, details: inv.invoiceNumber });
                            }
                        });
                    }
                });

                props.warehouseStockTransfers.forEach(tr => {
                    if (tr.itemId === filters.itemId) {
                        if (isWarehouseMatch(tr.fromWarehouseId)) {
                             movements.push({ date: tr.transferDate, type: 'TransferOut', quantity: tr.quantity, warehouseId: tr.fromWarehouseId, details: `To ${props.warehouses.find(w=>w.id===tr.toWarehouseId)?.name}` });
                        }
                        if (isWarehouseMatch(tr.toWarehouseId)) {
                            movements.push({ date: tr.transferDate, type: 'TransferIn', quantity: tr.quantity, warehouseId: tr.toWarehouseId, details: `From ${props.warehouses.find(w=>w.id===tr.fromWarehouseId)?.name}` });
                        }
                    }
                });

                movements.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                let runningBalance = 0;
                let reportRows: any[] = [];
                if (startDate) {
                    const preMovements = movements.filter(m => new Date(m.date) < startDate);
                    const currentMovements = movements.filter(m => {
                        const d = new Date(m.date);
                        return d >= startDate && (!endDate || d <= endDate);
                    });
                    
                    preMovements.forEach(m => {
                        if (m.type === 'Supply' || m.type === 'TransferIn' || m.type === 'OpeningBalanceEntry') {
                            runningBalance += m.quantity;
                        } else {
                            runningBalance -= m.quantity;
                        }
                    });
                    reportRows.push({ date: startDate.toISOString().split('T')[0], type: t.operations.fuelReports.openingBalance, details: '-', warehouse: '-', inQty: '-', outQty: '-', balance: runningBalance });
                    movements = currentMovements;
                }

                movements.forEach(m => {
                    const d = new Date(m.date);
                    if (!startDate || (d >= startDate && (!endDate || d <= endDate))) {
                         let inQty = 0;
                         let outQty = 0;
                         if (m.type === 'Supply' || m.type === 'TransferIn' || m.type === 'OpeningBalanceEntry') {
                             runningBalance += m.quantity;
                             inQty = m.quantity;
                         } else {
                             runningBalance -= m.quantity;
                             outQty = m.quantity;
                         }
                         const typeLabels: any = { Supply: t.operations.warehouseReports.transactionTypes.supply, Dispatch: t.operations.warehouseReports.transactionTypes.dispatch, TransferIn: t.operations.warehouseReports.transactionTypes.transferIn, TransferOut: t.operations.warehouseReports.transactionTypes.transferOut, OpeningBalanceEntry: t.operations.warehouseReports.transactionTypes.openingBalance };
                         reportRows.push({ date: m.date, type: typeLabels[m.type] || m.type, details: m.details, warehouse: props.warehouses.find(w=>w.id === m.warehouseId)?.name || 'N/A', inQty: inQty || '-', outQty: outQty || '-', balance: runningBalance });
                    }
                });
                
                setReportData(reportRows);
                break;
            }
            default: setReportData(null);
        }
    };
    
    const handlePrint = () => {
        if (!printableRef.current) return;
        const { jsPDF } = window.jspdf;
        const input = printableRef.current;
        window.html2canvas(input, { scale: 2, useCORS: true }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'l', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            const pdfHeight = pdfWidth / ratio;
            pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth - 20, pdfHeight - 20);
            pdf.save(`Warehouse-Report.pdf`);
        });
    };
    
    const renderReport = () => {
        if (!reportData) return <div className="text-center p-8 bg-slate-100 rounded-lg">{t.operations.warehouseReports.noReport}</div>;
        if (Array.isArray(reportData) && reportData.length === 0) return <div className="text-center p-8 bg-slate-100 rounded-lg">No data for this report.</div>;
        
        const renderTable = (headers: {key: string, label: string}[], data: any[], footer?: React.ReactNode) => (
            <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-slate-100"><tr>{headers.map(h => <th key={h.key} className="p-3 text-left font-semibold text-slate-700">{h.label}</th>)}</tr></thead><tbody className="divide-y divide-slate-200">{(data || []).map((row, i) => (<tr key={i} className="hover:bg-slate-50">{headers.map(h => <td key={`${i}-${h.key}`} className="p-3 text-slate-800" style={{color: '#0f172a'}}>{row[h.key]}</td>)}</tr>))}</tbody>{footer && <tfoot>{footer}</tfoot>}</table></div>
        );
        
        switch(activeReport) {
            case 'itemByStatus': return renderTable([{ key: 'warehouse', label: t.operations.warehouseReports.headers.warehouse }, { key: 'item', label: t.operations.warehouseReports.headers.item }, { key: 'unit', label: t.operations.warehouseReports.headers.unit }, { key: 'currentStock', label: t.operations.warehouseReports.headers.currentStock }, { key: 'minimumStock', label: t.operations.warehouseReports.headers.minimumStock }, { key: 'shortage', label: t.operations.warehouseReports.headers.shortage },], reportData);
            case 'balancesOfAllItems': return renderTable([{ key: 'warehouse', label: t.operations.warehouseReports.headers.warehouse }, { key: 'item', label: t.operations.warehouseReports.headers.item }, { key: 'unit', label: t.operations.warehouseReports.headers.unit }, { key: 'currentStock', label: t.operations.warehouseReports.headers.currentStock },], reportData);
            case 'reportByProject': return renderTable([{ key: 'date', label: t.operations.warehouseReports.headers.date }, { key: 'type', label: t.operations.warehouseReports.headers.type }, { key: 'item', label: t.operations.warehouseReports.headers.item }, { key: 'quantity', label: t.operations.warehouseReports.headers.quantity }, { key: 'warehouse', label: t.operations.warehouseReports.headers.warehouse }, { key: 'entity', label: t.operations.warehouseReports.headers.entity },], reportData);
            case 'reportByEntity': return renderTable([{ key: 'date', label: t.operations.warehouseReports.headers.date }, { key: 'type', label: t.operations.warehouseReports.headers.type }, { key: 'item', label: t.operations.warehouseReports.headers.item }, { key: 'quantity', label: t.operations.warehouseReports.headers.quantity }, { key: 'warehouse', label: t.operations.warehouseReports.headers.warehouse }, { key: 'project', label: t.operations.warehouseReports.headers.project },], reportData);
            case 'cumulativeReport': return renderTable([{ key: 'date', label: t.operations.warehouseReports.headers.date }, { key: 'transaction', label: t.operations.warehouseReports.headers.transaction }, { key: 'type', label: t.operations.warehouseReports.headers.type }, { key: 'item', label: t.operations.warehouseReports.headers.item }, { key: 'quantity', label: t.operations.warehouseReports.headers.quantity }, { key: 'entity', label: t.operations.warehouseReports.headers.entity },], reportData);
            case 'warehouseStockSummary': const { warehouses, items, summary } = reportData; const grandTotals = warehouses.map((wh: Warehouse) => items.reduce((acc: number, item: WarehouseItem) => acc + (summary[item.id]?.[wh.id] || 0), 0)); return (<div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-slate-100"><tr><th className="p-3 text-left font-semibold text-slate-700">{t.operations.warehouseReports.headers.item}</th>{warehouses.map((wh: Warehouse) => <th key={wh.id} className="p-3 text-center font-semibold text-slate-700">{wh.name}</th>)}<th className="p-3 text-center font-semibold text-slate-700">Total</th></tr></thead><tbody className="divide-y divide-slate-200">{items.map((item: WarehouseItem) => { const rowTotal = warehouses.reduce((acc: number, wh: Warehouse) => acc + (summary[item.id]?.[wh.id] || 0), 0); return (<tr key={item.id} className="hover:bg-slate-50"><td className="p-3 font-medium text-slate-800" style={{color: '#0f172a'}}>{item.name}</td>{warehouses.map((wh: Warehouse) => <td key={wh.id} className="p-3 text-center text-slate-800" style={{color: '#0f172a'}}>{summary[item.id]?.[wh.id] || '-'}</td>)}<td className="p-3 text-center font-bold text-slate-800" style={{color: '#0f172a'}}>{rowTotal}</td></tr>); })}</tbody><tfoot><tr className="bg-slate-200 font-bold"><td className="p-3 text-left" style={{color: '#0f172a'}}>Total</td>{grandTotals.map((total: number, i: number) => <td key={i} className="p-3 text-center" style={{color: '#0f172a'}}>{total}</td>)}<td className="p-3 text-center" style={{color: '#0f172a'}}>{grandTotals.reduce((a:number,b:number) => a + b, 0)}</td></tr></tfoot></table></div>);
            case 'reportByItem': return renderTable([{ key: 'date', label: t.operations.warehouseReports.headers.date }, { key: 'warehouse', label: t.operations.warehouseReports.headers.warehouse }, { key: 'type', label: t.operations.warehouseReports.headers.type }, { key: 'details', label: t.operations.warehouseReports.headers.details }, { key: 'inQty', label: t.operations.warehouseReports.headers.in }, { key: 'outQty', label: t.operations.warehouseReports.headers.out }, { key: 'balance', label: t.operations.warehouseReports.headers.balance },], reportData);
            default: return null;
        }
    };
    
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800">{t.operations.warehouseReports.title}</h2>
            
            <div className="p-4 bg-slate-50 border rounded-lg space-y-4">
                <h3 className="text-lg font-semibold text-slate-700">{t.activityLog.filters}</h3>
                
                <div className="flex flex-wrap gap-2">
                    {reportTypes.map(rt => (
                        <button 
                            key={rt.id} 
                            onClick={() => handleReportTypeChange(rt.id)}
                            className={`px-3 py-2 text-sm font-semibold rounded-md ${activeReport === rt.id ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100 border'}`}
                        >
                            {t.operations.warehouseReports.buttons[rt.label]}
                        </button>
                    ))}
                </div>

                {activeReport && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                     {['reportByItem', 'balancesOfAllItems', 'itemByStatus', 'cumulativeReport'].includes(activeReport) && <FormField label={t.operations.warehouseReports.warehouse}><select name="warehouseId" value={filters.warehouseId} onChange={handleFilterChange} className={inputClasses}><option value="ALL">{t.common.all}</option>{props.warehouses.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select></FormField>}
                     {['reportByItem'].includes(activeReport) && <FormField label={t.operations.warehouseReports.item}><select name="itemId" value={filters.itemId} onChange={handleFilterChange} className={inputClasses}><option value="ALL">{t.common.all}</option>{props.warehouseItems.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}</select></FormField>}
                     {['reportByProject'].includes(activeReport) && <FormField label={t.operations.warehouseReports.project}><select name="projectId" value={filters.projectId} onChange={handleFilterChange} className={inputClasses}><option value="ALL">{t.common.all}</option>{props.projects.map(p=><option key={p.id} value={p.id}>{language==='ar' ? p.nameAr : p.nameEn}</option>)}</select></FormField>}
                     {['reportByEntity'].includes(activeReport) && <FormField label={t.operations.warehouseReports.entity}><select name="entityId" value={filters.entityId} onChange={handleFilterChange} className={inputClasses}><option value="ALL">{t.common.all}</option>{props.warehouseEntities.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></FormField>}
                     {['reportByItem', 'cumulativeReport'].includes(activeReport) && <FormField label={t.operations.warehouseReports.startDate}><input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className={inputClasses}/></FormField>}
                     {['reportByItem', 'cumulativeReport'].includes(activeReport) && <FormField label={t.operations.warehouseReports.endDate}><input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className={inputClasses}/></FormField>}

                     <div className="flex items-end">
                        <button onClick={handleGenerateReport} className="py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700">{t.operations.warehouseReports.generateReport}</button>
                    </div>
                </div>}
            </div>
            
             <div ref={printableRef} className="p-4 bg-white border rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-800">{reportTitle}</h3>
                    {reportData && <button onClick={handlePrint} className="flex items-center gap-2 py-2 px-4 text-sm font-semibold bg-slate-600 text-white hover:bg-slate-700 rounded-lg"><PrinterIcon/> {t.operations.warehouseReports.printReport}</button>}
                </div>
                {renderReport()}
            </div>
        </div>
    );
};

export default WarehouseReports;