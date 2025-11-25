import { supabase } from '../lib/supabase';
import { Item, ItemCategory } from '../types';

/**
 * Item Service - Handles all item-related database operations
 */

// =============================================
// Items
// =============================================

export const fetchItems = async (): Promise<Item[]> => {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .order('name_ar');

  if (error) {
    console.error('Error fetching items:', error);
    throw error;
  }

  return (data || []).map(item => ({
    id: item.id,
    categoryId: item.category_id,
    nameAr: item.name_ar,
    nameEn: item.name_en,
    descriptionAr: item.description_ar,
    descriptionEn: item.description_en,
    unit: item.unit,
    estimatedPrice: item.estimated_price,
    currency: item.currency,
    notes: item.notes,
  }));
};

export const createItem = async (item: Omit<Item, 'id'>): Promise<Item> => {
  const { data, error } = await supabase
    .from('items')
    .insert([{
      category_id: item.categoryId,
      name_ar: item.nameAr,
      name_en: item.nameEn,
      description_ar: item.descriptionAr,
      description_en: item.descriptionEn,
      unit: item.unit,
      estimated_price: item.estimatedPrice,
      currency: item.currency,
      notes: item.notes,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating item:', error);
    throw error;
  }

  return {
    id: data.id,
    categoryId: data.category_id,
    nameAr: data.name_ar,
    nameEn: data.name_en,
    descriptionAr: data.description_ar,
    descriptionEn: data.description_en,
    unit: data.unit,
    estimatedPrice: data.estimated_price,
    currency: data.currency,
    notes: data.notes,
  };
};

export const updateItem = async (id: string, updates: Partial<Item>): Promise<Item> => {
  const dbUpdates: any = {};
  if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId;
  if (updates.nameAr !== undefined) dbUpdates.name_ar = updates.nameAr;
  if (updates.nameEn !== undefined) dbUpdates.name_en = updates.nameEn;
  if (updates.descriptionAr !== undefined) dbUpdates.description_ar = updates.descriptionAr;
  if (updates.descriptionEn !== undefined) dbUpdates.description_en = updates.descriptionEn;
  if (updates.unit !== undefined) dbUpdates.unit = updates.unit;
  if (updates.estimatedPrice !== undefined) dbUpdates.estimated_price = updates.estimatedPrice;
  if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

  const { data, error } = await supabase
    .from('items')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating item:', error);
    throw error;
  }

  return {
    id: data.id,
    categoryId: data.category_id,
    nameAr: data.name_ar,
    nameEn: data.name_en,
    descriptionAr: data.description_ar,
    descriptionEn: data.description_en,
    unit: data.unit,
    estimatedPrice: data.estimated_price,
    currency: data.currency,
    notes: data.notes,
  };
};

export const deleteItem = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
};

// =============================================
// Item Categories
// =============================================

export const fetchItemCategories = async (): Promise<ItemCategory[]> => {
  const { data, error } = await supabase
    .from('item_categories')
    .select('*')
    .order('name_en');

  if (error) {
    console.error('Error fetching item categories:', error);
    throw error;
  }

  return (data || []).map(cat => ({
    id: cat.id,
    nameAr: cat.name_ar,
    nameEn: cat.name_en,
  }));
};

export const createItemCategory = async (category: Omit<ItemCategory, 'id'>): Promise<ItemCategory> => {
  const { data, error } = await supabase
    .from('item_categories')
    .insert([{
      name_ar: category.nameAr,
      name_en: category.nameEn,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating item category:', error);
    throw error;
  }

  return {
    id: data.id,
    nameAr: data.name_ar,
    nameEn: data.name_en,
  };
};

