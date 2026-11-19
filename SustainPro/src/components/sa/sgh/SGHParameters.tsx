import React from 'react';
import { INDEX_DEFINITIONS, fmt, personDays, type MonthlyParameters, type YearParameters } from './sghData';

/**
 * Inputs for the indices: GFA once a year, and operational days, average
 * visitors and average occupants per day for each month.
 */

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const COLUMNS: { key: keyof MonthlyParameters; label: string }[] = [
  { key: 'operationalDays', label: 'Operational days' },
  { key: 'visitorsPerDay', label: 'Avg visitors / day' },
  { key: 'occupantsPerDay', label: 'Avg occupants / day' },
];

const card = 'bg-white border border-[#DCE7E1] rounded-2xl';
const muted = 'text-[#4B5F57]';
const input = 'h-9 w-full rounded-lg border border-[#C9D8D0] bg-white px-2 text-right text-[13px] text-[#10231C]';

const toNumber = (v: string) => Math.max(0, Number(v) || 0);

export function SGHParameters({ year, value, onChange }: { year: number; value: YearParameters; onChange: (p: YearParameters) => void }) {
  const setMonth = (m: number, key: keyof MonthlyParameters, v: number) =>
    onChange({ ...value, monthly: value.monthly.map((row, i) => (i === m ? { ...row, [key]: v } : row)) });
  const fillFromJanuary = () =>
    onChange({ ...value, monthly: value.monthly.map(row => ({ ...row, visitorsPerDay: value.monthly[0].visitorsPerDay, occupantsPerDay: value.monthly[0].occupantsPerDay })) });

  const incompleteMonths = value.monthly.filter(m => !m.operationalDays || !(m.visitorsPerDay + m.occupantsPerDay)).length;
  const total = personDays(value);

  return (
    <section aria-labelledby="sgh-params-h" className={`${card} flex flex-col gap-4 px-6 py-5`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 id="sgh-params-h" className="m-0 text-lg font-bold">Building parameters · FY{year}</h2>
          <span className={`text-[13px] ${muted}`}>Used for EUI, Water Efficiency Index and Waste Disposal Index.</span>
        </div>
        <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${
          value.gfaM2 > 0 && incompleteMonths === 0 ? 'bg-[#ECFDF5] text-[#047857]' : 'bg-[#FFF7ED] text-[#B45309]'}`}>
          {value.gfaM2 > 0 && incompleteMonths === 0 ? 'Complete' : `${(value.gfaM2 > 0 ? 0 : 1) + incompleteMonths} to fill`}
        </span>
      </div>

      <label className={`flex max-w-[280px] flex-col gap-1 text-xs font-semibold ${muted}`}>Gross floor area (GFA), m² · yearly
        <input type="number" min={0} inputMode="decimal" value={value.gfaM2 || ''} placeholder="0"
          onChange={e => onChange({ ...value, gfaM2: toNumber(e.target.value) })} className={input} />
      </label>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px] border-collapse text-[13px]">
          <thead>
            <tr className={`border-b border-[#DCE7E1] text-left ${muted}`}>
              <th scope="col" className="px-2 py-2 font-semibold">Month</th>
              {COLUMNS.map(c => <th key={c.key} scope="col" className="px-2 py-2 text-right font-semibold">{c.label}</th>)}
              <th scope="col" className="px-2 py-2 text-right font-semibold">Person-days</th>
            </tr>
          </thead>
          <tbody>
            {value.monthly.map((row, m) => (
              <tr key={m} className="border-b border-[#EEF3F0]">
                <th scope="row" className="px-2 py-1.5 text-left font-semibold">{MONTH_LABELS[m]}</th>
                {COLUMNS.map(c => (
                  <td key={c.key} className="px-2 py-1.5">
                    <input type="number" min={0} inputMode="numeric" aria-label={`${c.label}, ${MONTH_LABELS[m]} ${year}`}
                      value={row[c.key] || ''} placeholder="0" onChange={e => setMonth(m, c.key, toNumber(e.target.value))} className={input} />
                  </td>
                ))}
                <td className={`px-2 py-1.5 text-right ${muted}`}>{fmt((row.visitorsPerDay + row.occupantsPerDay) * row.operationalDays)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" colSpan={4} className="px-2 py-2.5 text-right font-semibold">Total person-days</th>
              <td className="px-2 py-2.5 text-right font-bold">{fmt(total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={fillFromJanuary}
          className="min-h-9 cursor-pointer rounded-lg border border-[#C9D8D0] bg-white px-3 text-[13px] font-semibold text-[#065F46] hover:bg-[#F3F7F5]">
          Copy January visitors and occupants to all months
        </button>
        <span className={`text-xs ${muted}`}>Saved in this browser until the database is connected.</span>
      </div>

      <div className="flex flex-col gap-1.5 rounded-[10px] bg-[#F6FAF8] px-3 py-2.5">
        {Object.values(INDEX_DEFINITIONS).map(d => (
          <code key={d.label} className="whitespace-normal font-mono text-xs text-[#065F46]">
            {d.label} = {d.formula}{d.provisional ? ' (provisional)' : ''}
          </code>
        ))}
      </div>
    </section>
  );
}
