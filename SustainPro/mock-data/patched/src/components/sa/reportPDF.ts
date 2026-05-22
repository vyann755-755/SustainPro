/**
 * SustainPro — Report PDF Generators
 * ===================================
 * Shared helpers that produce the GRI and ISO PDFs from a Supabase
 * `activity_submissions` aggregate. Used by:
 *   - BCAProjects.tsx · project-level "Generate GRI/ISO Report" action
 *   - BusinessUnitDataView.tsx · per-BU "Export GRI/ISO" buttons (future)
 *
 * Both PDFs mirror the structure of `Sample GRI.xlsx` and `Sample ISO.xlsx`
 * row-for-row: every template row is rendered, with "—" where there is no data.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  griGHGTemplate,
  isoTemplate,
  formatReportValue,
  getGRIValue,
  sumGRIValues,
} from '../../data/reportTemplates';

// Declare autoTable so TS is happy.
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable?: { finalY: number };
  }
}

export interface BUData {
  businessUnitId: string;
  businessUnitName: string;
  calculatedData: any[];
}

export interface ReportArgs {
  projectName: string;
  reportingYear: number;
  /** When undefined → project-level (all BUs); when set → single-BU report */
  singleBUName?: string;
  /** All BU data to include. For single-BU report pass an array of length 1. */
  buData: BUData[];
}

// ============================================================================
// GRI PDF — landscape, BUs as column-pairs (Unit / Inventory) + Total column
// ============================================================================
export function generateGRIPdf(args: ReportArgs): void {
  const { projectName, reportingYear, singleBUName, buData } = args;
  const doc = new jsPDF('landscape');

  // ── Header ────────────────────────────────────────────────────────────────
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('GRI GHG Report', 14, 16);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Reporting Organisation Name: ${projectName}`, 14, 24);
  doc.text(`Reporting Year: ${reportingYear}`, 14, 30);
  if (singleBUName) {
    doc.text(`Business Unit: ${singleBUName}`, 14, 36);
  }

  // ── Table ─────────────────────────────────────────────────────────────────
  // Header rows mirror Excel: row 7 BU names (colspan 2), row 8 Unit / Inventory.
  const buCount = buData.length;

  const headerRow1: any[] = [
    { content: 'Cat.', rowSpan: 2 },
    { content: 'Reporting category', rowSpan: 2 },
  ];
  buData.forEach((bu) => {
    headerRow1.push({ content: `${bu.businessUnitName} (BU)`, colSpan: 2, styles: { halign: 'center' } });
  });
  headerRow1.push({ content: 'Total', colSpan: 2, styles: { halign: 'center' } });

  const headerRow2: any[] = [];
  buData.forEach(() => {
    headerRow2.push({ content: 'Unit', styles: { halign: 'center' } });
    headerRow2.push({ content: 'Inventory', styles: { halign: 'center' } });
  });
  headerRow2.push({ content: 'Unit', styles: { halign: 'center' } });
  headerRow2.push({ content: 'Inventory', styles: { halign: 'center' } });

  // Body rows
  const body: any[] = [];

  griGHGTemplate.forEach((row) => {
    if (row.type === 'scope-header') {
      // Scope-header row spans the full width
      body.push([
        {
          content: row.name,
          colSpan: 2 + buCount * 2 + 2,
          styles: { fillColor: [209, 250, 229], textColor: [6, 78, 59], fontStyle: 'bold' },
        },
      ]);
    } else {
      // Category data row
      const cells: any[] = [
        { content: row.category, styles: { fontSize: 7, halign: 'center' } },
        { content: row.name },
      ];

      let total = 0;
      buData.forEach((bu) => {
        const v = getGRIValue(bu.calculatedData, row.category!);
        total += v;
        cells.push({ content: 'kgCO2e', styles: { halign: 'center', fontSize: 7 } });
        cells.push({ content: formatReportValue(v), styles: { halign: 'right' } });
      });
      cells.push({ content: 'kgCO2e', styles: { halign: 'center', fontSize: 7 } });
      cells.push({
        content: formatReportValue(total),
        styles: { halign: 'right', fontStyle: 'bold', fillColor: [254, 243, 199] },
      });
      body.push(cells);
    }
  });

  autoTable(doc, {
    startY: singleBUName ? 42 : 38,
    head: [headerRow1, headerRow2],
    body,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, lineColor: [200, 200, 200], lineWidth: 0.1 },
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: 18, fontSize: 7 }, 1: { cellWidth: 'auto', minCellWidth: 60 } },
    margin: { left: 8, right: 8 },
  });

  // Filename
  const fnSuffix = singleBUName
    ? `${singleBUName.replace(/\s+/g, '_')}`
    : 'All_BUs';
  doc.save(`GRI_Report_${projectName.replace(/\s+/g, '_')}_${fnSuffix}_${reportingYear}.pdf`);
}

// ============================================================================
// ISO PDF — portrait, GHG type columns (Total / CO2 / CH4 / N2O / HFCs / PFCs / SF6 / NF3)
// Note: We only have aggregate kgCO2e in `activity_submissions` today — so the
//        Total GWP column is populated and the per-gas columns are blank, as per
//        the template's "[to be input]" convention. When per-gas breakdown is
//        available later, just extend the data fetch.
// ============================================================================
export function generateISOPdf(args: ReportArgs): void {
  const { projectName, reportingYear, singleBUName, buData } = args;
  const doc = new jsPDF();

  // ── Header ────────────────────────────────────────────────────────────────
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('ISO 14064-1 GHG Report', 14, 16);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Reporting Organisation Name: ${projectName}`, 14, 24);
  doc.text('Person or entity responsible for the report: Sustainability Architect', 14, 30);
  doc.text(`Reporting Year: ${reportingYear}`, 14, 36);
  doc.text(
    `Business Unit: ${singleBUName ?? `All assigned BUs (${buData.length})`}`,
    14, 42,
  );

  // ── Build aggregated calculated_data across all BUs (ISO is project-level) ─
  const aggregate: any[] = [];
  buData.forEach((bu) => (bu.calculatedData || []).forEach((d) => aggregate.push(d)));

  // ── Header rows ───────────────────────────────────────────────────────────
  const headerRow1 = [
    { content: '#', rowSpan: 2, styles: { halign: 'center' } },
    { content: 'Emissions', rowSpan: 2 },
    { content: 'Notes', rowSpan: 2, styles: { halign: 'center' } },
    { content: String(reportingYear), colSpan: 8, styles: { halign: 'center' } },
  ];
  const headerRow2 = [
    { content: 'Total GWP\n(kgCO2e/yr)', styles: { halign: 'center', fontSize: 7 } },
    { content: 'CO2\n(kgCO2/yr)',         styles: { halign: 'center', fontSize: 7 } },
    { content: 'CH4\n(kgCH4/yr)',         styles: { halign: 'center', fontSize: 7 } },
    { content: 'N2O\n(kgN2O/yr)',         styles: { halign: 'center', fontSize: 7 } },
    { content: 'HFCs',                    styles: { halign: 'center', fontSize: 7 } },
    { content: 'PFCs',                    styles: { halign: 'center', fontSize: 7 } },
    { content: 'SF6',                     styles: { halign: 'center', fontSize: 7 } },
    { content: 'NF3',                     styles: { halign: 'center', fontSize: 7 } },
  ];

  // ── Body — mirror the ISO template row-by-row ─────────────────────────────
  const body: any[] = [];

  // Pre-compute Cat 1-6 totals to fill into "Category X" header rows
  const catTotals: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 };

  isoTemplate.forEach((row) => {
    if (row.type === 'spacer') {
      body.push([{ content: '', colSpan: 11, styles: { fillColor: [255, 255, 255], minCellHeight: 4 } }]);
      return;
    }

    if (row.type === 'section') {
      body.push([
        { content: row.name, colSpan: 11, styles: { fillColor: [217, 226, 232], fontStyle: 'bold' } },
      ]);
      return;
    }

    if (row.type === 'total') {
      const grand = Object.values(catTotals).reduce((a, b) => a + b, 0);
      body.push([
        { content: '', styles: { fillColor: [254, 243, 199] } },
        { content: row.name, styles: { fontStyle: 'bold', fillColor: [254, 243, 199] } },
        { content: '', styles: { fillColor: [254, 243, 199] } },
        { content: formatReportValue(grand), styles: { halign: 'right', fontStyle: 'bold', fillColor: [254, 243, 199] } },
        ...Array(7).fill({ content: '', styles: { fillColor: [254, 243, 199] } }),
      ]);
      return;
    }

    if (row.type === 'category-header') {
      const total = row.griCategoryUIDs ? sumGRIValues(aggregate, row.griCategoryUIDs) : 0;
      if (row.number) catTotals[row.number] += total;
      body.push([
        { content: row.number ?? '', styles: { fontStyle: 'bold', fillColor: [209, 250, 229] } },
        { content: row.name,         styles: { fontStyle: 'bold', fillColor: [209, 250, 229] } },
        { content: row.notes ?? '',  styles: { fillColor: [209, 250, 229] } },
        { content: formatReportValue(total), styles: { halign: 'right', fontStyle: 'bold', fillColor: [209, 250, 229] } },
        ...Array(7).fill({ content: '', styles: { fillColor: [209, 250, 229] } }),
      ]);
      return;
    }

    // sub-row
    const value = row.griCategoryUIDs ? sumGRIValues(aggregate, row.griCategoryUIDs) : 0;
    if (row.number) {
      const cat = row.number.split('.')[0];
      if (catTotals[cat] !== undefined) catTotals[cat] += value;
    }
    body.push([
      { content: row.number ?? '', styles: { halign: 'center' } },
      { content: row.name },
      { content: row.notes ?? '',  styles: { halign: 'center', fontSize: 7 } },
      { content: formatReportValue(value), styles: { halign: 'right' } },
      ...Array(7).fill({ content: '' }),
    ]);
  });

  autoTable(doc, {
    startY: 48,
    head: [headerRow1, headerRow2],
    body,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, lineColor: [200, 200, 200], lineWidth: 0.1 },
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 70 },
      2: { cellWidth: 18, halign: 'center', fontSize: 7 },
      3: { cellWidth: 20, halign: 'right' },
    },
    margin: { left: 8, right: 8 },
  });

  // Filename
  const fnSuffix = singleBUName
    ? `${singleBUName.replace(/\s+/g, '_')}`
    : 'All_BUs';
  doc.save(`ISO_Report_${projectName.replace(/\s+/g, '_')}_${fnSuffix}_${reportingYear}.pdf`);
}
