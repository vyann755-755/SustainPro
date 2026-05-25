/**
 * SustainPro — Report PDF Generators
 * ===================================
 *  generateGRIPdf  → full GHG (305) + Energy (302) + Water (303) + Waste (306)
 *                   sections, each on its own page. Per-BU columns + Total.
 *  generateISOPdf  → ISO 14064-1 Cat 1–6, project-level aggregate. Per-BU
 *                   when `singleBUName` is set.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  griGHGTemplate,
  griEnergyTemplate,
  griWaterTemplate,
  griWasteTemplate,
  isoTemplate,
  formatReportValue,
  getGRIValue,
  sumGRIValues,
  type GRIRow,
} from '../../data/reportTemplates';
import { type CustomTemplate, rowLabel, sectionTitle as ctSectionTitle } from '../../data/customTemplate';
import { allActivities } from './activitiesData';

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


// Helper: look up the calculated value for an activity UID by summing
// matching rows in the customer's calculated_data. Falls back to 0.
function valueByActivityUID(buData: BUData[], activityUID: string | null): number {
  if (!activityUID) return 0;
  let total = 0;
  for (const bu of buData) {
    for (const row of bu.calculatedData || []) {
      if (row.activityUID === activityUID) total += Number(row.calculatedValue) || 0;
    }
  }
  return total;
}

// Helper: when running a CustomTemplate-based GRI PDF, render each custom
// section. Returns an array of rows compatible with autotable body cells.
function buildCustomGRISection(args: ReportArgs, section: any) {
  const { buData } = args;
  const cells: any[] = [];

  // Scope-style header
  cells.push([
    {
      content: ctSectionTitle(section),
      colSpan: 2 + buData.length * 2 + 2,
      styles: { fillColor: [209, 250, 229], textColor: [6, 78, 59], fontStyle: 'bold' },
    },
  ]);

  for (const r of section.rows) {
    const label = rowLabel(r);
    const row: any[] = [
      { content: r.id, styles: { fontSize: 7, halign: 'center' } },
      { content: label },
    ];
    let total = 0;
    for (const bu of buData) {
      let v = 0;
      if (r.activityUID) {
        for (const d of bu.calculatedData || []) {
          if (d.activityUID === r.activityUID) v += Number(d.calculatedValue) || 0;
        }
      } else if (!r.isCustom) {
        // For inherited (non-custom) rows without explicit activity mapping,
        // fall back to GRI sub-category id matching (e.g. "305.1.1")
        v = getGRIValue(bu.calculatedData, r.id);
      }
      total += v;
      row.push({ content: section.unit, styles: { halign: 'center', fontSize: 7 } });
      row.push({ content: formatReportValue(v), styles: { halign: 'right' } });
    }
    row.push({ content: section.unit, styles: { halign: 'center', fontSize: 7 } });
    row.push({
      content: formatReportValue(total),
      styles: { halign: 'right', fontStyle: 'bold', fillColor: [254, 243, 199] },
    });
    cells.push(row);
  }
  return cells;
}

export interface ReportArgs {
  projectName: string;
  reportingYear: number;
  /** Pass when generating a single-BU report (omitted for project-level). */
  singleBUName?: string;
  /** All BU data to include. Length 1 for single-BU. */
  buData: BUData[];
  /** Optional custom template (overrides labels, adds rows). */
  customTemplate?: CustomTemplate | null;
  /** Optional override title used in the PDF header (e.g. custom template name). */
  customTitle?: string;
}

// ============================================================================
// GRI PDF — multi-section: GHG (305) → Energy (302) → Water (303) → Waste (306)
// ============================================================================
export function generateGRIPdf(args: ReportArgs): void {
  // Custom-template path
  if (args.customTemplate) {
    const { projectName, reportingYear, singleBUName, buData, customTemplate, customTitle } = args;
    const doc = new jsPDF('landscape');
    doc.setFontSize(15); doc.setFont('helvetica', 'bold');
    doc.text(customTitle || 'Custom GRI Report', 14, 16);
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.text(`Reporting Organisation Name: ${projectName}`, 14, 22);
    doc.text(`Reporting Year: ${reportingYear}`, 14, 28);
    if (singleBUName) doc.text(`Business Unit: ${singleBUName}`, 14, 34);

    customTemplate.sections.forEach((section, idx) => {
      if (idx > 0) doc.addPage();
      doc.setFontSize(15); doc.setFont('helvetica', 'bold');
      doc.text(ctSectionTitle(section), 14, 16);
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      doc.text(`Reporting Organisation Name: ${projectName}`, 14, 22);
      doc.text(`Reporting Year: ${reportingYear}`, 14, 28);
      if (singleBUName) doc.text(`Business Unit: ${singleBUName}`, 14, 34);

      const headerRow1: any[] = [
        { content: 'Cat.', rowSpan: 2 },
        { content: 'Reporting category', rowSpan: 2 },
      ];
      buData.forEach((bu) => headerRow1.push({ content: `${bu.businessUnitName} (BU)`, colSpan: 2, styles: { halign: 'center' } }));
      headerRow1.push({ content: 'Total', colSpan: 2, styles: { halign: 'center' } });
      const headerRow2: any[] = [];
      buData.forEach(() => { headerRow2.push({ content: 'Unit' }); headerRow2.push({ content: 'Inventory' }); });
      headerRow2.push({ content: 'Unit' }); headerRow2.push({ content: 'Inventory' });

      const body = buildCustomGRISection(args, section).slice(1); // skip section header (we used doc.text)
      autoTable(doc, {
        startY: singleBUName ? 40 : 34,
        head: [headerRow1, headerRow2],
        body,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2, lineColor: [200, 200, 200], lineWidth: 0.1 },
        headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: { 0: { cellWidth: 18, fontSize: 7 }, 1: { cellWidth: 'auto', minCellWidth: 70 } },
        margin: { left: 8, right: 8 },
      });
    });

    const fnSuffix = singleBUName ? singleBUName.replace(/\s+/g, '_') : 'All_BUs';
    const baseName = (customTitle || 'Custom_Report').replace(/\s+/g, '_');
    doc.save(`${baseName}_${projectName.replace(/\s+/g, '_')}_${fnSuffix}_${reportingYear}.pdf`);
    return;
  }


  const { projectName, reportingYear, singleBUName, buData } = args;
  const doc = new jsPDF('landscape');

  const sections: Array<{ title: string; unit: string; template: GRIRow[] }> = [
    { title: 'GRI GHG Report',                template: griGHGTemplate,    unit: 'kgCO2e' },
    { title: 'Energy Consumption Report',     template: griEnergyTemplate, unit: 'GJ' },
    { title: 'Water Consumption Report',      template: griWaterTemplate,  unit: 'ML' },
    { title: 'Waste Report',                  template: griWasteTemplate,  unit: 'ton' },
  ];

  sections.forEach((section, idx) => {
    if (idx > 0) doc.addPage();

    // Header on every page
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text(section.title, 14, 16);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Reporting Organisation Name: ${projectName}`, 14, 22);
    doc.text(`Reporting Year: ${reportingYear}`, 14, 28);
    if (singleBUName) {
      doc.text(`Business Unit: ${singleBUName}`, 14, 34);
    }

    // ── Table header (two rows, like the Excel) ──
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

    // ── Body ──
    const body: any[] = [];
    const colSpanAll = 2 + buData.length * 2 + 2;

    section.template.forEach((row) => {
      if (row.type === 'scope-header') {
        body.push([{
          content: row.name,
          colSpan: colSpanAll,
          styles: { fillColor: [209, 250, 229], textColor: [6, 78, 59], fontStyle: 'bold' },
        }]);
      } else if (row.type === 'sub-header') {
        body.push([{
          content: row.name,
          colSpan: colSpanAll,
          styles: { fillColor: [240, 253, 244], textColor: [22, 101, 52], fontStyle: 'bold' },
        }]);
      } else {
        // category data row
        const cells: any[] = [
          { content: row.category ?? '', styles: { fontSize: 7, halign: 'center' } },
          { content: row.name },
        ];
        let total = 0;
        buData.forEach((bu) => {
          const v = row.category ? getGRIValue(bu.calculatedData, row.category) : 0;
          total += v;
          cells.push({ content: section.unit, styles: { halign: 'center', fontSize: 7 } });
          cells.push({ content: formatReportValue(v), styles: { halign: 'right' } });
        });
        cells.push({ content: section.unit, styles: { halign: 'center', fontSize: 7 } });
        cells.push({
          content: formatReportValue(total),
          styles: { halign: 'right', fontStyle: 'bold', fillColor: [254, 243, 199] },
        });
        body.push(cells);
      }
    });

    autoTable(doc, {
      startY: singleBUName ? 40 : 34,
      head: [headerRow1, headerRow2],
      body,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2, lineColor: [200, 200, 200], lineWidth: 0.1 },
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 18, fontSize: 7 },
        1: { cellWidth: 'auto', minCellWidth: 70 },
      },
      margin: { left: 8, right: 8 },
    });
  });

  const fnSuffix = singleBUName ? singleBUName.replace(/\s+/g, '_') : 'All_BUs';
  doc.save(`GRI_Report_${projectName.replace(/\s+/g, '_')}_${fnSuffix}_${reportingYear}.pdf`);
}

// ============================================================================
// ISO PDF — Cat 1–6 with per-GHG columns
// ============================================================================
export function generateISOPdf(args: ReportArgs): void {
  const { projectName, reportingYear, singleBUName, buData } = args;
  const doc = new jsPDF();

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

  // Aggregate calculated_data across all BUs
  const aggregate: any[] = [];
  buData.forEach((bu) => (bu.calculatedData || []).forEach((d) => aggregate.push(d)));

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

  const body: any[] = [];
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
      else if (row.name.startsWith('Category 6')) catTotals['6'] += total;
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

  const fnSuffix = singleBUName ? singleBUName.replace(/\s+/g, '_') : 'All_BUs';
  doc.save(`ISO_Report_${projectName.replace(/\s+/g, '_')}_${fnSuffix}_${reportingYear}.pdf`);
}
