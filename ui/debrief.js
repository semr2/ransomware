/**
 * Debrief + final results screens. Reviews decisions constructively —
 * never shames the learner.
 */
import { a11y } from '../js/accessibility.js';
import { audio } from '../js/audio.js';
import { panel } from './feedback.js';

const AREAS = [
  {
    key: 'it_verification',
    title: 'Phone call',
    good: 'Verified independently before acting',
    partial: 'Asked questions but kept the caller on the line',
    review: 'An unexpected caller was trusted too quickly. Urgency and authority are social-engineering pressure tactics — hang up and call IT back through a known, trusted channel.',
  },
  {
    key: 'attachment_warning',
    title: 'Security warning',
    good: 'Did not override the security warning',
    review: 'The security warning was dismissed. Security warnings should never be bypassed just because someone claims a file is legitimate.',
  },
  {
    key: 'ransom_decision',
    title: 'Ransom decision',
    good: 'Refused payment',
    review: 'Payment was considered. Paying never guarantees recovery, may fund further crime, and does not remove the underlying compromise. Follow the incident-response process instead.',
  },
  {
    key: 'containment',
    title: 'Containment',
    good: 'Network isolated',
    partial: 'Machine powered off (accepted fallback)',
    review: 'Containment was delayed. Disconnecting the network stops the spread while preserving the running system for investigation.',
  },
  {
    key: 'second_pc_password',
    title: 'Credential handling',
    good: 'Changed the affected password from a clean device',
    review: 'The compromised password was kept or reused. Credentials typed on an infected machine must be treated as exposed — change them from a known-clean device and enable MFA.',
  },
  {
    key: 'sender_check',
    title: 'Sender verification',
    good: 'Spotted the lookalike domain',
    review: 'The lookalike domain was missed. Display names can be faked — always inspect the actual sender address.',
  },
  {
    key: 'ticket_report',
    title: 'Incident report',
    good: 'Reported with evidence preserved',
    partial: 'Reported — evidence could be more complete',
    review: 'The report was incomplete. Useful, accurate details and the original email as evidence help IT respond faster.',
  },
];

function lineFor(area, state) {
  const choice = state.choices[area.key];
  const earned = state.points[area.key] || 0;
  const max = state.maxPoints[area.key];
  if (choice === undefined) return null;
  if (max && earned >= max) return { kind: 'good', text: area.good };
  if (max && earned > 0 && area.partial) return { kind: 'partial', text: area.partial };
  return { kind: 'review', text: area.review };
}

export function showDebrief(state, { onContinue }) {
  const rows = [];
  for (const area of AREAS) {
    const line = lineFor(area, state);
    if (!line) continue;
    const icon = line.kind === 'good' ? '✓' : line.kind === 'partial' ? '≈' : '!';
    const color = line.kind === 'good' ? '#4ade80' : line.kind === 'partial' ? '#fbbf24' : '#f87171';
    rows.push(`<li style="display:flex;gap:10px;margin:9px 0;font-size:13.5px;line-height:1.55">
      <span style="color:${color};font-weight:800">${icon}</span>
      <span><b style="color:#fff">${area.title}</b> — ${line.text}</span></li>`);
  }
  const anyReview = rows.some((r) => r.includes('#f87171'));
  panel({
    title: 'Security Incident Debrief',
    body: `
      <p>Here is how your response unfolded. Every decision counted — and every
      lesson here applies to a real incident.</p>
      <ul style="list-style:none;padding:0;margin-top:14px">${rows.join('')}</ul>
      ${anyReview ? `<p style="margin-top:12px;color:#e2e8f0"><b style="color:#fff">Area to review.</b>
        Mistakes are how training works — the important part is the pattern:
        verify unexpected requests, heed security warnings, contain first,
        preserve evidence, and report quickly.</p>` : ''}
    `,
    choices: [{ label: 'CONTINUE TO KNOWLEDGE CHECK', kind: 'btn-primary', onClick: onContinue }],
    ariaLabel: 'Security incident debrief',
  });
}

const KEY_LESSONS = [
  'Verify unexpected IT requests through a trusted channel',
  'Inspect sender domains — watch for lookalikes',
  'Never override security warnings on someone\u2019s say-so',
  'Isolate the network connection first',
  'Use a known-clean device for recovery',
  'Protect compromised credentials — change + MFA',
  'Preserve evidence; don\u2019t delete or restart',
  'Report quickly and accurately',
  'Never rely on ransom payment for recovery',
];

export function showResults(result, { decisionCount, onRetry, onReview, onExit, canRetry = true }) {
  audio.good();
  const passed = result.passed;
  const body = `
    <div style="text-align:center;margin:6px 0 4px">
      <div style="font-size:12px;letter-spacing:.18em;color:#94a3b8">FINAL SCORE</div>
      <div style="font-size:56px;font-weight:800;color:${passed ? '#4ade80' : '#fbbf24'};line-height:1.15">${result.total}%</div>
      <span class="status-badge ${passed ? 'clean' : 'isolated'}" style="margin-top:6px">
        <span class="dot"></span>${passed ? 'PASS' : 'REVIEW REQUIRED'}
      </span>
      <div style="font-size:12.5px;color:#94a3b8;margin-top:10px">
        Scenario decisions: ${result.scenarioEarned}/${result.scenarioMax} ·
        Knowledge check: ${result.quizEarned}/${result.quizMax} ·
        Decisions reviewed: ${decisionCount}
      </div>
    </div>
    ${passed
      ? `<p style="margin-top:14px"><b style="color:#fff">Key lessons reinforced:</b></p>
         <ul style="list-style:none;padding:0;margin-top:8px">${KEY_LESSONS.map((l) =>
           `<li style="font-size:13px;color:#cbd5e1;margin:5px 0">✓ ${l}</li>`).join('')}</ul>`
      : `<p style="margin-top:14px">Your score is below the 80% pass mark.
         Review the highlighted topics and try again — your scenario decisions
         from this run are kept.</p>`}
  `;
  const choices = [];
  if (!passed) choices.push({ label: 'REVIEW LESSONS', kind: 'btn-secondary', onClick: onReview });
  if (canRetry) choices.push({ label: passed ? 'RETAKE' : 'RETRY QUIZ', kind: passed ? 'btn-secondary' : 'btn-primary', onClick: onRetry });
  choices.push({ label: 'EXIT COURSE', kind: 'btn-ghost', onClick: onExit });
  panel({
    title: passed ? 'RANSOMWARE RESPONSE COMPLETE' : 'RANSOMWARE RESPONSE — REVIEW REQUIRED',
    body,
    choices,
    ariaLabel: `Final score ${result.total} percent. ${passed ? 'Pass' : 'Review required'}.`,
  });
}
