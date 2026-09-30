/** Step 11 — Identify the Fake Sender Domain: find the lookalike yourself. */
import { PHISH_MAIL } from '../ui/email.js';

const SEGMENTS = [
  { text: 'it-support@', key: 'prefix' },
  { text: 'northstarr', key: 'lookalike' },
  { text: '-security-training', key: 'middle' },
  { text: '.test', key: 'tld' },
];

export const step = {
  id: 'step11',
  title: 'Fake Email',
  objective: 'Identify the suspicious part of the sender address.',
  hint: 'Compare the sender domain with the real one, character by character.',
  enter(ctx) {
    ctx.desktop.show('Clean Laptop');
    ctx.desktop.setStatus('Clean device verified', 'clean');
    ctx.mailApp.renderInbox({ withPhish: true });
    ctx.mailApp.openMail(PHISH_MAIL, {}); // plain view — the inspection happens in the panel
    ctx.desktop.openApp('mail');

    let wrongTries = 0;
    let settled = false;

    ctx.panel({
      title: 'Which part of the sender address is suspicious?',
      body: `
        <p>The original email, opened on the clean laptop:</p>
        <p style="margin-top:8px;font-family:var(--mono);font-size:13px;color:#e2e8f0">
          From: ${PHISH_MAIL.from} &lt;${PHISH_MAIL.address}&gt;</p>
        <p style="margin-top:10px">Northstar\u2019s real domain is
          <b style="color:#4ade80;font-family:var(--mono)">northstar-training.test</b><br>
          Compare it with the sender address shown in the email.</p>`,
      choices: SEGMENTS.map((segment) => ({
        label: segment.text,
        kind: 'btn-ghost',
        keepOpen: true,
        onClick: () => inspectSegment(segment),
      })),
      ariaLabel: 'Which part of the sender address is suspicious? The real domain is northstar hyphen training dot test.',
    });

    function inspectSegment(seg) {
        if (settled) return;
        if (seg.key === 'lookalike') {
          settled = true;
          const earned = wrongTries === 0 ? 10 : 5;
          ctx.engine.decision({
            id: 'sender_check',
            choice: wrongTries === 0 ? 'found_first_try' : `found_after_${wrongTries}_tries`,
            earned,
            max: 10,
            result: 'correct',
            verdict: earned === 10 ? 'good' : 'partial',
            title: 'The lookalike domain, spotted',
            why: `
              <b>northstarr-security-training.test</b> imitates the real
              <b>northstar-training.test</b> with an extra \u201Cr\u201D and an inserted word.
              Display names can be faked — always inspect the actual sender address.
              <br><br>
              Verify unexpected requests through a trusted channel, never the contact details
              the message or caller supplies.`,
            onContinue: () => ctx.engine.complete(),
          });
        } else {
          wrongTries++;
          ctx.scorm.recordInteraction('sender_check_attempt', `wrong_segment:${seg.key}`, 'wrong');
          ctx.toast('Not that part — compare it with the real domain, character by character.');
        }
    }
  },
};
