const COLS = [
  { key: 'name',          label: 'Company' },
  { key: 'symbol',        label: 'Symbol' },
  { key: 'sector',        label: 'Sector' },
  { key: 'price',         label: 'Price (₹)' },
  { key: 'marketCap',     label: 'Market Cap (Cr)' },
  { key: 'peRatio',       label: 'P/E' },
  { key: 'pbRatio',       label: 'P/B' },
  { key: 'roe',           label: 'ROE (%)' },
  { key: 'debtToEquity',  label: 'D/E' },
  { key: 'epsGrowth',     label: 'EPS Growth (%)' },
  { key: 'dividendYield', label: 'Div Yield (%)' },
  { key: 'high52w',       label: '52W High' },
  { key: 'low52w',        label: '52W Low' },
  { key: 'volume',        label: 'Volume' },
];

export const exportToCSV = (stocks, filename = 'stockscope') => {
  if (!stocks?.length) return;
  const header = COLS.map((c) => `"${c.label}"`).join(',');
  const rows = stocks.map((s) =>
    COLS.map((c) => (typeof s[c.key] === 'string' ? `"${s[c.key]}"` : s[c.key] ?? '')).join(',')
  );
  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${filename}_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
