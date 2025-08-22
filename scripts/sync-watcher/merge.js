// Minimal merge logic for PromptMate data
// Usage: const { mergeData } = require('./merge');

function parseDate(ts) {
  const t = ts ? Date.parse(ts) : NaN;
  return isNaN(t) ? 0 : t;
}

function pickLatestTimestamp(a, b) {
  return parseDate(a) >= parseDate(b) ? a : b;
}

function mergePrompts(existingArr = [], incomingArr = []) {
  const byId = new Map();
  for (const p of existingArr) byId.set(p.id, { ...p });
  for (const p of incomingArr) {
    const prev = byId.get(p.id);
    if (!prev) {
      byId.set(p.id, { ...p });
      continue;
    }
    const aTime = parseDate(prev.updatedAt);
    const bTime = parseDate(p.updatedAt);
    const newer = bTime > aTime ? p : prev;
    const older = newer === p ? prev : p;
    const merged = {
      ...older,
      ...newer,
      usageCount: Math.max(prev.usageCount || 0, p.usageCount || 0),
      lastUsed: pickLatestTimestamp(prev.lastUsed, p.lastUsed),
      updatedAt: pickLatestTimestamp(prev.updatedAt, p.updatedAt),
    };
    byId.set(p.id, merged);
  }
  return Array.from(byId.values());
}

function mergeCategories(existingArr = [], incomingArr = []) {
  const byId = new Map();
  for (const c of existingArr) byId.set(c.id, { ...c });
  for (const c of incomingArr) {
    const prev = byId.get(c.id);
    if (!prev) {
      byId.set(c.id, { ...c });
      continue;
    }
    byId.set(c.id, { ...prev, ...c });
  }
  return Array.from(byId.values());
}

function mergeSettings(existing = {}, incoming = {}) {
  // Prefer existing values; fill missing keys from incoming
  return { ...incoming, ...existing };
}

function normalizeData(data = {}) {
  return {
    prompts: Array.isArray(data.prompts) ? data.prompts : [],
    categories: Array.isArray(data.categories) ? data.categories : [],
    settings: typeof data.settings === 'object' && data.settings ? data.settings : {},
    version: data.version || '1.0.0',
    exportDate: data.exportDate || new Date().toISOString(),
  };
}

function mergeData(existingRaw, incomingRaw) {
  const existing = normalizeData(existingRaw);
  const incoming = normalizeData(incomingRaw);
  return {
    prompts: mergePrompts(existing.prompts, incoming.prompts),
    categories: mergeCategories(existing.categories, incoming.categories),
    settings: mergeSettings(existing.settings, incoming.settings),
    version: existing.version || incoming.version || '1.0.0',
    exportDate: new Date().toISOString(),
  };
}

module.exports = {
  mergeData,
};
