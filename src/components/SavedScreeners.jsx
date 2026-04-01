import React, { useState, useRef, useEffect, memo } from 'react';

export default memo(function SavedScreeners({ screeners, onLoad, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  if (!screeners.length) return (
    <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:7,padding:'7px 13px',fontFamily:'var(--mono)',fontSize:11,color:'var(--muted)',display:'flex',alignItems:'center',gap:8}}>
      ☆ No saved screeners
    </div>
  );

  return (
    <div ref={ref} style={{ position:'relative' }}>
      <button onClick={() => setOpen((p)=>!p)} style={{
        background:'var(--card)', border:'1px solid var(--border)', color:'var(--text)',
        borderRadius:7, padding:'7px 13px', cursor:'pointer',
        fontFamily:'var(--mono)', fontSize:11,
        display:'flex', alignItems:'center', gap:8, whiteSpace:'nowrap',
        transition:'border-color .15s',
      }}
        onMouseEnter={(e)=>e.currentTarget.style.borderColor='var(--blue)'}
        onMouseLeave={(e)=>e.currentTarget.style.borderColor='var(--border)'}
      >
        ☆ Saved ({screeners.length}) <span style={{opacity:.5}}>{open?'▲':'▼'}</span>
      </button>

      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 6px)', left:0, minWidth:260,
          background:'var(--panel)', border:'1px solid var(--border)', borderRadius:8,
          zIndex:100, boxShadow:'0 8px 32px rgba(0,0,0,.5)',
          overflow:'hidden', animation:'fadeIn .15s ease',
        }}>
          <div style={{padding:'8px 13px',borderBottom:'1px solid var(--border)',fontFamily:'var(--mono)',fontSize:10,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.1em'}}>
            Saved Screeners
          </div>
          {screeners.map((s) => (
            <div key={s.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 13px',borderBottom:'1px solid var(--border)',transition:'background .1s'}}
              onMouseEnter={(e)=>e.currentTarget.style.background='var(--hover)'}
              onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
              <div style={{flex:1,cursor:'pointer'}} onClick={()=>{ onLoad(s); setOpen(false); }}>
                <div style={{fontFamily:'var(--display)',fontSize:13,fontWeight:600}}>{s.name}</div>
                <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--muted)',marginTop:2}}>
                  {s.conditions.length} condition{s.conditions.length!==1?'s':''} · {s.logic}
                </div>
              </div>
              <button onClick={(e)=>{e.stopPropagation(); onDelete(s.id);}} style={{
                background:'none', border:'none', color:'var(--muted)', cursor:'pointer',
                fontSize:16, padding:'3px 6px', borderRadius:4, lineHeight:1, transition:'color .1s',
              }}
                onMouseEnter={(e)=>e.currentTarget.style.color='var(--red)'}
                onMouseLeave={(e)=>e.currentTarget.style.color='var(--muted)'}
              >×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
