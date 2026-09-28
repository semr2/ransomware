/**
 * Reusable interaction system.
 *
 * InteractiveObjects are defined once as data —
 *   { id, label, description, badge?: { text, kind } }
 * — and this system renders them as an accessible button panel (works in both
 * 3D and 2D modes) plus a screen-space hover label used by the 3D view.
 * Keyboard: the panel buttons are real DOM buttons, so Tab / Shift+Tab /
 * Enter / Space all work natively.
 */

export class InteractionSystem {
  constructor(rootEl) {
    this.root = rootEl;
    this.catalog = [];
    this.activeIds = [];
    this.onActivate = null;
    this.panel = document.getElementById('objects-2d');
    this.labelEl = null;
    this._hoveredId = null;
  }

  /** Replaces the catalog of known objects (badges update if re-set). */
  setCatalog(items) {
    this.catalog = items || [];
    this._render();
  }

  /** Defines which catalog objects are currently interactive. */
  setActive(ids) {
    this.activeIds = ids || [];
    this._render();
  }

  updateBadge(id, badge) {
    const item = this.catalog.find((i) => i.id === id);
    if (item) {
      item.badge = badge;
      this._render();
    }
  }

  _render() {
    if (!this.panel) return;
    this.panel.replaceChildren();
    for (const item of this.catalog) {
      if (!this.activeIds.includes(item.id)) continue;
      const btn = document.createElement('button');
      btn.className = 'object-btn-2d';
      btn.dataset.objectId = item.id;
      btn.setAttribute('aria-label', `${item.label}. ${item.description || ''}`);
      const dot = document.createElement('span');
      dot.className = 'dot';
      dot.style.background = item.badge?.kind === 'bad' ? '#f87171'
        : item.badge?.kind === 'isolated' ? '#fbbf24'
        : item.badge?.kind === 'clean' ? '#4ade80'
        : '#2dd4bf';
      const wrap = document.createElement('span');
      const name = document.createElement('span');
      name.textContent = item.label;
      const sub = document.createElement('span');
      sub.className = 'sub';
      sub.textContent = item.badge ? item.badge.text : (item.description || '');
      wrap.append(name, sub);
      btn.append(dot, wrap);
      btn.addEventListener('click', () => this.activate(item.id));
      this.panel.appendChild(btn);
    }
  }

  activate(id) {
    if (this.activeIds.includes(id) && this.onActivate) this.onActivate(id);
  }

  /* ---- 3D screen-space hover label ---- */

  ensureLabel() {
    if (!this.labelEl) {
      this.labelEl = document.createElement('div');
      this.labelEl.className = 'obj-label';
      this.root.appendChild(this.labelEl);
    }
    return this.labelEl;
  }

  showHoverLabel(id) {
    const item = this.catalog.find((i) => i.id === id);
    if (!item) return;
    this._hoveredId = id;
    this._labelTarget = null; // position supplied per-frame by env3d
    const el = this.ensureLabel();
    el.textContent = item.label;
    el.style.display = 'block';
  }

  hideHoverLabel() {
    this._hoveredId = null;
    if (this.labelEl) this.labelEl.style.display = 'none';
  }

  get hoveredId() { return this._hoveredId; }

  positionLabel(x, y, keyHint) {
    if (!this.labelEl) return;
    this.labelEl.style.left = `${x}px`;
    this.labelEl.style.top = `${y}px`;
    this.labelEl.dataset.key = keyHint || '';
  }
}
