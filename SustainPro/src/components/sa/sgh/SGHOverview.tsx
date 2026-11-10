import React from 'react';
import {
  SCOPE_COLORS, LINE_COLORS, YEARS, BAU_WOBBLE, PREDICTED_WOBBLE,
  fmt, fmtK, pctChange, projectPath,
  type Overview, type ResourceSeries, type SGHDataset,
} from './sghData';

/**
 * SGH dashboard overview, told as five chapters that follow the SGH mock-up:
 * headline KPIs → emissions profile → emissions trend → resource performance → block ranking.
 * Each chapter opens with a one-line takeaway calculated from the data.
 */

const card = 'bg-white border border-[#DCE7E1] rounded-2xl';
const muted = 'text-[#4B5F57]';

function Change({ cur, prev, label = 'vs 2024' }: { cur: number; prev: number; label?: string }) {
  const d = pctChange(cur, prev);
  const down = d <= 0;
  return (
    <span className={`whitespace-nowrap text-sm font-semibold ${down ? 'text-[#047857]' : 'text-[#B45309]'}`}>
      {down ? '↓' : '↑'} {Math.abs(d * 100).toFixed(1)}% <span className={`font-normal ${muted}`}>{label}</span>
    </span>
  );
}

function Chapter({ n, id, title, takeaway, children }: { n: number; id: string; title: string; takeaway: string; children: React.ReactNode }) {
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

function LegendItem({ swatch, label }: { swatch: React.ReactNode; label: string }) {
  return <span className="flex items-center gap-1.5">{swatch}{label}</span>;
}
const box = (c: string) => <span className="h-3 w-3 rounded-[3px]" style={{ background: c }} />;
const line = (c: string, dashed = false) => <span className="w-[18px]" style={{ borderTop: `3px ${dashed ? 'dashed' : 'solid'} ${c}` }} />;

/** Donut ring segments drawn with stroke-dasharray, starting at 12 o'clock. */
function Ring({ items, r, width, cx }: { items: { v: number; color: string; key: string }[]; r: number; width: number; cx: number }) {
  const C = 2 * Math.PI * r;
  const total = items.reduce((a, b) => a + b.v, 0);
  let acc = 0;
  return (
    <g transform={`rotate(-90 ${cx} ${cx})`}>
      {items.map(it => {
        const len = (it.v / total) * C;
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
  history: number[]; bau: number[]; predicted: number[];
  max: number; ticks: number[]; fontSize: number; barWidth: number;
  tickFmt: (v: number) => string; ariaLabel: string; yTitle: string;
  /** Horizontal target lines (emissions chart) … */
  targetLines?: { value: number; label: string }[];
  /** … or a declining target trajectory (resource charts). */
  targetPath?: number[];
}

/** Historical bars 2021–2025 with BAU, predicted and target projections to 2035. */
function ProjectionChart(p: ProjectionChartProps) {
  const n = YEARS.length, pw = p.width - p.pad.l - p.pad.r, ph = p.height - p.pad.t - p.pad.b;
  const x = (i: number) => p.pad.l + pw * (i + 0.5) / n;
  const y = (v: number) => p.pad.t + ph * (1 - v / p.max);
  const base = p.pad.t + ph;
  const h0 = p.history.length - 1;
  const pts = (arr: number[]) => arr.map((v, j) => `${x(h0 + j).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const split = (x(h0) + x(h0 + 1)) / 2;
  const small = p.fontSize < 12;
  return (
    <svg viewBox={`0 0 ${p.width} ${p.height}`} className="w-full" role="img" aria-label={p.ariaLabel}>
      <text x={12} y={p.pad.t + ph / 2} transform={`rotate(-90 12 ${p.pad.t + ph / 2})`} textAnchor="middle" fontSize={p.fontSize} fill="#4B5F57">{p.yTitle}</text>
      {p.ticks.map(t => (
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
      {YEARS.map((yr, i) => (
        <text key={yr} x={x(i)} y={p.height - 6} textAnchor="middle" fontSize={p.fontSize} fill="#4B5F57">
          {small ? (i % 2 ? '' : `'${String(yr).slice(2)}`) : yr}
        </text>
      ))}
    </svg>
  );
}

function MonthlyBars({ r }: { r: ResourceSeries }) {
  const max = Math.max(...r.monthly) * 1.1;
  const initials = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  return (
    <svg viewBox="0 0 360 110" className="w-full" role="img" aria-label={`Monthly ${r.title.toLowerCase().replace(' performance', '')} in 2025`}>
      {r.monthly.map((v, i) => {
        const h = (v / max) * 86, cx = 26 + i * 29;
        return (
          <g key={i}>
            <rect x={cx - 10} y={92 - h} width={20} height={h} rx={3} fill={r.color} opacity={0.75} />
            <text x={cx} y={106} textAnchor="middle" fontSize={11} fill="#4B5F57">{initials[i]}</text>
          </g>
        );
      })}
    </svg>
  );
}

function ResourceCard({ r }: { r: ResourceSeries }) {
  const last = r.history[r.history.length - 1];
  const prev = r.history[r.history.length - 2];
  const p = r.projection;
  return (
    <div className={`${card} flex flex-col gap-4 p-5`}>
      <h3 className="m-0 text-base font-bold uppercase tracking-wide" style={{ color: r.color }}>{r.title}</h3>
      <div className="flex flex-col gap-1 border-b border-[#EEF3F0] pb-3">
        <span className={`text-[13px] ${muted}`}>{r.totalLabel}</span>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-[26px] font-bold">{r.total} <span className={`text-sm font-medium ${muted}`}>{r.totalUnit}</span></span>
          <Change cur={last} prev={prev} />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className={`text-[13px] ${muted}`}>{r.intensity.label} ({r.intensity.unit})</span>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-[26px] font-bold" style={{ color: r.color }}>{r.intensity.value}</span>
          <Change cur={r.intensity.current} prev={r.intensity.previous} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className={`text-xs font-semibold ${muted}`}>Annual trend and projection</span>
        <ProjectionChart
          width={360} height={180} pad={{ l: 40, r: 8, t: 10, b: 22 }} barWidth={12} fontSize={11}
          history={r.history}
          bau={projectPath(last, p.bau2035, BAU_WOBBLE)}
          predicted={projectPath(last, p.predicted2035, PREDICTED_WOBBLE)}
          targetPath={projectPath(last, p.target2035)}
          max={p.axisMax} ticks={p.ticks} yTitle={r.chartUnit}
          tickFmt={v => (p.axisMax >= 1000 ? (v === 0 ? '0' : `${v / 1000}k`) : String(v))}
          ariaLabel={`${r.title}: 2021 to 2025 actuals with projections to 2035`}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className={`text-xs font-semibold ${muted}`}>Monthly 2025 · {r.chartUnit}</span>
        <MonthlyBars r={r} />
      </div>
    </div>
  );
}

export function SGHOverview({ data, overview: ov }: { data: SGHDataset; overview: Overview }) {
  const year = data.reportingYear;
  const kpis = [
    { label: 'Total carbon emissions', value: fmt(ov.total), unit: 'tCO₂e', cur: ov.total, prev: ov.previous },
    ...data.resources.map(r => ({
      label: r.key === 'energy' ? 'Electricity' : r.key === 'water' ? 'Water' : 'Waste',
      value: r.total, unit: r.totalUnit, cur: r.history[r.history.length - 1], prev: r.history[r.history.length - 2],
    })),
  ];

  // Takeaways — one sentence per chapter, written from the data.
  const fell = data.resources.filter(r => r.history[4] < r.history[3]).map(r => r.key === 'energy' ? 'electricity' : r.key);
  const yoyWord = ov.yoy <= 0 ? 'fell' : 'rose';
  const t1 = `Total emissions ${yoyWord} ${Math.abs(ov.yoy * 100).toFixed(1)}% to ${fmt(ov.total)} tCO₂e in ${year}` +
    (fell.length === 3 ? ', and electricity, water and waste use all fell too.' : fell.length ? `; ${fell.join(' and ')} use also fell.` : '.');
  const s1 = ov.scopes[0].value / ov.total, s2 = ov.scopes[1].value / ov.total;
  const t2 = `${ov.largest.name} is the largest single source at ${((ov.largest.tCO2e / ov.total) * 100).toFixed(0)}% of emissions, while Scope 1 direct sources together make up ${(s1 * 100).toFixed(0)}%.`;
  const onTrack = ov.predicted2030 <= ov.target2030;
  const t3 = onTrack
    ? `On the current trend, emissions reach ${fmt(ov.predicted2030)} tCO₂e by 2030, meeting the 50% reduction target.`
    : `Emissions are tracking below business as usual, but the current trend reaches ${fmt(ov.predicted2030)} tCO₂e in 2030, above the 50% target of ${fmt(ov.target2030)} tCO₂e.`;
  const intensityFell = data.resources.filter(r => r.intensity.current < r.intensity.previous).length;
  const t4 = intensityFell === 3
    ? 'Use and intensity fell for energy, water and waste compared with 2024, but all three remain above their target trajectories.'
    : `${intensityFell} of 3 intensity measures improved compared with 2024.`;
  const top = ov.blocks[0];
  const t5 = `${top.name} has the highest emissions at ${fmt(top.total)} tCO₂e, ${((top.total / ov.total) * 100).toFixed(0)}% of the total.`;

  const maxBlock = top.total * 1.05;

  return (
    <div className="flex flex-col gap-10 text-[#10231C]">
      <Chapter n={1} id="sgh-kpis" title={`How much did we emit in ${year}?`} takeaway={t1}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map(k => (
            <div key={k.label} className={`${card} flex flex-col gap-2 px-5 py-[18px]`}>
              <span className={`text-[13px] font-semibold ${muted}`}>{k.label} ({k.unit})</span>
              <span className="text-[32px] font-bold leading-tight">{k.value}</span>
              <Change cur={k.cur} prev={k.prev} />
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
              <span className="text-[13px] font-semibold">
                {pctChange(s.value, s.previous) <= 0 ? '↓' : '↑'} {Math.abs(pctChange(s.value, s.previous) * 100).toFixed(1)}% vs 2024
              </span>
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
                  <span className="font-semibold">{((s.value / ov.total) * 100).toFixed(0)}%</span>
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
                        <span className={`text-right ${muted}`}>{((s.tCO2e / ov.total) * 100).toFixed(0)}%</span>
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
            <LegendItem swatch={box(LINE_COLORS.historical)} label={`Historical emissions (2021–${year})`} />
            <LegendItem swatch={line(LINE_COLORS.bau)} label="BAU projection" />
            <LegendItem swatch={line(LINE_COLORS.predicted)} label="Predicted trend" />
            <LegendItem swatch={line(LINE_COLORS.target, true)} label="Targets" />
          </div>
          <ProjectionChart
            width={960} height={340} pad={{ l: 60, r: 16, t: 16, b: 28 }} barWidth={36} fontSize={12}
            history={ov.history} bau={ov.bau} predicted={ov.predicted}
            targetLines={[{ value: ov.target2030, label: '2030 · 50% target' }, { value: 0, label: '2035 · Net zero target' }]}
            max={20000} ticks={[0, 5000, 10000, 15000, 20000]} yTitle="Annual emissions (tCO₂e)"
            tickFmt={v => (v === 0 ? '0' : fmtK(v))}
            ariaLabel={`Annual emissions 2021 to ${year} with BAU and predicted projections to 2035, against the 2030 50% and 2035 net zero targets`}
          />
        </div>
      </Chapter>

      <Chapter n={4} id="sgh-resources" title="How are we using energy, water and materials?" takeaway={t4}>
        <div className={`flex flex-wrap gap-x-5 gap-y-2 text-xs ${muted}`}>
          <LegendItem swatch={box(LINE_COLORS.historical)} label={`Historical (2021–${year})`} />
          <LegendItem swatch={line(LINE_COLORS.bau)} label="BAU projection" />
          <LegendItem swatch={line(LINE_COLORS.predicted)} label="Predicted path" />
          <LegendItem swatch={line(LINE_COLORS.target, true)} label="Target trajectory" />
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          {data.resources.map(r => <ResourceCard key={r.key} r={r} />)}
        </div>
      </Chapter>

      <Chapter n={5} id="sgh-blocks" title="Which blocks emit the most?" takeaway={t5}>
        <div className={`${card} flex flex-col gap-4 px-6 py-5`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="m-0 text-[15px] font-semibold">Organisational carbon emission ranking</h3>
            <div className={`flex flex-wrap gap-4 text-xs ${muted}`}>
              {([1, 2, 3] as const).map(s => <LegendItem key={s} swatch={box(SCOPE_COLORS[s])} label={`Scope ${s}`} />)}
              <LegendItem swatch={<span className="h-3.5 border-l-2 border-dashed border-[#10231C]" />} label="Average per block" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="flex min-w-[560px] flex-col gap-3.5 py-1">
              {ov.blocks.map(b => (
                <div key={b.name} className="grid grid-cols-[80px_minmax(0,1fr)_110px] items-center gap-4">
                  <span className="text-sm font-semibold">{b.name}</span>
                  <div className="relative h-6">
                    <div className="flex h-full w-full">
                      <div className="h-full rounded-l-md" style={{ width: `${(b.scope1 / maxBlock) * 100}%`, background: SCOPE_COLORS[1] }} />
                      <div className="h-full" style={{ width: `${(b.scope2 / maxBlock) * 100}%`, background: SCOPE_COLORS[2] }} />
                      <div className="h-full rounded-r-md" style={{ width: `${(b.scope3 / maxBlock) * 100}%`, background: SCOPE_COLORS[3] }} />
                    </div>
                    <div className="absolute -bottom-1 -top-1 border-l-2 border-dashed border-[#10231C] opacity-60" style={{ left: `${(ov.blockAverage / maxBlock) * 100}%` }} />
                  </div>
                  <span className="text-right text-sm font-semibold">{fmt(b.total)} <span className={`text-xs font-normal ${muted}`}>tCO₂e</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Chapter>

      <p className={`m-0 text-xs ${muted}`}>Sample figures from the SGH mock-up. All values are recalculated from the uploaded source files.</p>
    </div>
  );
}
