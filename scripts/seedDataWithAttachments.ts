/**
 * 🌱 Seed Data Script with Real Attachments
 * 
 * هذا السكريبت يضيف بيانات تجريبية مع مرفقات فعلية إلى قاعدة البيانات
 */

import { supabase } from '../supabaseClient';

// Helper function to create a simple PDF file as Blob
function createSamplePDF(title: string): Blob {
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(${title}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000317 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
410
%%EOF`;
  
  return new Blob([pdfContent], { type: 'application/pdf' });
}

// Upload file to Supabase Storage
async function uploadFileToStorage(file: Blob, folder: string, fileName: string): Promise<string> {
  const filePath = `${folder}/${fileName}`;
  
  const { data, error } = await supabase.storage
    .from('attachments')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error('Error uploading file:', error);
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('attachments')
    .getPublicUrl(filePath);

  return publicUrl;
}

// Seed Policy Manuals
async function seedPolicyManuals() {
  console.log('🌱 Seeding policy_manuals...');
  
  const policies = [
    { name: 'سياسة الموارد البشرية', year: '2024', notes: 'سياسة شاملة لإدارة الموارد البشرية' },
    { name: 'دليل الإجراءات المالية', year: '2024', notes: 'دليل شامل للإجراءات المالية والمحاسبية' },
    { name: 'سياسة المشتريات والعقود', year: '2023', notes: 'سياسة تنظيم عمليات المشتريات والعقود' },
  ];

  for (const policy of policies) {
    try {
      // Create PDF file
      const pdfBlob = createSamplePDF(policy.name);
      const fileName = `${Date.now()}-${policy.name.replace(/\s+/g, '_')}.pdf`;
      
      // Upload to Storage
      const fileUrl = await uploadFileToStorage(pdfBlob, 'policies', fileName);
      
      // Insert into database
      const { error } = await supabase
        .from('policy_manuals')
        .insert([{
          name: policy.name,
          year: policy.year,
          notes: policy.notes,
          issue_date: new Date().toISOString().split('T')[0],
          attachment_name: fileName,
          attachment_url: fileUrl,
          attachment_type: 'application/pdf'
        }]);

      if (error) throw error;
      console.log(`✅ Added policy: ${policy.name}`);
    } catch (error) {
      console.error(`❌ Failed to add policy: ${policy.name}`, error);
    }
  }
}

// Seed Correspondence
async function seedCorrespondence() {
  console.log('🌱 Seeding correspondence...');
  
  const correspondences = [
    { type: 'Outgoing', title: 'طلب تمويل مشروع', entity: 'وزارة التخطيط', serialNumber: 'OUT-2024-0001', sequence: 1 },
    { type: 'Incoming', title: 'موافقة على المشروع', entity: 'الجهة المانحة', serialNumber: 'IN-2024-0001', sequence: 1 },
    { type: 'Outgoing', title: 'تقرير الإنجاز الربع سنوي', entity: 'الجهة المانحة', serialNumber: 'OUT-2024-0002', sequence: 2 },
  ];

  for (const corr of correspondences) {
    try {
      // Create PDF file
      const pdfBlob = createSamplePDF(corr.title);
      const fileName = `${Date.now()}-${corr.serialNumber}.pdf`;
      
      // Upload to Storage
      const fileUrl = await uploadFileToStorage(pdfBlob, 'correspondence', fileName);

      // Insert into database
      const { error } = await supabase
        .from('correspondence')
        .insert([{
          type: corr.type,
          title: corr.title,
          entity: corr.entity,
          date: new Date().toISOString().split('T')[0],
          serial_number: corr.serialNumber,
          sequence: corr.sequence,
          year: 2024,
          attachment_name: fileName,
          attachment_url: fileUrl,
          attachment_type: 'application/pdf'
        }]);

      if (error) throw error;
      console.log(`✅ Added correspondence: ${corr.title}`);
    } catch (error) {
      console.error(`❌ Failed to add correspondence: ${corr.title}`, error);
    }
  }
}

// Seed Departments
async function seedDepartments() {
  console.log('🌱 Seeding departments...');

  const departments = [
    { name_ar: 'الإدارة العامة', name_en: 'General Management' },
    { name_ar: 'الموارد البشرية', name_en: 'Human Resources' },
    { name_ar: 'المالية والمحاسبة', name_en: 'Finance and Accounting' },
    { name_ar: 'المشاريع', name_en: 'Projects' },
    { name_ar: 'المشتريات', name_en: 'Procurement' },
  ];

  for (const dept of departments) {
    try {
      const { error } = await supabase
        .from('departments')
        .insert([dept]);

      if (error) throw error;
      console.log(`✅ Added department: ${dept.name_en}`);
    } catch (error) {
      console.error(`❌ Failed to add department: ${dept.name_en}`, error);
    }
  }
}

// Seed Donors
async function seedDonors() {
  console.log('🌱 Seeding donors...');

  const donors = [
    { name_ar: 'البنك الدولي', name_en: 'World Bank', country: 'USA', contact_person: 'John Smith', email: 'john@worldbank.org', phone: '+1234567890' },
    { name_ar: 'الاتحاد الأوروبي', name_en: 'European Union', country: 'Belgium', contact_person: 'Marie Dupont', email: 'marie@eu.org', phone: '+32123456789' },
    { name_ar: 'الوكالة الأمريكية للتنمية', name_en: 'USAID', country: 'USA', contact_person: 'Sarah Johnson', email: 'sarah@usaid.gov', phone: '+1987654321' },
  ];

  for (const donor of donors) {
    try {
      const { error } = await supabase
        .from('donors')
        .insert([donor]);

      if (error) throw error;
      console.log(`✅ Added donor: ${donor.name_en}`);
    } catch (error) {
      console.error(`❌ Failed to add donor: ${donor.name_en}`, error);
    }
  }
}

// Seed Master Board Members
async function seedBoardMembers() {
  console.log('🌱 Seeding master_board_members...');

  const members = [
    { full_name: 'أحمد محمد علي', id_number: '1234567890', nationality: 'سعودي', position: 'رئيس مجلس الإدارة', phone: '0501234567', email: 'ahmed@example.com' },
    { full_name: 'فاطمة حسن', id_number: '0987654321', nationality: 'سعودية', position: 'نائب الرئيس', phone: '0509876543', email: 'fatima@example.com' },
    { full_name: 'خالد عبدالله', id_number: '1122334455', nationality: 'سعودي', position: 'عضو', phone: '0501122334', email: 'khaled@example.com' },
    { full_name: 'نورة سعيد', id_number: '5544332211', nationality: 'سعودية', position: 'عضو', phone: '0505544332', email: 'noura@example.com' },
    { full_name: 'عمر يوسف', id_number: '6677889900', nationality: 'سعودي', position: 'عضو', phone: '0506677889', email: 'omar@example.com' },
  ];

  for (const member of members) {
    try {
      const { error } = await supabase
        .from('master_board_members')
        .insert([member]);

      if (error) throw error;
      console.log(`✅ Added board member: ${member.full_name}`);
    } catch (error) {
      console.error(`❌ Failed to add board member: ${member.full_name}`, error);
    }
  }
}

// Main function
export async function seedAllData() {
  console.log('🚀 Starting seed process...\n');

  try {
    await seedPolicyManuals();
    console.log('');

    await seedCorrespondence();
    console.log('');

    await seedDepartments();
    console.log('');

    await seedDonors();
    console.log('');

    await seedBoardMembers();
    console.log('');

    console.log('✅ Seed process completed successfully!');
  } catch (error) {
    console.error('❌ Seed process failed:', error);
  }
}

// Run if executed directly
if (require.main === module) {
  seedAllData();
}

