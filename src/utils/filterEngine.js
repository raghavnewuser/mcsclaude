// ── Pure browser filter engine ─────────────────────────────────────────────────

export const applyFilters = (stocks, filters) => {
  return stocks.filter((s) => {
    // Market Cap Category
    if (filters.marketCapCategory?.length && !filters.marketCapCategory.includes(s.marketCapCategory)) return false;

    // Sector
    if (filters.sectors?.length && !filters.sectors.includes(s.sector)) return false;

    // Numeric range filters
    const rangeFields = [
      'price','peRatio','pbRatio','roe','roce','debtToEquity',
      'epsGrowth','dividendYield','marketCap','promoterHolding',
      'fiiHolding','diiHolding','volume',
    ];
    for (const field of rangeFields) {
      const f = filters[field];
      if (!f) continue;
      const val = s[field];
      if (f.min !== '' && f.min !== undefined && val < parseFloat(f.min)) return false;
      if (f.max !== '' && f.max !== undefined && val > parseFloat(f.max)) return false;
    }
    return true;
  });
};

// ── localStorage screener persistence ─────────────────────────────────────────
const KEY = 'mcscreener_saved';

export const loadScreeners = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
};

export const saveScreener = (name, filters) => {
  const all = loadScreeners();
  const idx = all.findIndex((s) => s.name.toLowerCase() === name.trim().toLowerCase());
  const entry = { id: idx >= 0 ? all[idx].id : `sc_${Date.now()}`, name: name.trim(), filters, savedAt: new Date().toISOString() };
  if (idx >= 0) all[idx] = entry; else all.push(entry);
  localStorage.setItem(KEY, JSON.stringify(all));
  return all;
};

export const deleteScreener = (id) => {
  const updated = loadScreeners().filter((s) => s.id !== id);
  localStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
};
