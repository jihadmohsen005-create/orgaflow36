import React from 'react';
import { PurchaseOrder, PurchaseRequest, Project, Supplier, Item, OrganizationInfo } from '../types';
import { useTranslation } from '../LanguageContext';
import { translations } from '../translations';
import { PrinterIcon } from './icons';

interface PrintablePurchaseOrderProps {
    purchaseOrder: PurchaseOrder;
    request: PurchaseRequest;
    project: Project;
    supplier: Supplier;
    items: Item[];
    organizationInfo: OrganizationInfo;
}

const PrintablePurchaseOrder: React.FC<PrintablePurchaseOrderProps> = ({ purchaseOrder, request, project, supplier, items, organizationInfo }) => {
    const { t, language } = useTranslation();
    const arTranslations = (translations as any).ar || translations.en;
    const enTranslations = translations.en;


    const handlePrint = async () => {
        const { jsPDF } = window.jspdf;
        const pages = document.querySelectorAll('.printable-page');
        const loader = document.getElementById('pdf-loader');
        if(loader) loader.style.display = 'block';

        if (pages.length > 0) {
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4'
            });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            for (let i = 0; i < pages.length; i++) {
                const page = pages[i] as HTMLElement;
                const canvas = await window.html2canvas(page, { scale: 2, useCORS: true });
                const imgData = canvas.toDataURL('image/png');
                
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const ratio = canvasWidth / canvasHeight;
                let imgWidth = pdfWidth;
                let imgHeight = imgWidth / ratio;
                
                if (imgHeight > pdfHeight) {
                    imgHeight = pdfHeight;
                    imgWidth = imgHeight * ratio;
                }

                if (i > 0) {
                    pdf.addPage();
                }
                
                const x = (pdfWidth - imgWidth) / 2;
                pdf.addImage(imgData, 'PNG', x, 0, imgWidth, imgHeight);
            }
            
            pdf.save(`PO-${purchaseOrder.poNumber}.pdf`);
        }
        if(loader) loader.style.display = 'none';
    };

    const currencyInfo = {
        USD: {
            major_en: 'dollar',
            major_en_plural: 'dollars',
            minor_en: 'cent',
            minor_en_plural: 'cents',
            major_ar: 'دولار',
            major_ar_plural: 'دولارات',
            minor_ar: 'سنت',
            minor_ar_plural: 'سنتاً'
        },
        ILS: {
            major_en: 'shekel',
            major_en_plural: 'shekels',
            minor_en: 'agora',
            minor_en_plural: 'agorot',
            major_ar: 'شيكل',
            major_ar_plural: 'شواقل',
            minor_ar: 'أغورة',
            minor_ar_plural: 'أغورات'
        },
        EUR: {
            major_en: 'euro',
            major_en_plural: 'euros',
            minor_en: 'cent',
            minor_en_plural: 'cents',
            major_ar: 'يورو',
            major_ar_plural: 'يورو',
            minor_ar: 'سنت',
            minor_ar_plural: 'سنتاً'
        }
    };

    const toWordsEn = (num: number, currency: 'USD' | 'ILS' | 'EUR'): string => {
        const info = currencyInfo[currency];
        const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
        const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
        const convert = (n: number): string => {
            if (n < 20) return a[n];
            let str = '';
            str += b[Math.floor(n / 10)];
            str += (n % 10 !== 0) ? '-' + a[n % 10] : '';
            return str;
        }

        const numStr = num.toFixed(2);
        const [major, minor] = numStr.split('.').map(s => parseInt(s, 10));

        let words = '';
        if (major > 0) {
            words += convert(major) + ' ' + (major === 1 ? info.major_en : info.major_en_plural);
        }
        if (minor > 0) {
            if (words) words += ' and ';
            words += convert(minor) + ' ' + (minor === 1 ? info.minor_en : info.minor_en_plural);
        }
        return words.trim().replace(/\s+/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    const toWordsAr = (num: number, currency: 'USD' | 'ILS' | 'EUR'): string => {
        const info = currencyInfo[currency];
        const numStr = num.toFixed(2);
        const [major, minor] = numStr.split('.').map(s => parseInt(s, 10));

        const tafqeet = (n: number): string => {
            if (n === 0) return 'صفر';
            const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
            const onesFeminine = ['', 'إحدى', 'اثنتان', 'ثلاث', 'أربع', 'خمس', 'ست', 'سبع', 'ثمان', 'تسع'];
            const tens = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
            const hundreds = ['', 'مئة', 'مئتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];
            const thousands = ['', 'ألف', 'ألفان', 'آلاف'];
            const millions = ['', 'مليون', 'مليونان', 'ملايين'];

            let words = [];
            const processGroup = (groupNum: number): string[] => {
                let tempWords = [];
                let h = Math.floor(groupNum / 100);
                let t = Math.floor((groupNum % 100) / 10);
                let o = groupNum % 10;
                if (h > 0) tempWords.push(hundreds[h]);
                if (t === 1 && o > 0) {
                    tempWords.push(onesFeminine[o] + ' ' + tens[1]);
                } else {
                    if (o > 0) tempWords.push(ones[o]);
                    if (t > 1) tempWords.push(tens[t]);
                }
                return tempWords.reverse();
            };

            let millionsPart = Math.floor(n / 1000000);
            let thousandsPart = Math.floor((n % 1000000) / 1000);
            let unitsPart = n % 1000;

            if (millionsPart > 0) {
                if (millionsPart === 1) words.push(millions[1]);
                else if (millionsPart === 2) words.push(millions[2]);
                else if (millionsPart >= 3 && millionsPart <= 10) words.push(processGroup(millionsPart).join(' ') + ' ' + millions[3]);
                else words.push(processGroup(millionsPart).join(' ') + ' ' + millions[1]);
            }
            if (thousandsPart > 0) {
                if (thousandsPart === 1) words.push(thousands[1]);
                else if (thousandsPart === 2) words.push(thousands[2]);
                else if (thousandsPart >= 3 && thousandsPart <= 10) words.push(processGroup(thousandsPart).join(' ') + ' ' + thousands[3]);
                else words.push(processGroup(thousandsPart).join(' ') + ' ' + thousands[1]);
            }
            if (unitsPart > 0) {
                words.push(processGroup(unitsPart).join(' '));
            }
            return words.join(' و ');
        };

        let words = '';
        if (major > 0) {
            words += tafqeet(major) + ' ' + (major > 2 ? info.major_ar_plural : info.major_ar);
        }
        if (minor > 0) {
            if (words) words += ' و ';
            words += tafqeet(minor) + ' ' + (minor > 2 ? info.minor_ar_plural : info.minor_ar);
        }

        return words.trim();
    };

    const totalAmount = purchaseOrder.totalAmount;
    const amountInWordsEn = toWordsEn(totalAmount, request.currency);
    const amountInWordsAr = toWordsAr(totalAmount, request.currency);

    const Header = () => (
        <header className="flex justify-between items-center pb-2 mb-2">
            <div className="flex items-center gap-4">
                {organizationInfo.logoUrl && (
                    <img src={organizationInfo.logoUrl} alt="Logo" className="h-16 w-16 object-contain" />
                )}
            </div>
            <div className="text-center">
                <p className="font-bold text-lg">{organizationInfo.nameAr}</p>
                <p className="text-sm">{organizationInfo.nameEn}</p>
            </div>
            <div className="flex items-center gap-4 text-right">
                {organizationInfo.logoUrl && (
                    <img src={organizationInfo.logoUrl} alt="Logo" className="h-16 w-16 object-contain" />
                )}
            </div>
        </header>
    );

    const PageFooter: React.FC<{ currentPage: number; totalPages: number; }> = ({ currentPage, totalPages }) => (
        <div className="text-center text-xs mt-auto pt-2">
            {t.purchaseOrderPrintable.page.replace('{currentPage}', String(currentPage)).replace('{totalPages}', String(totalPages))}
        </div>
    );
    
    return (
        <div>
            <div id="printable-po-area" className="printable-container bg-white font-sans text-sm">
                
                {/* --- PAGE 1 --- */}
                <div className="printable-page p-2 min-h-[26cm] flex flex-col">
                    <Header />
                    <div className="text-center py-2 mb-2 border-y-2 border-black bg-gray-200">
                        <h2 className="text-xl font-bold">{language === 'ar' ? t.purchaseOrderPrintable.title : 'Purchase order'} <span className="font-normal mx-2">/</span> {language === 'en' ? t.purchaseOrderPrintable.title : 'أمر شراء'}</h2>
                    </div>
                    <div className="text-right font-bold">
                        {t.purchaseOrderPrintable.dateOrder}: {purchaseOrder.creationDate}
                    </div>

                    <table className="w-full border-collapse border border-black my-2">
                        <tbody>
                            <tr className="border-b border-black">
                                <td className="p-1 font-bold border-r border-black">{t.printableRequest.project}<br/>{arTranslations.printableRequest.project}</td>
                                <td className="p-1 text-center">{project.nameEn}<br/>{project.nameAr}</td>
                            </tr>
                            <tr className="border-b border-black">
                                <td className="p-1 font-bold border-r border-black">{t.printableRequest.tenderTitle}<br/>{arTranslations.printableRequest.tenderTitle}</td>
                                <td className="p-1 text-center">{request.nameEn}<br/>{request.nameAr}</td>
                            </tr>
                             <tr className="border-b border-black">
                                <td className="p-1 font-bold border-r border-black">{t.printableRequest.projectCode}<br/>{arTranslations.printableRequest.projectCode}</td>
                                <td className="p-1 text-center">{project.projectCode}</td>
                            </tr>
                             <tr>
                                <td className="p-1 font-bold border-r border-black">{t.printableRequest.rfqCode}<br/>{arTranslations.printableRequest.rfqCode}</td>
                                <td className="p-1 text-center">{request.requestCode}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="border border-black p-2">
                        <p><b>{t.purchaseOrderPrintable.to}:</b> {language === 'ar' ? supplier.nameAr : supplier.nameEn}</p>
                        <p><b>{t.purchaseOrderPrintable.address}:</b> {supplier.address}</p>
                    </div>

                    <div className="my-4 space-y-3 text-sm">
                        <p className="text-right font-bold">{arTranslations.purchaseOrderPrintable.greeting}</p>
                        <p className="text-right leading-relaxed">
                            {arTranslations.purchaseOrderPrintable.awardText
                            .replace('{amountInWords}', amountInWordsAr)
                            .replace('{amountInNumbers}', totalAmount.toFixed(2))
                            .replace('{currency}', request.currency)}
                        </p>
                        <p className="text-left leading-relaxed">
                            {enTranslations.purchaseOrderPrintable.awardText
                            .replace('{amountInWords}', amountInWordsEn)
                            .replace('{amountInNumbers}', totalAmount.toFixed(2))
                            .replace('{currency}', request.currency)}
                        </p>
                    </div>
                    
                    <div className="mt-auto pt-4">
                        <p className="font-bold">{t.printableRequest.signature}:</p>
                        <div className="grid grid-cols-2 gap-8 pt-6">
                            <div className="text-center">
                                <p className="font-bold">{t.purchaseOrderPrintable.authorizedOnBehalfOfOrg.replace('{orgName}', language === 'ar' ? organizationInfo.nameAr : organizationInfo.nameEn)}</p>
                                <p className="mt-2">{t.purchaseOrderPrintable.nameAndTitle}: Mohammed Al-Nairab</p>
                                <p>Executive Manager</p>
                                <div className="mt-12 border-t border-black pt-1">
                                    <p>{t.purchaseOrderPrintable.signature}</p>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="font-bold">{t.purchaseOrderPrintable.authorizedOnBehalfOfVendor}</p>
                                 <p className="mt-2">{t.purchaseOrderPrintable.nameAndTitle}:</p>
                                <div className="mt-16 border-t border-black pt-1">
                                    <p>{t.purchaseOrderPrintable.signature}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <PageFooter currentPage={1} totalPages={3} />
                </div>

                {/* --- PAGE 2 --- */}
                <div className="printable-page p-2 min-h-[26cm] flex flex-col">
                    <Header />
                    <div className="text-center py-2 mb-2 border-y-2 border-black bg-gray-200">
                        <h2 className="text-xl font-bold">{language === 'ar' ? t.purchaseOrderPrintable.billOfQuantity : 'Bill of Quantity'} <span className="font-normal mx-2">/</span> {language === 'en' ? t.purchaseOrderPrintable.billOfQuantity : 'جدول الكميات'}</h2>
                    </div>
                    
                    <table className="w-full border-collapse border border-black text-xs">
                        <thead className="bg-gray-100 font-bold">
                            <tr className="text-center">
                                <th className="border border-black p-1">{t.purchaseOrderPrintable.sn}</th>
                                <th className="border border-black p-1">{t.purchaseOrderPrintable.itemDescription}</th>
                                <th className="border border-black p-1">{t.purchaseOrderPrintable.unit}</th>
                                <th className="border border-black p-1">{t.purchaseOrderPrintable.quantity}</th>
                                <th className="border border-black p-1">{t.purchaseOrderPrintable.price}</th>
                                <th className="border border-black p-1">{t.purchaseOrderPrintable.total}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchaseOrder.items.map((poItem, index) => {
                                const itemDetail = items.find(i => i.id === poItem.itemId);
                                return (
                                    <tr key={index}>
                                        <td className="border border-black p-1 text-center">{index + 1}</td>
                                        <td className="border border-black p-1">
                                            <p dir="ltr" className="text-left">{itemDetail?.descriptionEn}</p>
                                            <p dir="rtl" className="text-right">{itemDetail?.descriptionAr}</p>
                                        </td>
                                        <td className="border border-black p-1 text-center">{itemDetail?.unit}</td>
                                        <td className="border border-black p-1 text-center">{poItem.quantity}</td>
                                        <td className="border border-black p-1 text-center">{poItem.price.toFixed(2)}</td>
                                        <td className="border border-black p-1 text-center">{(poItem.quantity * poItem.price).toFixed(2)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                     <div className="mt-auto pt-4 border-t-2 border-black font-bold text-sm">
                        <div className="flex justify-between items-center bg-gray-200 p-2">
                            <span>{t.purchaseOrderPrintable.totalInFigures}</span>
                            <span>{totalAmount.toFixed(2)} {request.currency}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 text-right">
                           <span>{t.purchaseOrderPrintable.totalInWords.replace('{amountInWords}', amountInWordsAr)}</span>
                        </div>
                    </div>
                    <PageFooter currentPage={2} totalPages={3} />
                </div>
                
                {/* --- PAGE 3 --- */}
                <div className="printable-page p-2 min-h-[26cm] flex flex-col">
                    <Header />
                    <div className="space-y-6 mt-4">
                        <TermSection title={enTranslations.purchaseOrderPrintable.supplyTerms} titleAr={arTranslations.purchaseOrderPrintable.supplyTerms} terms={[enTranslations.purchaseOrderPrintable.supplyTerm1, enTranslations.purchaseOrderPrintable.supplyTerm2, enTranslations.purchaseOrderPrintable.supplyTerm3]} termsAr={[arTranslations.purchaseOrderPrintable.supplyTerm1, arTranslations.purchaseOrderPrintable.supplyTerm2, arTranslations.purchaseOrderPrintable.supplyTerm3]} />
                        <TermSection title={enTranslations.purchaseOrderPrintable.currencyTitle} titleAr={arTranslations.purchaseOrderPrintable.currencyTitle} terms={[enTranslations.purchaseOrderPrintable.currencyValue]} termsAr={[arTranslations.purchaseOrderPrintable.currencyValue]} isList={false} />
                        <TermSection title={enTranslations.purchaseOrderPrintable.paymentTerms} titleAr={arTranslations.purchaseOrderPrintable.paymentTerms} terms={[enTranslations.purchaseOrderPrintable.paymentTerm1]} termsAr={[arTranslations.purchaseOrderPrintable.paymentTerm1]} />
                        <TermSection title={enTranslations.purchaseOrderPrintable.otherTerms} titleAr={arTranslations.purchaseOrderPrintable.otherTerms} terms={[enTranslations.purchaseOrderPrintable.otherTerm1]} termsAr={[arTranslations.purchaseOrderPrintable.otherTerm1]} />
                    </div>
                    <PageFooter currentPage={3} totalPages={3} />
                </div>
            </div>
            
            <div id="pdf-loader" style={{display: 'none', position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000, padding: '20px', background: 'rgba(0,0,0,0.7)', color: 'white', borderRadius: '10px' }}>Generating PDF...</div>

            <div className="mt-6 pt-6 border-t flex justify-end">
                <button onClick={handlePrint} className="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                    <PrinterIcon />
                    {t.purchaseOrders.printPO}
                </button>
            </div>
            
            <style>
                {`
                .printable-container * {
                    color: black !important;
                    border-color: black !important;
                }
                .printable-container { font-family: 'Cairo', sans-serif; }
                .printable-page { page-break-after: always; }
                .printable-page:last-child { page-break-after: auto; }
                @media print {
                    body * { visibility: hidden; }
                    #printable-po-area, #printable-po-area * { visibility: visible; }
                    #printable-po-area {
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

const TermSection: React.FC<{ title: string; titleAr: string; terms: string[]; termsAr: string[]; isList?: boolean}> = ({ title, titleAr, terms, termsAr, isList = true }) => (
    <div className="border border-black">
        <div className="bg-gray-200 font-bold p-1 border-b border-black flex justify-between">
            <span>{title}</span>
            <span>{titleAr}</span>
        </div>
        <div className="p-2 space-y-1">
            {isList ? terms.map((term, index) => (
                <React.Fragment key={index}>
                    <p className="text-right">.({index + 1}) {termsAr[index]}</p>
                    <p className="text-left">{index + 1}. {term}</p>
                </React.Fragment>
            )) : (
                 <React.Fragment>
                    <p className="text-right">{termsAr[0]}</p>
                    <p className="text-left">{terms[0]}</p>
                </React.Fragment>
            )}
        </div>
    </div>
);

export default PrintablePurchaseOrder;