/**
 * Bootstrap: DOM shell wiring, environment selection (3D with 2D fallback),
 * desktop/app construction, resume flow, header controls and global error
 * handling. Everything else is driven by the scenario engine.
 */
import { scorm } from './scorm.js';
import { state } from './course-state.js';
import { a11y } from './accessibility.js';
import { engine } from './scenario-engine.js';
import { Env3D } from '../scenes/office.js';
import { Env2D } from '../scenes/env2d.js';
import { desktop } from '../ui/desktop.js';
import { mailApp } from '../ui/email.js';
import { fileManager } from '../ui/file-manager.js';
import { ransomScreen } from '../ui/ransom-screen.js';
import { loginScreen } from '../ui/login.js';
import { ticketing } from '../ui/ticketing.js';
import { panel } from '../ui/feedback.js';

const $ = (id) => document.getElementById(id);

/* ---- environment (3D preferred, 2D fallback — same course either way) ---- */

let env = null;

function makeEnv() {
  if (a11y.is2d()) return new Env2D(engine.sys).init();
  try {
    return new Env3D($('scene-canvas'), engine.sys).init();
  } catch (err) {
    console.warn('[env] 3D unavailable, switching to accessible 2D mode:', err);
    a11y.setPref('mode2d', true, { userOverride: false });
    return new Env2D(engine.sys).init();
  }
}

/** Re-applies durable visual state after an environment switch or a resume. */
function applyDeviceState() {
  const ws = state.devices.workstation;
  env.setObjectState('cable', ws === 'isolated' ? 'unplugged' : 'plugged');
  env.setObjectState('workstation',
    ws === 'powered_off' ? 'off' : ws === 'clean' ? 'desktop' : ws);
  if (state.currentStep >= 9) env.setObjectState('cleanpc', 'clean');
  engine.sys.updateBadge('monitor', ws === 'compromised' ? { text: 'COMPROMISED', kind: 'bad' }
    : ws === 'isolated' ? { text: 'ISOLATED', kind: 'isolated' }
    : ws === 'powered_off' ? { text: 'POWERED OFF', kind: 'isolated' }
    : { text: 'Workstation', kind: '' });
  engine.sys.updateBadge('cable', ws === 'isolated' ? { text: 'DISCONNECTED', kind: 'isolated' } : { text: '', kind: '' });
}

/* ---- accessibility panel wiring ---- */

function wireA11yPanel() {
  const panelEl = $('a11y-panel');
  const btn = $('btn-a11y');
  const sync = () => {
    $('opt-captions').checked = a11y.captionsOn();
    $('opt-sound').checked = !a11y.muted();
    $('opt-motion').checked = a11y.reducedMotion();
    $('opt-focus').checked = a11y.prefs.highVisibilityFocus;
    $('opt-2d').checked = a11y.is2d();
  };
  btn.addEventListener('click', () => { panelEl.classList.toggle('open'); sync(); });
  panelEl.addEventListener('keydown', (e) => { if (e.key === 'Escape') panelEl.classList.remove('open'); });

  $('opt-captions').addEventListener('change', (e) => a11y.setPref('captions', e.target.checked));
  $('opt-sound').addEventListener('change', (e) => a11y.setPref('muted', !e.target.checked));
  $('opt-motion').addEventListener('change', (e) => a11y.setPref('reducedMotion', e.target.checked));
  $('opt-focus').addEventListener('change', (e) => a11y.setPref('highVisibilityFocus', e.target.checked));
  $('opt-2d').addEventListener('change', (e) => a11y.setPref('mode2d', e.target.checked));
  sync();
}

/* ---- global error surface (course must not hard-crash) ---- */

function wireErrorHandling() {
  const show = (msg) => {
    const t = $('error-toast');
    t.textContent = `Something went wrong, but your progress is saved. (${msg})`;
    t.classList.add('visible');
    window.setTimeout(() => t.classList.remove('visible'), 6000);
  };
  window.addEventListener('error', (e) => show(e.message || 'unexpected error'));
  window.addEventListener('unhandledrejection', (e) =>
    show((e.reason && e.reason.message) || 'unexpected error'));
}

/* ---- loading screen ---- */

function runLoading(done) {
  const fill = $('load-bar-fill');
  const status = $('load-status');
  const stepsShown = [
    [12, 'Initializing SCORM\u2026'],
    [38, 'Preparing environment\u2026'],
    [64, 'Loading workstation\u2026'],
    [86, 'Building NOVA desktop\u2026'],
    [100, 'Simulation ready'],
  ];
  let i = 0;
  const tick = () => {
    if (i >= stepsShown.length) {
      window.setTimeout(() => {
        $('loading-screen').classList.add('hidden');
        done();
      }, a11y.reducedMotion() ? 80 : 420);
      return;
    }
    const [pct, text] = stepsShown[i++];
    fill.style.width = `${pct}%`;
    status.textContent = text;
    window.setTimeout(tick, a11y.reducedMotion() ? 60 : 240);
  };
  tick();
}

/* ---- boot ---- */

function boot() {
  a11y.init();
  scorm.init();
  $('scorm-mode').textContent = `SCORM MODE: ${scorm.mode}`;
  const resumed = state.loadResumable();

  env = makeEnv();
  engine.env = env;
  a11y._onChange = (want2d) => {
    env.dispose();
    env = makeEnv();
    engine.env = env;
    applyDeviceState();
    engine.enter(); // re-run the current step so its UI lands in the new mode
  };

  // Desktop + app windows are built once, hidden until a step shows them.
  desktop.show('Alice\u2019s Workstation');
  desktop.hide();
  mailApp.build(desktop);
  fileManager.build(desktop);
  ransomScreen.build(desktop);
  loginScreen.build(desktop);
  ticketing.build(desktop);
  desktop.onExit = () => { desktop.hide(); env.setView('office'); };

  engine.sys.setCatalog([
    { id: 'monitor', label: 'Workstation', description: 'Alice\u2019s primary workstation computer.' },
    { id: 'phone', label: 'Mobile Phone', description: 'Alice\u2019s mobile phone on the desk.' },
    { id: 'cable', label: 'Network Cable', description: 'Ethernet cable linking the workstation to the office network.' },
    { id: 'power_button', label: 'Power Button', description: 'Power control on the workstation dock.' },
    { id: 'cleanpc', label: 'Clean Laptop', description: 'A known-clean laptop at the spare desk.' },
  ]);

  $('btn-hint').addEventListener('click', () => engine.requestHint());
  wireA11yPanel();
  wireErrorHandling();
  applyDeviceState();

  runLoading(() => {
    const canResume = resumed && state.currentStep > 0 && state.finalScore === null;
    if (!canResume) {
      engine.start(0);
      return;
    }
    panel({
      title: 'Welcome back',
      body: `<p>You left the simulation at <b style="color:#fff">Step ${state.currentStep} of 14</b>.
             Your decisions and score so far were saved.</p>`,
      choices: [
        { label: `RESUME AT STEP ${state.currentStep}`, kind: 'btn-primary', onClick: () => engine.start(state.currentStep) },
        { label: 'START OVER', kind: 'btn-secondary', onClick: () => { state.reset(); engine.start(0); } },
      ],
      ariaLabel: 'Welcome back. Resume where you left off, or start over.',
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
