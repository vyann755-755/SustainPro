# Report Templates — Proposed Flow

This document describes the workflow we are about to build into `CDBReportTemplates.tsx` so the Sustainability Architect can fork a generated GRI/ISO report into a custom template, edit it, map any new rows to existing Activities, save it as a re-usable report type, and then use it through the existing BCA Project → Customer User → Generate Report flow.

---

## 1 · End-to-end flow

```
┌────────────────────────────────────────────────────────────────────────┐
│ SA · BCA Projects                                                       │
│   ↓ clicks Generate GRI or Generate ISO at project or BU level          │
│   ↓ system writes a row to `report_generations`                         │
│   ↓ PDF downloads                                                       │
└────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────────┐
│ SA · Report Templates  (sidebar item under CDB)                         │
│   Lists all saved templates                                             │
│   [+ Create New Template]  ← disabled until ≥ 1 row in                  │
│                              `report_generations`                       │
└────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────────┐
│ STEP 1 · General Report Information                                     │
│ ─────────────────────────────────────                                   │
│   Template Name         [free text]                                     │
│   Description           [free text, optional]                           │
│   Reporting Organisation[free text]                                     │
│   Reporting Year        [2025 ▾]                                        │
│   Person Responsible    [free text]                                     │
│                                                                         │
│   Source Report         ← dropdown listing ONLY reports actually        │
│                           generated for the chosen project/BU,          │
│                           e.g. "GRI · Q1 2025 Carbon Assessment ·       │
│                                 Project-level · 28 Jan 2025"            │
│                                                                         │
│   Categories to Edit    ← multi-select dropdown of the source           │
│                           report's categories. The SA only picks the    │
│                           ones they want to edit; the rest carry        │
│                           through unchanged.                            │
└────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────────┐
│ STEP 2 · Editor                                                         │
│ ──────────────                                                          │
│   The full source report structure is shown. Categories the SA          │
│   marked "to edit" are unlocked; the rest are read-only.                │
│                                                                         │
│   For each unlocked category:                                           │
│     • Inline-edit category title  (e.g. "GRI 305-1 …" → "Plant Scope 1")│
│     • For each row inside:                                              │
│         - Inline-edit row label (e.g. "Table-1 : Stationary…"           │
│                                       → "Plant Boilers")                │
│         - "Map to Activity" dropdown  ←─┐                               │
│           (existing activities only, ──┼─ Required for any              │
│            no inline creation)         │  renamed or added row          │
│     • [+ Add Row]                       │                               │
│         - Free-text row label           │                               │
│         - "Map to Activity" required ───┘                               │
│                                                                         │
│   Locked categories show "🔒 Source structure preserved"                │
└────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────────┐
│ STEP 3 · Validation                                                     │
│ ──────────────────                                                      │
│   On [Save Template] click, the system checks:                          │
│                                                                         │
│   ✅  Every renamed-or-added row has an `activityUID`                   │
│        → if not, show "X rows need to be mapped to an Activity:"        │
│                       [row]  → [pick activity ▾]                        │
│                       Cannot save until all are mapped.                 │
│                                                                         │
│   ✅  Mapped activities exist in `allActivities`                        │
│        → if not (rare), banner: "Activity ACT-XXX no longer exists.     │
│                                   Go to CDB · Activities to create it." │
│                                                                         │
│   ✅  Template name unique within the project                           │
└────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────────┐
│ STEP 4 · Save  →  row written to `report_templates`                     │
│                                                                         │
│   Success toast: "Template 'ABC Manufacturing GRI' saved."              │
│   Next-step prompt:                                                     │
│      "To use this template:                                             │
│         1. Open a BCA Project that has the activities you mapped.       │
│         2. Assign business units.                                       │
│         3. Customer users upload their data against those activities.   │
│         4. Come back to BCA Projects and generate this report."         │
└────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Using the template                                                      │
│ ─────────────────                                                       │
│   ★ BCA Projects list · Action column · Generate Report dropdown:       │
│       ▸ Generate GRI Report                                             │
│       ▸ Generate ISO Report                                             │
│       ▸ Generate "ABC Manufacturing GRI"  ← new custom templates appear │
│                                                                         │
│   ★ Inside a BU · Report tab:                                           │
│       Report type: [GRI ▾]                                              │
│                    [─ GRI ─]                                            │
│                    [─ ISO ─]                                            │
│                    [─ ABC Manufacturing GRI ─]  ← preview + Export PDF  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2 · Data model

### New tables (in `seed-supabase.sql`)

```sql
-- 5. Log every GRI/ISO report generation event so we can gate
--    template creation on "the SA has actually run a report"
CREATE TABLE IF NOT EXISTS public.report_generations (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id        UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    business_unit_id  TEXT,                -- NULL = project-level (all BUs)
    report_type       TEXT NOT NULL,       -- 'GRI' | 'ISO' | template-id
    generated_by      TEXT NOT NULL,
    generated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Saved report templates (custom forks of GRI/ISO)
CREATE TABLE IF NOT EXISTS public.report_templates (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                TEXT NOT NULL,
    description         TEXT,
    base_type           TEXT NOT NULL,       -- 'GRI' | 'ISO'  (which structure it forked)
    reporting_org_name  TEXT,
    reporting_year      INTEGER,
    person_responsible  TEXT,
    source_project_id   UUID,                -- the project the source report came from
    source_business_unit_id TEXT,            -- the BU, NULL if project-level
    template_structure  JSONB NOT NULL,      -- see schema below
    created_by          TEXT NOT NULL,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### `template_structure` JSONB schema

```json
{
  "sections": [
    {
      "id": "ghg-305",
      "originalTitle": "GRI 305-1 Direct GHG emissions (Scope 1)",
      "customTitle": null,
      "unit": "kgCO2e",
      "isLocked": true,
      "rows": [
        {
          "id": "305.1.1",
          "originalLabel": "Table-1 : Stationary Combustion",
          "customLabel": null,
          "activityUID": "ACT-2024-0001",
          "isCustom": false
        },
        {
          "id": "custom-1736000000-1",
          "originalLabel": null,
          "customLabel": "Backup Generator — Diesel",
          "activityUID": "ACT-2024-0002",
          "isCustom": true
        }
      ]
    }
  ]
}
```

Rules:
- `isLocked: true` → category was not in the SA's "Categories to Edit" multi-select. Rows inside cannot be renamed/added but still render from the base template.
- `customLabel: null` → use `originalLabel`.
- `activityUID: null` → row is **invalid** for saving. The form blocks save.
- `isCustom: true` → row was added by the SA (not in the source template).

---

## 3 · UI surfaces being added / changed

| File | Change |
|---|---|
| `src/components/sa/CDBReportTemplates.tsx` | **Rewrite.** Two views: list of templates + the create/edit wizard described above. |
| `src/components/sa/BCAProjects.tsx` | Log a row to `report_generations` on every PDF export. Extend "Generate Report" dropdown to also list custom templates from `report_templates`. |
| `src/components/sa/BusinessUnitDataView.tsx` | Replace separate GRI / ISO tabs with one **Report** tab containing a dropdown. |
| `src/data/reportTemplates.ts` | Add `applyCustomTemplate(baseTemplate, customStructure)` helper that merges renames + custom rows into the rendered structure. |
| `src/components/sa/reportPDF.ts` | `generateGRIPdf` / `generateISOPdf` accept an optional `customTemplate` arg. |
| `src/components/sa/GRIReportTable.tsx` · `ISOReportTable.tsx` | Accept the same optional `customTemplate` arg, render with the merged structure. |

A new component `src/components/sa/ActivityPickerDialog.tsx` is added for the "Map to Activity" modal.

---

## 4 · Activity mapping (the bridge to formulas + EFs)

When the SA maps a new or renamed row to an existing Activity (e.g. `ACT-2024-0001 Stationary Combustion`), that Activity already has its formula + EF mappings inside `allActivities`. So no extra wiring is needed downstream — at report generation time, the Activity UID is looked up against the customer's `activity_submissions.calculated_data` to retrieve the calculated value.

If the SA can't find a suitable Activity:
1. The "Map to Activity" dropdown has a footer link: "Don't see your activity? **Create one in CDB · Activities**"
2. The link opens the existing Activity creation flow in a new tab
3. SA finishes Activity creation → comes back → refresh the dropdown → picks the new Activity

That keeps the existing Activity creation flow as the single source of truth (no new code path for creating activities).

---

## 5 · Gating

- **Create Template button** disabled when `report_generations` is empty.
- Tooltip on the disabled button: "Generate at least one GRI or ISO report first."
- **Source Report dropdown** in Step 1 is fed from `report_generations` filtered by the chosen project (and BU, if any).

---

## 6 · Open questions you might want to answer later (we will sensibly default for v1)

1. **Templates per scope** — for v1, every template is global (visible to any SA in this tenant). If you want per-client scoping we can add a `client_id` column later.
2. **Versioning** — for v1, editing a template overwrites it. No history. Most enterprise apps add a `version_id` column later; easy to retrofit.
3. **Locked-category rename** — for v1, the SA must add the category to "Categories to Edit" to rename it. If you'd rather allow renaming-only inline anywhere, say the word.
