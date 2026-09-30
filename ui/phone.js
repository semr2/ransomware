/**
 * Phone overlays: incoming call, live call conversation, voicemail.
 * Every spoken line is text (captions are inherent); audio is decorative.
 */
import { a11y } from '../js/accessibility.js';
import { audio } from '../js/audio.js';

const layer = () => document.getElementById('phone-layer');

function buildPhone() {
  const device = document.createElement('div');
  device.className = 'phone-device';
  device.innerHTML = `
    <div class="phone-speaker"></div>
    <div class="phone-screen" role="dialog" aria-label="Mobile phone screen">
      <div class="caller-id"></div>
      <div class="caller-name"></div>
      <div class="call-status"></div>
      <div class="incoming-call-alert" hidden aria-hidden="true"><span class="ring-icon">☎</span><span>RINGING</span></div>
      <div class="call-script" aria-live="polite"></div>
      <div class="phone-actions"></div>
    </div>`;
  return device;
}

/** Incoming call with ANSWER / IGNORE. */
export function incomingCall({ onAnswer, onIgnore }) {
  const host = layer();
  host.replaceChildren();
  host.classList.add('incoming-call-layer');
  const widget = document.createElement('section');
  widget.className = 'incoming-call-widget';
  widget.setAttribute('aria-label', 'Incoming call instructions');
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'incoming-call-toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.innerHTML = '<span class="ring-icon" aria-hidden="true">☎</span><span>PHONE RINGING · UNKNOWN CALLER</span><span class="toggle-caret" aria-hidden="true">⌄</span>';
  const details = document.createElement('div');
  details.className = 'incoming-call-details';
  const instruction = document.createElement('p');
  instruction.textContent = 'Alice’s mobile phone is ringing on the desk. Slide to answer, or let the call go to voicemail.';
  const sliderWrap = document.createElement('div');
  sliderWrap.className = 'answer-slider-wrap';
  const sliderLabel = document.createElement('label');
  sliderLabel.className = 'answer-slider-label';
  sliderLabel.htmlFor = 'desk-phone-answer-slider';
  sliderLabel.textContent = 'SLIDE TO ANSWER';
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.id = 'desk-phone-answer-slider';
  slider.className = 'phone-answer-slider';
  slider.min = '0';
  slider.max = '100';
  slider.value = '0';
  slider.setAttribute('aria-label', 'Slide to answer the incoming call');
  slider.setAttribute('aria-valuetext', 'Not answered');
  const sliderHint = document.createElement('span');
  sliderHint.className = 'answer-slider-hint';
  sliderHint.textContent = 'Drag to the end, or use the arrow keys';
  slider.addEventListener('input', () => {
    const progress = Number(slider.value);
    slider.style.setProperty('--slide-progress', `${progress}%`);
    slider.setAttribute('aria-valuetext', progress >= 90 ? 'Answering call' : `${progress}%`);
    sliderHint.textContent = progress >= 70 ? 'Keep sliding to answer' : 'Drag to the end, or use the arrow keys';
    if (progress >= 90) {
      audio.click();
      answer();
    }
  });
  sliderWrap.append(sliderLabel, slider, sliderHint);
  const actions = document.createElement('div');
  actions.className = 'phone-actions';
  details.append(instruction, sliderWrap, actions);
  let answered = false;
  const answer = () => {
    if (answered) return;
    answered = true;
    onAnswer();
  };
  const mk = (label, cls, fn) => {
    const b = document.createElement('button');
    b.className = `btn ${cls}`;
    b.textContent = label;
    b.addEventListener('click', () => { audio.click(); fn(); });
    actions.appendChild(b);
  };
  mk('LET IT GO TO VOICEMAIL', 'btn-secondary', onIgnore);
  toggle.addEventListener('click', () => {
    const pinned = widget.classList.toggle('pinned');
    toggle.setAttribute('aria-expanded', String(pinned || widget.classList.contains('hovered')));
  });
  const reveal = () => {
    widget.classList.add('hovered');
    toggle.setAttribute('aria-expanded', 'true');
  };
  const conceal = () => {
    if (widget.contains(document.activeElement) || widget.matches(':hover')) return;
    widget.classList.remove('hovered');
    toggle.setAttribute('aria-expanded', String(widget.classList.contains('pinned')));
  };
  widget.addEventListener('pointerenter', reveal);
  widget.addEventListener('pointerleave', conceal);
  widget.addEventListener('focusin', reveal);
  widget.addEventListener('focusout', conceal);
  widget.append(toggle, details);
  host.appendChild(widget);
  host.classList.add('visible');
  a11y.announce('Alice’s mobile phone on the desk is ringing. Open the phone prompt, then slide to answer or let the call go to voicemail.');
  a11y.focus(toggle);

  return () => { host.classList.remove('visible'); host.replaceChildren(); };
}

/** Opens the call controls and focuses the slide interaction when the desk phone is activated. */
export function focusIncomingSlider() {
  const widget = layer()?.querySelector('.incoming-call-widget');
  const toggle = widget?.querySelector('.incoming-call-toggle');
  const slider = widget?.querySelector('.phone-answer-slider');
  if (!widget || !toggle || !slider) return;
  widget.classList.add('pinned');
  toggle.setAttribute('aria-expanded', 'true');
  a11y.focus(slider);
}

/** Live call: script lines appear first, then choices. */
export function callConversation({ lines, choices, statusText = 'Connected — 0:12' }) {
  const host = layer();
  host.replaceChildren();
  host.classList.remove('incoming-call-layer');
  const device = buildPhone();
  device.querySelector('.caller-id').textContent = 'UNKNOWN CALLER';
  device.querySelector('.caller-name').textContent = '“IT Support”';
  device.querySelector('.call-status').textContent = statusText;
  const script = device.querySelector('.call-script');
  const actions = device.querySelector('.phone-actions');
  actions.replaceChildren();

  const revealNext = (i) => {
    if (i < lines.length) {
      const div = document.createElement('p');
      div.className = 'caller-line';
      div.innerHTML = `<b>Caller:</b> `;
      const span = document.createElement('span');
      span.textContent = lines[i];
      div.appendChild(span);
      script.appendChild(div);
      a11y.caption(`Caller: ${lines[i]}`);
      a11y.announce(lines[i]);
      const delay = a11y.reducedMotion() ? 350 : Math.min(4200, 1400 + lines[i].length * 34);
      window.setTimeout(() => revealNext(i + 1), delay);
    } else {
      for (const c of choices) {
        const b = document.createElement('button');
        b.className = `btn ${c.kind || 'btn-secondary'}`;
        b.textContent = c.label;
        b.addEventListener('click', () => { audio.click(); b.dispatchEvent(new Event('done')); c.onClick?.(); });
        actions.appendChild(b);
      }
      a11y.focus(actions.querySelector('button'));
      a11y.announce('Choose how Alice responds.');
    }
  };
  revealNext(0);
  host.appendChild(device);
  host.classList.add('visible');
}

/** Voicemail variant after ignoring the call. */
export function voicemail({ lines, onContinue }) {
  const host = layer();
  host.replaceChildren();
  host.classList.remove('incoming-call-layer');
  const device = buildPhone();
  device.querySelector('.caller-id').textContent = 'VOICEMAIL · 0:31';
  device.querySelector('.caller-name').textContent = 'Unknown';
  device.querySelector('.call-status').textContent = 'New voicemail';
  const script = device.querySelector('.call-script');
  script.innerHTML = `<span class="voicemail-badge">▶ Voicemail transcript</span>`;
  for (const line of lines) {
    const p = document.createElement('p');
    p.textContent = line;
    p.style.marginTop = '8px';
    script.appendChild(p);
  }
  const actions = device.querySelector('.phone-actions');
  const b = document.createElement('button');
  b.className = 'btn btn-primary';
  b.textContent = 'CONTINUE';
  b.addEventListener('click', () => { audio.click(); onContinue(); });
  actions.appendChild(b);
  host.appendChild(device);
  host.classList.add('visible');
  a11y.focus(b);
}

export function hidePhone() {
  const host = layer();
  host.classList.remove('visible');
  host.classList.remove('incoming-call-layer');
  host.replaceChildren();
}
