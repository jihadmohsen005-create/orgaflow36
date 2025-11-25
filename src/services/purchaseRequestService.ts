import { supabase } from '../lib/supabase';
import { PurchaseRequest, PurchaseRequestItem, PurchaseRequestApproval } from '../types';

/**
 * Purchase Request Service - Handles all purchase request-related database operations
 */

// =============================================
// Purchase Requests
// =============================================

export const fetchPurchaseRequests = async (): Promise<PurchaseRequest[]> => {
  const { data, error } = await supabase
    .from('purchase_requests')
    .select(`
      *,
      purchase_request_items (*),
      purchase_request_notes (*),
      purchase_request_approvals (*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching purchase requests:', error);
    throw error;
  }

  return (data || []).map(pr => ({
    id: pr.id,
    requestNumber: pr.request_number,
    projectId: pr.project_id,
    requestDate: pr.request_date,
    requesterName: pr.requester_name,
    department: pr.department,
    purpose: pr.purpose,
    deliveryLocation: pr.delivery_location,
    requestedDeliveryDate: pr.requested_delivery_date,
    priority: pr.priority,
    status: pr.status,
    method: pr.method,
    items: pr.purchase_request_items?.map((item: any) => ({
      id: item.id,
      itemId: item.item_id,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      estimatedUnitPrice: item.estimated_unit_price,
      estimatedTotalPrice: item.estimated_total_price,
      currency: item.currency,
      specifications: item.specifications,
    })) || [],
    notes: pr.purchase_request_notes?.map((note: any) => ({
      id: note.id,
      userId: note.user_id,
      userName: note.user_name,
      text: note.text,
      timestamp: note.timestamp,
    })) || [],
    approvals: pr.purchase_request_approvals?.map((approval: any) => ({
      id: approval.id,
      roleId: approval.role_id,
      userId: approval.user_id,
      userName: approval.user_name,
      status: approval.status,
      comments: approval.comments,
      timestamp: approval.timestamp,
    })) || [],
    createdAt: pr.created_at,
    updatedAt: pr.updated_at,
  }));
};

export const createPurchaseRequest = async (
  request: Omit<PurchaseRequest, 'id' | 'createdAt' | 'updatedAt'>
): Promise<PurchaseRequest> => {
  const { items, notes, approvals, ...requestData } = request;

  const { data, error } = await supabase
    .from('purchase_requests')
    .insert([{
      request_number: request.requestNumber,
      project_id: request.projectId,
      request_date: request.requestDate,
      requester_name: request.requesterName,
      department: request.department,
      purpose: request.purpose,
      delivery_location: request.deliveryLocation,
      requested_delivery_date: request.requestedDeliveryDate,
      priority: request.priority,
      status: request.status,
      method: request.method,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating purchase request:', error);
    throw error;
  }

  const requestId = data.id;

  // Insert items
  if (items && items.length > 0) {
    await supabase.from('purchase_request_items').insert(
      items.map(item => ({
        purchase_request_id: requestId,
        item_id: item.itemId,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        estimated_unit_price: item.estimatedUnitPrice,
        estimated_total_price: item.estimatedTotalPrice,
        currency: item.currency,
        specifications: item.specifications,
      }))
    );
  }

  // Insert notes
  if (notes && notes.length > 0) {
    await supabase.from('purchase_request_notes').insert(
      notes.map(note => ({
        purchase_request_id: requestId,
        user_id: note.userId,
        user_name: note.userName,
        text: note.text,
        timestamp: note.timestamp,
      }))
    );
  }

  // Insert approvals
  if (approvals && approvals.length > 0) {
    await supabase.from('purchase_request_approvals').insert(
      approvals.map(approval => ({
        purchase_request_id: requestId,
        role_id: approval.roleId,
        user_id: approval.userId,
        user_name: approval.userName,
        status: approval.status,
        comments: approval.comments,
        timestamp: approval.timestamp,
      }))
    );
  }

  return {
    ...data,
    requestNumber: data.request_number,
    projectId: data.project_id,
    requestDate: data.request_date,
    requesterName: data.requester_name,
    deliveryLocation: data.delivery_location,
    requestedDeliveryDate: data.requested_delivery_date,
    items: items || [],
    notes: notes || [],
    approvals: approvals || [],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

export const updatePurchaseRequest = async (
  id: string,
  updates: Partial<PurchaseRequest>
): Promise<PurchaseRequest> => {
  const { items, notes, approvals, ...requestUpdates } = updates;

  const dbUpdates: any = {};
  if (updates.requestNumber !== undefined) dbUpdates.request_number = updates.requestNumber;
  if (updates.projectId !== undefined) dbUpdates.project_id = updates.projectId;
  if (updates.requestDate !== undefined) dbUpdates.request_date = updates.requestDate;
  if (updates.requesterName !== undefined) dbUpdates.requester_name = updates.requesterName;
  if (updates.department !== undefined) dbUpdates.department = updates.department;
  if (updates.purpose !== undefined) dbUpdates.purpose = updates.purpose;
  if (updates.deliveryLocation !== undefined) dbUpdates.delivery_location = updates.deliveryLocation;
  if (updates.requestedDeliveryDate !== undefined) dbUpdates.requested_delivery_date = updates.requestedDeliveryDate;
  if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.method !== undefined) dbUpdates.method = updates.method;

  const { data, error } = await supabase
    .from('purchase_requests')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating purchase request:', error);
    throw error;
  }

  // Update items if provided
  if (items !== undefined) {
    await supabase.from('purchase_request_items').delete().eq('purchase_request_id', id);
    if (items.length > 0) {
      await supabase.from('purchase_request_items').insert(
        items.map(item => ({
          purchase_request_id: id,
          item_id: item.itemId,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          estimated_unit_price: item.estimatedUnitPrice,
          estimated_total_price: item.estimatedTotalPrice,
          currency: item.currency,
          specifications: item.specifications,
        }))
      );
    }
  }

  return {
    ...data,
    requestNumber: data.request_number,
    projectId: data.project_id,
    requestDate: data.request_date,
    requesterName: data.requester_name,
    deliveryLocation: data.delivery_location,
    requestedDeliveryDate: data.requested_delivery_date,
    items: items || [],
    notes: notes || [],
    approvals: approvals || [],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

export const deletePurchaseRequest = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('purchase_requests')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting purchase request:', error);
    throw error;
  }
};

export const addPurchaseRequestApproval = async (
  requestId: string,
  approval: Omit<PurchaseRequestApproval, 'id'>
): Promise<void> => {
  const { error } = await supabase
    .from('purchase_request_approvals')
    .insert([{
      purchase_request_id: requestId,
      role_id: approval.roleId,
      user_id: approval.userId,
      user_name: approval.userName,
      status: approval.status,
      comments: approval.comments,
      timestamp: approval.timestamp,
    }]);

  if (error) {
    console.error('Error adding purchase request approval:', error);
    throw error;
  }
};

