/**
 * ISOReportTable — in-app preview of the ISO 14064-1 report
 * ==========================================================
 * Mirrors `Sample ISO.xlsx`: Cat 1–6 with per-GHG columns. Each row populated
 * from `activity_submissions.calculated_data` aggregated by GRI sub-category
 * → mapped to the matching ISO row via `griCategoryUIDs`.
 *
 * "Export to PDF" delegates to the shared `generateISOPdf()` helper.
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
  isoTemplate,
  sumGRIValues,
  formatReportValue,
} from '../../data/reportTemplates';
import { generateISOPdf, type BUData } from './reportPDF';

interface ISOReportTableProps {
  projectName: string;
  assignedBUs?: string[];
  reportingYear?: number;
  projectId: string;
  /** When set, the table is a single-BU report (header shows BU name). */
  singleBUName?: string;
}

export function ISOReportTable({
  projectName,
  assignedBUs = [],
  reportingYear = 2025,
  projectId,
  singleBUName,
}: ISOReportTableProps) {
  const [aggregate, setAggregate] = useState<any[]>([]);
  const [buData, setBuData] = useState<BUData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const bus: BUData[] = await Promise.all(
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

            const buMeta = mockBusinessUnits.find((b) => b.id === buId);
            return {
              businessUnitId: buId,
              businessUnitName: buMeta?.name || buId,
              calculatedData: data && data.length > 0 ? data[0].calculated_data || [] : [],
            };
          } catch (err) {
            console.error(`ISO: error fetching BU ${buId}:`, err);
            const buMeta = mockBusinessUnits.find((b) => b.id === buId);
            return {
              businessUnitId: buId,
              businessUnitName: buMeta?.name || buId,
              calculatedData: [],
            };
          }
        })
      );

      // Flatten across BUs for the in-app aggregate view
      const agg: any[] = [];
      bus.forEach((b) => (b.calculatedData || []).forEach((d) => agg.push(d)));

      setBuData(bus);
      setAggregate(agg);
      setLoading(false);
    };

    if (assignedBUs.length > 0) fetchAll();
    else setLoading(false);
  }, [assignedBUs.join(','), projectId]);

  // Pre-compute category totals as we walk template rows
  const exportToPDF = () => {
    try {
      generateISOPdf({
        projectName,
        reportingYear,
        singleBUName,
        buData,
      });
      toast.success('ISO Report exported successfully!');
    } catch (err) {
      console.error('ISO PDF export failed:', err);
      toast.error('Failed to export ISO PDF');
    }
  };

  if (loading) {
    return (
      <Card className="border-2 border-emerald-100">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading ISO Report data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Walk the template, accumulating Cat totals
  const catTotals: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 };
  const rows: JSX.Element[] = [];
  isoTemplate.forEach((row, idx) => {
    if (row.type === 'spacer') {
      rows.push(<TableRow key={idx}><TableCell colSpan={11} className="py-1 bg-white" /></TableRow>);
      return;
    }
    if (row.type === 'section') {
      rows.push(
        <TableRow key={idx} className="bg-slate-200">
          <TableCell colSpan={11} className="font-semibold text-slate-800">{row.name}</TableCell>
        </TableRow>
      );
      return;
    }
    if (row.type === 'total') {
      const grand = Object.values(catTotals).reduce((a, b) => a + b, 0);
      rows.push(
        <TableRow key={idx} className="bg-amber-100">
          <TableCell />
          <TableCell className="font-bold text-amber-900">{row.name}</TableCell>
          <TableCell />
          <TableCell className="text-right font-bold text-amber-900 font-mono">{formatReportValue(grand)}</TableCell>
          {Array(7).fill(0).map((_, j) => <TableCell key={j} />)}
        </TableRow>
      );
      return;
    }
    if (row.type === 'category-header') {
      const total = row.griCategoryUIDs ? sumGRIValues(aggregate, row.griCategoryUIDs) : 0;
      if (row.number) catTotals[row.number] += total;
      else if (row.name.startsWith('Category 6')) catTotals['6'] += total;
      rows.push(
        <TableRow key={idx} className="bg-emerald-100">
          <TableCell className="font-bold text-emerald-900">{row.number || ''}</TableCell>
          <TableCell className="font-bold text-emerald-900">{row.name}</TableCell>
          <TableCell className="text-xs text-emerald-800">{row.notes || ''}</TableCell>
          <TableCell className="text-right font-bold text-emerald-900 font-mono">{formatReportValue(total)}</TableCell>
          {Array(7).fill(0).map((_, j) => <TableCell key={j} />)}
        </TableRow>
      );
      return;
    }
    // sub-row
    const v = row.griCategoryUIDs ? sumGRIValues(aggregate, row.griCategoryUIDs) : 0;
    if (row.number) {
      const cat = row.number.split('.')[0];
      if (catTotals[cat] !== undefined) catTotals[cat] += v;
    }
    rows.push(
      <TableRow key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
        <TableCell className="text-center text-sm">{row.number || ''}</TableCell>
        <TableCell className="text-sm text-gray-900">{row.name}</TableCell>
        <TableCell className="text-xs text-gray-500 text-center">{row.notes || ''}</TableCell>
        <TableCell className="text-right text-sm font-mono text-gray-900">{formatReportValue(v)}</TableCell>
        {Array(7).fill(0).map((_, j) => <TableCell key={j} />)}
      </TableRow>
    );
  });

  return (
    <div className="space-y-6">
      <Card className="border-2 border-emerald-100">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-emerald-900">ISO 14064-1 GHG Report</CardTitle>
            <Button onClick={exportToPDF} className="bg-emerald-600 hover:bg-emerald-700" size="sm">
              <FileDown className="h-4 w-4 mr-2" />
              Export ISO Report (PDF)
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-2 border-b border-gray-200">
            <div className="bg-emerald-100 p-3 border-r border-gray-200 font-semibold text-emerald-900">
              Reporting Organisation Name:
            </div>
            <div className="p-3 bg-white text-gray-900">{projectName}</div>
            <div className="bg-emerald-100 p-3 border-r border-gray-200 border-t font-semibold text-emerald-900">
              Person or entity responsible for the report:
            </div>
            <div className="p-3 bg-white border-t text-gray-900">Sustainability Architect</div>
            <div className="bg-emerald-100 p-3 border-r border-gray-200 border-t font-semibold text-emerald-900">
              Reporting Year:
            </div>
            <div className="p-3 bg-white border-t text-gray-900">{reportingYear}</div>
            <div className="bg-emerald-100 p-3 border-r border-gray-200 border-t font-semibold text-emerald-900">
              Business Unit:
            </div>
            <div className="p-3 bg-white border-t text-gray-900">
              {singleBUName ?? `All assigned BUs (${assignedBUs.length})`}
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-emerald-100">
                  <TableHead rowSpan={2} className="font-semibold text-emerald-900 text-center w-[60px] align-middle">#</TableHead>
                  <TableHead rowSpan={2} className="font-semibold text-emerald-900 align-middle min-w-[300px]">Emissions</TableHead>
                  <TableHead rowSpan={2} className="font-semibold text-emerald-900 text-center align-middle">Notes</TableHead>
                  <TableHead colSpan={8} className="font-semibold text-emerald-900 text-center">{reportingYear}</TableHead>
                </TableRow>
                <TableRow className="bg-emerald-100">
                  <TableHead className="text-xs font-semibold text-emerald-900 text-center">Total GWP<br/>(kgCO2e/yr)</TableHead>
                  <TableHead className="text-xs font-semibold text-emerald-900 text-center">CO2<br/>(kgCO2/yr)</TableHead>
                  <TableHead className="text-xs font-semibold text-emerald-900 text-center">CH4<br/>(kgCH4/yr)</TableHead>
                  <TableHead className="text-xs font-semibold text-emerald-900 text-center">N2O<br/>(kgN2O/yr)</TableHead>
                  <TableHead className="text-xs font-semibold text-emerald-900 text-center">HFCs</TableHead>
                  <TableHead className="text-xs font-semibold text-emerald-900 text-center">PFCs</TableHead>
                  <TableHead className="text-xs font-semibold text-emerald-900 text-center">SF6</TableHead>
                  <TableHead className="text-xs font-semibold text-emerald-900 text-center">NF3</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{rows}</TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
