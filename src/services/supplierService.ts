import { supabase } from '../lib/supabase';
import { Supplier, SupplierType, BusinessType, SupplierAttachment } from '../types';

/**
 * Supplier Service - Handles all supplier-related database operations
 */

// =============================================
// Suppliers
// =============================================

export const fetchSuppliers = async (): Promise<Supplier[]> => {
  const { data, error } = await supabase
    .from('suppliers')
    .select(`
      *,
      supplier_attachments (*)
    `)
    .order('name_ar');

  if (error) {
    console.error('Error fetching suppliers:', error);
    throw error;
  }

  // Transform attachments to match the frontend type
  return (data || []).map(supplier => ({
    ...supplier,
    typeId: supplier.type_id,
    businessId: supplier.business_id,
    nameAr: supplier.name_ar,
    nameEn: supplier.name_en,
    licensedDealer: supplier.licensed_dealer,
    authorizedPerson: supplier.authorized_person,
    idNumber: supplier.id_number,
    attachments: supplier.supplier_attachments?.map((att: any) => ({
      id: att.id,
      name: att.name,
      description: att.description,
      data: att.file_url,
      type: att.file_type,
    })) || [],
  }));
};

export const createSupplier = async (supplier: Omit<Supplier, 'id'>): Promise<Supplier> => {
  const { attachments, ...supplierData } = supplier;
  
  // Convert camelCase to snake_case for database
  const dbSupplier = {
    name_ar: supplier.nameAr,
    name_en: supplier.nameEn,
    phone: supplier.phone,
    phone2: supplier.phone2,
    address: supplier.address,
    licensed_dealer: supplier.licensedDealer,
    type_id: supplier.typeId,
    email: supplier.email,
    authorized_person: supplier.authorizedPerson,
    chairman: supplier.chairman,
    id_number: supplier.idNumber,
    business_id: supplier.businessId,
  };

  const { data, error } = await supabase
    .from('suppliers')
    .insert([dbSupplier])
    .select()
    .single();

  if (error) {
    console.error('Error creating supplier:', error);
    throw error;
  }

  // Insert attachments if any
  if (attachments && attachments.length > 0) {
    const attachmentData = attachments.map(att => ({
      supplier_id: data.id,
      name: att.name,
      description: att.description,
      file_url: att.data,
      file_type: att.type,
    }));

    await supabase.from('supplier_attachments').insert(attachmentData);
  }

  return {
    ...data,
    typeId: data.type_id,
    businessId: data.business_id,
    nameAr: data.name_ar,
    nameEn: data.name_en,
    licensedDealer: data.licensed_dealer,
    authorizedPerson: data.authorized_person,
    idNumber: data.id_number,
    attachments: attachments || [],
  };
};

export const updateSupplier = async (id: string, updates: Partial<Supplier>): Promise<Supplier> => {
  const { attachments, ...supplierUpdates } = updates;
  
  // Convert camelCase to snake_case
  const dbUpdates: any = {};
  if (updates.nameAr) dbUpdates.name_ar = updates.nameAr;
  if (updates.nameEn) dbUpdates.name_en = updates.nameEn;
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
  if (updates.phone2 !== undefined) dbUpdates.phone2 = updates.phone2;
  if (updates.address !== undefined) dbUpdates.address = updates.address;
  if (updates.licensedDealer !== undefined) dbUpdates.licensed_dealer = updates.licensedDealer;
  if (updates.typeId !== undefined) dbUpdates.type_id = updates.typeId;
  if (updates.email !== undefined) dbUpdates.email = updates.email;
  if (updates.authorizedPerson !== undefined) dbUpdates.authorized_person = updates.authorizedPerson;
  if (updates.chairman !== undefined) dbUpdates.chairman = updates.chairman;
  if (updates.idNumber !== undefined) dbUpdates.id_number = updates.idNumber;
  if (updates.businessId !== undefined) dbUpdates.business_id = updates.businessId;

  const { data, error } = await supabase
    .from('suppliers')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating supplier:', error);
    throw error;
  }

  // Update attachments if provided
  if (attachments) {
    // Delete old attachments
    await supabase.from('supplier_attachments').delete().eq('supplier_id', id);
    
    // Insert new attachments
    if (attachments.length > 0) {
      const attachmentData = attachments.map(att => ({
        supplier_id: id,
        name: att.name,
        description: att.description,
        file_url: att.data,
        file_type: att.type,
      }));

      await supabase.from('supplier_attachments').insert(attachmentData);
    }
  }

  return {
    ...data,
    typeId: data.type_id,
    businessId: data.business_id,
    nameAr: data.name_ar,
    nameEn: data.name_en,
    licensedDealer: data.licensed_dealer,
    authorizedPerson: data.authorized_person,
    idNumber: data.id_number,
    attachments: attachments || [],
  };
};

export const deleteSupplier = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('suppliers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting supplier:', error);
    throw error;
  }
};

// =============================================
// Supplier Types
// =============================================

export const fetchSupplierTypes = async (): Promise<SupplierType[]> => {
  const { data, error } = await supabase
    .from('supplier_types')
    .select('*')
    .order('name_en');

  if (error) {
    console.error('Error fetching supplier types:', error);
    throw error;
  }

  return (data || []).map(type => ({
    id: type.id,
    nameAr: type.name_ar,
    nameEn: type.name_en,
  }));
};

export const createSupplierType = async (type: Omit<SupplierType, 'id'>): Promise<SupplierType> => {
  const { data, error } = await supabase
    .from('supplier_types')
    .insert([{
      name_ar: type.nameAr,
      name_en: type.nameEn,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating supplier type:', error);
    throw error;
  }

  return {
    id: data.id,
    nameAr: data.name_ar,
    nameEn: data.name_en,
  };
};

// =============================================
// Business Types
// =============================================

export const fetchBusinessTypes = async (): Promise<BusinessType[]> => {
  const { data, error } = await supabase
    .from('business_types')
    .select('*')
    .order('name_en');

  if (error) {
    console.error('Error fetching business types:', error);
    throw error;
  }

  return (data || []).map(type => ({
    id: type.id,
    nameAr: type.name_ar,
    nameEn: type.name_en,
  }));
};

export const createBusinessType = async (type: Omit<BusinessType, 'id'>): Promise<BusinessType> => {
  const { data, error } = await supabase
    .from('business_types')
    .insert([{
      name_ar: type.nameAr,
      name_en: type.nameEn,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating business type:', error);
    throw error;
  }

  return {
    id: data.id,
    nameAr: data.name_ar,
    nameEn: data.name_en,
  };
};

