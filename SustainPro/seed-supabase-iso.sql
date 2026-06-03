-- =============================================================================
-- SustainPro — ISO 14064-1 FLOW SEED  (FY2025)
-- =============================================================================
-- Run AFTER `seed-supabase.sql` (it reuses the same tables: projects,
-- project_business_units, activity_submissions).
--
-- Seeds a SECOND, ISO-native BCA project so the ISO flow can be demonstrated
-- end-to-end without touching the existing GRI project:
--
--   Project  "FY2025 ISO 14064-1 Inventory"  (PROJ_ISO)
--     ├── iso-bu-1  Production Plant — Texas            (approved)
--     ├── iso-bu-2  Cold Storage & Distribution — Ohio  (submitted)
--     └── iso-bu-3  Head Office & Sales — Illinois      (submitted)
--
-- Every calculated_data row carries ISO categorisation DIRECTLY:
--   framework='ISO', isoCategoryNumber, isoCategory, isoSubcategory.
-- The ISO report aggregates by isoSubcategory (see sumISOValues()).
--
-- Org-level total = 7,223,820 kgCO₂e ≈ 7,224 tCO₂e
--   Production 3,939,550 · Distribution 2,691,980 · Office 592,290
--
-- Safe to re-run: deletes + re-inserts only the PROJ_ISO rows.
-- =============================================================================

-- Clean prior ISO seed rows for this project so re-runs are safe
DELETE FROM public.activity_submissions
 WHERE project_id = 'a7c4f1e2-3b8d-4e56-9a01-2f6c8d4b7e90'::uuid;
DELETE FROM public.project_business_units
 WHERE project_id = 'a7c4f1e2-3b8d-4e56-9a01-2f6c8d4b7e90'::uuid;
DELETE FROM public.projects
 WHERE id = 'a7c4f1e2-3b8d-4e56-9a01-2f6c8d4b7e90'::uuid;

-- ── Project ──────────────────────────────────────────────────────────────────
INSERT INTO public.projects (id, name, description, year, status)
VALUES (
  'a7c4f1e2-3b8d-4e56-9a01-2f6c8d4b7e90'::uuid,
  'FY2025 ISO 14064-1 Inventory',
  'Organizational GHG inventory under ISO 14064-1:2018 (Categories 1–6) across Production, Distribution, and Head Office business units.',
  2025,
  'in_progress'
);

-- ── BU assignments ───────────────────────────────────────────────────────────
INSERT INTO public.project_business_units (project_id, business_unit_id) VALUES
  ('a7c4f1e2-3b8d-4e56-9a01-2f6c8d4b7e90'::uuid, 'iso-bu-1'),
  ('a7c4f1e2-3b8d-4e56-9a01-2f6c8d4b7e90'::uuid, 'iso-bu-2'),
  ('a7c4f1e2-3b8d-4e56-9a01-2f6c8d4b7e90'::uuid, 'iso-bu-3');

-- ── ISO-BU-1 · Production Plant — Texas (approved) · total 3,939,550 ─────────
INSERT INTO public.activity_submissions
  (project_id, business_unit_id, uploaded_by, status, file_name, calculated_data)
VALUES (
  'a7c4f1e2-3b8d-4e56-9a01-2f6c8d4b7e90'::uuid,
  'iso-bu-1',
  'Priya Nair',
  'approved',
  'BU-PRD-2025-001_ISO14064_FY2025.xlsx',
  '[
    {"activityUID":"ACT-ISO-2025-0101","activityName":"Stationary Combustion — Natural Gas Boilers","framework":"ISO","isoCategoryNumber":"1","isoCategory":"Category 1: Direct GHG emissions and removals","isoSubcategory":"1.1","calculatedValue":793800,"unit":"kgCO2e","formula":"Natural Gas Combustion · Gross Emissions","inputParameters":[{"parameterId":"param_gas_volume","parameterName":"gas_volume","value":"420000","unit":"m³","parameterType":"variable"},{"parameterId":"param_gas_ef","parameterName":"gas_ef","value":"1.89","unit":"kg CO2e/m³","parameterType":"ef_value"}]},
    {"activityUID":"ACT-ISO-2025-0102","activityName":"Mobile Combustion — Plant Diesel Fleet","framework":"ISO","isoCategoryNumber":"1","isoCategory":"Category 1: Direct GHG emissions and removals","isoSubcategory":"1.2","calculatedValue":255550,"unit":"kgCO2e","formula":"Vehicle Fleet Emissions · Fuel-Based","inputParameters":[{"parameterId":"param_fuel_volume","parameterName":"fuel_volume","value":"95000","unit":"L","parameterType":"variable"},{"parameterId":"param_fuel_ef","parameterName":"fuel_ef","value":"2.69","unit":"kg CO2e/L","parameterType":"ef_value"}]},
    {"activityUID":"ACT-ISO-2025-0103","activityName":"Process Emissions — Calcination","framework":"ISO","isoCategoryNumber":"1","isoCategory":"Category 1: Direct GHG emissions and removals","isoSubcategory":"1.3","calculatedValue":637500,"unit":"kgCO2e","formula":"Industrial Process Emissions · Mass-Based","inputParameters":[{"parameterId":"param_process_mass","parameterName":"process_mass","value":"1250000","unit":"kg","parameterType":"variable"},{"parameterId":"param_process_ef","parameterName":"process_ef","value":"0.51","unit":"kg CO2e/kg","parameterType":"ef_value"}]},
    {"activityUID":"ACT-ISO-2025-0104","activityName":"Fugitive Emissions — Refrigerant Leakage (R-410A)","framework":"ISO","isoCategoryNumber":"1","isoCategory":"Category 1: Direct GHG emissions and removals","isoSubcategory":"1.4","calculatedValue":26100,"unit":"kgCO2e","formula":"Refrigerant Leakage · Mass-Balance Method","inputParameters":[{"parameterId":"param_refrigerant_mass","parameterName":"refrigerant_mass","value":"12.5","unit":"kg","parameterType":"variable"},{"parameterId":"param_gwp_factor","parameterName":"gwp_factor","value":"2088","unit":"kg CO2e/kg","parameterType":"ef_value"}]},
    {"activityUID":"ACT-ISO-2025-0201","activityName":"Imported Electricity — Grid (Location-based)","framework":"ISO","isoCategoryNumber":"2","isoCategory":"Category 2: Indirect GHG emissions from imported energy","isoSubcategory":"2.1","calculatedValue":1550400,"unit":"kgCO2e","formula":"Electricity Consumption · Location-based","inputParameters":[{"parameterId":"param_electricity_consumption","parameterName":"electricity_consumption","value":"3800000","unit":"kWh","parameterType":"variable"},{"parameterId":"param_grid_ef","parameterName":"grid_ef","value":"0.408","unit":"kg CO2e/kWh","parameterType":"ef_value"}]},
    {"activityUID":"ACT-ISO-2025-0202","activityName":"Imported Steam & District Heat","framework":"ISO","isoCategoryNumber":"2","isoCategory":"Category 2: Indirect GHG emissions from imported energy","isoSubcategory":"2.2","calculatedValue":96000,"unit":"kgCO2e","formula":"Imported Steam Emissions","inputParameters":[{"parameterId":"param_steam_consumption","parameterName":"steam_consumption","value":"480000","unit":"kWh","parameterType":"variable"},{"parameterId":"param_steam_ef","parameterName":"steam_ef","value":"0.20","unit":"kg CO2e/kWh","parameterType":"ef_value"}]},
    {"activityUID":"ACT-ISO-2025-0401","activityName":"Purchased Goods & Services (Spend-based)","framework":"ISO","isoCategoryNumber":"4","isoCategory":"Category 4: Indirect GHG emissions from products used by the organization","isoSubcategory":"4.1","calculatedValue":369000,"unit":"kgCO2e","formula":"Purchased Goods - Spend-based","inputParameters":[{"parameterId":"param_purchase_amount","parameterName":"purchase_amount","value":"820000","unit":"USD","parameterType":"variable"},{"parameterId":"param_spend_ef","parameterName":"spend_ef","value":"0.45","unit":"kg CO2e/USD","parameterType":"ef_value"}]},
    {"activityUID":"ACT-ISO-2025-0402","activityName":"Capital Goods (Spend-based)","framework":"ISO","isoCategoryNumber":"4","isoCategory":"Category 4: Indirect GHG emissions from products used by the organization","isoSubcategory":"4.2","calculatedValue":130200,"unit":"kgCO2e","formula":"Capital Goods - Spend-based","inputParameters":[{"parameterId":"param_capex_amount","parameterName":"capex_amount","value":"310000","unit":"USD","parameterType":"variable"},{"parameterId":"param_capex_ef","parameterName":"capex_ef","value":"0.42","unit":"kg CO2e/USD","parameterType":"ef_value"}]},
    {"activityUID":"ACT-ISO-2025-0403","activityName":"Disposal of Solid & Liquid Waste","framework":"ISO","isoCategoryNumber":"4","isoCategory":"Category 4: Indirect GHG emissions from products used by the organization","isoSubcategory":"4.3","calculatedValue":81000,"unit":"kgCO2e","formula":"Waste Disposal Emissions · Mass-Based","inputParameters":[{"parameterId":"param_waste_mass","parameterName":"waste_mass","value":"180","unit":"ton","parameterType":"variable"},{"parameterId":"param_waste_ef","parameterName":"waste_ef","value":"450","unit":"kg CO2e/ton","parameterType":"ef_value"}]}
  ]'::jsonb
);

-- ── ISO-BU-2 · Cold Storage & Distribution — Ohio (submitted) · total 2,691,980 ─
INSERT INTO public.activity_submissions
  (project_id, business_unit_id, uploaded_by, status, file_name, calculated_data)
VALUES (
  'a7c4f1e2-3b8d-4e56-9a01-2f6c8d4b7e90'::uuid,
  'iso-bu-2',
  'Tom Becker',
  'submitted',
  'BU-DST-2025-002_ISO14064_FY2025.xlsx',
  '[
    {"activityUID":"ACT-ISO-2025-0112","activityName":"Mobile Combustion — Refrigerated Delivery Trucks","framework":"ISO","isoCategoryNumber":"1","isoCategory":"Category 1: Direct GHG emissions and removals","isoSubcategory":"1.2","calculatedValue":371220,"unit":"kgCO2e","formula":"Vehicle Fleet Emissions · Fuel-Based","inputParameters":[{"parameterId":"param_fuel_volume","parameterName":"fuel_volume","value":"138000","unit":"L","parameterType":"variable"},{"parameterId":"param_fuel_ef","parameterName":"fuel_ef","value":"2.69","unit":"kg CO2e/L","parameterType":"ef_value"}]},
    {"activityUID":"ACT-ISO-2025-0201","activityName":"Imported Electricity — Grid (Location-based)","framework":"ISO","isoCategoryNumber":"2","isoCategory":"Category 2: Indirect GHG emissions from imported energy","isoSubcategory":"2.1","calculatedValue":2121600,"unit":"kgCO2e","formula":"Electricity Consumption · Location-based","inputParameters":[{"parameterId":"param_electricity_consumption","parameterName":"electricity_consumption","value":"5200000","unit":"kWh","parameterType":"variable"},{"parameterId":"param_grid_ef","parameterName":"grid_ef","value":"0.408","unit":"kg CO2e/kWh","parameterType":"ef_value"}]},
    {"activityUID":"ACT-ISO-2025-0301","activityName":"Upstream Transportation — Inbound Freight (3PL)","framework":"ISO","isoCategoryNumber":"3","isoCategory":"Category 3: Indirect GHG emissions from transportation","isoSubcategory":"3.1","calculatedValue":172160,"unit":"kgCO2e","formula":"Vehicle Fleet Emissions · Fuel-Based","inputParameters":[{"parameterId":"param_fuel_volume","parameterName":"fuel_volume","value":"64000","unit":"L","parameterType":"variable"},{"parameterId":"param_fuel_ef","parameterName":"fuel_ef","value":"2.69","unit":"kg CO2e/L","parameterType":"ef_value"}]},
    {"activityUID":"ACT-ISO-2025-0403","activityName":"Disposal of Solid & Liquid Waste","framework":"ISO","isoCategoryNumber":"4","isoCategory":"Category 4: Indirect GHG emissions from products used by the organization","isoSubcategory":"4.3","calculatedValue":27000,"unit":"kgCO2e","formula":"Waste Disposal Emissions · Mass-Based","inputParameters":[{"parameterId":"param_waste_mass","parameterName":"waste_mass","value":"60","unit":"ton","parameterType":"variable"},{"parameterId":"param_waste_ef","parameterName":"waste_ef","value":"450","unit":"kg CO2e/ton","parameterType":"ef_value"}]}
  ]'::jsonb
);

-- ── ISO-BU-3 · Head Office & Sales — Illinois (submitted) · total 592,290 ────
INSERT INTO public.activity_submissions
  (project_id, business_unit_id, uploaded_by, status, file_name, calculated_data)
VALUES (
  'a7c4f1e2-3b8d-4e56-9a01-2f6c8d4b7e90'::uuid,
  'iso-bu-3',
  'Sofia Rossi',
  'submitted',
  'BU-HQ-2025-003_ISO14064_FY2025.xlsx',
  '[
    {"activityUID":"ACT-ISO-2025-0201","activityName":"Imported Electricity — Grid (Location-based)","framework":"ISO","isoCategoryNumber":"2","isoCategory":"Category 2: Indirect GHG emissions from imported energy","isoSubcategory":"2.1","calculatedValue":167280,"unit":"kgCO2e","formula":"Electricity Consumption · Location-based","inputParameters":[{"parameterId":"param_electricity_consumption","parameterName":"electricity_consumption","value":"410000","unit":"kWh","parameterType":"variable"},{"parameterId":"param_grid_ef","parameterName":"grid_ef","value":"0.408","unit":"kg CO2e/kWh","parameterType":"ef_value"}]},
    {"activityUID":"ACT-ISO-2025-0303","activityName":"Employee Commuting","framework":"ISO","isoCategoryNumber":"3","isoCategory":"Category 3: Indirect GHG emissions from transportation","isoSubcategory":"3.3","calculatedValue":54720,"unit":"kgCO2e","formula":"Vehicle Fleet Emissions · Distance-Based","inputParameters":[{"parameterId":"param_distance","parameterName":"distance","value":"285000","unit":"km","parameterType":"variable"},{"parameterId":"param_vehicle_ef","parameterName":"vehicle_ef","value":"0.192","unit":"kg CO2e/km","parameterType":"ef_value"}]},
    {"activityUID":"ACT-ISO-2025-0305","activityName":"Business Travel","framework":"ISO","isoCategoryNumber":"3","isoCategory":"Category 3: Indirect GHG emissions from transportation","isoSubcategory":"3.5","calculatedValue":42240,"unit":"kgCO2e","formula":"Vehicle Fleet Emissions · Distance-Based","inputParameters":[{"parameterId":"param_distance","parameterName":"distance","value":"220000","unit":"km","parameterType":"variable"},{"parameterId":"param_vehicle_ef","parameterName":"vehicle_ef","value":"0.192","unit":"kg CO2e/km","parameterType":"ef_value"}]},
    {"activityUID":"ACT-ISO-2025-0501","activityName":"Use of Sold Products — Use-Phase Energy","framework":"ISO","isoCategoryNumber":"5","isoCategory":"Category 5: Indirect GHG emissions associated with the use of products from the organization","isoSubcategory":"5.1","calculatedValue":225000,"unit":"kgCO2e","formula":"Product Use-Phase Emissions · Unit-Based","inputParameters":[{"parameterId":"param_units_sold","parameterName":"units_sold","value":"18000","unit":"unit","parameterType":"variable"},{"parameterId":"param_use_ef","parameterName":"use_ef","value":"12.5","unit":"kg CO2e/unit","parameterType":"ef_value"}]},
    {"activityUID":"ACT-ISO-2025-0503","activityName":"End-of-Life Treatment of Sold Products","framework":"ISO","isoCategoryNumber":"5","isoCategory":"Category 5: Indirect GHG emissions associated with the use of products from the organization","isoSubcategory":"5.3","calculatedValue":37800,"unit":"kgCO2e","formula":"Product End-of-Life Emissions · Unit-Based","inputParameters":[{"parameterId":"param_units_sold","parameterName":"units_sold","value":"18000","unit":"unit","parameterType":"variable"},{"parameterId":"param_eol_ef","parameterName":"eol_ef","value":"2.1","unit":"kg CO2e/unit","parameterType":"ef_value"}]},
    {"activityUID":"ACT-ISO-2025-0601","activityName":"Other Indirect — Outsourced Operations (Spend-based)","framework":"ISO","isoCategoryNumber":"6","isoCategory":"Category 6: Other indirect GHG emissions","isoSubcategory":"6.1","calculatedValue":65250,"unit":"kgCO2e","formula":"Purchased Goods - Spend-based","inputParameters":[{"parameterId":"param_purchase_amount","parameterName":"purchase_amount","value":"145000","unit":"USD","parameterType":"variable"},{"parameterId":"param_spend_ef","parameterName":"spend_ef","value":"0.45","unit":"kg CO2e/USD","parameterType":"ef_value"}]}
  ]'::jsonb
);

-- ── Seed a generated ISO report so SA can fork it into a Report Template ──────
-- (report_generations / report_templates come from seed-report-templates.sql.)
-- The "Create Report Template" gate requires at least one generated report;
-- this row also makes the ISO report selectable as a fork source.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema='public' AND table_name='report_generations') THEN
    DELETE FROM public.report_generations
     WHERE project_id = 'a7c4f1e2-3b8d-4e56-9a01-2f6c8d4b7e90'::uuid;
    INSERT INTO public.report_generations
      (project_id, business_unit_id, report_type, template_id, generated_by, generated_at)
    VALUES
      ('a7c4f1e2-3b8d-4e56-9a01-2f6c8d4b7e90'::uuid, NULL, 'ISO', NULL,
       'Sustainability Architect', NOW());
  END IF;
END $$;

-- =============================================================================
-- VERIFICATION — uncomment to confirm
-- =============================================================================
-- SELECT business_unit_id, uploaded_by, status,
--   jsonb_array_length(calculated_data) AS rows,
--   (SELECT ROUND(SUM((d->>'calculatedValue')::numeric))
--      FROM jsonb_array_elements(calculated_data) d) AS total_kgco2e
-- FROM public.activity_submissions
-- WHERE project_id = 'a7c4f1e2-3b8d-4e56-9a01-2f6c8d4b7e90'::uuid;
-- Expected: iso-bu-1 = 3,939,550 · iso-bu-2 = 2,691,980 · iso-bu-3 = 592,290

-- Per-ISO-category totals (1–6):
-- SELECT d->>'isoSubcategory' AS iso_sub,
--        ROUND(SUM((d->>'calculatedValue')::numeric)) AS kgco2e
--   FROM public.activity_submissions,
--        jsonb_array_elements(calculated_data) d
--  WHERE project_id = 'a7c4f1e2-3b8d-4e56-9a01-2f6c8d4b7e90'::uuid
--  GROUP BY 1 ORDER BY 1;
