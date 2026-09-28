/** Step 10 — Credentials: sign in on the clean device, then handle the exposed password. */
export const step = {
  id: 'step10',
  title: 'Credentials',
  objective: 'Sign in safely and protect the compromised password.',
  hint: 'The training password is shown on screen — never enter a real password into training.',
  enter(ctx) {
    ctx.env.setView('cleanpc');
    ctx.desktop.show('Clean Laptop');
    ctx.desktop.setStatus('Clean device verified', 'clean');
    ctx.desktop.closeApps();
    ctx.env.setObjectState('cleanpc', 'login');

    ctx.loginScreen.showLogin({
      user: 'alice.chen',
      onSuccess: () => {
        ctx.env.setObjectState('cleanpc', 'clean');
        ctx.loginScreen.showQuestion({
          question: 'Alice typed her password into the infected workstation earlier today. What should she do about that password?',
          options: [
            'Reuse the old password — it probably wasn\u2019t stolen',
            'Change the password from the clean device',
            'Write the new password on a sticky note so she doesn\u2019t forget it',
            'Keep using the old password until IT responds',
          ],
          correctIndex: 1,
          onAnswer: (correct) => {
            ctx.loginScreen.hide();
            ctx.engine.decision({
              id: 'second_pc_password',
              choice: correct ? 'change_from_clean_device' : 'kept_or_reused',
              earned: correct ? 10 : 0,
              max: 10,
              result: correct ? 'correct' : 'wrong',
              verdict: correct ? 'good' : 'warn',
              title: correct ? 'Password changed from the clean device' : 'The exposed password stays exposed',
              why: `
                <b>Anything typed on an infected machine must be treated as compromised.</b>
                <br>\u2022 Change the password from a known-clean device — not the infected one.
                <br>\u2022 Never reuse it anywhere; attackers try leaked credentials everywhere.
                <br>\u2022 Enable MFA where available — a stolen password alone then fails.
                <br>\u2022 Sticky notes are not security.
                <br><br>
                (This simulation never stored what you typed — the training password was the only
                credential ever checked.)`,
              onContinue: () => ctx.engine.complete(),
            });
          },
        });
      },
    });
  },
};
