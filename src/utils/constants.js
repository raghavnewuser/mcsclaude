export const SECTORS = [
  'Banking','IT','FMCG','Pharma','Energy','Automobile','Finance',
  'Metals','Cement','Chemicals','Infrastructure','Power','Mining',
  'Consumer Durables','Insurance','Real Estate','Defence','Industrials',
  'Healthcare','Consumer Services','Aviation','Textiles','Diversified',
];

export const MARKET_CAP_CATS = ['Large Cap','Mid Cap','Small Cap'];

export const SECTOR_COLORS = {
  IT:'#3B82F6', Banking:'#8B5CF6', FMCG:'#10B981', Pharma:'#F59E0B',
  Energy:'#EF4444', Automobile:'#06B6D4', Finance:'#6366F1', Metals:'#78716C',
  Cement:'#A8A29E', Chemicals:'#EC4899', Infrastructure:'#F97316', Power:'#EAB308',
  Mining:'#92400E', 'Consumer Durables':'#14B8A6', Insurance:'#7C3AED',
  'Real Estate':'#DC2626', Defence:'#059669', Industrials:'#2563EB',
  Healthcare:'#DB2777', 'Consumer Services':'#0891B2', Aviation:'#A78BFA',
  Textiles:'#D97706', Diversified:'#6B7280',
};

// Filter group definitions — mirrors Moneycontrol's grouped panel layout
export const FILTER_GROUPS = [
  {
    id: 'valuation',
    label: 'Valuation',
    icon: '📊',
    filters: [
      { key: 'peRatio',       label: 'P/E Ratio',          min: 0,   max: 200,  step: 1   },
      { key: 'pbRatio',       label: 'P/B Ratio',          min: 0,   max: 50,   step: 0.1 },
      { key: 'price',         label: 'Price (₹)',           min: 0,   max: 50000,step: 10  },
    ],
  },
  {
    id: 'profitability',
    label: 'Profitability',
    icon: '💹',
    filters: [
      { key: 'roe',           label: 'ROE (%)',             min: -50, max: 150,  step: 1   },
      { key: 'roce',          label: 'ROCE (%)',            min: -50, max: 150,  step: 1   },
    ],
  },
  {
    id: 'growth',
    label: 'Growth',
    icon: '🚀',
    filters: [
      { key: 'epsGrowth',     label: 'EPS Growth (%)',      min: -100,max: 500,  step: 1   },
    ],
  },
  {
    id: 'debt',
    label: 'Debt & Safety',
    icon: '🛡️',
    filters: [
      { key: 'debtToEquity',  label: 'Debt / Equity',       min: 0,   max: 20,   step: 0.1 },
      { key: 'dividendYield', label: 'Dividend Yield (%)',   min: 0,   max: 25,   step: 0.1 },
    ],
  },
  {
    id: 'shareholding',
    label: 'Shareholding',
    icon: '🏦',
    filters: [
      { key: 'promoterHolding', label: 'Promoter Holding (%)', min: 0, max: 100, step: 1 },
      { key: 'fiiHolding',      label: 'FII Holding (%)',       min: 0, max: 100, step: 1 },
      { key: 'diiHolding',      label: 'DII Holding (%)',       min: 0, max: 100, step: 1 },
    ],
  },
  {
    id: 'size',
    label: 'Size & Volume',
    icon: '📦',
    filters: [
      { key: 'marketCap',     label: 'Market Cap (Cr)',      min: 0,   max: 2000000, step: 1000 },
      { key: 'volume',        label: 'Volume',               min: 0,   max: 100000000, step: 100000 },
    ],
  },
];

export const PRESETS = [
  {
    id: 'undervalued',
    name: 'Undervalued Stocks',
    emoji: '🎯',
    filters: { peRatio: { min: '', max: '20' }, pbRatio: { min: '', max: '3' }, roe: { min: '12', max: '' }, debtToEquity: { min: '', max: '1' } },
  },
  {
    id: 'high_growth',
    name: 'High Growth',
    emoji: '🚀',
    filters: { epsGrowth: { min: '25', max: '' }, roe: { min: '20', max: '' } },
  },
  {
    id: 'dividend',
    name: 'High Dividend Yield',
    emoji: '💰',
    filters: { dividendYield: { min: '3', max: '' }, peRatio: { min: '', max: '30' } },
  },
  {
    id: 'low_debt',
    name: 'Low Debt Champions',
    emoji: '🛡️',
    filters: { debtToEquity: { min: '', max: '0.3' }, roe: { min: '18', max: '' } },
  },
  {
    id: 'high_promoter',
    name: 'High Promoter Holding',
    emoji: '👥',
    filters: { promoterHolding: { min: '60', max: '' }, roe: { min: '15', max: '' } },
  },
  {
    id: 'fii_favourite',
    name: 'FII Favourites',
    emoji: '🌍',
    filters: { fiiHolding: { min: '20', max: '' }, roe: { min: '15', max: '' } },
  },
];
