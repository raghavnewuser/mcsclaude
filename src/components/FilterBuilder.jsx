import React, { useState, useCallback, memo } from 'react';
import { FIELDS, OPERATORS, PRESETS } from '../utils/constants';
import { saveScreener } from '../utils/filterEngine';

const uid = () => Math.random().toString(36).slice(2, 8);
const blank = () => ({ id: uid(), field: 'peRatio', operator: '<', value: '' });

const S = {
  label: { fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' },
  select: {
    appearance: 'none', background: 'var(--card)', border: '1px solid var(--border)',
    color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 12,
    padding: '7px 10px', borderRadius: 6, outline: 'none', width: '100%', cursor: 'pointer',
  },
  input: {
    background: 'var(--card)', border: '1px solid var(--border)',
    color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 12,
    padding: '7px 10px', borderRadius: 6, outline: 'none', width: '100%',
  },
};

const ConditionRow = memo(({ c, onChange, onRemove }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 88px 100px 30px', gap: 6, animation: 'fadeIn .2s ease' }}>
    <select style={S.select} value={c.field} onChange={(e) => onChange(c.id, 'field', e.target.value)}>
      {FIELDS.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
    </select>
    <select style={S.select} value={c.operator} onChange={(e) => onChange(c.id, 'operator', e.target.value)}>
      {OPERATORS.map((o) => <option key={o.value} value={o.value}>{o.value}</option>)}
    </select>
    <input
      style={S.input} type={c.field === 'sector' ? 'text' : 'number'}
      step="any" placeholder="Value"
      value={c.value} onChange={(e) => onChange(c.id, 'value', e.target.value)}
    />
    <button onClick={() => onRemove(c.id)} style={{
      background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)',
      color: '#EF4444', borderRadius: 6, cursor: 'pointer', fontSize: 16,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>×</button>
  </div>
));

export default function FilterBuilder({ onFilter, onClear, isFiltered, resultCount, total, onScreenerSaved }) {
  const [rows,       setRows]      = useState([blank()]);
  const [logic,      setLogic]     = useState('AND');
  const [preset,     setPreset]    = useState(null);
  const [saveMode,   setSaveMode]  = useState(false);
  const [saveName,   setSaveName]  = useState('');
  const [saveMsg,    setSaveMsg]   = useState('');

  const update = useCallback((id, key, val) =>
    setRows((p) => p.map((r) => r.id === id ? { ...r, [key]: val } : r)), []);

  const remove = useCallback((id) =>
    setRows((p) => p.length === 1 ? [blank()] : p.filter((r) => r.id !== id)), []);

  const handleRun = () => {
    const valid = rows.filter((r) => r.value !== '');
    onFilter(valid, logic);
  };

  const handleClear = () => {
    setRows([blank()]); setPreset(null); onClear();
  };

  const applyPreset = (p) => {
    setRows(p.conditions.map((c) => ({ ...c, id: uid() })));
    setLogic(p.logic);
    setPreset(p.id);
    onFilter(p.conditions, p.logic);
  };

  const handleSave = () => {
    if (!saveName.trim()) return;
    const valid = rows.filter((r) => r.value !== '');
    saveScreener(saveName.trim(), valid, logic);
    setSaveMsg('✓ Saved!');
    setSaveName('');
    setSaveMode(false);
    onScreenerSaved();
    setTimeout(() => setSaveMsg(''), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Presets */}
      <div>
        <div style={{ ...S.label, marginBottom: 8 }}>Quick Presets</div>
        {PRESETS.map((p) => (
          <button key={p.id} onClick={() => applyPreset(p)} style={{
            width: '100%', textAlign: 'left', marginBottom: 4,
            background: preset === p.id ? 'rgba(14,165,233,.15)' : 'var(--card)',
            border: `1px solid ${preset === p.id ? 'rgba(14,165,233,.5)' : 'var(--border)'}`,
            borderRadius: 7, padding: '7px 10px', cursor: 'pointer',
            color: preset === p.id ? 'var(--blue)' : 'var(--muted)',
            transition: 'all .15s',
          }}>
            <div style={{ fontSize: 12, fontFamily: 'var(--display)', fontWeight: 600, color: preset === p.id ? 'var(--blue)' : 'var(--text)' }}>{p.name}</div>
            <div style={{ fontSize: 10, fontFamily: 'var(--mono)', marginTop: 2, opacity: .7 }}>{p.desc}</div>
          </button>
        ))}
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: 0 }} />

      {/* AND / OR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={S.label}>Logic</span>
        <div style={{ display: 'flex', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 2, gap: 2 }}>
          {['AND','OR'].map((l) => (
            <button key={l} onClick={() => setLogic(l)} style={{
              padding: '4px 14px', borderRadius: 14, border: 'none', cursor: 'pointer',
              fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700,
              background: logic === l ? 'var(--blue)' : 'transparent',
              color: logic === l ? '#fff' : 'var(--muted)',
              transition: 'all .15s',
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Column headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 88px 100px 30px', gap: 6 }}>
        {['Field','Op','Value',''].map((h) => <div key={h} style={S.label}>{h}</div>)}
      </div>

      {/* Condition rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {rows.map((r) => <ConditionRow key={r.id} c={r} onChange={update} onRemove={remove} />)}
      </div>

      {/* Add condition */}
      <button onClick={() => setRows((p) => [...p, blank()])} style={{
        background: 'transparent', border: '1px dashed var(--border-bright)',
        color: 'var(--muted)', borderRadius: 6, padding: 7, cursor: 'pointer',
        fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.06em',
        transition: 'all .15s',
      }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor='var(--blue)'; e.currentTarget.style.color='var(--blue)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor='var(--border-bright)'; e.currentTarget.style.color='var(--muted)'; }}
      >+ ADD CONDITION</button>

      {/* Run / Reset */}
      <div style={{ display: 'flex', gap: 7 }}>
        <button onClick={handleRun} style={{
          flex: 1, background: 'var(--blue)', border: 'none', color: '#fff',
          borderRadius: 7, padding: 10, cursor: 'pointer',
          fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 12, letterSpacing: '0.08em',
        }}>▶ RUN SCREEN</button>
        {isFiltered && (
          <button onClick={handleClear} style={{
            background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--muted)',
            borderRadius: 7, padding: '10px 12px', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 11,
          }}>RESET</button>
        )}
      </div>

      {/* Result badge */}
      {isFiltered && (
        <div style={{
          background: 'rgba(6,214,160,.08)', border: '1px solid rgba(6,214,160,.2)',
          borderRadius: 6, padding: '7px 12px', fontFamily: 'var(--mono)', fontSize: 12,
          color: 'var(--cyan)', textAlign: 'center',
        }}>{resultCount} / {total} stocks matched</div>
      )}

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: 0 }} />

      {/* Save screener */}
      {saveMsg && <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--cyan)', textAlign: 'center' }}>{saveMsg}</div>}
      {!saveMode ? (
        <button onClick={() => setSaveMode(true)} style={{
          background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)',
          borderRadius: 6, padding: 8, cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 11,
          letterSpacing: '0.06em', transition: 'all .15s',
        }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor='var(--amber)'; e.currentTarget.style.color='var(--amber)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--muted)'; }}
        >☆ SAVE SCREENER</button>
      ) : (
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            style={{ ...S.input, flex: 1 }} placeholder="Screener name…"
            value={saveName} onChange={(e) => setSaveName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            autoFocus
          />
          <button onClick={handleSave} disabled={!saveName.trim()} style={{
            background: 'var(--amber)', border: 'none', color: '#000',
            borderRadius: 6, padding: '0 12px', cursor: 'pointer',
            fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700,
            opacity: saveName.trim() ? 1 : 0.4,
          }}>SAVE</button>
          <button onClick={() => { setSaveMode(false); setSaveName(''); }} style={{
            background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--muted)',
            borderRadius: 6, padding: '0 10px', cursor: 'pointer', fontSize: 14,
          }}>×</button>
        </div>
      )}
    </div>
  );
}
