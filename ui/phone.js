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
  const device = buildPhone();
  device.classList.add('ringing');
  device.querySelector('.caller-id').textContent = 'UNKNOWN CALLER';
  device.querySelector('.caller-name').textContent = 'Unknown';
  device.querySelector('.call-status').textContent = 'Incoming call…';
  device.querySelector('.incoming-call-alert').hidden = false;
  device.querySelector('.call-script').textContent =
    'Your mobile is ringing. The number is not recognized.';
  const actions = device.querySelector('.phone-actions');
  let answered = false;
  const answer = () => {
    if (answered) return;
    answered = true;
    onAnswer();
  };

  const slideWrap = document.createElement('div');
  slideWrap.className = 'answer-slider-wrap';
  const slideLabel = document.createElement('label');
  slideLabel.className = 'answer-slider-label';
  slideLabel.htmlFor = 'phone-answer-slider';
  slideLabel.textContent = 'SLIDE TO ANSWER';
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.id = 'phone-answer-slider';
  slider.className = 'phone-answer-slider';
  slider.min = '0';
  slider.max = '100';
  slider.value = '0';
  slider.setAttribute('aria-label', 'Slide to answer the incoming call');
  slider.setAttribute('aria-valuetext', 'Not answered');
  const slideHint = document.createElement('span');
  slideHint.className = 'answer-slider-hint';
  slideHint.textContent = 'Drag to the end, or use the arrow keys';
  slider.addEventListener('input', () => {
    const progress = Number(slider.value);
    slider.style.setProperty('--slide-progress', `${progress}%`);
    slider.setAttribute('aria-valuetext', progress >= 90 ? 'Answering call' : `${progress}%`);
    slideHint.textContent = progress >= 70 ? 'Keep sliding to answer' : 'Drag to the end, or use the arrow keys';
    if (progress >= 90) {
      audio.click();
      answer();
    }
  });
  slideWrap.append(slideLabel, slider, slideHint);
  device.querySelector('.phone-screen').insertBefore(slideWrap, actions);

  const mk = (label, cls, fn) => {
    const b = document.createElement('button');
    b.className = `btn ${cls}`;
    b.textContent = label;
    b.addEventListener('click', () => { audio.click(); fn(); });
    actions.appendChild(b);
  };
  mk('ANSWER', 'btn-primary', answer);
  mk('IGNORE', 'btn-secondary', onIgnore);
  host.appendChild(device);
  host.classList.add('visible');
  a11y.announce('Incoming call from unknown caller. Slide to answer, or choose the Answer or Ignore button.');
  a11y.focus(slider);

  return () => { host.classList.remove('visible'); host.replaceChildren(); };
}

/** Live call: script lines appear first, then choices. */
export function callConversation({ lines, choices, statusText = 'Connected — 0:12' }) {
  const host = layer();
  host.replaceChildren();
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
  host.replaceChildren();
}
