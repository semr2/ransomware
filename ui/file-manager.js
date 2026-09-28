/**
 * Fictional file manager + security warning + (simulated, safe) encryption
 * visualization. Filenames are fictional; no real file is ever touched —
 * this is pure DOM animation inside the training screen.
 */
import { a11y } from '../js/accessibility.js';
import { audio } from '../js/audio.js';

const DOCUMENTS = [
  { name: 'Finance_Q3.xlsx', kind: 'Spreadsheet' },
  { name: 'Customer_List.xlsx', kind: 'Spreadsheet' },
  { name: 'Project_Report.docx', kind: 'Document' },
  { name: 'HR_Policies.pdf', kind: 'PDF' },
];
const DOWNLOADS = [
  { name: 'Security_Update.exe', kind: 'Executable', danger: true },
];

class FileManager {
  constructor() { this.built = false; }

  build(desktopApi) {
    if (this.built) return;
    this.built = true;
    const win = document.createElement('div');
    win.className = 'nova-window';
    win.innerHTML = `
      <div class="win-title">NOVA Files <button class="win-close" aria-label="Close Files">✕</button></div>
      <div class="win-content"><div class="fm-layout">
        <div class="fm-side">
          <button data-folder="documents">📁 Documents</button>
          <button data-folder="downloads">⬇️ Downloads</button>
        </div>
        <div class="fm-grid" aria-label="Files"></div>
      </div></div>`;
    win.querySelector('.win-close').addEventListener('click', () => win.classList.remove('visible'));
    for (const b of win.querySelectorAll('.fm-side button')) {
      b.addEventListener('click', () => this.renderFolder(b.dataset.folder));
    }
    desktopApi.registerWindow('files', win);
    this.win = win;
    this.gridEl = win.querySelector('.fm-grid');
  }

  renderFolder(folder) {
    this.win.querySelectorAll('.fm-side button').forEach((b) =>
      b.classList.toggle('active', b.dataset.folder === folder));
    const files = folder === 'downloads' ? DOWNLOADS : DOCUMENTS;
    this.gridEl.replaceChildren();
    for (const f of files) {
      const card = document.createElement('div');
      card.className = 'fm-file';
      if (f.danger) card.style.borderColor = '#fca5a5';
      card.innerHTML = `<div class="fm-name"></div><div class="fm-kind"></div>`;
      card.querySelector('.fm-name').textContent = f.name;
      card.querySelector('.fm-kind').textContent = f.kind;
      if (f.danger) card.tabIndex = 0;
      this.gridEl.appendChild(card);
      if (f.danger) {
        const activate = () => this.onDangerousFile?.(f);
        card.addEventListener('click', activate);
        card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
      }
    }
  }

  /**
   * Simulated security warning. Nothing is executed — the "file" is fiction.
   */
  showWarning({ onDismiss, onDelete, onReport }) {
    document.querySelectorAll('.warn-overlay').forEach((w) => w.remove());
    const overlay = document.createElement('div');
    overlay.className = 'warn-overlay';
    overlay.innerHTML = `
      <div class="warn-card" role="alertdialog" aria-label="Security warning">
        <div class="w-head">
          <div class="w-icon">⚠</div>
          <h3>SECURITY WARNING</h3>
        </div>
        <div class="w-body">
          This file has been identified as potentially malicious.
          <div class="threat">Threat detected: Suspicious executable behavior<br>File: Security_Update.exe</div>
          Recommended action: <b>Do not open this file.</b>
          <p class="w-recommend">Never override a security warning because someone told you the file is legitimate.</p>
        </div>
        <div class="w-actions"></div>
      </div>`;
    const actions = overlay.querySelector('.w-actions');
    const mk = (label, cls, fn) => {
      const b = document.createElement('button');
      b.className = `btn ${cls}`;
      b.textContent = label;
      b.addEventListener('click', () => { audio.alert(); overlay.remove(); fn(); });
      actions.appendChild(b);
    };
    mk('DISMISS', 'btn-danger', onDismiss);
    mk('DELETE', 'btn-secondary', onDelete);
    mk('REPORT', 'btn-primary', onReport);
    this.win.querySelector('.win-content').style.position = 'relative';
    this.win.querySelector('.win-content').appendChild(overlay);
    audio.alert();
    a11y.announce('Security warning. This file has been identified as potentially malicious. Recommended action: do not open this file.');
    a11y.focus(actions.children[0]);
  }

  /**
   * Safe ransomware visualization: fictional files change state with a
   * "processing" pass, then show as .locked. Pure DOM animation.
   */
  runEncryption({ onProgress, onDone } = {}) {
    this.renderFolder('documents');
    const cards = [...this.gridEl.querySelectorAll('.fm-file')];
    cards.forEach((c, i) => {
      const prog = document.createElement('div');
      prog.className = 'prog';
      prog.innerHTML = '<div></div>';
      prog.setAttribute('role', 'progressbar');
      c.appendChild(prog);
      const bar = prog.firstChild;
      const dur = a11y.reducedMotion() ? 200 : 900;
      bar.style.transition = `width ${dur}ms linear`;
      window.setTimeout(() => { bar.style.width = '100%'; }, 60 + i * (dur / 2));
    });

    let lockedCount = 0;
    const lockNext = (i) => {
      if (i >= cards.length) {
        onDone?.();
        return;
      }
      const c = cards[i];
      c.querySelector('.prog')?.remove();
      c.classList.add('locked');
      const name = c.querySelector('.fm-name');
      const base = name.textContent.replace('.locked', '');
      name.textContent = `${base}.locked`;
      const tag = document.createElement('span');
      tag.className = 'lock-tag';
      tag.textContent = 'LOCKED';
      c.appendChild(tag);
      lockedCount++;
      onProgress?.(lockedCount, cards.length);
      audio.bad();
      window.setTimeout(() => lockNext(i + 1), a11y.reducedMotion() ? 120 : 650);
    };
    window.setTimeout(() => lockNext(0), a11y.reducedMotion() ? 400 : 1500);
    a11y.announce('Warning: files on this workstation are being modified. This is a simulation — no real files are affected.');
  }

  markAllLocked() {
    this.renderFolder('documents');
    for (const c of this.gridEl.querySelectorAll('.fm-file')) {
      c.classList.add('locked');
      const name = c.querySelector('.fm-name');
      name.textContent = `${name.textContent.replace('.locked', '')}.locked`;
      const tag = document.createElement('span');
      tag.className = 'lock-tag';
      tag.textContent = 'LOCKED';
      c.appendChild(tag);
    }
  }
}

export const fileManager = new FileManager();
