/**
 * Minimal WebAudio synthesizer for UI feedback and the phone ringtone.
 * No audio files — everything is generated locally. Silent-fail safe and
 * fully understandable with audio disabled.
 */
import { a11y } from './accessibility.js';

class AudioSys {
  constructor() {
    this.ctx = null;
    this._ringTimer = null;
  }

  _ensure() {
    if (this.ctx) return this.ctx;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      this.ctx = new Ctx();
      return this.ctx;
    } catch (_) { return null; }
  }

  _ok() { return !a11y.muted() && this._ensure(); }

  _beep(freq, start, dur, { type = 'sine', gain = .12 } = {}) {
    const ctx = this._ensure();
    if (!ctx || a11y.muted()) return;
    try {
      const osc = ctx.createOscillator();
      const amp = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      amp.gain.setValueAtTime(0, ctx.currentTime + start);
      amp.gain.linearRampToValueAtTime(gain, ctx.currentTime + start + 0.02);
      amp.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
      osc.connect(amp).connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur + 0.05);
    } catch (_) { /* audio unavailable — fine */ }
  }

  click() { this._beep(660, 0, .07, { type: 'triangle', gain: .05 }); }

  good() {
    this._beep(523, 0, .12, { gain: .08 });
    this._beep(784, .12, .18, { gain: .08 });
  }

  bad() {
    this._beep(220, 0, .18, { type: 'sawtooth', gain: .05 });
    this._beep(165, .16, .25, { type: 'sawtooth', gain: .05 });
  }

  alert() {
    this._beep(880, 0, .1, { type: 'square', gain: .05 });
    this._beep(880, .18, .1, { type: 'square', gain: .05 });
  }

  /** Starts/stops the fictional mobile ringtone (two-burst pattern). */
  ring(on) {
    clearInterval(this._ringTimer);
    if (!on) return;
    const burst = () => {
      this._beep(880, 0, .22, { type: 'sine', gain: .09 });
      this._beep(988, .28, .22, { type: 'sine', gain: .09 });
      this._beep(880, .56, .22, { type: 'sine', gain: .09 });
      this._beep(988, .84, .22, { type: 'sine', gain: .09 });
    };
    burst();
    this._ringTimer = setInterval(burst, 2000);
  }
}

export const audio = new AudioSys();
