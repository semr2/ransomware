/** Step 14 — Knowledge Check: 5 questions, pass mark 80% overall, retry allowed. */
import { runQuiz } from '../js/quiz.js';
import { commitFinalScore, PASS_MARK } from '../js/scoring.js';
import { showDebrief, showResults } from '../ui/debrief.js';

export const step = {
  id: 'step14',
  title: 'Knowledge Check',
  objective: 'Five questions. Pass mark 80% overall.',
  hint: 'Every question maps to a moment you just lived through.',
  enter(ctx) {
    ctx.env.setView('office');
    ctx.sys.setActive([]);

    const startQuiz = () => runQuiz({ state: ctx.state, scorm: ctx.scorm, onDone: finishUp });

    const finishUp = () => {
      const result = commitFinalScore();
      const decisionCount = Object.keys(ctx.state.maxPoints)
        .filter((id) => ctx.state.maxPoints[id] > 0).length;
      ctx.engine.track('course_complete', `score:${result.total}`, result.passed ? 'correct' : 'wrong');

      showResults(result, {
        decisionCount,
        canRetry: true,
        onRetry: () => {
          ctx.state.quizAnswers = {};
          ctx.state.quizScore = 0;
          ctx.state.save();
          startQuiz();
        },
        onReview: () => showDebrief(ctx.state, { onContinue: startQuiz }),
        onExit: exitCourse,
      });
    };

    const exitCourse = () => {
      ctx.panel({
        title: ctx.state.passed ? 'Course complete' : `Course complete — pass mark is ${PASS_MARK}%`,
        body: ctx.state.passed
          ? '<p>Your result has been reported to the LMS. You may close this window.</p>'
          : `<p>Your latest score is <b style="color:#fff">${ctx.state.finalScore}%</b>.
             You can retake the knowledge check any time to reach the ${PASS_MARK}% pass mark.</p>`,
        choices: [{
          label: 'RESTART COURSE', kind: 'btn-ghost',
          onClick: () => { ctx.state.reset(); window.location.reload(); },
        }],
        note: 'Progress was saved automatically — closing the window is safe at any time.',
        ariaLabel: 'Course complete. You may close this window, or restart the course.',
      });
    };

    ctx.panel({
      title: 'Knowledge Check',
      body: `
        <p>Five questions on what you just experienced. Each has one best answer,
        and every question comes with an explanation either way.</p>
        <p style="margin-top:10px">The knowledge check is worth <b style="color:#fff">30%</b> of
        your final score; your scenario decisions made up the other 70%.
        Pass mark: <b style="color:#fff">${PASS_MARK}%</b> overall.</p>`,
      choices: [{ label: 'BEGIN', kind: 'btn-primary', onClick: startQuiz }],
      ariaLabel: 'Knowledge check introduction. Five questions, pass mark 80 percent overall. Press Begin to start.',
    });
  },
};
