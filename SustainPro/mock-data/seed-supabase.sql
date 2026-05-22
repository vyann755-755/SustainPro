-- =============================================================================
-- SustainPro — COMPLETE SETUP + SEED (FY2025)
-- =============================================================================
-- Self-contained. Run this ONCE in Supabase SQL Editor:
--   https://supabase.com/dashboard/project/iqjlbqhpojsqxcpdvkbs/sql
--
-- What it does (in order):
--   PART 1 — Creates the three tables if they don't already exist
--   PART 2 — Creates RLS policies (skips if already present)
--   PART 3 — Enables realtime on activity_submissions
--   PART 4 — Seeds: 1 project, 3 BU links, 3 activity submissions (FY2025)
--
-- Safe to re-run: tables use IF NOT EXISTS; seed deletes + re-inserts for
-- the specific project UUID only, so other data is untouched.
-- =============================================================================


-- =============================================================================
-- PART 1 · CREATE TABLES
-- =============================================================================

-- Projects
CREATE TABLE IF NOT EXISTS public.projects (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT NOT NULL,
    description TEXT,
    year        INTEGER NOT NULL,
    status      TEXT DEFAULT 'draft',
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Units assigned to projects
CREATE TABLE IF NOT EXISTS public.project_business_units (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id       UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    business_unit_id TEXT NOT NULL,
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, business_unit_id)
);

-- Activity Data Submissions (from Customer User to SA)
CREATE TABLE IF NOT EXISTS public.activity_submissions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id      UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    business_unit_id TEXT NOT NULL,
    uploaded_by     TEXT NOT NULL,
    status          TEXT DEFAULT 'submitted',
    file_name       TEXT,
    calculated_data JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =============================================================================
-- PART 2 · ROW LEVEL SECURITY  (skips gracefully if policies already exist)
-- =============================================================================

ALTER TABLE public.projects               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_business_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_submissions   ENABLE ROW LEVEL SECURITY;

-- projects policies
DO $$ BEGIN
  CREATE POLICY "Enable read access for all users"   ON public.projects FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Enable insert access for all users" ON public.projects FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Enable update access for all users" ON public.projects FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Enable delete access for all users" ON public.projects FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- project_business_units policies
DO $$ BEGIN
  CREATE POLICY "Enable read access for all users"   ON public.project_business_units FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Enable insert access for all users" ON public.project_business_units FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Enable update access for all users" ON public.project_business_units FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Enable delete access for all users" ON public.project_business_units FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- activity_submissions policies
DO $$ BEGIN
  CREATE POLICY "Enable read access for all users"   ON public.activity_submissions FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Enable insert access for all users" ON public.activity_submissions FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Enable update access for all users" ON public.activity_submissions FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Enable delete access for all users" ON public.activity_submissions FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- =============================================================================
-- PART 3 · REALTIME
-- =============================================================================

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_submissions;
EXCEPTION WHEN others THEN NULL; END $$;


-- =============================================================================
-- PART 4 · SEED DATA  (idempotent for PROJ_1_UUID)
-- =============================================================================
-- Totals (location-based, kg CO₂e):
--   Manufacturing  2,654,659  ·  Warehouse  823,798  ·  Office  218,660
--   Project total  3,697,117  ≈  3,697 tCO₂e

-- Clean prior seed rows for this project so re-runs are safe
DELETE FROM public.activity_submissions
 WHERE project_id = 'e0915ab8-8b06-4071-8b05-f9ad220fcb69'::uuid;

DELETE FROM public.project_business_units
 WHERE project_id = 'e0915ab8-8b06-4071-8b05-f9ad220fcb69'::uuid;

DELETE FROM public.projects
 WHERE id = 'e0915ab8-8b06-4071-8b05-f9ad220fcb69'::uuid;

-- ── 4a · Project ─────────────────────────────────────────────────────────────
INSERT INTO public.projects (id, name, description, year, status)
VALUES (
  'e0915ab8-8b06-4071-8b05-f9ad220fcb69'::uuid,
  'Q1 2025 Carbon Assessment',
  'Quarterly carbon footprint assessment for FY2025 across Manufacturing, Warehouse, and Corporate Office business units.',
  2025,
  'in_progress'
);

-- ── 4b · BU assignments ──────────────────────────────────────────────────────
INSERT INTO public.project_business_units (project_id, business_unit_id) VALUES
  ('e0915ab8-8b06-4071-8b05-f9ad220fcb69'::uuid, 'bu-1'),
  ('e0915ab8-8b06-4071-8b05-f9ad220fcb69'::uuid, 'bu-2'),
  ('e0915ab8-8b06-4071-8b05-f9ad220fcb69'::uuid, 'bu-3');

-- ── 4c · BU-1  Manufacturing Plant — North America  (status: approved) ───────
INSERT INTO public.activity_submissions
  (project_id, business_unit_id, uploaded_by, status, file_name, calculated_data)
VALUES (
  'e0915ab8-8b06-4071-8b05-f9ad220fcb69'::uuid,
  'bu-1',
  'John Smith',
  'approved',
  'BU-MFG-2025-001_ActivityData_FY2025.xlsx',
  '[
    {
      "activityUID": "ACT-2024-0001",
      "activityName": "Table-1: Stationary Combustion",
      "griCategory": "GRI 305-1 Direct GHG emissions (Scope 1)",
      "griSubcategory": "305.1.1",
      "scope": "1",
      "calculatedValue": 538650,
      "unit": "kgCO2e",
      "formula": "Natural Gas Combustion · Gross Emissions",
      "inputParameters": [
        {"parameterId":"param_gas_volume","parameterName":"gas_volume","value":"285000","unit":"m³","parameterType":"variable"},
        {"parameterId":"param_gas_ef","parameterName":"gas_ef","value":"1.89","unit":"kg CO2e/m³","parameterType":"ef_value"}
      ]
    },
    {
      "activityUID": "ACT-2024-0002",
      "activityName": "Table-2: Mobile Combustion",
      "griCategory": "GRI 305-1 Direct GHG emissions (Scope 1)",
      "griSubcategory": "305.1.2",
      "scope": "1",
      "calculatedValue": 32352,
      "unit": "kgCO2e",
      "formula": "Vehicle Fleet Emissions · Distance-Based",
      "inputParameters": [
        {"parameterId":"param_distance","parameterName":"distance","value":"168500","unit":"km","parameterType":"variable"},
        {"parameterId":"param_vehicle_ef","parameterName":"vehicle_ef","value":"0.192","unit":"kg CO2e/km","parameterType":"ef_value"}
      ]
    },
    {
      "activityUID": "ACT-2024-0003",
      "activityName": "Table-3: Fugitive Emissions - Refrigerant",
      "griCategory": "GRI 305-1 Direct GHG emissions (Scope 1)",
      "griSubcategory": "305.1.3",
      "scope": "1",
      "calculatedValue": 14500,
      "unit": "kgCO2e",
      "formula": "Refrigerant Leakage · Mass-Balance Method",
      "inputParameters": [
        {"parameterId":"param_refrigerant_mass","parameterName":"refrigerant_mass","value":"6.943","unit":"kg","parameterType":"variable"},
        {"parameterId":"param_gwp_factor","parameterName":"gwp_factor","value":"2088","unit":"kg CO2e/kg","parameterType":"ef_value"}
      ]
    },
    {
      "activityUID": "ACT-2024-0008",
      "activityName": "Table 8. Electricity purchased: Location-based",
      "griCategory": "GRI 305-2 Indirect GHG emissions (Scope 2)",
      "griSubcategory": "305.2.8",
      "scope": "2",
      "calculatedValue": 1734000,
      "unit": "kgCO2e",
      "formula": "Electricity Consumption · Location-based",
      "inputParameters": [
        {"parameterId":"param_electricity_consumption","parameterName":"electricity_consumption","value":"4250000","unit":"kWh","parameterType":"variable"},
        {"parameterId":"param_grid_ef","parameterName":"grid_ef","value":"0.408","unit":"kg CO2e/kWh","parameterType":"ef_value"}
      ]
    },
    {
      "activityUID": "ACT-2024-0009",
      "activityName": "Table 9. Electricity purchased: Market-based",
      "griCategory": "GRI 305-2 Indirect GHG emissions (Scope 2)",
      "griSubcategory": "305.2.9",
      "scope": "2",
      "calculatedValue": 127500,
      "unit": "kgCO2e",
      "formula": "Electricity Consumption · Market-based",
      "inputParameters": [
        {"parameterId":"param_electricity_consumption","parameterName":"electricity_consumption","value":"4250000","unit":"kWh","parameterType":"variable"},
        {"parameterId":"param_grid_ef","parameterName":"market_ef","value":"0.030","unit":"kg CO2e/kWh","parameterType":"ef_value"}
      ]
    },
    {
      "activityUID": "ACT-2024-0031",
      "activityName": "Cat. 1: Purchased goods and services",
      "griCategory": "GRI 305-3 Indirect GHG emissions (Scope 3)",
      "griSubcategory": "305.3.1",
      "scope": "3",
      "calculatedValue": 245760,
      "unit": "kgCO2e",
      "formula": "Purchased Goods - Spend-based",
      "inputParameters": [
        {"parameterId":"param_purchase_amount","parameterName":"purchase_amount","value":"546133","unit":"USD","parameterType":"variable"},
        {"parameterId":"param_spend_ef","parameterName":"spend_ef","value":"0.45","unit":"kg CO2e/USD","parameterType":"ef_value"}
      ]
    },
    {
      "activityUID": "ACT-2024-0032",
      "activityName": "Cat. 2: Capital goods",
      "griCategory": "GRI 305-3 Indirect GHG emissions (Scope 3)",
      "griSubcategory": "305.3.2",
      "scope": "3",
      "calculatedValue": 89397,
      "unit": "kgCO2e",
      "formula": "Capital Goods - Spend-based",
      "inputParameters": [
        {"parameterId":"param_capex_amount","parameterName":"capex_amount","value":"212850","unit":"USD","parameterType":"variable"},
        {"parameterId":"param_capex_ef","parameterName":"capex_ef","value":"0.42","unit":"kg CO2e/USD","parameterType":"ef_value"}
      ]
    }
  ]'::jsonb
);

-- ── 4d · BU-2  Distribution Warehouse — East Coast  (status: submitted) ──────
INSERT INTO public.activity_submissions
  (project_id, business_unit_id, uploaded_by, status, file_name, calculated_data)
VALUES (
  'e0915ab8-8b06-4071-8b05-f9ad220fcb69'::uuid,
  'bu-2',
  'Maria Chen',
  'submitted',
  'BU-WHS-2025-002_ActivityData_FY2025.xlsx',
  '[
    {
      "activityUID": "ACT-2024-0008",
      "activityName": "Table 8. Electricity purchased: Location-based",
      "griCategory": "GRI 305-2 Indirect GHG emissions (Scope 2)",
      "griSubcategory": "305.2.8",
      "scope": "2",
      "calculatedValue": 612000,
      "unit": "kgCO2e",
      "formula": "Electricity Consumption · Location-based",
      "inputParameters": [
        {"parameterId":"param_electricity_consumption","parameterName":"electricity_consumption","value":"1500000","unit":"kWh","parameterType":"variable"},
        {"parameterId":"param_grid_ef","parameterName":"grid_ef","value":"0.408","unit":"kg CO2e/kWh","parameterType":"ef_value"}
      ]
    },
    {
      "activityUID": "ACT-2024-0009",
      "activityName": "Table 9. Electricity purchased: Market-based",
      "griCategory": "GRI 305-2 Indirect GHG emissions (Scope 2)",
      "griSubcategory": "305.2.9",
      "scope": "2",
      "calculatedValue": 45000,
      "unit": "kgCO2e",
      "formula": "Electricity Consumption · Market-based",
      "inputParameters": [
        {"parameterId":"param_electricity_consumption","parameterName":"electricity_consumption","value":"1500000","unit":"kWh","parameterType":"variable"},
        {"parameterId":"param_grid_ef","parameterName":"market_ef","value":"0.030","unit":"kg CO2e/kWh","parameterType":"ef_value"}
      ]
    },
    {
      "activityUID": "ACT-2024-0034",
      "activityName": "Cat. 4: Upstream transportation",
      "griCategory": "GRI 305-3 Indirect GHG emissions (Scope 3)",
      "griSubcategory": "305.3.4",
      "scope": "3",
      "calculatedValue": 184265,
      "unit": "kgCO2e",
      "formula": "Vehicle Fleet Emissions · Fuel-Based",
      "inputParameters": [
        {"parameterId":"param_fuel_volume","parameterName":"fuel_volume","value":"68500","unit":"L","parameterType":"variable"},
        {"parameterId":"param_fuel_ef","parameterName":"fuel_ef","value":"2.69","unit":"kg CO2e/L","parameterType":"ef_value"}
      ]
    },
    {
      "activityUID": "ACT-2024-0036",
      "activityName": "Cat. 6: Business travel",
      "griCategory": "GRI 305-3 Indirect GHG emissions (Scope 3)",
      "griSubcategory": "305.3.6",
      "scope": "3",
      "calculatedValue": 8640,
      "unit": "kgCO2e",
      "formula": "Vehicle Fleet Emissions · Distance-Based",
      "inputParameters": [
        {"parameterId":"param_distance","parameterName":"distance","value":"45000","unit":"km","parameterType":"variable"},
        {"parameterId":"param_vehicle_ef","parameterName":"vehicle_ef","value":"0.192","unit":"kg CO2e/km","parameterType":"ef_value"}
      ]
    },
    {
      "activityUID": "ACT-2024-0037",
      "activityName": "Cat. 7: Employee commuting",
      "griCategory": "GRI 305-3 Indirect GHG emissions (Scope 3)",
      "griSubcategory": "305.3.7",
      "scope": "3",
      "calculatedValue": 18893,
      "unit": "kgCO2e",
      "formula": "Vehicle Fleet Emissions · Distance-Based",
      "inputParameters": [
        {"parameterId":"param_distance","parameterName":"distance","value":"98400","unit":"km","parameterType":"variable"},
        {"parameterId":"param_vehicle_ef","parameterName":"vehicle_ef","value":"0.192","unit":"kg CO2e/km","parameterType":"ef_value"}
      ]
    }
  ]'::jsonb
);

-- ── 4e · BU-3  Corporate Office — HQ  (status: submitted) ────────────────────
INSERT INTO public.activity_submissions
  (project_id, business_unit_id, uploaded_by, status, file_name, calculated_data)
VALUES (
  'e0915ab8-8b06-4071-8b05-f9ad220fcb69'::uuid,
  'bu-3',
  'David Park',
  'submitted',
  'BU-OFF-2025-003_ActivityData_FY2025.xlsx',
  '[
    {
      "activityUID": "ACT-2024-0008",
      "activityName": "Table 8. Electricity purchased: Location-based",
      "griCategory": "GRI 305-2 Indirect GHG emissions (Scope 2)",
      "griSubcategory": "305.2.8",
      "scope": "2",
      "calculatedValue": 122400,
      "unit": "kgCO2e",
      "formula": "Electricity Consumption · Location-based",
      "inputParameters": [
        {"parameterId":"param_electricity_consumption","parameterName":"electricity_consumption","value":"300000","unit":"kWh","parameterType":"variable"},
        {"parameterId":"param_grid_ef","parameterName":"grid_ef","value":"0.408","unit":"kg CO2e/kWh","parameterType":"ef_value"}
      ]
    },
    {
      "activityUID": "ACT-2024-0036",
      "activityName": "Cat. 6: Business travel",
      "griCategory": "GRI 305-3 Indirect GHG emissions (Scope 3)",
      "griSubcategory": "305.3.6",
      "scope": "3",
      "calculatedValue": 32400,
      "unit": "kgCO2e",
      "formula": "Vehicle Fleet Emissions · Distance-Based",
      "inputParameters": [
        {"parameterId":"param_distance","parameterName":"distance","value":"168750","unit":"km","parameterType":"variable"},
        {"parameterId":"param_vehicle_ef","parameterName":"vehicle_ef","value":"0.192","unit":"kg CO2e/km","parameterType":"ef_value"}
      ]
    },
    {
      "activityUID": "ACT-2024-0037",
      "activityName": "Cat. 7: Employee commuting",
      "griCategory": "GRI 305-3 Indirect GHG emissions (Scope 3)",
      "griSubcategory": "305.3.7",
      "scope": "3",
      "calculatedValue": 45360,
      "unit": "kgCO2e",
      "formula": "Vehicle Fleet Emissions · Distance-Based",
      "inputParameters": [
        {"parameterId":"param_distance","parameterName":"distance","value":"236250","unit":"km","parameterType":"variable"},
        {"parameterId":"param_vehicle_ef","parameterName":"vehicle_ef","value":"0.192","unit":"kg CO2e/km","parameterType":"ef_value"}
      ]
    },
    {
      "activityUID": "ACT-2024-0031",
      "activityName": "Cat. 1: Purchased goods and services",
      "griCategory": "GRI 305-3 Indirect GHG emissions (Scope 3)",
      "griSubcategory": "305.3.1",
      "scope": "3",
      "calculatedValue": 18500,
      "unit": "kgCO2e",
      "formula": "Purchased Goods - Spend-based",
      "inputParameters": [
        {"parameterId":"param_purchase_amount","parameterName":"purchase_amount","value":"41111","unit":"USD","parameterType":"variable"},
        {"parameterId":"param_spend_ef","parameterName":"spend_ef","value":"0.45","unit":"kg CO2e/USD","parameterType":"ef_value"}
      ]
    }
  ]'::jsonb
);


-- =============================================================================
-- VERIFICATION — uncomment and run separately to confirm rows inserted
-- =============================================================================
-- SELECT id, name, year, status FROM public.projects
--  WHERE id = 'e0915ab8-8b06-4071-8b05-f9ad220fcb69'::uuid;

-- SELECT project_id, business_unit_id FROM public.project_business_units
--  WHERE project_id = 'e0915ab8-8b06-4071-8b05-f9ad220fcb69'::uuid;

-- SELECT
--   business_unit_id,
--   uploaded_by,
--   status,
--   file_name,
--   jsonb_array_length(calculated_data)                          AS activity_count,
--   (SELECT ROUND(SUM((d->>'calculatedValue')::numeric))
--      FROM jsonb_array_elements(calculated_data) d)             AS total_kgco2e
-- FROM public.activity_submissions
-- WHERE project_id = 'e0915ab8-8b06-4071-8b05-f9ad220fcb69'::uuid;
-- Expected totals: bu-1 = 2,654,659 · bu-2 = 823,798 · bu-3 = 218,660
