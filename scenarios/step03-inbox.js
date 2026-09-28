/** Step 3 — Inbox Check: the promised "update" email arrives. */
import { PHISH_MAIL } from '../ui/email.js';

export const step = {
  id: 'step03',
  title: 'Inbox Check',
  objective: 'Check your inbox for the promised \u201Csecurity update\u201D.',
  hint: 'The caller promised this email. Promised does not mean legitimate.',
  enter(ctx) {
    ctx.env.setView('monitor');
    ctx.desktop.show('Alice\u2019s Workstation');
    ctx.desktop.setStatus('Session active');
    ctx.mailApp.renderInbox({ withPhish: true });
    ctx.desktop.openApp('mail');

    const proceed = (choice, title, why, verdict) => {
      ctx.state.recordDecision('email_open', choice, 0, 0);
      ctx.engine.decision({
        id: 'email_open',
        choice,
        earned: 0,
        max: 0,
        result: 'neutral',
        verdict,
        title,
        why,
        continueLabel: 'INSPECT THE EMAIL',
        onContinue: () => ctx.engine.complete(),
      });
    };

    ctx.panel({
      title: 'A new message has arrived',
      body: `
        <p>Exactly as the caller promised, a message lands in the inbox:</p>
        <p style="margin-top:10px;padding:12px 14px;border-radius:10px;background:rgba(148,163,184,.08)">
          <b style="color:#fff">${PHISH_MAIL.from}</b> &lt;${PHISH_MAIL.address}&gt;<br>
          <b style="color:#fff">${PHISH_MAIL.subject}</b> — priority ${PHISH_MAIL.priority}
        </p>`,
      choices: [
        {
          label: 'OPEN EMAIL',
          kind: 'btn-primary',
          onClick: () => proceed('open', 'Email opened',
            'Opening a message to inspect it is safe — reading an email does not run code. '
            + 'What you do with its links and attachments is what matters. Inspect it carefully.',
            'good'),
        },
        {
          label: 'FLAG AS SUSPICIOUS',
          kind: 'btn-secondary',
          onClick: () => proceed('flag_suspicious', 'Good instinct',
            'Flagging unexpected mail for review is exactly right — and the message stays in the mailbox '
            + 'as evidence. Before it is reviewed, inspect the indicators yourself so you can describe '
            + 'what looks wrong.', 'good'),
        },
      ],
      ariaLabel: 'A new email has arrived from IT Support. Open it or flag it as suspicious.',
    });
  },
};
