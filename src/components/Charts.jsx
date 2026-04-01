import React, { useMemo, memo } from 'react';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { SECTOR_COLORS } from '../utils/constants';

const TT = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:8, padding:'9px 13px', fontFamily:'var(--mono)', fontSize:12 }}>
      <div style={{ fontWeight:700, color:'var(--text)' }}>{d.name}</div>
      <div style={{ color:'var(--blue)', marginTop:3 }}>{d.value} stocks {d.percent !== undefined && `(${(d.percent*100).toFixed(1)}%)`}</div>
    </div>
  );
};

export const SectorPie = memo(({ stocks }) => {
  const data = useMemo(() => {
    const c = {};
    stocks.forEach((s) => { c[s.sector] = (c[s.sector]||0)+1; });
    return Object.entries(c).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value).slice(0,14);
  }, [stocks]);

  if (!data.length) return null;
  return (
    <div>
      <SectionTitle>Sector Distribution</SectionTitle>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={52} outerRadius={82} paddingAngle={2} dataKey="value">
            {data.map((e) => <Cell key={e.name} fill={SECTOR_COLORS[e.name]||'#6B7280'}/>)}
          </Pie>
          <Tooltip content={<TT/>}/>
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:8 }}>
        {data.map((d) => (
          <div key={d.name} style={{ display:'flex', alignItems:'center', gap:4 }}>
            <div style={{ width:7,height:7,borderRadius:'50%',background:SECTOR_COLORS[d.name]||'#6B7280',flexShrink:0 }}/>
            <span style={{ fontSize:10, fontFamily:'var(--mono)', color:'var(--muted)' }}>{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

export const MarketCapBar = memo(({ stocks }) => {
  const data = useMemo(() => {
    const b = [
      {name:'<5K',    min:0,      max:5000,    count:0},
      {name:'5–20K',  min:5000,   max:20000,   count:0},
      {name:'20–50K', min:20000,  max:50000,   count:0},
      {name:'50–1L',  min:50000,  max:100000,  count:0},
      {name:'1–5L',   min:100000, max:500000,  count:0},
      {name:'>5L',    min:500000, max:Infinity,count:0},
    ];
    stocks.forEach((s) => { const bkt=b.find((x)=>s.marketCap>=x.min&&s.marketCap<x.max); if(bkt)bkt.count++; });
    return b.map((x)=>({name:x.name,stocks:x.count}));
  }, [stocks]);

  return (
    <div>
      <SectionTitle>Market Cap Distribution (Cr)</SectionTitle>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barSize={22}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
          <XAxis dataKey="name" tick={{fill:'var(--muted)',fontSize:10,fontFamily:'var(--mono)'}} axisLine={{stroke:'var(--border)'}} tickLine={false}/>
          <YAxis tick={{fill:'var(--muted)',fontSize:10,fontFamily:'var(--mono)'}} axisLine={false} tickLine={false} width={24}/>
          <Tooltip content={<TT/>} cursor={{fill:'rgba(14,165,233,.06)'}}/>
          <Bar dataKey="stocks" fill="var(--blue)" radius={[3,3,0,0]}/>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

export const TopPerformers = memo(({ stocks }) => {
  if (!stocks.length) return null;
  const byROE  = [...stocks].sort((a,b)=>b.roe-a.roe).slice(0,4);
  const byDiv  = [...stocks].sort((a,b)=>b.dividendYield-a.dividendYield).slice(0,4);
  const byPE   = [...stocks].filter((s)=>s.peRatio>0).sort((a,b)=>a.peRatio-b.peRatio).slice(0,4);

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:20 }}>
      <MiniRank title="Top ROE" items={byROE}  vKey="roe"           fmt={(v)=>`${v.toFixed(1)}%`} color="var(--cyan)"/>
      <MiniRank title="High Dividend" items={byDiv} vKey="dividendYield" fmt={(v)=>`${v.toFixed(1)}%`} color="var(--amber)"/>
      <MiniRank title="Lowest P/E" items={byPE}  vKey="peRatio"       fmt={(v)=>v.toFixed(1)}      color="var(--blue)"/>
    </div>
  );
});

const MiniRank = ({ title, items, vKey, fmt, color }) => (
  <div>
    <SectionTitle>{title}</SectionTitle>
    {items.map((s,i) => (
      <div key={s.symbol+i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:'1px solid var(--border)'}}>
        <div>
          <div style={{fontSize:12,fontFamily:'var(--display)',fontWeight:600}}>{s.name.length>18?s.name.slice(0,16)+'…':s.name}</div>
          <div style={{fontSize:10,color:'var(--muted)',fontFamily:'var(--mono)'}}>{s.symbol}</div>
        </div>
        <div style={{fontFamily:'var(--mono)',fontSize:13,fontWeight:700,color}}>{fmt(s[vKey])}</div>
      </div>
    ))}
  </div>
);

const SectionTitle = ({children}) => (
  <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:12}}>{children}</div>
);
