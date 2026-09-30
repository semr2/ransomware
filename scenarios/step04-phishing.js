/** Step 4 — Inspect the Phishing Email: hotspots for sender/urgency/attachment. */
import { PHISH_MAIL } from '../ui/email.js';

export const step = {
  id: 'step04',
  title: 'Read the Email',
  objective: 'Inspect the unexpected security update email.',
  hint: 'Click the highlighted parts of the email — sender, wording, attachment — to inspect them.',
  enter(ctx) {
    ctx.desktop.show('Alice\u2019s Workstation');
    ctx.mailApp.renderInbox({ withPhish: true });
    ctx.mailApp.openMail(PHISH_MAIL, {
      hotspots: ['sender', 'urgency', 'greeting', 'attachment'],
      attachmentActions: [{
        label: 'OPEN SECURITY_UPDATE.EXE',
        kind: 'btn-danger',
        onClick: () => choose('open'),
      }, {
        label: 'REPORT & KEEP EMAIL',
        kind: 'btn-primary',
        onClick: () => choose('flag'),
      }],
      inspectMode: true,
    });
    ctx.desktop.openApp('mail');

    // Dock re-openings (or clicking another mail then back) keep the hotspots live.
    ctx.mailApp.onAppOpen = () => ctx.mailApp.openMail(PHISH_MAIL, {
      hotspots: ['sender', 'urgency', 'greeting', 'attachment'],
      attachmentActions: [
        { label: 'OPEN SECURITY_UPDATE.EXE', kind: 'btn-danger', onClick: () => choose('open') },
        { label: 'REPORT & KEEP EMAIL', kind: 'btn-primary', onClick: () => choose('flag') },
      ],
    });
    ctx.mailApp.onHotspot = (key) => {
      const id = { sender: 'sender_inspection', urgency: 'urgency_inspection', attachment: 'attachment_inspection' }[key];
      if (id) ctx.engine.track(id, 'inspected', 'correct');
      else ctx.engine.track('greeting_inspection', 'inspected', 'neutral');
    };

    function choose(action) {
      ctx.mailApp.onHotspot = null;
      ctx.mailApp.onAppOpen = null;
      if (action === 'open') {
        ctx.state.recordDecision('attachment_action', 'open', 0, 0);
        ctx.scorm.recordInteraction('attachment_action', 'open', 'neutral');
        ctx.engine.complete();
      } else {
        ctx.state.recordDecision('attachment_action', 'flagged', 0, 0);
        ctx.scorm.recordInteraction('attachment_action', 'flagged', 'correct');
        ctx.engine.decision({
          id: 'email_open',
          choice: 'flagged_and_kept',
          earned: 0,
          max: 0,
          result: 'correct',
          verdict: 'good',
          title: 'Right call — and the evidence is kept',
          why: 'Reporting the message keeps it in the mailbox as evidence for Security Operations. '
            + 'Deleting it would destroy the very thing investigators need.',
          onContinue: () => ctx.engine.complete(),
        });
      }
    }

    ctx.panel({
      title: 'The caller is still waiting',
      body: `
        <p>\u201CHave you installed the update yet? Your account is at risk.\u201D</p>
        <p style="margin-top:10px">Inspect the highlighted indicators, then use the email itself:
        click <b style="color:#fff">Security_Update.exe</b> to open it, or choose the report option
        beside the attachment.</p>`,
      note: 'This prompt is guidance only. Make your choice in the email window.',
      ariaLabel: 'The caller is waiting. Inspect the email, then decide about the attachment.',
    });
  },
};
