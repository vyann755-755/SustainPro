import React, { useMemo, useState } from 'react';
import { Upload } from 'lucide-react';
import { SGHOverview } from './SGHOverview';
import { SGHDataUpload } from './SGHDataUpload';
import { computeOverview, sampleDataset, type Scope2Method } from './sghData';

type Tab = 'overview' | 'upload';

const selectCls = 'h-10 rounded-[10px] border border-[#C9D8D0] bg-white px-2.5 text-sm text-[#10231C]';

/** Sustainability Architect dashboard for SGH: KPI overview plus source-file upload. */
export function SGHDashboard() {
  const [tab, setTab] = useState<Tab>('overview');
  const [method, setMethod] = useState<Scope2Method>('location');
  const data = sampleDataset;
  const overview = useMemo(() => computeOverview(data, method), [data, method]);

  return (
    <div className="flex flex-col gap-6 font-sans text-[#10231C]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold uppercase tracking-wider text-[#047857]">Singapore General Hospital</span>
          <h1 className="m-0 text-3xl font-bold">Sustainability Dashboard · FY{data.reportingYear}</h1>
          <span className="text-sm text-[#4B5F57]">
            All blocks · Jan–Dec {data.reportingYear} compared with Jan–Dec {data.reportingYear - 1} · sample data until source files are uploaded
          </span>
        </div>
        {tab === 'overview' && (
          <div className="flex flex-wrap items-end gap-3">
            {/* Filters are disabled while the dashboard shows sample data; they act on uploaded data. */}
            <label className="flex flex-col gap-1 text-xs font-semibold text-[#4B5F57]" title="Available once source files are uploaded">Block
              <select disabled className={`${selectCls} min-w-[150px] cursor-not-allowed opacity-60`} defaultValue="all">
                <option value="all">All blocks</option>
                {data.blocks.map(b => <option key={b.name}>{b.name}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-[#4B5F57]" title="Available once source files are uploaded">From
              <select disabled className={`${selectCls} cursor-not-allowed opacity-60`} defaultValue="Jan 2025"><option>Jan 2025</option></select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-[#4B5F57]" title="Available once source files are uploaded">To
              <select disabled className={`${selectCls} cursor-not-allowed opacity-60`} defaultValue="Dec 2025"><option>Dec 2025</option></select>
            </label>
            <button type="button" onClick={() => setTab('upload')}
              className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-[10px] border-0 bg-[#047857] px-4 text-sm font-semibold text-white hover:bg-[#065F46]">
              <Upload className="h-4 w-4" aria-hidden="true" /> Upload data
            </button>
          </div>
        )}
      </header>

      <div role="tablist" aria-label="Dashboard views" className="flex gap-1 border-b border-[#DCE7E1]">
        {([['overview', 'Overview'], ['upload', 'Data upload']] as const).map(([key, label]) => (
          <button key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => setTab(key)}
            className={`-mb-px cursor-pointer border-0 border-b-2 bg-transparent px-3.5 py-2.5 text-sm ${tab === key ? 'border-[#047857] font-semibold text-[#065F46]' : 'border-transparent font-medium text-[#4B5F57] hover:text-[#10231C]'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview'
        ? <SGHOverview data={data} overview={overview} method={method} onMethodChange={setMethod} />
        : <SGHDataUpload onViewDashboard={() => setTab('overview')} />}
    </div>
  );
}
