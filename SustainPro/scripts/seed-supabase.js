console.log("START");
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://iqjlbqhpojsqxcpdvkbs.supabase.co";
const supabaseKey = "sb_publishable_vcKJFq9h2A1ss0gnx1mjyw_Ft87simc";

const supabase = createClient(supabaseUrl, supabaseKey);

const PROJ_1_UUID = 'e0915ab8-8b06-4071-8b05-f9ad220fcb69';
const PROJ_2_UUID = 'd3202e21-0e19-450b-85bd-fce757b3bba1';

const generateCalculatedData = (buName) => {
  return [
    {
      activityUID: "ACT-001",
      activityName: "Stationary Combustion",
      griCategory: "GRI 305-1 Direct GHG emissions (Scope 1)",
      griSubcategory: "305.1.1",
      scope: "1",
      calculatedValue: Math.floor(Math.random() * 50000) + 10000,
      unit: "kgCO2e",
      formula: "Fuel Consumed * EF",
      inputParameters: [
        { parameterId: "p1", parameterName: "Fuel Consumed", value: "5000", unit: "L", parameterType: "variable" },
        { parameterId: "p2", parameterName: "Emission Factor", value: "2.5", unit: "kgCO2e/L", parameterType: "ef_value" }
      ]
    },
    {
      activityUID: "ACT-002",
      activityName: "Mobile Combustion",
      griCategory: "GRI 305-1 Direct GHG emissions (Scope 1)",
      griSubcategory: "305.1.2",
      scope: "1",
      calculatedValue: Math.floor(Math.random() * 30000) + 5000,
      unit: "kgCO2e",
      formula: "Distance * EF",
      inputParameters: [
        { parameterId: "p1", parameterName: "Distance Travelled", value: "15000", unit: "km", parameterType: "variable" }
      ]
    },
    {
      activityUID: "ACT-008",
      activityName: "Purchased Electricity",
      griCategory: "GRI 305-2 Indirect GHG emissions (Scope 2)",
      griSubcategory: "305.2.1",
      scope: "2",
      calculatedValue: Math.floor(Math.random() * 80000) + 20000,
      unit: "kgCO2e",
      formula: "Electricity Consumed * Grid EF",
      inputParameters: [
        { parameterId: "p1", parameterName: "Electricity Consumed", value: "120000", unit: "kWh", parameterType: "variable" }
      ]
    }
  ];
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
