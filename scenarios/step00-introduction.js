/** Step 0 — Introduction: establish the office, the role, and the controls. */
export const step = {
  id: 'step00',
  title: 'Introduction',
  objective: 'Meet Alice and learn the controls.',
  hint: 'Use START SIMULATION when you are ready. You can also press Enter.',
  enter(ctx) {
    ctx.env.setView('establish', { instant: true });
    window.setTimeout(() => ctx.env.setView('office'), ctx.a11y.reducedMotion() ? 100 : 900);

    ctx.panel({
      title: 'Ransomware Response: The First 60 Minutes',
      body: `
        <p style="font-size:15.5px;color:#e2e8f0">
          You are <b style="color:#fff">Alice</b>, an employee at
          <b style="color:#fff">Northstar Dynamics</b> — a fictional company.
          An unexpected security incident is about to unfold.
        </p>
        <p style="margin-top:10px">
          Your decisions will determine how effectively you respond.
          There are no tricks — just a realistic incident and better or worse
          ways to handle it.
        </p>
        <p style="margin-top:12px;font-size:13px;color:#94a3b8">
          <b style="color:#cbd5e1">Controls:</b> click objects in the office, or use the
          object buttons on the left. Everything works with keyboard alone
          (Tab, Enter, Space, Escape). Open
          <b style="color:#cbd5e1">Accessibility</b> in the top bar for captions,
          reduced motion, and a 2D mode. All companies, people, and systems
          in this course are fictional.
        </p>`,
      choices: [
        { label: 'START SIMULATION', kind: 'btn-primary', onClick: () => ctx.engine.complete() },
      ],
      ariaLabel: 'Course introduction. You are Alice, an employee at Northstar Dynamics. Press Start Simulation to begin.',
    });
  },
};
