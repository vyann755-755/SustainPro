import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner@2.0.3';

/**
 * Upload screen for SGH's source Excel files.
 *
 * Files are read in the browser to detect their data type, blocks, months and
 * row count. The column mapping that turns them into KPIs is set up once
 * SGH's real files are received, so "Calculate KPIs" stays disabled until then.
 * Uploaded files are kept in memory only for this session.
 */

interface RequiredData {
  key: string;
  name: string;
  detail: string;
  keywords: RegExp;
}

const REQUIRED: RequiredData[] = [
  { key: 'electricity', name: 'Electricity', detail: 'kWh by block and month', keywords: /electric|power|kwh/i },
  { key: 'water', name: 'Water', detail: 'm³ by block and month', keywords: /water(?!\s*treat)|pub|m3|m³/i },
  { key: 'waste', name: 'Waste', detail: 'Tonnes by stream, block and month', keywords: /waste(?!\s*water)|refuse|recycl/i },
  { key: 'fuel', name: 'Stationary fuels', detail: 'Diesel, LPG, natural gas', keywords: /diesel|lpg|fuel|gas oil|natural gas|town gas/i },
  { key: 'refrigerant', name: 'Refrigerant top-ups', detail: 'kg by gas type', keywords: /refrig|r-?410|r-?134|r-?32|hfc/i },
  { key: 'anaesthetic', name: 'Anaesthetic gases', detail: 'Desflurane, sevoflurane, N₂O', keywords: /anaesth|anesth|desflurane|sevoflurane|nitrous|n2o/i },
  { key: 'sf6', name: 'Electrical insulating gas', detail: 'SF₆ top-ups (kg)', keywords: /sf6|sf₆|switchgear|insulating/i },
  { key: 'fire', name: 'Fire suppressant', detail: 'kg discharged or topped up', keywords: /fire|suppress|fm-?200|hfc-?227/i },
  { key: 'wastewater', name: 'Wastewater treatment', detail: 'm³ treated on site', keywords: /waste\s*water|wastewater|effluent|sewage/i },
  { key: 'profile', name: 'Block profile', detail: 'Floor area, people per day, bed-days', keywords: /profile|floor area|gfa|bed-?day|occupan|pax|headcount/i },
];

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface UploadedFile {
  id: string;
  name: string;
  typeKey: string | null;
  blocks: string[];
  months: number[];
  rows: number;
  error?: string;
}

function monthRange(months: number[]): string {
  if (!months.length) return 'Not found';
  const sorted = [...months].sort((a, b) => a - b);
  const contiguous = sorted.every((m, i) => i === 0 || m === sorted[i - 1] + 1);
  return contiguous ? `${MONTH_LABELS[sorted[0]]}–${MONTH_LABELS[sorted[sorted.length - 1]]}` : `${sorted.length} months`;
}

async function inspectFile(file: File): Promise<UploadedFile> {
  const id = `${file.name}-${file.size}-${file.lastModified}`;
  try {
    const wb = XLSX.read(await file.arrayBuffer());
    const blocks = new Set<string>();
    const months = new Set<number>();
    let rows = 0;
    let text = file.name + ' ' + wb.SheetNames.join(' ');
    wb.SheetNames.forEach(name => {
      const aoa = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[name], { header: 1, blankrows: false });
      rows += Math.max(aoa.length - 1, 0);
      aoa.slice(0, 200).forEach(row => row.forEach(cell => {
        if (typeof cell !== 'string') return;
        const c = cell.trim();
        text += ' ' + c;
        const block = c.match(/\b(?:block|blk)\s*([0-9]+[a-z]?)\b/i);
        if (block) blocks.add(`Block ${block[1].toUpperCase()}`);
        const m = MONTHS.indexOf(c.slice(0, 3).toLowerCase());
        if (m >= 0 && c.length <= 12) months.add(m);
      }));
    });
    const typeKey = REQUIRED.find(r => r.keywords.test(file.name))?.key ?? REQUIRED.find(r => r.keywords.test(text))?.key ?? null;
    return { id, name: file.name, typeKey, blocks: [...blocks].sort(), months: [...months], rows };
  } catch {
    return { id, name: file.name, typeKey: null, blocks: [], months: [], rows: 0, error: 'Could not read this file' };
  }
}

const card = 'bg-white border border-[#DCE7E1] rounded-2xl';
const muted = 'text-[#4B5F57]';
const badge = (kind: 'ok' | 'warn' | 'err') =>
  `inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${
    kind === 'ok' ? 'bg-[#ECFDF5] text-[#047857]' : kind === 'err' ? 'bg-[#FFF7ED] text-[#B45309]' : 'bg-[#F3F7F5] text-[#4B5F57]'}`;

export function SGHDataUpload({ onViewDashboard }: { onViewDashboard: () => void }) {
  const [year, setYear] = useState('2025');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [reading, setReading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = async (list: FileList | null) => {
    if (!list || !list.length) return;
    const excel = Array.from(list).filter(f => /\.xlsx?$/i.test(f.name));
    if (excel.length < list.length) toast.error('Only .xlsx and .xls files can be uploaded');
    if (!excel.length) return;
    setReading(true);
    const inspected = await Promise.all(excel.map(inspectFile));
    setFiles(prev => [...prev.filter(p => !inspected.some(i => i.id === p.id)), ...inspected]);
    setReading(false);
    toast.success(`${inspected.length} file${inspected.length > 1 ? 's' : ''} read`);
  };

  const setType = (id: string, typeKey: string) =>
    setFiles(prev => prev.map(f => (f.id === id ? { ...f, typeKey: typeKey || null } : f)));
  const remove = (id: string) => setFiles(prev => prev.filter(f => f.id !== id));

  const received = new Set(files.filter(f => f.typeKey && !f.error).map(f => f.typeKey));
  const missing = REQUIRED.filter(r => !received.has(r.key));
  const issues = [
    ...files.filter(f => f.error).map(f => ({ level: 'Error' as const, title: `${f.name}: ${f.error}`, body: 'Check the file opens in Excel, then upload it again.' })),
    ...files.filter(f => !f.error && !f.typeKey).map(f => ({ level: 'Error' as const, title: `Data type not recognised for ${f.name}`, body: 'Choose the data type in the Uploaded files table.' })),
    ...files.filter(f => !f.error && f.typeKey && f.months.length > 0 && f.months.length < 12).map(f => ({ level: 'Warning' as const, title: `${f.name} covers ${monthRange(f.months)} only`, body: 'Missing months are left empty in the dashboard.' })),
    ...files.filter(f => !f.error && f.typeKey && f.typeKey !== 'profile' && f.blocks.length === 0).map(f => ({ level: 'Warning' as const, title: `No block names found in ${f.name}`, body: 'Rows must name the block (e.g. “Block 1”) to show per-block results.' })),
    ...(missing.some(m => m.key === 'profile') ? [{ level: 'Error' as const, title: 'Block profile is missing: floor area, people per day and bed-days', body: 'Intensity KPIs (kWh/m², L/pax/day, kg/bed-day) can’t be calculated until it is uploaded.' }] : []),
  ];
  const errors = issues.filter(i => i.level === 'Error').length;

  const steps = [
    { n: 1, title: 'Upload files', sub: `${received.size} of ${REQUIRED.length} received`, state: files.length ? 'done' : 'active' },
    { n: 2, title: 'Check data', sub: files.length ? (issues.length ? `${issues.length} issue${issues.length > 1 ? 's' : ''} to resolve` : 'No issues') : 'Waiting for files', state: files.length ? (issues.length ? 'warn' : 'done') : 'todo' },
    { n: 3, title: 'Calculate KPIs', sub: 'Available once file mapping is set up', state: 'todo' },
    { n: 4, title: 'Publish to dashboard', sub: 'Not started', state: 'todo' },
  ];

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
          <section aria-labelledby="sgh-up-h" className={`${card} flex flex-col gap-4 px-6 py-5`}>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 id="sgh-up-h" className="m-0 text-lg font-bold">Upload source files</h2>
              <label className={`flex flex-col gap-1 text-xs font-semibold ${muted}`}>Reporting year
                <select value={year} onChange={e => setYear(e.target.value)} className="h-10 min-w-[120px] rounded-[10px] border border-[#C9D8D0] bg-white px-2.5 text-sm text-[#10231C]">
                  {['2025', '2024', '2023', '2022', '2021'].map(y => <option key={y} value={y}>FY{y}</option>)}
                </select>
              </label>
            </div>
            <label
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
              className={`relative flex cursor-pointer flex-col items-center gap-2.5 rounded-[14px] border-2 border-dashed px-4 py-8 text-center ${dragging ? 'border-[#047857] bg-[#ECFDF5]' : 'border-[#9DBFAE] bg-[#F6FAF8]'}`}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 16V4" /><path d="M7 9l5-5 5 5" /><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></svg>
              <span className="text-[15px] font-semibold">{reading ? 'Reading files…' : <>Drop Excel files here, or <span className="text-[#047857] underline">browse</span></>}</span>
              <span className={`text-[13px] ${muted}`}>.xlsx or .xls · several files at once · data type, blocks and months are detected from each file</span>
              <input ref={inputRef} type="file" multiple accept=".xlsx,.xls" className="sr-only"
                onChange={e => { addFiles(e.target.files); e.target.value = ''; }} />
            </label>
          </section>

          <section aria-labelledby="sgh-files-h" className={`${card} flex flex-col gap-3 px-6 py-5`}>
            <h2 id="sgh-files-h" className="m-0 text-lg font-bold">Uploaded files · FY{year}</h2>
            {files.length === 0 ? (
              <p className={`m-0 py-6 text-center text-sm ${muted}`}>No files uploaded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-[13px]">
                  <thead>
                    <tr className={`border-b border-[#DCE7E1] text-left ${muted}`}>
                      <th scope="col" className="px-2 py-2.5 font-semibold">File</th>
                      <th scope="col" className="px-2 py-2.5 font-semibold">Data type</th>
                      <th scope="col" className="px-2 py-2.5 font-semibold">Blocks</th>
                      <th scope="col" className="px-2 py-2.5 font-semibold">Months</th>
                      <th scope="col" className="px-2 py-2.5 text-right font-semibold">Rows</th>
                      <th scope="col" className="px-2 py-2.5 font-semibold">Status</th>
                      <th scope="col" className="px-2 py-2.5"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map(f => {
                      const ok = !f.error && f.typeKey;
                      return (
                        <tr key={f.id} className="border-b border-[#EEF3F0]">
                          <td className="px-2 py-3 font-semibold">{f.name}</td>
                          <td className="px-2 py-3">
                            <select aria-label={`Data type for ${f.name}`} value={f.typeKey ?? ''} onChange={e => setType(f.id, e.target.value)}
                              className="h-8 rounded-lg border border-[#C9D8D0] bg-white px-2 text-[13px]">
                              <option value="">Choose…</option>
                              {REQUIRED.map(r => <option key={r.key} value={r.key}>{r.name}</option>)}
                            </select>
                          </td>
                          <td className="px-2 py-3">{f.blocks.length ? f.blocks.join(', ') : '—'}</td>
                          <td className="px-2 py-3">{monthRange(f.months)}</td>
                          <td className="px-2 py-3 text-right">{f.rows.toLocaleString('en-US')}</td>
                          <td className="px-2 py-3"><span className={badge(f.error ? 'err' : ok ? 'ok' : 'err')}>{f.error ? 'Unreadable' : ok ? 'Read' : 'Needs data type'}</span></td>
                          <td className="whitespace-nowrap px-2 py-3 text-right">
                            <button type="button" onClick={() => remove(f.id)} className="min-h-8 cursor-pointer rounded-lg border border-[#C9D8D0] bg-white px-2.5 py-1.5 text-xs text-[#10231C] hover:bg-[#F3F7F5]">Remove</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section aria-labelledby="sgh-issues-h" className={`${card} flex flex-col gap-3 px-6 py-5`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="sgh-issues-h" className="m-0 text-lg font-bold">Issues to resolve</h2>
              {files.length > 0 && <span className={badge(issues.length ? 'err' : 'ok')}>{issues.length ? `${issues.length} open` : 'None'}</span>}
            </div>
            {files.length === 0 ? (
              <p className={`m-0 text-sm ${muted}`}>Issues appear here after files are uploaded.</p>
            ) : issues.length === 0 ? (
              <p className={`m-0 text-sm ${muted}`}>All uploaded files look complete.</p>
            ) : issues.map((i, idx) => (
              <div key={idx} className={`flex items-start gap-3.5 rounded-xl p-3.5 ${i.level === 'Error' ? 'bg-[#FFF7ED]' : 'bg-[#F3F7F5]'}`}>
                <span className={`pt-0.5 text-xs font-bold ${i.level === 'Error' ? 'text-[#B45309]' : muted}`}>{i.level}</span>
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-sm font-semibold">{i.title}</span>
                  <span className={`text-[13px] ${muted}`}>{i.body}</span>
                </div>
              </div>
            ))}
          </section>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <section aria-labelledby="sgh-req-h" className={`${card} flex flex-col gap-3 p-5`}>
            <h2 id="sgh-req-h" className="m-0 text-lg font-bold">Required data · FY{year}</h2>
            <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
              {REQUIRED.map(r => (
                <li key={r.key} className="flex items-center justify-between gap-2.5 border-b border-[#EEF3F0] py-2 text-[13px]">
                  <span className="flex flex-col"><span className="font-semibold">{r.name}</span><span className={`text-xs ${muted}`}>{r.detail}</span></span>
                  <span className={badge(received.has(r.key) ? 'ok' : 'err')}>{received.has(r.key) ? 'Uploaded' : 'Missing'}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="sgh-kpi-h" className={`${card} flex flex-col gap-3 p-5`}>
            <h2 id="sgh-kpi-h" className="m-0 text-lg font-bold">KPIs that will be calculated</h2>
            {[
              ['Total carbon emissions (tCO₂e)', 'Σ (quantity × emission factor) ÷ 1,000'],
              ['Scope & category breakdown', 'grouped by each data type’s scope and category'],
              ['Electricity, water, waste totals', 'Σ monthly readings per block'],
              ['Intensity', 'kWh ÷ floor area · L ÷ people ÷ days · kg ÷ bed-days'],
              ['Change vs last year', '(this year − last year) ÷ last year'],
              ['Projections to 2035', 'BAU growth rate · y = ax² + bx trend · targets'],
            ].map(([n, r]) => (
              <div key={n} className="flex flex-col gap-1 rounded-[10px] bg-[#F6FAF8] px-3 py-2.5">
                <span className="text-[13px] font-semibold">{n}</span>
                <code className="whitespace-normal font-mono text-xs text-[#065F46]">{r}</code>
              </div>
            ))}
            <button type="button" disabled className="mt-1 h-11 cursor-not-allowed rounded-[10px] border-0 bg-[#9DBFAE] text-sm font-semibold text-white">
              Calculate KPIs
            </button>
            <span className={`text-center text-xs ${muted}`}>
              Available once the column mapping for SGH’s source files is set up{errors ? ` · ${errors} error${errors > 1 ? 's' : ''} to resolve first` : ''}.
            </span>
            <button type="button" onClick={onViewDashboard} className="min-h-10 cursor-pointer rounded-[10px] border border-[#C9D8D0] bg-white text-sm font-semibold text-[#065F46] hover:bg-[#F3F7F5]">
              View dashboard (sample data)
            </button>
          </section>
        </div>
      </div>

      <p className={`m-0 text-xs ${muted}`}>Uploaded files are read in your browser and kept for this session only.</p>
    </div>
  );
}
