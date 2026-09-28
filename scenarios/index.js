/**
 * Step registry. Steps are plain data + enter(ctx) hooks; the engine walks
 * this list in order. New scenarios can be added by dropping a module here.
 */
import { step as s00 } from './step00-introduction.js';
import { step as s01 } from './step01-call.js';
import { step as s02 } from './step02-it-request.js';
import { step as s03 } from './step03-inbox.js';
import { step as s04 } from './step04-phishing.js';
import { step as s05 } from './step05-warning.js';
import { step as s06 } from './step06-attack.js';
import { step as s07 } from './step07-ransom.js';
import { step as s08 } from './step08-containment.js';
import { step as s09 } from './step09-clean-device.js';
import { step as s10 } from './step10-credentials.js';
import { step as s11 } from './step11-sender.js';
import { step as s12 } from './step12-report.js';
import { step as s13 } from './step13-debrief.js';
import { step as s14 } from './step14-quiz.js';

export const STEPS = [
  s00, s01, s02, s03, s04, s05, s06, s07, s08, s09, s10, s11, s12, s13, s14,
];
