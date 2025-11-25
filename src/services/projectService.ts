import { supabase } from '../lib/supabase';
import { Project, Donor } from '../types';

/**
 * Project Service - Handles all project-related database operations
 */

// =============================================
// Projects
// =============================================

export const fetchProjects = async (): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      project_objectives (*),
      project_activities (*),
      project_extensions (*),
      project_attachments (*),
      project_reports (*),
      grant_payments (*)
    `)
    .order('project_code');

  if (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }

  return (data || []).map(project => ({
    id: project.id,
    projectCode: project.project_code,
    nameAr: project.name_ar,
    nameEn: project.name_en,
    donorId: project.donor_id,
    startDate: project.start_date,
    endDate: project.end_date,
    totalBudget: project.total_budget,
    currency: project.currency,
    objectives: project.project_objectives?.map((obj: any) => obj.text) || [],
    activities: project.project_activities?.map((act: any) => act.text) || [],
    extensions: project.project_extensions?.map((ext: any) => ({
      newEndDate: ext.new_end_date,
      reason: ext.reason,
    })) || [],
    attachments: project.project_attachments?.map((att: any) => ({
      id: att.id,
      name: att.name,
      data: att.file_url,
      type: att.file_type,
    })) || [],
    reports: project.project_reports?.map((rep: any) => ({
      id: rep.id,
      reportType: rep.report_type,
      reportDate: rep.report_date,
      fileName: rep.file_name,
      fileData: rep.file_url,
      fileType: rep.file_type,
    })) || [],
    grantPayments: project.grant_payments?.map((gp: any) => ({
      id: gp.id,
      paymentDate: gp.payment_date,
      amount: gp.amount,
      currency: gp.currency,
      description: gp.description,
    })) || [],
  }));
};

export const createProject = async (project: Omit<Project, 'id'>): Promise<Project> => {
  const { objectives, activities, extensions, attachments, reports, grantPayments, ...projectData } = project;

  const { data, error } = await supabase
    .from('projects')
    .insert([{
      project_code: project.projectCode,
      name_ar: project.nameAr,
      name_en: project.nameEn,
      donor_id: project.donorId,
      start_date: project.startDate,
      end_date: project.endDate,
      total_budget: project.totalBudget,
      currency: project.currency,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating project:', error);
    throw error;
  }

  const projectId = data.id;

  // Insert objectives
  if (objectives && objectives.length > 0) {
    await supabase.from('project_objectives').insert(
      objectives.map(text => ({ project_id: projectId, text }))
    );
  }

  // Insert activities
  if (activities && activities.length > 0) {
    await supabase.from('project_activities').insert(
      activities.map(text => ({ project_id: projectId, text }))
    );
  }

  // Insert extensions
  if (extensions && extensions.length > 0) {
    await supabase.from('project_extensions').insert(
      extensions.map(ext => ({
        project_id: projectId,
        new_end_date: ext.newEndDate,
        reason: ext.reason,
      }))
    );
  }

  // Insert attachments
  if (attachments && attachments.length > 0) {
    await supabase.from('project_attachments').insert(
      attachments.map(att => ({
        project_id: projectId,
        name: att.name,
        file_url: att.data,
        file_type: att.type,
      }))
    );
  }

  // Insert reports
  if (reports && reports.length > 0) {
    await supabase.from('project_reports').insert(
      reports.map(rep => ({
        project_id: projectId,
        report_type: rep.reportType,
        report_date: rep.reportDate,
        file_name: rep.fileName,
        file_url: rep.fileData,
        file_type: rep.fileType,
      }))
    );
  }

  // Insert grant payments
  if (grantPayments && grantPayments.length > 0) {
    await supabase.from('grant_payments').insert(
      grantPayments.map(gp => ({
        project_id: projectId,
        payment_date: gp.paymentDate,
        amount: gp.amount,
        currency: gp.currency,
        description: gp.description,
      }))
    );
  }

  return {
    ...data,
    projectCode: data.project_code,
    nameAr: data.name_ar,
    nameEn: data.name_en,
    donorId: data.donor_id,
    startDate: data.start_date,
    endDate: data.end_date,
    totalBudget: data.total_budget,
    objectives: objectives || [],
    activities: activities || [],
    extensions: extensions || [],
    attachments: attachments || [],
    reports: reports || [],
    grantPayments: grantPayments || [],
  };
};

export const updateProject = async (id: string, updates: Partial<Project>): Promise<Project> => {
  const { objectives, activities, extensions, attachments, reports, grantPayments, ...projectUpdates } = updates;

  const dbUpdates: any = {};
  if (updates.projectCode !== undefined) dbUpdates.project_code = updates.projectCode;
  if (updates.nameAr !== undefined) dbUpdates.name_ar = updates.nameAr;
  if (updates.nameEn !== undefined) dbUpdates.name_en = updates.nameEn;
  if (updates.donorId !== undefined) dbUpdates.donor_id = updates.donorId;
  if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
  if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;
  if (updates.totalBudget !== undefined) dbUpdates.total_budget = updates.totalBudget;
  if (updates.currency !== undefined) dbUpdates.currency = updates.currency;

  const { data, error } = await supabase
    .from('projects')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating project:', error);
    throw error;
  }

  // Update related data if provided
  if (objectives !== undefined) {
    await supabase.from('project_objectives').delete().eq('project_id', id);
    if (objectives.length > 0) {
      await supabase.from('project_objectives').insert(
        objectives.map(text => ({ project_id: id, text }))
      );
    }
  }

  if (activities !== undefined) {
    await supabase.from('project_activities').delete().eq('project_id', id);
    if (activities.length > 0) {
      await supabase.from('project_activities').insert(
        activities.map(text => ({ project_id: id, text }))
      );
    }
  }

  return {
    ...data,
    projectCode: data.project_code,
    nameAr: data.name_ar,
    nameEn: data.name_en,
    donorId: data.donor_id,
    startDate: data.start_date,
    endDate: data.end_date,
    totalBudget: data.total_budget,
    objectives: objectives || [],
    activities: activities || [],
    extensions: extensions || [],
    attachments: attachments || [],
    reports: reports || [],
    grantPayments: grantPayments || [],
  };
};

export const deleteProject = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

// =============================================
// Donors
// =============================================

export const fetchDonors = async (): Promise<Donor[]> => {
  const { data, error } = await supabase
    .from('donors')
    .select('*')
    .order('name_en');

  if (error) {
    console.error('Error fetching donors:', error);
    throw error;
  }

  return (data || []).map(donor => ({
    id: donor.id,
    nameAr: donor.name_ar,
    nameEn: donor.name_en,
    donorCode: donor.donor_code,
    contactPerson: donor.contact_person,
    phoneNumber: donor.phone_number,
    email: donor.email,
    website: donor.website,
  }));
};

export const createDonor = async (donor: Omit<Donor, 'id'>): Promise<Donor> => {
  const { data, error } = await supabase
    .from('donors')
    .insert([{
      name_ar: donor.nameAr,
      name_en: donor.nameEn,
      donor_code: donor.donorCode,
      contact_person: donor.contactPerson,
      phone_number: donor.phoneNumber,
      email: donor.email,
      website: donor.website,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating donor:', error);
    throw error;
  }

  return {
    id: data.id,
    nameAr: data.name_ar,
    nameEn: data.name_en,
    donorCode: data.donor_code,
    contactPerson: data.contact_person,
    phoneNumber: data.phone_number,
    email: data.email,
    website: data.website,
  };
};

