
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ExchangeRate, PermissionActions, User } from '../types';
import { useTranslation } from '../LanguageContext';
import { useToast } from '../ToastContext';
import Modal from '../components/Modal';
import { PlusIcon, CurrencyEuroIcon, PencilIcon, TrashIcon } from '../components/icons';
import { currencies } from '../currencies';

interface ExchangeRatesPageProps {
  exchangeRates: ExchangeRate[];
  setExchangeRates: React.Dispatch<React.SetStateAction<ExchangeRate[]>>;
  permissions: PermissionActions;
  logActivity: (args: any) => void;
  currentUser: User;
}

const FormField: React.FC<{ label: string; children: React.ReactNode; required?: boolean }> = ({ label, children, required }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
    </div>
);

const ExchangeRatesPage: React.FC<ExchangeRatesPageProps> = ({ exchangeRates, setExchangeRates, permissions, logActivity, currentUser }) => {
    const { t, language } = useTranslation();
    const { showToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRate, setEditingRate] = useState<ExchangeRate | null>(null);
    
    // Delete Modal State
    const [deleteId, setDeleteId] = useState<string | null>(null);
    
    // Filters
    const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
    const [monthFilter, setMonthFilter] = useState<number | 'ALL'>('ALL');
    
    const yearsWithRates = useMemo(() => {
        const years = new Set(exchangeRates.map(r => r.year));
        const currentYear = new Date().getFullYear();
        years.add(currentYear);
        return Array.from(years).sort((a, b) => Number(b) - Number(a));
    }, [exchangeRates]);

    const filteredRates = useMemo(() => {
        return exchangeRates.filter(r => {
            const yearMatch = r.year === yearFilter;
            const monthMatch = monthFilter === 'ALL' || r.month === monthFilter;
            return yearMatch && monthMatch;
        }).sort((a,b) => b.month - a.month);
    }, [exchangeRates, yearFilter, monthFilter]);

    const handleOpenModal = (rate: ExchangeRate | null = null) => {
        setEditingRate(rate);
        setIsModalOpen(true);
    };

    const handleSaveRate = (rateData: Omit<ExchangeRate, 'id'>) => {
        if (editingRate) {
            // Update existing
            setExchangeRates(prev => prev.map(r => r.id === editingRate.id ? { ...rateData, id: r.id } : r));
            logActivity({
                actionType: 'update',
                entityType: 'ExchangeRate',
                entityName: `${rateData.fromCurrency} to ${rateData.toCurrency} for ${rateData.year}-${rateData.month}`
            });
            showToast(t.common.updatedSuccess, 'success');
        } else {
            // Create new
            const finalRate: ExchangeRate = {
                id: `rate-${Date.now()}`,
                ...rateData,
            };
            setExchangeRates(prev => [...prev, finalRate]);
            logActivity({
                actionType: 'create',
                entityType: 'ExchangeRate',
                entityName: `${finalRate.fromCurrency} to ${finalRate.toCurrency} for ${finalRate.year}-${finalRate.month}`
            });
            showToast(t.common.createdSuccess, 'success');
        }
        setIsModalOpen(false);
    };

    const confirmDelete = (id: string) => {
        setDeleteId(id);
    };

    const handleDeleteRate = () => {
        if (deleteId) {
            const rateToDelete = exchangeRates.find(r => r.id === deleteId);
            if (rateToDelete) {
                logActivity({
                    actionType: 'delete',
                    entityType: 'ExchangeRate',
                    entityName: `${rateToDelete.fromCurrency} to ${rateToDelete.toCurrency}`
                });
            }
            setExchangeRates(prev => prev.filter(r => r.id !== deleteId));
            showToast(t.common.deletedSuccess, 'success');
            setDeleteId(null);
        }
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
             <style>{`
                .form-input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.375rem; background-color: #ffffff; color: #0f172a; }
                .btn-primary { padding: 0.625rem 1.25rem; background-color: #4f46e5; color: white; border-radius: 0.5rem; font-weight: 600; }
            `}</style>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-sky-100 rounded-lg text-sky-600">
                        <CurrencyEuroIcon className="w-8 h-8"/>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">{t.exchangeRates.title}</h1>
                </div>
                <button onClick={() => handleOpenModal()} disabled={!permissions.create} className="btn-primary flex items-center gap-2">
                    <PlusIcon /> {t.exchangeRates.addNewRate}
                </button>
            </div>
            
            <div className="mb-6 p-4 bg-slate-50 border rounded-lg flex flex-wrap items-end gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.exchangeRates.year}</label>
                    <select value={yearFilter} onChange={e => setYearFilter(parseInt(e.target.value))} className="form-input w-32">
                        {yearsWithRates.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.exchangeRates.month}</label>
                    <select value={monthFilter} onChange={e => setMonthFilter(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value))} className="form-input w-40">
                        <option value="ALL">{t.common.all}</option>
                        {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                            <option key={m} value={m}>{new Date(0, m - 1).toLocaleString(language, { month: 'long' })}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                    <thead className="bg-slate-100 text-slate-600 uppercase">
                        <tr>
                            <th className="p-3 text-center font-semibold w-24">{t.users.actions}</th>
                            <th className="p-3 text-left font-semibold">{t.exchangeRates.month}</th>
                            <th className="p-3 text-left font-semibold">{t.exchangeRates.currency}</th>
                            <th className="p-3 text-right font-semibold">{t.exchangeRates.rate}</th>
                            <th className="p-3 text-left font-semibold">{t.exchangeRates.approvedBy}</th>
                            <th className="p-3 text-left font-semibold">{t.exchangeRates.approvedDate}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {filteredRates.map(rate => (
                            <tr key={rate.id}>
                                <td className="p-3 text-center">
                                    <div className="flex justify-center gap-2">
                                        <button onClick={() => confirmDelete(rate.id)} disabled={!permissions.delete} className="text-red-600 hover:text-red-800 disabled:text-slate-300 p-1">
                                            <TrashIcon />
                                        </button>
                                        <button onClick={() => handleOpenModal(rate)} disabled={!permissions.update} className="text-indigo-600 hover:text-indigo-800 disabled:text-slate-300 p-1">
                                            <PencilIcon />
                                        </button>
                                    </div>
                                </td>
                                <td className="p-3 font-medium text-slate-800">{new Date(rate.year, rate.month - 1).toLocaleString(language, { month: 'long' })}</td>
                                <td className="p-3 text-slate-700">{rate.fromCurrency} / {rate.toCurrency}</td>
                                <td className="p-3 text-right font-mono font-bold text-indigo-700">{rate.rate}</td>
                                <td className="p-3 text-slate-700">{rate.approvedBy}</td>
                                <td className="p-3 text-slate-700">{rate.approvedDate}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredRates.length === 0 && <p className="text-center p-8 text-slate-500">{t.exchangeRates.noRatesForYear}</p>}
            </div>

            {isModalOpen && (
                <AddRateModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveRate}
                    currentUser={currentUser}
                    existingRates={exchangeRates}
                    editingRate={editingRate}
                />
            )}

            {/* Custom Delete Confirmation Modal */}
            {deleteId && (
                <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title={t.common.delete} size="max-w-sm">
                    <div className="text-center p-4">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                            <TrashIcon className="h-6 w-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 mb-2">{t.common.deleteConfirm}</h3>
                        <div className="flex justify-center gap-3 mt-6">
                            <button onClick={() => setDeleteId(null)} className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium">{t.common.cancel}</button>
                            <button onClick={handleDeleteRate} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">{t.common.delete}</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

const SearchableSelect: React.FC<{
  options: { code: string; name: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}> = ({ options, value, onChange, placeholder, disabled = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.code === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const filteredOptions = options.filter(option =>
    option.code.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (code: string) => {
    onChange(code);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!isOpen) {
      setIsOpen(true);
    }
  };
  
  const handleInputClick = () => {
      if (disabled) return;
      setIsOpen(!isOpen);
      setSearchTerm('');
  }

  const displayValue = isOpen ? searchTerm : (selectedOption ? `${selectedOption.code} - ${selectedOption.name}` : '');

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        className="form-input"
        placeholder={placeholder}
        value={displayValue}
        onClick={handleInputClick}
        onChange={handleInputChange}
        disabled={disabled}
      />
      {isOpen && !disabled && (
        <ul className="absolute z-20 w-full bg-white border border-slate-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
          {filteredOptions.length > 0 ? (
            filteredOptions.map(option => (
              <li
                key={option.code}
                className="px-4 py-2 hover:bg-indigo-100 cursor-pointer text-slate-800"
                onMouseDown={() => handleSelect(option.code)} // Use onMouseDown to fire before blur
              >
                {option.code} - {option.name}
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-slate-500">No results found</li>
          )}
        </ul>
      )}
    </div>
  );
};


const AddRateModal: React.FC<{
    isOpen: boolean; 
    onClose: () => void; 
    onSave: (rate: Omit<ExchangeRate, 'id'>) => void; 
    currentUser: User; 
    existingRates: ExchangeRate[];
    editingRate: ExchangeRate | null;
}> = ({isOpen, onClose, onSave, currentUser, existingRates, editingRate}) => {
    const { t, language } = useTranslation();
    const { showToast } = useToast();
    
    // Use strings for inputs to allow better editing experience (clearing, typing decimals)
    const [yearStr, setYearStr] = useState(String(new Date().getFullYear()));
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('EUR');
    const [rateStr, setRateStr] = useState('');
    
    useEffect(() => {
        if (editingRate) {
            setYearStr(String(editingRate.year));
            setMonth(editingRate.month);
            setFromCurrency(editingRate.fromCurrency);
            setToCurrency(editingRate.toCurrency);
            setRateStr(String(editingRate.rate));
        } else {
            setYearStr(String(new Date().getFullYear()));
            setMonth(new Date().getMonth() + 1);
            setFromCurrency('USD');
            setToCurrency('EUR');
            setRateStr('');
        }
    }, [editingRate, isOpen]);

    const year = parseInt(yearStr) || 0;

    const isExisting = useMemo(() => {
        // Check if a rate already exists for this Y/M/Pair, excluding the one currently being edited
        return existingRates.some(r => 
            r.year === year && 
            r.month === month && 
            r.fromCurrency === fromCurrency && 
            r.toCurrency === toCurrency &&
            r.id !== editingRate?.id // Exclude current rate if editing
        );
    }, [year, month, fromCurrency, toCurrency, existingRates, editingRate]);

    const handleSave = () => {
        const rateVal = parseFloat(rateStr);
        if (Number.isNaN(rateVal) || rateVal <= 0) {
            showToast(t.exchangeRates.invalidRate, 'error');
            return;
        }
        if (year <= 1900 || year > 2100) {
             showToast("Please enter a valid year.", 'error');
             return;
        }
        if (fromCurrency === toCurrency) {
            showToast("From and To currencies cannot be the same.", 'error');
            return;
        }
        if (isExisting) {
            showToast(t.exchangeRates.rateExists, 'error');
            return;
        }
        onSave({
            year,
            month,
            fromCurrency,
            toCurrency,
            rate: rateVal,
            approvedBy: editingRate ? editingRate.approvedBy : currentUser.name,
            approvedDate: new Date().toISOString().split('T')[0]
        });
    };
    
    const btnCancel = "px-6 py-2 bg-white text-slate-800 font-semibold rounded-lg border border-slate-300 hover:bg-slate-100 transition-colors shadow-sm";
    const btnApprove = "px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-sm hover:bg-purple-700 transition-colors disabled:bg-purple-300";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={editingRate ? t.common.edit : t.exchangeRates.addNewRate} size="max-w-xl">
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end bg-slate-50 border border-slate-200 p-5 rounded-xl">
                    <FormField label={t.exchangeRates.year}>
                        <input 
                            type="number" 
                            value={yearStr} 
                            onChange={e => setYearStr(e.target.value)} 
                            className="form-input"
                            placeholder="YYYY"
                        />
                    </FormField>
                    <FormField label={t.exchangeRates.month}>
                        <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className="form-input">
                            {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                                <option key={m} value={m}>{new Date(0, m - 1).toLocaleString(language, { month: 'long' })}</option>
                            ))}
                        </select>
                    </FormField>
                    <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <FormField label={t.exchangeRates.fromCurrency}>
                            <SearchableSelect
                                options={currencies}
                                value={fromCurrency}
                                onChange={setFromCurrency}
                                placeholder="Search currency..."
                            />
                        </FormField>
                        <FormField label={t.exchangeRates.toCurrency}>
                            <SearchableSelect
                                options={currencies}
                                value={toCurrency}
                                onChange={setToCurrency}
                                placeholder="Search currency..."
                            />
                        </FormField>
                    </div>
                    <div className="sm:col-span-2">
                        <FormField label={t.exchangeRates.rate} required>
                             <input
                                type="number"
                                step="any"
                                value={rateStr}
                                onChange={e => setRateStr(e.target.value)}
                                className="form-input text-lg"
                                placeholder='0.0000'
                            />
                        </FormField>
                    </div>
                </div>

                {isExisting && <p className="text-sm text-center font-semibold text-red-600 bg-red-100 p-2 rounded-md">{t.exchangeRates.rateExists}</p>}
                
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button onClick={onClose} className={btnCancel}>{t.common.cancel}</button>
                    <button onClick={handleSave} disabled={isExisting} className={btnApprove}>
                        {editingRate ? t.common.save : t.exchangeRates.approveAndSave}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ExchangeRatesPage;
