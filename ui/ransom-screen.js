/**
 * Ransomware screen takeover — a purely visual, in-browser simulation.
 * Always labelled "SIMULATION"; never touches anything outside the frame.
 */
import { a11y } from '../js/accessibility.js';
import { audio } from '../js/audio.js';

class RansomScreen {
  constructor() { this.el = null; }

  build(desktopApi) {
    if (this.el) return;
    const el = document.createElement('div');
    el.className = 'ransom-screen';
    desktopApi.registerWindow('ransom', el);
    this.el = el;
  }

  /**
   * Shows the ransom note. `phase`:
   *  - 'reveal'   : attack just happened → SIMULATION banner + CONTINUE
   *  - 'decision' : ransom demand with PAY / NEGOTIATE / REFUSE
   */
  show({ phase = 'reveal', onContinue, onChoice } = {}) {
    this.el.classList.add('visible', 'ransom-flicker');
    audio.bad();
    const files = ['Finance_Q3.xlsx.locked', 'Customer_List.xlsx.locked', 'Project_Report.docx.locked', 'HR_Policies.pdf.locked'];
    this.el.innerHTML = `
      <div class="sim-banner">TRAINING SIMULATION — NO REAL FILES WERE MODIFIED</div>
      <h1>YOUR FILES ARE UNAVAILABLE</h1>
      <p class="r-sub">Files on this workstation have been encrypted.</p>
      <div class="r-note">
        <b>Ransom demand:</b> payment is requested in cryptocurrency within 48 hours.<br>
        “Do not contact law enforcement. Do not shut down the computer.<br>
        Do not tell your IT department. Payment is the only way to recover your files.”
      </div>
      <div class="r-files">${files.map((f) => `<span class="rf">${f}</span>`).join('')}</div>`;
    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:12px;margin-top:22px;flex-wrap:wrap;justify-content:center';

    if (phase === 'reveal') {
      const p = document.createElement('p');
      p.style.cssText = 'margin-top:18px;font-size:13px;color:#fda4af;max-width:520px';
      p.textContent = 'This is a training simulation. No real files have been modified.';
      this.el.appendChild(p);
      const b = this._btn('CONTINUE', 'btn-primary', onContinue);
      actions.appendChild(b);
      this.el.appendChild(actions);
      a11y.focus(b);
    } else {
      for (const c of [
        { label: 'PAY', kind: 'btn-danger' },
        { label: 'NEGOTIATE', kind: 'btn-secondary' },
        { label: 'REFUSE', kind: 'btn-primary' },
      ]) {
        actions.appendChild(this._btn(c.label, c.kind, () => onChoice?.(c.label.toLowerCase())));
      }
      this.el.appendChild(actions);
      a11y.focus(actions.lastChild);
    }
    a11y.announce('Ransom note displayed. This is a training simulation. Files are unavailable and a ransom payment is demanded in cryptocurrency.');
  }

  _btn(label, cls, fn) {
    const b = document.createElement('button');
    b.className = `btn ${cls}`;
    b.textContent = label;
    b.addEventListener('click', () => { audio.click(); fn?.(); });
    return b;
  }

  hide() {
    this.el?.classList.remove('visible', 'ransom-flicker');
  }
}

export const ransomScreen = new RansomScreen();
