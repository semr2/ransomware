/**
 * NOVA Desktop — the fictional operating system shown on the monitors.
 * A window manager plus dock. App windows are registered by their modules
 * (email, file manager, ticketing, …). Visually original: not a copy of
 * Windows / macOS / any real desktop.
 */

const ICONS = {
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="#5eead4" stroke-width="1.7"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></svg>',
  files: '<svg viewBox="0 0 24 24" fill="none" stroke="#93c5fd" stroke-width="1.7"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
  security: '<svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="1.7"><path d="M12 3l7 3v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6z"/></svg>',
  browser: '<svg viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14 0 18-3-4-3-14.5 0-18z"/></svg>',
  tickets: '<svg viewBox="0 0 24 24" fill="none" stroke="#f9a8d4" stroke-width="1.7"><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"/><path d="M14 6v12" stroke-dasharray="2 3"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.7"><circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.9 4.9l2.1 2.1m10 10 2.1 2.1m0-14.2-2.1 2.1m-10 10-2.1 2.1"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="#fca5a5" stroke-width="1.7"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 13h8l1-13"/></svg>',
};

const APPS = [
  { id: 'mail', label: 'Mail' },
  { id: 'files', label: 'Files' },
  { id: 'security', label: 'Security Center' },
  { id: 'browser', label: 'Browser' },
  { id: 'tickets', label: 'Tickets' },
  { id: 'settings', label: 'Settings' },
  { id: 'trash', label: 'Trash' },
];

class Desktop {
  constructor() {
    this.built = false;
    this.windows = {};
    this.activeApp = null;
    this.onAppOpen = null;   // (appId) => void — lets steps react to dock clicks
    this.onExit = null;      // () => void — "Exit Computer" button
  }

  get stage() { return document.getElementById('screen-stage'); }

  /** Shows the monitor stage for the given device. */
  show(deviceLabel) {
    if (!this.built) this._build();
    this.stage.classList.add('visible');
    if (deviceLabel) {
      this.deviceChip.textContent = deviceLabel;
    }
  }

  hide() {
    this.stage.classList.remove('visible');
    this.activeApp = null;
  }

  _build() {
    this.built = true;
    const frame = document.createElement('div');
    frame.className = 'nova-frame';
    frame.innerHTML = `
      <div class="nova-topbar">
        <span class="nova-logo">NOVA</span>
        <span class="nova-chip" id="nova-device">Workstation</span>
        <span class="nova-chip" id="nova-user">alice.chen</span>
        <span class="grow"></span>
        <span class="nova-chip" id="nova-status">Session active</span>
        <button class="header-btn" id="exit-computer" style="min-height:30px;padding:4px 10px;">Exit Computer</button>
      </div>
      <div class="nova-body">
        <nav class="nova-dock" aria-label="NOVA Desktop applications"></nav>
        <div class="nova-desktop" id="nova-desktop"></div>
      </div>`;
    this.stage.replaceChildren(frame);
    this.frame = frame;
    this.deviceChip = frame.querySelector('#nova-device');
    this.statusChip = frame.querySelector('#nova-status');
    this.desktopEl = frame.querySelector('#nova-desktop');
    this.dockEl = frame.querySelector('.nova-dock');

    for (const app of APPS) {
      const b = document.createElement('button');
      b.className = 'dock-btn';
      b.dataset.app = app.id;
      b.setAttribute('aria-label', app.label);
      b.innerHTML = ICONS[app.id] + `<span class="dock-tip">${app.label}</span>`;
      b.addEventListener('click', () => {
        this.openApp(app.id);
      });
      this.dockEl.appendChild(b);
    }
    frame.querySelector('#exit-computer').addEventListener('click', () => this.onExit?.());
  }

  registerWindow(name, el) {
    el.dataset.appWindow = name;
    this.desktopEl.appendChild(el);
    this.windows[name] = el;
  }

  window(name) { return this.windows[name]; }

  setDockEnabled(name, enabled) {
    const b = this.dockEl.querySelector(`[data-app="${name}"]`);
    if (b) b.disabled = !enabled;
  }

  openApp(name) {
    const el = this.windows[name];
    if (!el) return;
    for (const win of Object.values(this.windows)) win.classList.remove('visible');
    el.classList.add('visible');
    this.dockEl.querySelectorAll('.dock-btn').forEach((b) => b.classList.toggle('active', b.dataset.app === name));
    this.activeApp = name;
    this.onAppOpen?.(name);
  }

  closeApps() {
    for (const win of Object.values(this.windows)) win.classList.remove('visible');
    this.dockEl.querySelectorAll('.dock-btn').forEach((b) => b.classList.remove('active'));
    this.activeApp = null;
  }

  setStatus(text, kind = '') {
    this.statusChip.textContent = text;
    this.statusChip.style.color = kind === 'bad' ? '#f87171' : kind === 'clean' ? '#4ade80' : '';
  }

  /** Brief visual glitch (respects reduced-motion via CSS). */
  glitch() {
    this.frame.classList.add('screen-glitch');
    window.setTimeout(() => this.frame.classList.remove('screen-glitch'), 900);
  }
}

export const desktop = new Desktop();
export { ICONS };
