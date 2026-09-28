/**
 * Scoring engine.
 * Scenario decisions: 70 points across 7 scored decisions (10 each).
 * Knowledge check:   30 points across 5 questions (6 each).
 * Pass mark: 80.
 */
import { state } from './course-state.js';
import { scorm } from './scorm.js';

export const PASS_MARK = 80;
export const SCENARIO_TOTAL = 70;
export const QUIZ_TOTAL = 30;

export const DECISIONS = {
  it_verification:    { max: 10 },
  attachment_warning: { max: 10 },
  ransom_decision:    { max: 10 },
  containment:        { max: 10 },
  second_pc_password: { max: 10 },
  sender_check:       { max: 10 },
  ticket_report:      { max: 10 },
};

export function computeFinalScore() {
  const { earned, max } = state.scenarioEarned();
  // If the learner resumed mid-way, un-attempted decisions simply haven't
  // been earned yet; denominator stays the full 70 for a stable pass bar.
  const quizEarned = Object.values(state.quizAnswers)
    .reduce((sum, ans) => sum + (ans && ans.ok ? 6 : 0), 0);
  const total = Math.min(100, Math.round(earned + quizEarned));
  return {
    scenarioEarned: earned,
    scenarioMax: SCENARIO_TOTAL,
    quizEarned,
    quizMax: QUIZ_TOTAL,
    total,
    passed: total >= PASS_MARK,
  };
}

export function commitFinalResult() {
  const result = computeFinalScore();
  state.finalScore = result.total;
  state.passed = result.passed;
  state.save();
  scorm.setScore(result.total, 100);
  scorm.setLessonStatus(result.passed ? 'passed' : 'failed');
  return result;
}
