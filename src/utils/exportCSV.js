export const exportToCSV = (stocks, filename = 'mcscreener') => {
  if (!stocks?.length) return;
  const cols = [
    {k:'name',l:'Company'},{k:'symbol',l:'Symbol'},{k:'sector',l:'Sector'},
    {k:'marketCapCategory',l:'Cap Category'},{k:'price',l:'Price (₹)'},
    {k:'marketCap',l:'Market Cap (Cr)'},{k:'peRatio',l:'P/E'},{k:'pbRatio',l:'P/B'},
    {k:'roe',l:'ROE %'},{k:'roce',l:'ROCE %'},{k:'debtToEquity',l:'D/E'},
    {k:'epsGrowth',l:'EPS Growth %'},{k:'dividendYield',l:'Div Yield %'},
    {k:'promoterHolding',l:'Promoter %'},{k:'fiiHolding',l:'FII %'},
    {k:'diiHolding',l:'DII %'},{k:'high52w',l:'52W High'},{k:'low52w',l:'52W Low'},
    {k:'volume',l:'Volume'},{k:'pat',l:'PAT (Cr)'},
  ];
  const header = cols.map(c=>`"${c.l}"`).join(',');
  const rows = stocks.map(s=>cols.map(c=>typeof s[c.k]==='string'?`"${s[c.k]}"`:s[c.k]??'').join(','));
  const blob = new Blob([[header,...rows].join('\n')],{type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href=url; a.download=`${filename}_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
