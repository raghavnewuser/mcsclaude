export const PRESETS = [
  {
    id: 'undervalued',
    name: '🎯 Undervalued Stocks',
    desc: 'Low P/E, Low P/B, decent ROE',
    conditions: [
      { field: 'peRatio',       operator: '<',  value: '20' },
      { field: 'pbRatio',       operator: '<',  value: '3'  },
      { field: 'roe',           operator: '>',  value: '12' },
      { field: 'debtToEquity',  operator: '<',  value: '1'  },
    ],
    logic: 'AND',
  },
  {
    id: 'high_growth',
    name: '🚀 High Growth',
    desc: 'Strong EPS growth & ROE',
    conditions: [
      { field: 'epsGrowth', operator: '>', value: '25' },
      { field: 'roe',       operator: '>', value: '20' },
    ],
    logic: 'AND',
  },
  {
    id: 'dividend',
    name: '💰 High Dividend',
    desc: 'Dividend yield ≥ 3%',
    conditions: [
      { field: 'dividendYield', operator: '>=', value: '3'  },
      { field: 'peRatio',       operator: '<',  value: '30' },
    ],
    logic: 'AND',
  },
  {
    id: 'large_cap',
    name: '🏦 Large Cap Value',
    desc: 'Mkt Cap > 1L Cr, low P/E',
    conditions: [
      { field: 'marketCap', operator: '>', value: '100000' },
      { field: 'peRatio',   operator: '<', value: '25'     },
    ],
    logic: 'AND',
  },
  {
    id: 'low_debt',
    name: '🛡️ Low Debt Champions',
    desc: 'Near debt-free + strong ROE',
    conditions: [
      { field: 'debtToEquity', operator: '<=', value: '0.2' },
      { field: 'roe',          operator: '>',  value: '18'  },
      { field: 'epsGrowth',    operator: '>',  value: '10'  },
    ],
    logic: 'AND',
  },
  {
    id: 'energy_value',
    name: '⚡ Energy Value Play',
    desc: 'Energy sector, low P/E, high div',
    conditions: [
      { field: 'sector',        operator: '=',  value: 'Energy' },
      { field: 'dividendYield', operator: '>=', value: '3'      },
    ],
    logic: 'AND',
  },
];

export const OPERATORS = [
  { value: '>',  label: '> Greater than'    },
  { value: '<',  label: '< Less than'       },
  { value: '>=', label: '≥ Greater or equal' },
  { value: '<=', label: '≤ Less or equal'    },
  { value: '=',  label: '= Equals'          },
  { value: '!=', label: '≠ Not equal'       },
];

export const FIELDS = [
  { key: 'price',         label: 'Price (₹)'           },
  { key: 'marketCap',     label: 'Market Cap (Cr)'      },
  { key: 'peRatio',       label: 'P/E Ratio'            },
  { key: 'pbRatio',       label: 'P/B Ratio'            },
  { key: 'roe',           label: 'ROE (%)'              },
  { key: 'debtToEquity',  label: 'Debt / Equity'        },
  { key: 'epsGrowth',     label: 'EPS Growth (%)'       },
  { key: 'dividendYield', label: 'Dividend Yield (%)'   },
  { key: 'high52w',       label: '52W High (₹)'         },
  { key: 'low52w',        label: '52W Low (₹)'          },
  { key: 'volume',        label: 'Volume'               },
  { key: 'sector',        label: 'Sector'               },
];

export const SECTOR_COLORS = {
  'IT':                '#0EA5E9',
  'Banking':           '#8B5CF6',
  'FMCG':              '#10B981',
  'Pharma':            '#F59E0B',
  'Energy':            '#EF4444',
  'Automobile':        '#06B6D4',
  'Finance':           '#6366F1',
  'Metals':            '#78716C',
  'Cement':            '#A8A29E',
  'Chemicals':         '#EC4899',
  'Infrastructure':    '#F97316',
  'Power':             '#FCD34D',
  'Mining':            '#92400E',
  'Consumer Durables': '#14B8A6',
  'Insurance':         '#7C3AED',
  'Real Estate':       '#DC2626',
  'Defence':           '#059669',
  'Industrials':       '#2563EB',
  'Healthcare':        '#DB2777',
  'Consumer Services': '#0891B2',
  'Aviation':          '#A78BFA',
  'Textiles':          '#D97706',
  'Diversified':       '#6B7280',
};
