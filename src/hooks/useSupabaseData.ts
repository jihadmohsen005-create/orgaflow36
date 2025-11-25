import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as userService from '../services/userService';
import * as supplierService from '../services/supplierService';
import * as itemService from '../services/itemService';
import * as projectService from '../services/projectService';
import * as purchaseRequestService from '../services/purchaseRequestService';
import { User, Role, Supplier, Item, Project, Donor, PurchaseRequest } from '../types';

/**
 * Custom hooks for Supabase data operations using React Query
 */

// =============================================
// Users
// =============================================

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: userService.fetchUsers,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<User> }) =>
      userService.updateUser(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// =============================================
// Roles
// =============================================

export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: userService.fetchRoles,
  });
};

export const useRolePermissions = () => {
  return useQuery({
    queryKey: ['rolePermissions'],
    queryFn: userService.fetchAllRolePermissions,
  });
};

export const useApprovalWorkflow = () => {
  return useQuery({
    queryKey: ['approvalWorkflow'],
    queryFn: userService.fetchApprovalWorkflow,
  });
};

// =============================================
// Suppliers
// =============================================

export const useSuppliers = () => {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: supplierService.fetchSuppliers,
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: supplierService.createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Supplier> }) =>
      supplierService.updateSupplier(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: supplierService.deleteSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
};

export const useSupplierTypes = () => {
  return useQuery({
    queryKey: ['supplierTypes'],
    queryFn: supplierService.fetchSupplierTypes,
  });
};

export const useBusinessTypes = () => {
  return useQuery({
    queryKey: ['businessTypes'],
    queryFn: supplierService.fetchBusinessTypes,
  });
};

// =============================================
// Items
// =============================================

export const useItems = () => {
  return useQuery({
    queryKey: ['items'],
    queryFn: itemService.fetchItems,
  });
};

export const useCreateItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: itemService.createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
};

export const useItemCategories = () => {
  return useQuery({
    queryKey: ['itemCategories'],
    queryFn: itemService.fetchItemCategories,
  });
};

// =============================================
// Projects
// =============================================

export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: projectService.fetchProjects,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectService.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Project> }) =>
      projectService.updateProject(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectService.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useDonors = () => {
  return useQuery({
    queryKey: ['donors'],
    queryFn: projectService.fetchDonors,
  });
};

export const useCreateDonor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectService.createDonor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donors'] });
    },
  });
};

// =============================================
// Purchase Requests
// =============================================

export const usePurchaseRequests = () => {
  return useQuery({
    queryKey: ['purchaseRequests'],
    queryFn: purchaseRequestService.fetchPurchaseRequests,
  });
};

export const useCreatePurchaseRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: purchaseRequestService.createPurchaseRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseRequests'] });
    },
  });
};

export const useUpdatePurchaseRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<PurchaseRequest> }) =>
      purchaseRequestService.updatePurchaseRequest(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseRequests'] });
    },
  });
};

export const useDeletePurchaseRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: purchaseRequestService.deletePurchaseRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseRequests'] });
    },
  });
};

