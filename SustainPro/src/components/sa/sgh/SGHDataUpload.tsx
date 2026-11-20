import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner@2.0.3';
import { Download } from 'lucide-react';
import { SGHParameters } from './SGHParameters';
import { ASSUMPTIONS, emptyParameters, type YearParameters } from './sghData';
import {
  MONTH_LABELS, SHEET_SPECS, SAMPLE_FILE_NAME, TEMPLATE_FILE_NAME,
  buildSampleWorkbook, buildTemplateWorkbook, crossSheetIssues, mergeFactors, parameterSheetsPresent, parametersFromSheets, parseFile, parseSheet,
  type ParsedSheet, type SheetIssue, type SheetKind,
} from './sghPipeline';
import type { CalculatedData } from './SGHDashboard';

/**
 * Upload screen for SGH's source workbook: download the template or sample,
 * upload, review the checks, enter building parameters, then calculate the
 * dashboard. Files are read in the browser; results are kept in this browser.
 */

const card = 'bg-white border border-[#DCE7E1] rounded-2xl';
const muted = 'text-[#4B5F57]';
const badge = (kind: 'ok' | 'warn' | 'err' | 'info') =>
  `inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${
    kind === 'ok' ? 'bg-[#ECFDF5] text-[#047857]' : kind === 'err' ? 'bg-[#FFF7ED] text-[#B45309]' : kind === 'warn' ? 'bg-[#FEF9C3] text-[#854D0E]' : 'bg-[#F3F7F5] text-[#4B5F57]'}`;
const btn = 'inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-[10px] px-4 text-sm font-semibold';

interface Props {
  reportingYear: number;
  usingSample: boolean;
  parameters: Record<number, YearParameters>;
  onParametersChange: (changes: Record<number, YearParameters>) => void;
  onCalculate: (data: CalculatedData) => void;
  onReset: () => void;
}

const FORMULAS: [string, string][] = [
  ['Emissions per row (tCO₂e)', 'quantity × emission factor (kgCO₂e per unit) ÷ 1,000'],
  ['Scopes', 'Scope 1 = Fuel + Refrigerants & Gases · Scope 2 = Electricity · Scope 3 = Waste + Water'],
  ['Yearly and block totals', 'Σ of the monthly rows in the year (and block)'],
  ['Change vs last year', '(this year − last year) ÷ last year'],
  ['EUI (kWh/m²/yr)', 'electricity kWh ÷ GFA'],
  ['Water Efficiency Index (L/person-day)', 'water m³ × 1,000 ÷ Σ (visitors + occupants per day) × operational days · provisional'],
  ['Waste Disposal Index (kg/person-day)', 'waste kg ÷ Σ (visitors + occupants per day) × operational days · provisional'],
  ['Projections', `BAU = latest × (1 + ${ASSUMPTIONS.bauGrowth * 100}%)ⁿ · predicted = least-squares trend of the history`],
  ['Targets', `emissions −${ASSUMPTIONS.emissionsReduction2030 * 100}% vs first year by 2030, net zero ${ASSUMPTIONS.horizon} · resources −${ASSUMPTIONS.resourceReduction2035 * 100}% by ${ASSUMPTIONS.horizon}`],
];

function monthRange(months: number[]) {
  if (!months.length) return '—';
  if (months.length === 12) return 'Jan–Dec';
  const contiguous = months.every((m, i) => i === 0 || m === months[i - 1] + 1);
  return contiguous ? `${MONTH_LABELS[months[0]]}–${MONTH_LABELS[months[months.length - 1]]}` : `${months.length} months`;
}

export function SGHDataUpload({ reportingYear, usingSample, parameters, onParametersChange, onCalculate, onReset }: Props) {
  const [sheets, setSheets] = useState<ParsedSheet[]>([]);
  const [dragging, setDragging] = useState(false);
  const [reading, setReading] = useState(false);
  const [paramYear, setParamYear] = useState(reportingYear);

  const addFiles = async (list: FileList | null) => {
    if (!list || !list.length) return;
    const excel = Array.from(list).filter(f => /\.xlsx?$/i.test(f.name));
    if (excel.length < list.length) toast.error('Only .xlsx and .xls files can be uploaded');
    if (!excel.length) return;
    setReading(true);
    try {
      const parsed = (await Promise.all(excel.map(f => parseFile(f).catch(() => [{ ...parseSheet(f.name, '(file)', []), issues: [{ level: 'Error' as const, text: 'Could not read this file. Check it opens in Excel.' }] }])))).flat();
      setSheets(prev => [...prev.filter(p => !excel.some(f => f.name === p.file)), ...parsed]);
      const used = parsed.filter(s => s.kind && !s.ignored).length;
      toast.success(`${excel.length} file${excel.length > 1 ? 's' : ''} read · ${used} data sheet${used === 1 ? '' : 's'} found`);
    } finally {
      setReading(false);
    }
  };

  const setKind = (i: number, kind: string) =>
    setSheets(prev => prev.map((s, j) => (j === i ? parseSheet(s.file, s.sheet, s.aoa, (kind || null) as SheetKind | null) : s)));
  const removeFile = (file: string) => setSheets(prev => prev.filter(s => s.file !== file));

  const factors = mergeFactors(sheets.flatMap(s => s.factors));
  const issues: (SheetIssue & { where?: string })[] = sheets.length ? [
    ...sheets.flatMap(s => s.issues.map(i => ({ ...i, where: `${s.file} › ${s.sheet}` }))),
    ...crossSheetIssues(sheets, factors),
  ] : [];
  const errors = issues.filter(i => i.level === 'Error').length;
  const activity = sheets.flatMap(s => (s.kind && !s.ignored ? s.activity : []));
  const years = [...new Set(activity.map(a => a.year))].sort();
  const canCalculate = sheets.length > 0 && errors === 0;

  const received = (kind: SheetKind) => sheets.filter(s => s.kind === kind && !s.ignored && s.rows > 0).reduce((a, s) => a + s.rows, 0);

  const calculate = () => {
    const paramChanges = parametersFromSheets(sheets, parameters, emptyParameters);
    if (Object.keys(paramChanges).length) onParametersChange(paramChanges);
    onCalculate({ sample: false, files: [...new Set(sheets.map(s => s.file))], calculatedAt: new Date().toISOString(), activity, factors });
    toast.success(`Dashboard calculated from ${activity.length.toLocaleString('en-US')} rows`);
  };

  const download = (wb: XLSX.WorkBook, name: string) => {
    XLSX.writeFile(wb, name);
    toast.success(`${name} downloaded`);
  };

  const steps = [
    { n: 1, title: 'Get the workbook', sub: 'Template or sample data', state: 'done' },
    { n: 2, title: 'Upload', sub: sheets.length ? `${new Set(sheets.map(s => s.file)).size} file(s) read` : 'Waiting for files', state: sheets.length ? 'done' : 'active' },
    { n: 3, title: 'Check data', sub: !sheets.length ? '—' : errors ? `${errors} error${errors > 1 ? 's' : ''} to fix` : issues.length ? `${issues.length} warning${issues.length > 1 ? 's' : ''}` : 'No issues', state: !sheets.length ? 'todo' : errors ? 'warn' : 'done' },
    { n: 4, title: 'Calculate dashboard', sub: canCalculate ? 'Ready' : 'After the checks pass', state: canCalculate ? 'active' : 'todo' },
  ];

  const files = [...new Set(sheets.map(s => s.file))];
  const paramYears = [...new Set([...years, ...Object.keys(parameters).map(Number), reportingYear])].sort((a, b) => b - a);

  return (
    <div className="flex flex-col gap-6 text-[#10231C]">
      <ol aria-label="Upload steps" className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 xl:grid-cols-4">
        {steps.map(s => (
          <li key={s.n} className={`flex items-center gap-3 rounded-[14px] border bg-white px-4 py-3.5 ${s.state === 'active' || s.state === 'done' ? 'border-[#047857]' : 'border-[#DCE7E1]'}`}>
            <span className={`flex h-7 w-7 flex-none items-center justify-center rounded-full text-[13px] font-bold ${
              s.state === 'done' || s.state === 'active' ? 'bg-[#047857] text-white' : s.state === 'warn' ? 'bg-[#FFF7ED] text-[#B45309]' : 'bg-[#E4EEE9] text-[#4B5F57]'}`}>{s.n}</span>
            <span className="flex flex-col">
              <span className="text-sm font-semibold">{s.title}</span>
              <span className={`text-xs ${s.state === 'warn' ? 'text-[#B45309]' : muted}`}>{s.sub}</span>
            </span>
          </li>
        ))}
      </ol>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <section aria-labelledby="sgh-get-h" className={`${card} flex flex-col gap-3 px-6 py-5`}>
            <h2 id="sgh-get-h" className="m-0 text-lg font-bold">1 · Get the workbook</h2>
            <p className={`m-0 text-sm ${muted}`}>
              One Excel workbook with one sheet per data type and one row per month (and per block for electricity and water).
              The sample has full monthly data for FY2021–FY2025; it is the data the dashboard shows until you upload your own. Upload it unchanged to try the whole flow.
            </p>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => download(buildSampleWorkbook(), SAMPLE_FILE_NAME)} className={`${btn} border-0 bg-[#047857] text-white hover:bg-[#065F46]`}>
                <Download className="h-4 w-4" aria-hidden="true" /> Download sample data (FY2021–2025)
              </button>
              <button type="button" onClick={() => download(buildTemplateWorkbook(), TEMPLATE_FILE_NAME)} className={`${btn} border border-[#C9D8D0] bg-white text-[#065F46] hover:bg-[#F3F7F5]`}>
                <Download className="h-4 w-4" aria-hidden="true" /> Download blank template
              </button>
            </div>
          </section>

          <section aria-labelledby="sgh-up-h" className={`${card} flex flex-col gap-4 px-6 py-5`}>
            <h2 id="sgh-up-h" className="m-0 text-lg font-bold">2 · Upload</h2>
            <label
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
              className={`relative flex cursor-pointer flex-col items-center gap-2.5 rounded-[14px] border-2 border-dashed px-4 py-8 text-center ${dragging ? 'border-[#047857] bg-[#ECFDF5]' : 'border-[#9DBFAE] bg-[#F6FAF8]'}`}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 16V4" /><path d="M7 9l5-5 5 5" /><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></svg>
              <span className="text-[15px] font-semibold">{reading ? 'Reading files…' : <>Drop Excel files here, or <span className="text-[#047857] underline">browse</span></>}</span>
              <span className={`text-[13px] ${muted}`}>The source workbook, and optionally a CWS Data Rows file (e.g. Data_Rows_Template.xlsx) with updated emission factors</span>
              <input type="file" multiple accept=".xlsx,.xls" className="sr-only" onChange={e => { addFiles(e.target.files); e.target.value = ''; }} />
            </label>
          </section>

          <section aria-labelledby="sgh-check-h" className={`${card} flex flex-col gap-3 px-6 py-5`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="sgh-check-h" className="m-0 text-lg font-bold">3 · Check the data</h2>
              {sheets.length > 0 && <span className={badge(errors ? 'err' : issues.length ? 'warn' : 'ok')}>{errors ? `${errors} error${errors > 1 ? 's' : ''}` : issues.length ? `${issues.length} warning${issues.length > 1 ? 's' : ''}` : 'All checks passed'}</span>}
            </div>
            {sheets.length === 0 ? (
              <p className={`m-0 py-4 text-center text-sm ${muted}`}>Each sheet’s data type, rows, years and blocks appear here after upload.</p>
            ) : (
              <>
                {files.map(file => (
                  <div key={file} className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-semibold">{file}</span>
                      <button type="button" onClick={() => removeFile(file)} className="min-h-8 cursor-pointer rounded-lg border border-[#C9D8D0] bg-white px-2.5 py-1 text-xs text-[#10231C] hover:bg-[#F3F7F5]">Remove file</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[640px] border-collapse text-[13px]">
                        <thead>
                          <tr className={`border-b border-[#DCE7E1] text-left ${muted}`}>
                            <th scope="col" className="px-2 py-2 font-semibold">Sheet</th>
                            <th scope="col" className="px-2 py-2 font-semibold">Data type</th>
                            <th scope="col" className="px-2 py-2 text-right font-semibold">Rows</th>
                            <th scope="col" className="px-2 py-2 font-semibold">Years</th>
                            <th scope="col" className="px-2 py-2 font-semibold">Latest year</th>
                            <th scope="col" className="px-2 py-2 font-semibold">Blocks / items</th>
                            <th scope="col" className="px-2 py-2 font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sheets.map((s, i) => s.file !== file ? null : (
                            <tr key={s.sheet} className="border-b border-[#EEF3F0] align-top">
                              <td className="px-2 py-2.5 font-semibold">{s.sheet}</td>
                              <td className="px-2 py-2.5">
                                <select aria-label={`Data type for sheet ${s.sheet}`} value={s.kind ?? ''} onChange={e => setKind(i, e.target.value)}
                                  className="h-8 max-w-[190px] rounded-lg border border-[#C9D8D0] bg-white px-2 text-[13px]">
                                  <option value="">Not used</option>
                                  {SHEET_SPECS.map(sp => <option key={sp.kind} value={sp.kind}>{sp.sheet}</option>)}
                                </select>
                              </td>
                              <td className="px-2 py-2.5 text-right">{s.kind ? s.rows.toLocaleString('en-US') : '—'}</td>
                              <td className="px-2 py-2.5">{s.years.length ? `${s.years[0]}–${s.years[s.years.length - 1]}` : '—'}</td>
                              <td className="px-2 py-2.5">{s.years.length && s.kind !== 'gfa' ? monthRange(s.latestMonths) : '—'}</td>
                              <td className="px-2 py-2.5">{s.blocks.length ? s.blocks.join(', ') : s.items.length ? s.items.join(', ') : s.factors.length ? `${s.factors.length} factors` : '—'}</td>
                              <td className="px-2 py-2.5">
                                <span className={badge(!s.kind ? 'info' : s.issues.some(x => x.level === 'Error') ? 'err' : s.issues.length ? 'warn' : 'ok')}>
                                  {!s.kind ? (s.ignored ? 'Not a data sheet' : 'Not used') : s.issues.some(x => x.level === 'Error') ? 'Error' : s.issues.length ? 'Check warnings' : 'OK'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
                <div className="flex flex-col gap-2">
                  {issues.length === 0
                    ? <p className={`m-0 text-sm ${muted}`}>All checks passed.</p>
                    : issues.map((i, idx) => (
                      <div key={idx} className={`flex items-start gap-3.5 rounded-xl p-3 ${i.level === 'Error' ? 'bg-[#FFF7ED]' : 'bg-[#FEFCE8]'}`}>
                        <span className={`w-16 flex-none pt-0.5 text-xs font-bold ${i.level === 'Error' ? 'text-[#B45309]' : 'text-[#854D0E]'}`}>{i.level}</span>
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <span className="text-[13px]">{i.text}</span>
                          {i.where && <span className={`text-xs ${muted}`}>{i.where}</span>}
                        </div>
                      </div>
                    ))}
                </div>
              </>
            )}
          </section>

          <div className="flex flex-col gap-2">
            <label className={`flex flex-wrap items-center gap-2 text-xs font-semibold ${muted}`}>Building parameters for
              <select value={paramYear} onChange={e => setParamYear(Number(e.target.value))} className="h-9 rounded-lg border border-[#C9D8D0] bg-white px-2 text-sm text-[#10231C]">
                {paramYears.map(y => <option key={y} value={y}>FY{y}</option>)}
              </select>
              {parameterSheetsPresent(sheets) && <span className="font-normal">· the uploaded GFA / Occupancy sheets replace these values when you calculate</span>}
            </label>
            <SGHParameters year={paramYear} value={parameters[paramYear] ?? emptyParameters(paramYear)}
              onChange={p => onParametersChange({ [paramYear]: p })} />
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <section aria-labelledby="sgh-calc-h" className={`${card} flex flex-col gap-3 p-5`}>
            <h2 id="sgh-calc-h" className="m-0 text-lg font-bold">4 · Calculate dashboard</h2>
            {sheets.length > 0 && (
              <p className={`m-0 text-[13px] ${muted}`}>
                {activity.length.toLocaleString('en-US')} activity rows{years.length ? ` · FY${years[0]}–FY${years[years.length - 1]}` : ''} · {factors.length} emission factors
              </p>
            )}
            <button type="button" disabled={!canCalculate} onClick={calculate}
              className={`h-11 rounded-[10px] border-0 text-sm font-semibold text-white ${canCalculate ? 'cursor-pointer bg-[#047857] hover:bg-[#065F46]' : 'cursor-not-allowed bg-[#9DBFAE]'}`}>
              Calculate KPIs and view dashboard
            </button>
            <span className={`text-center text-xs ${muted}`}>
              {!sheets.length ? 'Upload the workbook first.' : errors ? `Fix ${errors} error${errors > 1 ? 's' : ''} first.` : 'Warnings don’t block the calculation.'}
            </span>
            {!usingSample && (
              <button type="button" onClick={() => { onReset(); setSheets([]); toast.success('Dashboard reset to sample data'); }}
                className="min-h-10 cursor-pointer rounded-[10px] border border-[#C9D8D0] bg-white text-sm font-semibold text-[#065F46] hover:bg-[#F3F7F5]">
                Reset dashboard to sample data
              </button>
            )}
          </section>

          <section aria-labelledby="sgh-req-h" className={`${card} flex flex-col gap-3 p-5`}>
            <h2 id="sgh-req-h" className="m-0 text-lg font-bold">Workbook sheets</h2>
            <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
              {SHEET_SPECS.map(s => {
                const rows = received(s.kind);
                const fallback = s.kind === 'factors' ? 'Built-in' : s.kind === 'gfa' || s.kind === 'occupancy' ? 'Form below' : 'Missing';
                return (
                  <li key={s.kind} className="flex items-start justify-between gap-2.5 border-b border-[#EEF3F0] py-2 text-[13px]">
                    <span className="flex min-w-0 flex-col">
                      <span className="font-semibold">{s.sheet}{!s.required && <span className={`font-normal ${muted}`}> · optional</span>}</span>
                      <span className={`text-xs ${muted}`}>{s.description}</span>
                      <code className="mt-0.5 whitespace-normal font-mono text-[11px] text-[#065F46]">{(s.kind === 'factors' ? s.columns.slice(0, 6) : s.columns).join(' | ')}{s.kind === 'factors' ? ' | …' : ''}</code>
                    </span>
                    <span className={badge(rows ? 'ok' : s.required ? 'err' : 'info')}>{rows ? `${rows.toLocaleString('en-US')} rows` : sheets.length ? fallback : s.required ? 'Required' : 'Optional'}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section aria-labelledby="sgh-kpi-h" className={`${card} flex flex-col gap-3 p-5`}>
            <h2 id="sgh-kpi-h" className="m-0 text-lg font-bold">How the KPIs are calculated</h2>
            {FORMULAS.map(([n, r]) => (
              <div key={n} className="flex flex-col gap-1 rounded-[10px] bg-[#F6FAF8] px-3 py-2.5">
                <span className="text-[13px] font-semibold">{n}</span>
                <code className="whitespace-normal font-mono text-xs text-[#065F46]">{r}</code>
              </div>
            ))}
          </section>
        </div>
      </div>

      <p className={`m-0 text-xs ${muted}`}>Files are read in your browser. The calculated dashboard and building parameters are kept in this browser until the database is connected.</p>
    </div>
  );
}
