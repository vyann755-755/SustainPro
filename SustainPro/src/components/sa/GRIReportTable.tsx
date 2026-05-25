/**
 * GRIReportTable — in-app preview of the full GRI report
 * =======================================================
 * Mirrors `Sample GRI.xlsx`: GHG (305) + Energy (302) + Water (303) + Waste (306)
 * sections, each with per-BU columns + Total. Every template row is rendered;
 * missing values shown as "—".
 *
 * "Export to PDF" delegates to the shared `generateGRIPdf()` helper so the
 * exported file and the on-screen table always stay in sync.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { mockBusinessUnits } from './CDBBusinessUnits';
import { supabase } from '../../utils/supabase/client';
import { Loader2, FileDown } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  griGHGTemplate,
  griEnergyTemplate,
  griWaterTemplate,
  griWasteTemplate,
  getGRIValue,
  formatReportValue,
  type GRIRow,
} from '../../data/reportTemplates';
import { type CustomTemplate, rowLabel as ctRowLabel, sectionTitle as ctSectionTitle } from '../../data/customTemplate';
import { generateGRIPdf, type BUData } from './reportPDF';

interface GRIReportTableProps {
  projectName: string;
  assignedBUs?: string[];
  reportingYear?: number;
  projectId: string;
  /** When set, the table shows a single-BU layout (no per-BU columns). */
  singleBUName?: string;
  customTemplate?: any;
  customTitle?: string;
}

interface BusinessUnitData {
  businessUnitId: string;
  businessUnitName: string;
  calculatedData: any[];
}

export function GRIReportTable({
  projectName,
  assignedBUs = [],
  reportingYear = 2025,
  projectId,
  singleBUName,
  customTemplate,
  customTitle,
}: GRIReportTableProps) {
  const [buDataMap, setBuDataMap] = useState<Map<string, BusinessUnitData>>(new Map());
  const [loading, setLoading] = useState(true);

  // Resolve the BU objects so we can read .name
  const businessUnits = assignedBUs
    .map((id) => mockBusinessUnits.find((bu) => bu.id === id))
    .filter(Boolean) as typeof mockBusinessUnits;

  // ── Data fetch ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const dataMap = new Map<string, BusinessUnitData>();

      await Promise.all(
        assignedBUs.map(async (buId) => {
          try {
            const { data, error } = await supabase
              .from('activity_submissions')
              .select('*')
              .eq('project_id', projectId)
              .eq('business_unit_id', buId)
              .order('created_at', { ascending: false })
              .limit(1);
            if (error) throw error;

            if (data && data.length > 0) {
              const buMeta = mockBusinessUnits.find((b) => b.id === buId);
              dataMap.set(buId, {
                businessUnitId: data[0].business_unit_id,
                businessUnitName: buMeta?.name || '',
                calculatedData: data[0].calculated_data || [],
              });
            }
          } catch (err) {
            console.error(`Error fetching data for BU ${buId}:`, err);
          }
        })
      );

      setBuDataMap(dataMap);
      setLoading(false);
    };

    if (assignedBUs.length > 0) fetchAll();
    else setLoading(false);
  }, [assignedBUs.join(','), projectId]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  
  // ── Value lookup for custom rows ────────────────────────────────────────
  const valueByActivityUID = (buId: string, activityUID: string | null): number => {
    if (!activityUID) return 0;
    const buCalc = buDataMap.get(buId)?.calculatedData || [];
    return buCalc
      .filter((d: any) => d.activityUID === activityUID)
      .reduce((s: number, d: any) => s + (Number(d.calculatedValue) || 0), 0);
  };

  const inventoryFor = (buId: string, category: string): number =>
    getGRIValue(buDataMap.get(buId)?.calculatedData, category);

  const totalFor = (category: string): number =>
    assignedBUs.reduce((sum, buId) => sum + inventoryFor(buId, category), 0);

  // ── PDF export — delegates to shared helper (same as Download PDF button) ─
  const exportToPDF = () => {
    try {
      const buData: BUData[] = assignedBUs.map((buId) => {
        const cached = buDataMap.get(buId);
        const buMeta = mockBusinessUnits.find((b) => b.id === buId);
        return {
          businessUnitId: buId,
          businessUnitName: buMeta?.name || buId,
          calculatedData: cached?.calculatedData || [],
        };
      });

      generateGRIPdf({
        projectName,
        reportingYear,
        singleBUName,
        buData,
      });

      toast.success('GRI Report exported successfully!');
    } catch (err) {
      console.error('GRI PDF export failed:', err);
      toast.error('Failed to export GRI PDF');
    }
  };

  // ── Render one section table (GHG / Energy / Water / Waste) ────────────────
  const renderSection = (title: string, unit: string, template: GRIRow[]) => {
    const colCount = 2 + businessUnits.length * 2 + 2;
    return (
      <Card className="border-2 border-emerald-100 mb-6" key={title}>
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100 py-3">
          <CardTitle className="text-emerald-900 text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-emerald-100">
                <TableHead rowSpan={2} className="border-r border-gray-300 font-semibold text-emerald-900 align-middle">
                  Cat.
                </TableHead>
                <TableHead rowSpan={2} className="border-r border-gray-300 font-semibold text-emerald-900 align-middle min-w-[260px]">
                  Reporting category
                </TableHead>
                {businessUnits.map((bu) => (
                  <TableHead
                    key={bu.id}
                    colSpan={2}
                    className="text-center font-semibold text-emerald-900 border-r border-gray-300"
                  >
                    {bu.name} (BU)
                  </TableHead>
                ))}
                <TableHead colSpan={2} className="text-center font-semibold text-emerald-900">
                  Total
                </TableHead>
              </TableRow>
              <TableRow className="bg-emerald-100">
                {businessUnits.map((bu) => (
                  <React.Fragment key={bu.id}>
                    <TableHead className="text-center font-semibold text-emerald-900 text-xs border-r border-gray-200">Unit</TableHead>
                    <TableHead className="text-center font-semibold text-emerald-900 text-xs border-r border-gray-300">Inventory</TableHead>
                  </React.Fragment>
                ))}
                <TableHead className="text-center font-semibold text-emerald-900 text-xs border-r border-gray-200">Unit</TableHead>
                <TableHead className="text-center font-semibold text-emerald-900 text-xs">Inventory</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {template.map((row, idx) => {
                if (row.type === 'scope-header') {
                  return (
                    <TableRow key={idx} className="bg-emerald-50">
                      <TableCell colSpan={colCount} className="font-semibold text-emerald-900">
                        {row.name}
                      </TableCell>
                    </TableRow>
                  );
                }
                if (row.type === 'sub-header') {
                  return (
                    <TableRow key={idx} className="bg-green-50/60">
                      <TableCell colSpan={colCount} className="font-medium text-green-800 pl-6">
                        {row.name}
                      </TableCell>
                    </TableRow>
                  );
                }
                const total = row.category ? totalFor(row.category) : 0;
                return (
                  <TableRow key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}>
                    <TableCell className="font-mono text-xs text-gray-700 border-r border-gray-300">
                      {row.category || ''}
                    </TableCell>
                    <TableCell className="text-sm text-gray-900 border-r border-gray-300">
                      {row.name}
                      {row.notes ? <span className="text-gray-500 text-xs ml-2">{row.notes}</span> : null}
                    </TableCell>
                    {businessUnits.map((bu) => {
                      const v = row.category ? inventoryFor(bu.id, row.category) : 0;
                      return (
                        <React.Fragment key={bu.id}>
                          <TableCell className="text-center text-xs text-gray-600 border-r border-gray-200">{unit}</TableCell>
                          <TableCell className="text-right text-sm text-gray-900 border-r border-gray-300 font-mono">
                            {formatReportValue(v)}
                          </TableCell>
                        </React.Fragment>
                      );
                    })}
                    <TableCell className="text-center text-xs text-gray-600 border-r border-gray-200">{unit}</TableCell>
                    <TableCell className="text-right text-sm font-semibold text-gray-900 bg-amber-50 font-mono">
                      {formatReportValue(total)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Card className="border-2 border-emerald-100">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading GRI Report data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header card with metadata + Export */}
      <Card className="border-2 border-emerald-100">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-emerald-900">{customTitle || 'GRI Report'}</CardTitle>
            <Button onClick={exportToPDF} className="bg-emerald-600 hover:bg-emerald-700" size="sm">
              <FileDown className="h-4 w-4 mr-2" />
              Export GRI Report (PDF)
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-b border-gray-200 grid grid-cols-2">
            <div className="bg-emerald-100 p-3 border-r border-gray-200 font-semibold text-emerald-900">
              Reporting Organisation Name:
            </div>
            <div className="p-3 bg-white text-gray-900">{projectName}</div>
            <div className="bg-emerald-100 p-3 border-r border-gray-200 border-t font-semibold text-emerald-900">
              Reporting Year:
            </div>
            <div className="p-3 bg-white border-t border-gray-200 text-gray-900">{reportingYear}</div>
            {singleBUName ? (
              <>
                <div className="bg-emerald-100 p-3 border-r border-gray-200 border-t font-semibold text-emerald-900">
                  Business Unit:
                </div>
                <div className="p-3 bg-white border-t border-gray-200 text-gray-900">{singleBUName}</div>
              </>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* If a custom template is provided, render its sections; otherwise the base 4 */}
      {customTemplate ? (
        customTemplate.sections.map((section: any) => (
          <Card key={section.id} className="border-2 border-emerald-100 mb-6">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100 py-3">
              <CardTitle className="text-emerald-900 text-base">{ctSectionTitle(section)}</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-emerald-100">
                    <TableHead rowSpan={2} className="border-r border-gray-300 font-semibold text-emerald-900 align-middle">Cat.</TableHead>
                    <TableHead rowSpan={2} className="border-r border-gray-300 font-semibold text-emerald-900 align-middle min-w-[260px]">Reporting category</TableHead>
                    {businessUnits.map((bu) => (
                      <TableHead key={bu.id} colSpan={2} className="text-center font-semibold text-emerald-900 border-r border-gray-300">
                        {bu.name} (BU)
                      </TableHead>
                    ))}
                    <TableHead colSpan={2} className="text-center font-semibold text-emerald-900">Total</TableHead>
                  </TableRow>
                  <TableRow className="bg-emerald-100">
                    {businessUnits.map((bu) => (
                      <React.Fragment key={bu.id}>
                        <TableHead className="text-center font-semibold text-emerald-900 text-xs border-r border-gray-200">Unit</TableHead>
                        <TableHead className="text-center font-semibold text-emerald-900 text-xs border-r border-gray-300">Inventory</TableHead>
                      </React.Fragment>
                    ))}
                    <TableHead className="text-center font-semibold text-emerald-900 text-xs border-r border-gray-200">Unit</TableHead>
                    <TableHead className="text-center font-semibold text-emerald-900 text-xs">Inventory</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {section.rows.map((r: any, idx: number) => {
                    // Custom rows: pull by activityUID. Inherited rows w/o explicit
                    // mapping: fall back to GRI sub-cat id (e.g. "305.1.1").
                    const buValues: number[] = businessUnits.map((bu) => {
                      if (r.activityUID) return valueByActivityUID(bu.id, r.activityUID);
                      if (!r.isCustom) return inventoryFor(bu.id, r.id);
                      return 0;
                    });
                    const total = buValues.reduce((s, v) => s + v, 0);
                    return (
                      <TableRow key={r.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}>
                        <TableCell className="font-mono text-xs text-gray-700 border-r border-gray-300">{r.id}</TableCell>
                        <TableCell className="text-sm text-gray-900 border-r border-gray-300">
                          {ctRowLabel(r)}
                          {r.isCustom && <span className="ml-2 text-xs text-emerald-700">(custom)</span>}
                        </TableCell>
                        {businessUnits.map((bu, i) => (
                          <React.Fragment key={bu.id}>
                            <TableCell className="text-center text-xs text-gray-600 border-r border-gray-200">{section.unit}</TableCell>
                            <TableCell className="text-right text-sm text-gray-900 border-r border-gray-300 font-mono">
                              {formatReportValue(buValues[i])}
                            </TableCell>
                          </React.Fragment>
                        ))}
                        <TableCell className="text-center text-xs text-gray-600 border-r border-gray-200">{section.unit}</TableCell>
                        <TableCell className="text-right text-sm font-semibold text-gray-900 bg-amber-50 font-mono">
                          {formatReportValue(total)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))
      ) : (
        <>
          {renderSection('GRI GHG Report',           'kgCO2e', griGHGTemplate)}
          {renderSection('Energy Consumption Report', 'GJ',    griEnergyTemplate)}
          {renderSection('Water Consumption Report',  'ML',    griWaterTemplate)}
          {renderSection('Waste Report',              'ton',   griWasteTemplate)}
        </>
      )}
    </div>
  );
}
