
import React, { useState, useRef } from 'react';
import { ArchiveLocation, PermissionActions, OrganizationInfo } from '../../types';
import { useTranslation } from '../../LanguageContext';
import { useToast } from '../../ToastContext';
import Modal from '../../components/Modal';
import { PlusIcon, PencilIcon, TrashIcon, PrinterIcon, ArchiveIcon, ShelfIcon } from '../../components/icons';

interface ArchiveLocationsPageProps {
  archiveLocations: ArchiveLocation[];
  setArchiveLocations: React.Dispatch<React.SetStateAction<ArchiveLocation[]>>;
  permissions: PermissionActions;
  logActivity: (args: any) => void;
  organizationInfo: OrganizationInfo;
}

const ArchiveLocationsPage: React.FC<ArchiveLocationsPageProps> = ({ archiveLocations, setArchiveLocations, permissions, logActivity, organizationInfo }) => {
    const { t, language } = useTranslation();
    const { showToast } = useToast();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<ArchiveLocation | null>(null);
    const [formData, setFormData] = useState<Omit<ArchiveLocation, 'id'>>({
        name: '',
        code: '',
        location: '',
        shelvesCount: 0
    });

    // Print Label State
    const [labelPreviewLocation, setLabelPreviewLocation] = useState<ArchiveLocation | null>(null);

    const openModal = (location: ArchiveLocation | null = null) => {
        if (location) {
            setEditingLocation(location);
            setFormData(location);
        } else {
            setEditingLocation(null);
            setFormData({ name: '', code: '', location: '', shelvesCount: 0 });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = () => {
        if (!formData.name || !formData.code) {
            showToast(t.common.fillRequiredFields, 'error');
            return;
        }

        if (editingLocation) {
            setArchiveLocations(prev => prev.map(l => l.id === editingLocation.id ? { ...l, ...formData } : l));
            logActivity({ actionType: 'update', entityType: 'ArchiveLocation', entityName: formData.name });
            showToast(t.common.updatedSuccess, 'success');
        } else {
            const newItem = { id: `arch-${Date.now()}`, ...formData };
            setArchiveLocations(prev => [...prev, newItem]);
            logActivity({ actionType: 'create', entityType: 'ArchiveLocation', entityName: formData.name });
            showToast(t.common.createdSuccess, 'success');
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: string) => {
        if (window.confirm(t.common.deleteConfirm)) {
            const toDelete = archiveLocations.find(l => l.id === id);
            if (toDelete) logActivity({ actionType: 'delete', entityType: 'ArchiveLocation', entityName: toDelete.name });
            setArchiveLocations(prev => prev.filter(l => l.id !== id));
            showToast(t.common.deletedSuccess, 'success');
        }
    };

    const handlePrintLabel = (location: ArchiveLocation) => {
        setLabelPreviewLocation(location);
    };

    const performPrint = () => {
        const { jsPDF } = window.jspdf;
        const input = document.getElementById('printable-archive-label');

        if (input) {
             // Temporarily ensure visibility for capture if needed, though modal is visible
            window.html2canvas(input, { scale: 3, useCORS: true }).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                // Label size approx 4x6 inches or A6
                const pdf = new jsPDF({
                    orientation: 'l',
                    unit: 'mm',
                    format: [100, 150] // Approx 4x6 inches
                });
                
                pdf.addImage(imgData, 'PNG', 0, 0, 150, 100);
                pdf.save(`Label-${labelPreviewLocation?.code}.pdf`);
            });
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                        <ArchiveIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{t.archive.locations.title}</h1>
                        <p className="text-sm text-slate-500">Manage physical archive locations</p>
                    </div>
                </div>
                <button onClick={() => openModal()} disabled={!permissions.create} className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2.5 px-5 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-300">
                    <PlusIcon /> {t.common.add}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {archiveLocations.map(loc => (
                    <div key={loc.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative group">
                        <div className="flex justify-between items-start mb-3">
                            <div className="p-2 bg-indigo-50 rounded-full text-indigo-600">
                                <ArchiveIcon className="w-6 h-6" />
                            </div>
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-mono font-bold rounded border border-slate-300">
                                {loc.code}
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">{loc.name}</h3>
                        <div className="space-y-2 text-sm text-slate-600 mt-4">
                            <div className="flex items-center gap-2">
                                <ArchiveIcon className="w-4 h-4 opacity-50" />
                                <span>{loc.location}</span>
                            </div>
                             <div className="flex items-center gap-2">
                                <ShelfIcon className="w-4 h-4 opacity-50" />
                                <span>{loc.shelvesCount} {t.archive.locations.shelf}</span>
                            </div>
                        </div>
                        
                        <div className="mt-6 pt-4 border-t flex items-center justify-between gap-2">
                            <div className="flex gap-2">
                                <button onClick={() => handleDelete(loc.id)} disabled={!permissions.delete} className="flex items-center gap-1 text-red-500 hover:text-red-700 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors">
                                    <TrashIcon className="w-4 h-4" /> {t.common.delete}
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => openModal(loc)} disabled={!permissions.update} className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium px-2 py-1 rounded hover:bg-indigo-50 transition-colors">
                                    <PencilIcon className="w-4 h-4" /> {t.common.edit}
                                </button>
                                 <button onClick={() => handlePrintLabel(loc)} className="flex items-center gap-1 text-slate-500 hover:text-slate-700 text-sm font-medium px-2 py-1 rounded hover:bg-slate-100 transition-colors">
                                    <PrinterIcon className="w-4 h-4" /> {t.archive.locations.printLabel}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {archiveLocations.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-slate-500">
                        No archive locations found. Add one to get started.
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingLocation ? t.archive.locations.editLocation : t.archive.locations.addLocation}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t.archive.locations.name} <span className="text-red-500">*</span></label>
                        <input type="text" value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full p-2 border border-slate-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t.archive.locations.code} <span className="text-red-500">*</span></label>
                        <input type="text" value={formData.code} onChange={e => setFormData(prev => ({ ...prev, code: e.target.value }))} className="w-full p-2 border border-slate-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t.archive.locations.location}</label>
                        <input type="text" value={formData.location} onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))} className="w-full p-2 border border-slate-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t.archive.locations.shelvesCount}</label>
                        <input type="number" value={formData.shelvesCount} onChange={e => setFormData(prev => ({ ...prev, shelvesCount: parseInt(e.target.value) || 0 }))} className="w-full p-2 border border-slate-300 rounded-md" />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300 transition-colors">{t.common.cancel}</button>
                        <button onClick={handleSubmit} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">{t.common.save}</button>
                    </div>
                </div>
            </Modal>

            {/* Print Label Modal */}
            {labelPreviewLocation && (
                <Modal isOpen={!!labelPreviewLocation} onClose={() => setLabelPreviewLocation(null)} title={t.archive.locations.printLabel} size="max-w-2xl">
                    <div className="flex flex-col items-center justify-center p-4">
                        {/* The Printable Label Area */}
                        <div id="printable-archive-label" className="w-[600px] h-[400px] border-4 border-slate-800 p-8 flex flex-col items-center justify-between bg-white text-slate-900 font-sans relative">
                             <div className="text-center w-full border-b-2 border-slate-800 pb-4">
                                <h2 className="text-2xl font-bold uppercase tracking-wide">{language === 'ar' ? organizationInfo.nameAr : organizationInfo.nameEn}</h2>
                                <p className="text-xl text-slate-600 font-semibold mt-1">{language === 'ar' ? 'قسم الأرشيف' : 'Archive Department'}</p>
                            </div>
                            
                            <div className="flex-grow flex flex-col items-center justify-center my-4 w-full">
                                <div className="text-8xl font-black tracking-widest text-slate-900 border-4 border-slate-900 px-8 py-4 rounded-lg">
                                    {labelPreviewLocation.code}
                                </div>
                                <p className="text-2xl font-bold mt-4 text-slate-700">{labelPreviewLocation.name}</p>
                            </div>

                            <div className="text-center w-full border-t-2 border-slate-800 pt-2">
                                <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">Printed by OrgaFlow System &copy; {new Date().getFullYear()}</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-8 flex gap-4">
                            <button onClick={() => setLabelPreviewLocation(null)} className="px-6 py-2 bg-slate-200 rounded-lg hover:bg-slate-300 text-slate-800 font-medium transition-colors">
                                {t.common.cancel}
                            </button>
                            <button onClick={performPrint} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2 transition-colors shadow-md">
                                <PrinterIcon />
                                Print / Download PDF
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default ArchiveLocationsPage;
