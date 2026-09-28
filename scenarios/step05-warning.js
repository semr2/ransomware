/** Step 5 — Antivirus Warning: never override a security warning on someone's say-so. */
export const step = {
  id: 'step05',
  title: 'Antivirus Warning',
  objective: 'Respond to the security warning.',
  hint: 'A security warning is information, not an obstacle. Who told you it was safe to bypass it?',
  enter(ctx) {
    ctx.desktop.show('Alice\u2019s Workstation');
    const flagged = ctx.state.choices.attachment_action === 'flagged';

    const showWarning = () => ctx.fileManager.showWarning({
      onDismiss: () => decide('dismiss'),
      onDelete: () => decide('delete'),
      onReport: () => decide('report'),
    });

    const beginAttack = () => ctx.engine.complete();

    const decide = (choice) => {
      const earned = choice === 'dismiss' ? 0 : 10;
      ctx.engine.decision({
        id: 'attachment_warning',
        choice,
        earned,
        max: 10,
        result: earned ? 'correct' : 'wrong',
        verdict: earned ? 'good' : 'warn',
        title: earned ? 'You trusted the warning' : 'The warning was overridden',
        why: earned
          ? (choice === 'delete'
              ? '<b>Deleting quarantined the threat.</b> Executables emailed as "updates" are never legitimate — '
                + 'real IT deploys patches through managed tools, not attachments.'
              : '<b>Reporting it was the strongest choice.</b> Security Operations can trace the campaign, '
                + 'warn colleagues and block the sender — one report protects everyone.')
          : `<b>A security warning existed for a reason.</b> The caller's assurance — "IT is expecting this file" —
             is exactly the pretext the warning was protecting you against.
             <br><br>Never dismiss, bypass or override a security warning because another person
             instructed you to. Delete or report instead.`,
        onContinue: earned ? bridgeToAttack : beginAttack,
      });
    };

    // Safe choices still lead into the attack: the installer had already begun
    // staging when the file was downloaded — quarantine raced it and lost.
    // Lesson: even good decisions can't always prevent infection; containment still matters.
    const bridgeToAttack = () => {
      ctx.panel({
        title: 'One problem\u2026',
        body: `
          <p>Security Center quarantined the file — but its telemetry shows the installer
          had <b style="color:#fff">already started staging</b> the moment the email was opened.
          Defense in depth bought seconds, not safety.</p>
          <p style="margin-top:10px">Watch what happens next — and remember:
          when prevention fails, <b style="color:#fff">containment</b> is what limits the damage.</p>`,
        choices: [{ label: 'CONTINUE', kind: 'btn-primary', onClick: beginAttack }],
        ariaLabel: 'The installer had already started staging. Continue to watch the consequence.',
      });
    };

    if (flagged) {
      bridgeToWarningFromFlag();
    } else {
      ctx.fileManager.renderFolder('downloads');
      ctx.desktop.openApp('files');
      ctx.fileManager.onDangerousFile = () => { ctx.fileManager.onDangerousFile = null; showWarning(); };
      ctx.toast('Open the Downloads folder and inspect the downloaded file.');
    }

    function bridgeToWarningFromFlag() {
      ctx.fileManager.renderFolder('downloads');
      ctx.desktop.openApp('files');
      ctx.panel({
        title: 'Security Center intervenes',
        body: `
          <p>As you report the message, NOVA Security Center raises an alert of its own:
          the download from the phishing email <b style="color:#fff">staged an executable</b>
          in your Downloads folder before the message was even flagged.</p>`,
        choices: [{
          label: 'VIEW THE WARNING', kind: 'btn-primary',
          onClick: () => window.setTimeout(showWarning, ctx.a11y.reducedMotion() ? 100 : 450),
        }],
        ariaLabel: 'Security Center detected the staged executable. View the warning.',
      });
    }
  },
};
