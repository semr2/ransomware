/**
 * "Northstar Security Operations Portal" — fictional internal ticketing
 * system for incident reporting. Scores the report on completeness.
 */
import { a11y } from '../js/accessibility.js';
import { audio } from '../js/audio.js';

const EVENTS = [
  'Received suspicious IT phone call',
  'Received urgent phishing email',
  'Opened suspicious attachment',
  'Security warning appeared',
  'Files became unavailable',
  'Network cable disconnected',
];

const REQUIRED = { type: 2, events: 3, narrative: 2, evidence: 3 }; // sums to 10

class Ticketing {
  constructor() { this.built = false; }

  build(desktopApi) {
    if (this.built) return;
    this.built = true;
    const win = document.createElement('div');
    win.className = 'nova-window';
    win.innerHTML = `
      <div class="win-title">
        Northstar Security Operations Portal
        <span class="portal-tag">INTERNAL · FICTIONAL</span>
        <button class="win-close" aria-label="Close portal">✕</button>
      </div>
      <div class="win-content">
        <div class="ticket-layout">
          <div class="ticket-head">
            <h3>Report a security incident</h3>
          </div>
          <form class="ticket-form" id="ticket-form">
            <label class="tf-label" for="tf-type">Incident type</label>
            <select id="tf-type">
              <option value="">— Select incident type —</option>
              <option>Phishing email</option>
              <option selected>Ransomware / Malware</option>
              <option>Lost device</option>
              <option>Physical security</option>
              <option>Other</option>
            </select>

            <label class="tf-label" for="tf-time">Approximate time</label>
            <select id="tf-time">
              <option value="">— Select time —</option>
              <option>Within the last 15 minutes</option>
              <option>Earlier today</option>
              <option>Yesterday</option>
            </select>

            <span class="tf-label">What happened? (check all that apply)</span>
            <div class="event-checks" id="tf-events"></div>

            <label class="tf-label" for="tf-what">Describe what happened and what you clicked</label>
            <textarea id="tf-what" placeholder="What did you click? What happened afterward?"></textarea>

            <label class="tf-label" for="tf-contain">Containment action taken</label>
            <select id="tf-contain">
              <option value="">— Select action —</option>
              <option>Disconnected the network cable</option>
              <option>Powered off the computer</option>
              <option>No action yet</option>
            </select>

            <span class="tf-label">Evidence</span>
            <div>
              <button type="button" class="btn btn-secondary" id="tf-attach" style="min-height:38px;font-size:13px">
                📎 ATTACH ORIGINAL EMAIL
              </button>
              <span class="evidence-chip" id="tf-evidence">✓ Original email attached as evidence — preserved, not deleted</span>
            </div>

            <div class="choice-stack" style="margin-top:18px">
              <button type="submit" class="btn btn-primary">SUBMIT INCIDENT REPORT</button>
            </div>
          </form>
        </div>
      </div>`;
    win.querySelector('.win-close').addEventListener('click', () => win.classList.remove('visible'));

    const eventsEl = win.querySelector('#tf-events');
    for (const ev of EVENTS) {
      const label = document.createElement('label');
      label.innerHTML = `<input type="checkbox" value="0"> <span></span>`;
      label.querySelector('span').textContent = ev;
      label.addEventListener('click', () => window.setTimeout(() =>
        label.classList.toggle('checked', label.querySelector('input').checked), 0));
      eventsEl.appendChild(label);
    }

    win.querySelector('#tf-attach').addEventListener('click', () => {
      audio.click();
      win.querySelector('#tf-evidence').classList.add('attached');
      win.querySelector('#tf-attach').disabled = true;
      a11y.announce('Original email attached as evidence.');
    });

    win.querySelector('#ticket-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const checked = [...eventsEl.querySelectorAll('input:checked')];
      const detail = {
        type: win.querySelector('#tf-type').value ? REQUIRED.type : 0,
        time: win.querySelector('#tf-time').value ? 1 : 0,
        events: Math.min(REQUIRED.events, checked.length),
        narrative: win.querySelector('#tf-what').value.trim().length >= 20 ? REQUIRED.narrative : 0,
        containment: win.querySelector('#tf-contain').value ? 1 : 0,
        evidence: win.querySelector('#tf-evidence').classList.contains('attached') ? REQUIRED.evidence : 0,
        checkedCount: checked.length,
        attachedEvidence: win.querySelector('#tf-evidence').classList.contains('attached'),
        narrativeOk: win.querySelector('#tf-what').value.trim().length >= 20,
        eventKeys: checked.map((c) => c.parentElement.querySelector('span').textContent),
      };
      detail.score = detail.type + detail.events + detail.narrative + detail.evidence;
      audio.click();
      this.onSubmit?.(detail);
    });

    desktopApi.registerWindow('tickets', win);
    this.win = win;
  }

  /** Prefills containment + events to reflect what the learner actually did. */
  reflectState({ networkIsolated, poweredOff }) {
    if (!this.win) return;
    const contain = this.win.querySelector('#tf-contain');
    if (networkIsolated) contain.options[1].selected = true;
    else if (poweredOff) contain.options[2].selected = true;
  }
}

export const ticketing = new Ticketing();
