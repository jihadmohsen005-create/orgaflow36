import React from 'react';
import { PurchaseRequest, Project, OrganizationInfo, Supplier, Item } from '../types';
import { useTranslation } from '../LanguageContext';
import { PrinterIcon } from './icons';

interface PriceComparisonPrintableProps {
    request: PurchaseRequest;
    project?: Project;
    organizationInfo: OrganizationInfo;
    suppliers: Supplier[];
    analysisData: any; 
}

const PriceComparisonPrintable: React.FC<PriceComparisonPrintableProps> = ({ request, project, organizationInfo, suppliers, analysisData }) => {
    const { t, language } = useTranslation();
    const { rows, totals, finalTotals, discounts, selectedSupplierIds } = analysisData;

    const handlePrint = () => {
        const { jsPDF } = window.jspdf;
        const input = document.getElementById('printable-comparison-area');

        if (input) {
            window.html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({
                    orientation: 'l', // landscape
                    unit: 'mm',
                    format: 'a4'
                });
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const ratio = canvasWidth / canvasHeight;
                const pdfHeight = pdfWidth / ratio;

                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`PriceComparison-${request.requestCode}.pdf`);
            });
        }
    };
    
    const InfoRow: React.FC<{ label: string; value: string; }> = ({ label, value }) => (
        <tr className="border-b border-black">
            <th className="border-r border-black p-1.5 text-left font-bold bg-green-100">{label}</th>
            <td className="p-1.5">{value}</td>
        </tr>
    );

    return (
        <div>
            <div id="printable-comparison-area" className="printable-container p-4 bg-white">
                <style>{`
                    .printable-container * {
                        color: black !important;
                        border-color: black !important;
                    }
                    .printable-container {
                        font-family: 'Cairo', sans-serif;
                    }
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #printable-comparison-area, #printable-comparison-area * {
                            visibility: visible;
                        }
                        #printable-comparison-area {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                        }
                        @page {
                            size: landscape;
                            margin: 1cm;
                        }
                        .print-table {
                            font-size: 10px;
                        }
                        .print-table th, .print-table td {
                            padding: 4px;
                        }
                    }
                    .bg-green-100 { background-color: #f0fdf4 !important; }
                    .bg-blue-100 { background-color: #dbeafe !important; }
                `}</style>

                {/* Header */}
                <header className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold">{t.priceComparison.title}</h1>
                    <div className="text-right">
                        <div className="flex items-center justify-end gap-3">
                             <h2 className="font-bold text-lg">{language === 'ar' ? organizationInfo.nameAr : organizationInfo.nameEn}</h2>
                             {organizationInfo.logoUrl && (
                                <img src={organizationInfo.logoUrl} alt="Logo" className="h-16 w-16 object-contain" />
                            )}
                        </div>
                        <p className="text-sm">Date: {new Date().toLocaleDateString('en-CA')}</p>
                    </div>
                </header>

                {/* Info Section */}
                <table className="w-full border-collapse border border-black mb-4 text-sm">
                    <tbody>
                        <InfoRow label={t.priceComparison.projectName} value={language === 'ar' ? project?.nameAr || '' : project?.nameEn || ''} />
                        <InfoRow label={t.priceComparison.rfq} value={language === 'ar' ? request.nameAr : request.nameEn} />
                        <InfoRow label={t.priceComparison.projectCode} value={project?.projectCode || ''} />
                        <InfoRow label={t.priceComparison.rfqCode} value={request.requestCode} />
                    </tbody>
                </table>

                {/* Comparison Table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-black text-xs print-table">
                        <thead className="bg-green-100 font-bold">
                            <tr>
                                <th rowSpan={2} className="border border-black p-1">{t.priceComparison.sn}</th>
                                <th rowSpan={2} className="border border-black p-1 w-1/4 text-left">{t.priceComparison.item}</th>
                                <th rowSpan={2} className="border border-black p-1">{t.priceComparison.unit}</th>
                                <th rowSpan={2} className="border border-black p-1">{t.priceComparison.qty}</th>
                                {selectedSupplierIds.map((id: string) => {
                                    const sup = suppliers.find(s => s.id === id);
                                    return <th key={id} colSpan={2} className="border border-black p-1">{sup ? (language === 'ar' ? sup.nameAr : sup.nameEn) : ''}</th>;
                                })}
                            </tr>
                            <tr>
                                {selectedSupplierIds.map((id: string) => (
                                    <React.Fragment key={id}>
                                        <th className="border border-black p-1">{t.priceComparison.price}</th>
                                        <th className="border border-black p-1">{t.priceComparison.total}</th>
                                    </React.Fragment>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(({ reqItem, itemInfo, prices }: any, index: number) => (
                                <tr key={reqItem.itemId}>
                                    <td className="border border-black p-1 text-center">{index + 1}</td>
                                    <td className="border border-black p-1 text-left">{itemInfo ? (language === 'ar' ? itemInfo.nameAr : itemInfo.nameEn) : ''}</td>
                                    <td className="border border-black p-1 text-center">{itemInfo?.unit}</td>
                                    <td className="border border-black p-1 text-center">{reqItem.quantity}</td>
                                    {selectedSupplierIds.map((supId: string, supIndex: number) => {
                                        const price = prices[supIndex];
                                        return (
                                            <React.Fragment key={supId}>
                                                <td className="border border-black p-1 text-center">{price?.toFixed(2) ?? '-'}</td>
                                                <td className="border border-black p-1 text-center">{price ? (price * reqItem.quantity).toFixed(2) : '-'}</td>
                                            </React.Fragment>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="font-bold">
                            <tr>
                                <td colSpan={4} className="border border-black p-1 text-left bg-blue-100">{t.priceComparison.totalBeforeDiscount}</td>
                                {selectedSupplierIds.map((supId: string) => (
                                    <td key={supId} colSpan={2} className="border border-black p-1 text-center bg-blue-100">{(totals[supId] || 0).toFixed(2)}</td>
                                ))}
                            </tr>
                            <tr>
                                <td colSpan={4} className="border border-black p-1 text-left">{t.priceComparison.discount}</td>
                                 {selectedSupplierIds.map((supId: string) => (
                                    <td key={supId} colSpan={2} className="border border-black p-1 text-center">{parseFloat(discounts[supId] || '0').toFixed(2)} %</td>
                                ))}
                            </tr>
                            <tr className="bg-green-100">
                                <td colSpan={4} className="border border-black p-1 text-left">{t.priceComparison.totalAfterDiscount}</td>
                                {selectedSupplierIds.map((supId: string) => (
                                    <td key={supId} colSpan={2} className="border border-black p-1 text-center">{(finalTotals[supId] || 0).toFixed(2)}</td>
                                ))}
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            <div className="mt-6 pt-6 border-t flex justify-end">
                <button onClick={handlePrint} className="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                    <PrinterIcon />
                    {t.priceComparison.print}
                </button>
            </div>
        </div>
    );
};

export default PriceComparisonPrintable;