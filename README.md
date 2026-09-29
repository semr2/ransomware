# Ransomware Response: The First 60 Minutes

A production-ready **SCORM 1.2 cybersecurity-awareness course** built as an
**interactive 3D simulation**. The learner plays **Alice**, an employee at the
fictional company **Northstar Dynamics**, and responds to a simulated ransomware
incident — from the social-engineering phone call through containment,
credential handling, and incident reporting.

> Everything in the simulation is fictional and browser-contained. No real
> files, credentials, networks, or systems are ever touched. All "attack"
> behavior is a purely visual simulation inside the training UI.

## Quick start (local development)

ES modules require HTTP, so serve the folder instead of opening `index.html`
directly:

```bash
cd ransomware
python3 -m http.server 8000
# open http://localhost:8000
```

With no LMS present the course runs against a built-in **SCORM mock adapter**
(header shows `SCORM MODE: LOCAL MOCK`); inside an LMS it uses the real
SCORM 1.2 runtime API (`SCORM MODE: LMS`). Same code, zero changes.

## Package for an LMS

Build the SCORM ZIP (IMS root at top level, no dev files):

```bash
zip -r ransomware-response-scorm.zip \
  imsmanifest.xml index.html css js lib scenes scenarios ui
```

Import the ZIP into any SCORM 1.2 LMS (or SCORM Cloud) as a single SCO.

## What's inside

| Path | Responsibility |
|---|---|
| `index.html` | DOM shell (header, loading screen, a11y panel, overlay roots) |
| `js/main.js` | Bootstrap: environment selection, resume flow, error surface |
| `js/scenario-engine.js` | Step lifecycle, decisions → state + SCORM, idle hints |
| `js/course-state.js` | Durable learning state; SCORM `suspend_data` resume |
| `js/scorm.js` | Real SCORM 1.2 adapter + localStorage-backed mock |
| `js/scoring.js` | 70/30 weighting (decisions/quiz), pass mark 80 |
| `js/interactions.js` | Accessible interactive-object system (both modes) |
| `js/quiz.js`, `js/accessibility.js`, `js/audio.js` | Assessment, a11y prefs, sound |
| `scenes/office.js` | 3D office (Three.js, fully procedural — no model assets) |
| `scenes/env2d.js` | Accessible 2D fallback of the same office |
| `scenarios/step00…step14.js` | The 15 story steps (data + `enter(ctx)` hooks) |
| `ui/` | NOVA Desktop, email, file manager, ransom screen, login, ticketing, phone, feedback, debrief |
| `css/` | global / ui / desktop / accessibility styles |

The **accessible 2D mode** is built into the app (Accessibility → *Accessible
2D mode*, or automatic when WebGL is unavailable) rather than shipped as a
separate `fallback/` page — the learning state, decisions, and scoring are
identical in both modes.

## Course flow

Introduction → Unknown call → Urgent "IT" request → Inbox → Phishing
inspection → Security warning → (simulated attack) → Ransom decision →
Containment → Clean device → Credentials → Lookalike-domain check → Incident
report → Debrief → 5-question knowledge check.

Scoring: 7 scenario decisions × 10 pts + 5 quiz questions × 6 pts = 100.
Pass mark **80**. First attempt counts; incorrect choices never block
completion. Progress resumes from `cmi.suspend_data` on reopen.

## Architecture notes

* **No external runtime dependencies, CDNs, or network calls.** Three.js is
  bundled locally in `lib/`; all geometry is procedural, so there are no model
  or texture assets and the package stays small (~1 MB).
* New scenarios can be added by dropping a step module into `scenarios/` and
  registering it in `scenarios/index.js` — no engine changes needed.
* The state manager is independent of rendering, which is what allows the
  3D ↔ 2D switch without touching learning state.
* Reduced motion (`prefers-reduced-motion` or the a11y panel) swaps cinematic
  camera moves for instant fades and disables decorative animation.
