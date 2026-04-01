// ─── Pure browser-side filter engine (mirrors the Express backend logic) ───────

const OPERATORS = {
  '>':  (a, b) => a > b,
  '<':  (a, b) => a < b,
  '>=': (a, b) => a >= b,
  '<=': (a, b) => a <= b,
  '=':  (a, b) => Number(a) === Number(b) || String(a).toLowerCase() === String(b).toLowerCase(),
  '!=': (a, b) => Number(a) !== Number(b),
};

const evaluateCondition = (stock, condition) => {
  const { field, operator, value } = condition;
  const stockVal = stock[field];
  if (stockVal === undefined || stockVal === null || value === '' || value === undefined) return true;
  const fn = OPERATORS[operator];
  if (!fn) return true;
  const numVal = parseFloat(value);
  if (!isNaN(numVal) && typeof stockVal === 'number') return fn(stockVal, numVal);
  return fn(String(stockVal).toLowerCase(), String(value).toLowerCase());
};

export const applyFilters = (stocks, conditions, logic = 'AND') => {
  const valid = (conditions || []).filter(
    (c) => c.field && c.operator && c.value !== '' && c.value !== undefined
  );
  if (!valid.length) return stocks;

  return stocks.filter((stock) =>
    logic === 'OR'
      ? valid.some((c) => evaluateCondition(stock, c))
      : valid.every((c) => evaluateCondition(stock, c))
  );
};

// ─── localStorage screener persistence ────────────────────────────────────────
const LS_KEY = 'stockscope_screeners';

export const loadScreeners = () => {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
  catch { return []; }
};

export const saveScreener = (name, conditions, logic) => {
  const all = loadScreeners();
  const idx = all.findIndex((s) => s.name.toLowerCase() === name.trim().toLowerCase());
  const entry = {
    id: idx >= 0 ? all[idx].id : `sc_${Date.now()}`,
    name: name.trim(),
    conditions,
    logic,
    savedAt: new Date().toISOString(),
  };
  if (idx >= 0) all[idx] = entry; else all.push(entry);
  localStorage.setItem(LS_KEY, JSON.stringify(all));
  return all;
};

export const deleteScreener = (id) => {
  const updated = loadScreeners().filter((s) => s.id !== id);
  localStorage.setItem(LS_KEY, JSON.stringify(updated));
  return updated;
};
