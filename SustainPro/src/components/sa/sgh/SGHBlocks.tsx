import React from 'react';
import { SCOPE_COLORS, fmt, niceScale, type BlockRow, type SGHDataset } from './sghData';
import { Chapter, LegendItem, box, card, muted } from './SGHOverview';

/**
 * Block-level view from page 4 of the SGH mock-up. Only electricity (Scope 2)
 * and water (Scope 3) are metered per block, so the ranking covers those two only.
 */
export function SGHBlocks({ blocks, year, factors }: { blocks: BlockRow[]; year: number; factors: SGHDataset['factors'] }) {
  const top = blocks[0];
  if (!top) return <p className={`m-0 text-sm ${muted}`}>No block-level electricity or water data for {year}. Upload the Electricity and Water sheets with a Block column.</p>;
  const totalAll = blocks.reduce((a, b) => a + b.total, 0);
  const waterLed = blocks.filter(b => b.water > b.electricity).length;
  const takeaway = `${top.name} has the highest utility emissions at ${fmt(top.total)} tCO₂e, ${((top.total / totalAll) * 100).toFixed(0)}% of the block total` +
    (waterLed ? `; water outweighs electricity in ${waterLed} of ${blocks.length} blocks.` : '.');

  const { max, ticks } = niceScale(top.total * 1.1);
  const pct = (v: number) => `${(v / max) * 100}%`;

  return (
    <div className="flex flex-col gap-10 text-[#10231C]">
      <Chapter n={1} id="sgh-blocks" title="Which blocks have the highest electricity and water emissions?" takeaway={takeaway}>
        <div className={`${card} flex flex-col gap-4 px-6 py-5`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <h3 className="m-0 text-[15px] font-semibold">Block utility carbon emissions ranking</h3>
              <span className={`text-xs ${muted}`}>Electricity and water carbon impact (tCO₂e), Jan–Dec {year}</span>
            </div>
            <div className={`flex flex-wrap gap-4 text-xs ${muted}`}>
              <LegendItem swatch={box(SCOPE_COLORS[2])} label="Electricity (Scope 2)" />
              <LegendItem swatch={box(SCOPE_COLORS[3])} label="Water (Scope 3)" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="flex min-w-[560px] flex-col gap-3.5 py-1">
              {blocks.map(b => (
                <div key={b.name} className="grid grid-cols-[150px_minmax(0,1fr)_90px] items-center gap-4"
                  title={`${b.name}: electricity ${fmt(b.electricity)} tCO₂e, water ${fmt(b.water)} tCO₂e`}>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{b.name}</span>
                    <span className={`text-[11px] ${muted}`}>{fmt(b.electricityKWh)} kWh · {fmt(b.waterM3)} m³</span>
                  </div>
                  <div className="relative h-6">
                    {ticks.slice(1).map(t => (
                      <div key={t} className="absolute -bottom-2 -top-2 border-l border-dashed border-[#DCE7E1]" style={{ left: pct(t) }} />
                    ))}
                    <div className="relative flex h-full w-full">
                      <div className="h-full rounded-l-md" style={{ width: pct(b.electricity), background: SCOPE_COLORS[2] }} />
                      <div className="h-full rounded-r-md" style={{ width: pct(b.water), background: SCOPE_COLORS[3] }} />
                    </div>
                  </div>
                  <span className="text-sm font-semibold">{fmt(b.total)} <span className={`text-xs font-normal ${muted}`}>tCO₂e</span></span>
                </div>
              ))}
              <div className="grid grid-cols-[150px_minmax(0,1fr)_90px] gap-4">
                <span />
                <div className={`relative h-4 text-xs ${muted}`}>
                  {ticks.map(t => (
                    <span key={t} className="absolute -translate-x-1/2" style={{ left: pct(t) }}>{t >= 1000 ? `${t / 1000}k` : t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Chapter>

      <p className={`m-0 text-xs ${muted}`}>
        Emissions = consumption × emission factor: electricity {factors.electricity?.value ?? '—'} kgCO₂e/kWh ({factors.electricity?.reference || 'no factor'}),
        water {factors.water?.value ?? '—'} kgCO₂e/m³ ({factors.water?.reference || 'no factor'}). Block totals add up to the SGH electricity and water totals.
      </p>
    </div>
  );
}
