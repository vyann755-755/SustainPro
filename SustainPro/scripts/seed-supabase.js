console.log("START");
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://iqjlbqhpojsqxcpdvkbs.supabase.co";
const supabaseKey = "sb_publishable_vcKJFq9h2A1ss0gnx1mjyw_Ft87simc";

const supabase = createClient(supabaseUrl, supabaseKey);

const PROJ_1_UUID = 'e0915ab8-8b06-4071-8b05-f9ad220fcb69';
const PROJ_2_UUID = 'd3202e21-0e19-450b-85bd-fce757b3bba1';

const generateCalculatedData = (buId) => {
  const buActivities = {
    'bu-1': ['ACT-2024-0001', 'ACT-2024-0002', 'ACT-2024-0003', 'ACT-2024-0008', 'ACT-2024-0009', 'ACT-2024-0031', 'ACT-2024-0032'],
    'bu-2': ['ACT-2024-0008', 'ACT-2024-0009', 'ACT-2024-0034', 'ACT-2024-0036', 'ACT-2024-0037'],
    'bu-3': ['ACT-2024-0008', 'ACT-2024-0036', 'ACT-2024-0037', 'ACT-2024-0031'],
    'bu-4': ['ACT-2024-0008', 'ACT-2024-0001', 'ACT-2024-0037'],
    'bu-5': ['ACT-2024-0002', 'ACT-2024-0034', 'ACT-2024-0008'],
    'bu-6': ['ACT-2024-0008', 'ACT-2024-0009', 'ACT-2024-0001', 'ACT-2024-0032']
  };

  const activityTemplates = {
    'ACT-2024-0001': { name: "Stationary Combustion", griCat: "GRI 305-1 Direct GHG emissions (Scope 1)", subCat: "305.1.1", scope: "1", form: "Fuel Consumed * EF" },
    'ACT-2024-0002': { name: "Mobile Combustion", griCat: "GRI 305-1 Direct GHG emissions (Scope 1)", subCat: "305.1.2", scope: "1", form: "Distance * EF" },
    'ACT-2024-0003': { name: "Fugitive Emissions", griCat: "GRI 305-1 Direct GHG emissions (Scope 1)", subCat: "305.1.3", scope: "1", form: "Refrigerant Loss * GWP" },
    'ACT-2024-0008': { name: "Electricity Location-based", griCat: "GRI 305-2 Indirect GHG emissions (Scope 2)", subCat: "305.2.1", scope: "2", form: "Electricity * Grid EF" },
    'ACT-2024-0009': { name: "Electricity Market-based", griCat: "GRI 305-2 Indirect GHG emissions (Scope 2)", subCat: "305.2.2", scope: "2", form: "Electricity * Supplier EF" },
    'ACT-2024-0031': { name: "Purchased goods", griCat: "GRI 305-3 Indirect GHG emissions (Scope 3)", subCat: "305.3.1", scope: "3", form: "Spend * Spend EF" },
    'ACT-2024-0032': { name: "Capital goods", griCat: "GRI 305-3 Indirect GHG emissions (Scope 3)", subCat: "305.3.2", scope: "3", form: "Spend * Spend EF" },
    'ACT-2024-0034': { name: "Upstream transportation", griCat: "GRI 305-3 Indirect GHG emissions (Scope 3)", subCat: "305.3.4", scope: "3", form: "Distance * Weight * EF" },
    'ACT-2024-0036': { name: "Business travel", griCat: "GRI 305-3 Indirect GHG emissions (Scope 3)", subCat: "305.3.6", scope: "3", form: "Distance * EF" },
    'ACT-2024-0037': { name: "Employee commuting", griCat: "GRI 305-3 Indirect GHG emissions (Scope 3)", subCat: "305.3.7", scope: "3", form: "Distance * EF" }
  };

  const activities = buActivities[buId] || buActivities['bu-1'];

  return activities.map((actUid, idx) => {
    const template = activityTemplates[actUid];
    return {
      activityUID: actUid,
      activityName: template.name,
      griCategory: template.griCat,
      griSubcategory: template.subCat,
      scope: template.scope,
      calculatedValue: Math.floor(Math.random() * 50000) + 5000,
      unit: "kgCO2e",
      formula: template.form,
      inputParameters: [
        { parameterId: `p1_${idx}`, parameterName: "Input Value", value: String(Math.floor(Math.random() * 10000)), unit: "units", parameterType: "variable" },
        { parameterId: `p2_${idx}`, parameterName: "Emission Factor", value: (Math.random() * 2 + 0.1).toFixed(4), unit: "kgCO2e/unit", parameterType: "ef_value" }
      ]
    };
  });
};

const seedData = async () => {
  console.log('Seeding Supabase...');

  // 1. Insert Projects
  const projects = [
    {
      id: PROJ_1_UUID,
      name: 'Q1 2025 Carbon Assessment',
      description: 'Quarterly carbon footprint assessment for Q1 2025',
      year: 2025,
      status: 'in-progress'
    },
    {
      id: PROJ_2_UUID,
      name: 'Annual Sustainability Report 2025',
      description: 'Comprehensive annual sustainability and carbon accounting report',
      year: 2025,
      status: 'in-progress'
    }
  ];

  console.log('Inserting projects...');
  for (const proj of projects) {
    const { error } = await supabase.from('projects').upsert(proj, { onConflict: 'id' });
    if (error) console.error(`Error inserting project ${proj.id}:`, error.message);
  }

  // 2. Insert Business Units
  const projectBus = [
    { project_id: PROJ_1_UUID, business_unit_id: 'bu-1' },
    { project_id: PROJ_1_UUID, business_unit_id: 'bu-2' },
    { project_id: PROJ_1_UUID, business_unit_id: 'bu-3' },
    { project_id: PROJ_2_UUID, business_unit_id: 'bu-4' },
    { project_id: PROJ_2_UUID, business_unit_id: 'bu-5' },
    { project_id: PROJ_2_UUID, business_unit_id: 'bu-6' }
  ];

  console.log('Inserting business units...');
  for (const bu of projectBus) {
    const { error } = await supabase.from('project_business_units').upsert(
      { project_id: bu.project_id, business_unit_id: bu.business_unit_id },
      { onConflict: 'project_id, business_unit_id' }
    );
    if (error) console.error(`Error inserting BU ${bu.business_unit_id}:`, error.message);
  }

  // 3. Insert Activity Submissions
  console.log('Inserting activity submissions...');
  for (const bu of projectBus) {
    const calculated_data = generateCalculatedData(bu.business_unit_id);
    
    const payload = {
      project_id: bu.project_id,
      business_unit_id: bu.business_unit_id,
      uploaded_by: 'System Seed',
      file_name: `${bu.business_unit_id}_activity_data.xlsx`,
      calculated_data: calculated_data,
      status: 'submitted'
    };

    const { error } = await supabase
      .from('activity_submissions')
      .insert(payload);

    if (error) {
      console.error(`Error inserting submissions for ${bu.business_unit_id}:`, error.message);
    } else {
      console.log(`Inserted mock data for BU: ${bu.business_unit_id} in Project: ${bu.project_id}`);
    }
  }

  console.log('Finished seeding.');
};

seedData().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
