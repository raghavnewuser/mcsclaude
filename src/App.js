import React, { useState, useMemo, useCallback } from 'react';
import STOCKS from './data/stocks';
import { applyFilters, loadScreeners, deleteScreener } from './utils/filterEngine';
import { exportToCSV } from './utils/exportCSV';
import FilterBuilder from './components/FilterBuilder';
import StockTable from './components/StockTable';
import SavedScreeners from './components/SavedScreeners';
import { SectorPie, MarketCapBar, TopPerformers } from './components/Charts';
import './index.css';

const StatCard = ({ label, value, color = 'var(--blue)' }) => (
  <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:8, padding:'11px 15px', minWidth:0 }}>
    <div style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:5 }}>{label}</div>
    <div style={{ fontFamily:'var(--mono)', fontSize:19, fontWeight:700, color, lineHeight:1 }}>{value}</div>
  </div>
);

export default function App() {
  const [results,    setResults]    = useState(STOCKS);
  const [isFiltered, setIsFiltered] = useState(false);
  const [screeners,  setScreeners]  = useState(loadScreeners);
  const [tab,        setTab]        = useState('table');

  const stats = useMemo(() => {
    if (!results.length) return null;
    const withPE  = results.filter((s)=>s.peRatio>0);
    const avgPE   = withPE.length ? withPE.reduce((a,b)=>a+b.peRatio,0)/withPE.length : 0;
    const avgROE  = results.reduce((a,b)=>a+b.roe,0)/results.length;
    const sectors = new Set(results.map((s)=>s.sector)).size;
    const totalMC = results.reduce((a,b)=>a+b.marketCap,0);
    return { avgPE, avgROE, sectors, totalMC };
  }, [results]);

  const handleFilter = useCallback((conditions, logic) => {
    const filtered = applyFilters(STOCKS, conditions, logic);
    setResults(filtered);
    setIsFiltered(conditions.length > 0);
  }, []);

  const handleClear = useCallback(() => {
    setResults(STOCKS);
    setIsFiltered(false);
  }, []);

  const handleLoadScreener = useCallback((s) => {
    const filtered = applyFilters(STOCKS, s.conditions, s.logic);
    setResults(filtered);
    setIsFiltered(true);
  }, []);

  const handleDeleteScreener = useCallback((id) => {
    setScreeners(deleteScreener(id));
  }, []);

  const refreshScreeners = useCallback(() => {
    setScreeners(loadScreeners());
  }, []);

  const fmtMC = (v) => v >= 1e6 ? `₹${(v/1e5).toFixed(0)}L Cr` : `₹${(v/1e3).toFixed(0)}K Cr`;

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', fontFamily:'var(--display)' }}>

      {/* ── Header ── */}
      <header style={{
        background:'var(--panel)', borderBottom:'1px solid var(--border)',
        height:54, padding:'0 20px',
        display:'flex', alignItems:'center', justifyContent:'space-between', gap:16,
        position:'sticky', top:0, zIndex:50,
      }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
          <div style={{ width:30,height:30,background:'linear-gradient(135deg,var(--blue),#7C3AED)',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14 }}>📊</div>
          <div>
            <div style={{ fontFamily:'var(--display)', fontWeight:800, fontSize:16, letterSpacing:'-0.02em', lineHeight:1 }}>StockScope</div>
            <div style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--muted)', letterSpacing:'0.12em' }}>INDIA MARKET SCREENER</div>
          </div>
        </div>

        {/* Saved screeners */}
        <div style={{ flex:1, display:'flex', justifyContent:'center' }}>
          <SavedScreeners screeners={screeners} onLoad={handleLoadScreener} onDelete={handleDeleteScreener}/>
        </div>

        {/* Right actions */}
        <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
          {isFiltered && (
            <div style={{ background:'rgba(6,214,160,.08)', border:'1px solid rgba(6,214,160,.25)', borderRadius:6, padding:'5px 10px', fontFamily:'var(--mono)', fontSize:11, color:'var(--cyan)', display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ width:7,height:7,borderRadius:'50%',background:'var(--cyan)',display:'inline-block',animation:'pulse 2s infinite' }}/>
              {results.length} results
            </div>
          )}
          <button onClick={() => exportToCSV(results, isFiltered ? 'filtered' : 'all_stocks')}
            disabled={!results.length}
            style={{ background:'var(--card)', border:'1px solid var(--border)', color:results.length?'var(--muted)':'var(--muted)', borderRadius:7, padding:'6px 13px', cursor:results.length?'pointer':'not-allowed', fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.06em', transition:'all .15s', opacity:results.length?1:.5 }}
            onMouseEnter={(e)=>{ if(results.length){e.currentTarget.style.borderColor='var(--cyan)';e.currentTarget.style.color='var(--cyan)';} }}
            onMouseLeave={(e)=>{ e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--muted)'; }}
          >↓ CSV</button>
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:7, padding:'6px 11px', fontFamily:'var(--mono)', fontSize:11, color:'var(--muted)', display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ width:7,height:7,borderRadius:'50%',background:'var(--cyan)',display:'inline-block',animation:'pulse 2s infinite' }}/>
            {STOCKS.length} stocks
          </div>
        </div>
      </header>

      {/* ── Main layout ── */}
      <div style={{ display:'flex', height:'calc(100vh - 54px)' }}>

        {/* Left sidebar: filters */}
        <aside style={{ width:256, flexShrink:0, borderRight:'1px solid var(--border)', background:'var(--panel)', overflowY:'auto', padding:14 }}>
          <div style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--muted)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:12 }}>▼ Filter Engine</div>
          <FilterBuilder
            onFilter={handleFilter}
            onClear={handleClear}
            isFiltered={isFiltered}
            resultCount={results.length}
            total={STOCKS.length}
            onScreenerSaved={refreshScreeners}
          />
        </aside>

        {/* Right: results */}
        <main style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>

          {/* Stats bar */}
          {stats && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, padding:'10px 14px', borderBottom:'1px solid var(--border)', background:'var(--panel)', flexShrink:0 }}>
              <StatCard label="Avg P/E"    value={stats.avgPE.toFixed(1)}  color="var(--blue)"/>
              <StatCard label="Avg ROE"    value={`${stats.avgROE.toFixed(1)}%`} color="var(--cyan)"/>
              <StatCard label="Sectors"    value={stats.sectors}            color="var(--amber)"/>
              <StatCard label="Total Mkt Cap" value={fmtMC(stats.totalMC)} color="var(--text)"/>
            </div>
          )}

          {/* Tabs */}
          <div style={{ display:'flex', borderBottom:'1px solid var(--border)', background:'var(--panel)', padding:'0 14px', flexShrink:0 }}>
            {[{id:'table',label:'⊞ Results Table'},{id:'charts',label:'⊡ Charts & Analytics'}].map((t)=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{
                background:'none', border:'none', cursor:'pointer',
                borderBottom:`2px solid ${tab===t.id?'var(--blue)':'transparent'}`,
                color:tab===t.id?'var(--blue)':'var(--muted)',
                fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.06em',
                padding:'9px 14px', marginBottom:-1, transition:'all .15s',
              }}>{t.label}</button>
            ))}
            <div style={{ marginLeft:'auto', display:'flex', alignItems:'center' }}>
              {isFiltered && (
                <span style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--cyan)', background:'rgba(6,214,160,.08)', border:'1px solid rgba(6,214,160,.2)', borderRadius:4, padding:'2px 8px' }}>
                  FILTERED · {results.length}
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div style={{ flex:1, overflow:'auto' }}>
            {tab === 'table' && <StockTable stocks={results} isFiltered={isFiltered}/>}
            {tab === 'charts' && (
              <div style={{ padding:18, display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
                <div style={{ background:'var(--panel)', border:'1px solid var(--border)', borderRadius:10, padding:18 }}>
                  <SectorPie stocks={results}/>
                </div>
                <div style={{ background:'var(--panel)', border:'1px solid var(--border)', borderRadius:10, padding:18 }}>
                  <MarketCapBar stocks={results}/>
                </div>
                <div style={{ background:'var(--panel)', border:'1px solid var(--border)', borderRadius:10, padding:18, gridColumn:'1/-1' }}>
                  <div style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:14 }}>Top Performers</div>
                  <TopPerformers stocks={results}/>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
