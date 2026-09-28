/** Step 7 — Ransom Decision: payment is not a recovery plan. */
export const step = {
  id: 'step07',
  title: 'Ransom Decision',
  objective: 'Respond to the ransom demand.',
  hint: 'The note wants you to act alone, in secret, fast. What does the organization\u2019s process say?',
  enter(ctx) {
    ctx.desktop.show('Alice\u2019s Workstation');
    ctx.desktop.setStatus('Files unavailable', 'bad');

    ctx.ransomScreen.show({
      phase: 'decision',
      onChoice: (choice) => {
        ctx.ransomScreen.hide();
        const earned = choice === 'refuse' ? 10 : choice === 'negotiate' ? 4 : 0;
        const verdict = earned === 10 ? 'good' : earned > 0 ? 'partial' : 'warn';
        ctx.engine.decision({
          id: 'ransom_decision',
          choice,
          earned,
          max: 10,
          result: earned === 10 ? 'correct' : earned > 0 ? 'neutral' : 'wrong',
          verdict,
          title: earned === 10 ? 'Payment refused' : earned > 0 ? 'Negotiation is still payment' : 'Payment attempted',
          why: `
            <b>Payment is not a recovery plan.</b>
            <br>\u2022 Paying guarantees nothing — attackers often provide broken or absent decryption keys.
            <br>\u2022 Payment does not remove the underlying compromise; the attacker retains access.
            <br>\u2022 It funds and rewards criminal activity, and can mark you as a paying target.
            <br><br>
            The organization\u2019s incident-response process — contain, report, restore from backups —
            is the only path that does not depend on the attacker\u2019s goodwill.`,
          onContinue: () => ctx.engine.complete(),
        });
      },
    });
  },
};
