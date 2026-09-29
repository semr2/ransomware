# Build a Production-Ready 3D Interactive SCORM Cybersecurity Training

Build a **production-ready SCORM 1.2 cybersecurity awareness course** called:

# **Ransomware Response: The First 60 Minutes**

The experience must **NOT** be a traditional slide-based e-learning course.

It must be an **interactive 3D cybersecurity simulation** where the learner takes the role of **Alice**, an employee at a fictional company, and responds to a simulated ransomware incident during the first 60 minutes of an attack.

The learner should learn primarily through:

* exploration
* interaction
* observation
* decision-making
* simulated consequences
* feedback
* incident-response actions

The experience should feel like:

> **"I am an employee dealing with a real security incident and I need to make the right decisions."**

It should NOT feel like:

> "I am clicking through PowerPoint slides."

All companies, people, domains, systems, credentials, emails, and scenarios must be fictional.

Never interact with the learner's real operating system, files, network, credentials, or applications.

---

# 1. Core Learning Objectives

The course must teach the learner to:

1. Recognize a social-engineering pretext from an unsolicited "IT" phone call.
2. Identify phishing indicators such as:

   * urgency
   * unexpected attachments
   * suspicious sender domains
   * lookalike domains
   * false authority
3. Never dismiss, bypass, or override a security warning because another person instructed them to.
4. Contain an infected computer by cutting the network connection first.
5. Understand that powering off is a fallback when network isolation cannot otherwise be achieved.
6. Use a known-clean computer for recovery and reporting activities.
7. Handle compromised credentials safely.
8. Understand why ransomware payment does not guarantee recovery.
9. Refuse ransom payment and follow the organization's incident-response process.
10. Report the incident with useful and accurate information.
11. Preserve evidence and avoid unnecessary actions such as deleting the phishing email or restarting the infected machine.
12. Understand the importance of MFA and unique passwords.

---

# 2. Experience Format

Build the course as a **3D interactive simulation with HTML/CSS interface overlays**.

Preferred technology:

**Three.js + TypeScript**

Alternative:

**Babylon.js**

The application must run entirely in a modern browser.

The course must eventually be packaged as:

```text
SCORM ZIP
```

and uploaded to an LMS.

The application must NOT require:

* backend servers
* APIs
* internet access
* external websites
* external authentication
* external JavaScript CDNs at runtime

All required assets must be packaged locally.

---

# 3. Fictional Company

Create a fictional company.

Example:

**Northstar Dynamics**

The company must not resemble or impersonate a real organization.

Use fictional:

* company name
* employee names
* IT department
* email addresses
* domains
* ticketing system
* applications
* credentials

Example fictional domain:

```text
northstar-training.test
```

Do not use real corporate domains.

---

# 4. Learner Character

The learner plays:

**Alice**

Role:

**Employee**

Alice works at the fictional company.

The learner should experience the incident from Alice's perspective.

Do not require the learner to create a character.

---

# 5. 3D Environment Architecture

Create three reusable 3D environments.

## Environment 1 ? Open-Plan Office

The office should contain:

* Alice's desk
* monitor
* keyboard
* mouse
* docking station
* laptop/desktop
* mobile phone
* second computer
* chair
* desk accessories
* office walls
* windows
* lighting
* background office elements

The environment should be realistic but lightweight.

The main interactive objects are:

```text
Monitor
Phone
Second Computer
Desk Hardware
```

Additional decorative objects do not need interaction.

---

## Environment 2 ? Monitor Close-Up

When Alice interacts with the primary computer:

Smoothly transition the camera toward the monitor.

The monitor should fill most of the learner's view.

The 3D scene remains visible around the screen where appropriate.

Render the computer interface using:

**HTML/CSS/TypeScript overlays**

Do NOT attempt to model every computer window as 3D geometry.

The monitor close-up must support:

* email application
* file manager
* antivirus warning
* ransomware screen
* login screen
* browser
* ticketing portal

---

## Environment 3 ? Desk Hardware View

Create a close-up of the infected workstation.

The camera should show:

* laptop/desktop
* docking station
* Ethernet/network cable
* power button

The learner must be able to identify and interact with the network cable and power control.

---

# 6. Visual Style

Use a polished modern corporate cybersecurity aesthetic.

The environment should feel professional and believable.

Use:

* realistic materials
* soft lighting
* subtle shadows
* ambient lighting
* monitor glow
* restrained animations
* clean UI

Do not make the environment excessively dark or horror-themed.

This is an employee cybersecurity awareness course, not a hacker game.

---

# 7. Course Interface

Create a persistent instructional UI.

Display:

```text
RANSOMWARE RESPONSE

Step 3 of 14

Objective:
Inspect the unexpected security update email.
```

Include:

* current step
* objective
* progress indicator
* interaction hints
* continue button when appropriate
* accessibility controls
* optional hint button

The UI must not obscure important interactive objects.

---

# 8. Course Progress

The course contains:

```text
Step 0 ? Introduction
Step 1 ? Unknown Call
Step 2 ? Urgent Request
Step 3 ? Inbox Check
Step 4 ? Read the Email
Step 5 ? Antivirus Warning
Step 6 ? The Attack
Step 7 ? Ransom Decision
Step 8 ? Containment
Step 9 ? Clean Computer
Step 10 ? Credentials
Step 11 ? Fake Email
Step 12 ? Report Incident
Step 13 ? Debrief
Step 14 ? Knowledge Check
```

The learner must progress through these steps.

---

# 9. Step 0 ? Introduction

Scene:

**Open-plan office**

Start with a slow camera movement establishing the environment.

Show Alice's workstation.

Display:

```text
Ransomware Response:
The First 60 Minutes

You are Alice, an employee at Northstar Dynamics.

An unexpected security incident is about to unfold.

Your decisions will determine how effectively you respond.
```

Explain basic controls.

Then:

**START SIMULATION**

When clicked, begin Step 1.

---

# 10. Step 1 ? Unknown Phone Call

Scene:

**Open-plan office**

Alice's mobile phone begins ringing.

Caller ID:

```text
UNKNOWN CALLER
```

Animate:

* phone vibration
* screen lighting
* ringtone

Provide:

```text
ANSWER

IGNORE
```

The learner can choose either.

Important:

**Answering the phone itself is NOT considered the mistake.**

If the learner answers:

Continue to the conversation.

If the learner ignores:

Provide a short explanation and continue appropriately.

Track the decision.

Interaction ID:

```text
call_response
```

---

# 11. Step 2 ? Urgent IT Request

Scene:

**Phone close-up**

The caller claims:

> "This is IT support. We are responding to a security issue. An urgent security update email will arrive on your computer. Please install it immediately."

The caller creates urgency and authority pressure.

Provide:

```text
COMPLY

ASK TO VERIFY

HANG UP AND CALL IT BACK
```

Correct behavior:

```text
HANG UP AND CALL IT BACK
```

The learner must understand that the safest verification method is using a **known trusted IT contact method**, not a phone number supplied by the caller.

Feedback should explain:

* urgency is a social-engineering technique
* caller ID cannot establish identity
* employees should verify unexpected requests independently

Interaction ID:

```text
it_verification
```

---

# 12. Step 3 ? Inbox Check

Scene:

**Monitor close-up**

Open the fictional email application.

A new message arrives.

Email:

```text
From:
IT Support <it-support@northstarr-security-training.test>

Subject:
URGENT: Security Update Required

Priority:
HIGH
```

The email contains an attachment:

```text
Security_Update.exe
```

Provide:

```text
OPEN EMAIL

FLAG AS SUSPICIOUS
```

Do not immediately reveal the correct answer.

The learner should inspect the email.

Interaction ID:

```text
email_open
```

---

# 13. Step 4 ? Inspect the Phishing Email

Display a realistic fictional email interface.

Example:

```text
From:
IT Support

it-support@northstarr-security-training.test

Subject:
URGENT: Security Update Required

Alice,

Your workstation requires an immediate security update.

Failure to install this update within 15 minutes may result in
account suspension.

Please open the attached security update immediately.

Attachment:
Security_Update.exe
```

Make these elements interactive:

### Sender address

### Subject

### Urgency language

### Attachment

### Greeting

When the learner clicks a hotspot, display a short explanation.

Red flags include:

* unexpected email
* urgent language
* threat of account suspension
* executable attachment
* suspicious sender domain
* request to bypass normal IT procedures

Track:

```text
sender_inspection
attachment_inspection
urgency_inspection
```

Do not require the learner to inspect every hotspot to continue.

---

# 14. Step 5 ? Antivirus Warning

If the learner opens the simulated attachment:

Do NOT execute a real file.

Create a simulated file-manager interaction.

Display:

```text
Security_Update.exe
```

Then show a simulated security warning:

```text
SECURITY WARNING

This file has been identified as potentially malicious.

Threat detected:
Suspicious executable behavior

Recommended action:
Do not open this file.
```

Options:

```text
DISMISS

DELETE

REPORT
```

Correct behavior:

```text
DELETE
```

or:

```text
REPORT
```

The learner must understand:

> Never override a security warning simply because someone told you the file is legitimate.

Interaction ID:

```text
attachment_warning
```

---

# 15. Step 6 ? Ransomware Attack Simulation

If the learner made the unsafe choice, trigger a controlled ransomware simulation.

IMPORTANT:

This is ONLY a visual simulation.

Never:

* execute malware
* create malware
* encrypt real files
* modify real files
* access the host filesystem
* access the host network
* execute downloaded code

The simulation should visually show:

```text
File processing...
```

Then fictional files appear to change state.

Example:

```text
Finance_Q3.xlsx
Customer_List.xlsx
Project_Report.docx
HR_Policies.pdf
```

Show simulated filenames such as:

```text
Finance_Q3.xlsx.locked
Customer_List.xlsx.locked
```

Then transition to a ransom note.

Use visual effects:

* subtle screen glitch
* warning overlay
* notification animation
* file status changes
* camera shake only if accessibility settings permit

Do not make the animation excessive.

Display:

```text
SIMULATION

Your workstation has been affected by ransomware.

This is a training simulation.
No real files have been modified.
```

Interaction:

```text
CONTINUE
```

---

# 16. Step 7 ? Ransom Decision

Display a fictional ransom note.

Example:

```text
YOUR FILES ARE UNAVAILABLE

Your files have been encrypted.

Payment is requested in cryptocurrency.

Do not contact law enforcement.
Do not shut down the computer.
```

The learner receives:

```text
PAY

NEGOTIATE

REFUSE
```

Correct choice:

```text
REFUSE
```

Explain:

* payment does not guarantee recovery
* attackers may not provide a working recovery key
* payment does not remove the underlying compromise
* payment can fund criminal activity
* employees should follow the organization's incident-response process

Interaction ID:

```text
ransom_decision
```

---

# 17. Step 8 ? Containment

This is a major learning interaction.

Scene:

**Desk Hardware View**

The infected computer is showing the ransom screen.

The learner cannot access network settings.

The learner sees:

```text
NETWORK CABLE
POWER BUTTON
```

Options:

```text
UNPLUG NETWORK CABLE

POWER OFF COMPUTER

CALL IT FIRST

WALK AWAY
```

Correct primary action:

```text
UNPLUG NETWORK CABLE
```

Explain:

> Cutting the network connection can help prevent further spread while preserving the running system for investigation.

Fallback:

```text
POWER OFF COMPUTER
```

is accepted if the network connection cannot otherwise be disconnected.

Incorrect:

```text
CALL IT FIRST
```

when the machine remains connected and the incident is actively spreading.

Incorrect:

```text
WALK AWAY
```

The learner must visually interact with the network cable.

When isolated:

Change the infected computer badge to:

```text
COMPROMISED
ISOLATED
```

Use a red status indicator.

Interaction ID:

```text
containment
```

---

# 18. Step 9 ? Move to Clean Computer

Return to:

**Open-plan office**

The learner sees the second computer.

Display:

```text
A known-clean computer is available.

Use the clean device for further recovery and reporting actions.
```

The second computer should display:

```text
CLEAN DEVICE
```

with a green status badge.

Interaction:

```text
USE CLEAN COMPUTER
```

The learner must click the second PC.

Interaction ID:

```text
clean_device
```

---

# 19. Step 10 ? Clean Computer Login

Display a fictional login interface.

Use:

```text
NOVA Secure Desktop
```

Do NOT copy Windows/macOS/Linux interfaces.

Use a fictional design.

For the training credential, use:

```text
Training#2026
```

This is explicitly a fictional training credential.

Never request a learner's real password.

After login, ask:

```text
What should Alice do about the compromised account password?
```

Options:

```text
Reuse the old password

Change the password from the clean device

Write the password on a sticky note

Keep using the old password until IT responds
```

Correct:

```text
CHANGE THE PASSWORD FROM THE CLEAN DEVICE
```

Explain:

* credentials on a compromised computer may be exposed
* use a known-clean device
* do not reuse passwords
* enable MFA where available
* never type real credentials into the training simulation

Track only:

```text
correct
incorrect
```

NEVER store the typed password.

Interaction ID:

```text
second_pc_password
```

---

# 20. Step 11 ? Identify the Fake Sender Domain

Open the original email on the clean computer.

Display the sender:

```text
it-support@northstarr-security-training.test
```

The legitimate fictional company domain is:

```text
northstar-training.test
```

Create a deliberate lookalike difference.

The learner must identify the suspicious part of the sender address.

Make the suspicious characters clickable.

Example:

```text
northstarr-security-training.test
          ^
       suspicious
```

Do not simply highlight the answer automatically.

Feedback:

> Display names can be faked. Always inspect the actual sender address and verify unexpected requests through a trusted channel.

Interaction ID:

```text
sender_check
```

---

# 21. Step 12 ? Incident Reporting

Open a fictional internal ticketing portal.

Example:

```text
Northstar Security Operations Portal
```

Display an incident form.

Fields:

```text
Incident Type

Approximate Time

What happened?

What did you click?

What happened afterward?

Containment action taken

Attach evidence
```

Incident type:

```text
Ransomware / Malware
```

The learner should provide/select:

```text
Received suspicious IT phone call
Received urgent phishing email
Opened suspicious attachment
Security warning appeared
Files became unavailable
Network cable disconnected
```

Provide:

```text
ATTACH ORIGINAL EMAIL
```

Correct behavior:

Attach/preserve the email as evidence.

Do not delete it.

Do not restart the infected computer unnecessarily.

Score the report based on completeness.

Interaction ID:

```text
ticket_report
```

---

# 22. Step 13 ? Debrief

Return to a neutral version of the office.

Display:

# Security Incident Debrief

Show the learner's decisions.

Example:

```text
Phone call
? Verified independently

Phishing email
? Identified suspicious indicators

Security warning
? Did not override warning

Ransom decision
? Refused payment

Containment
? Network isolated

Clean device
? Used clean computer

Credential handling
? Changed affected password

Incident report
? Preserved evidence and reported incident
```

If the learner made mistakes, display them constructively.

Example:

```text
Area to review

You dismissed the security warning before recognizing the risk.

Remember:
Security warnings should never be bypassed because another person
claims the file is legitimate.
```

Do not shame the learner.

---

# 23. Step 14 ? Knowledge Check

Create a 5-question assessment.

Each question must have 4 answer choices.

Topics:

1. Vishing / fake IT caller
2. Sender-domain verification
3. Security warnings
4. Ransomware containment
5. Password handling after compromise

Each question must contain:

```text
question
choices
correct_answer
explanation
interaction_id
```

The learner must receive a score.

Pass mark:

```text
80%
```

Allow retry.

---

# 24. Scoring System

Use a normalized score from 0?100.

Scored decisions:

```text
it_verification
attachment_warning
ransom_decision
containment
second_pc_password
sender_check
ticket_report
quiz
```

Recommended weighting:

```text
Scenario decisions: 70%
Knowledge check:    30%
```

Do not create a complicated gamification system.

The goal is learning, not competition.

Display:

```text
Final Score: 88%

PASS
```

or:

```text
Final Score: 64%

REVIEW REQUIRED
```

---

# 25. Decision Feedback

Every major decision must have immediate contextual feedback.

For correct decisions:

```text
GOOD DECISION

You verified the request using a trusted channel.
```

For incorrect decisions:

```text
NOT THE SAFEST CHOICE

This action increased the risk of the attack.

Why:
...
```

Then allow the learner to continue.

Do not permanently block course completion because of one incorrect decision.

---

# 26. Interaction Tracking

Create a reusable interaction-tracking system.

Track meaningful actions such as:

```text
call_response
it_verification
email_open
sender_inspection
urgency_inspection
attachment_inspection
attachment_warning
ransom_decision
containment
clean_device
second_pc_password
sender_check
ticket_report
quiz_question_1
quiz_question_2
quiz_question_3
quiz_question_4
quiz_question_5
course_complete
```

Each interaction should record only appropriate training data.

Never record:

* real passwords
* personal credentials
* host information
* real filesystem paths
* real network information

---

# 27. SCORM 1.2

Implement real SCORM 1.2 integration.

Create:

```text
js/scorm.js
```

The adapter must support:

```text
LMSInitialize
LMSFinish
LMSGetValue
LMSSetValue
LMSCommit
```

Track:

```text
cmi.core.lesson_status
cmi.core.score.raw
cmi.core.session_time
cmi.suspend_data
cmi.interactions.n.id
cmi.interactions.n.student_response
cmi.interactions.n.result
```

Use:

```text
incomplete
passed
failed
```

for lesson status.

Do not fake SCORM calls.

The course must work without SCORM during local development by using a mock adapter.

---

# 28. Suspend Data

The learner must be able to resume the course.

Store a compact state object.

Conceptually:

```json
{
  "version": 1,
  "currentStep": 8,
  "completedSteps": [0,1,2,3,4,5,6,7],
  "choices": {
    "it_verification": "hang_up_call_back",
    "attachment_warning": "report",
    "ransom_decision": "refuse",
    "containment": "network_isolated"
  },
  "score": 72,
  "quizScore": 0
}
```

Compress/minimize the actual serialized representation where necessary.

Do NOT put:

* 3D models
* textures
* large HTML
* audio
* videos

into `suspend_data`.

---

# 29. Course State Manager

Create a reusable state-management system.

Example:

```text
CourseState
 ??? currentStep
 ??? completedSteps
 ??? decisions
 ??? score
 ??? quiz
 ??? devices
 ??? reporting
```

The state manager must be independent from the 3D rendering engine.

The course should be able to switch between:

```text
3D Mode
```

and:

```text
Accessible 2D Mode
```

without changing the learning state.

---

# 30. Scenario Engine

Do NOT hard-code every interaction into `index.html`.

Create reusable scenario definitions.

Conceptually:

```text
Scenario
 ??? id
 ??? title
 ??? environment
 ??? objective
 ??? dialogue
 ??? interactiveObjects
 ??? choices
 ??? correctChoice
 ??? feedback
 ??? score
 ??? completionCondition
 ??? scormInteraction
```

This should allow additional cybersecurity scenarios to be added later.

---

# 31. 3D Interaction System

Create a reusable interaction system.

Interactive objects should support:

```text
hover
focus
click
keyboard activation
interaction prompt
highlight
description
```

Example:

```text
InteractiveObject

id: network_cable

label: Network Cable

action: isolate_network

description:
"Disconnect the infected workstation from the network."
```

Use raycasting or an equivalent interaction mechanism.

---

# 32. Camera System

Create reusable camera transitions.

Examples:

```text
office ? monitor
monitor ? office
office ? hardware
hardware ? office
office ? second computer
```

Transitions should be smooth.

Avoid excessive camera movement.

Respect:

```text
prefers-reduced-motion
```

If reduced motion is enabled:

Use:

```text
instant fade
minimal camera movement
```

instead of cinematic movement.

---

# 33. Monitor Interaction

The monitor should be the primary interaction gateway.

When the learner approaches or selects it:

Display:

```text
INTERACT

Use Computer
```

When activated:

```text
Camera moves toward monitor
        ?
Monitor fills viewport
        ?
Interactive desktop appears
```

When exiting:

```text
Exit Computer
        ?
Return to 3D office
```

---

# 34. Fictional Operating System

Create a fictional desktop called:

# NOVA Desktop

It should contain:

* Email
* Files
* Security Center
* Browser
* Ticketing
* Settings
* Trash

Use a unique design.

Do NOT copy:

* Windows
* macOS
* Ubuntu
* Chrome
* Outlook

exactly.

The interfaces can be familiar, but must be visually original.

---

# 35. Email Application

Create a functional simulated email client.

Features:

* inbox
* message list
* sender
* subject
* message body
* attachment
* suspicious sender
* inspection hotspots

The email must be completely local.

No real email system.

---

# 36. File Manager

Create a simulated file manager.

Show fictional files.

Example:

```text
Documents
 ??? Finance_Q3.xlsx
 ??? Customer_List.xlsx
 ??? Project_Report.docx

Downloads
 ??? Security_Update.exe
```

Opening the simulated malicious file must trigger the training simulation.

It must never execute an actual executable.

---

# 37. Ransomware Visualization

The ransomware visualization should be convincing but safe.

Show fictional files changing state.

Use an internal simulation state such as:

```text
file.status = "encrypted"
```

Never touch actual files.

Use fictional extensions such as:

```text
.locked
```

only inside the virtual UI.

---

# 38. Accessibility

Implement:

# Accessible Interaction Mode

The learner must be able to complete the entire course without mandatory 3D navigation.

Provide:

* keyboard navigation
* visible focus indicators
* semantic buttons
* ARIA labels where appropriate
* screen-reader-friendly descriptions
* captions
* text alternatives
* reduced-motion mode
* 2D fallback

The learning objectives and scoring must remain equivalent.

Keyboard controls should include:

```text
Tab
Shift + Tab
Enter
Space
Escape
Arrow keys where appropriate
```

Do not make mouse movement mandatory.

---

# 39. Audio

Audio is optional but recommended for important dialogue.

If audio is used:

Every spoken line must also have captions.

Provide:

```text
Mute
Volume
Captions
```

The course must remain fully understandable with audio disabled.

---

# 40. Hint System

Create a reusable hint system.

If the learner remains inactive for a configurable amount of time:

Display a subtle hint.

Example:

```text
Hint

This request claims to come from IT.

How could you verify the caller's identity?
```

Do not immediately reveal the correct answer.

Hints should encourage observation and reasoning.

---

# 41. Loading Screen

Create a professional loading experience.

Example:

```text
NORTHSTAR SECURITY TRAINING

Preparing simulation...

Loading workstation
?????????????????? 78%

Initializing environment...
```

Then:

```text
SIMULATION READY

Enter Simulation
```

All assets should be loaded before the learner enters the relevant scenario.

---

# 42. Performance

Performance is critical.

The final SCORM package must run smoothly inside an LMS.

Optimize:

* GLB models
* textures
* JavaScript
* CSS
* draw calls
* materials
* lighting
* animations
* audio

Use:

* GLB/GLTF
* compressed textures where practical
* lazy loading
* asset caching
* optimized geometry
* minimal draw calls
* reusable materials

Do not load every scene simultaneously.

Load only the assets required for the current environment.

---

# 43. Package Size

Target:

```text
< 50 MB
```

Preferably significantly below this when possible.

Do not include unnecessary:

* source assets
* development files
* unused models
* duplicate textures
* test recordings
* node_modules

inside the final SCORM ZIP.

---

# 44. Project Architecture

Use a clean architecture similar to:

```text
ransomware-response-scorm/
?
??? index.html
??? imsmanifest.xml
??? README.md
?
??? css/
?   ??? global.css
?   ??? ui.css
?   ??? desktop.css
?   ??? accessibility.css
?
??? js/
?   ??? main.js
?   ??? scorm.js
?   ??? course-state.js
?   ??? scenario-engine.js
?   ??? scoring.js
?   ??? interactions.js
?   ??? accessibility.js
?   ??? quiz.js
?
??? scenes/
?   ??? office.js
?   ??? monitor.js
?   ??? hardware.js
?
??? scenarios/
?   ??? step00-introduction.js
?   ??? step01-call.js
?   ??? step02-it-request.js
?   ??? step03-inbox.js
?   ??? step04-phishing.js
?   ??? step05-warning.js
?   ??? step06-attack.js
?   ??? step07-ransom.js
?   ??? step08-containment.js
?   ??? step09-clean-device.js
?   ??? step10-credentials.js
?   ??? step11-sender.js
?   ??? step12-report.js
?   ??? step13-debrief.js
?   ??? step14-quiz.js
?
??? ui/
?   ??? desktop.js
?   ??? email.js
?   ??? file-manager.js
?   ??? ransom-screen.js
?   ??? login.js
?   ??? ticketing.js
?   ??? feedback.js
?   ??? debrief.js
?
??? assets/
?   ??? models/
?   ??? textures/
?   ??? audio/
?   ??? icons/
?
??? fallback/
    ??? accessible.html
```

Adapt the structure if the project architecture requires it, but keep responsibilities separated.

---

# 45. No Monolithic Code

Do NOT create one enormous JavaScript file.

Separate:

```text
3D rendering
UI
scenario logic
course state
SCORM
scoring
assessment
accessibility
```

Each system should have a clear responsibility.

---

# 46. Local Development

The course must run through a local HTTP server.

Do NOT require:

* internet access
* external APIs
* cloud services
* authentication

Example:

```text
http://localhost:8000
```

The project should not rely on:

```text
file:///
```

because ES modules and asset loading can fail under `file://`.

---

# 47. SCORM Mock Mode

When the course is running locally:

Provide a mock SCORM API.

Example:

```text
SCORM MODE: LOCAL MOCK
```

When running inside an LMS:

```text
SCORM MODE: LMS
```

The same course code must work in both modes.

---

# 48. Error Handling

Implement graceful error handling.

If:

* a 3D model fails
* audio fails
* SCORM API is unavailable
* browser storage fails
* a texture fails

the course must not completely crash.

Display a useful fallback where possible.

---

# 49. Security Requirements

The simulation itself must be safe.

NEVER:

* execute downloaded files
* create real malware
* encrypt real files
* modify the host OS
* access real credentials
* access browser cookies
* scan the local network
* make external network requests
* write arbitrary files
* launch system applications
* invoke shell commands

All attack behavior must exist entirely inside the fictional training environment.

---

# 50. Final Results Screen

At the end display:

```text
RANSOMWARE RESPONSE COMPLETE

Final Score
88%

PASS

Decisions reviewed:
14

Key lessons:
? Verify unexpected IT requests
? Inspect sender domains
? Never override security warnings
? Isolate the network
? Use a clean device
? Protect compromised credentials
? Preserve evidence
? Report quickly
? Do not rely on ransom payment
```

If failed:

```text
REVIEW REQUIRED

Your score is below 80%.

Review the highlighted topics and try again.
```

Provide:

```text
REVIEW
RETRY
```

---

# 51. Quiz Question Bank

Create at least these five questions.

## Question 1

An unknown caller claims to be IT and asks you to install an urgent security update.

What should you do?

A. Follow the instructions immediately
B. Ask the caller for their employee number
C. Hang up and contact IT through a trusted channel
D. Install the update and ask questions afterward

Correct:

```text
C
```

---

## Question 2

What is an important phishing indicator?

A. A normal company logo
B. A lookalike sender domain
C. A short email
D. A professional signature

Correct:

```text
B
```

---

## Question 3

Your security software warns that an attachment may be malicious.

What should you do?

A. Disable the warning
B. Open the file anyway
C. Delete/report the file according to procedure
D. Ask the sender to resend it

Correct:

```text
C
```

---

## Question 4

A workstation appears infected with ransomware and is still connected to the network.

What is the primary containment action?

A. Continue working
B. Disconnect the network connection
C. Restart repeatedly
D. Pay the ransom

Correct:

```text
B
```

---

## Question 5

You suspect your password may have been exposed on an infected computer.

What should you do?

A. Continue using it
B. Reuse it on another account
C. Change it from a known-clean device and use MFA where available
D. Write it on a sticky note

Correct:

```text
C
```

---

# 52. SCORM Manifest

Create a valid SCORM 1.2:

```text
imsmanifest.xml
```

Requirements:

* valid XML
* correct SCORM 1.2 namespaces
* single SCO
* correct launch file
* all required files included
* no invalid external dependencies
* LMS-compatible resource declaration

The manifest must be tested using a SCORM validator and SCORM Cloud.

---

# 53. Testing

Test in this order:

## Test 1 ? Browser

Verify:

* course loads
* 3D scene loads
* monitor interaction works
* desktop works
* scenarios work
* scoring works
* quiz works

## Test 2 ? Keyboard

Verify:

* every important interaction is keyboard accessible
* focus is visible
* no keyboard traps exist

## Test 3 ? Reduced Motion

Verify:

```text
prefers-reduced-motion
```

changes camera transitions appropriately.

## Test 4 ? Resume

Start the course.

Complete several steps.

Close the course.

Reopen it.

Verify:

```text
currentStep
decisions
score
completedSteps
```

are restored.

## Test 5 ? SCORM Cloud

Upload the ZIP.

Verify:

* import succeeds
* launch succeeds
* completion reports
* score reports
* interactions report
* resume works

## Test 6 ? Target LMS

Test the final ZIP in the target LMS.

---

# 54. Automated QA

Where practical, use browser automation such as Playwright.

Create tests for:

```text
course loads
start button works
monitor interaction
desktop opens
email opens
phishing decision
security warning
ransom decision
network isolation
clean device
credential decision
sender inspection
ticket submission
debrief
quiz
completion
resume
keyboard navigation
```

The course should not have uncaught JavaScript errors.

---

# 55. Development Order

Build incrementally.

## Phase 1

Project architecture.

## Phase 2

SCORM foundation and mock API.

## Phase 3

3D office environment.

## Phase 4

Monitor interaction and camera system.

## Phase 5

NOVA Desktop.

## Phase 6

Email application.

## Phase 7

Steps 1?5.

## Phase 8

Ransomware simulation and Steps 6?8.

## Phase 9

Clean computer and credential handling.

## Phase 10

Sender verification and reporting portal.

## Phase 11

Debrief and assessment.

## Phase 12

Accessibility mode.

## Phase 13

SCORM resume and interaction tracking.

## Phase 14

Performance optimization.

## Phase 15

Automated QA.

## Phase 16

SCORM packaging and validation.

Do not move to the next phase while the previous phase has obvious functional errors.

---

# 56. Agent-Friendly Development

If using multiple coding agents, keep responsibilities separated.

Recommended agents:

```text
training-architect
scenario-designer
3d-engineer
ui-engineer
scorm-engineer
assessment-engineer
accessibility-engineer
qa-engineer
performance-engineer
```

The architecture must allow these agents to work independently.

For example:

```text
3D Engineer
    ?
scenes/

UI Engineer
    ?
ui/

Scenario Engineer
    ?
scenarios/

SCORM Engineer
    ?
js/scorm.js

QA Engineer
    ?
tests/
```

Do not allow different agents to independently rewrite shared core files without coordination.

---

# 57. Code Quality

Write production-quality code.

Requirements:

* clear naming
* modular architecture
* comments where useful
* no dead code
* no fake functionality
* no placeholder buttons presented as complete features
* no console errors
* no hard-coded secrets
* no external runtime dependencies
* graceful failure handling

Do not claim a feature is complete until it actually works.

---

# 58. Definition of Done

The project is complete ONLY when:

* the learner can enter the 3D office
* the learner can interact with the workstation
* the monitor opens the fictional desktop
* the phone interaction works
* the social-engineering scenario works
* the phishing email is interactive
* the security warning is interactive
* the ransomware event is simulated safely
* the ransom decision works
* the learner can isolate the infected computer
* the clean computer works
* credential handling works without storing real passwords
* sender-domain inspection works
* the incident-reporting form works
* the debrief works
* the five-question assessment works
* scoring works
* pass/fail works
* SCORM tracking works
* SCORM resume works
* keyboard navigation works
* accessible 2D mode works
* reduced-motion mode works
* the SCORM ZIP imports successfully
* the course launches successfully in SCORM Cloud
* there are no critical JavaScript errors
* the final package remains reasonably small
* all attack behavior is safely simulated inside the browser

The final experience must feel like a **realistic interactive ransomware-response exercise**, not a collection of slides or static HTML pages.

Build the course as a reusable architecture so that future cybersecurity simulations can reuse the same:

```text
3D engine
desktop system
scenario engine
interaction system
state manager
scoring engine
SCORM adapter
accessibility system
```

without rebuilding the entire application.
