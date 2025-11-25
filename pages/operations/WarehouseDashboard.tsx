// pages/operations/WarehouseDashboard.tsx
import React, { useMemo } from 'react';
import { useTranslation } from '../../LanguageContext';
import { Warehouse, WarehouseItem, WarehouseInvoice } from '../../types';
import { WarehouseIcon, CheckCircleIcon, ItemsIcon, UsersIcon, PurchaseOrderIcon, FleetIcon, PlusIcon, TrashIcon } from '../../components/icons';

interface WarehouseDashboardProps {
    setView: (view: string) => void;
    warehouses: Warehouse[];
    warehouseItems: WarehouseItem[];
    warehouseInvoices: WarehouseInvoice[];
}

const WarehouseDashboard: React.FC<WarehouseDashboardProps> = (props) => {
    const { t } = useTranslation();

    const stats = useMemo(() => ({
        totalWarehouses: props.warehouses.length,
        totalItems: props.warehouseItems.length,
        totalInvoices: props.warehouseInvoices.length,
    }), [props.warehouses, props.warehouseItems, props.warehouseInvoices]);

    const navCards = [
        { id: 'warehouses', title: t.operations.warehousesDashboard.manageWarehouses, icon: <WarehouseIcon/> },
        { id: 'entities', title: t.operations.warehousesDashboard.manageEntities, icon: <UsersIcon/> },
        { id: 'items', title: t.operations.warehousesDashboard.manageItems, icon: <ItemsIcon/> },
        { id: 'openingBalances', title: t.operations.warehousesDashboard.manageOpeningBalances, icon: <CheckCircleIcon/> },
        { id: 'supplyInvoices', title: t.operations.warehousesDashboard.manageSupplyInvoices, icon: <PlusIcon/> },
        { id: 'dispatchInvoices', title: t.operations.warehousesDashboard.manageDispatchInvoices, icon: <TrashIcon/> },
        { id: 'transfers', title: t.operations.warehousesDashboard.manageTransfers, icon: <FleetIcon/> },
        { id: 'reports', title: t.operations.warehousesDashboard.reports, icon: <PurchaseOrderIcon/> },
    ];
    
    const StatCard: React.FC<{title: string, value: number, icon: React.ReactNode}> = ({ title, value, icon }) => (
        <div className="bg-slate-100 p-6 rounded-lg border border-slate-200 flex items-center gap-4">
            <div className="bg-white p-3 rounded-full shadow-sm">{icon}</div>
            <div>
                <p className="text-sm font-semibold text-slate-600">{title}</p>
                <p className="text-3xl font-bold text-indigo-700">{value.toLocaleString()}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <h2 className="text-xl font-bold text-slate-800">{t.operations.warehousesDashboard.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title={t.operations.warehousesDashboard.totalWarehouses} value={stats.totalWarehouses} icon={<WarehouseIcon className="w-8 h-8 text-indigo-600"/>} />
                <StatCard title={t.operations.warehousesDashboard.totalItems} value={stats.totalItems} icon={<ItemsIcon className="w-8 h-8 text-green-600"/>} />
                <StatCard title={t.operations.warehousesDashboard.totalInvoices} value={stats.totalInvoices} icon={<PurchaseOrderIcon className="w-8 h-8 text-amber-600"/>} />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {navCards.map(card => (
                    <button key={card.id} onClick={() => props.setView(card.id)} className="group p-4 bg-white rounded-lg border-2 border-slate-200 hover:border-indigo-500 hover:shadow-lg transition-all text-center flex flex-col items-center justify-center gap-2 h-32">
                        {React.cloneElement(card.icon, { className: 'w-8 h-8 text-slate-600 group-hover:text-indigo-600' })}
                        <p className="font-bold text-slate-700 group-hover:text-indigo-600 text-sm">{card.title}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default WarehouseDashboard;