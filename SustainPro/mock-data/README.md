# SustainPro — Interrelated Mock Data Package

A deterministic, end-to-end seed dataset for the SustainPro app
(`vyann755-755/SustainPro`). Replaces the existing random
`Math.random()` mock data with realistic, interrelated values that
flow cleanly from **Emission Factor → Formula → Activity →
Customer-uploaded Activity Submission → BCA Project → GRI / ISO
Report**.

## What's in the box

| File | Purpose | Where it goes |
|---|---|---|
| `seedActivitySubmissions.ts` | Drop-in `mockSubmissions` array (deterministic). | Copy to `src/data/seedActivitySubmissions.ts`; replace the `mockSubmissions` block in `src/components/customer/ActivityData.tsx` (lines 198–250) with `export const mockSubmissions = seedSubmissions;`. |
| `dedicatedFormulas.ts` | Three new Master DB formulas + EFs and the activity re-bindings. | Append `newFormulas` to `src/data/formulasData.ts`; apply `activityRemap` to entries in `src/components/sa/activitiesData.ts`; add the three EFs to your Master DB EF table. |
| `seed-supabase.sql` | Inserts into `projects`, `project_business_units`, `activity_submissions`. | Run in Supabase SQL Editor against the project referenced in `src/utils/supabase/info.ts`. |
| `../Mock Data Spec.html` | Visual preview of the full data spine + customer + SA views. | Open in browser to validate before importing. |

## Data spine — one client, one project, one year

```
Client Org (Acme Corp)
  └── BCA Project "Q1 2025 Carbon Assessment" (PROJ_1, FY2025)
         ├── BU-MFG-2025-001  Manufacturing Plant — North America      (Scopes 1, 2, 3)
         ├── BU-WHS-2025-002  Distribution Warehouse — East Coast       (Scopes 2, 3)
         └── BU-OFF-2025-003  Corporate Office — HQ                      (Scopes 2, 3)
```

All three BUs already exist in `src/data/businessUnitsData.ts` (bu-1, bu-2, bu-3) and are already assigned to `PROJ_1_UUID`. We only seed the **submissions** for those three.

## Numbers in the seed (full-year 2025, kg CO₂e)

|  | Manufacturing | Warehouse | Office | **Project total** |
|---|--:|--:|--:|--:|
| Scope 1 (305.1.x) | 585,502 | — | — | **585,502** |
| Scope 2 (305.2.x) | 1,734,000 / 127,500 | 612,000 / 45,000 | 122,400 / 9,000 | **2,468,400 / 181,500** |
| Scope 3 (305.3.x) | 335,157 | 211,798 | 96,260 | **643,215** |
| **Total (location-based)** | **2,654,659** | **823,798** | **218,660** | **3,697,117** |
| **Total (market-based)** | **1,048,159** | **256,798** | **105,260** | **1,410,217** |

Numbers are deterministic — every refresh shows the same totals; every report PDF is reproducible.

## Status mix (so the table doesn't look monotone)

- Manufacturing → **approved** (with reviewer comment from SA)
- Warehouse → **submitted** (awaiting SA review)
- Office → **submitted** (awaiting SA review)

This makes the "View Submitted Data" tab visually richer without inventing a draft/approval workflow.

## How the report uses this

The SA's GRI Report Table (`src/components/sa/GRIReportTable.tsx`)
fetches `calculated_data` from `activity_submissions` per BU and
aggregates by `griSubcategory` (e.g. `305.2.8`) into BU columns + a
project total. With this seed in place:

- Open BCA Project "Q1 2025 Carbon Assessment" → **Generate GRI Report** → PDF shows all 3 BU columns populated.
- Open the BU drilldown → only that BU's column is non-zero.
- ISO report uses the same `calculated_data`, re-grouped into ISO 14064-1 categories 1–6.

## Notes / caveats

- **Dedicated formulas applied** (see `dedicatedFormulas.ts`): refrigerant
  uses `FORM-REF-FUG-2024-001` (mass × GWP100); purchased goods uses
  `FORM-PUR-GOO-2024-001` (USD × 0.45); capital goods uses
  `FORM-CAP-GOO-2024-001` (USD × 0.42). Totals are unchanged — only the
  inputs and formula references swap.
- Market-based electricity uses a residual-mix assumption of
  0.030 kgCO₂e/kWh (RECs / wind PPA premium). Adjust `EF-ENE-2024-0002`
  in the EF table if your tenant uses a different value.
