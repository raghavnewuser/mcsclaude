import React, { useState, useMemo, memo, useCallback } from 'react';

const fmt = {
  price:    (v) => `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  cap:      (v) => { const n=Number(v); if(n>=100000) return `₹${(n/100000).toFixed(1)}L Cr`; if(n>=1000) return `₹${(n/1000).toFixed(0)}K Cr`; return `₹${n}Cr`; },
  ratio:    (v) => Number(v).toFixed(2),
  pct:      (v) => `${Number(v).toFixed(1)}%`,
  vol:      (v) => { const n=Number(v); if(n>=1e7) return `${(n/1e7).toFixed(1)}Cr`; if(n>=1e5) return `${(n/1e5).toFixed(1)}L`; return n.toLocaleString('en-IN'); },
};

const SECTOR_CLR = { IT:'#0EA5E9', Banking:'#8B5CF6', FMCG:'#10B981', Pharma:'#F59E0B', Energy:'#EF4444', Automobile:'#06B6D4', Finance:'#6366F1', Metals:'#78716C', Cement:'#A8A29E', Chemicals:'#EC4899', Infrastructure:'#F97316', Power:'#FCD34D', Mining:'#92400E', 'Consumer Durables':'#14B8A6', Insurance:'#7C3AED', 'Real Estate':'#DC2626', Defence:'#059669', Industrials:'#2563EB', Healthcare:'#DB2777', 'Consumer Services':'#0891B2', Aviation:'#A78BFA', Textiles:'#D97706', Diversified:'#6B7280' };

const Num = memo(({ v, good, bad, fmt: f }) => {
  const n = parseFloat(v);
  const color = good !== undefined && n >= good ? 'var(--cyan)' : bad !== undefined && n < bad ? 'var(--red)' : n < 0 ? 'var(--red)' : 'inherit';
  return <span style={{ color, fontFamily: 'var(--mono)', fontSize: 12 }}>{f(v)}</span>;
});

const COLS = [
  { key:'name',          th:'Company',   w:220, left:true,
    cell:(v,r)=><div><span style={{fontFamily:'var(--display)',fontWeight:600,fontSize:13}}>{v}</span><span style={{display:'inline-block',fontFamily:'var(--mono)',fontSize:9,fontWeight:700,padding:'2px 5px',borderRadius:3,background:'rgba(14,165,233,.12)',color:'var(--blue)',marginLeft:6}}>{r.symbol}</span></div> },
  { key:'sector',        th:'Sector',    w:140,
    cell:(v)=><span style={{fontSize:10,padding:'2px 7px',borderRadius:10,fontFamily:'var(--mono)',background:`${SECTOR_CLR[v]||'#6B7280'}18`,color:SECTOR_CLR[v]||'#6B7280',border:`1px solid ${SECTOR_CLR[v]||'#6B7280'}30`,whiteSpace:'nowrap'}}>{v}</span> },
  { key:'price',         th:'Price',     w:100, cell:(v)=><Num v={v} fmt={fmt.price}/> },
  { key:'marketCap',     th:'Mkt Cap',   w:110, cell:(v)=><Num v={v} fmt={fmt.cap}/> },
  { key:'peRatio',       th:'P/E',       w:72,  cell:(v)=><Num v={v} bad={0} fmt={fmt.ratio}/> },
  { key:'pbRatio',       th:'P/B',       w:72,  cell:(v)=><Num v={v} fmt={fmt.ratio}/> },
  { key:'roe',           th:'ROE%',      w:72,  cell:(v)=><Num v={v} good={15} fmt={fmt.pct}/> },
  { key:'debtToEquity',  th:'D/E',       w:72,  cell:(v)=><Num v={v} bad={1.5} fmt={fmt.ratio}/> },
  { key:'epsGrowth',     th:'EPS Gr%',   w:82,  cell:(v)=><span style={{color:parseFloat(v)>0?'var(--cyan)':'var(--red)',fontFamily:'var(--mono)',fontSize:12}}>{parseFloat(v)>0?'+':''}{fmt.pct(v)}</span> },
  { key:'dividendYield', th:'Div%',      w:68,  cell:(v)=><Num v={v} good={3} fmt={fmt.pct}/> },
  { key:'high52w',       th:'52W Hi',    w:100, cell:(v)=><Num v={v} fmt={fmt.price}/> },
  { key:'low52w',        th:'52W Lo',    w:100, cell:(v)=><Num v={v} fmt={fmt.price}/> },
  { key:'volume',        th:'Volume',    w:90,  cell:(v)=><Num v={v} fmt={fmt.vol}/> },
];

const PAGE_SIZES = [10, 25, 50];

export default function StockTable({ stocks, isFiltered }) {
  const [sortKey,   setSortKey]  = useState(null);
  const [sortDir,   setSortDir]  = useState('asc');
  const [page,      setPage]     = useState(1);
  const [pageSize,  setPageSize] = useState(25);

  const handleSort = useCallback((key) => {
    setSortDir((d) => sortKey === key && d === 'asc' ? 'desc' : 'asc');
    setSortKey(key);
    setPage(1);
  }, [sortKey]);

  const sorted = useMemo(() => {
    if (!sortKey) return stocks;
    return [...stocks].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (typeof av === 'number') return sortDir === 'asc' ? av-bv : bv-av;
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [stocks, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const slice      = sorted.slice((safePage-1)*pageSize, safePage*pageSize);
  const start      = (safePage-1)*pageSize+1;
  const end        = Math.min(safePage*pageSize, sorted.length);

  // Reset page when stocks change
  React.useEffect(() => { setPage(1); }, [stocks.length]);

  if (!stocks.length) return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:300,gap:12}}>
      <div style={{fontSize:40}}>📭</div>
      <div style={{fontFamily:'var(--mono)',color:'var(--muted)',fontSize:13}}>No stocks match your criteria</div>
      <div style={{fontFamily:'var(--mono)',color:'var(--muted)',fontSize:11,opacity:.6}}>Try adjusting or removing conditions</div>
    </div>
  );

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
      {/* Table */}
      <div style={{flex:1,overflowX:'auto',overflowY:'auto'}}>
        <table style={{borderCollapse:'collapse',width:'100%',minWidth:1200}}>
          <thead>
            <tr>
              <th style={{...thStyle,width:40,textAlign:'left'}}>#</th>
              {COLS.map((c)=>(
                <th key={c.key} onClick={()=>handleSort(c.key)}
                  style={{...thStyle,width:c.w,textAlign:c.left?'left':'right',cursor:'pointer',
                    color:sortKey===c.key?'var(--blue)':'var(--muted)',
                  }}>
                  {c.th}{sortKey===c.key?<span style={{marginLeft:3}}>{sortDir==='asc'?'↑':'↓'}</span>:<span style={{marginLeft:3,opacity:.2}}>⇅</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((s,i)=>(
              <tr key={s.symbol+i} style={{borderBottom:'1px solid var(--border)',transition:'background .1s'}}
                onMouseEnter={(e)=>e.currentTarget.style.background='var(--hover)'}
                onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
                <td style={{...tdStyle,color:'var(--muted)',fontSize:11}}>{start+i}</td>
                {COLS.map((c)=>(
                  <td key={c.key} style={{...tdStyle,textAlign:c.left?'left':'right',
                    borderLeft: isFiltered && c.key==='name' ? '2px solid var(--blue)' : undefined,
                    background: isFiltered && c.key==='name' ? 'rgba(14,165,233,.04)' : undefined,
                  }}>
                    {c.cell?c.cell(s[c.key],s):s[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderTop:'1px solid var(--border)',flexWrap:'wrap',flexShrink:0}}>
        <span style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--muted)',whiteSpace:'nowrap'}}>
          {start}–{end} of {sorted.length}
        </span>
        <div style={{display:'flex',gap:4,marginLeft:'auto'}}>
          {[{l:'«',t:1},{l:'‹',t:safePage-1},...pages(safePage,totalPages).map((p)=>({l:p,t:p})),{l:'›',t:safePage+1},{l:'»',t:totalPages}].map((b,i)=>(
            <PBtn key={i} label={b.l} target={b.t} current={safePage} total={totalPages} go={setPage}/>
          ))}
        </div>
        <select value={pageSize} onChange={(e)=>{setPageSize(+e.target.value);setPage(1);}}
          style={{background:'var(--card)',border:'1px solid var(--border)',color:'var(--text)',fontFamily:'var(--mono)',fontSize:11,padding:'4px 8px',borderRadius:5,outline:'none'}}>
          {PAGE_SIZES.map((s)=><option key={s} value={s}>{s}/pg</option>)}
        </select>
      </div>
    </div>
  );
}

const pages = (cur, total) => {
  const lo = Math.max(1, cur-2), hi = Math.min(total, cur+2);
  return Array.from({length: hi-lo+1}, (_,i)=>lo+i);
};

const PBtn = memo(({ label, target, current, total, go }) => {
  const disabled = target < 1 || target > total;
  const active   = label === current;
  return (
    <button disabled={disabled} onClick={()=>go(target)} style={{
      background: active ? 'var(--blue)' : 'var(--card)',
      border: `1px solid ${active ? 'var(--blue)' : 'var(--border)'}`,
      color: active ? '#fff' : disabled ? 'var(--muted)' : 'var(--text-secondary)',
      borderRadius: 5, width: 28, height: 27, cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: 'var(--mono)', fontSize: 11, transition: 'all .1s',
    }}>{label}</button>
  );
});

const thStyle = {
  background:'var(--panel)', padding:'9px 12px', fontSize:10,
  fontFamily:'var(--mono)', fontWeight:400, letterSpacing:'0.08em',
  textTransform:'uppercase', position:'sticky', top:0, zIndex:2,
  borderBottom:'1px solid var(--border)', userSelect:'none', whiteSpace:'nowrap',
};
const tdStyle = { padding:'9px 12px', whiteSpace:'nowrap' };
