// pages/operations/WarehousePage.tsx
import React, { useState } from 'react';
import { useTranslation } from '../../LanguageContext';
import { 
    PermissionActions, 
    Warehouse, WarehouseEntity, WarehouseItem, WarehouseItemOpeningBalance, WarehouseInvoice, WarehouseStockTransfer,
    Project
} from '../../types';

import WarehouseDashboard from './WarehouseDashboard';
import WarehouseManagement from './WarehouseManagement';
import WarehouseEntities from './WarehouseEntities';
import WarehouseItems from './WarehouseItems';
import WarehouseOpeningBalances from './WarehouseOpeningBalances';
import WarehouseInvoices from './WarehouseInvoices';
import WarehouseStockTransfers from './WarehouseStockTransfers';
import WarehouseReports from './WarehouseReports';

interface WarehousePageProps {
    permissions: PermissionActions;
    logActivity: (args: any) => void;
    warehouses: Warehouse[]; setWarehouses: React.Dispatch<React.SetStateAction<Warehouse[]>>;
    warehouseEntities: WarehouseEntity[]; setWarehouseEntities: React.Dispatch<React.SetStateAction<WarehouseEntity[]>>;
    warehouseItems: WarehouseItem[]; setWarehouseItems: React.Dispatch<React.SetStateAction<WarehouseItem[]>>;
    warehouseInvoices: WarehouseInvoice[]; setWarehouseInvoices: React.Dispatch<React.SetStateAction<WarehouseInvoice[]>>;
    warehouseItemOpeningBalances: WarehouseItemOpeningBalance[]; setWarehouseItemOpeningBalances: React.Dispatch<React.SetStateAction<WarehouseItemOpeningBalance[]>>;
    warehouseStockTransfers: WarehouseStockTransfer[]; setWarehouseStockTransfers: React.Dispatch<React.SetStateAction<WarehouseStockTransfer[]>>;
    projects: Project[];
}

const WarehousePage: React.FC<WarehousePageProps> = (props) => {
    const { t } = useTranslation();
    const [view, setView] = useState('dashboard');

    const views = [
        { id: 'warehouses', title: t.operations.warehousesDashboard.manageWarehouses },
        { id: 'entities', title: t.operations.warehousesDashboard.manageEntities },
        { id: 'items', title: t.operations.warehousesDashboard.manageItems },
        { id: 'openingBalances', title: t.operations.warehousesDashboard.manageOpeningBalances },
        { id: 'supplyInvoices', title: t.operations.warehousesDashboard.manageSupplyInvoices },
        { id: 'dispatchInvoices', title: t.operations.warehousesDashboard.manageDispatchInvoices },
        { id: 'transfers', title: t.operations.warehousesDashboard.manageTransfers },
        { id: 'reports', title: t.operations.warehousesDashboard.reports },
    ];
    
    const renderContent = () => {
        switch (view) {
            case 'dashboard': return <WarehouseDashboard {...props} setView={setView} />;
            case 'warehouses': return <WarehouseManagement {...props} />;
            case 'entities': return <WarehouseEntities {...props} />;
            case 'items': return <WarehouseItems {...props} />;
            case 'openingBalances': return <WarehouseOpeningBalances {...props} />;
            case 'supplyInvoices': return <WarehouseInvoices {...props} invoiceType="Supply" />;
            case 'dispatchInvoices': return <WarehouseInvoices {...props} invoiceType="Dispatch" />;
            case 'transfers': return <WarehouseStockTransfers {...props} />;
            case 'reports': return <WarehouseReports {...props} />;
            default: return null;
        }
    };
    
    return (
        <div>
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    <button onClick={() => setView('dashboard')} className={`${view === 'dashboard' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-700 hover:text-slate-800 hover:border-slate-400'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        {t.operations.warehousesDashboard.title}
                    </button>
                    {views.map(v => (
                        <button key={v.id} onClick={() => setView(v.id)} className={`${view === v.id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-700 hover:text-slate-800 hover:border-slate-400'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                            {v.title}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="mt-6">
                {renderContent()}
            </div>
        </div>
    );
};

export default WarehousePage;
