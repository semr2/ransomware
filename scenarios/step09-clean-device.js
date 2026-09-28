/** Step 9 — Clean Computer: recovery and reporting happen on a known-clean device. */
export const step = {
  id: 'step09',
  title: 'Clean Computer',
  objective: 'Move to a known-clean device.',
  hint: 'A spare, verified-clean laptop sits at the desk behind you.',
  enter(ctx) {
    ctx.env.setView('office');
    ctx.sys.updateBadge('cleanpc', { text: 'CLEAN DEVICE', kind: 'clean' });
    ctx.sys.setActive(['cleanpc']);

    const use = () => {
      ctx.sys.setActive([]);
      ctx.engine.track('clean_device', 'use', 'correct');
      ctx.state.devices.cleanPc = 'in_use';
      ctx.state.save();
      ctx.engine.complete();
    };
    ctx.sys.onActivate = use;

    ctx.panel({
      title: 'A known-clean computer is available',
      body: `
        <p>The spare laptop at the next desk is <b style="color:#4ade80">verified clean</b>
        by Security Operations this morning.</p>
        <p style="margin-top:10px">Everything from here on — signing in, verifying the sender,
        reporting the incident — must happen on the clean device. The infected workstation
        stays untouched, exactly as it was contained.</p>`,
      choices: [{ label: 'USE CLEAN COMPUTER', kind: 'btn-primary', onClick: use }],
      ariaLabel: 'A known-clean computer is available. Press Use Clean Computer to continue.',
    });
  },
};
