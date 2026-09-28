/**
 * SCORM 1.2 adapter.
 * Real API discovery against the LMS (window chain), with a localStorage-backed
 * mock adapter for local development. The rest of the course only ever talks
 * to this module, so the same code runs in both modes.
 */

const FIND_ATTEMPTS = [
  () => window.API,
  () => window.parent && window.parent !== window ? window.parent.API : null,
  () => window.opener ? window.opener.API : null,
  () => window.parent && window.parent !== window && window.parent.parent ? window.parent.parent.API : null,
];

function findLmsAPI() {
  for (const attempt of FIND_ATTEMPTS) {
    try {
      const api = attempt();
      if (api && typeof api.LMSInitialize === 'function') return api;
    } catch (_) { /* cross-origin frame access — keep looking */ }
  }
  return null;
}

/** Local-development mock of the SCORM 1.2 runtime API. */
class MockAPI {
  constructor() {
    this.mode = 'LOCAL MOCK';
    this.data = {
      'cmi.core.lesson_status': 'not attempted',
      'cmi.core.score.raw': '',
      'cmi.core.session_time': '00:00:00.0',
      'cmi.suspend_data': '',
      'cmi.student_name': 'Local Learner, (Dev Mode)',
    };
    this.interactionCount = 0;
    this._load();
  }
  LMSInitialize() { this._log('LMSInitialize'); return 'true'; }
  LMSFinish() { this._log('LMSFinish'); this._save(); return 'true'; }
  LMSGetValue(key) {
    if (key === 'cmi.interactions._count') return String(this.interactionCount);
    return Object.prototype.hasOwnProperty.call(this.data, key) ? this.data[key] : '';
  }
  LMSSetValue(key, value) {
    if (key === 'cmi.interactions._count') return 'true';
    const m = key.match(/^cmi\.interactions\.(\d+)\.(.+)$/);
    if (m) {
      const idx = Number(m[1]);
      this.interactionCount = Math.max(this.interactionCount, idx + 1);
      this.data[`__int_${idx}_${m[2]}`] = String(value);
      this._save();
      return 'true';
    }
    this.data[key] = String(value);
    this._save();
    return 'true';
  }
  LMSCommit() { this._save(); this._log('LMSCommit'); return 'true'; }
  LMSGetLastError() { return '0'; }
  LMSGetErrorString() { return 'No error'; }
  LMSGetDiagnostic() { return 'Mock adapter — running outside an LMS'; }
  _log(fn) { console.info(`[SCORM:${this.mode}] ${fn}`); }
  _save() {
    try { localStorage.setItem('nova_scorm_mock', JSON.stringify({ data: this.data, count: this.interactionCount })); }
    catch (_) { /* storage unavailable — mock still works in-memory */ }
  }
  _load() {
    try {
      const raw = localStorage.getItem('nova_scorm_mock');
      if (raw) {
        const parsed = JSON.parse(raw);
        this.data = { ...this.data, ...parsed.data };
        this.interactionCount = parsed.count || 0;
      }
    } catch (_) { /* fresh session */ }
  }
}

class ScormAdapter {
  constructor() {
    this.api = null;
    this.mode = 'UNAVAILABLE';
    this.initialized = false;
    this.startTime = Date.now();
    this.interactionIndex = 0;
    this.available = false;
  }

  init() {
    this.api = findLmsAPI();
    if (!this.api) this.api = new MockAPI();
    this.mode = this.api instanceof MockAPI ? 'LOCAL MOCK' : 'LMS';
    try {
      const result = this.api.LMSInitialize('');
      this.initialized = result === 'true';
      this.available = this.initialized;
    } catch (err) {
      console.warn('[SCORM] LMSInitialize failed:', err);
      this.available = false;
    }
    if (this.available) {
      this.interactionIndex = Number(this.api.LMSGetValue('cmi.interactions._count')) || 0;
      // Never downgrade an already-completed attempt.
      const status = this.api.LMSGetValue('cmi.core.lesson_status');
      if (status !== 'completed' && status !== 'passed' && status !== 'failed') {
        this.setValue('cmi.core.lesson_status', 'incomplete');
      }
      window.addEventListener('beforeunload', () => this.finish());
    }
    return this.available;
  }

  getValue(key) {
    if (!this.available) return '';
    try { return this.api.LMSGetValue(key) || ''; } catch (_) { return ''; }
  }

  setValue(key, value) {
    if (!this.available) return false;
    try { return this.api.LMSSetValue(key, String(value)) === 'true'; } catch (_) { return false; }
  }

  commit() {
    if (!this.available) return;
    try { this.api.LMSCommit(''); } catch (_) { /* non-fatal */ }
  }

  setLessonStatus(status) {
    // passed | failed | incomplete | completed
    this.setValue('cmi.core.lesson_status', status);
    this.commit();
  }

  setScore(raw, max = 100) {
    this.setValue('cmi.core.score.raw', Math.round(raw));
    this.setValue('cmi.core.score.min', 0);
    this.setValue('cmi.core.score.max', max);
    this.commit();
  }

  getSuspendData() { return this.getValue('cmi.suspend_data'); }

  setSuspendData(str) {
    // SCORM 1.2 caps suspend_data at 4096 characters.
    if (str.length > 4000) {
      console.warn('[SCORM] suspend_data near size limit:', str.length);
    }
    this.setValue('cmi.suspend_data', str);
    this.commit();
  }

  /** Records one decision as a SCORM interaction. result: 'correct' | 'wrong' | 'neutral' */
  recordInteraction(id, response, result) {
    if (!this.available) return;
    const n = this.interactionIndex;
    this.setValue(`cmi.interactions.${n}.id`, id);
    this.setValue(`cmi.interactions.${n}.type`, 'choice');
    this.setValue(`cmi.interactions.${n}.student_response`, String(response).slice(0, 255));
    this.setValue(`cmi.interactions.${n}.result`, result);
    this.interactionIndex += 1;
    this.commit();
  }

  finish() {
    if (!this.initialized) return;
    this.setValue('cmi.core.session_time', this._sessionTime());
    this.commit();
    try { this.api.LMSFinish(''); } catch (_) { /* already finished */ }
    this.initialized = false;
    this.available = false;
  }

  _sessionTime() {
    const seconds = Math.min(Math.floor((Date.now() - this.startTime) / 1000), 100 * 3600);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const pad = (v, w = 2) => String(v).padStart(w, '0');
    return `${pad(h, 4)}:${pad(m)}:${pad(s)}.0`;
  }
}

export const scorm = new ScormAdapter();
