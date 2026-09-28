/**
 * NOVA Secure Desktop login + post-login knowledge questions.
 * The training credential is fictional and shown on screen; whatever the
 * learner types is compared once and immediately discarded — never stored,
 * never tracked, never sent anywhere.
 */
import { a11y } from '../js/accessibility.js';
import { audio } from '../js/audio.js';

export const TRAINING_PASSWORD = 'Training#2026';

class LoginScreen {
  constructor() { this.el = null; }

  build(desktopApi) {
    if (this.el) return;
    const el = document.createElement('div');
    el.className = 'login-screen';
    desktopApi.registerWindow('login', el);
    this.el = el;
  }

  /** Shows the login. onAttempt(success) fires after each check. */
  showLogin({ user = 'alice.chen', onSuccess } = {}) {
    this.el.classList.add('visible');
    this.el.innerHTML = `
      <div class="login-card">
        <div class="lc-brand">NOVA SECURE DESKTOP</div>
        <div class="lc-title">Sign in — ${user}</div>
        <label for="nova-pass">Password</label>
        <input id="nova-pass" type="password" autocomplete="off" spellcheck="false"
               aria-describedby="nova-note" placeholder="Training password">
        <div class="lc-note" id="nova-note">
          Training simulation — the fictional training password is
          <b>Training#2026</b>. Never enter a real password here.
        </div>
        <div class="login-error" aria-live="polite"></div>
        <div class="choice-stack" style="margin-top:8px">
          <button class="btn btn-primary" id="nova-signin">SIGN IN</button>
        </div>
      </div>`;
    const input = this.el.querySelector('#nova-pass');
    const err = this.el.querySelector('.login-error');
    const card = this.el.querySelector('.login-card');
    const attempt = () => {
      const value = input.value;
      input.value = '';                 // discard immediately — never stored
      if (value === TRAINING_PASSWORD) {
        audio.good();
        onSuccess?.();
      } else {
        audio.bad();
        card.classList.remove('login-shake');
        void card.offsetWidth;          // restart animation
        card.classList.add('login-shake');
        err.textContent = 'Incorrect password — check the training note below the field.';
      }
    };
    this.el.querySelector('#nova-signin').addEventListener('click', attempt);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') attempt(); });
    a11y.announce('NOVA Secure Desktop sign in. Use the fictional training password shown on screen.');
    a11y.focus(input);
  }

  /** Post-login question with 4 options. onAnswer(correct: boolean). */
  showQuestion({ question, options, correctIndex, onAnswer }) {
    this.el.classList.add('visible');
    this.el.innerHTML = `
      <div class="login-card" style="width:min(560px,92%)">
        <div class="lc-brand">SECURITY CHECK</div>
        <div class="lc-title" style="font-size:16px;line-height:1.5"></div>
        <div class="choice-stack" style="margin-top:16px"></div>
      </div>`;
    this.el.querySelector('.lc-title').textContent = question;
    const stack = this.el.querySelector('.choice-stack');
    options.forEach((opt, i) => {
      const b = document.createElement('button');
      b.className = 'btn btn-secondary';
      b.style.justifyContent = 'flex-start';
      b.textContent = opt;
      b.addEventListener('click', () => {
        audio.click();
        onAnswer(i === correctIndex, i);
      });
      stack.appendChild(b);
    });
    a11y.announce(question);
    a11y.focus(stack.querySelector('button'));
  }

  hide() { this.el?.classList.remove('visible'); }
}

export const loginScreen = new LoginScreen();
