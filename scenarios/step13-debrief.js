/** Step 13 — Debrief: constructive review of every decision made. */
import { showDebrief } from '../ui/debrief.js';

export const step = {
  id: 'step13',
  title: 'Debrief',
  objective: 'Review your decisions.',
  hint: 'Mistakes are how training works — what matters is the pattern you take away.',
  enter(ctx) {
    ctx.desktop.hide();
    ctx.ransomScreen.hide();
    ctx.loginScreen.hide();
    ctx.env.setView('office');
    ctx.sys.setActive([]);
    showDebrief(ctx.state, { onContinue: () => ctx.engine.complete() });
  },
};
