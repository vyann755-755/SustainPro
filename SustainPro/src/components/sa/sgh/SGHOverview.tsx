import React from 'react';
import {
  SCOPE_COLORS, LINE_COLORS, ASSUMPTIONS,
  fmt, fmtK, pctChange, niceScale, bauPath, trendPath, linePath,
  type Overview, type ResourceIndex, type ResourceKey, type ResourceSeries, type SGHDataset,
} from './sghData';
import { MONTH_LABELS } from './sghPipeline';

/**
 * SGH dashboard overview for SGH as a whole, told as four chapters that follow the SGH mock-up:
 * headline KPIs → emissions profile → emissions trend → resource performance.
 * Block-level electricity and water are in SGHBlocks.
 * Each chapter opens with a one-line takeaway calculated from the data.
 */

export const card = 'bg-white border border-[#DCE7E1] rounded-2xl';
export const muted = 'text-[#4B5F57]';

function Change({ cur, prev, vsYear, light = false }: { cur: number; prev: number | null; vsYear: number; light?: boolean }) {
  const d = pctChange(cur, prev);
  if (d === null) return <span className={`whitespace-nowrap text-xs ${light ? '' : muted}`}>No {vsYear} data to compare</span>;
  const down = d <= 0;
  const color = light ? '' : down ? 'text-[#047857]' : 'text-[#B45309]';
  return (
    <span className={`whitespace-nowrap text-sm font-semibold ${color}`}>
      {down ? '↓' : '↑'} {Math.abs(d * 100).toFixed(1)}% <span className={`font-normal ${light ? '' : muted}`}>vs {vsYear}</span>
    </span>
  );
}

export function Chapter({ n, id, title, takeaway, children }: { n: number; id: string; title: string; takeaway: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="flex scroll-mt-6 flex-col gap-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[#047857] text-[13px] font-bold text-white">{n}</span>
        <div className="flex flex-col gap-1">
          <h2 id={`${id}-h`} className="m-0 text-xl font-bold">{title}</h2>
          <p className={`m-0 text-[15px] ${muted}`}>{takeaway}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export function LegendItem({ swatch, label }: { swatch: React.ReactNode; label: string }) {
  return <span className="flex items-center gap-1.5">{swatch}{label}</span>;
}
export const box = (c: string) => <span className="h-3 w-3 rounded-[3px]" style={{ background: c }} />;
const line = (c: string, dashed = false) => <span className="w-[18px]" style={{ borderTop: `3px ${dashed ? 'dashed' : 'solid'} ${c}` }} />;

/** Donut ring segments drawn with stroke-dasharray, starting at 12 o'clock. */
function Ring({ items, r, width, cx }: { items: { v: number; color: string; key: string }[]; r: number; width: number; cx: number }) {
  const C = 2 * Math.PI * r;
  const total = items.reduce((a, b) => a + b.v, 0);
  let acc = 0;
  return (
    <g transform={`rotate(-90 ${cx} ${cx})`}>
      {items.map(it => {
        const len = total ? (it.v / total) * C : 0;
        const el = <circle key={it.key} cx={cx} cy={cx} r={r} fill="none" stroke={it.color} strokeWidth={width}
          strokeDasharray={`${Math.max(len - 1.5, 0.5)} ${C - len + 1.5}`} strokeDashoffset={-acc} />;
        acc += len;
        return el;
      })}
    </g>
  );
}

interface ProjectionChartProps {
  width: number; height: number; pad: { l: number; r: number; t: number; b: number };
  /** History years followed by projection years. */
  years: number[];
  history: number[];
  /** Projections, each starting at the latest actual. */
  bau: number[]; predicted: number[];
  fontSize: number; barWidth: number;
  tickFmt: (v: number) => string; ariaLabel: string; yTitle: string;
  /** Horizontal target lines (emissions chart) … */
  targetLines?: { value: number; label: string }[];
  /** … or a declining target trajectory (resource charts). */
  targetPath?: number[];
}

/** Historical bars with BAU, predicted and target projections to the horizon year. */
function ProjectionChart(p: ProjectionChartProps) {
  const { max, ticks } = niceScale(Math.max(...p.history, ...p.bau, ...p.predicted, ...(p.targetPath ?? []), ...(p.targetLines?.map(t => t.value) ?? [])) * 1.05);
  const n = p.years.length, pw = p.width - p.pad.l - p.pad.r, ph = p.height - p.pad.t - p.pad.b;
  const x = (i: number) => p.pad.l + pw * (i + 0.5) / n;
  const y = (v: number) => p.pad.t + ph * (1 - v / max);
  const base = p.pad.t + ph;
  const h0 = p.history.length - 1;
  const pts = (arr: number[]) => arr.map((v, j) => `${x(h0 + j).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const split = (x(h0) + x(h0 + 1)) / 2;
  const small = p.fontSize < 12;
  return (
    <svg viewBox={`0 0 ${p.width} ${p.height}`} className="w-full" role="img" aria-label={p.ariaLabel}>
      <text x={12} y={p.pad.t + ph / 2} transform={`rotate(-90 12 ${p.pad.t + ph / 2})`} textAnchor="middle" fontSize={p.fontSize} fill="#4B5F57">{p.yTitle}</text>
      {ticks.map(t => (
        <g key={t}>
          <line x1={p.pad.l} x2={p.width - p.pad.r} y1={y(t)} y2={y(t)} stroke="#E4EEE9" />
          <text x={p.pad.l - 6} y={y(t) + 4} textAnchor="end" fontSize={p.fontSize} fill="#4B5F57">{p.tickFmt(t)}</text>
        </g>
      ))}
      {p.history.map((v, i) => (
        <rect key={i} x={x(i) - p.barWidth / 2} y={y(v)} width={p.barWidth} height={base - y(v)} rx={2} fill={LINE_COLORS.historical} />
      ))}
      <line x1={split} x2={split} y1={p.pad.t} y2={base} stroke="#C9D8D0" strokeDasharray="4 4" />
      <text x={split + 6} y={p.pad.t + p.fontSize} fontSize={p.fontSize} fill="#4B5F57">Projections →</text>
      {p.targetLines?.map(t => {
        const w = t.label.length * 6.6 + 14, lx = p.width - p.pad.r - w - 4;
        return (
          <g key={t.label}>
            <line x1={p.pad.l} x2={p.width - p.pad.r} y1={y(t.value)} y2={y(t.value)} stroke={LINE_COLORS.target} strokeWidth={2.5} strokeDasharray="8 6" />
            <rect x={lx} y={y(t.value) - 22} width={w} height={18} rx={4} fill={LINE_COLORS.target} />
            <text x={lx + 7} y={y(t.value) - 9} fontSize={11} fontWeight={600} fill="#FFFFFF">{t.label}</text>
          </g>
        );
      })}
      {p.targetPath && <polyline points={pts(p.targetPath)} fill="none" stroke={LINE_COLORS.target} strokeWidth={2.5} strokeDasharray="6 5" />}
      <polyline points={pts(p.bau)} fill="none" stroke={LINE_COLORS.bau} strokeWidth={small ? 2.5 : 3} strokeLinejoin="round" />
      <polyline points={pts(p.predicted)} fill="none" stroke={LINE_COLORS.predicted} strokeWidth={small ? 2.5 : 3} strokeLinejoin="round" />
      {p.years.map((yr, i) => (
        <text key={yr} x={x(i)} y={p.height - 6} textAnchor="middle" fontSize={p.fontSize} fill="#4B5F57">
          {small ? (i % 2 ? '' : `'${String(yr).slice(2)}`) : yr}
        </text>
      ))}
    </svg>
  );
}

/** Chart unit and headline total for each resource; `annual` and `monthly` are in kWh, m³ and kg. */
const DISPLAY: Record<ResourceKey, { chartUnit: string; scale: number; total: (v: number) => string; unit: string; kpi: string }> = {
  energy: { chartUnit: 'GWh', scale: 1e-6, total: v => `${(v / 1e6).toFixed(1)}M`, unit: 'kWh', kpi: 'Electricity' },
  water: { chartUnit: 'thousand m³', scale: 1e-3, total: v => fmt(v), unit: 'm³', kpi: 'Water' },
  waste: { chartUnit: 'tonnes', scale: 1e-3, total: v => fmt(v / 1000), unit: 'tonnes', kpi: 'Waste' },
};

function MonthlyBars({ r, year }: { r: ResourceSeries; year: number }) {
  const scale = DISPLAY[r.key].scale;
  const max = Math.max(...r.monthly.map(v => v ?? 0)) * scale * 1.1 || 1;
  return (
    <svg viewBox="0 0 360 110" className="w-full" role="img" aria-label={`Monthly ${DISPLAY[r.key].kpi.toLowerCase()} in ${year}`}>
      {r.monthly.map((v, i) => {
        const h = ((v ?? 0) * scale / max) * 86, cx = 26 + i * 29;
        return (
          <g key={i}>
            <title>{`${MONTH_LABELS[i]} ${year}: ${v === null ? 'no data' : `${(v * scale).toLocaleString('en-US', { maximumFractionDigits: 2 })} ${DISPLAY[r.key].chartUnit}`}`}</title>
            {v === null
              ? <text x={cx} y={88} textAnchor="middle" fontSize={10} fill="#9DBFAE">–</text>
              : <rect x={cx - 10} y={92 - h} width={20} height={h} rx={3} fill={r.color} opacity={0.75} />}
            <text x={cx} y={106} textAnchor="middle" fontSize={11} fill="#4B5F57">{MONTH_LABELS[i][0]}</text>
          </g>
        );
      })}
    </svg>
  );
}

function ResourceCard({ r, index, data }: { r: ResourceSeries; index: ResourceIndex; data: SGHDataset }) {
  const d = DISPLAY[r.key];
  const history = r.annual.map(v => v * d.scale);
  const last = history[history.length - 1];
  const steps = Math.max(ASSUMPTIONS.horizon - data.reportingYear, 0) + 1;
  const years = [...data.historyYears, ...Array.from({ length: steps - 1 }, (_, k) => data.reportingYear + k + 1)];
  const hasPrev = data.historyYears[data.historyYears.length - 2] === data.reportingYear - 1;
  return (
    <div className={`${card} flex flex-col gap-4 p-5`}>
      <h3 className="m-0 text-base font-bold uppercase tracking-wide" style={{ color: r.color }}>{r.title}</h3>
      <div className="flex flex-col gap-1 border-b border-[#EEF3F0] pb-3">
        <span className={`text-[13px] ${muted}`}>{r.totalLabel}</span>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-[26px] font-bold">{d.total(r.annual[r.annual.length - 1])} <span className={`text-sm font-medium ${muted}`}>{d.unit}</span></span>
          <Change cur={last} prev={hasPrev ? history[history.length - 2] : null} vsYear={data.reportingYear - 1} />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className={`text-[13px] ${muted}`} title={index.formula}>
          {index.label} ({index.unit}){index.provisional && <span className="ml-1.5 rounded-full bg-[#F3F7F5] px-1.5 py-0.5 text-[11px] font-semibold">Provisional formula</span>}
        </span>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-[26px] font-bold" style={{ color: r.color }}>
            {index.current === null ? '—' : index.current.toLocaleString('en-US', { minimumFractionDigits: index.decimals, maximumFractionDigits: index.decimals })}
          </span>
          {index.current !== null
            ? <Change cur={index.current} prev={index.previous} vsYear={data.reportingYear - 1} />
            : <span className={`text-xs ${muted}`}>Enter building parameters in Data upload</span>}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className={`text-xs font-semibold ${muted}`}>Annual trend and projection</span>
        <ProjectionChart
          width={360} height={180} pad={{ l: 40, r: 8, t: 10, b: 22 }} barWidth={12} fontSize={11}
          years={years} history={history}
          bau={bauPath(last, steps)}
          predicted={trendPath(history, steps)}
          targetPath={linePath(last, history[0] * (1 - ASSUMPTIONS.resourceReduction2035), steps)}
          yTitle={d.chartUnit}
          tickFmt={v => (v >= 1000 ? `${v / 1000}k` : String(v))}
          ariaLabel={`${r.title}: ${data.historyYears[0]} to ${data.reportingYear} actuals with projections to ${ASSUMPTIONS.horizon}`}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className={`text-xs font-semibold ${muted}`}>Monthly {data.reportingYear} · {d.chartUnit}</span>
        <MonthlyBars r={r} year={data.reportingYear} />
      </div>
    </div>
  );
}

export function SGHOverview({ data, overview: ov, indices }: { data: SGHDataset; overview: Overview; indices: Record<ResourceKey, ResourceIndex> }) {
  const year = data.reportingYear;
  const prevYear = year - 1;
  const firstYear = data.historyYears[0];
  const hasPrev = data.historyYears[data.historyYears.length - 2] === prevYear;
  const resourceLast = (r: ResourceSeries) => r.annual[r.annual.length - 1];
  const resourcePrev = (r: ResourceSeries) => (hasPrev ? r.annual[r.annual.length - 2] : null);
  const kpis = [
    { label: 'Total carbon emissions', value: fmt(ov.total), unit: 'tCO₂e', cur: ov.total, prev: ov.previous },
    ...data.resources.map(r => ({ label: DISPLAY[r.key].kpi, value: DISPLAY[r.key].total(resourceLast(r)), unit: DISPLAY[r.key].unit, cur: resourceLast(r), prev: resourcePrev(r) })),
  ];

  // Takeaways — one sentence per chapter, written from the data.
  const fell = data.resources.filter(r => { const p = resourcePrev(r); return p !== null && resourceLast(r) < p; }).map(r => DISPLAY[r.key].kpi.toLowerCase());
  const t1 = ov.yoy === null
    ? `Total emissions were ${fmt(ov.total)} tCO₂e in ${year}${data.monthsReported < 12 ? ` (${data.monthsReported} of 12 months reported)` : ''}.`
    : `Total emissions ${ov.yoy <= 0 ? 'fell' : 'rose'} ${Math.abs(ov.yoy * 100).toFixed(1)}% to ${fmt(ov.total)} tCO₂e in ${year}` +
      (fell.length === 3 ? ', and electricity, water and waste use all fell too.' : fell.length ? `; ${fell.join(' and ')} use also fell.` : '.');
  const share = (v: number) => (ov.total ? v / ov.total : 0);
  const s1 = share(ov.scopes[0].value), s2 = share(ov.scopes[1].value);
  const t2 = ov.largest
    ? `${ov.largest.name} is the largest single source at ${(share(ov.largest.tCO2e) * 100).toFixed(0)}% of emissions, while Scope 1 direct sources together make up ${(s1 * 100).toFixed(0)}%.`
    : 'No emissions calculated for this year.';
  const target = `${Math.round(ASSUMPTIONS.emissionsReduction2030 * 100)}%`;
  const t3 = ov.predicted2030 === null
    ? `Emissions compared with the ${target} reduction target for 2030 (${fmt(ov.target2030)} tCO₂e).`
    : ov.predicted2030 <= ov.target2030
      ? `On the current trend, emissions reach ${fmt(ov.predicted2030)} tCO₂e by 2030, meeting the ${target} reduction target of ${fmt(ov.target2030)} tCO₂e.`
      : `On the current trend, emissions reach ${fmt(ov.predicted2030)} tCO₂e in 2030, above the ${target} target of ${fmt(ov.target2030)} tCO₂e (${firstYear} baseline).`;
  const compared = Object.values(indices).filter(i => i.current !== null && i.previous !== null);
  const improved = compared.filter(i => i.current! < i.previous!).length;
  const t4 = compared.length === 0
    ? 'Enter GFA, operational days, visitors and occupants in Data upload to calculate EUI, Water Efficiency Index and Waste Disposal Index.'
    : improved === compared.length
      ? `EUI, Water Efficiency Index and Waste Disposal Index all improved compared with ${prevYear}.`
      : `${improved} of ${compared.length} indices improved compared with ${prevYear}.`;

  const years = [...data.historyYears, ...ov.projYears.slice(1)];
  return (
    <div className="flex flex-col gap-10 text-[#10231C]">
      <Chapter n={1} id="sgh-kpis" title={`How much did we emit in ${year}?`} takeaway={t1}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map(k => (
            <div key={k.label} className={`${card} flex flex-col gap-2 px-5 py-[18px]`}>
              <span className={`text-[13px] font-semibold ${muted}`}>{k.label} ({k.unit})</span>
              <span className="text-[32px] font-bold leading-tight">{k.value}</span>
              <Change cur={k.cur} prev={k.prev} vsYear={prevYear} />
            </div>
          ))}
        </div>
      </Chapter>

      <Chapter n={2} id="sgh-profile" title="Where do our emissions come from?" takeaway={t2}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {ov.scopes.map(s => (
            <div key={s.scope} className="flex flex-col gap-1.5 rounded-2xl px-5 py-4 text-white" style={{ background: SCOPE_COLORS[s.scope] }}>
              <span className="text-[13px] font-semibold uppercase tracking-wide">Scope {s.scope}</span>
              <span className="text-[28px] font-bold leading-tight">{fmt(s.value)} <span className="text-sm font-medium">tCO₂e</span></span>
              <Change cur={s.value} prev={s.previous} vsYear={prevYear} light />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className={`${card} flex flex-col gap-3 p-5`}>
            <h3 className="m-0 text-[15px] font-semibold">Scope-wise total emission breakdown</h3>
            <div className="flex justify-center">
              <svg viewBox="0 0 220 220" width={220} height={220} role="img" aria-label={`Scope split: Scope 1 ${(s1 * 100).toFixed(0)}%, Scope 2 ${(s2 * 100).toFixed(0)}%, Scope 3 ${((1 - s1 - s2) * 100).toFixed(0)}%`}>
                <Ring cx={110} r={80} width={30} items={ov.scopes.map(s => ({ key: String(s.scope), v: s.value, color: SCOPE_COLORS[s.scope] }))} />
                <text x={110} y={106} textAnchor="middle" fontSize={24} fontWeight={700} fill="#10231C">{fmt(ov.total)}</text>
                <text x={110} y={128} textAnchor="middle" fontSize={12} fill="#4B5F57">tCO₂e</text>
              </svg>
            </div>
            <div className="flex flex-col gap-2">
              {ov.scopes.map(s => (
                <div key={s.scope} className="flex items-center justify-between text-[13px]">
                  <LegendItem swatch={box(SCOPE_COLORS[s.scope])} label={`Scope ${s.scope}`} />
                  <span className="font-semibold">{(share(s.value) * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`${card} flex flex-col gap-3 p-5`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="m-0 text-[15px] font-semibold">Category-wise total emission breakdown</h3>
              <span className={`text-xs ${muted}`}>Inner ring: scope · outer ring: category</span>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <svg viewBox="0 0 240 240" width={240} height={240} className="flex-none" role="img" aria-label="Emissions by scope (inner ring) and category (outer ring)">
                <Ring cx={120} r={58} width={30} items={ov.scopes.map(s => ({ key: String(s.scope), v: s.value, color: SCOPE_COLORS[s.scope] }))} />
                <Ring cx={120} r={95} width={34} items={data.sources.map(s => ({ key: s.name, v: s.tCO2e, color: s.color }))} />
              </svg>
              <div className="flex min-w-0 flex-[1_1_280px] flex-col gap-3">
                {([1, 2, 3] as const).map(sc => (
                  <div key={sc} className="flex flex-col gap-1">
                    <span className="text-xs font-bold uppercase tracking-wide" style={{ color: SCOPE_COLORS[sc] }}>Scope {sc}</span>
                    {data.sources.filter(s => s.scope === sc).map(s => (
                      <div key={s.name} className="grid grid-cols-[12px_minmax(0,1fr)_auto_44px] items-center gap-2 text-[13px]">
                        <span className="h-3 w-3 rounded-[3px]" style={{ background: s.color }} />
                        <span className="truncate">{s.name}</span>
                        <span className="font-semibold">{fmt(s.tCO2e)}</span>
                        <span className={`text-right ${muted}`}>{(share(s.tCO2e) * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Chapter>

      <Chapter n={3} id="sgh-trend" title="Where are our emissions heading?" takeaway={t3}>
        <div className={`${card} flex flex-col gap-3 px-6 py-5`}>
          <div className={`flex flex-wrap gap-x-5 gap-y-2 text-xs ${muted}`}>
            <LegendItem swatch={box(LINE_COLORS.historical)} label={`Historical emissions (${firstYear}–${year})`} />
            <LegendItem swatch={line(LINE_COLORS.bau)} label={`BAU projection (+${ASSUMPTIONS.bauGrowth * 100}% a year)`} />
            <LegendItem swatch={line(LINE_COLORS.predicted)} label="Predicted trend" />
            <LegendItem swatch={line(LINE_COLORS.target, true)} label="Targets" />
          </div>
          <ProjectionChart
            width={960} height={340} pad={{ l: 60, r: 16, t: 16, b: 28 }} barWidth={36} fontSize={12}
            years={years} history={ov.history} bau={ov.bau} predicted={ov.predicted}
            targetLines={[{ value: ov.target2030, label: `2030 · ${target} target` }, { value: 0, label: `${ASSUMPTIONS.horizon} · Net zero target` }]}
            yTitle="Annual emissions (tCO₂e)"
            tickFmt={v => (v === 0 ? '0' : fmtK(v))}
            ariaLabel={`Annual emissions ${firstYear} to ${year} with BAU and predicted projections to ${ASSUMPTIONS.horizon}, against the 2030 and net zero targets`}
          />
        </div>
      </Chapter>

      <Chapter n={4} id="sgh-resources" title="How are we using energy, water and materials?" takeaway={t4}>
        <div className={`flex flex-wrap gap-x-5 gap-y-2 text-xs ${muted}`}>
          <LegendItem swatch={box(LINE_COLORS.historical)} label={`Historical (${firstYear}–${year})`} />
          <LegendItem swatch={line(LINE_COLORS.bau)} label="BAU projection" />
          <LegendItem swatch={line(LINE_COLORS.predicted)} label="Predicted path" />
          <LegendItem swatch={line(LINE_COLORS.target, true)} label={`Target trajectory (−${ASSUMPTIONS.resourceReduction2035 * 100}% by ${ASSUMPTIONS.horizon})`} />
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          {data.resources.map(r => <ResourceCard key={r.key} r={r} index={indices[r.key]} data={data} />)}
        </div>
      </Chapter>
    </div>
  );
}
