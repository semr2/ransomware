/**
 * Accessibility system: preference detection + overrides, live announcements,
 * captions, keyboard navigation helpers, and the accessible-2D-mode switch.
 * Every screen reader / keyboard behaviour routes through here.
 */

const PREF_KEY = 'nova_a11y';

class Accessibility {
  constructor() {
    this.prefs = {
      reducedMotion: false,
      captions: true,
      muted: false,
      mode2d: false,
      highVisibilityFocus: false,
    };
    this._mediaQuery = null;
    this._onChange = null;         // set by main: called when 2D mode toggles
    this._announcer = null;
  }

  init() {
    this._loadPrefs();
    this._mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this._mediaQuery.addEventListener('change', (e) => {
      if (!this._userOverrodeMotion()) this.prefs.reducedMotion = e.matches;
      this._applyPrefs();
    });
    const url2d = new URLSearchParams(location.search).get('mode') === '2d';
    if (url2d) this.prefs.mode2d = true;
    this._announcer = document.getElementById('sr-live');
    this._applyPrefs();
  }

  _userOverrodeMotion() { return localStorage.getItem(`${PREF_KEY}.motion`) !== null; }

  reducedMotion() { return this.prefs.reducedMotion; }
  captionsOn() { return this.prefs.captions; }
  muted() { return this.prefs.muted; }
  is2d() { return this.prefs.mode2d; }

  setPref(key, value, { userOverride = true } = {}) {
    if (!(key in this.prefs)) return;
    this.prefs[key] = value;
    if (key === 'reducedMotion' && userOverride) {
      try { localStorage.setItem(`${PREF_KEY}.motion`, String(value)); } catch (_) { /* ok */ }
    }
    this._savePrefs();
    this._applyPrefs();
    if (key === 'mode2d' && this._onChange) this._onChange(value);
  }

  toggle2d() { this.setPref('mode2d', !this.prefs.mode2d); }

  _loadPrefs() {
    try {
      const raw = localStorage.getItem(PREF_KEY);
      if (raw) this.prefs = { ...this.prefs, ...JSON.parse(raw) };
    } catch (_) { /* fresh */ }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches && !this._userOverrodeMotion()) {
      this.prefs.reducedMotion = true;
    }
  }

  _savePrefs() {
    try { localStorage.setItem(PREF_KEY, JSON.stringify(this.prefs)); } catch (_) { /* ok */ }
  }

  _applyPrefs() {
    document.documentElement.classList.toggle('reduced-motion', this.prefs.reducedMotion);
    document.documentElement.classList.toggle('focus-high-visibility', this.prefs.highVisibilityFocus);
    document.documentElement.classList.toggle('mode-2d', this.prefs.mode2d);
  }

  /** Sends a message to screen readers via the ARIA live region. */
  announce(message) {
    if (!this._announcer) return;
    this._announcer.textContent = '';
    window.setTimeout(() => { this._announcer.textContent = message; }, 30);
  }

  /** Shows a caption line (auto-hidden unless persistent). */
  caption(text, { duration = 0 } = {}) {
    const bar = document.getElementById('caption-bar');
    if (!bar) return;
    bar.textContent = text;
    bar.hidden = !this.prefs.captions || !text;
    if (duration > 0) {
      clearTimeout(this._captionTimer);
      this._captionTimer = window.setTimeout(() => this.caption(''), duration);
    }
  }

  /** Moves keyboard focus to an element and scrolls it into view. */
  focus(el) {
    if (!el || !el.focus) return;
    el.focus({ preventScroll: false });
  }

  /** Traps Tab focus inside a container while a modal is open. */
  trapFocus(container) {
    container.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const focusables = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }
}

export const a11y = new Accessibility();
