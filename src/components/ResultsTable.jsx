import React, { useState, useMemo, useCallback, memo } from 'react';
import { SECTOR_COLORS } from '../utils/constants';

const PAGE_SIZES = [10, 25, 50];

const f = {
  price:   (v) => `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  cap:     (v) => { const n = Number(v); if (n >= 100000) return `₹${(n/100000).toFixed(1)}L Cr`; if (n >= 1000) return `₹${(n/1000).toFixed(0)}K Cr`; return `₹${n} Cr`; },
  r2:      (v) => Number(v).toFixed(2),
  r1:      (v) => Number(v).toFixed(1),
  pct:     (v) => `${Number(v).toFixed(1)}%`,
  growth:  (v) => { const n = Number(v); return `${n > 0 ? '+' : ''}${n.toFixed(1)}%`; },
  vol:     (v) => { const n = Number(v); if (n >= 1e7) return `${(n/1e7).toFixed(1)}Cr`; if (n >= 1e5) return `${(n/1e5).toFixed(1)}L`; return n.toLocaleString('en-IN'); },
};

// 52W proximity bar
const W52Bar = memo(({ price, high, low }) => {
  const pct = Math.round(((price - low) / (high - low)) * 100);
  const safe = Math.min(100, Math.max(0, pct));
  return (
    <div style={{ minWidth: 90 }}>
      <div style={{ height: 4, background: '#E8EAF6', borderRadius: 2, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${safe}%`, background: safe > 70 ? '#16a34a' : safe > 40 ? '#1565C0' : '#EF4444', borderRadius: 2 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
        <span style={{ fontSize: 9, color: '#aaa' }}>L</span>
        <span style={{ fontSize: 9, color: '#1565C0', fontWeight: 600 }}>{safe}%</span>
        <span style={{ fontSize: 9, color: '#aaa' }}>H</span>
      </div>
    </div>
  );
});

// Colored number
const Num = memo(({ v, pct = false, growth = false, good, bad }) => {
  const n = parseFloat(v);
  let color = '#333';
  if (good !== undefined && n >= good) color = '#16a34a';
  else if (bad !== undefined && n < bad) color = '#DC2626';
  else if (n < 0) color = '#DC2626';
  const display = growth ? f.growth(v) : pct ? f.pct(v) : f.r2(v);
  return <span style={{ color, fontWeight: 500 }}>{display}</span>;
});

// Shareholding mini bars (Promoter / FII / DII)
const HoldingBadges = memo(({ promoter, fii, dii }) => (
  <div style={{ display: 'flex', gap: 4, flexWrap: 'nowrap' }}>
    {[{l:'P', v:promoter, c:'#1565C0'},{l:'F', v:fii, c:'#7C3AED'},{l:'D', v:dii, c:'#059669'}].map(({l,v,c}) => (
      <div key={l} title={`${l === 'P' ? 'Promoter' : l === 'F' ? 'FII' : 'DII'}: ${v?.toFixed(1)}%`}
        style={{ background: `${c}18`, border: `1px solid ${c}30`, borderRadius: 4, padding: '2px 5px', fontSize: 10, color: c, fontWeight: 600, whiteSpace: 'nowrap' }}>
        {l} {v?.toFixed(0)}%
      </div>
    ))}
  </div>
));

const COLS = [
  { key:'name',            th:'Company',         w:200, left:true,
    cell:(v,r)=>(
      <div>
        <div style={{fontWeight:600,fontSize:13,color:'#111',whiteSpace:'nowrap'}}>{v.length>22?v.slice(0,20)+'…':v}</div>
        <div style={{display:'flex',alignItems:'center',gap:6,marginTop:2}}>
          <span style={{fontFamily:'monospace',fontSize:10,background:'#EEF2FF',color:'#1565C0',padding:'1px 5px',borderRadius:3,fontWeight:700}}>{r.symbol}</span>
          <span style={{fontSize:10,padding:'1px 6px',borderRadius:10,background:`${SECTOR_COLORS[r.sector]||'#6B7280'}15`,color:SECTOR_COLORS[r.sector]||'#6B7280',border:`1px solid ${SECTOR_COLORS[r.sector]||'#6B7280'}30`,whiteSpace:'nowrap'}}>{r.sector}</span>
        </div>
      </div>
    )},
  { key:'price',           th:'Price',           w:100, cell:(v)=><span style={{fontWeight:600,color:'#111'}}>{f.price(v)}</span> },
  { key:'marketCap',       th:'Mkt Cap',         w:110, cell:(v)=><span style={{color:'#444'}}>{f.cap(v)}</span> },
  { key:'peRatio',         th:'P/E',             w:72,  cell:(v)=><Num v={v} bad={0}/> },
  { key:'pbRatio',         th:'P/B',             w:68,  cell:(v)=><Num v={v}/> },
  { key:'roe',             th:'ROE%',            w:72,  cell:(v)=><Num v={v} pct good={15}/> },
  { key:'roce',            th:'ROCE%',           w:72,  cell:(v)=><Num v={v} pct good={15}/> },
  { key:'debtToEquity',    th:'D/E',             w:68,  cell:(v)=><Num v={v} bad={1.5}/> },
  { key:'epsGrowth',       th:'EPS Gr%',         w:82,  cell:(v)=><Num v={v} growth good={15}/> },
  { key:'dividendYield',   th:'Div%',            w:65,  cell:(v)=><Num v={v} pct good={3}/> },
  { key:'promoterHolding', th:'Shareholding',    w:200,
    cell:(v,r)=><HoldingBadges promoter={r.promoterHolding} fii={r.fiiHolding} dii={r.diiHolding}/> },
  { key:'high52w',         th:'52W Range',       w:130,
    cell:(v,r)=><W52Bar price={r.price} high={r.high52w} low={r.low52w}/> },
  { key:'volume',          th:'Volume',          w:90,  cell:(v)=><span style={{color:'#666',fontFamily:'monospace',fontSize:12}}>{f.vol(v)}</span> },
];

// ── Stock Detail Modal ─────────────────────────────────────────────────────────
const DetailModal = memo(({ stock, onClose }) => {
  if (!stock) return null;
  const pct52 = Math.round(((stock.price - stock.low52w) / (stock.high52w - stock.low52w)) * 100);
  return (
    <div onClick={onClose} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}>
      <div onClick={(e)=>e.stopPropagation()} style={{ background:'#fff',borderRadius:12,width:'100%',maxWidth:680,maxHeight:'90vh',overflow:'auto',boxShadow:'0 20px 60px rgba(0,0,0,.3)' }}>
        {/* Header */}
        <div style={{ padding:'20px 24px',borderBottom:'1px solid #f0f0f0',display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
          <div>
            <div style={{ fontSize:20,fontWeight:700,color:'#111' }}>{stock.name}</div>
            <div style={{ display:'flex',gap:8,marginTop:6,alignItems:'center' }}>
              <span style={{ fontFamily:'monospace',fontSize:12,background:'#EEF2FF',color:'#1565C0',padding:'2px 8px',borderRadius:4,fontWeight:700 }}>{stock.symbol}</span>
              <span style={{ fontSize:12,padding:'2px 8px',borderRadius:10,background:`${SECTOR_COLORS[stock.sector]||'#6B7280'}15`,color:SECTOR_COLORS[stock.sector]||'#6B7280',border:`1px solid ${SECTOR_COLORS[stock.sector]||'#6B7280'}30` }}>{stock.sector}</span>
              <span style={{ fontSize:12,padding:'2px 8px',borderRadius:10,background:'#F0FDF4',color:'#16a34a',border:'1px solid #BBF7D0' }}>{stock.marketCapCategory}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#999',lineHeight:1 }}>×</button>
        </div>

        {/* Price + 52W */}
        <div style={{ padding:'16px 24px',background:'#F8FAFC',borderBottom:'1px solid #f0f0f0' }}>
          <div style={{ fontSize:28,fontWeight:700,color:'#111' }}>{f.price(stock.price)}</div>
          <div style={{ marginTop:12 }}>
            <div style={{ display:'flex',justifyContent:'space-between',fontSize:12,color:'#888',marginBottom:6 }}>
              <span>52W Low: {f.price(stock.low52w)}</span>
              <span style={{ color:'#1565C0',fontWeight:600 }}>{pct52}% from low</span>
              <span>52W High: {f.price(stock.high52w)}</span>
            </div>
            <div style={{ height:8,background:'#E8EAF6',borderRadius:4,position:'relative' }}>
              <div style={{ position:'absolute',left:0,top:0,height:'100%',width:`${Math.min(100,Math.max(0,pct52))}%`,background: pct52>70?'#16a34a':pct52>40?'#1565C0':'#EF4444',borderRadius:4 }}/>
            </div>
          </div>
        </div>

        {/* Metrics grid */}
        <div style={{ padding:'20px 24px',display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16 }}>
          {[
            {l:'P/E Ratio',  v:f.r2(stock.peRatio)},
            {l:'P/B Ratio',  v:f.r2(stock.pbRatio)},
            {l:'ROE',        v:f.pct(stock.roe), good: stock.roe >= 15},
            {l:'ROCE',       v:f.pct(stock.roce), good: stock.roce >= 15},
            {l:'Debt/Equity',v:f.r2(stock.debtToEquity), bad: stock.debtToEquity > 1.5},
            {l:'EPS Growth', v:f.growth(stock.epsGrowth), good: stock.epsGrowth > 0, bad2: stock.epsGrowth < 0},
            {l:'Div Yield',  v:f.pct(stock.dividendYield), good: stock.dividendYield >= 3},
            {l:'Market Cap', v:f.cap(stock.marketCap)},
            {l:'Volume',     v:f.vol(stock.volume)},
          ].map(({l,v,good,bad,bad2})=>(
            <div key={l} style={{ background:'#F8FAFC',borderRadius:8,padding:'12px 14px' }}>
              <div style={{ fontSize:11,color:'#888',marginBottom:4 }}>{l}</div>
              <div style={{ fontSize:16,fontWeight:700,color: good?'#16a34a':bad||bad2?'#DC2626':'#111' }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Shareholding */}
        <div style={{ padding:'0 24px 20px' }}>
          <div style={{ fontSize:13,fontWeight:700,color:'#111',marginBottom:12 }}>Shareholding Pattern</div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:10 }}>
            {[
              {l:'Promoter',  v:stock.promoterHolding, c:'#1565C0'},
              {l:'FII',       v:stock.fiiHolding,      c:'#7C3AED'},
              {l:'DII',       v:stock.diiHolding,      c:'#059669'},
              {l:'Public',    v:stock.publicHolding,   c:'#D97706'},
            ].map(({l,v,c})=>(
              <div key={l} style={{ textAlign:'center' }}>
                <div style={{ height:4,background:'#E8EAF6',borderRadius:2,marginBottom:8 }}>
                  <div style={{ height:'100%',width:`${v}%`,background:c,borderRadius:2 }}/>
                </div>
                <div style={{ fontSize:16,fontWeight:700,color:c }}>{v?.toFixed(1)}%</div>
                <div style={{ fontSize:11,color:'#888',marginTop:2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

// ── Pagination ─────────────────────────────────────────────────────────────────
const Pager = memo(({ page, total, size, onChange, onSizeChange }) => {
  const pages = Math.max(1, Math.ceil(total / size));
  const lo = Math.max(1, page - 2), hi = Math.min(pages, page + 2);
  const nums = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
  return (
    <div style={{ display:'flex',alignItems:'center',gap:8,padding:'10px 16px',borderTop:'1px solid #f0f0f0',flexWrap:'wrap' }}>
      <span style={{ fontSize:12,color:'#888',whiteSpace:'nowrap' }}>
        {(page-1)*size+1}–{Math.min(page*size,total)} of {total} stocks
      </span>
      <div style={{ display:'flex',gap:4,marginLeft:'auto' }}>
        {[{l:'«',t:1},{l:'‹',t:page-1},...nums.map(n=>({l:n,t:n})),{l:'›',t:page+1},{l:'»',t:pages}].map((b,i)=>{
          const dis = b.t < 1 || b.t > pages;
          const act = b.l === page;
          return (
            <button key={i} disabled={dis} onClick={()=>onChange(b.t)} style={{
              width:30,height:28,borderRadius:4,border:`1px solid ${act?'#1565C0':'#E0E0E0'}`,
              background:act?'#1565C0':'#fff',color:act?'#fff':dis?'#ccc':'#333',
              cursor:dis?'not-allowed':'pointer',fontSize:12,fontWeight:act?700:400,
            }}>{b.l}</button>
          );
        })}
      </div>
      <select value={size} onChange={(e)=>onSizeChange(+e.target.value)} style={{ border:'1px solid #E0E0E0',borderRadius:4,padding:'4px 8px',fontSize:12,outline:'none' }}>
        {PAGE_SIZES.map(s=><option key={s} value={s}>{s} / page</option>)}
      </select>
    </div>
  );
});

// ── ResultsTable ───────────────────────────────────────────────────────────────
export default function ResultsTable({ stocks, isFiltered }) {
  const [sortKey, setSortKey]   = useState(null);
  const [sortDir, setSortDir]   = useState('asc');
  const [page,    setPage]      = useState(1);
  const [size,    setSize]      = useState(25);
  const [detail,  setDetail]    = useState(null);

  const handleSort = useCallback((key) => {
    setSortDir(d => sortKey === key && d === 'asc' ? 'desc' : 'asc');
    setSortKey(key);
    setPage(1);
  }, [sortKey]);

  const sorted = useMemo(() => {
    if (!sortKey) return stocks;
    return [...stocks].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (typeof av === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [stocks, sortKey, sortDir]);

  React.useEffect(() => { setPage(1); }, [stocks.length]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / size));
  const safePage   = Math.min(page, totalPages);
  const slice      = sorted.slice((safePage - 1) * size, safePage * size);

  if (!stocks.length) return (
    <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:300,gap:12,color:'#888' }}>
      <div style={{ fontSize:40 }}>🔍</div>
      <div style={{ fontSize:15,fontWeight:500,color:'#555' }}>No stocks match your filters</div>
      <div style={{ fontSize:13 }}>Try adjusting or removing some filters</div>
    </div>
  );

  return (
    <>
      <div style={{ flex:1, overflowX:'auto', overflowY:'auto' }}>
        <table style={{ borderCollapse:'collapse', width:'100%', minWidth:1300 }}>
          <thead>
            <tr style={{ background:'#F8FAFC' }}>
              <th style={{ ...TH, width:40, textAlign:'left', paddingLeft:16 }}>#</th>
              {COLS.map((c) => (
                <th key={c.key} onClick={() => handleSort(c.key)} style={{
                  ...TH, width:c.w, textAlign:c.left?'left':'right', cursor:'pointer',
                  color: sortKey===c.key ? '#1565C0' : '#555',
                }}>
                  {c.th} {sortKey===c.key ? (sortDir==='asc'?'↑':'↓') : <span style={{opacity:.3}}>⇅</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((s, i) => (
              <tr key={s.symbol + i}
                onClick={() => setDetail(s)}
                style={{ borderBottom:'1px solid #F5F5F5', cursor:'pointer', transition:'background .1s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F0F4FF'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
              >
                <td style={{ ...TD, paddingLeft:16, color:'#bbb', fontSize:11 }}>{(safePage-1)*size+i+1}</td>
                {COLS.map((c) => (
                  <td key={c.key} style={{ ...TD, textAlign:c.left?'left':'right' }}>
                    {c.cell ? c.cell(s[c.key], s) : s[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pager
        page={safePage} total={sorted.length} size={size}
        onChange={setPage} onSizeChange={(s) => { setSize(s); setPage(1); }}
      />

      <DetailModal stock={detail} onClose={() => setDetail(null)} />
    </>
  );
}

const TH = { padding:'10px 12px', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'2px solid #E8EAF6', whiteSpace:'nowrap', userSelect:'none', position:'sticky', top:0, zIndex:2, background:'#F8FAFC' };
const TD = { padding:'11px 12px', fontSize:13, whiteSpace:'nowrap', verticalAlign:'middle' };
