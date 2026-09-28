/** Step 8 — Containment: cut the network first; power off only as a fallback. */
export const step = {
  id: 'step08',
  title: 'Containment',
  objective: 'Stop the ransomware from spreading.',
  hint: 'You cannot reach network settings — but physical controls are right in front of you.',
  enter(ctx) {
    ctx.ransomScreen.hide();
    ctx.desktop.hide();
    ctx.env.setView('hardware');
    ctx.env.setObjectState('workstation', 'compromised');
    ctx.env.setObjectState('cable', 'plugged');
    ctx.sys.updateBadge('monitor', { text: 'COMPROMISED', kind: 'bad' });
    ctx.sys.updateBadge('cable', { text: 'CONNECTED', kind: 'bad' });
    ctx.sys.onActivate = () => {};
    ctx.a11y.caption('The infected workstation is still connected to the network.');

    const isolated = ctx.state.devices.workstation === 'isolated';
    const poweredOff = ctx.state.devices.workstation === 'powered_off';
    if (isolated || poweredOff) {
      ctx.engine.decision({
        id: 'containment',
        choice: isolated ? 'network_isolated' : 'powered_off',
        earned: isolated ? 10 : 6,
        max: 10,
        result: 'correct',
        verdict: isolated ? 'good' : 'partial',
        title: 'Already contained',
        why: isolated
          ? 'The network cable is disconnected. The workstation badge now reads ISOLATED — spread is stopped.'
          : 'The machine is off. That stops the spread, though it may have destroyed volatile evidence.',
        onContinue: () => ctx.engine.complete(),
      });
      return;
    }

    const finish = (choice, earned, verdict, title, why) => {
      ctx.sys.setActive([]);
      ctx.engine.decision({
        id: 'containment',
        choice,
        earned,
        max: 10,
        result: 'correct',
        verdict,
        title,
        why,
        onContinue: () => ctx.engine.complete(),
      });
    };

    const isolateNetwork = () => {
      ctx.env.setObjectState('cable', 'unplugged');
      ctx.sys.updateBadge('cable', { text: 'DISCONNECTED', kind: 'isolated' });
      ctx.state.devices.workstation = 'isolated';
      ctx.state.save();
      ctx.env.setObjectState('workstation', 'isolated');
      ctx.sys.updateBadge('monitor', { text: 'ISOLATED', kind: 'isolated' });
      ctx.a11y.caption('Network cable disconnected. The workstation is isolated.');
      finish('network_isolated', 10, 'good', 'Network isolated — the right first move',
        `<b>Cutting the network connection</b> can prevent further spread while preserving the
         running system — its memory and state — for investigation. The ransom screen stays up,
         but the attacker and the encryption process can no longer reach other machines.`);
    };

    const powerOff = () => {
      ctx.env.setObjectState('workstation', 'off');
      ctx.state.devices.workstation = 'powered_off';
      ctx.state.save();
      ctx.sys.updateBadge('monitor', { text: 'POWERED OFF', kind: 'isolated' });
      ctx.a11y.caption('Workstation powered off.');
      finish('powered_off', 6, 'partial', 'Powered off — an accepted fallback',
        `<b>Powering off stops the spread when isolation cannot be achieved</b> — accepted here
         because the network connection could not otherwise be disconnected quickly.
         <br><br>Why it is the fallback, not the first choice: shutting down can destroy volatile
         evidence in memory that investigators use, and sudden power loss can corrupt files further.`);
    };

    const options = () => {
      ctx.panel({
        title: 'Contain the infected workstation',
        body: `
          <p>The ransom screen blocks the desktop — network settings are unreachable.
          But the machine is still <b style="color:#f87171">connected</b>, and every second
          connected is a second the attack can spread to colleagues\u2019 machines.</p>
          <p style="margin-top:10px">The physical controls are in front of you.</p>`,
        choices: [
          { label: 'UNPLUG NETWORK CABLE', kind: 'btn-primary', onClick: () => arm('cable') },
          { label: 'POWER OFF COMPUTER', kind: 'btn-secondary', onClick: () => arm('power_button') },
          { label: 'CALL IT FIRST', kind: 'btn-secondary', onClick: () => stall(
            'IT should know — but not before containment',
            `<b>While the phone rings, the machine remains connected</b> and the incident is
             actively spreading. Make the machine safe first, then report — the ticket you file
             in a few minutes is worth far more than a workstation that spent those minutes
             infecting the floor.`) },
          { label: 'WALK AWAY', kind: 'btn-danger', onClick: () => stall(
            'Walking away leaves the attack running',
            `<b>An unattended, connected, encrypting machine</b> keeps spreading across shared
             drives and colleagues\u2019 files. This incident is yours to contain — at minimum,
             disconnect it and report it.`) },
        ],
        ariaLabel: 'Contain the infected workstation. Unplug the network cable, power off, call IT first, or walk away.',
      });
    };

    const stall = (title, why) => {
      ctx.feedback({
        verdict: 'warn',
        title,
        why,
        continueLabel: 'TRY AGAIN',
        onContinue: options,
      });
    };

    const arm = (objectId) => {
      ctx.sys.onActivate = (id) => {
        ctx.sys.onActivate = () => {};
        if (id === 'cable') isolateNetwork();
        else if (id === 'power_button') powerOff();
      };
      ctx.sys.setActive([objectId]);
      ctx.toast(objectId === 'cable'
        ? 'Now click the network cable to disconnect it.'
        : 'Now click the power button on the dock.');
    };

    options();
  },
};
