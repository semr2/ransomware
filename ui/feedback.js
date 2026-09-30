/**
 * Overlay UI helpers: choice panels, decision feedback modals, toasts.
 * All overlays render into #overlay-root and are keyboard-accessible
 * (real buttons, focus moved to first control, Escape closes closable panels).
 */
import { a11y } from '../js/accessibility.js';
import { audio } from '../js/audio.js';

const overlayRoot = () => document.getElementById('overlay-root');

export function clearOverlays() {
  overlayRoot()?.replaceChildren();
  document.getElementById('interaction-root')?.replaceChildren();
}

/** Generic choice/info panel. Returns a close() function. */
export function panel({ title, body = '', choices = [], note = '', ariaLabel, className = '', collapsible = false }) {
  const root = overlayRoot();
  const interactionRoot = document.getElementById('interaction-root');
  const splitChoices = collapsible && choices.length > 0 && interactionRoot;
  const el = document.createElement('div');
  el.className = `ui-panel instruction-panel panel-fade-in ${collapsible ? 'compact-panel' : ''} ${className}`.trim();
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', String(!collapsible));
  if (ariaLabel) el.setAttribute('aria-label', ariaLabel);
  if (collapsible) {
    const toggle = document.createElement('button');
    toggle.className = 'instruction-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = `ⓘ ${title}`;
    toggle.addEventListener('click', () => {
      const expanded = el.classList.toggle('pinned');
      toggle.setAttribute('aria-expanded', String(expanded || el.classList.contains('hovered')));
    });
    const reveal = () => {
      el.classList.add('hovered');
      toggle.setAttribute('aria-expanded', 'true');
    };
    const conceal = () => {
      if (el.contains(document.activeElement) || el.matches(':hover')) return;
      el.classList.remove('hovered');
      toggle.setAttribute('aria-expanded', String(el.classList.contains('pinned')));
    };
    el.addEventListener('pointerenter', reveal);
    el.addEventListener('pointerleave', conceal);
    el.addEventListener('focusin', reveal);
    el.addEventListener('focusout', (event) => {
      if (!el.contains(event.relatedTarget)) conceal();
    });
    el.appendChild(toggle);
  } else {
    const h = document.createElement('h2');
    h.textContent = title;
    el.appendChild(h);
  }
  if (body) {
    const content = document.createElement('div');
    content.className = 'panel-body';
    content.innerHTML = body; // trusted, course-authored content only
    el.appendChild(content);
  }
  const stack = document.createElement('div');
  stack.className = 'choice-stack';
  let actionPanel = null;
  if (splitChoices) {
    actionPanel = document.createElement('section');
    actionPanel.className = 'ui-panel action-panel panel-fade-in';
    actionPanel.setAttribute('role', 'group');
    actionPanel.setAttribute('aria-label', 'Choose an action');
    const heading = document.createElement('h2');
    heading.textContent = 'Choose an action';
    actionPanel.appendChild(heading);
  }
  for (const c of choices) {
    const b = document.createElement('button');
    b.className = `btn ${c.kind || 'btn-secondary'}`;
    b.textContent = c.label;
    b.addEventListener('click', () => {
      audio.click();
      if (!c.keepOpen) close();
      c.onClick?.();
    });
    stack.appendChild(b);
  }
  if (choices.length) {
    if (splitChoices) actionPanel.appendChild(stack);
    else el.appendChild(stack);
  }
  if (note) {
    const n = document.createElement('p');
    n.className = 'small-note';
    n.textContent = note;
    el.appendChild(n);
  }
  root.appendChild(el);
  if (actionPanel) interactionRoot.appendChild(actionPanel);
  if (!collapsible) a11y.trapFocus(el);
  const first = el.querySelector('button');
  if (first) a11y.focus(first);
  a11y.announce(`${title}. ${typeof body === 'string' ? body.replace(/<[^>]+>/g, '') : ''}`);

  function close() { el.remove(); actionPanel?.remove(); }
  return close;
}

const VERDICTS = {
  good: { tag: 'GOOD DECISION', cls: 'good' },
  partial: { tag: 'PARTIALLY SAFE — SEE WHY', cls: 'partial' },
  warn: { tag: 'NOT THE SAFEST CHOICE', cls: 'warn' },
};

/**
 * Decision feedback modal. verdict: 'good' | 'partial' | 'warn'
 * Never blocks progress — always offers a continue button.
 */
export function feedback({ verdict = 'good', title, why, continueLabel = 'CONTINUE', onContinue }) {
  const v = VERDICTS[verdict] || VERDICTS.good;
  if (verdict === 'good') audio.good(); else audio.bad();
  const root = overlayRoot();
  const el = document.createElement('div');
  el.className = 'ui-panel feedback-modal panel-fade-in';
  el.setAttribute('role', 'alertdialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-label', `${v.tag}: ${title}`);
  el.innerHTML = `
    <span class="verdict ${v.cls}">${v.tag}</span>
    <h2></h2>
    ${why ? '<div class="why"></div>' : ''}`;
  el.querySelector('h2').textContent = title;
  if (why) el.querySelector('.why').innerHTML = why;
  const stack = document.createElement('div');
  stack.className = 'choice-stack';
  const btn = document.createElement('button');
  btn.className = 'btn btn-primary';
  btn.textContent = continueLabel;
  btn.addEventListener('click', () => { el.remove(); onContinue?.(); });
  stack.appendChild(btn);
  el.appendChild(stack);
  root.appendChild(el);
  a11y.trapFocus(el);
  a11y.focus(btn);
  a11y.announce(`${v.tag}. ${title}`);
  return () => el.remove();
}

export function toast(message, duration = 3200) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = message;
  t.classList.add('visible');
  clearTimeout(toast._timer);
  toast._timer = window.setTimeout(() => t.classList.remove('visible'), duration);
  a11y.announce(message);
}
