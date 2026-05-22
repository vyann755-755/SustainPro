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
echo "1/5  Copying seed file → src/data/seedActivitySubmissions.ts"
cp "$SCRIPT_DIR/seedActivitySubmissions.ts" "src/data/seedActivitySubmissions.ts"

# --- 2) Supabase SQL --------------------------------------------------------
echo "2/5  Copying Supabase seed → seed-supabase.sql (repo root)"
cp "$SCRIPT_DIR/seed-supabase.sql" "seed-supabase.sql"

# --- 3) formulasData.ts -----------------------------------------------------
echo "3/5  Patching src/data/formulasData.ts (adds 3 dedicated formulas)"
cp "$SCRIPT_DIR/patched/src/data/formulasData.ts" "src/data/formulasData.ts"

# --- 4) activitiesData.ts ---------------------------------------------------
echo "4/5  Patching src/components/sa/activitiesData.ts (re-binds 3 activities)"
cp "$SCRIPT_DIR/patched/src/components/sa/activitiesData.ts" "src/components/sa/activitiesData.ts"

# --- 5) ActivityData.tsx — two surgical edits via node ---------------------
echo "5/5  Patching src/components/customer/ActivityData.tsx"

node - <<'NODE'
const fs = require('fs');
const path = 'src/components/customer/ActivityData.tsx';
let src = fs.readFileSync(path, 'utf8');

// (a) Add import — idempotent
const importLine = "import { mockSubmissions as seedSubmissions } from '../../data/seedActivitySubmissions';";
if (!src.includes(importLine)) {
  const anchor = "import { businessUnitsData, projectsData, type BusinessUnit as SharedBusinessUnit, type Project as SharedProject } from '../../data/businessUnitsData';";
  if (!src.includes(anchor)) {
    console.error('❌  Could not find the businessUnitsData import line — file may have changed shape.');
    process.exit(1);
  }
  src = src.replace(anchor, anchor + '\n' + importLine);
}

// (b) Replace the entire `export const mockSubmissions = businessUnitsData.map(...);` block
//     The block runs from `export const mockSubmissions:` to the FIRST line that says `  });`
//     (its closing). We do a regex replace with the simple drop-in.
const blockRegex = /export const mockSubmissions:[\s\S]*?\n  \}\);\n/;
if (!blockRegex.test(src)) {
  // Maybe already patched? Skip silently if our marker is present.
  if (src.includes('export const mockSubmissions = seedSubmissions;')) {
    console.log('   (already patched — skipping)');
  } else {
    console.error('❌  Could not find the mockSubmissions block to replace.');
    process.exit(1);
  }
} else {
  src = src.replace(blockRegex, 'export const mockSubmissions = seedSubmissions;\n');
}

fs.writeFileSync(path, src);
console.log('   ActivityData.tsx patched ✓');
NODE

echo
echo "✅  All changes applied. Review with:"
echo "      git status"
echo "      git diff"
echo
echo "When happy, commit & push:"
echo "      git add ."
echo "      git commit -m 'feat: FY2025 interrelated mock data + dedicated formulas + Supabase seed'"
echo "      git push origin main"
echo
echo "Then run seed-supabase.sql once in your Supabase SQL editor."
