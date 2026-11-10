import React from 'react';
import {
  SCOPE_COLORS, LINE_COLORS, YEARS, BAU_WOBBLE, PREDICTED_WOBBLE,
  fmt, fmtK, pctChange, projectPath,
  type Overview, type ResourceSeries, type Scope2Method, type SGHDataset,
} from './sghData';

interface SGHOverviewProps {
  data: SGHDataset;
  overview: Overview;
  method: Scope2Method;
  onMethodChange: (m: Scope2Method) => void;
}

const card = 'bg-white border border-[#DCE7E1] rounded-2xl';
const muted = 'text-[#4B5F57]';

function ChangeChip({ cur, prev }: { cur: number; prev: number }) {
  const d = pctChange(cur, prev);
  const good = d <= 0;
  return (
    <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${good ? 'bg-[#ECFDF5] text-[#047857]' : 'bg-[#FFF7ED] text-[#B45309]'}`}>
      {good ? '↓' : '↑'} {Math.abs(d * 100).toFixed(1)}% vs 2024
    </span>
  );
}

function Sparkline({ values, color, label }: { values: number[]; color: string; label: string }) {
  const min = Math.min(...values), max = Math.max(...values), span = max - min || 1;
  const x = (i: number) => 6 + i * (188 / (values.length - 1));
  const y = (v: number) => 34 - ((v - min) / span) * 28;
  const last = values.length - 1;
  return (
    <svg viewBox="0 0 200 40" className="h-10 w-full" role="img" aria-label={label}>
      <polyline points={values.map((v, i) => `${x(i)},${y(v)}`).join(' ')} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <circle cx={x(last)} cy={y(values[last])} r={3.5} fill={color} />
    </svg>
  );
}

interface TrendChartProps {
  width: number; height: number;
  pad: { l: number; r: number; t: number; b: number };
  history: number[]; bau: number[]; predicted: number[]; target: number[];
  max: number; ticks: number[]; barWidth: number;
  tickFmt: (v: number) => string; valueFmt: (v: number) => string;
  barLabels?: boolean; everyOtherYear?: boolean; fontSize: number;
  ariaLabel: string; yTitle?: string;
  children?: (scale: { x: (i: number) => number; y: (v: number) => number }) => React.ReactNode;
}

/** Actual bars 2021–2025 plus BAU, predicted and target lines to 2035. */
function TrendChart(p: TrendChartProps) {
  const n = YEARS.length, pw = p.width - p.pad.l - p.pad.r, ph = p.height - p.pad.t - p.pad.b;
  const x = (i: number) => p.pad.l + pw * (i + 0.5) / n;
  const y = (v: number) => p.pad.t + ph * (1 - v / p.max);
  const base = p.pad.t + ph;
  const h0 = p.history.length - 1;
  const pts = (arr: number[]) => arr.map((v, j) => `${x(h0 + j).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const split = (x(h0) + x(h0 + 1)) / 2;
  const ends = [
    { v: p.bau[p.bau.length - 1], color: LINE_COLORS.bau, name: 'BAU' },
    { v: p.predicted[p.predicted.length - 1], color: LINE_COLORS.predicted, name: p.barLabels ? 'Predicted' : 'Pred.' },
    { v: p.target[p.target.length - 1], color: LINE_COLORS.target, name: 'Target' },
  ];
  return (
    <svg viewBox={`0 0 ${p.width} ${p.height}`} className="w-full" role="img" aria-label={p.ariaLabel}>
      {p.yTitle && (
        <text x={16} y={p.pad.t + ph / 2} transform={`rotate(-90 16 ${p.pad.t + ph / 2})`} textAnchor="middle" fontSize={p.fontSize} fill="#4B5F57">{p.yTitle}</text>
      )}
      {p.ticks.map(t => (
        <g key={t}>
          <line x1={p.pad.l} x2={p.width - p.pad.r} y1={y(t)} y2={y(t)} stroke="#E4EEE9" />
          <text x={p.pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize={p.fontSize} fill="#4B5F57">{p.tickFmt(t)}</text>
        </g>
      ))}
      {p.history.map((v, i) => (
        <g key={i}>
          <rect x={x(i) - p.barWidth / 2} y={y(v)} width={p.barWidth} height={base - y(v)} rx={p.barWidth > 20 ? 4 : 2} fill={LINE_COLORS.actual} />
          {p.barLabels && <text x={x(i)} y={y(v) - 6} textAnchor="middle" fontSize={11} fontWeight={600} fill="#10231C">{p.valueFmt(v)}</text>}
        </g>
      ))}
      <line x1={split} x2={split} y1={p.pad.t} y2={base} stroke="#C9D8D0" strokeDasharray="4 4" />
      {p.barLabels && <text x={split + 8} y={p.pad.t + 14} fontSize={12} fill="#4B5F57">Projections →</text>}
      <polyline points={pts(p.bau)} fill="none" stroke={LINE_COLORS.bau} strokeWidth={p.barLabels ? 3 : 2.5} strokeLinejoin="round" />
      <polyline points={pts(p.predicted)} fill="none" stroke={LINE_COLORS.predicted} strokeWidth={p.barLabels ? 3 : 2.5} strokeLinejoin="round" />
      <polyline points={pts(p.target)} fill="none" stroke={LINE_COLORS.target} strokeWidth={p.barLabels ? 3 : 2.5} strokeDasharray={p.barLabels ? '8 6' : '6 5'} />
      {p.children?.({ x, y })}
      {ends.map(e => (
        <text key={e.name} x={x(n - 1) + 8} y={Math.min(y(e.v), base - 2) + 4} fontSize={p.fontSize} fontWeight={700} fill={e.color}>
          {e.name} {p.valueFmt(e.v)}
        </text>
      ))}
      {YEARS.map((yr, i) => (
        <text key={yr} x={x(i)} y={p.height - (p.barLabels ? 24 : 8)} textAnchor="middle" fontSize={p.fontSize} fill="#4B5F57">
          {p.everyOtherYear ? (i % 2 ? '' : `'${String(yr).slice(2)}`) : yr}
        </text>
      ))}
    </svg>
  );
}

function MonthlyBars({ r }: { r: ResourceSeries }) {
  const vals = r.monthly;
  const max = Math.max(...vals) * 1.18;
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  const peak = vals.indexOf(Math.max(...vals));
  const y = (v: number) => 102 - (v / max) * 92;
  const cx = (i: number) => 26 + i * 29;
  const initials = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return (
    <div className="flex flex-col gap-1.5">
      <div className={`flex justify-between gap-2 text-xs ${muted}`}>
        <span className="font-semibold">Monthly {data2025Label} · {r.monthlyUnit}</span>
        <span>Peak {names[peak]} · dashed = monthly average</span>
      </div>
      <svg viewBox="0 0 360 124" className="w-full" role="img" aria-label={`Monthly ${r.title.toLowerCase()} in ${data2025Label}, peak in ${names[peak]}`}>
        {vals.map((v, i) => (
          <g key={i}>
            <rect x={cx(i) - 10} y={y(v)} width={20} height={102 - y(v)} rx={3} fill={r.color} opacity={i === peak ? 1 : 0.55} />
            <text x={cx(i)} y={118} textAnchor="middle" fontSize={11} fill="#4B5F57">{initials[i]}</text>
          </g>
        ))}
        <line x1={12} x2={356} y1={y(avg)} y2={y(avg)} stroke="#10231C" strokeWidth={1.5} strokeDasharray="4 4" opacity={0.6} />
        <text x={cx(peak)} y={y(vals[peak]) - 4} textAnchor="middle" fontSize={11} fontWeight={700} fill="#10231C">{vals[peak].toFixed(r.monthlyDecimals)}</text>
      </svg>
    </div>
  );
}

const data2025Label = '2025';

function ResourceCard({ r }: { r: ResourceSeries }) {
  const last = r.history[r.history.length - 1];
  const o = r.outlook;
  const offTrack = o.predicted2035 > o.target2035;
  return (
    <div className={`${card} flex flex-col gap-3.5 p-5`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h3 className="m-0 text-base font-bold" style={{ color: r.color }}>{r.title}</h3>
          <span className="text-[22px] font-bold">{r.totalLabel} <span className={`text-[13px] font-medium ${muted}`}>{r.totalUnit}</span></span>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <ChangeChip cur={last} prev={r.history[r.history.length - 2]} />
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${offTrack ? 'bg-[#FFF7ED] text-[#B45309]' : 'bg-[#ECFDF5] text-[#047857]'}`}>
            {offTrack ? 'Off track for 2035' : 'On track for 2035'}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="flex flex-col gap-1 rounded-xl bg-[#F6FAF8] p-3">
          <span className={`text-xs font-semibold ${muted}`}>{r.intensity.label}</span>
          <span className="text-xl font-bold">{r.intensity.value}</span>
          <span className="text-xs font-semibold text-[#047857]">{r.intensity.delta}</span>
          <span className={`text-[11px] leading-snug ${muted}`}>{r.intensity.definition}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-xl bg-[#F6FAF8] p-3">
          <span className={`text-xs font-semibold ${muted}`}>{r.perPerson.label}</span>
          <span className="text-xl font-bold">{r.perPerson.value}</span>
          <span className={`text-xs ${muted}`}>Needs people-per-day data</span>
          <span className={`text-[11px] leading-snug ${muted}`}>{r.perPerson.definition}</span>
        </div>
      </div>
      <MonthlyBars r={r} />
      <div className="flex flex-col gap-1.5">
        <span className={`text-xs font-semibold ${muted}`}>Outlook to 2035 · {r.annualUnit}</span>
        <TrendChart
          width={360} height={170} pad={{ l: 34, r: 80, t: 10, b: 24 }} barWidth={10} fontSize={11} everyOtherYear
          history={r.history}
          bau={projectPath(last, o.bau2035, BAU_WOBBLE)}
          predicted={projectPath(last, o.predicted2035, PREDICTED_WOBBLE)}
          target={projectPath(last, o.target2035)}
          max={o.axisMax} ticks={o.ticks}
          tickFmt={v => (o.axisMax >= 1000 ? (v === 0 ? '0' : `${v / 1000}k`) : String(v))}
          valueFmt={v => (o.axisMax < 100 ? v.toFixed(1) : String(Math.round(v)))}
          ariaLabel={`${r.title} 2021 to 2025 with projections to 2035`}
        />
      </div>
    </div>
  );
}

export function SGHOverview({ data, overview: ov, method, onMethodChange }: SGHOverviewProps) {
  const topBlock = ov.blocks[0];
  const topBlockVsAvg = (topBlock.total - ov.blockAverage) / ov.blockAverage;
  const topTwoShare = (ov.blocks[0].total + ov.blocks[1].total) / ov.total;
  const electricity = ov.scopes[1].value;
  const maxSource = ov.sources[0].tCO2e;
  const maxBlock = topBlock.total * 1.05;

  const insights = [
    { good: true, tag: 'Improving', headline: `Emissions down ${Math.abs(ov.yoy * 100).toFixed(1)}% on 2024`,
      body: 'Electricity, water and waste all fell too, and every intensity measure improved.', link: 'See the KPIs', href: '#sgh-kpis' },
    { good: false, tag: 'Off track', headline: `Need −${(ov.annualCutNeeded * 100).toFixed(0)}% a year to hit 2030`,
      body: `At the current trend, 2030 emissions would be ${fmt(ov.gap2030)} tCO₂e above the −50% target.`, link: 'View pathway', href: '#sgh-pathway' },
    { good: false, tag: 'Biggest lever', headline: `Electricity is ${((electricity / ov.total) * 100).toFixed(0)}% of emissions`,
      body: `The top 3 sources (${ov.sources.slice(0, 3).map(s => s.name.replace(/ \(.*\)/, '').toLowerCase()).join(', ')}) make up ${(ov.top3Share * 100).toFixed(0)}% of the total.`, link: 'View sources', href: '#sgh-sources' },
    { good: false, tag: 'Focus area', headline: `${topBlock.name} is ${(topBlockVsAvg * 100).toFixed(0)}% above average`,
      body: `The two highest blocks produce ${(topTwoShare * 100).toFixed(0)}% of emissions. Normalise by floor area once block profiles are uploaded.`, link: 'View blocks', href: '#sgh-blocks' },
  ];

  const kpis = [
    { label: 'Total carbon emissions', value: fmt(ov.total), unit: 'tCO₂e', history: ov.history, color: '#10231C', context: `2030 target ${fmtK(ov.target2030)}` },
    ...data.resources.map(r => ({ label: r.key === 'energy' ? 'Electricity' : r.title, value: r.totalLabel, unit: r.totalUnit, history: r.history, color: r.color, context: r.intensity.value + (r.key === 'waste' ? '/bed-day' : '') })),
  ];

  const pathFacts = [
    { label: 'Change vs 2024', value: `${(ov.yoy * 100).toFixed(1)}%` },
    { label: 'Cut needed each year to reach 2030 target', value: `−${(ov.annualCutNeeded * 100).toFixed(1)}% per year` },
    { label: '2030 target (−50% vs base year)', value: `${fmt(ov.target2030)} tCO₂e` },
    { label: 'Predicted 2030 if current trend continues', value: `${fmt(ov.predicted[5])} tCO₂e` },
  ];

  return (
    <div className="flex flex-col gap-6 text-[#10231C]">
      {/* Key insights */}
      <section aria-labelledby="sgh-insights" className="flex flex-col gap-3">
        <h2 id="sgh-insights" className="m-0 text-xl font-bold">Key insights</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {insights.map(i => (
            <a key={i.tag} href={i.href} className={`${card} flex flex-col gap-2.5 p-[18px] text-[#10231C] no-underline hover:border-[#9DBFAE]`}>
              <span className={`self-start rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${i.good ? 'bg-[#ECFDF5] text-[#047857]' : 'bg-[#FFF7ED] text-[#B45309]'}`}>{i.tag}</span>
              <span className="text-[22px] font-bold leading-tight">{i.headline}</span>
              <span className={`text-[13px] leading-relaxed ${muted}`}>{i.body}</span>
              <span className="text-xs font-semibold text-[#047857]">{i.link} →</span>
            </a>
          ))}
        </div>
      </section>

      {/* Legend */}
      <section aria-label="How to read this dashboard" className={`${card} flex flex-wrap gap-x-8 gap-y-5 px-5 py-4`}>
        <div className="flex min-w-[300px] flex-[1_1_360px] flex-col gap-2">
          <span className={`text-xs font-bold uppercase tracking-wide ${muted}`}>Emission scopes</span>
          {[
            [SCOPE_COLORS[1], 'Scope 1 · Direct', 'fuels burned on site, refrigerant, anaesthetic gases, SF₆, fire suppressant, wastewater'],
            [SCOPE_COLORS[2], 'Scope 2 · Purchased energy', 'electricity bought from the grid'],
            [SCOPE_COLORS[3], 'Scope 3 · Value chain', 'purchases, waste, staff commuting and travel, water supply'],
          ].map(([c, n, d]) => (
            <span key={n} className="flex gap-2 text-[13px] leading-snug">
              <span className="mt-[3px] h-3 w-3 flex-none rounded-[3px]" style={{ background: c }} />
              <span><strong>{n}</strong> {d}</span>
            </span>
          ))}
        </div>
        <div className="flex flex-[1_1_220px] flex-col gap-2">
          <span className={`text-xs font-bold uppercase tracking-wide ${muted}`}>Change vs last year</span>
          <span className="flex items-center gap-2 text-[13px]"><span className="whitespace-nowrap rounded-full bg-[#ECFDF5] px-2 py-0.5 text-xs font-semibold text-[#047857]">↓ 6.3%</span>Improving: lower than last year</span>
          <span className="flex items-center gap-2 text-[13px]"><span className="whitespace-nowrap rounded-full bg-[#FFF7ED] px-2 py-0.5 text-xs font-semibold text-[#B45309]">↑ 1.0%</span>Worsening: higher than last year</span>
        </div>
        <div className="flex flex-[1_1_260px] flex-col gap-2">
          <span className={`text-xs font-bold uppercase tracking-wide ${muted}`}>Trend charts</span>
          <span className="flex items-center gap-2 text-[13px]"><span className="h-3 w-3.5 rounded-sm" style={{ background: LINE_COLORS.actual }} />Actual, from uploaded data</span>
          <span className="flex items-center gap-2 text-[13px]"><span className="h-[3px] w-[18px]" style={{ background: LINE_COLORS.bau }} />Business as usual: no new measures</span>
          <span className="flex items-center gap-2 text-[13px]"><span className="h-[3px] w-[18px]" style={{ background: LINE_COLORS.predicted }} />Predicted: current trend continued</span>
          <span className="flex items-center gap-2 text-[13px]"><span className="w-[18px] border-t-[3px] border-dashed" style={{ borderColor: LINE_COLORS.target }} />Target pathway</span>
        </div>
      </section>

      {/* KPI cards */}
      <section id="sgh-kpis" aria-label="Headline KPIs" className="grid scroll-mt-6 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(k => (
          <div key={k.label} className={`${card} flex flex-col gap-2 px-5 py-[18px]`}>
            <div className="flex items-center justify-between gap-2">
              <span className={`text-[13px] font-semibold ${muted}`}>{k.label}</span>
              <ChangeChip cur={k.history[k.history.length - 1]} prev={k.history[k.history.length - 2]} />
            </div>
            <div className="flex items-baseline gap-1.5"><span className="text-3xl font-bold">{k.value}</span><span className={`text-sm ${muted}`}>{k.unit}</span></div>
            <Sparkline values={k.history} color={k.color} label={`${k.label} from 2021 to 2025`} />
            <div className={`flex justify-between text-[11px] ${muted}`}><span>2021</span><span>{k.context}</span><span>2025</span></div>
          </div>
        ))}
      </section>

      {/* Emission sources */}
      <section id="sgh-sources" aria-labelledby="sgh-sources-h" className="flex scroll-mt-6 flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 id="sgh-sources-h" className="m-0 text-xl font-bold">Where do emissions come from?</h2>
            <span className={`text-[13px] ${muted}`}>
              Scope 1 direct sources are {((ov.scopes[0].value / ov.total) * 100).toFixed(0)}% and purchased electricity {((electricity / ov.total) * 100).toFixed(0)}%. The top 3 sources account for {(ov.top3Share * 100).toFixed(0)}%.
            </span>
          </div>
          <div role="group" aria-label="Scope 2 method" className={`flex items-center gap-2 text-[13px] ${muted}`}>
            <span>Scope 2 method</span>
            <div className="flex rounded-[10px] bg-[#E4EEE9] p-[3px]">
              {(['location', 'market'] as const).map(m => (
                <button key={m} type="button" aria-pressed={method === m} onClick={() => onMethodChange(m)}
                  className={`min-h-8 cursor-pointer rounded-lg border-0 px-3 py-1.5 text-[13px] font-semibold ${method === m ? 'bg-white text-[#065F46] shadow-sm' : 'bg-transparent text-[#4B5F57]'}`}>
                  {m === 'location' ? 'Location-based' : 'Market-based'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div className={`${card} flex flex-col gap-3 p-5`}>
            <h3 className="m-0 text-[15px] font-semibold">Share by scope</h3>
            <div className="flex justify-center py-1">
              <svg viewBox="0 0 220 220" width={210} height={210} role="img" aria-label="Donut chart of total emissions split by Scope 1, 2 and 3">
                <g transform="rotate(-90 110 110)">
                  {(() => {
                    const C = 2 * Math.PI * 80;
                    let acc = 0;
                    return ov.scopes.map(s => {
                      const len = (s.value / ov.total) * C;
                      const el = <circle key={s.scope} cx={110} cy={110} r={80} fill="none" stroke={SCOPE_COLORS[s.scope]} strokeWidth={30}
                        strokeDasharray={`${Math.max(len - 2, 0.5)} ${C - len + 2}`} strokeDashoffset={-acc} />;
                      acc += len;
                      return el;
                    });
                  })()}
                </g>
                <text x={110} y={106} textAnchor="middle" fontSize={24} fontWeight={700} fill="#10231C">{fmt(ov.total)}</text>
                <text x={110} y={128} textAnchor="middle" fontSize={12} fill="#4B5F57">tCO₂e total</text>
              </svg>
            </div>
            <div className="flex flex-col gap-2.5">
              {ov.scopes.map(s => (
                <div key={s.scope} className="grid grid-cols-[12px_minmax(0,1fr)_auto_44px] items-center gap-2.5 text-[13px]">
                  <span className="h-3 w-3 rounded-[3px]" style={{ background: SCOPE_COLORS[s.scope] }} />
                  <span className="font-semibold">{s.name}</span>
                  <span>{fmt(s.value)} t</span>
                  <span className="text-right font-bold">{((s.value / ov.total) * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`${card} flex flex-col gap-3 p-5`}>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="m-0 text-[15px] font-semibold">Largest sources, ranked</h3>
              <span className={`text-xs ${muted}`}>Bar colour = scope · tCO₂e and share of total</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {ov.sources.map((s, i) => (
                <React.Fragment key={s.name}>
                  <div className="grid grid-cols-[minmax(0,220px)_minmax(0,1fr)_64px_48px] items-center gap-3 text-[13px]">
                    <span className={`truncate ${i < 3 ? 'font-semibold' : ''}`}>{s.name}</span>
                    <div className="h-4 rounded bg-[#F1F5F3]">
                      <div className="h-full rounded" style={{ width: `${(s.tCO2e / maxSource) * 100}%`, background: SCOPE_COLORS[s.scope] }} />
                    </div>
                    <span className="text-right font-semibold">{fmt(s.tCO2e)}</span>
                    <span className={`text-right ${muted}`}>{((s.tCO2e / ov.total) * 100).toFixed(1)}%</span>
                  </div>
                  {i === 2 && (
                    <div className="flex items-center gap-2.5 py-1 text-xs font-semibold text-[#065F46]">
                      <span className="flex-1 border-t border-dashed border-[#9DBFAE]" />
                      Top 3 sources = {(ov.top3Share * 100).toFixed(0)}% of total
                      <span className="flex-1 border-t border-dashed border-[#9DBFAE]" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            <span className={`text-xs ${muted}`}>Electricity sold (exported) is reported separately and not deducted: [value] tCO₂e</span>
          </div>
        </div>
      </section>

      {/* Pathway */}
      <section id="sgh-pathway" aria-labelledby="sgh-pathway-h" className={`${card} flex scroll-mt-6 flex-col gap-3.5 px-6 py-5`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 id="sgh-pathway-h" className="m-0 text-xl font-bold">Are we on track for 2030 and 2035?</h2>
            <span className={`text-[13px] ${muted}`}>
              Emissions fell {Math.abs(ov.yoy * 100).toFixed(1)}% last year, but reaching the 2030 target needs about {(ov.annualCutNeeded * 100).toFixed(0)}% less every year.
            </span>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ov.gap2030 > 0 ? 'bg-[#FFF7ED] text-[#B45309]' : 'bg-[#ECFDF5] text-[#047857]'}`}>
            {ov.gap2030 > 0 ? 'Off track for 2030' : 'On track for 2030'}
          </span>
        </div>
        <TrendChart
          width={960} height={360} pad={{ l: 64, r: 120, t: 20, b: 48 }} barWidth={36} fontSize={12} barLabels
          history={ov.history} bau={ov.bau} predicted={ov.predicted} target={ov.target}
          max={20000} ticks={[0, 5000, 10000, 15000, 20000]}
          tickFmt={v => (v === 0 ? '0' : `${v / 1000}k`)} valueFmt={fmtK}
          yTitle="Annual emissions (tCO₂e)"
          ariaLabel={`Actual emissions 2021 to 2025 with business-as-usual, predicted and target lines to 2035. Predicted 2030 is ${fmt(ov.gap2030)} tCO2e above target.`}
        >
          {({ x, y }) => {
            const gx = x(9);
            const yPred = y(ov.predicted[5]), yTarget = y(ov.target2030), mid = (yPred + yTarget) / 2;
            return (
              <g>
                {ov.gap2030 > 0 && (
                  <g stroke="#B45309" strokeWidth={2}>
                    <line x1={gx + 16} x2={gx + 16} y1={yPred} y2={yTarget} />
                    <line x1={gx + 11} x2={gx + 21} y1={yPred} y2={yPred} />
                    <line x1={gx + 11} x2={gx + 21} y1={yTarget} y2={yTarget} />
                  </g>
                )}
                {ov.gap2030 > 0 && (
                  <>
                    <text x={gx + 28} y={mid} fontSize={12} fontWeight={700} fill="#B45309">Gap {fmt(ov.gap2030)} t</text>
                    <text x={gx + 28} y={mid + 15} fontSize={11} fill="#B45309">vs 2030 target</text>
                  </>
                )}
                <circle cx={gx} cy={yTarget} r={6} fill="#fff" stroke={LINE_COLORS.target} strokeWidth={3} />
                <text x={gx - 10} y={yTarget + 22} textAnchor="end" fontSize={12} fontWeight={600} fill="#065F46">2030 target {fmtK(ov.target2030)}</text>
              </g>
            );
          }}
        </TrendChart>
        <div className="flex flex-wrap gap-2.5">
          {pathFacts.map(f => (
            <div key={f.label} className="flex flex-[1_1_180px] flex-col gap-0.5 rounded-xl bg-[#F6FAF8] px-3.5 py-2.5">
              <span className={`text-xs ${muted}`}>{f.label}</span>
              <span className="text-base font-bold">{f.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Resources */}
      <section aria-labelledby="sgh-res-h" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="sgh-res-h" className="m-0 text-xl font-bold">How efficiently are we using energy, water and materials?</h2>
          <span className={`text-[13px] ${muted}`}>Intensity removes the effect of size and activity, so blocks and years can be compared fairly</span>
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          {data.resources.map(r => <ResourceCard key={r.key} r={r} />)}
        </div>
      </section>

      {/* Blocks */}
      <section id="sgh-blocks" aria-labelledby="sgh-blocks-h" className={`${card} flex scroll-mt-6 flex-col gap-4 px-6 py-5`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 id="sgh-blocks-h" className="m-0 text-xl font-bold">Which blocks should we focus on?</h2>
            <span className={`text-[13px] ${muted}`}>{topBlock.name} emits the most. Bars show each block’s scope mix; the chip shows how far each block is above or below the average.</span>
          </div>
          <div className={`flex flex-wrap gap-4 text-xs ${muted}`}>
            {([1, 2, 3] as const).map(s => (
              <span key={s} className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-[3px]" style={{ background: SCOPE_COLORS[s] }} />Scope {s}</span>
            ))}
            <span className="flex items-center gap-1.5"><span className="h-3.5 border-l-2 border-dashed border-[#10231C]" />Average per block</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <div className="flex min-w-[640px] flex-col gap-3.5">
            <div className={`grid grid-cols-[80px_minmax(0,1fr)_96px_64px_92px] gap-3.5 border-b border-[#DCE7E1] pb-1 text-xs font-semibold ${muted}`}>
              <span>Block</span><span>Emissions by scope</span><span className="text-right">tCO₂e</span><span className="text-right">Share</span><span className="text-right">vs average</span>
            </div>
            {ov.blocks.map(b => {
              const d = (b.total - ov.blockAverage) / ov.blockAverage;
              const above = d > 0;
              return (
                <div key={b.name} className="grid grid-cols-[80px_minmax(0,1fr)_96px_64px_92px] items-center gap-3.5">
                  <span className="text-sm font-semibold">{b.name}</span>
                  <div className="relative h-[26px]">
                    <div className="flex h-full w-full">
                      <div className="h-full rounded-l-md" style={{ width: `${(b.scope1 / maxBlock) * 100}%`, background: SCOPE_COLORS[1] }} />
                      <div className="h-full" style={{ width: `${(b.scope2 / maxBlock) * 100}%`, background: SCOPE_COLORS[2] }} />
                      <div className="h-full rounded-r-md" style={{ width: `${(b.scope3 / maxBlock) * 100}%`, background: SCOPE_COLORS[3] }} />
                    </div>
                    <div className="absolute -bottom-1 -top-1 border-l-2 border-dashed border-[#10231C] opacity-60" style={{ left: `${(ov.blockAverage / maxBlock) * 100}%` }} />
                  </div>
                  <span className="text-right text-sm font-semibold">{fmt(b.total)}</span>
                  <span className={`text-right text-[13px] ${muted}`}>{((b.total / ov.total) * 100).toFixed(0)}%</span>
                  <span className={`justify-self-end rounded-full px-2 py-0.5 text-xs font-semibold ${above ? 'bg-[#FFF7ED] text-[#B45309]' : 'bg-[#ECFDF5] text-[#047857]'}`}>
                    {above ? '+' : '−'}{Math.abs(d * 100).toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <span className={`text-xs ${muted}`}>Next step once the block profile is uploaded: rank by tCO₂e per m² so large and small blocks compare fairly.</span>
      </section>

      <p className={`m-0 text-xs ${muted}`}>Sample figures from the SGH mock-up. Insights and numbers are recalculated from the uploaded source files.</p>
    </div>
  );
}
