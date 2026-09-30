/** Step 1 — Unknown Call: the phone rings; answering is not the mistake. */
import { incomingCall, hidePhone, focusIncomingSlider } from '../ui/phone.js';

export const step = {
  id: 'step01',
  title: 'Unknown Call',
  objective: 'Decide how to handle an unexpected call.',
  hint: 'Answering a call is not a mistake — but stay alert for pressure tactics.',
  enter(ctx) {
    // Bring the physical desk phone into close view while it rings. The call
    // prompt supplies the accessible slide-to-answer interaction.
    ctx.env.setView('phone');
    ctx.env.ringPhone(true);
    ctx.audio.ring(true);
    ctx.a11y.caption('A mobile phone is ringing on the desk.');

    const settle = () => {
      ctx.env.ringPhone(false);
      ctx.audio.ring(false);
      hidePhone();
      ctx.a11y.caption('');
    };

    const answer = () => {
      settle();
      // Tracked but unscored (max 0) — kept in choices so the next step
      // knows which conversation variant to play, including on resume.
      ctx.state.recordDecision('call_response', 'answer', 0, 0);
      ctx.scorm.recordInteraction('call_response', 'answer', 'neutral');
      ctx.engine.complete();
    };

    const ignore = () => {
      settle();
      ctx.state.recordDecision('call_response', 'ignore', 0, 0);
      ctx.scorm.recordInteraction('call_response', 'ignore', 'neutral');
      ctx.panel({
        title: 'Call ignored',
        body: `
          <p>Letting an unknown call go to voicemail is a perfectly reasonable
          instinct — unknown callers deserve caution.</p>
          <p style="margin-top:10px">The caller doesn't give up that easily.
          A voicemail is left, pressing the same request.
          <b style="color:#fff">Listen to what they have to say.</b></p>`,
        choices: [{ label: 'PLAY VOICEMAIL', kind: 'btn-primary', onClick: () => ctx.engine.complete() }],
        ariaLabel: 'Call ignored. A voicemail is left. Press Play Voicemail to continue.',
      });
    };

    ctx.sys.onActivate = () => focusIncomingSlider(); // interact with the desk phone, then slide to answer
    ctx.sys.setActive(['phone']);
    incomingCall({ onAnswer: answer, onIgnore: ignore });
  },
};
