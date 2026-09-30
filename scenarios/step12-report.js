/** Step 12 — Incident Reporting: complete, accurate, evidence preserved. */
export const step = {
  id: 'step12',
  title: 'Report Incident',
  objective: 'Report what happened — accurately, with evidence.',
  hint: 'A useful report says what happened, what you did, and carries the original email as evidence.',
  enter(ctx) {
    document.getElementById('screen-stage')?.classList.add('report-layout');
    ctx.desktop.show('Clean Laptop');
    ctx.desktop.setStatus('Clean device verified', 'clean');
    ctx.desktop.closeApps();
    ctx.ticketing.reflectState({
      networkIsolated: ctx.state.devices.workstation === 'isolated',
      poweredOff: ctx.state.devices.workstation === 'powered_off',
    });
    ctx.desktop.openApp('tickets');

    ctx.ticketing.onSubmit = (detail) => {
      ctx.state.reporting.submitted = true;
      ctx.state.reporting.attachedEvidence = detail.attachedEvidence;
      ctx.state.save();
      const earned = Math.min(10, detail.score);
      const verdict = earned >= 9 ? 'good' : earned >= 5 ? 'partial' : 'warn';
      ctx.engine.decision({
        id: 'ticket_report',
        choice: `report_score_${earned}_of_10`,
        earned,
        max: 10,
        result: earned >= 9 ? 'correct' : earned >= 5 ? 'neutral' : 'wrong',
        verdict,
        title: earned >= 9 ? 'A complete, useful report'
          : earned >= 5 ? 'Reported — some details were missing'
          : 'The report was too thin to act on',
        why: `
          <b>What makes an incident report useful:</b>
          <br>\u2022 The incident type and roughly when it happened.
          <br>\u2022 What occurred and what you clicked — including the security warning and the
          files becoming unavailable.
          <br>\u2022 The containment action you took (the disconnected cable is pre-selected from your session).
          <br>\u2022 <b>The original email attached as evidence</b> — preserved, not deleted.
          ${detail.attachedEvidence ? '' : '<br><br>The original email was not attached — without it, Security Operations must reconstruct the campaign from logs alone.'}
          ${detail.narrativeOk ? '' : '<br><br>A one-line description of what happened saves the responders real time.'}
          <br><br>And just as important: the infected machine was left as it was contained —
          not restarted, not "cleaned up".`,
        onContinue: () => ctx.engine.complete(),
      });
    };

    ctx.panel({
      title: 'Report the incident',
      body: `
        <p>Security Operations needs to know what happened on your floor. The portal is open
        on the clean laptop.</p>
        <p style="margin-top:10px">Fill in the incident form — what happened, what you did —
        and <b style="color:#fff">attach the original email as evidence</b>. Then submit.</p>
        <p style="margin-top:10px;font-size:12.5px;color:#94a3b8">
          Your session so far is summarized for you: suspicious call \u2192 urgent email \u2192
          attachment \u2192 security warning \u2192 files locked \u2192
          ${ctx.state.devices.workstation === 'isolated' ? 'network cable disconnected' : 'machine powered off'}.</p>`,
      choices: [{
        label: 'GOT IT — FILL IN THE PORTAL', kind: 'btn-primary',
      }],
      className: 'report-instruction-panel',
      collapsible: true,
      ariaLabel: 'Report the incident in the Northstar Security Operations Portal. Attach the original email as evidence.',
    });
  },
};
