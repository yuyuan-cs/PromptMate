#!/usr/bin/env node
/*
  PromptMate Sync Watcher (Plan A)
  - Watches exported file from browser extension and merges into desktop app data JSON
  - No external deps
*/

const fs = require('fs');
const path = require('path');
const os = require('os');
const { mergeData } = require('./merge');

function log(...args) {
  const ts = new Date().toISOString();
  console.log(`[watcher ${ts}]`, ...args);
}

function getEnvPath(name, fallback) {
  return process.env[name] && process.env[name].trim() ? process.env[name] : fallback;
}

const HOME = os.homedir();
const defaultWatch = path.join(HOME, 'Downloads', 'PromptMate', 'promptmate-sync.json');
const WATCH_FILE = path.resolve(getEnvPath('PM_WATCH_FILE', defaultWatch));
const APP_DATA_FILE = process.env.PM_APP_DATA_FILE ? path.resolve(process.env.PM_APP_DATA_FILE) : '';
if (!APP_DATA_FILE) {
  log('ERROR: PM_APP_DATA_FILE is required.');
  process.exit(1);
}

const backupDirDefault = path.join(path.dirname(APP_DATA_FILE), 'backups');
const BACKUP_DIR = path.resolve(getEnvPath('PM_BACKUP_DIR', backupDirDefault));

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readJsonSafe(file) {
  try {
    const txt = fs.readFileSync(file, 'utf-8');
    return JSON.parse(txt);
  } catch (e) {
    return null;
  }
}

function writeJsonPretty(file, obj) {
  ensureDirSync(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(obj, null, 2), 'utf-8');
}

function backupFile(targetFile) {
  try {
    ensureDirSync(BACKUP_DIR);
    const stamp = new Date().toISOString().replace(/[:]/g, '-');
    const name = `backup-${stamp}.json`;
    const out = path.join(BACKUP_DIR, name);
    fs.copyFileSync(targetFile, out);
    log('Backup created:', out);
  } catch {}
}

let timer = null;
async function handleChange() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    const src = readJsonSafe(WATCH_FILE);
    if (!src) {
      log('Skip: cannot read or parse watch file');
      return;
    }
    const dst = readJsonSafe(APP_DATA_FILE) || {};
    const merged = mergeData(dst, src);

    // Backup previous app data if exists
    if (fs.existsSync(APP_DATA_FILE)) {
      backupFile(APP_DATA_FILE);
    }

    const mode = process.env.PM_MODE || 'full';
    if (mode === 'prompts') {
      const outData = Array.isArray(merged.prompts) ? merged.prompts : [];
      writeJsonPretty(APP_DATA_FILE, outData);
      log('Merged prompts into app data (prompts-only):', APP_DATA_FILE);
    } else {
      writeJsonPretty(APP_DATA_FILE, merged);
      log('Merged sync file into app data:', APP_DATA_FILE);
    }
  }, 400);
}

function start() {
  log('Watching:', WATCH_FILE);
  log('Target app data:', APP_DATA_FILE);
  ensureDirSync(path.dirname(APP_DATA_FILE));

  // Initial merge if file already exists
  if (fs.existsSync(WATCH_FILE)) {
    handleChange();
  } else {
    log('Waiting for watch file to appear...');
  }

  // Use fs.watch with debounce
  try {
    fs.watch(path.dirname(WATCH_FILE), { persistent: true }, (event, fname) => {
      if (!fname) return;
      const abs = path.join(path.dirname(WATCH_FILE), fname.toString());
      if (path.resolve(abs) === WATCH_FILE && (event === 'change' || event === 'rename')) {
        handleChange();
      }
    });
  } catch (e) {
    log('ERROR: watch failed:', e.message);
    process.exit(1);
  }
}

start();
