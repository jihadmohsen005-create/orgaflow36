


import React from 'react';
import { useTranslation } from '../LanguageContext';
import {
    PermissionActions,
    FuelType, Warehouse, FuelOpeningBalance, FuelSupplier, FuelSupply, FuelTransfer, FuelDisbursement,
    Driver, FleetTrip, Project, PaymentMethod, Worker, WorkerTransaction, WarehouseEntity, WarehouseItem, WarehouseItemOpeningBalance, WarehouseInvoice, WarehouseStockTransfer, WorkType, FuelRecipientType, Employee
} from '../types';

import FuelPage from './operations/FuelPage';
import FleetPage from './operations/FleetPage';
import WorkersPage from './operations/WorkersPage';
import WarehousePage from './operations/WarehousePage';


// Main Props Interface for the router
interface OperationsPageProps {
    permissions: PermissionActions;
    logActivity: (args: any) => void;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    // Fuel Props
    fuelTypes: FuelType[]; setFuelTypes: React.Dispatch<React.SetStateAction<FuelType[]>>;
    warehouses: Warehouse[]; setWarehouses: React.Dispatch<React.SetStateAction<Warehouse[]>>;
    fuelOpeningBalances: FuelOpeningBalance[]; setFuelOpeningBalances: React.Dispatch<React.SetStateAction<FuelOpeningBalance[]>>;
    fuelSuppliers: FuelSupplier[]; setFuelSuppliers: React.Dispatch<React.SetStateAction<FuelSupplier[]>>;
    fuelSupplies: FuelSupply[]; setFuelSupplies: React.Dispatch<React.SetStateAction<FuelSupply[]>>;
    fuelTransfers: FuelTransfer[]; setFuelTransfers: React.Dispatch<React.SetStateAction<FuelTransfer[]>>;
    fuelDisbursements: FuelDisbursement[]; setFuelDisbursements: React.Dispatch<React.SetStateAction<FuelDisbursement[]>>;
    fuelRecipientTypes: FuelRecipientType[]; setFuelRecipientTypes: React.Dispatch<React.SetStateAction<FuelRecipientType[]>>;
    // Fleet Props
    drivers: Driver[]; setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>;
    fleetTrips: FleetTrip[]; setFleetTrips: React.Dispatch<React.SetStateAction<FleetTrip[]>>;
    // Workers Props
    workers: Worker[]; setWorkers: React.Dispatch<React.SetStateAction<Worker[]>>;
    workTypes: WorkType[]; setWorkTypes: React.Dispatch<React.SetStateAction<WorkType[]>>;
    workerTransactions: WorkerTransaction[]; setWorkerTransactions: React.Dispatch<React.SetStateAction<WorkerTransaction[]>>;
    // Warehouse Props
    warehouseEntities: WarehouseEntity[]; setWarehouseEntities: React.Dispatch<React.SetStateAction<WarehouseEntity[]>>;
    warehouseItems: WarehouseItem[]; setWarehouseItems: React.Dispatch<React.SetStateAction<WarehouseItem[]>>;
    warehouseInvoices: WarehouseInvoice[]; setWarehouseInvoices: React.Dispatch<React.SetStateAction<WarehouseInvoice[]>>;
    warehouseItemOpeningBalances: WarehouseItemOpeningBalance[]; setWarehouseItemOpeningBalances: React.Dispatch<React.SetStateAction<WarehouseItemOpeningBalance[]>>;
    warehouseStockTransfers: WarehouseStockTransfer[]; setWarehouseStockTransfers: React.Dispatch<React.SetStateAction<WarehouseStockTransfer[]>>;
    // Common Props
    projects: Project[];
    paymentMethods: PaymentMethod[]; setPaymentMethods: React.Dispatch<React.SetStateAction<PaymentMethod[]>>;
    employees: Employee[];
}


// Main Operations Page Component - Now acts as a router
const OperationsPage: React.FC<OperationsPageProps> = (props) => {
    const { t } = useTranslation();
    const { activeTab, setActiveTab } = props;

    const tabs = [
        { id: 'fuelManagement', title: t.operations.tabs.fuelManagement },
        { id: 'fleetManagement', title: t.operations.tabs.fleetManagement },
        { id: 'workersManagement', title: t.operations.tabs.workersManagement },
        { id: 'warehouses', title: t.operations.tabs.warehouses },
    ];

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'fuelManagement': 
                return <FuelPage
                    permissions={props.permissions}
                    logActivity={props.logActivity}
                    fuelTypes={props.fuelTypes} setFuelTypes={props.setFuelTypes}
                    warehouses={props.warehouses}
                    fuelOpeningBalances={props.fuelOpeningBalances} setFuelOpeningBalances={props.setFuelOpeningBalances}
                    fuelSuppliers={props.fuelSuppliers} setFuelSuppliers={props.setFuelSuppliers}
                    fuelSupplies={props.fuelSupplies} setFuelSupplies={props.setFuelSupplies}
                    fuelTransfers={props.fuelTransfers} setFuelTransfers={props.setFuelTransfers}
                    fuelDisbursements={props.fuelDisbursements} setFuelDisbursements={props.setFuelDisbursements}
                    fuelRecipientTypes={props.fuelRecipientTypes} setFuelRecipientTypes={props.setFuelRecipientTypes}
                    projects={props.projects}
                    drivers={props.drivers}
                    employees={props.employees}
                />;
            case 'fleetManagement': 
                return <FleetPage 
                    permissions={props.permissions}
                    logActivity={props.logActivity}
                    drivers={props.drivers} setDrivers={props.setDrivers}
                    fleetTrips={props.fleetTrips} setFleetTrips={props.setFleetTrips}
                    projects={props.projects}
                    paymentMethods={props.paymentMethods} setPaymentMethods={props.setPaymentMethods}
                    fuelDisbursements={props.fuelDisbursements}
                />;
            case 'workersManagement': 
                return <WorkersPage 
                    permissions={props.permissions}
                    logActivity={props.logActivity}
                    workers={props.workers} setWorkers={props.setWorkers}
                    workTypes={props.workTypes} setWorkTypes={props.setWorkTypes}
                    workerTransactions={props.workerTransactions} setWorkerTransactions={props.setWorkerTransactions}
                    projects={props.projects}
                    paymentMethods={props.paymentMethods} setPaymentMethods={props.setPaymentMethods}
                />;
            case 'warehouses': 
                return <WarehousePage 
                     permissions={props.permissions}
                    logActivity={props.logActivity}
                    warehouses={props.warehouses} setWarehouses={props.setWarehouses}
                    warehouseEntities={props.warehouseEntities} setWarehouseEntities={props.setWarehouseEntities}
                    warehouseItems={props.warehouseItems} setWarehouseItems={props.setWarehouseItems}
                    warehouseInvoices={props.warehouseInvoices} setWarehouseInvoices={props.setWarehouseInvoices}
                    warehouseItemOpeningBalances={props.warehouseItemOpeningBalances} setWarehouseItemOpeningBalances={props.setWarehouseItemOpeningBalances}
                    warehouseStockTransfers={props.warehouseStockTransfers} setWarehouseStockTransfers={props.setWarehouseStockTransfers}
                    projects={props.projects}
                />;
            default: return <div>Select a tab</div>;
        }
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-6">{t.operations.title}</h1>
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`${activeTab === tab.id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-700 hover:text-slate-800 hover:border-slate-400'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >{tab.title}</button>
                    ))}
                </nav>
            </div>
            <div className="mt-6">
                {renderActiveTab()}
            </div>
             <style>{`
                .form-input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.375rem; background-color: #f8fafc; color: #0f172a; }
                .form-input:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.3); }
                .form-input:read-only, .form-input:disabled { background-color: #e2e8f0; cursor: not-allowed; }
                .btn-primary { padding: 0.5rem 1rem; background-color: #4f46e5; color: white; border-radius: 0.375rem; font-weight: 600; }
            `}</style>
        </div>
    );
};

export default OperationsPage;