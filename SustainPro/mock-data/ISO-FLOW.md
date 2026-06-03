# ISO 14064-1 Activity Flow — Adding ISO alongside GRI

This document describes the change that lets the **Sustainability Architect assign ISO 14064-1 categories** (not just GRI) when creating an Activity, and the deterministic sample dataset that exercises the full ISO flow end-to-end.

---

## 1 · What changed (and why)

**Before:** Activities could only be tagged to **GRI** sub-categories (`grpCategories: ['305.1.1']`). The ISO 14064-1 report was a *derived view* — it re-grouped GRI codes into ISO rows via `griCategoryUIDs`. There was no way to author an Activity natively against an ISO category.

**Now:** Activity creation accepts **either framework**. An Activity carries a `framework` discriminator and, when ISO, an `isoCategories` array. Report Template rows can be mapped to a GRI activity **or** an ISO activity — the mapping is just an `activityUID`, so it is framework-agnostic.

```
SA · Activities · [+ Create Activity]
   Framework:  ( ) GRI    (•) ISO          ← NEW toggle
   ┌───────────────────────────────────────────────┐
   │ ISO 14064-1 category   [Category 1 ▾]          │  ← from isoStructureData.ts
   │ ISO sub-category       [1.1 Stationary … ▾]    │
   └───────────────────────────────────────────────┘
   Formula / Expression / EF mapping  … (unchanged)
```

---

## 2 · End-to-end flow (the sample dataset walks this)

```
SA creates ISO Activities                         isoActivitiesData.ts
   framework:'ISO', isoCategories:['1.1' …]
        ↓
SA creates BCA Project "FY2025 ISO 14064-1 Inventory"   seed-supabase-iso.sql
        ↓
SA assigns 3 Business Units                        BCAProjects.tsx (create dialog)
   ▸ SA picks the Report to generate (GRI / ISO / saved template)
   ▸ SA re-selects the BUs that will work on THIS project (required)
   iso-bu-1 Production Plant — Texas
   iso-bu-2 Cold Storage & Distribution — Ohio
   iso-bu-3 Head Office & Sales — Illinois
        ↓
Customer Users upload activity data per BU         seedISOActivitySubmissions.ts
   each row tagged framework:'ISO', isoSubcategory:'1.1'…
        ↓
SA generates ISO 14064-1 Report (Cat 1–6)          ISOReportTable.tsx
   aggregates by isoSubcategory  (sumISOCategory / getISOValue)
```

---

## 3 · Data model

### Activity (`ActivityDefinition` → add two optional fields)

```ts
framework?:     'GRI' | 'ISO';   // defaults to 'GRI' for every existing activity
isoCategories?: string[];        // ISO sub-category codes, e.g. ['1.1']. Empty for GRI.
```

GRI activities are untouched (`framework` is treated as `'GRI'` when absent). ISO activities set `framework:'ISO'`, leave `grpCategories: []`, and populate `isoCategories`.

### Customer submission row (`calculated_data[]`)

ISO rows carry the ISO categorisation directly, so the report never has to round-trip through GRI:

```jsonc
{
  "activityUID": "ACT-ISO-2025-0101",
  "activityName": "Stationary Combustion — Natural Gas Boilers",
  "framework": "ISO",
  "isoCategoryNumber": "1",
  "isoCategory": "Category 1: Direct GHG emissions and removals",
  "isoSubcategory": "1.1",
  "calculatedValue": 793800,
  "unit": "kgCO2e",
  "formula": "Natural Gas Combustion · Gross Emissions",
  "inputParameters": [ … ]
}
```

GRI rows keep `griCategory` / `griSubcategory`. The two are mutually exclusive per row.

### Report aggregation (both paths coexist)

`reportTemplates.ts` gains two helpers next to `sumGRIValues`:

```ts
getISOValue(data, '1.1')      // sum ISO-native rows for one sub-category
sumISOCategory(data, '1')     // sum every ISO-native row in a category
```

`ISOReportTable.tsx` computes each row as **GRI-derived + ISO-native**; one term is `0` in a single-framework project, so the legacy GRI-derived ISO report still renders exactly as before, and the new ISO-native project renders from the direct codes.

---

## 4 · The sample numbers (deterministic · FY2025)

Org total = **7,223,820 kgCO₂e ≈ 7,224 tCO₂e**

| ISO Category | kg CO₂e | Where it comes from |
|---|--:|---|
| 1 · Direct emissions & removals | 2,084,170 | NG boilers, diesel fleet+trucks, calcination, refrigerant |
| 2 · Imported energy | 3,935,280 | Grid electricity (3 BUs) + imported steam |
| 3 · Transportation | 269,120 | Inbound 3PL freight, commuting, business travel |
| 4 · Products used by org | 607,200 | Purchased goods, capital goods, waste disposal |
| 5 · Use of sold products | 262,800 | Product use-phase + end-of-life (18,000 units) |
| 6 · Other indirect | 65,250 | Outsourced operations (spend-based) |
| **Total (Cat 1–6)** | **7,223,820** | |

| Business Unit | Status | kg CO₂e |
|---|---|--:|
| iso-bu-1 · Production Plant — Texas | approved | 3,939,550 |
| iso-bu-2 · Cold Storage & Distribution — Ohio | submitted | 2,691,980 |
| iso-bu-3 · Head Office & Sales — Illinois | submitted | 592,290 |

Every value is `variable × emission factor`; see each row's `inputParameters`.

### New emission factors referenced (ISO-specific)

| EF UID | Factor | |
|---|--:|---|
| `EF-PRO-CAL-2025-001` | 0.51 kg CO₂e/kg | Industrial process — calcination |
| `EF-ENE-STM-2025-001` | 0.20 kg CO₂e/kWh | Imported steam / district heat |
| `EF-WAS-LAN-2025-001` | 450 kg CO₂e/ton | Mixed waste to landfill |
| `EF-USE-PRD-2025-001` | 12.5 kg CO₂e/unit | Product use-phase energy |
| `EF-EOL-PRD-2025-001` | 2.1 kg CO₂e/unit | Product end-of-life treatment |

Existing EFs reused: Natural Gas `1.89`, Heavy-Duty Diesel `2.69`, US Grid `0.408`, Light Duty Vehicle `0.192`, spend `0.45` / capex `0.42`, R-410A GWP100 `2088`.

---

## 5 · Files in this package (the deployable patch)

The ISO data is folded into the **single sources of truth** (`allActivities`, `businessUnitsData`) so the activity picker, the template validator, the validation dialog, the BU roster, and the customer upload flow all light up automatically — no per-consumer wiring.

| File | Lands at | Purpose |
|---|---|---|
| `patched/src/components/sa/isoStructureData.ts` | `src/components/sa/` | **NEW.** ISO 14064-1 category tree for the activity-creation picker (parallels `griStructureData.ts`). |
| `patched/src/components/sa/isoActivitiesData.ts` | `src/components/sa/` | **NEW.** `FrameworkActivityDefinition` + the 16 ISO-native sample activities. |
| `patched/src/components/sa/activitiesData.ts` | `src/components/sa/` | **PATCHED.** Adds `framework?` + `isoCategories?` to `ActivityDefinition`; merges `isoActivities` into `allActivities`. |
| `patched/src/data/isoBusinessUnits.ts` | `src/data/` | **NEW.** The 3 ISO BUs + the ISO project record. |
| `patched/src/data/businessUnitsData.ts` | `src/data/` | **PATCHED.** Merges `isoBusinessUnits` into `businessUnitsData` and `isoProject` into `projectsData`. |
| `patched/src/data/seedISOActivitySubmissions.ts` | `src/data/` | **NEW.** Drop-in `mockISOSubmissions` for the ISO project. |
| `patched/src/data/reportTemplates.ts` | `src/data/` | **PATCHED.** Adds `getISOValue` + `sumISOCategory`. |
| `patched/src/components/sa/ISOReportTable.tsx` | `src/components/sa/` | **PATCHED.** Default ISO report = GRI-derived **+** ISO-native; custom path unchanged (by `activityUID`). |
| `patched/src/components/sa/BCAProjects.tsx` | `src/components/sa/` | **PATCHED.** "Report to Generate" selector + required BU re-selection + ISO project row. |
| `patched/src/components/customer/ActivityData.tsx` | `src/components/customer/` | **PATCHED.** Customer upload stamps ISO fields (`framework`/`isoSubcategory`…) for ISO activities instead of a bogus GRI code. |
| `seed-supabase-iso.sql` | run in Supabase | **NEW.** ISO project + 3 BU links + 3 ISO submissions + 1 `report_generations` row. |

---

## 6 · Apply / deploy steps (GitHub + Vercel)

All edits are additive and backwards-compatible — existing GRI activities, projects, and reports are untouched.

1. **Copy the 4 NEW files** into the repo at the paths above (`isoStructureData.ts`, `isoActivitiesData.ts`, `isoBusinessUnits.ts`, `seedISOActivitySubmissions.ts`).
2. **Replace the 6 PATCHED files** with the versions in `patched/` (`activitiesData.ts`, `businessUnitsData.ts`, `reportTemplates.ts`, `ISOReportTable.tsx`, `BCAProjects.tsx`, `customer/ActivityData.tsx`).
3. **Run the SQL** in the Supabase SQL editor, in order: `seed-supabase.sql` → `seed-report-templates.sql` → `seed-supabase-iso.sql`. (The ISO script is safe to re-run; it deletes + re-inserts only its own `PROJ_ISO` rows.)
4. **Commit & push** — Vercel builds from the repo. No env-var or schema-migration changes are required beyond running the SQL above; the new front-end state (`reportType`/`templateId`) is client-side only.
5. **Smoke test** after deploy:
   - CDB · Activities → create an activity → toggle **ISO** → category picker shows ISO 14064-1 Cat 1–6.
   - CDB · Report Templates → fork the ISO report → **Map to Activity** lists ISO activities (`ACT-ISO-2025-…`).
   - BCA Projects → **FY2025 ISO 14064-1 Inventory** → Generate ISO Report → all six categories populate; total **7,223,820 kgCO₂e**.
   - Customer role under an ISO BU → upload → the row is stamped `framework:'ISO'` and shows under its ISO category.

> **Activity-creation UI toggle:** the data model + ISO category tree (`isoStructure`) are ready. The GRI/ISO radio in the *Create Activity* form is the one piece of presentational UI to wire in `CDBBusinessUnits.tsx`/the activity-create dialog — feed the dropdowns from `isoStructure` when ISO is selected (same shape as `griStructure`). Everything downstream already accepts ISO activities.

---

## 6a · Integration audit — what was checked end-to-end

| Touchpoint | Reads from | ISO-ready? |
|---|---|---|
| Activity-creation category picker | `isoStructure` (new) | ✅ tree provided |
| Report-template "Map to Activity" picker | `allActivities` | ✅ ISO activities merged in |
| Template validator (`validateTemplateAgainstProject`) | `businessUnitsData` + `allActivities` | ✅ ISO BUs + activities merged in |
| Template validation dialog (BU names) | `mockBusinessUnits` (= `businessUnitsData`) | ✅ ISO BUs visible |
| BCA project list + BU multiselect | `mockBusinessUnits`, hardcoded project row | ✅ ISO project + BUs present |
| Customer upload → `calculated_data` | `allActivities` (per-activity framework) | ✅ stamps ISO fields (patched) |
| Default ISO report aggregation | `calculated_data` by `isoSubcategory` + GRI fallback | ✅ `getISOValue`/`sumISOCategory` |
| Custom-template report (GRI & ISO) | `calculated_data` by `activityUID` | ✅ framework-agnostic, already worked |
| Report PDF (`reportPDF.ts`) | `calculated_data` by `activityUID` | ✅ framework-agnostic, no change |
| Supabase `activity_submissions` | seeded by `seed-supabase-iso.sql` | ✅ ISO-coded rows |

**Breakers found and fixed during this audit**

1. **Activity picker was GRI-only** — `CDBReportTemplates` reads `allActivities`, which excluded ISO activities → ISO rows could never be mapped. *Fixed* by merging `isoActivities` into `allActivities`.
2. **Validator / BU roster blind to ISO** — `templateValidation` and the validation dialog read `businessUnitsData`/`mockBusinessUnits`, which lacked the ISO BUs → every ISO mapping reported a false "blocking gap". *Fixed* by merging ISO BUs into `businessUnitsData`.
3. **Double-counted BUs** — the first-pass `BCAProjects` change spread `isoBusinessUnits` on top of `mockBusinessUnits`; once the source-of-truth merge landed, that would list each ISO BU twice. *Fixed* by reverting to `const mockBUs = mockBusinessUnits`.
4. **Live customer uploads injected a bogus GRI code** — `ActivityData` stamped only GRI fields and fell back to `305.<scope>.1` for activities with no `grpCategories` → live ISO uploads never aggregated in the ISO report and polluted GRI. *Fixed* by branching on framework and stamping `framework`/`isoCategoryNumber`/`isoCategory`/`isoSubcategory` for ISO activities (and grouping the customer preview by ISO category).

---

## 7 · BCA project creation — choose the report, then re-pick the BUs

The **Create BCA Project** dialog (`BCAProjects.tsx`) now has a required **"Report to Generate"** selector — GRI, ISO 14064-1, or any saved custom template. Whatever report the SA picks, they then **select the business units for that project** in the same dialog (now required — at least one). Those are the BUs whose customer users upload data against the chosen framework's activities, and the BUs the report aggregates over.

```
Create BCA Project
   Project Name *          [ … ]
   Year *                  [2025 ▾]
   Report to Generate *    [ ISO 14064-1 Report (Categories 1–6) ▾ ]   ← NEW
   Assign Business Units for this Report *                            ← required
     ☑ Production Plant — Texas
     ☑ Cold Storage & Distribution — Ohio
     ☑ Head Office & Sales — Illinois
```

The choice is stored on the project (`reportType` + optional `templateId`) so the **Generate Report** action knows which report the project is for. Editing a project re-opens the same selectors.

---

## 8 · Sensible defaults chosen (timed-out questions)

- **One framework per activity** (GRI *or* ISO at creation).
- **Dedicated new BCA project** for the ISO flow (existing GRI project untouched).
- **Submissions carry ISO codes directly**; GRI-derivation kept as a fallback.
- **Full Category 1–6 coverage** so the ISO report renders complete.
- **3 business units.**

Say the word if you'd rather an activity be dual-mapped to both frameworks, or have the ISO data live inside the existing Q1 2025 project — both are small changes from here.
