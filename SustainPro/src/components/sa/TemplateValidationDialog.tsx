/**
 * TemplateValidationDialog
 * ========================
 * Shown when SA tries to generate a custom report template but the BCA project
 * doesn't have the required activities assigned to its Business Units.
 *
 * Two modes:
 *   • Blocking (canGenerate === false) — red icon, "Generate" disabled.
 *   • Warning (partialCoverage exists)  — amber icon, "Generate Anyway" allowed.
 *
 * Both modes link the SA to CDB · Business Units to fix the wiring.
 */

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AlertTriangle, AlertCircle, Building, ArrowRight, ExternalLink } from 'lucide-react';
import type { TemplateValidation } from '../../data/templateValidation';
import { mockBusinessUnits } from './CDBBusinessUnits';

interface Props {
  validation: TemplateValidation | null;
  templateName: string;
  projectName: string;
  onClose: () => void;
  onProceedAnyway: () => void;
  onGoToBUSettings: () => void;
}

const buName = (id: string) => mockBusinessUnits.find((b) => b.id === id)?.name || id;

export function TemplateValidationDialog({
  validation, templateName, projectName, onClose, onProceedAnyway, onGoToBUSettings,
}: Props) {
  if (!validation) return null;
  const isBlocking = !validation.canGenerate;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {isBlocking ? (
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
            ) : (
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
            )}
            <div>
              <DialogTitle>
                {isBlocking ? 'Cannot generate report' : 'Partial data coverage'}
              </DialogTitle>
              <DialogDescription>
                Template <strong>"{templateName}"</strong> · Project <strong>{projectName}</strong>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 my-3">
          {validation.hasNoBUs && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-900">
                <strong>No Business Units assigned.</strong> Open the project and assign at least
                one Business Unit before generating reports.
              </p>
            </div>
          )}

          {validation.blockingGaps.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-red-900 mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {validation.blockingGaps.length} activity(s) not assigned to any BU in this project
              </h4>
              <div className="border border-red-200 rounded-md divide-y divide-red-100">
                {validation.blockingGaps.map((g) => (
                  <div key={g.activityUID} className="p-3 bg-red-50/40">
                    <div className="font-mono text-xs text-red-800">{g.activityUID}</div>
                    <div className="text-sm text-slate-900">{g.activityName}</div>
                    <div className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                      <Building className="h-3 w-3" />
                      Needed in {g.uncoveredBUs.length} BU(s):
                      <span className="ml-1">
                        {g.uncoveredBUs.map((id) => buName(id)).join(', ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {validation.partialCoverage.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {validation.partialCoverage.length} activity(s) only in some BUs
              </h4>
              <div className="border border-amber-200 rounded-md divide-y divide-amber-100">
                {validation.partialCoverage.map((g) => (
                  <div key={g.activityUID} className="p-3 bg-amber-50/40">
                    <div className="font-mono text-xs text-amber-800">{g.activityUID}</div>
                    <div className="text-sm text-slate-900">{g.activityName}</div>
                    <div className="text-xs text-slate-700 mt-1 flex flex-wrap items-center gap-1">
                      <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-800 text-xs">
                        Covered: {g.coveredBUs.map((id) => buName(id)).join(', ')}
                      </Badge>
                      <Badge variant="outline" className="bg-slate-50 border-slate-300 text-slate-700 text-xs">
                        Missing in: {g.uncoveredBUs.map((id) => buName(id)).join(', ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                You can generate the report anyway — uncovered BUs will appear with empty values.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-3 gap-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button variant="outline" onClick={onGoToBUSettings}>
            <ExternalLink className="h-4 w-4 mr-1" />
            Open CDB · Business Units
          </Button>
          {!isBlocking && (
            <Button onClick={onProceedAnyway} className="bg-amber-600 hover:bg-amber-700">
              Generate Anyway
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
