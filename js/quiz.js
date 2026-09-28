/**
 * Knowledge check: 5 questions, 4 choices each, pass mark 80% overall.
 * Questions map 1:1 to the five core objectives.
 */
import { a11y } from './accessibility.js';
import { audio } from './audio.js';
import { panel, clearOverlays } from '../ui/feedback.js';

export const QUESTIONS = [
  {
    interaction_id: 'quiz_question_1',
    topic: 'Vishing / fake IT caller',
    question: 'An unknown caller claims to be IT and asks you to install an urgent security update. What should you do?',
    choices: [
      'Follow the instructions immediately',
      'Ask the caller for their employee number',
      'Hang up and contact IT through a trusted channel',
      'Install the update and ask questions afterward',
    ],
    correct: 2,
    explanation: 'Caller ID and confidence prove nothing. Hang up and reach IT through a number or channel you already trust — never one supplied by the caller.',
  },
  {
    interaction_id: 'quiz_question_2',
    topic: 'Sender-domain verification',
    question: 'What is an important phishing indicator?',
    choices: [
      'A normal company logo',
      'A lookalike sender domain',
      'A short email',
      'A professional signature',
    ],
    correct: 1,
    explanation: 'Lookalike domains (northstarr-… vs northstar-…) imitate the real one. Logos and signatures are trivially copied — always inspect the actual sender address.',
  },
  {
    interaction_id: 'quiz_question_3',
    topic: 'Security warnings',
    question: 'Your security software warns that an attachment may be malicious. What should you do?',
    choices: [
      'Disable the warning',
      'Open the file anyway',
      'Delete or report the file according to procedure',
      'Ask the sender to resend it',
    ],
    correct: 2,
    explanation: 'Never override a security warning because someone — a caller, a boss, an email — insists the file is legitimate. Delete or report it per procedure.',
  },
  {
    interaction_id: 'quiz_question_4',
    topic: 'Ransomware containment',
    question: 'A workstation appears infected with ransomware and is still connected to the network. What is the primary containment action?',
    choices: [
      'Continue working',
      'Disconnect the network connection',
      'Restart repeatedly',
      'Pay the ransom',
    ],
    correct: 1,
    explanation: 'Disconnecting the network helps prevent further spread while preserving the running system for investigation. Powering off is a fallback only if isolation cannot be achieved.',
  },
  {
    interaction_id: 'quiz_question_5',
    topic: 'Password handling after compromise',
    question: 'You suspect your password may have been exposed on an infected computer. What should you do?',
    choices: [
      'Continue using it',
      'Reuse it on another account',
      'Change it from a known-clean device and use MFA where available',
      'Write it on a sticky note',
    ],
    correct: 2,
    explanation: 'Treat credentials typed on an infected machine as exposed. Change the password from a known-clean device, never reuse it, and enable MFA.',
  },
];

/**
 * Runs the quiz as a sequence of panels.
 * onDone({ correct, total, percent, answers })
 */
export function runQuiz({ state, scorm, onDone }) {
  let index = 0;
  let correct = 0;

  const ask = () => {
    if (index >= QUESTIONS.length) {
      const percent = Math.round((correct / QUESTIONS.length) * 100);
      state.quizScore = percent;
      state.save();
      onDone({ correct, total: QUESTIONS.length, percent });
      return;
    }
    const q = QUESTIONS[index];
    const buttons = q.choices.map((label, i) => ({
      label: `${'ABCD'[i]}. ${label}`,
      kind: 'btn-secondary',
      onClick: () => answer(i),
    }));
    panel({
      title: `Knowledge Check — Question ${index + 1} of ${QUESTIONS.length}`,
      body: `<p style="color:#94a3b8;font-size:12px;letter-spacing:.1em">${q.topic.toUpperCase()}</p>
             <p style="color:#fff;font-size:15.5px;margin-top:8px">${q.question}</p>`,
      choices: buttons,
      ariaLabel: `Question ${index + 1}: ${q.question}`,
    });

    function answer(i) {
      const isCorrect = i === q.correct;
      if (isCorrect) { correct++; audio.good(); } else { audio.bad(); }
      const key = String(index);
      if (!state.quizAnswers[key]) {
        state.quizAnswers[key] = { choice: 'ABCD'[i], ok: isCorrect };
        state.save();
      }
      scorm.recordInteraction(q.interaction_id, 'ABCD'[i], isCorrect ? 'correct' : 'wrong');
      panel({
        title: isCorrect ? 'Correct' : 'Not quite',
        body: `<p style="color:#cbd5e1">${q.explanation}</p>`,
        choices: [{
          label: index === QUESTIONS.length - 1 ? 'SEE RESULTS' : 'NEXT QUESTION',
          kind: 'btn-primary',
          onClick: () => { index++; ask(); },
        }],
        ariaLabel: `${isCorrect ? 'Correct' : 'Incorrect'}. ${q.explanation}`,
      });
    }
  };

  clearOverlays();
  ask();
}
