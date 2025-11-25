import React, { useState, useEffect } from 'react';
import { User, Role, RolePermissions, Page, PermissionActions } from '../types';
import { useTranslation } from '../LanguageContext';
import Modal from '../components/Modal';
import { PlusIcon, PencilIcon, TrashIcon } from '../components/icons';
import { useToast } from '../ToastContext';

interface UsersPageProps {
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    roles: Role[];
    setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
    permissionsByRole: Record<string, RolePermissions>;
    setPermissionsByRole: React.Dispatch<React.SetStateAction<Record<string, RolePermissions>>>;
    permissions: PermissionActions;
    logActivity: (args: { actionType: 'create' | 'update' | 'delete'; entityType: string; entityName: string; }) => void;
    approvalWorkflow: string[];
    setApprovalWorkflow: React.Dispatch<React.SetStateAction<string[]>>;
}

const UsersPage: React.FC<UsersPageProps> = ({ users, setUsers, roles, setRoles, permissionsByRole, setPermissionsByRole, permissions, logActivity, approvalWorkflow, setApprovalWorkflow }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');

    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-6">{t.users.title}</h1>

            <div className="border-b border-slate-200 mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`${activeTab === 'users' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-700 hover:text-slate-800 hover:border-slate-400'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        {t.users.tabs.users}
                    </button>
                    <button
                        onClick={() => setActiveTab('roles')}
                        className={`${activeTab === 'roles' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-700 hover:text-slate-800 hover:border-slate-400'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        {t.users.tabs.roles}
                    </button>
                </nav>
            </div>

            <div>
                {activeTab === 'users' && <UsersTab users={users} setUsers={setUsers} roles={roles} permissions={permissions} logActivity={logActivity} />}
                {activeTab === 'roles' && <RolesTab roles={roles} setRoles={setRoles} permissions={permissions} logActivity={logActivity} permissionsByRole={permissionsByRole} setPermissionsByRole={setPermissionsByRole} approvalWorkflow={approvalWorkflow} setApprovalWorkflow={setApprovalWorkflow} />}
            </div>
        </div>
    );
};

// Users Tab Component
const UsersTab: React.FC<Pick<UsersPageProps, 'users' | 'setUsers' | 'roles' | 'permissions' | 'logActivity'>> = ({ users, setUsers, roles, permissions, logActivity }) => {
    const { t, language } = useTranslation();
    const { showToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const openModal = (user: User | null = null) => {
        setEditingUser(user);
        setIsModalOpen(true);
    }
    
    const handleDelete = (userId: string) => {
        const userToDelete = users.find(u => u.id === userId);
        if(userToDelete) {
            logActivity({ actionType: 'delete', entityType: 'User', entityName: userToDelete.name });
        }
        setUsers(prev => prev.filter(u => u.id !== userId));
        showToast(t.common.deletedSuccess, 'success');
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800">{t.users.usersList}</h2>
                <button onClick={() => openModal()} disabled={!permissions.create} className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-300">
                    <PlusIcon /> {t.users.newUser}
                </button>
            </div>
            <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">{t.users.fullName}</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">{t.users.userName}</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">{t.users.role}</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">{t.users.actions}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {users.map(user => {
                            const role = roles.find(r => r.id === user.roleId);
                            return (
                                <tr key={user.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-slate-900">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-slate-900">{user.username}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-slate-900">{role ? (language === 'ar' ? role.nameAr : role.nameEn) : 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => openModal(user)} disabled={!permissions.update} className="text-indigo-600 hover:text-indigo-900 disabled:text-slate-300"><PencilIcon/></button>
                                            <button onClick={() => handleDelete(user.id)} disabled={!permissions.delete} className="text-red-600 hover:text-red-900 disabled:text-slate-300"><TrashIcon/></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <UserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={editingUser} setUsers={setUsers} roles={roles} logActivity={logActivity} />}
        </div>
    );
};

// Roles Tab Component
interface RolesTabProps extends Pick<UsersPageProps, 'roles' | 'setRoles' | 'permissions' | 'logActivity' | 'permissionsByRole' | 'setPermissionsByRole' | 'approvalWorkflow' | 'setApprovalWorkflow'> {}
const RolesTab: React.FC<RolesTabProps> = ({ roles, setRoles, permissions, logActivity, permissionsByRole, setPermissionsByRole, approvalWorkflow, setApprovalWorkflow }) => {
    const { t, language } = useTranslation();
    const { showToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    const openModal = (role: Role | null = null) => {
        setEditingRole(role);
        setIsModalOpen(true);
    }
    
    const handleDelete = (roleId: string) => {
        const roleToDelete = roles.find(r => r.id === roleId);
        if (roleToDelete) {
            logActivity({ actionType: 'delete', entityType: 'Role', entityName: roleToDelete.nameEn });
        }
        setRoles(prev => prev.filter(r => r.id !== roleId));
        setPermissionsByRole(prev => {
            const newPerms = { ...prev };
            delete newPerms[roleId];
            return newPerms;
        });
        setApprovalWorkflow(prev => prev.filter(id => id !== roleId));
        showToast(t.common.deletedSuccess, 'success');
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800">{t.users.rolesList}</h2>
                <button onClick={() => openModal()} disabled={!permissions.create} className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-300">
                    <PlusIcon /> {t.users.newRole}
                </button>
            </div>
             <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">{t.users.roleNameAr}</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">{t.users.roleNameEn}</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">{t.users.actions}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {roles.map(role => (
                            <tr key={role.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap text-slate-900">{role.nameAr}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-900">{role.nameEn}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => openModal(role)} disabled={!permissions.update} className="text-indigo-600 hover:text-indigo-900 disabled:text-slate-300"><PencilIcon/></button>
                                        <button onClick={() => handleDelete(role.id)} disabled={!permissions.delete} className="text-red-600 hover:text-red-900 disabled:text-slate-300"><TrashIcon/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             <div className="mt-8 pt-6 border-t">
                <h2 className="text-xl font-bold text-slate-800 mb-3">{t.users.approvalWorkflow.title}</h2>
                <p className="text-sm text-slate-600 mb-4">{t.users.approvalWorkflow.description}</p>
                 <ApprovalWorkflowEditor
                    roles={roles}
                    workflow={approvalWorkflow}
                    setWorkflow={setApprovalWorkflow}
                    permissions={permissions}
                />
            </div>
            {isModalOpen && <RoleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} role={editingRole} setRoles={setRoles} logActivity={logActivity} permissionsByRole={permissionsByRole} setPermissionsByRole={setPermissionsByRole} />}
        </div>
    );
};

// Approval Workflow Editor Component
interface ApprovalWorkflowEditorProps {
    roles: Role[];
    workflow: string[];
    setWorkflow: React.Dispatch<React.SetStateAction<string[]>>;
    permissions: PermissionActions;
}
const ApprovalWorkflowEditor: React.FC<ApprovalWorkflowEditorProps> = ({ roles, workflow, setWorkflow, permissions }) => {
    const { t, language } = useTranslation();
    const { showToast } = useToast();
    const availableRoles = roles.filter(r => !workflow.includes(r.id));
    const [roleToAdd, setRoleToAdd] = useState<string>('');

    const handleAdd = () => {
        if (roleToAdd) {
            const newWorkflow = [...workflow, roleToAdd];
            setWorkflow(newWorkflow);
            setRoleToAdd('');
            showToast(t.users.approvalWorkflow.workflowUpdated, 'success');
        }
    };

    const handleRemove = (index: number) => {
        const newWorkflow = workflow.filter((_, i) => i !== index);
        setWorkflow(newWorkflow);
        showToast(t.users.approvalWorkflow.workflowUpdated, 'success');
    };

    const handleMove = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === workflow.length - 1) return;

        const newWorkflow = [...workflow];
        const item = newWorkflow.splice(index, 1)[0];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        newWorkflow.splice(newIndex, 0, item);
        setWorkflow(newWorkflow);
        showToast(t.users.approvalWorkflow.workflowUpdated, 'success');
    };

    return (
        <div className="p-4 bg-slate-50 border rounded-lg">
            <ol className="space-y-3 mb-4">
                {workflow.map((roleId, index) => {
                    const role = roles.find(r => r.id === roleId);
                    return (
                        <li key={roleId} className="flex items-center justify-between p-3 bg-white rounded-md border shadow-sm">
                            <div className="flex items-center">
                                <span className="flex items-center justify-center w-6 h-6 bg-slate-700 text-white rounded-full font-bold text-xs mr-4">{index + 1}</span>
                                <span className="font-semibold text-slate-800">
                                    {role ? (language === 'ar' ? role.nameAr : role.nameEn) : roleId}
                                </span>
                            </div>
                            {permissions.update && <div className="flex items-center gap-2">
                                <button onClick={() => handleMove(index, 'up')} disabled={index === 0} className="p-1 rounded-md hover:bg-slate-200 disabled:text-slate-300 disabled:cursor-not-allowed">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>
                                </button>
                                <button onClick={() => handleMove(index, 'down')} disabled={index === workflow.length - 1} className="p-1 rounded-md hover:bg-slate-200 disabled:text-slate-300 disabled:cursor-not-allowed">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                <button onClick={() => handleRemove(index)} className="p-1 text-slate-500 rounded-md hover:bg-red-100 hover:text-red-600">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>}
                        </li>
                    );
                })}
                 {workflow.length === 0 && <p className="text-center text-slate-500 py-4">No approval steps defined.</p>}
            </ol>
            {permissions.update && <div className="flex items-center gap-3 pt-4 border-t">
                <select value={roleToAdd} onChange={e => setRoleToAdd(e.target.value)} className="form-input flex-grow">
                    <option value="">{t.users.approvalWorkflow.selectRole}</option>
                    {availableRoles.map(r => (
                        <option key={r.id} value={r.id}>{language === 'ar' ? r.nameAr : r.nameEn}</option>
                    ))}
                </select>
                <button onClick={handleAdd} disabled={!roleToAdd} className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-300">
                    {t.users.approvalWorkflow.addStep}
                </button>
            </div>}
        </div>
    );
};

// User Add/Edit Modal
interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    roles: Role[];
    logActivity: UsersPageProps['logActivity'];
}
const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, user, setUsers, roles, logActivity }) => {
    const { t, language } = useTranslation();
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        username: user?.username || '',
        password: '',
        roleId: user?.roleId || (roles.length > 0 ? roles[0].id : ''),
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = () => {
        const missingFields = [];
        if (!formData.name) missingFields.push(`'${t.users.fullName}'`);
        if (!formData.username) missingFields.push(`'${t.users.userName}'`);
        if (!formData.roleId) missingFields.push(`'${t.users.role}'`);
        if (!user && !formData.password) missingFields.push(`'${t.users.password}'`);

        if (missingFields.length > 0) {
            showToast(`${t.common.fillRequiredFields}: ${missingFields.join(', ')}`, 'error');
            return;
        }

        if (user) { // Edit
            setUsers(prev => prev.map(u => u.id === user.id ? { ...user, ...formData, password: formData.password || u.password } : u));
            logActivity({ actionType: 'update', entityType: 'User', entityName: formData.name });
            showToast(t.common.updatedSuccess, 'success');
            onClose();
        } else { // Create
            const newUser: User = { id: `user-${Date.now()}`, ...formData };
            setUsers(prev => [...prev, newUser]);
            logActivity({ actionType: 'create', entityType: 'User', entityName: newUser.name });
            showToast(t.common.createdSuccess, 'success');
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={user ? t.users.editUser : t.users.newUser}>
            <div className="space-y-4">
                <FormField label={t.users.fullName} required><input type="text" name="name" value={formData.name} onChange={handleChange} className="form-input" required /></FormField>
                <FormField label={t.users.userName} required><input type="text" name="username" value={formData.username} onChange={handleChange} className="form-input" required /></FormField>
                <FormField label={t.users.password} required={!user}><input type="password" name="password" value={formData.password} onChange={handleChange} className="form-input" placeholder={user ? 'Leave blank to keep unchanged' : ''} required={!user} /></FormField>
                <FormField label={t.users.role} required>
                    <select name="roleId" value={formData.roleId} onChange={handleChange} className="form-input" required>
                        {roles.map(r => <option key={r.id} value={r.id}>{language === 'ar' ? r.nameAr : r.nameEn}</option>)}
                    </select>
                </FormField>
                <div className="pt-4 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-lg">{t.common.cancel}</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">{t.common.save}</button>
                </div>
            </div>
            <FormStyle/>
        </Modal>
    );
};

// Role Add/Edit Modal
interface RoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    role: Role | null;
    setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
    permissionsByRole: Record<string, RolePermissions>;
    setPermissionsByRole: React.Dispatch<React.SetStateAction<Record<string, RolePermissions>>>;
    logActivity: UsersPageProps['logActivity'];
}
const RoleModal: React.FC<RoleModalProps> = ({ isOpen, onClose, role, setRoles, permissionsByRole, setPermissionsByRole, logActivity }) => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        nameAr: role?.nameAr || '',
        nameEn: role?.nameEn || '',
    });

    const pageGroups: Record<string, Page[]> = {
        general: ['dashboard'],
        administrative: ['organization', 'departments', 'policiesAndManuals', 'projects', 'donors', 'correspondence'],
        boardAffairs: ['boardMembers', 'boardOfDirectors', 'boardMeetings', 'meetingSearch'],
        humanResources: ['employees'],
        procurement: ['suppliers', 'items', 'procurementPlans', 'procurementTracking', 'purchaseRequests', 'approvals', 'purchaseOrders', 'contracts'],
        finance: ['projectBudgets', 'expenditures', 'budgetForecast', 'monthlyForecastReview', 'bankAccounts', 'revenues'],
        logistics: ['fuel', 'fleet', 'workers', 'warehouses', 'assets'],
        archive: ['archiveLocations', 'archiveClassifications', 'documents'],
        settings: ['users', 'activityLog', 'backup']
    };
    
    const allPages = Object.values(pageGroups).flat();
    const actions: (keyof PermissionActions)[] = ['create', 'read', 'update', 'delete'];

    const createDefaultPermissions = (): RolePermissions => {
        const perms: any = {};
        allPages.forEach(p => {
            perms[p] = { create: false, read: false, update: false, delete: false };
        });
        return perms as RolePermissions;
    };

    const [localPermissions, setLocalPermissions] = useState<RolePermissions>(
        role && permissionsByRole[role.id] ? { ...createDefaultPermissions(), ...permissionsByRole[role.id] } : createDefaultPermissions()
    );

    useEffect(() => {
        if(role && permissionsByRole[role.id]) {
            setLocalPermissions({ ...createDefaultPermissions(), ...permissionsByRole[role.id] });
            setFormData({ nameAr: role.nameAr, nameEn: role.nameEn });
        } else {
            setLocalPermissions(createDefaultPermissions());
            setFormData({ nameAr: '', nameEn: '' });
        }
    }, [role, permissionsByRole, isOpen]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePermissionChange = (page: Page, action: keyof PermissionActions) => {
        setLocalPermissions(prev => ({
            ...prev,
            [page]: {
                ...prev[page],
                [action]: !prev[page][action]
            }
        }));
    };

    const handleSectionToggle = (groupKey: string, isChecked: boolean) => {
        setLocalPermissions(prev => {
            const next = { ...prev };
            const pagesInGroup = pageGroups[groupKey];
            pagesInGroup.forEach(page => {
                actions.forEach(action => {
                     if (!next[page]) next[page] = { create: false, read: false, update: false, delete: false };
                     next[page][action] = isChecked;
                });
            });
            return next;
        });
    };

    const handleSubmit = () => {
        if (!formData.nameAr.trim() || !formData.nameEn.trim()) {
            showToast(`${t.common.fillRequiredFields}: '${t.users.roleNameAr}', '${t.users.roleNameEn}'`, 'error');
            return;
        }

        if (role) { // Edit
            setRoles(prev => prev.map(r => r.id === role.id ? { ...role, ...formData } : r));
            setPermissionsByRole(prev => ({ ...prev, [role.id]: localPermissions }));
            logActivity({ actionType: 'update', entityType: 'Role', entityName: formData.nameEn });
            showToast(t.common.updatedSuccess, 'success');
            onClose();
        } else { // Create
            const newRole: Role = { id: `role-${Date.now()}`, ...formData };
            setRoles(prev => [...prev, newRole]);
            setPermissionsByRole(prev => ({ ...prev, [newRole.id]: localPermissions }));
            logActivity({ actionType: 'create', entityType: 'Role', entityName: newRole.nameEn });
            showToast(t.common.createdSuccess, 'success');
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={role ? t.users.editRole : t.users.newRole} size="max-w-5xl">
            <div className="space-y-4 flex flex-col h-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-shrink-0">
                    <FormField label={t.users.roleNameAr} required><input type="text" name="nameAr" value={formData.nameAr} onChange={handleChange} className="form-input" required /></FormField>
                    <FormField label={t.users.roleNameEn} required><input type="text" name="nameEn" value={formData.nameEn} onChange={handleChange} className="form-input" required /></FormField>
                </div>

                <div className="flex-grow overflow-y-auto mt-4" style={{ maxHeight: '60vh' }}>
                    <h3 className="text-xl font-bold text-slate-800 mb-4">{t.users.tabs.permissions}</h3>
                     <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="sticky left-0 top-0 bg-slate-100 p-3 text-start font-semibold text-slate-700 z-10">{t.users.page}</th>
                                    <th className="sticky top-0 bg-slate-100 p-3 text-center font-semibold text-slate-700 z-10">{t.users.actions}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(pageGroups).map(([groupKey, pages]) => {
                                    const groupTitleKey = groupKey === 'general' ? 'dashboard' : groupKey; // Translate group name roughly to nav item
                                    const groupTitle = t.nav[groupTitleKey as keyof typeof t.nav] || groupKey.toUpperCase();
                                    
                                    return (
                                        <React.Fragment key={groupKey}>
                                            <tr className="bg-slate-200 font-bold">
                                                <td className="p-3 text-slate-800 flex items-center gap-2" colSpan={2}>
                                                    <input 
                                                        type="checkbox" 
                                                        className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-400"
                                                        onChange={(e) => handleSectionToggle(groupKey, e.target.checked)}
                                                    />
                                                    {groupTitle}
                                                </td>
                                            </tr>
                                            {pages.map(page => (
                                                <tr key={page} className="border-t border-slate-200 bg-white hover:bg-slate-50 transition-colors">
                                                    <td className="p-3 pl-8 font-medium border-r text-slate-900 w-1/3">{t.nav[page as keyof typeof t.nav]}</td>
                                                    <td className="p-3">
                                                        <div className="flex justify-center items-center gap-x-6 gap-y-2 flex-wrap">
                                                            {actions.map(action => (
                                                                <div key={action} className="flex items-center gap-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        id={`${role?.id}-${page}-${action}`}
                                                                        className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                                                                        checked={localPermissions?.[page]?.[action] || false}
                                                                        onChange={() => handlePermissionChange(page, action)}
                                                                    />
                                                                    <label htmlFor={`${role?.id}-${page}-${action}`} className="text-sm text-slate-700 font-medium cursor-pointer select-none">{t.users[action]}</label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="pt-6 flex justify-end gap-3 border-t mt-6 flex-shrink-0">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-lg">{t.common.cancel}</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">{t.common.save}</button>
                </div>
            </div>
            <FormStyle/>
        </Modal>
    );
}

const FormField: React.FC<{ label: string; children: React.ReactNode; required?: boolean }> = ({ label, children, required }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
    </div>
);

const FormStyle: React.FC = () => (
    <style>{`
        .form-input {
            width: 100%;
            padding: 0.5rem 0.75rem;
            border: 1px solid #cbd5e1;
            border-radius: 0.375rem;
            background-color: #f8fafc;
            color: #0f172a;
        }
        .form-input:focus {
             outline: none;
            border-color: #4f46e5;
            box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.3);
        }
    `}</style>
);

export default UsersPage;