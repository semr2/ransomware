/** Step 2 — Urgent IT Request: authority + urgency pressure; verify independently. */
import { callConversation, voicemail, hidePhone } from '../ui/phone.js';

const LINES = [
  'This is IT support. We are responding to a security issue on the network.',
  'An urgent security update email will arrive on your computer any minute now.',
  'Please install it immediately — your account is at risk until it is applied.',
];

const CHOICES_ANSWERED = [
  { key: 'comply', label: 'COMPLY', kind: 'btn-danger' },
  { key: 'ask_verify', label: 'ASK TO VERIFY', kind: 'btn-secondary' },
  { key: 'hang_up_call_back', label: 'HANG UP AND CALL IT BACK', kind: 'btn-primary' },
];

const CHOICES_VOICEMAIL = [
  { key: 'comply', label: 'FOLLOW THE INSTRUCTIONS', kind: 'btn-danger' },
  { key: 'ask_verify', label: 'CALL THE NUMBER LEFT IN THE MESSAGE', kind: 'btn-secondary' },
  { key: 'hang_up_call_back', label: 'CONTACT IT VIA THE KNOWN HELPDESK PORTAL', kind: 'btn-primary' },
];

export const step = {
  id: 'step02',
  title: 'Urgent Request',
  objective: 'Respond to the caller\u2019s urgent request.',
  hint: 'This caller creates urgency and claims authority. How could you truly verify them?',
  enter(ctx) {
    ctx.env.setView('phone');
    const answered = ctx.state.choices.call_response !== 'ignore';
    const choices = answered ? CHOICES_ANSWERED : CHOICES_VOICEMAIL;

    const decide = (key) => {
      hidePhone();
      ctx.a11y.caption('');
      const earned = key === 'hang_up_call_back' ? 10 : key === 'ask_verify' ? 4 : 0;
      const verdict = earned === 10 ? 'good' : earned > 0 ? 'partial' : 'warn';
      ctx.engine.decision({
        id: 'it_verification',
        choice: key,
        earned,
        max: 10,
        result: earned === 10 ? 'correct' : earned > 0 ? 'neutral' : 'wrong',
        verdict,
        title: earned === 10 ? 'You verified independently'
          : earned > 0 ? 'Questions help — but the caller stayed in control'
          : 'The caller\u2019s urgency won',
        why: `
          <b>Urgency and authority are social-engineering tools.</b> A real issue rarely
          needs you to act within minutes on a stranger\u2019s say-so.
          <br><br>
          Caller ID proves nothing${answered ? ' — phone numbers can be spoofed, and a confident tone is not identity' : ' — and a voicemail can claim anything' }.
          The only safe verification is a channel <b>you</b> already trust: the known
          helpdesk portal or the IT number on the intranet — never a number the caller gives you.
          ${earned === 0 ? '<br><br>The email the caller promised arrives anyway — you will see it shortly.' : ''}`,
        onContinue: () => ctx.engine.complete(),
      });
    };

    const showChoices = () => {
      ctx.panel({
        title: 'What should Alice do?',
        body: `<p>The "IT support" contact is pushing hard for immediate action and
               has an answer for everything.</p>`,
        choices: choices.map((c) => ({
          label: c.label,
          kind: c.kind,
          onClick: () => decide(c.key),
        })),
        ariaLabel: 'What should Alice do about this urgent IT request?',
      });
    };

    if (answered) {
      callConversation({
        lines: LINES,
        choices: choices.map((c) => ({ label: c.label, kind: c.kind, onClick: () => decide(c.key) })),
        statusText: 'Connected — 0:12',
      });
    } else {
      voicemail({
        lines: [
          ...LINES,
          'Do not wait for the helpdesk. Install the update the moment the email arrives.',
        ],
        onContinue: showChoices,
      });
    }
  },
};
