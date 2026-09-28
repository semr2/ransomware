/** Step 6 — The Attack: safe, in-browser ransomware visualization. */
export const step = {
  id: 'step06',
  title: 'The Attack',
  objective: 'Watch the consequence unfold — a safe simulation.',
  hint: 'This is a visual simulation. No real file has been touched.',
  enter(ctx) {
    ctx.desktop.show('Alice\u2019s Workstation');
    ctx.state.devices.workstation = 'compromised';
    ctx.state.save();
    ctx.env.setObjectState('workstation', 'compromised');
    ctx.desktop.setStatus('Threat detected — multiple files', 'bad');
    ctx.sys.updateBadge('monitor', { text: 'COMPROMISED', kind: 'bad' });

    ctx.desktop.glitch();
    ctx.env.shake();
    ctx.audio.alert();
    ctx.a11y.caption('Warning: files on this workstation are being modified. This is a simulation.');

    ctx.desktop.openApp('files');
    ctx.fileManager.renderFolder('documents');
    ctx.fileManager.runEncryption({
      onProgress: (n, total) => {
        if (n === 1) ctx.toast(`Files are changing state\u2026 (${n}/${total}) — simulation only`, 1800);
      },
      onDone: () => {
        ctx.desktop.closeApps();
        ctx.ransomScreen.show({
          phase: 'reveal',
          onContinue: () => ctx.engine.complete(),
        });
      },
    });
  },
};
