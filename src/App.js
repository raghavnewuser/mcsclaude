import React, { useState, useMemo, useCallback } from 'react';
import STOCKS from './data/stocks';
import { applyFilters, loadScreeners, saveScreener, deleteScreener } from './utils/filterEngine';
import { exportToCSV } from './utils/exportCSV';
import { PRESETS, SECTOR_COLORS } from './utils/constants';
import FilterPanel from './components/FilterPanel';
import ResultsTable from './components/ResultsTable';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const EMPTY = {};

/* ── Preset bar ─────────────────────────────────────────────────────────────── */
const PresetBar = ({ active, onSelect }) => (
  <div style={{ display:'flex', gap:8, overflowX:'auto' }}>
    {PRESETS.map((p) => (
      <button key={p.id} onClick={() => onSelect(p)} style={{
        whiteSpace:'nowrap', padding:'6px 14px', borderRadius:20, fontSize:12, fontWeight:500,
        cursor:'pointer', border:'1px solid', transition:'all .15s',
        borderColor: active === p.id ? '#1565C0' : '#E0E0E0',
        background:  active === p.id ? '#1565C0' : '#fff',
        color:       active === p.id ? '#fff'    : '#444',
      }}>{p.emoji} {p.name}</button>
    ))}
  </div>
);

/* ── Saved screens dropdown ─────────────────────────────────────────────────── */
const SavedDropdown = ({ screeners, onLoad, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);
  return (
    <div ref={ref} style={{ position:'relative' }}>
      <button onClick={() => setOpen(p => !p)} style={{ padding:'7px 14px', border:'1px solid rgba(255,255,255,.35)', borderRadius:6, background:'transparent', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:500, display:'flex', alignItems:'center', gap:6 }}>
        ☆ Saved {screeners.length > 0 && <span style={{ background:'rgba(255,255,255,.25)', borderRadius:10, padding:'0 6px', fontSize:11 }}>{screeners.length}</span>} {open ? '▲' : '▼'}
      </button>
      {open && (
        <div style={{ position:'absolute', top:'calc(100% + 6px)', right:0, minWidth:260, background:'#fff', border:'1px solid #E0E0E0', borderRadius:8, boxShadow:'0 8px 24px rgba(0,0,0,.12)', zIndex:200, overflow:'hidden' }}>
          {!screeners.length
            ? <div style={{ padding:16, fontSize:13, color:'#aaa', textAlign:'center' }}>No saved screeners yet</div>
            : screeners.map(s => (
              <div key={s.id} style={{ display:'flex', alignItems:'center', padding:'10px 14px', borderBottom:'1px solid #F5F5F5', transition:'background .1s' }}
                onMouseEnter={e => e.currentTarget.style.background='#F8FAFC'}
                onMouseLeave={e => e.currentTarget.style.background='#fff'}>
                <div style={{ flex:1, cursor:'pointer' }} onClick={() => { onLoad(s); setOpen(false); }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'#222' }}>{s.name}</div>
                  <div style={{ fontSize:11, color:'#aaa', marginTop:2 }}>{new Date(s.savedAt).toLocaleDateString()}</div>
                </div>
                <button onClick={() => onDelete(s.id)} style={{ background:'none', border:'none', color:'#ccc', cursor:'pointer', fontSize:18, padding:'2px 6px' }}
                  onMouseEnter={e => e.currentTarget.style.color='#EF4444'}
                  onMouseLeave={e => e.currentTarget.style.color='#ccc'}>×</button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

/* ── Charts panel ───────────────────────────────────────────────────────────── */
const TT = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return <div style={{ background:'#fff', border:'1px solid #E0E0E0', borderRadius:8, padding:'8px 12px', fontSize:12, boxShadow:'0 2px 8px rgba(0,0,0,.1)' }}><b>{d.name}</b><br /><span style={{ color:'#1565C0' }}>{d.value} stocks</span></div>;
};

const ChartsPanel = ({ stocks }) => {
  const sectorData = useMemo(() => {
    const c = {};
    stocks.forEach(s => { c[s.sector] = (c[s.sector] || 0) + 1; });
    return Object.entries(c).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);
  }, [stocks]);

  const capData = useMemo(() => {
    const c = { 'Large Cap': 0, 'Mid Cap': 0, 'Small Cap': 0 };
    stocks.forEach(s => { if (c[s.marketCapCategory] !== undefined) c[s.marketCapCategory]++; });
    return Object.entries(c).map(([name, value]) => ({ name, value }));
  }, [stocks]);

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, padding:16 }}>
      <div style={{ background:'#fff', border:'1px solid #E8EAF6', borderRadius:10, padding:16 }}>
        <div style={{ fontSize:13, fontWeight:600, color:'#222', marginBottom:12 }}>Sector Distribution</div>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={sectorData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
              {sectorData.map(e => <Cell key={e.name} fill={SECTOR_COLORS[e.name] || '#6B7280'} />)}
            </Pie>
            <Tooltip content={<TT />} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:8 }}>
          {sectorData.map(d => (
            <div key={d.name} style={{ display:'flex', alignItems:'center', gap:4 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:SECTOR_COLORS[d.name] || '#6B7280' }} />
              <span style={{ fontSize:10, color:'#666' }}>{d.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background:'#fff', border:'1px solid #E8EAF6', borderRadius:10, padding:16 }}>
        <div style={{ fontSize:13, fontWeight:600, color:'#222', marginBottom:12 }}>Market Cap Mix</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={capData} barSize={48}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize:11, fill:'#888' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize:11, fill:'#888' }} axisLine={false} tickLine={false} width={24} />
            <Tooltip content={<TT />} cursor={{ fill:'rgba(21,101,192,.06)' }} />
            <Bar dataKey="value" fill="#1565C0" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

/* ── App ────────────────────────────────────────────────────────────────────── */
export default function App() {
  const [filters,      setFilters]      = useState(EMPTY);
  const [screeners,    setScreeners]    = useState(loadScreeners);
  const [activePreset, setActivePreset] = useState(null);
  const [tab,          setTab]          = useState('table');
  const [saveName,     setSaveName]     = useState('');
  const [saveMsg,      setSaveMsg]      = useState('');

  const results    = useMemo(() => applyFilters(STOCKS, filters), [filters]);
  const isFiltered = useMemo(() => Object.keys(filters).some(k => {
    const v = filters[k];
    if (Array.isArray(v)) return v.length > 0;
    if (v && typeof v === 'object') return v.min !== '' || v.max !== '';
    return false;
  }), [filters]);

  const applyPreset = useCallback((p) => { setFilters(p.filters); setActivePreset(p.id); }, []);
  const reset       = useCallback(() => { setFilters(EMPTY); setActivePreset(null); }, []);
  const handleSave  = useCallback(() => {
    if (!saveName.trim()) return;
    setScreeners(saveScreener(saveName.trim(), filters));
    setSaveName('');
    setSaveMsg('✓ Saved!');
    setTimeout(() => setSaveMsg(''), 2500);
  }, [saveName, filters]);

  const stats = useMemo(() => {
    if (!results.length) return null;
    const withPE = results.filter(s => s.peRatio > 0);
    return {
      avgPE:       withPE.length ? (withPE.reduce((a, b) => a + b.peRatio, 0) / withPE.length).toFixed(1) : '-',
      avgROE:      (results.reduce((a, b) => a + b.roe, 0) / results.length).toFixed(1),
      avgPromoter: (results.reduce((a, b) => a + b.promoterHolding, 0) / results.length).toFixed(1),
      sectors:     new Set(results.map(s => s.sector)).size,
    };
  }, [results]);

  return (
    <div style={{ minHeight:'100vh', background:'#F5F7FA', fontFamily:"'Inter', sans-serif", display:'flex', flexDirection:'column' }}>

      {/* Nav */}
      <header style={{ background:'#1565C0', color:'#fff', padding:'0 20px', height:52, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:19, fontWeight:800, letterSpacing:'-0.5px' }}>📈 MC Screener</span>
          <span style={{ background:'rgba(255,255,255,.2)', borderRadius:4, padding:'2px 8px', fontSize:11, fontWeight:600 }}>NSE · BSE · India</span>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <SavedDropdown screeners={screeners} onLoad={(s) => { setFilters(s.filters); setActivePreset(null); }} onDelete={(id) => setScreeners(deleteScreener(id))} />
          <button onClick={() => exportToCSV(results)} disabled={!results.length} style={{ padding:'7px 14px', borderRadius:6, border:'1px solid rgba(255,255,255,.35)', background:'transparent', color:'#fff', cursor:results.length ? 'pointer' : 'not-allowed', fontSize:13, fontWeight:500, opacity:results.length ? 1 : .5 }}>↓ CSV</button>
        </div>
      </header>

      {/* Preset bar */}
      <div style={{ background:'#fff', borderBottom:'1px solid #E8EAF6', padding:'10px 20px', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
        <span style={{ fontSize:11, color:'#999', fontWeight:700, whiteSpace:'nowrap', textTransform:'uppercase', letterSpacing:'0.06em', flexShrink:0 }}>Quick Screens</span>
        <PresetBar active={activePreset} onSelect={applyPreset} />
        {isFiltered && <button onClick={reset} style={{ flexShrink:0, whiteSpace:'nowrap', padding:'6px 14px', borderRadius:20, fontSize:12, fontWeight:600, cursor:'pointer', border:'1px solid #EF4444', color:'#EF4444', background:'#fff' }}>× Reset All</button>}
      </div>

      {/* Body */}
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

        {/* Filter sidebar */}
        <aside style={{ width:262, flexShrink:0, borderRight:'1px solid #E8EAF6', background:'#fff', overflow:'hidden', display:'flex', flexDirection:'column' }}>
          <FilterPanel filters={filters} onChange={setFilters} onReset={reset} resultCount={results.length} total={STOCKS.length} />
        </aside>

        {/* Main */}
        <main style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>

          {/* Stats + save bar */}
          <div style={{ background:'#fff', borderBottom:'1px solid #E8EAF6', padding:'10px 16px', display:'flex', alignItems:'center', gap:10, flexShrink:0, flexWrap:'wrap' }}>
            <div style={{ fontSize:15, fontWeight:700, color:'#111' }}>
              {results.length} <span style={{ fontSize:13, fontWeight:400, color:'#888' }}>stocks</span>
              {isFiltered && <span style={{ marginLeft:8, fontSize:11, color:'#1565C0', background:'#EEF2FF', border:'1px solid #C7D7F8', borderRadius:12, padding:'2px 8px' }}>Filtered</span>}
            </div>
            {stats && (
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {[{l:'Avg P/E',v:stats.avgPE,c:'#1565C0'},{l:'Avg ROE',v:`${stats.avgROE}%`,c:'#16a34a'},{l:'Avg Promoter',v:`${stats.avgPromoter}%`,c:'#7C3AED'},{l:'Sectors',v:stats.sectors,c:'#D97706'}].map(({l,v,c}) => (
                  <span key={l} style={{ background:`${c}10`, border:`1px solid ${c}22`, borderRadius:20, padding:'3px 10px', fontSize:12 }}>
                    <span style={{ color:'#888', marginRight:4 }}>{l}</span>
                    <span style={{ fontWeight:700, color:c }}>{v}</span>
                  </span>
                ))}
              </div>
            )}
            <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
              {saveMsg && <span style={{ fontSize:12, color:'#16a34a', fontWeight:600 }}>{saveMsg}</span>}
              <input value={saveName} onChange={e => setSaveName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave()} placeholder="Save this screen…" style={{ border:'1px solid #E0E0E0', borderRadius:6, padding:'6px 10px', fontSize:12, outline:'none', width:170 }} />
              <button onClick={handleSave} disabled={!saveName.trim()} style={{ padding:'6px 14px', background:saveName.trim() ? '#1565C0' : '#E0E0E0', color:saveName.trim() ? '#fff' : '#aaa', border:'none', borderRadius:6, cursor:saveName.trim() ? 'pointer' : 'not-allowed', fontSize:12, fontWeight:600 }}>Save</button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ background:'#fff', borderBottom:'1px solid #E8EAF6', padding:'0 16px', display:'flex', flexShrink:0 }}>
            {[{id:'table',l:'📋 Results'},{id:'charts',l:'📊 Charts'}].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ background:'none', border:'none', cursor:'pointer', padding:'9px 16px', fontSize:13, fontWeight:500, marginBottom:-1, borderBottom:`2px solid ${tab === t.id ? '#1565C0' : 'transparent'}`, color:tab === t.id ? '#1565C0' : '#666' }}>{t.l}</button>
            ))}
          </div>

          <div style={{ flex:1, overflow:'auto', display:'flex', flexDirection:'column' }}>
            {tab === 'table'  && <ResultsTable stocks={results} isFiltered={isFiltered} />}
            {tab === 'charts' && <ChartsPanel stocks={results} />}
          </div>
        </main>
      </div>
    </div>
  );
}
