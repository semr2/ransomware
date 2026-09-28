/**
 * Fictional email client ("NOVA Mail"). Entirely local — no real mail system.
 * Supports inspection hotspots on phishing indicators and configurable
 * attachment actions.
 */
import { a11y } from '../js/accessibility.js';
import { audio } from '../js/audio.js';
import { toast } from './feedback.js';

export const PHISH_MAIL = {
  id: 'phish',
  from: 'IT Support',
  address: 'it-support@northstarr-security-training.test',
  subject: 'URGENT: Security Update Required',
  priority: 'HIGH',
  preview: 'Your workstation requires an immediate security update…',
  body: [
    'Alice,',
    'Your workstation requires an immediate security update.',
    'Failure to install this update within 15 minutes may result in account suspension.',
    'Please open the attached security update immediately.',
  ],
  attachment: { name: 'Security_Update.exe', size: '412 KB' },
};

const BENIGN = [
  {
    id: 'lunch', from: 'Priya Raman', address: 'priya.raman@northstar-training.test',
    subject: 'Team lunch Friday — sign up', preview: 'Same place as last time, add your name to the sheet…',
    body: ['Same place as last time — add your name to the sheet before Thursday so I can book the table.', '— Priya'],
  },
  {
    id: 'timesheet', from: 'NOVA Payroll', address: 'payroll@northstar-training.test',
    subject: 'Reminder: timesheet approval due today', preview: 'Managers, please approve pending timesheets…',
    body: ['Please approve any pending timesheets before 17:00 today.', 'This is an automated reminder from NOVA Payroll.'],
  },
];

/**
 * Hotspot definitions for the phishing email. `mark` wraps the matching
 * text in the reader; click → explanation popup.
 */
const HOTSPOTS = {
  sender: {
    match: (m) => m.address,
    tag: 'SENDER ADDRESS',
    text: 'This is not the company domain. The real Northstar domain is northstar-training.test — look closely at the spelling of this one.',
  },
  subject: {
    match: () => 'URGENT: Security Update Required',
    tag: 'SUBJECT LINE',
    text: 'All-caps urgency in the subject is a classic pressure tactic designed to make you act before you think.',
  },
  urgency: {
    match: () => 'Failure to install this update within 15 minutes may result in account suspension.',
    tag: 'URGENCY + THREAT',
    text: 'An artificial deadline plus a threat of account suspension. Real IT departments do not suspend accounts for waiting 15 minutes.',
  },
  greeting: {
    match: () => 'Alice,',
    tag: 'GENERIC GREETING',
    text: 'A bare first name with no department context. Pretexting callers often have only a name from a directory.',
  },
  attachment: {
    tag: 'ATTACHMENT',
    text: 'An unexpected executable (.exe) attachment. Software updates are installed by IT through managed tools — never emailed as .exe files.',
  },
};

class MailApp {
  constructor() {
    this.built = false;
    this.onHotspot = null; // (hotspotKey) => void — tracked by the scenario
  }

  build(desktopApi) {
    if (this.built) return;
    this.built = true;
    const win = document.createElement('div');
    win.className = 'nova-window';
    win.innerHTML = `
      <div class="win-title">NOVA Mail — Inbox <button class="win-close" aria-label="Close Mail">✕</button></div>
      <div class="win-content"><div class="mail-layout">
        <div class="mail-list" role="list" aria-label="Inbox messages"></div>
        <div class="mail-reader" aria-live="polite"></div>
      </div></div>`;
    win.querySelector('.win-close').addEventListener('click', () => win.classList.remove('visible'));
    desktopApi.registerWindow('mail', win);
    this.listEl = win.querySelector('.mail-list');
    this.readerEl = win.querySelector('.mail-reader');
    this.window = win;
  }

  /** Renders the inbox. If `newMail`, the phishing message arrives unread. */
  renderInbox({ withPhish = true } = {}) {
    this.listEl.replaceChildren();
    const mails = withPhish ? [PHISH_MAIL, ...BENIGN] : [...BENIGN];
    for (const m of mails) {
      const item = document.createElement('div');
      item.className = 'mail-item' + (m.id === 'phish' ? ' unread' : '');
      item.setAttribute('role', 'listitem');
      item.tabIndex = 0;
      item.innerHTML = `
        <div class="from"><span></span>${m.id === 'phish' ? '<span class="pri-high">HIGH PRIORITY</span>' : ''}</div>
        <div class="subj"></div>
        <div class="prev"></div>`;
      item.querySelector('.from span').textContent = m.from;
      item.querySelector('.subj').textContent = m.subject;
      item.querySelector('.prev').textContent = m.preview;
      const open = () => this.openMail(m, {});
      item.addEventListener('click', open);
      item.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
      this.listEl.appendChild(item);
    }
    this.readerEl.innerHTML =
      '<div class="app-placeholder"><div class="ph-ico">✉️</div>Select a message to read it.</div>';
  }

  /**
   * Opens a mail in the reader. Options:
   *  - hotspots: array of HOTSPOT keys to make interactive
   *  - attachmentActions: [{label, kind, onClick}]
   */
  openMail(m, { hotspots = [], attachmentActions = [], inspectMode = false } = {}) {
    this.readerEl.replaceChildren();
    const meta = document.createElement('div');
    meta.className = 'r-meta';
    meta.innerHTML = `
      <div class="r-subj"></div>
      <div class="r-from"></div>`;
    meta.querySelector('.r-subj').textContent = m.subject;
    const fromLine = document.createElement('div');
    fromLine.className = 'r-from';
    if (hotspots.includes('sender')) {
      fromLine.appendChild(this._hotspotSpan('sender', m.from));
      const addr = document.createElement('div');
      addr.appendChild(this._hotspotSpan('senderAddr', `<${m.address}>`));
      fromLine.appendChild(document.createTextNode(' '));
      fromLine.appendChild(addr.firstChild);
    } else {
      fromLine.textContent = `${m.from} <${m.address}>`;
    }
    meta.appendChild(fromLine);
    this.readerEl.appendChild(meta);

    const body = document.createElement('div');
    body.className = 'r-body';
    for (const para of m.body) {
      const p = document.createElement('p');
      const marked = hotspots.includes('urgency') && para.startsWith('Failure')
        ? this._hotspotSpan('urgency', para)
        : hotspots.includes('greeting') && para === 'Alice,'
          ? this._hotspotSpan('greeting', para)
          : document.createTextNode(para);
      p.appendChild(marked);
      body.appendChild(p);
    }
    this.readerEl.appendChild(body);

    if (m.attachment) {
      const card = document.createElement('div');
      card.className = 'attachment-card';
      card.innerHTML = `
        <div class="file-ico">EXE</div>
        <div><div class="file-name"></div><div class="file-size"></div></div>`;
      card.querySelector('.file-name').textContent = m.attachment.name;
      card.querySelector('.file-size').textContent = m.attachment.size;
      if (hotspots.includes('attachment')) {
        const tag = this._hotspotSpan('attachment', '⚠ inspect');
        card.appendChild(tag);
      }
      const actions = document.createElement('div');
      actions.style.marginLeft = 'auto';
      actions.style.display = 'flex';
      actions.style.gap = '8px';
      for (const a of attachmentActions) {
        const b = document.createElement('button');
        b.className = `btn ${a.kind || 'btn-secondary'}`;
        b.style.minHeight = '36px';
        b.style.padding = '7px 14px';
        b.style.fontSize = '12.5px';
        b.textContent = a.label;
        b.addEventListener('click', () => { audio.click(); a.onClick(); });
        actions.appendChild(b);
      }
      if (attachmentActions.length) card.appendChild(actions);
      this.readerEl.appendChild(card);
    }

    if (inspectMode) {
      toast('Click the highlighted indicators to inspect them.');
    }
  }

  _hotspotSpan(key, text) {
    const span = document.createElement('button');
    span.className = 'hotspot';
    span.style.background = 'none';
    span.style.border = 'none';
    span.style.padding = '0';
    span.style.cursor = 'pointer';
    span.style.borderBottom = '2px dashed rgba(13,148,136,.55)';
    span.style.font = 'inherit';
    span.style.color = 'inherit';
    span.textContent = typeof text === 'string' ? text : text.textContent;
    span.setAttribute('aria-label', `Inspect: ${span.textContent}`);
    span.addEventListener('click', (e) => {
      e.stopPropagation();
      this._showHotspotPopup(key, span);
      this.onHotspot?.(key === 'senderAddr' ? 'sender' : key);
    });
    return span;
  }

  _showHotspotPopup(key, anchor) {
    document.querySelectorAll('.hotspot-pop').forEach((p) => p.remove());
    const def = HOTSPOTS[key];
    if (!def) return;
    const pop = document.createElement('div');
    pop.className = 'hotspot-pop';
    pop.setAttribute('role', 'tooltip');
    pop.innerHTML = `<span class="hp-tag"></span><span class="hp-text"></span><button>Got it</button>`;
    pop.querySelector('.hp-tag').textContent = def.tag;
    pop.querySelector('.hp-text').textContent = def.text;
    pop.querySelector('button').addEventListener('click', () => pop.remove());
    const rect = anchor.getBoundingClientRect();
    const stage = this.window.closest('.nova-frame')?.getBoundingClientRect();
    if (stage) {
      pop.style.left = `${Math.max(8, Math.min(rect.left - stage.left - 20, stage.width - 320))}px`;
      pop.style.top = `${rect.bottom - stage.top + 8}px`;
    }
    anchor.classList.add('inspected');
    this.window.querySelector('.win-content').style.position = 'relative';
    this.window.querySelector('.win-content').appendChild(pop);
    a11y.announce(`${def.tag}. ${def.text}`);
    a11y.focus(pop.querySelector('button'));
  }
}

export const mailApp = new MailApp();
