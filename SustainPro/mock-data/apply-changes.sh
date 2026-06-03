#!/usr/bin/env bash
# =============================================================================
# SustainPro · apply-changes.sh
# =============================================================================
# One-shot script to apply the FY2025 mock-data + dedicated-formulas package
# to your local clone of vyann755-755/SustainPro.
#
# Run from inside your repo root (the folder that contains package.json).
#
# It will:
#   1) Copy the new seed file to src/data/seedActivitySubmissions.ts
#   2) Copy seed-supabase.sql to the repo root
#   3) Overwrite src/data/formulasData.ts (adds 3 new formulas)
#   4) Overwrite src/components/sa/activitiesData.ts (re-binds 3 activities)
#   5) Patch src/components/customer/ActivityData.tsx (import + use seed)
#   6) Show git status so you can review before commit
#
# Re-run safe — every step is idempotent.
# =============================================================================

set -euo pipefail

# --- Locate the source files (this script ships alongside them) -------------
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"

# Sanity check: are we in a SustainPro repo?
if [[ ! -f "package.json" || ! -d "src/components/customer" ]]; then
  echo "❌  Not inside the SustainPro repo. cd into the folder that contains"
  echo "    package.json and src/, then re-run this script."
  exit 1
fi

echo "📦  Applying SustainPro FY2025 mock-data package..."
echo

# --- 1) New seed file -------------------------------------------------------
echo "1/10 Copying seed file → src/data/seedActivitySubmissions.ts"
cp "$SCRIPT_DIR/seedActivitySubmissions.ts" "src/data/seedActivitySubmissions.ts"

# --- 2) Supabase SQL --------------------------------------------------------
echo "2/13 Copying Supabase seed → seed-supabase.sql (repo root)"
cp "$SCRIPT_DIR/seed-supabase.sql" "seed-supabase.sql"

# --- 2b) Report Templates schema -------------------------------------------
echo "2b/13 Copying Report Templates SQL → seed-report-templates.sql"
cp "$SCRIPT_DIR/seed-report-templates.sql" "seed-report-templates.sql"

# --- 2c) ISO 14064-1 flow SQL ----------------------------------------------
echo "2c/16 Copying ISO flow SQL → seed-supabase-iso.sql"
cp "$SCRIPT_DIR/seed-supabase-iso.sql" "seed-supabase-iso.sql"

# --- 3) formulasData.ts -----------------------------------------------------
echo "3/10 Patching src/data/formulasData.ts (adds 3 dedicated formulas)"
cp "$SCRIPT_DIR/patched/src/data/formulasData.ts" "src/data/formulasData.ts"

# --- 4) activitiesData.ts ---------------------------------------------------
echo "4/16 Patching src/components/sa/activitiesData.ts (dedicated formulas + ISO merge)"
cp "$SCRIPT_DIR/patched/src/components/sa/activitiesData.ts" "src/components/sa/activitiesData.ts"

# --- 5) BCAProjects.tsx — switch hardcoded project IDs to UUIDs + 2025 -----
echo "5/10 Patching src/components/sa/BCAProjects.tsx (project IDs → UUIDs, year 2025, Supabase-backed PDF)"
cp "$SCRIPT_DIR/patched/src/components/sa/BCAProjects.tsx" "src/components/sa/BCAProjects.tsx"

# --- 6) GRIReportTable.tsx — full template-based in-app report ----------
echo "6/11 Patching src/components/sa/GRIReportTable.tsx (full 4-section in-app report)"
cp "$SCRIPT_DIR/patched/src/components/sa/GRIReportTable.tsx" "src/components/sa/GRIReportTable.tsx"

# --- 7) ISOReportTable.tsx — NEW component ---------------------------------
echo "7/11 Adding NEW src/components/sa/ISOReportTable.tsx (in-app ISO report)"
cp "$SCRIPT_DIR/patched/src/components/sa/ISOReportTable.tsx" "src/components/sa/ISOReportTable.tsx"

# --- 8) BusinessUnitDataView.tsx — 3 tabs (Uploaded / GRI / ISO) ----------
echo "8/11 Patching src/components/sa/BusinessUnitDataView.tsx (3 tabs, per-tab export)"
cp "$SCRIPT_DIR/patched/src/components/sa/BusinessUnitDataView.tsx" "src/components/sa/BusinessUnitDataView.tsx"

# --- 9) reportTemplates.ts — NEW shared GRI/ISO row structure -------------
echo "9/13 Adding NEW src/data/reportTemplates.ts (shared GRI/ISO row templates)"
cp "$SCRIPT_DIR/patched/src/data/reportTemplates.ts" "src/data/reportTemplates.ts"

# --- 9b) customTemplate.ts — NEW types for the report template editor ----
echo "9b/15 Adding NEW src/data/customTemplate.ts (custom template schema + helpers)"
cp "$SCRIPT_DIR/patched/src/data/customTemplate.ts" "src/data/customTemplate.ts"

# --- 9c) templateValidation.ts — NEW BU/activity coverage check ----------
echo "9c/15 Adding NEW src/data/templateValidation.ts (BU/activity validation)"
cp "$SCRIPT_DIR/patched/src/data/templateValidation.ts" "src/data/templateValidation.ts"

# --- 10) reportPDF.ts — NEW shared GRI/ISO PDF generators -----------------
echo "10/13 Adding NEW src/components/sa/reportPDF.ts (shared PDF generators)"
cp "$SCRIPT_DIR/patched/src/components/sa/reportPDF.ts" "src/components/sa/reportPDF.ts"

# --- 10b) CDBReportTemplates.tsx — full wizard (Report Templates module) --
echo "10b/15 Patching src/components/sa/CDBReportTemplates.tsx (template wizard)"
cp "$SCRIPT_DIR/patched/src/components/sa/CDBReportTemplates.tsx" "src/components/sa/CDBReportTemplates.tsx"

# --- 10c) TemplateValidationDialog.tsx — NEW pre-gen validation modal ----
echo "10c/15 Adding NEW src/components/sa/TemplateValidationDialog.tsx (validation modal)"
cp "$SCRIPT_DIR/patched/src/components/sa/TemplateValidationDialog.tsx" "src/components/sa/TemplateValidationDialog.tsx"

# --- 11) Customer ActivityData.tsx (full file — incl. ISO upload stamping) --
echo "11/16 Patching src/components/customer/ActivityData.tsx (GRI seed swap + ISO upload stamping)"
cp "$SCRIPT_DIR/patched/src/components/customer/ActivityData.tsx" "src/components/customer/ActivityData.tsx"

# --- 12) ISO 14064-1 framework files (NEW) ---------------------------------
echo "12/16 Adding NEW src/components/sa/isoStructureData.ts (ISO category tree)"
cp "$SCRIPT_DIR/patched/src/components/sa/isoStructureData.ts" "src/components/sa/isoStructureData.ts"

echo "13/16 Adding NEW src/components/sa/isoActivitiesData.ts (16 ISO activities)"
cp "$SCRIPT_DIR/patched/src/components/sa/isoActivitiesData.ts" "src/components/sa/isoActivitiesData.ts"

echo "14/16 Adding NEW src/data/isoBusinessUnits.ts (ISO BUs + project)"
cp "$SCRIPT_DIR/patched/src/data/isoBusinessUnits.ts" "src/data/isoBusinessUnits.ts"

echo "15/16 Adding NEW src/data/seedISOActivitySubmissions.ts (ISO uploads)"
cp "$SCRIPT_DIR/patched/src/data/seedISOActivitySubmissions.ts" "src/data/seedISOActivitySubmissions.ts"

# --- 16) businessUnitsData.ts — merge ISO BUs + project into the SoT --------
echo "16/16 Patching src/data/businessUnitsData.ts (merges ISO BUs + project)"
cp "$SCRIPT_DIR/patched/src/data/businessUnitsData.ts" "src/data/businessUnitsData.ts"

echo
echo "✅  All changes applied. Review with:"
echo "      git status"
echo "      git diff"
echo
echo "When happy, commit & push:"
echo "      git add ."
echo "      git commit -m 'feat: ISO 14064-1 activity + report-template flow (FY2025)'"
echo "      git push origin main"
echo
echo "Then run the SQL once in your Supabase SQL editor, in order:"
echo "      seed-supabase.sql  →  seed-report-templates.sql  →  seed-supabase-iso.sql"
