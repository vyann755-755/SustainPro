// ISO 14064-1:2018 Hierarchical Structure for Activity Template Selection
// =========================================================================
//
// Mirror of `griStructureData.ts`, but for the ISO 14064-1 organizational
// GHG inventory standard. The Sustainability Architect picks an ISO
// *sub-category* (e.g. "1.1 Direct emissions from stationary combustion")
// when creating an Activity under the ISO framework, exactly as they pick a
// GRI sub-category (e.g. "305.1.1") under the GRI framework.
//
// Category numbering follows the six ISO 14064-1 reporting categories and is
// the SAME numbering used by `isoTemplate` in `src/data/reportTemplates.ts`
// (column "number"), so an Activity's `isoCategories: ['1.1']` lines up
// 1-for-1 with the report row it feeds.
//
//   Category 1 — Direct GHG emissions and removals
//   Category 2 — Indirect GHG emissions from imported energy
//   Category 3 — Indirect GHG emissions from transportation
//   Category 4 — Indirect GHG emissions from products used by the organization
//   Category 5 — Indirect GHG emissions associated with the use of products
//   Category 6 — Other indirect GHG emissions

export interface ISOCategoryRow {
  /** Sub-category code, e.g. "1.1". Stored on Activity.isoCategories[]. */
  code: string;
  name: string;
  description: string;
  /** Activity ids mapped here (parallels GRICategory.activityIds). */
  activityIds: string[];
}

export interface ISOCategoryGroup {
  /** Category number "1".."6" — matches isoTemplate category-header. */
  number: '1' | '2' | '3' | '4' | '5' | '6';
  /** Full category title (matches the report category-header name). */
  name: string;
  description: string;
  /** Whether this category is a direct, energy, or other-indirect bucket. */
  kind: 'direct' | 'energy' | 'indirect';
  rows: ISOCategoryRow[];
}

export const isoStructure: ISOCategoryGroup[] = [
  {
    number: '1',
    name: 'Category 1: Direct GHG emissions and removals',
    description:
      'Emissions from sources owned or controlled by the organization, plus direct removals.',
    kind: 'direct',
    rows: [
      { code: '1.1', name: 'Direct emissions from stationary combustion', description: 'Fuel combustion in boilers, furnaces, kilns and other stationary equipment', activityIds: ['act-iso-101'] },
      { code: '1.2', name: 'Direct emissions from mobile combustion', description: 'Fuel combustion in owned/controlled vehicles and mobile machinery', activityIds: ['act-iso-102', 'act-iso-102b'] },
      { code: '1.3', name: 'Direct process emissions and removals from industrial processes', description: 'Physical/chemical process emissions (e.g. calcination, reduction)', activityIds: ['act-iso-103'] },
      { code: '1.4', name: 'Direct fugitive emissions from the release of GHGs', description: 'Refrigerant leakage, equipment seals, venting', activityIds: ['act-iso-104'] },
      { code: '1.5', name: 'Direct emissions and removals from Land Use, Land Use Change and Forestry (LULUCF)', description: 'Land-based emissions and biological sequestration', activityIds: [] },
      { code: '1.6', name: 'Direct emissions in tonnes of CO2 from biomass', description: 'Biogenic CO2 reported separately', activityIds: [] },
    ],
  },
  {
    number: '2',
    name: 'Category 2: Indirect GHG emissions from imported energy',
    description: 'Emissions from the generation of purchased/imported electricity, heat, steam and cooling.',
    kind: 'energy',
    rows: [
      { code: '2.1', name: 'Indirect emissions from imported electricity', description: 'Purchased grid electricity (location- or market-based)', activityIds: ['act-iso-201'] },
      { code: '2.2', name: 'Indirect emissions from imported energy', description: 'Purchased steam, heat and cooling', activityIds: ['act-iso-202'] },
    ],
  },
  {
    number: '3',
    name: 'Category 3: Indirect GHG emissions from transportation',
    description: 'Transportation-related emissions not owned or controlled by the organization.',
    kind: 'indirect',
    rows: [
      { code: '3.1', name: 'Emissions from upstream transportation and distribution of goods', description: 'Inbound third-party freight and distribution', activityIds: ['act-iso-301'] },
      { code: '3.2', name: 'Emissions from downstream transportation and distribution of goods', description: 'Outbound third-party freight to customers', activityIds: [] },
      { code: '3.3', name: 'Emissions from employee commuting', description: 'Daily commuting of the workforce', activityIds: ['act-iso-303'] },
      { code: '3.4', name: 'Emissions from client and visitor transport', description: 'Transport of clients and visitors to sites', activityIds: [] },
      { code: '3.5', name: 'Emissions from business travel', description: 'Air, rail and road business travel', activityIds: ['act-iso-305'] },
    ],
  },
  {
    number: '4',
    name: 'Category 4: Indirect GHG emissions from products used by the organization',
    description: 'Emissions embodied in goods and services the organization purchases and uses.',
    kind: 'indirect',
    rows: [
      { code: '4.1', name: 'Emissions from purchased goods and services', description: 'Cradle-to-gate emissions of purchased inputs', activityIds: ['act-iso-401'] },
      { code: '4.2', name: 'Emissions from capital goods', description: 'Embodied emissions of capital equipment and assets', activityIds: ['act-iso-402'] },
      { code: '4.3', name: 'Emissions from the disposal of solid and liquid waste', description: 'Treatment and disposal of operational waste', activityIds: ['act-iso-403'] },
      { code: '4.4', name: 'Emissions from the use of assets (e.g. leasing)', description: 'Upstream leased assets and use-of-assets emissions', activityIds: [] },
      { code: '4.5', name: 'Emissions from other services not described above', description: 'Fuel/energy-related and other purchased services', activityIds: [] },
    ],
  },
  {
    number: '5',
    name: 'Category 5: Indirect GHG emissions associated with the use of products from the organization',
    description: "Emissions from the downstream use and end-of-life of the organization's products.",
    kind: 'indirect',
    rows: [
      { code: '5.1', name: 'Emissions or removals from the use of the product', description: 'Use-phase emissions of sold products', activityIds: ['act-iso-501'] },
      { code: '5.2', name: 'Emissions from downstream leased assets', description: 'Assets owned and leased to others', activityIds: [] },
      { code: '5.3', name: 'Emissions from the end-of-life stage of the product', description: 'Disposal/recycling of sold products', activityIds: ['act-iso-503'] },
      { code: '5.4', name: 'Emissions from investments', description: 'Equity and debt investment emissions', activityIds: [] },
    ],
  },
  {
    number: '6',
    name: 'Category 6: Other indirect GHG emissions',
    description: 'Indirect emissions not captured by categories 2–5 (e.g. outsourced operations).',
    kind: 'indirect',
    rows: [
      { code: '6.1', name: 'Other indirect emissions from outsourced operations and activities', description: 'Outsourced manufacturing, franchises, processing of sold products', activityIds: ['act-iso-601'] },
    ],
  },
];

/** Flat lookup: ISO sub-category code → human label (for report rows + chips). */
export const isoCategoryLabel: Record<string, string> = isoStructure.reduce(
  (acc, group) => {
    group.rows.forEach((r) => { acc[r.code] = r.name; });
    return acc;
  },
  {} as Record<string, string>
);

/** Category number → full category-header title. */
export const isoCategoryName: Record<string, string> = isoStructure.reduce(
  (acc, group) => { acc[group.number] = group.name; return acc; },
  {} as Record<string, string>
);
