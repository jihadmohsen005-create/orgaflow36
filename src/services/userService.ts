import { supabase } from '../lib/supabase';
import { User, Role, RolePermissions, Page, PermissionActions } from '../types';

/**
 * User Service - Handles all user-related database operations
 */

// =============================================
// Users
// =============================================

export const fetchUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }

  return data || [];
};

export const createUser = async (user: Omit<User, 'id'>): Promise<User> => {
  const { data, error } = await supabase
    .from('users')
    .insert([user])
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    throw error;
  }

  return data;
};

export const updateUser = async (id: string, updates: Partial<User>): Promise<User> => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating user:', error);
    throw error;
  }

  return data;
};

export const deleteUser = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const authenticateUser = async (username: string, password: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .single();

  if (error) {
    console.error('Error authenticating user:', error);
    return null;
  }

  return data;
};

// =============================================
// Roles
// =============================================

export const fetchRoles = async (): Promise<Role[]> => {
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .order('name_en');

  if (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }

  return data || [];
};

export const createRole = async (role: Role): Promise<Role> => {
  const { data, error } = await supabase
    .from('roles')
    .insert([role])
    .select()
    .single();

  if (error) {
    console.error('Error creating role:', error);
    throw error;
  }

  return data;
};

export const updateRole = async (id: string, updates: Partial<Role>): Promise<Role> => {
  const { data, error } = await supabase
    .from('roles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating role:', error);
    throw error;
  }

  return data;
};

export const deleteRole = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('roles')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting role:', error);
    throw error;
  }
};

// =============================================
// Role Permissions
// =============================================

export const fetchRolePermissions = async (roleId: string): Promise<RolePermissions> => {
  const { data, error } = await supabase
    .from('role_permissions')
    .select('*')
    .eq('role_id', roleId);

  if (error) {
    console.error('Error fetching role permissions:', error);
    throw error;
  }

  const permissions: RolePermissions = {} as RolePermissions;

  data?.forEach((perm) => {
    permissions[perm.page as Page] = {
      create: perm.can_create,
      read: perm.can_read,
      update: perm.can_update,
      delete: perm.can_delete,
    };
  });

  return permissions;
};

export const fetchAllRolePermissions = async (): Promise<Record<string, RolePermissions>> => {
  const { data, error } = await supabase
    .from('role_permissions')
    .select('*');

  if (error) {
    console.error('Error fetching all role permissions:', error);
    throw error;
  }

  const permissionsByRole: Record<string, RolePermissions> = {};

  data?.forEach((perm) => {
    if (!permissionsByRole[perm.role_id]) {
      permissionsByRole[perm.role_id] = {} as RolePermissions;
    }

    permissionsByRole[perm.role_id][perm.page as Page] = {
      create: perm.can_create,
      read: perm.can_read,
      update: perm.can_update,
      delete: perm.can_delete,
    };
  });

  return permissionsByRole;
};

export const updateRolePermissions = async (
  roleId: string,
  page: Page,
  permissions: PermissionActions
): Promise<void> => {
  const { error } = await supabase
    .from('role_permissions')
    .upsert({
      role_id: roleId,
      page: page,
      can_create: permissions.create,
      can_read: permissions.read,
      can_update: permissions.update,
      can_delete: permissions.delete,
    }, {
      onConflict: 'role_id,page'
    });

  if (error) {
    console.error('Error updating role permissions:', error);
    throw error;
  }
};

// =============================================
// Approval Workflow
// =============================================

export const fetchApprovalWorkflow = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('approval_workflow')
    .select('role_id')
    .order('step_order');

  if (error) {
    console.error('Error fetching approval workflow:', error);
    throw error;
  }

  return data?.map(item => item.role_id) || [];
};

export const updateApprovalWorkflow = async (workflow: string[]): Promise<void> => {
  // Delete existing workflow
  await supabase.from('approval_workflow').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Insert new workflow
  const workflowData = workflow.map((roleId, index) => ({
    step_order: index + 1,
    role_id: roleId,
  }));

  const { error } = await supabase
    .from('approval_workflow')
    .insert(workflowData);

  if (error) {
    console.error('Error updating approval workflow:', error);
    throw error;
  }
};

