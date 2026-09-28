/**
 * Course state manager. Holds all durable learning state (step, decisions,
 * score, quiz) and serializes to SCORM suspend_data for resume.
 * Completely independent from any rendering engine.
 */
import { scorm } from './scorm.js';

const VERSION = 1;
const LOCAL_KEY = 'nova_course_state';

export class CourseState {
  constructor() {
    this.version = VERSION;
    this.currentStep = 0;
    this.completedSteps = [];
    this.choices = {};        // decisionId -> choice key (first attempt)
    this.points = {};         // decisionId -> earned points (first attempt)
    this.maxPoints = {};      // decisionId -> max possible points
    this.interactionsSeen = {};
    this.quizAnswers = {};    // questionIndex -> 'A'|'B'|'C'|'D'
    this.quizScore = 0;       // percent 0-100
    this.devices = {
      workstation: 'clean',   // clean | compromised | isolated | powered_off
      cleanPc: 'available',
    };
    this.reporting = { submitted: false, attachedEvidence: false };
    this.finalScore = null;
    this.passed = null;
  }

  markComplete(step) {
    if (!this.completedSteps.includes(step)) this.completedSteps.push(step);
    this.currentStep = step;
  }

  /** Records the FIRST attempt of a decision — later retries don't change the score. */
  recordDecision(id, choice, earned, max) {
    if (this.choices[id] === undefined) {
      this.choices[id] = choice;
      this.points[id] = earned || 0;
      this.maxPoints[id] = max === undefined ? 0 : max;
    }
    this.save();
  }

  /** Non-scored tracking (inspections, navigation). */
  trackInteraction(id) {
    this.interactionsSeen[id] = (this.interactionsSeen[id] || 0) + 1;
    this.save();
  }

  scenarioEarned() {
    let earned = 0, max = 0;
    for (const id of Object.keys(this.maxPoints)) {
      earned += this.points[id] || 0;
      max += this.maxPoints[id];
    }
    return { earned, max };
  }

  serialize() {
    const o = {
      v: this.version,
      s: this.currentStep,
      c: this.completedSteps,
      d: this.choices,
      p: this.points,
      m: this.maxPoints,
      i: Object.keys(this.interactionsSeen),
      q: this.quizAnswers,
      qs: this.quizScore,
      dv: this.devices,
      r: this.reporting,
      fs: this.finalScore,
      ps: this.passed,
    };
    return JSON.stringify(o);
  }

  static deserialize(raw) {
    if (!raw) return null;
    try {
      const o = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (!o || o.v !== VERSION || typeof o.s !== 'number') return null;
      const st = new CourseState();
      st.currentStep = o.s;
      st.completedSteps = Array.isArray(o.c) ? o.c : [];
      st.choices = o.d || {};
      st.points = o.p || {};
      st.maxPoints = o.m || {};
      st.interactionsSeen = {};
      for (const id of o.i || []) st.interactionsSeen[id] = 1;
      st.quizAnswers = o.q || {};
      st.quizScore = o.qs || 0;
      st.devices = { ...st.devices, ...(o.dv || {}) };
      st.reporting = { ...st.reporting, ...(o.r || {}) };
      st.finalScore = o.fs === undefined ? null : o.fs;
      st.passed = o.ps === undefined ? null : o.ps;
      return st;
    } catch (_) {
      return null;
    }
  }

  save() {
    const data = this.serialize();
    scorm.setSuspendData(data);
    try { localStorage.setItem(LOCAL_KEY, data); } catch (_) { /* private mode */ }
  }

  /** Loads suspend data from SCORM, falling back to localStorage (local dev). */
  loadResumable() {
    let raw = scorm.getSuspendData();
    if (!raw) {
      try { raw = localStorage.getItem(LOCAL_KEY); } catch (_) { /* ignore */ }
    }
    const restored = CourseState.deserialize(raw);
    if (restored) Object.assign(this, restored);
    return restored;
  }

  reset() {
    Object.assign(this, new CourseState());
    this.save();
  }
}

export const state = new CourseState();
