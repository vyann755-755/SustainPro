/**
 * CDBReportTemplates — Report Template Builder
 * =============================================
 * Sustainability Architect can:
 *   1) See list of saved templates.
 *   2) Create a new template by forking a previously-generated GRI/ISO report.
 *   3) Edit category titles, row labels, add rows, map rows to existing Activities.
 *   4) Save the template — appears alongside GRI/ISO in every "Generate Report" surface.
 *
 * Schema lives in Supabase:
 *   report_generations (gating — must have at least one generated report)
 *   report_templates   (saved templates)
 *
 * See `mock-data/REPORT-TEMPLATES-FLOW.md` for the full proposed flow.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner@2.0.3';
import {
  FileText, Save, Plus, Trash2, Edit2, Lock, AlertCircle, CheckCircle2,
  ChevronLeft, ExternalLink, MapPin
} from 'lucide-react';
import { supabase } from '../../utils/supabase/client';
import {
  griGHGTemplate, griEnergyTemplate, griWaterTemplate, griWasteTemplate, isoTemplate,
  type GRIRow,
} from '../../data/reportTemplates';
import {
  type CustomTemplate, type CustomTemplateSection, type CustomTemplateRow,
  findUnmappedRows, rowLabel, sectionTitle,
} from '../../data/customTemplate';
import { allActivities } from './activitiesData';

// ─── Saved template (Supabase row) ──────────────────────────────────────────
interface ReportTemplateRow {
  id: string;
  name: string;
  description: string | null;
  base_type: 'GRI' | 'ISO';
  reporting_org_name: string | null;
  reporting_year: number | null;
  person_responsible: string | null;
  source_project_id: string | null;
  source_business_unit_id: string | null;
  template_structure: CustomTemplate;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ─── Source report (one row from report_generations) ────────────────────────
interface ReportGeneration {
  id: string;
  project_id: string;
  business_unit_id: string | null;
  report_type: 'GRI' | 'ISO' | string;
  generated_by: string;
  generated_at: string;
}

interface Project { id: string; name: string; year: number }

// ============================================================================
//  Build the initial CustomTemplate from a base type (GRI / ISO).
// ============================================================================
// Split a GRI template array into multiple sections at each scope-header row.
// Each scope-header becomes its own selectable section in the editor.
function splitByScopeHeaders(rows: GRIRow[], idPrefix: string, unit: string): CustomTemplateSection[] {
  const sections: CustomTemplateSection[] = [];
  let current: CustomTemplateSection | null = null;
  rows.forEach((r) => {
    if (r.type === 'scope-header') {
      // Flush previous section
      if (current && current.rows.length > 0) sections.push(current);
      current = {
        id: `${idPrefix}-${sections.length + 1}`,
        originalTitle: r.name.trim(),
        customTitle: null,
        unit,
        isLocked: false,
        rows: [],
      };
    } else if (r.type === 'category' && current) {
      current.rows.push({
        id: r.category || r.name,
        originalLabel: r.name,
        customLabel: null,
        activityUID: null,
        isCustom: false,
      });
    }
    // 'sub-header' rows are flattened into the current section — they're
    // structural grouping inside Energy/Water/Waste reports but the SA can
    // treat the whole scope-header section as one editable unit.
  });
  if (current && current.rows.length > 0) sections.push(current);
  return sections;
}

function buildInitialTemplate(baseType: 'GRI' | 'ISO'): CustomTemplate {
  if (baseType === 'ISO') {
    // One section per ISO Category (1 through 6) so SA can pick at the right
    // granularity. Each section gets all the category's sub-rows.
    const sections: CustomTemplateSection[] = [];
    let current: CustomTemplateSection | null = null;
    isoTemplate.forEach((r) => {
      if (r.type === 'category-header') {
        if (current && current.rows.length > 0) sections.push(current);
        current = {
          id: `iso-cat-${r.number || sections.length + 1}`,
          originalTitle: `${r.number ? 'Category ' + r.number + ': ' : ''}${r.name.replace(/^Category \d+:?\s*/, '')}`,
          customTitle: null,
          unit: 'kgCO2e',
          isLocked: false,
          rows: [],
        };
        // If the category-header itself has no number (Category 6 case), still capture as a row
        if (!r.number && r.griCategoryUIDs) {
          current.rows.push({
            id: 'cat6-aggregate',
            originalLabel: r.name,
            customLabel: null,
            activityUID: null,
            isCustom: false,
          });
        }
      } else if (r.type === 'sub-row' && current && r.number) {
        current.rows.push({
          id: r.number,
          originalLabel: `${r.number} ${r.name}`,
          customLabel: null,
          activityUID: null,
          isCustom: false,
        });
      }
    });
    if (current && current.rows.length > 0) sections.push(current);
    return { sections };
  }
  // GRI — split each report by scope-header rows for finer-grained selection
  return {
    sections: [
      ...splitByScopeHeaders(griGHGTemplate,    'ghg',    'kgCO2e'),  // 305-1, 305-2, 305-3
      ...splitByScopeHeaders(griEnergyTemplate, 'energy', 'GJ'),       // 302-1
      ...splitByScopeHeaders(griWaterTemplate,  'water',  'ML'),       // 303-3, 303-4, 303-5
      ...splitByScopeHeaders(griWasteTemplate,  'waste',  'ton'),      // 306-4, 306-5
    ],
  };
}

// ============================================================================
//                        CDBReportTemplates Component
// ============================================================================
export const CDBReportTemplates = () => {
  const [view, setView] = useState<'list' | 'create'>('list');
  const [templates, setTemplates] = useState<ReportTemplateRow[]>([]);
  const [generations, setGenerations] = useState<ReportGeneration[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<ReportTemplateRow | null>(null);

  // ── Fetch templates + generations + projects ─────────────────────────────
  const refresh = async () => {
    setLoading(true);
    try {
      const [t, g, p] = await Promise.all([
        supabase.from('report_templates').select('*').order('created_at', { ascending: false }),
        supabase.from('report_generations').select('*').order('generated_at', { ascending: false }),
        supabase.from('projects').select('id, name, year'),
      ]);
      if (t.data) setTemplates(t.data as ReportTemplateRow[]);
      if (g.data) setGenerations(g.data as ReportGeneration[]);
      if (p.data) setProjects(p.data as Project[]);
    } catch (e) {
      console.error('refresh failed', e);
      toast.error('Failed to load report templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  // ── Gating: at least one report generation must exist ────────────────────
  const canCreate = generations.length > 0;

  // ── List view ────────────────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
              <FileText className="h-6 w-6 text-emerald-600" />
              Report Templates
            </h2>
            <p className="text-slate-500">
              Custom GRI/ISO report templates forked from generated reports. Available to all SAs.
            </p>
          </div>
          <Button
            onClick={() => { setEditingTemplate(null); setView('create'); }}
            disabled={!canCreate}
            className="bg-emerald-600 hover:bg-emerald-700"
            title={canCreate ? '' : 'Generate at least one GRI or ISO report first'}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Report Template
          </Button>
        </div>

        {!canCreate && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 mt-0.5 text-amber-600 flex-shrink-0" />
            <p className="text-sm">
              <strong>Generate a report first.</strong> Open a BCA Project → click Generate GRI or
              Generate ISO Report. Once generated, you can fork it into a custom template here.
            </p>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Saved Templates ({templates.length})</CardTitle>
            <CardDescription>
              These appear alongside GRI/ISO in every "Generate Report" dropdown.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-slate-500 text-center py-8">Loading…</p>
            ) : templates.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                No templates yet. Click <strong>Create Report Template</strong> above to get started.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Based on</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        <div className="font-medium text-slate-900">{t.name}</div>
                        {t.description && <div className="text-xs text-slate-500">{t.description}</div>}
                      </TableCell>
                      <TableCell><Badge variant="outline">{t.base_type}</Badge></TableCell>
                      <TableCell>{t.reporting_year || '—'}</TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {new Date(t.created_at).toLocaleDateString()} by {t.created_by}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => { setEditingTemplate(t); setView('create'); }}>
                          <Edit2 className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button
                          variant="ghost" size="sm" className="text-red-600 hover:text-red-700"
                          onClick={async () => {
                            if (!confirm(`Delete template "${t.name}"?`)) return;
                            await supabase.from('report_templates').delete().eq('id', t.id);
                            toast.success('Template deleted');
                            refresh();
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Create / edit view ───────────────────────────────────────────────────
  return (
    <ReportTemplateEditor
      template={editingTemplate}
      generations={generations}
      projects={projects}
      onCancel={() => setView('list')}
      onSaved={() => { setView('list'); refresh(); }}
    />
  );
};

// ============================================================================
//                       ReportTemplateEditor (the wizard)
// ============================================================================
interface EditorProps {
  template: ReportTemplateRow | null;       // null = creating new
  generations: ReportGeneration[];
  projects: Project[];
  onCancel: () => void;
  onSaved: () => void;
}

function ReportTemplateEditor({ template, generations, projects, onCancel, onSaved }: EditorProps) {
  // Step 1 state
  const [name, setName] = useState(template?.name ?? '');
  const [description, setDescription] = useState(template?.description ?? '');
  const [orgName, setOrgName] = useState(template?.reporting_org_name ?? '');
  const [year, setYear] = useState(template?.reporting_year ?? new Date().getFullYear());
  const [responsible, setResponsible] = useState(template?.person_responsible ?? '');
  const [sourceGenId, setSourceGenId] = useState<string>('');
  const [baseType, setBaseType] = useState<'GRI' | 'ISO'>(template?.base_type ?? 'GRI');
  const [editableSections, setEditableSections] = useState<Set<string>>(new Set());

  // Step 2 state — the structure we're editing
  const [structure, setStructure] = useState<CustomTemplate>(
    template?.template_structure ?? buildInitialTemplate(template?.base_type ?? 'GRI')
  );

  // Step 3 state — activity mapping dialog
  const [mapDialog, setMapDialog] = useState<{ sectionId: string; rowId: string } | null>(null);

  // ── Available source reports filtered by selected project (Step 1) ───────
  const sourceOptions = generations; // (no further filter for v1 since SA picks via the same dropdown)

  // When the source is picked, prefill base type + reset structure
  const applySource = (genId: string) => {
    setSourceGenId(genId);
    const gen = generations.find((g) => g.id === genId);
    if (!gen) return;
    const proj = projects.find((p) => p.id === gen.project_id);
    if (gen.report_type === 'GRI' || gen.report_type === 'ISO') {
      setBaseType(gen.report_type);
      setStructure(buildInitialTemplate(gen.report_type));
      if (proj && !year) setYear(proj.year);
      if (proj && !orgName) setOrgName(proj.name);
    }
  };

  // ── Helpers to mutate structure ──────────────────────────────────────────
  const toggleSectionEditable = (sectionId: string, on: boolean) => {
    setEditableSections((prev) => {
      const next = new Set(prev);
      on ? next.add(sectionId) : next.delete(sectionId);
      return next;
    });
    setStructure((s) => ({
      ...s,
      sections: s.sections.map((sec) =>
        sec.id === sectionId ? { ...sec, isLocked: !on } : sec
      ),
    }));
  };

  const updateSectionTitle = (sectionId: string, customTitle: string) => {
    setStructure((s) => ({
      ...s,
      sections: s.sections.map((sec) =>
        sec.id === sectionId ? { ...sec, customTitle: customTitle || null } : sec
      ),
    }));
  };

  const updateRow = (sectionId: string, rowId: string, patch: Partial<CustomTemplateRow>) => {
    setStructure((s) => ({
      ...s,
      sections: s.sections.map((sec) =>
        sec.id !== sectionId ? sec : {
          ...sec,
          rows: sec.rows.map((r) => (r.id === rowId ? { ...r, ...patch } : r)),
        }
      ),
    }));
  };

  // Insert a custom row at a specific index. `afterRowId` = null → at the end.
  const addRow = (sectionId: string, afterRowId: string | null = null) => {
    const newId = `custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newRow: CustomTemplateRow = {
      id: newId,
      originalLabel: null,
      customLabel: 'New row — click to rename',
      activityUID: null,
      isCustom: true,
    };
    setStructure((s) => ({
      ...s,
      sections: s.sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        if (afterRowId === null) return { ...sec, rows: [...sec.rows, newRow] };
        const idx = sec.rows.findIndex((r) => r.id === afterRowId);
        const next = [...sec.rows];
        next.splice(idx + 1, 0, newRow);
        return { ...sec, rows: next };
      }),
    }));
  };

  // Move a row up or down within its section.
  const moveRow = (sectionId: string, rowId: string, direction: 'up' | 'down') => {
    setStructure((s) => ({
      ...s,
      sections: s.sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        const idx = sec.rows.findIndex((r) => r.id === rowId);
        if (idx === -1) return sec;
        const newIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= sec.rows.length) return sec;
        const next = [...sec.rows];
        [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
        return { ...sec, rows: next };
      }),
    }));
  };

  const deleteRow = (sectionId: string, rowId: string) => {
    setStructure((s) => ({
      ...s,
      sections: s.sections.map((sec) =>
        sec.id !== sectionId ? sec : { ...sec, rows: sec.rows.filter((r) => r.id !== rowId) }
      ),
    }));
  };

  // ── Validation + save ────────────────────────────────────────────────────
  const unmapped = useMemo(() => findUnmappedRows(structure), [structure]);
  const canSave = name.trim() && (template !== null || sourceGenId) && unmapped.length === 0;

  const handleSave = async () => {
    if (unmapped.length > 0) {
      toast.error(`${unmapped.length} row(s) still need an Activity mapping`);
      return;
    }
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        base_type: baseType,
        reporting_org_name: orgName || null,
        reporting_year: Number(year) || null,
        person_responsible: responsible || null,
        source_project_id: sourceGenId ? generations.find((g) => g.id === sourceGenId)?.project_id : null,
        source_business_unit_id: sourceGenId ? generations.find((g) => g.id === sourceGenId)?.business_unit_id : null,
        template_structure: structure,
        created_by: 'Sustainability Architect',
        updated_at: new Date().toISOString(),
      };

      if (template) {
        const { error } = await supabase.from('report_templates').update(payload).eq('id', template.id);
        if (error) throw error;
        toast.success(`Template "${name}" updated`);
      } else {
        const { error } = await supabase.from('report_templates').insert([payload]);
        if (error) throw error;
        toast.success(`Template "${name}" saved`, {
          description:
            'To use this template: open a BCA Project, ensure your customer users upload data against the mapped activities, then generate this report from the project or BU view.',
          duration: 8000,
        });
      }
      onSaved();
    } catch (e: any) {
      console.error('Save failed', e);
      toast.error('Failed to save template', { description: e.message });
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to list
          </Button>
          <div>
            <h2 className="text-2xl font-semibold text-slate-800">
              {template ? `Edit "${template.name}"` : 'Create Report Template'}
            </h2>
            <p className="text-slate-500 text-sm">
              Fork a generated GRI/ISO report and customize categories, rows and activity mappings.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {unmapped.length > 0 && (
            <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300">
              {unmapped.length} row(s) need mapping
            </Badge>
          )}
          <Button
            onClick={handleSave}
            disabled={!canSave}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Save className="h-4 w-4 mr-2" /> Save Template
          </Button>
        </div>
      </div>

      {/* Step 1 — General Info */}
      <Card className="border-emerald-100">
        <CardHeader className="bg-emerald-50/50 border-b border-emerald-100">
          <CardTitle className="text-lg text-emerald-800">1 · General Report Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="tpl-name">Template Name *</Label>
            <Input id="tpl-name" value={name} onChange={(e) => setName(e.target.value)}
                   placeholder="e.g. ABC Manufacturing GRI" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tpl-org">Reporting Organisation</Label>
            <Input id="tpl-org" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tpl-year">Reporting Year</Label>
            <Input id="tpl-year" type="number" value={year}
                   onChange={(e) => setYear(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tpl-resp">Person Responsible</Label>
            <Input id="tpl-resp" value={responsible} onChange={(e) => setResponsible(e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="tpl-desc">Description</Label>
            <Textarea id="tpl-desc" value={description}
                      onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Source Report *</Label>
            <Select value={sourceGenId} onValueChange={applySource} disabled={!!template}>
              <SelectTrigger>
                <SelectValue placeholder="Pick a previously-generated GRI or ISO report to fork…" />
              </SelectTrigger>
              <SelectContent>
                {sourceOptions.length === 0 ? (
                  <SelectItem value="none" disabled>No reports generated yet</SelectItem>
                ) : (
                  sourceOptions.map((g) => {
                    const proj = projects.find((p) => p.id === g.project_id);
                    return (
                      <SelectItem key={g.id} value={g.id}>
                        {g.report_type} · {proj?.name ?? g.project_id} · {g.business_unit_id ?? 'Project-level'} · {new Date(g.generated_at).toLocaleDateString()}
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
            {template && (
              <p className="text-xs text-slate-500">Source cannot be changed when editing an existing template.</p>
            )}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Categories to Edit (everything else stays locked)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {structure.sections.map((sec) => (
                <label key={sec.id} className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-slate-50">
                  <Checkbox
                    checked={editableSections.has(sec.id)}
                    onCheckedChange={(checked) => toggleSectionEditable(sec.id, !!checked)}
                  />
                  <span className="text-sm">{sec.originalTitle}</span>
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 2 — Editor */}
      {structure.sections.map((section) => (
        <Card key={section.id} className={section.isLocked ? 'opacity-70' : ''}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex-1 mr-3">
              {section.isLocked ? (
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-slate-400" />
                  <span className="font-semibold">{sectionTitle(section)}</span>
                  <Badge variant="outline" className="ml-2 text-xs">Locked</Badge>
                </div>
              ) : (
                <Input
                  value={sectionTitle(section)}
                  onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                  className="font-semibold text-base border-emerald-200 focus:border-emerald-500"
                />
              )}
              <p className="text-xs text-slate-500 mt-1">Unit: {section.unit}</p>
            </div>
            {!section.isLocked && (
              <Button variant="outline" size="sm" onClick={() => addRow(section.id)}>
                <Plus className="h-4 w-4 mr-1" /> Add Row
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Row Label</TableHead>
                  <TableHead className="w-[250px]">Mapped Activity</TableHead>
                  <TableHead className="w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {section.rows.map((r) => {
                  const activity = allActivities.find((a) => a.uid === r.activityUID);
                  const needsMap = !section.isLocked && (r.isCustom || !!r.customLabel) && !r.activityUID;
                  return (
                    <TableRow key={r.id} className={needsMap ? 'bg-amber-50/40' : ''}>
                      <TableCell className="font-mono text-xs text-slate-600">{r.id}</TableCell>
                      <TableCell>
                        {section.isLocked ? (
                          <span className="text-sm">{rowLabel(r)}</span>
                        ) : (
                          <Input
                            value={rowLabel(r)}
                            onChange={(e) => updateRow(section.id, r.id, {
                              customLabel: e.target.value === r.originalLabel ? null : e.target.value,
                            })}
                            className="h-8 text-sm"
                          />
                        )}
                        {r.isCustom && <Badge variant="outline" className="ml-2 text-xs">Custom</Badge>}
                      </TableCell>
                      <TableCell>
                        {activity ? (
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-xs">
                              <div className="font-mono text-slate-600">{activity.uid}</div>
                              <div className="text-slate-800">{activity.name}</div>
                            </div>
                            {!section.isLocked && (
                              <Button variant="ghost" size="sm" onClick={() => setMapDialog({ sectionId: section.id, rowId: r.id })}>
                                Change
                              </Button>
                            )}
                          </div>
                        ) : section.isLocked ? (
                          <span className="text-xs text-slate-500">—</span>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => setMapDialog({ sectionId: section.id, rowId: r.id })}>
                            <MapPin className="h-3 w-3 mr-1" />
                            {needsMap ? 'Map to Activity *' : 'Map'}
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {!section.isLocked && (
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7"
                                    title="Move up"
                                    onClick={() => moveRow(section.id, r.id, 'up')}>
                              ↑
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7"
                                    title="Move down"
                                    onClick={() => moveRow(section.id, r.id, 'down')}>
                              ↓
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-700"
                                    title="Insert row below"
                                    onClick={() => addRow(section.id, r.id)}>
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                            {r.isCustom && (
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600"
                                      title="Delete row"
                                      onClick={() => deleteRow(section.id, r.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      {/* Validation banner */}
      {unmapped.length > 0 && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-900">
                <strong>{unmapped.length} row(s) need an Activity mapping before saving:</strong>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  {unmapped.slice(0, 5).map((u) => (
                    <li key={u.rowId}>{u.sectionTitle} → {u.rowLabel}</li>
                  ))}
                  {unmapped.length > 5 && <li>…and {unmapped.length - 5} more</li>}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity picker dialog */}
      {mapDialog && (
        <ActivityPickerDialog
          currentActivityUID={
            structure.sections.find((s) => s.id === mapDialog.sectionId)?.rows.find((r) => r.id === mapDialog.rowId)?.activityUID
            ?? null
          }
          onClose={() => setMapDialog(null)}
          onPick={(uid) => {
            updateRow(mapDialog.sectionId, mapDialog.rowId, { activityUID: uid });
            setMapDialog(null);
          }}
        />
      )}
    </div>
  );
}

// ============================================================================
//                          ActivityPickerDialog
// ============================================================================
function ActivityPickerDialog({
  currentActivityUID, onClose, onPick,
}: {
  currentActivityUID: string | null;
  onClose: () => void;
  onPick: (uid: string) => void;
}) {
  const [search, setSearch] = useState('');
  const filtered = allActivities.filter((a) => {
    const q = search.toLowerCase();
    return !q || a.uid.toLowerCase().includes(q) || a.name.toLowerCase().includes(q);
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Map to existing Activity</DialogTitle>
          <DialogDescription>
            Pick the Activity whose formula + emission factors should drive this row's calculation.
            Activities are managed in CDB · Activities.
          </DialogDescription>
        </DialogHeader>

        <Input
          placeholder="Search by UID or name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3"
        />

        <div className="flex-1 overflow-y-auto border rounded-md">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-[180px]">UID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-[120px]">Formula</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.uid} className={a.uid === currentActivityUID ? 'bg-emerald-50' : ''}>
                  <TableCell className="font-mono text-xs">{a.uid}</TableCell>
                  <TableCell className="text-sm">{a.name}</TableCell>
                  <TableCell className="text-xs text-slate-600">{a.formulaName || '—'}</TableCell>
                  <TableCell>
                    <Button size="sm" onClick={() => onPick(a.uid)}>
                      {a.uid === currentActivityUID ? <CheckCircle2 className="h-3 w-3" /> : 'Pick'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="border-t pt-3">
          <div className="flex-1 text-left text-xs text-slate-500">
            Can't find your activity?{' '}
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); window.alert('Open CDB → Activities to create a new activity, then return here and refresh.'); }}
              className="text-emerald-700 hover:underline inline-flex items-center gap-1"
            >
              Create one in CDB · Activities <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
