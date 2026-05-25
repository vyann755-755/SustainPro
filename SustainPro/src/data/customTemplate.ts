/**
 * Custom report template structure shared by the editor, in-app preview tables
 * and PDF generators.
 *
 * Stored in Supabase: report_templates.template_structure (JSONB)
 */

export interface CustomTemplateRow {
  /** Original GRI sub-category id for non-custom rows (e.g. "305.1.1") OR a
   *  generated id like "custom-<ts>-<n>" for SA-added rows.                   */
  id: string;
  /** Source label from the base template (immutable). null for custom rows. */
  originalLabel: string | null;
  /** SA-provided rename. null = use originalLabel.                          */
  customLabel: string | null;
  /** Mapped Activity UID — required for any renamed or custom row.          */
  activityUID: string | null;
  /** true = SA added this row; false = inherited from base template.        */
  isCustom: boolean;
}

export interface CustomTemplateSection {
  /** Stable id derived from base section header (e.g. "ghg-scope-1").       */
  id: string;
  originalTitle: string;
  customTitle: string | null;
  /** "kgCO2e" | "GJ" | "ML" | "ton" | custom                                */
  unit: string;
  /** Locked → SA didn't include this section in "Categories to Edit". Rows
   *  inside are read-only and rendered straight from the base template.   */
  isLocked: boolean;
  rows: CustomTemplateRow[];
}

export interface CustomTemplate {
  sections: CustomTemplateSection[];
}

/** ─── Validators ────────────────────────────────────────────────────────── */

export interface UnmappedRow {
  sectionTitle: string;
  rowId: string;
  rowLabel: string;
}

/** Returns the list of rows that need an Activity mapping (renamed or
 *  custom rows where activityUID is null).                                   */
export function findUnmappedRows(t: CustomTemplate): UnmappedRow[] {
  const out: UnmappedRow[] = [];
  for (const s of t.sections) {
    if (s.isLocked) continue;
    for (const r of s.rows) {
      const needsMapping = r.isCustom || !!r.customLabel;
      if (needsMapping && !r.activityUID) {
        out.push({
          sectionTitle: s.customTitle ?? s.originalTitle,
          rowId: r.id,
          rowLabel: r.customLabel ?? r.originalLabel ?? r.id,
        });
      }
    }
  }
  return out;
}

/** Effective label for a row (custom wins, else original). */
export function rowLabel(r: CustomTemplateRow): string {
  return r.customLabel ?? r.originalLabel ?? r.id;
}

/** Effective title for a section. */
export function sectionTitle(s: CustomTemplateSection): string {
  return s.customTitle ?? s.originalTitle;
}
