/**
 * Scenario engine. Loads step definitions, manages lifecycle (enter →
 * interactions → complete), routes decisions into state + SCORM, updates
 * the persistent header, and runs the idle-hint system.
 * Steps are data + hooks, not hard-coded into the page — new scenarios
 * can be added by dropping a module into scenarios/.
 */
import { state } from './course-state.js';
import { scorm } from './scorm.js';
import { a11y } from './accessibility.js';
import { audio } from './audio.js';
import { InteractionSystem } from './interactions.js';
import { clearOverlays, panel, feedback, toast } from '../ui/feedback.js';
import { desktop } from '../ui/desktop.js';
import { mailApp } from '../ui/email.js';
import { fileManager } from '../ui/file-manager.js';
import { ransomScreen } from '../ui/ransom-screen.js';
import { loginScreen } from '../ui/login.js';
import { ticketing } from '../ui/ticketing.js';

import * as steps from '../scenarios/index.js';

const HINT_DELAY_MS = 35000;

class ScenarioEngine {
  constructor() {
    this.steps = steps.STEPS;
    this.env = null;              // set by main.js after env init
    this.sys = new InteractionSystem(document.getElementById('app'));
    this.currentStep = 0;
    this._hintTimer = null;
    this._hintText = '';
    this.busy = false;
  }

  /** Context handed to every step's enter(). */
  ctx() {
    return {
      engine: this,
      state, scorm, a11y, audio,
      env: this.env,
      desktop, mailApp, fileManager, ransomScreen, loginScreen, ticketing,
      panel, feedback, toast,
      sys: this.sys,
    };
  }

  start(atStep = 0) {
    this.goto(atStep, { force: true });
  }

  goto(index, { force = false } = {}) {
    if (this.busy && !force) return;
    if (index < 0 || index >= this.steps.length) return;
    this.currentStep = index;
    this.busy = false;
    this.enter();
  }

  enter() {
    const step = this.steps[this.currentStep];
    clearOverlays();
    this._hideHint();
    this.sys.setActive([]);
    this.updateHeader();
    state.currentStep = this.currentStep;
    state.save();
    step.enter(this.ctx());
    a11y.announce(`Step ${this.currentStep} of ${this.steps.length - 1}. ${step.objective}`);
  }

  updateHeader() {
    const step = this.steps[this.currentStep];
    const el = (id) => document.getElementById(id);
    const isFirst = this.currentStep === 0;
    el('step-indicator').textContent = isFirst
      ? 'Introduction'
      : `Step ${this.currentStep} of ${this.steps.length - 1}`;
    el('step-objective').innerHTML = `<b>Objective:</b> `;
    el('step-objective').append(step.objective);
    const pct = Math.round((this.currentStep / (this.steps.length - 1)) * 100);
    el('progress-fill').style.width = `${pct}%`;
    this._hintText = step.hint || '';
    this._resetHintTimer();
  }

  complete() {
    state.markComplete(this.currentStep);
    state.save();
    this.goto(this.currentStep + 1);
  }

  /**
   * Records a scored decision (first attempt only), reports it to SCORM,
   * and shows feedback. verdict: 'good' | 'partial' | 'warn'.
   */
  decision({ id, choice, earned = 0, max = 0, result = 'neutral', verdict = 'good',
             title, why, response, onContinue, continueLabel }) {
    state.recordDecision(id, choice, earned, max);
    scorm.recordInteraction(id, response ?? choice, result);
    feedback({ verdict, title, why, onContinue, continueLabel });
  }

  /** Non-scored interaction tracking (inspections, navigation choices). */
  track(id, response, result = 'neutral') {
    state.trackInteraction(id);
    scorm.recordInteraction(id, response ?? 'viewed', result);
  }

  /* ---- hint system ---- */

  _resetHintTimer() {
    clearTimeout(this._hintTimer);
    const arm = () => {
      this._hintTimer = window.setTimeout(() => this._showHint(false), HINT_DELAY_MS);
    };
    clearTimeout(this._hintArm);
    this._hintArm = window.setTimeout(arm, 4000);
    window.removeEventListener('pointerdown', this._onActivity);
    window.removeEventListener('keydown', this._onActivity);
    this._onActivity = () => this._resetHintTimer();
    window.addEventListener('pointerdown', this._onActivity);
    window.addEventListener('keydown', this._onActivity);
  }

  requestHint() { this._showHint(true); }

  _showHint(manual) {
    if (!this._hintText) return;
    const chip = document.getElementById('hint-chip');
    chip.innerHTML = `<span class="hint-tag">HINT</span>`;
    chip.append(this._hintText);
    chip.classList.add('visible');
    if (manual) a11y.announce(`Hint. ${this._hintText}`);
  }

  _hideHint() {
    document.getElementById('hint-chip')?.classList.remove('visible');
  }
}

export const engine = new ScenarioEngine();
