import React, { useMemo, useState } from 'react';
import { Upload } from 'lucide-react';
import { SGHOverview } from './SGHOverview';
import { SGHDataUpload } from './SGHDataUpload';
import { SGHBlocks } from './SGHBlocks';
import { buildDataset, computeBlocks, computeIndices, computeOverview, dataYears, emptyParameters, type YearParameters } from './sghData';
import {
  buildSampleWorkbook, mergeFactors, parametersFromSheets, parseWorkbook, SAMPLE_FILE_NAME,
  type ActivityRow, type EmissionFactor,
} from './sghPipeline';

type Tab = 'overview' | 'blocks' | 'upload';

/** The activity rows and factors the dashboard is calculated from. */
export interface CalculatedData {
  sample: boolean;
  files: string[];
  calculatedAt: string;
  activity: ActivityRow[];
  factors: EmissionFactor[];
}

const DATA_KEY = 'sgh-calculated-data-v1';
const PARAMS_KEY = 'sgh-building-parameters-v2';

/** Sample data goes through the same parsing as an uploaded file. */
function sampleData(): { data: CalculatedData; parameters: Record<number, YearParameters> } {
  const sheets = parseWorkbook(buildSampleWorkbook(), SAMPLE_FILE_NAME);
  return {
    data: { sample: true, files: [SAMPLE_FILE_NAME], calculatedAt: '', activity: sheets.flatMap(s => s.activity), factors: mergeFactors(sheets.flatMap(s => s.factors)) },
    parameters: parametersFromSheets(sheets, {}, emptyParameters),
  };
}

function load<T>(key: string): T | null {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
}

function save(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable or full */ }
}

const selectCls = 'h-10 rounded-[10px] border border-[#C9D8D0] bg-white px-2.5 text-sm text-[#10231C]';

/** Sustainability Architect dashboard for SGH: overall KPIs, block-level electricity and water, and source-data upload. */
export function SGHDashboard() {
  const sample = useMemo(sampleData, []);
  const [tab, setTab] = useState<Tab>('overview');
  const [calculated, setCalculated] = useState<CalculatedData>(() => load<CalculatedData>(DATA_KEY) ?? sample.data);
  const [parameters, setParameters] = useState<Record<number, YearParameters>>(() => load(PARAMS_KEY) ?? sample.parameters);

  const years = useMemo(() => dataYears(calculated.activity), [calculated]);
  const [chosenYear, setChosenYear] = useState<number | null>(null);
  const year = chosenYear !== null && years.includes(chosenYear) ? chosenYear : years[years.length - 1] ?? new Date().getFullYear();

  const data = useMemo(() => buildDataset(calculated.activity, calculated.factors, year), [calculated, year]);
  const overview = useMemo(() => computeOverview(data), [data]);
  const blocks = useMemo(() => computeBlocks(data), [data]);
  const indices = useMemo(() => computeIndices(data, parameters), [data, parameters]);

  const updateParameters = (changes: Record<number, YearParameters>) => setParameters(prev => {
    const next = { ...prev, ...changes };
    save(PARAMS_KEY, next);
    return next;
  });
  const applyCalculation = (next: CalculatedData) => {
    setCalculated(next);
    setChosenYear(null);
    save(DATA_KEY, next);
    setTab('overview');
  };
  const resetToSample = () => {
    try { localStorage.removeItem(DATA_KEY); localStorage.removeItem(PARAMS_KEY); } catch { /* storage unavailable */ }
    setCalculated(sample.data);
    setParameters(sample.parameters);
    setChosenYear(null);
  };

  const sourceLabel = calculated.sample
    ? `Sample data (${SAMPLE_FILE_NAME})`
    : `Uploaded ${calculated.files.join(', ')} · calculated ${new Date(calculated.calculatedAt).toLocaleString('en-SG', { dateStyle: 'medium', timeStyle: 'short' })}`;

  return (
    <div className="flex flex-col gap-6 font-sans text-[#10231C]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="text-[13px] font-semibold uppercase tracking-wider text-[#047857]">Singapore General Hospital</span>
          <h1 className="m-0 text-3xl font-bold">Sustainability Dashboard · FY{year}</h1>
          <span className="text-sm text-[#4B5F57]">
            {tab === 'blocks' ? 'By block · electricity and water only' : 'SGH overall'} · Jan–Dec {year}
            {data.monthsReported < 12 ? ` (${data.monthsReported} of 12 months reported)` : ''} compared with {year - 1}
          </span>
          <span className="flex flex-wrap items-center gap-2 text-xs text-[#4B5F57]">
            <span className={`rounded-full px-2 py-0.5 font-semibold ${calculated.sample ? 'bg-[#F3F7F5]' : 'bg-[#ECFDF5] text-[#047857]'}`}>
              {calculated.sample ? 'Sample data' : 'Uploaded data'}
            </span>
            <span className="min-w-0 break-all">{sourceLabel}</span>
          </span>
        </div>
        {tab !== 'upload' && (
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-xs font-semibold text-[#4B5F57]">Reporting year
              <select value={year} onChange={e => setChosenYear(Number(e.target.value))} className={`${selectCls} min-w-[120px]`}>
                {[...years].reverse().map(y => <option key={y} value={y}>FY{y}</option>)}
              </select>
            </label>
            <button type="button" onClick={() => setTab('upload')}
              className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-[10px] border-0 bg-[#047857] px-4 text-sm font-semibold text-white hover:bg-[#065F46]">
              <Upload className="h-4 w-4" aria-hidden="true" /> Upload data
            </button>
          </div>
        )}
      </header>

      <div role="tablist" aria-label="Dashboard views" className="flex gap-1 border-b border-[#DCE7E1]">
        {([['overview', 'Overview'], ['blocks', 'Blocks'], ['upload', 'Data upload']] as const).map(([key, label]) => (
          <button key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => setTab(key)}
            className={`-mb-px cursor-pointer border-0 border-b-2 bg-transparent px-3.5 py-2.5 text-sm ${tab === key ? 'border-[#047857] font-semibold text-[#065F46]' : 'border-transparent font-medium text-[#4B5F57] hover:text-[#10231C]'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <SGHOverview data={data} overview={overview} indices={indices} />}
      {tab === 'blocks' && <SGHBlocks blocks={blocks} year={year} factors={data.factors} />}
      {tab === 'upload' && (
        <SGHDataUpload
          reportingYear={year} usingSample={calculated.sample}
          parameters={parameters} onParametersChange={updateParameters}
          onCalculate={applyCalculation} onReset={resetToSample}
        />
      )}
    </div>
  );
}
