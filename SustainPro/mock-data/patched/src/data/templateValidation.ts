/**
 * SustainPro — Report Template Validation
 * =========================================
 * Pre-flight check before generating a report from a custom template.
 *
 * Rule (Option B from the design discussion):
 *   A template can be generated for a BCA project only if every Activity the
 *   template references is assigned to at least one BU in that project.
 *
 * This is the same activity↔BU wiring that the Customer User upload flow
 * relies on, so passing this check guarantees that customer-uploaded values
 * will actually flow into the report.
 */

import { businessUnitsData } from './businessUnitsData';
import type { CustomTemplate } from './customTemplate';
import { allActivities } from '../components/sa/activitiesData';

export interface ActivityGap {
  activityUID: string;
  activityName: string;
  /** BUs in the project that DO have this activity. */
  coveredBUs: string[];
  /** BUs in the project that do NOT have this activity (these will show empty). */
  uncoveredBUs: string[];
}

export interface TemplateValidation {
  /** true → no required activity is completely missing from the project's BUs.
   *  Partial coverage (some BUs cover, others don't) is allowed and surfaced  *
   *  via `partialCoverage` so SA can see it but it doesn't block.            */
  canGenerate: boolean;
  /** Activities that are not present on ANY of the project's BUs (blocker). */
  blockingGaps: ActivityGap[];
  /** Activities that are present on some BUs but not all (warning).         */
  partialCoverage: ActivityGap[];
  /** Project has no BUs assigned at all. */
  hasNoBUs: boolean;
}

/** Extract every activityUID a template references. */
export function getTemplateActivityUIDs(t: CustomTemplate): string[] {
  const uids = new Set<string>();
  t.sections.forEach((s) =>
    s.rows.forEach((r) => {
      if (r.activityUID) uids.add(r.activityUID);
    })
  );
  return Array.from(uids);
}

/** True if business unit `buId` has activity `activityUID` assigned. */
function buHasActivity(buId: string, activityUID: string): boolean {
  const bu = businessUnitsData.find((b) => b.id === buId);
  if (!bu) return false;
  return bu.activities.some((a) => a.uid === activityUID);
}

/** Friendly name lookup, falls back to UID. */
function activityName(uid: string): string {
  const a = allActivities.find((x) => x.uid === uid);
  return a?.name ?? uid;
}

export function validateTemplateAgainstProject(
  template: CustomTemplate,
  projectBUIds: string[],
): TemplateValidation {
  if (projectBUIds.length === 0) {
    return { canGenerate: false, blockingGaps: [], partialCoverage: [], hasNoBUs: true };
  }

  const required = getTemplateActivityUIDs(template);
  const blockingGaps: ActivityGap[] = [];
  const partialCoverage: ActivityGap[] = [];

  for (const uid of required) {
    const covered: string[] = [];
    const uncovered: string[] = [];
    for (const buId of projectBUIds) {
      if (buHasActivity(buId, uid)) covered.push(buId);
      else uncovered.push(buId);
    }
    const gap: ActivityGap = {
      activityUID: uid,
      activityName: activityName(uid),
      coveredBUs: covered,
      uncoveredBUs: uncovered,
    };
    if (covered.length === 0) blockingGaps.push(gap);
    else if (uncovered.length > 0) partialCoverage.push(gap);
  }

  return {
    canGenerate: blockingGaps.length === 0,
    blockingGaps,
    partialCoverage,
    hasNoBUs: false,
  };
}
