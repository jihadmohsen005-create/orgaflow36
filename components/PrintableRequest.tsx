import React from 'react';
import { PurchaseRequest, Item, Project, OrganizationInfo, Role, ApprovalStatus } from '../types';
import { useTranslation } from '../LanguageContext';
import { translations } from '../translations';
import { PrinterIcon } from './icons';

interface PrintableRequestProps {
    request: PurchaseRequest;
    items: Item[];
    project?: Project;
    organizationInfo: OrganizationInfo;
    roles: Role[];
}

const PrintableRequest: React.FC<PrintableRequestProps> = ({ request, items, project, organizationInfo, roles }) => {
    const { t, language } = useTranslation();

    const handlePrint = () => {
        const { jsPDF } = window.jspdf;
        const input = document.getElementById('printable-area');

        if (input) {
            window.html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({
                    orientation: 'p',
                    unit: 'mm',
                    format: 'a4'
                });
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const ratio = canvasWidth / canvasHeight;
                const pdfHeight = pdfWidth / ratio;

                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`Request-${request.requestCode}.pdf`);
            });
        }
    };

    const grandTotal = request.items.reduce((acc, reqItem) => {
        const itemDetail = items.find(i => i.id === reqItem.itemId);
        return acc + (reqItem.quantity * (itemDetail?.estimatedPrice ?? 0));
    }, 0);

    const roleToApprovalTitleKey = (roleId: string): keyof typeof t.signatureApprovals | null => {
        if (roleId.includes('procurement')) return 'logistical';
        if (roleId.includes('finance')) return 'financial';
        if (roleId.includes('director')) return 'management';
        if (roleId.includes('coordinator') || roleId.includes('technical')) return 'technical';
        return null;
    };


    return (
        <div>
            <div id="printable-area" className="printable-container p-2 bg-white font-sans">
                {/* Header */}
                 <header className="pb-2 mb-2 border-b-2 border-black">
                    <div className="flex justify-between items-start">
                        {/* Left side */}
                        <div className="flex items-center gap-4">
                            {organizationInfo.logoUrl && (
                                <img src={organizationInfo.logoUrl} alt="Logo" className="h-16 w-16 object-contain" />
                            )}
                            <div>
                                <p className="font-bold text-base">{organizationInfo.nameAr}</p>
                                <p className="text-sm">{organizationInfo.nameEn}</p>
                            </div>
                        </div>
                        {/* Right side */}
                        <div className="flex items-center gap-4 text-right">
                             <div>
                                <p className="font-bold text-base">{organizationInfo.nameAr}</p>
                                <p className="text-sm">{organizationInfo.nameEn}</p>
                             </div>
                             {organizationInfo.logoUrl && (
                                <img src={organizationInfo.logoUrl} alt="Logo" className="h-16 w-16 object-contain" />
                            )}
                        </div>
                    </div>
                    <div className="text-center mt-2">
                        <p className="font-bold text-lg">{t.printableRequest.subtitle}</p>
                        <p className="text-base">{t.printableRequest.title}</p>
                    </div>
                </header>
                <div className="text-right text-xs pb-1 mb-2">
                    <b>{t.printableRequest.date}:</b> {request.requestDate}
                </div>


                {/* Request Info */}
                 <section className="mb-2 border-t border-r border-l border-black text-xs">
                    <div className="grid grid-cols-[auto_1fr] border-b border-black">
                        <div className="p-1 border-r border-black font-bold"><p>{t.printableRequest.project}</p><p className="text-right">اسم المشروع</p></div>
                        <div className="p-1 text-center"><p>{project?.nameEn}</p><p className="text-right">{project?.nameAr}</p></div>
                    </div>
                     <div className="grid grid-cols-[auto_1fr] border-b border-black">
                        <div className="p-1 border-r border-black font-bold"><p>{t.printableRequest.tenderTitle}</p><p className="text-right">اسم العطاء</p></div>
                        <div className="p-1 text-center"><p>{request.nameEn}</p><p className="text-right">{request.nameAr}</p></div>
                    </div>
                     <div className="grid grid-cols-[auto_1fr_auto_1fr] border-b border-black">
                        <div className="p-1 border-r border-black font-bold"><p>{t.printableRequest.projectCode}</p><p className="text-right">رمز المشروع</p></div>
                        <div className="p-1 text-center border-r border-black"><p>{project?.projectCode}</p></div>
                        <div className="p-1 border-r border-black font-bold"><p>{t.printableRequest.rfqCode}</p><p className="text-right">كود العرض</p></div>
                        <div className="p-1 text-center"><p>{request.requestCode}</p></div>
                    </div>
                    <div className="grid grid-cols-[auto_1fr_auto_1fr] border-b border-black">
                        <div className="p-1 border-r border-black font-bold"><p>{t.printableRequest.applicant}</p><p className="text-right">مقدم الطلب</p></div>
                        <div className="p-1 text-center border-r border-black"><p>{request.requesterName}</p></div>
                        <div className="p-1 border-r border-black font-bold"><p>{t.printableRequest.currency}</p><p className="text-right">العملة</p></div>
                        <div className="p-1 text-center"><p>{request.currency}</p></div>
                    </div>
                </section>


                {/* Items Table */}
                <section>
                    <table className="w-full border-collapse border border-black text-xs">
                        <thead className="bg-gray-100 font-bold">
                            <tr className="text-center">
                                <td className="border border-black p-1 w-[5%]"><p>SN.</p><p>{t.printableRequest.sn}</p></td>
                                <td className="border border-black p-1 w-[45%]"><p>Item description</p><p>{t.printableRequest.itemDescription}</p></td>
                                <td className="border border-black p-1 w-[8%]"><p>Unit</p><p>{t.printableRequest.unit}</p></td>
                                <td className="border border-black p-1 w-[8%]"><p>Quantity</p><p>{t.printableRequest.quantity}</p></td>
                                <td className="border border-black p-1 w-[12%]"><p>Estimated Price</p><p>{t.printableRequest.estimatedPrice}</p></td>
                                <td className="border border-black p-1 w-[12%]"><p>Total</p><p>{t.printableRequest.total}</p></td>
                            </tr>
                        </thead>
                        <tbody>
                            {request.items.map((reqItem, index) => {
                                const itemDetail = items.find(i => i.id === reqItem.itemId);
                                const price = itemDetail?.estimatedPrice ?? 0;
                                const total = reqItem.quantity * price;
                                return (
                                    <tr key={index}>
                                        <td className="border border-black p-1 text-center">{index + 1}</td>
                                        <td className="border border-black p-1">
                                            <p dir="rtl" className="text-right">{itemDetail?.descriptionAr}</p>
                                            <p dir="ltr" className="text-left">{itemDetail?.descriptionEn}</p>
                                        </td>
                                        <td className="border border-black p-1 text-center">{itemDetail?.unit}</td>
                                        <td className="border border-black p-1 text-center">{reqItem.quantity}</td>
                                        <td className="border border-black p-1 text-center">{(price || 0).toFixed(2)}</td>
                                        <td className="border border-black p-1 text-center">{(total || 0).toFixed(2)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr className="font-bold bg-gray-100">
                                <td colSpan={5} className="p-1 border border-black text-start"><p>Total</p><p className="text-right">{t.printableRequest.grandTotal}</p></td>
                                <td className="p-1 border border-black text-center">{(grandTotal || 0).toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </section>

                {/* Signatures Section */}
                <section className="mt-2 border border-black">
                     <div className="text-center font-bold p-1 bg-gray-100 border-b border-black">
                        {t.printableRequest.signatures}
                    </div>
                    <div className="grid grid-cols-4">
                        {request.approvals.map((step, index) => {
                             const role = roles.find(r => r.id === step.roleId);
                             const titleKey = roleToApprovalTitleKey(step.roleId);
                             const titleEn = titleKey ? t.signatureApprovals[titleKey as keyof typeof t.signatureApprovals] : (role?.nameEn || '');
                             const titleAr = titleKey ? t.signatureApprovals[titleKey as keyof typeof t.signatureApprovals] : (role?.nameAr || '');

                             return (
                                 <div key={index} className={`p-2 text-xs ${index < 3 ? 'border-r border-black' : ''}`}>
                                    <div className="text-center font-bold border-b border-black pb-1 mb-2">
                                        <p>{titleEn}</p>
                                        <p>{titleAr}</p>
                                    </div>
                                    <div className="grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-2">
                                      <div>
                                        <p className="font-bold">Name</p>
                                        <p className="font-bold text-right">{t.printableRequest.name}</p>
                                      </div>
                                      <p className="border-b border-gray-400 min-h-[18px] text-center">{step.status === ApprovalStatus.APPROVED ? step.userName : ''}</p>
                                      
                                      <div>
                                        <p className="font-bold">Position</p>
                                        <p className="font-bold text-right">{t.printableRequest.position}</p>
                                      </div>
                                      <p className="border-b border-gray-400 min-h-[18px] text-center">{role ? (language === 'ar' ? role.nameAr : role.nameEn) : ''}</p>

                                      <div>
                                        <p className="font-bold">Signature</p>
                                        <p className="font-bold text-right">{t.printableRequest.signature}</p>
                                      </div>
                                      <div className="h-10 border-b border-gray-400"></div>
                                    </div>
                                 </div>
                             )
                        })}
                    </div>
                </section>
            </div>

            <div className="mt-6 pt-6 border-t flex justify-end">
                <button onClick={handlePrint} className="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                    <PrinterIcon />
                    {t.approvalsPage.printRequest}
                </button>
            </div>
            
            <style>
                {`
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
                    #printable-area, #printable-area * {
                        visibility: visible;
                    }
                    #printable-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    @page {
                        size: A4;
                        margin: 1cm;
                    }
                }
                `}
            </style>
        </div>
    );
};

export default PrintableRequest;