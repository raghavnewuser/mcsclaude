import React, { useState, useCallback } from 'react';
import { FILTER_GROUPS, SECTORS, MARKET_CAP_CATS, PRESETS } from '../utils/constants';

const emptyFilters = () => ({});

// ── Range Input Row ────────────────────────────────────────────────────────────
const RangeRow = ({ label, field, filters, onChange }) => {
  const val = filters[field] || { min: '', max: '' };
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, color: '#555', fontWeight: 500, marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="number" placeholder="Min"
          value={val.min}
          onChange={(e) => onChange(field, { ...val, min: e.target.value })}
          style={inputStyle}
        />
        <span style={{ color: '#aaa', fontSize: 12, flexShrink: 0 }}>to</span>
        <input
          type="number" placeholder="Max"
          value={val.max}
          onChange={(e) => onChange(field, { ...val, max: e.target.value })}
          style={inputStyle}
        />
      </div>
    </div>
  );
};

// ── Collapsible Filter Group ───────────────────────────────────────────────────
const FilterGroup = ({ group, filters, onChange }) => {
  const [open, setOpen] = useState(true);
  const hasActive = group.filters.some((f) => {
    const v = filters[f.key];
    return v && (v.min !== '' || v.max !== '');
  });

  return (
    <div style={{ borderBottom: '1px solid #f0f0f0' }}>
      <button
        onClick={() => setOpen((p) => !p)}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', textAlign: 'left',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>{group.icon}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#222' }}>{group.label}</span>
          {hasActive && (
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1565C0', display: 'inline-block' }} />
          )}
        </span>
        <span style={{ color: '#aaa', fontSize: 11 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{ padding: '4px 16px 8px' }}>
          {group.filters.map((f) => (
            <RangeRow key={f.key} label={f.label} field={f.key} filters={filters} onChange={onChange} />
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main FilterPanel ───────────────────────────────────────────────────────────
export default function FilterPanel({ filters, onChange, onReset, resultCount, total }) {

  // Market Cap Category pills
  const toggleCap = useCallback((cat) => {
    const current = filters.marketCapCategory || [];
    const next = current.includes(cat) ? current.filter((c) => c !== cat) : [...current, cat];
    onChange({ ...filters, marketCapCategory: next });
  }, [filters, onChange]);

  // Sector checkboxes
  const toggleSector = useCallback((sec) => {
    const current = filters.sectors || [];
    const next = current.includes(sec) ? current.filter((s) => s !== sec) : [...current, sec];
    onChange({ ...filters, sectors: next });
  }, [filters, onChange]);

  // Numeric range
  const handleRange = useCallback((field, val) => {
    onChange({ ...filters, [field]: val });
  }, [filters, onChange]);

  const [sectorExpanded, setSectorExpanded] = useState(false);
  const visibleSectors = sectorExpanded ? SECTORS : SECTORS.slice(0, 8);
  const hasFilters = Object.keys(filters).some((k) => {
    const v = filters[k];
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === 'object' && v !== null) return v.min !== '' || v.max !== '';
    return false;
  });

  return (
    <div style={{ background: '#fff', height: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>Filters</div>
          <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
            {resultCount} of {total} stocks
          </div>
        </div>
        {hasFilters && (
          <button onClick={onReset} style={{
            background: 'none', border: '1px solid #1565C0', color: '#1565C0',
            borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 500,
          }}>Reset All</button>
        )}
      </div>

      {/* Scrollable filter area */}
      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* Market Cap Category */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#222', marginBottom: 10 }}>Market Cap</div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {MARKET_CAP_CATS.map((cat) => {
              const active = (filters.marketCapCategory || []).includes(cat);
              return (
                <button key={cat} onClick={() => toggleCap(cat)} style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: 'none',
                  background: active ? '#1565C0' : '#EEF2FF',
                  color: active ? '#fff' : '#1565C0',
                  transition: 'all .15s',
                }}>{cat}</button>
              );
            })}
          </div>
        </div>

        {/* Sectors */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#222', marginBottom: 10 }}>Sector</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {visibleSectors.map((sec) => {
              const checked = (filters.sectors || []).includes(sec);
              return (
                <label key={sec} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox" checked={checked}
                    onChange={() => toggleSector(sec)}
                    style={{ accentColor: '#1565C0', width: 14, height: 14 }}
                  />
                  <span style={{ fontSize: 12, color: '#333' }}>{sec}</span>
                </label>
              );
            })}
          </div>
          <button onClick={() => setSectorExpanded((p) => !p)} style={{
            marginTop: 8, background: 'none', border: 'none', color: '#1565C0',
            cursor: 'pointer', fontSize: 12, fontWeight: 500, padding: 0,
          }}>
            {sectorExpanded ? '▲ Show less' : `▼ +${SECTORS.length - 8} more`}
          </button>
        </div>

        {/* Grouped numeric filters */}
        {FILTER_GROUPS.map((group) => (
          <FilterGroup key={group.id} group={group} filters={filters} onChange={handleRange} />
        ))}
      </div>
    </div>
  );
}

const inputStyle = {
  flex: 1, padding: '6px 10px', border: '1px solid #E0E0E0', borderRadius: 6,
  fontSize: 12, outline: 'none', color: '#333', background: '#FAFAFA',
  minWidth: 0,
};
