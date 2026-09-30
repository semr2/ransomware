/**
 * Accessible 2D environment controller.
 * Implements the same interface as Env3D but renders a static stylized
 * illustration of the office. Interactive objects appear as DOM buttons
 * (rendered by InteractionSystem) so the entire course is completable
 * without 3D navigation, mouse or otherwise.
 */

const ILLUSTRATION = `
<svg class="office-illus" viewBox="0 0 880 330" role="img"
     aria-label="Illustration of the Northstar Dynamics open-plan office: Alice's workstation, a clean laptop desk and background desks.">
  <defs>
    <linearGradient id="wall-g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#22364f"/><stop offset="1" stop-color="#182a44"/>
    </linearGradient>
    <linearGradient id="win-g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#9fc6ef"/><stop offset="1" stop-color="#5e88b8"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="880" height="240" rx="16" fill="url(#wall-g)"/>
  <rect x="40" y="34" width="150" height="120" rx="8" fill="url(#win-g)" opacity=".85"/>
  <rect x="230" y="34" width="150" height="120" rx="8" fill="url(#win-g)" opacity=".7"/>
  <rect x="420" y="34" width="150" height="120" rx="8" fill="url(#win-g)" opacity=".85"/>
  <rect x="610" y="34" width="150" height="120" rx="8" fill="url(#win-g)" opacity=".7"/>
  <rect x="0" y="150" width="880" height="6" fill="#0f1d33" opacity=".6"/>

  <!-- background desks -->
  <g opacity=".45">
    <rect x="560" y="196" width="180" height="10" rx="3" fill="#6b7a92"/>
    <rect x="596" y="160" width="76" height="42" rx="4" fill="#111827"/>
    <rect x="598" y="163" width="72" height="34" rx="2" fill="#1e2d45"/>
    <rect x="130" y="196" width="180" height="10" rx="3" fill="#6b7a92"/>
    <rect x="166" y="160" width="76" height="42" rx="4" fill="#111827"/>
    <rect x="168" y="163" width="72" height="34" rx="2" fill="#1e2d45"/>
  </g>

  <!-- Alice workstation -->
  <g id="ws-group">
    <rect x="310" y="230" width="250" height="12" rx="4" fill="#8a6f52"/>
    <rect x="318" y="242" width="10" height="60" fill="#3c4658"/>
    <rect x="542" y="242" width="10" height="60" fill="#3c4658"/>
    <rect x="352" y="160" width="120" height="74" rx="6" fill="#111827"/>
    <rect id="ws-screen" x="356" y="164" width="112" height="62" rx="3" fill="#123a44"/>
    <text id="ws-label" x="412" y="200" fill="#60a5fa" font-family="system-ui" font-size="12" font-weight="800" text-anchor="middle">WINDOWS 11</text>
    <rect x="480" y="224" width="46" height="8" rx="3" fill="#2b3444"/>
    <rect x="352" y="236" width="60" height="14" rx="3" fill="#d7dce5"/>
    <rect x="426" y="238" width="12" height="10" rx="4" fill="#d7dce5"/>
    <rect id="ws-phone" x="508" y="214" width="16" height="26" rx="4" fill="#2b3444"/>
    <g id="ws-phone-alert" display="none" aria-hidden="true">
      <path d="M527 215q7 6 0 12M530 212q11 9 0 18" fill="none" stroke="#f87171" stroke-width="1.5" stroke-linecap="round"/>
      <text x="536" y="222" fill="#fecaca" font-family="system-ui" font-size="7" font-weight="800">UNKNOWN</text>
      <text x="536" y="231" fill="#fecaca" font-family="system-ui" font-size="7" font-weight="800">CALLER</text>
    </g>
    <rect id="ws-cable" x="548" y="242" width="8" height="60" fill="#1f2937"/>
    <circle id="ws-port" cx="552" cy="306" r="5" fill="#4ade80"/>
  </g>

  <!-- clean laptop desk -->
  <g id="pc-group">
    <rect x="620" y="236" width="170" height="10" rx="4" fill="#8a6f52"/>
    <rect x="628" y="246" width="8" height="56" fill="#3c4658"/>
    <rect x="774" y="246" width="8" height="56" fill="#3c4658"/>
    <rect id="pc-base" x="664" y="228" width="72" height="8" rx="3" fill="#2b3444"/>
    <rect id="pc-lid" x="668" y="192" width="64" height="40" rx="4" fill="#111827"/>
    <rect id="pc-screen" x="671" y="195" width="58" height="34" rx="2" fill="#0a1424"/>
    <text id="pc-label" x="700" y="215" fill="#c4b5fd" font-family="system-ui" font-size="7" font-weight="800" text-anchor="middle"></text>
  </g>

  <!-- Transparent hit areas make the illustrated office directly interactive.
       InteractionSystem gates each target to the objects needed by the step. -->
  <g class="office-hotspots" aria-label="Interactive office objects">
    <rect class="office-hotspot" data-object-id="monitor" x="340" y="150" width="195" height="102" rx="8" role="button" tabindex="0" aria-label="Workstation" />
    <rect class="office-hotspot" data-object-id="phone" x="500" y="208" width="32" height="40" rx="6" role="button" tabindex="0" aria-label="Mobile phone" />
    <rect class="office-hotspot" data-object-id="cable" x="536" y="238" width="28" height="72" rx="6" role="button" tabindex="0" aria-label="Network cable" />
    <rect class="office-hotspot" data-object-id="power_button" x="470" y="218" width="66" height="32" rx="6" role="button" tabindex="0" aria-label="Power button" />
    <rect class="office-hotspot" data-object-id="cleanpc" x="650" y="185" width="102" height="64" rx="8" role="button" tabindex="0" aria-label="Clean laptop" />
  </g>

  <!-- chairs -->
  <g fill="#233042">
    <rect x="400" y="292" width="52" height="10" rx="4"/>
    <rect x="398" y="268" width="8" height="26"/>
    <rect x="446" y="268" width="8" height="26"/>
    <rect x="690" y="292" width="52" height="10" rx="4"/>
    <rect x="688" y="268" width="8" height="26"/>
    <rect x="736" y="268" width="8" height="26"/>
  </g>
</svg>`;

export class Env2D {
  constructor(interactionSystem) {
    this.mode = '2d';
    this.sys = interactionSystem;
  }

  init() {
    const host = document.getElementById('scene-2d');
    if (host) host.innerHTML = ILLUSTRATION;
    host?.querySelectorAll('.office-hotspot').forEach((hotspot) => {
      const activate = () => this.sys.activate(hotspot.dataset.objectId);
      hotspot.addEventListener('click', activate);
      hotspot.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          activate();
        }
      });
    });
    this._els = {
      wsScreen: document.getElementById('ws-screen'),
      wsLabel: document.getElementById('ws-label'),
      wsPhone: document.getElementById('ws-phone'),
      wsPhoneAlert: document.getElementById('ws-phone-alert'),
      wsCable: document.getElementById('ws-cable'),
      wsPort: document.getElementById('ws-port'),
      pcScreen: document.getElementById('pc-screen'),
      pcLabel: document.getElementById('pc-label'),
    };
    return this;
  }

  dispose() {}

  setView() { /* static illustration — camera transitions are a no-op */ }

  setInteractive() { /* chips rendered by InteractionSystem */ }

  onActivate(id) { this.sys.activate(id); }

  setObjectState(id, st) {
    if (id === 'workstation') {
      if (st === 'compromised' || st === 'isolated') {
        this._els.wsScreen.setAttribute('fill', '#5c1116');
        this._els.wsLabel.textContent = '⚠ ENCRYPTED';
        this._els.wsLabel.setAttribute('fill', '#fca5a5');
      } else if (st === 'off') {
        this._els.wsScreen.setAttribute('fill', '#04060c');
        this._els.wsLabel.textContent = '';
      } else {
        this._els.wsScreen.setAttribute('fill', '#123a44');
        this._els.wsLabel.textContent = 'WINDOWS 11';
        this._els.wsLabel.setAttribute('fill', '#60a5fa');
      }
    }
    if (id === 'cable') {
      this._els.wsCable.style.display = st === 'unplugged' ? 'none' : 'block';
      this._els.wsPort.setAttribute('fill', st === 'unplugged' ? '#64748b' : '#4ade80');
    }
    if (id === 'cleanpc') {
      this._els.pcScreen.setAttribute('fill',
        st === 'login' ? '#0d1a30' : st === 'clean' ? '#123a44' : '#0a1424');
      this._els.pcLabel.textContent = st === 'clean' ? 'LINUX' : '';
    }
  }

  paintMonitor() { /* handled by setObjectState */ }

  ringPhone(on) {
    if (!this._els?.wsPhone) return;
    this._els.wsPhone.setAttribute('fill', on ? '#3b82f6' : '#2b3444');
    this._els.wsPhone.classList.toggle('ringing', on);
    this._els.wsPhoneAlert?.setAttribute('display', on ? 'inline' : 'none');
  }

  shake() { /* no motion in 2D mode by design */ }

  resize() {}
}
