// ==================== Floor Plan 3D Walkthrough Engine ====================
// Interactive WebGL 3D architectural house walkthrough models for all 10 floor plans.
// Supports 360° Orbit, First-Person Walkthrough, Room Teleport Waypoints,
// Day/Night Lighting, Dollhouse Cutaways, and Cinematic Auto-Tours.

import * as THREE from 'three';
import { dispatchHouseModel, getPlanDedicatedWaypoints } from './planArchitectures3D.js';

export class FloorPlan3DWalkthroughModal {
  constructor() {
    this.modalEl = null;
    this.canvasEl = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.currentPlan = null;
    this.allPlans = [];
    this.animId = null;
    this.clock = new THREE.Clock();

    // Interaction state
    this.cameraMode = 'orbit'; // 'orbit', 'fps', 'topdown', 'elevation'
    this.isMouseDown = false;
    this.prevMousePos = { x: 0, y: 0 };
    this.spherical = { radius: 18, theta: Math.PI / 4, phi: Math.PI / 3 };
    this.targetLookAt = new THREE.Vector3(0, 1.2, 0);

    // FPS state
    this.keys = { KeyW: false, KeyS: false, KeyA: false, KeyD: false, ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
    this.fpsPos = new THREE.Vector3(0, 1.6, 5);
    this.fpsRotation = { pitch: 0, yaw: 0 };

    // Auto-tour state
    this.isAutoTouring = false;
    this.tourProgress = 0;
    this.tourWaypoints = [];

    // Lighting state
    this.timeOfDay = 'day'; // 'day', 'sunset', 'night'
    this.directionalLight = null;
    this.ambientLight = null;
    this.pointLights = [];

    // House groups
    this.houseGroup = null;
    this.roofGroup = null;
    this.showRoof = false;

    // VR Stereoscopic Mode State
    this.isVrMode = false;
    this.stereoCamera = null;
    this.vrEyeSep = 0.064; // 64mm standard human IPD
    this.prevCameraModeBeforeVr = 'orbit';
    this.deviceOrientationHandler = null;
    this.gyroEnabled = true;
    this.initialAlpha = null;

    this.initModal();
    this.bindGlobalEvents();
  }

  initModal() {
    const existing = document.getElementById('floorPlan3DModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'floorPlan3DModal';
    modal.className = 'floorplan-3d-modal hidden';
    modal.innerHTML = `
      <div class="floorplan-3d-backdrop"></div>
      <div class="floorplan-3d-window">
        <!-- Top Control Bar -->
        <div class="floorplan-3d-header">
          <div class="flex-center" style="gap:10px;flex-wrap:wrap">
            <div class="floorplan-3d-badge">
              <i class="fas fa-cube text-primary"></i> 3D ARCHITECTURAL WALKTHROUGH
            </div>
            <h3 id="walkthroughPlanTitle" style="margin:0;font-size:1.15rem;font-weight:700;color:#fff">
              House Plan 3D Walkthrough
            </h3>
            <span id="walkthroughPlanFacing" class="badge badge-gold" style="font-size:0.75rem">East Facing</span>
            <div class="walkthrough-design-picker" style="display:flex;align-items:center;gap:6px;margin-left:8px">
              <label for="walkthroughPlanSelect" style="font-size:0.75rem;color:#94a3b8;font-weight:600;white-space:nowrap"><i class="fas fa-layer-group text-primary"></i> Design:</label>
              <select id="walkthroughPlanSelect" class="form-select form-select-sm" style="background:#0f172a;color:#f8fafc;border:1px solid rgba(56,189,248,0.4);border-radius:6px;padding:4px 8px;font-size:0.78rem;cursor:pointer;max-width:240px">
              </select>
            </div>
          </div>

          <div style="display:flex;align-items:center;gap:8px">
            <button id="btnToggleRoof" class="btn btn-ghost btn-sm" title="Toggle Roof / Dollhouse Cutaway">
              <i class="fas fa-home"></i> <span class="hide-mobile">Roof: Cutaway</span>
            </button>
            <button id="btnLightingToggle" class="btn btn-ghost btn-sm" title="Switch Day/Sunset/Night Lighting">
              <i class="fas fa-sun" style="color:var(--gold)"></i> <span class="hide-mobile">Daylight</span>
            </button>
            <button id="btnToggleVR" class="btn btn-ghost btn-sm" title="VR Stereoscopic Split-Screen Mode (Headset / Cardboard)">
              <i class="fas fa-vr-cardboard" style="color:#c084fc"></i> <span id="vrBtnLabel" class="hide-mobile">VR Headset</span>
            </button>
            <button id="btnAutoTour" class="btn btn-primary btn-sm" style="box-shadow:0 0 12px rgba(56,189,248,0.4)">
              <i class="fas fa-play"></i> <span>Auto Tour</span>
            </button>
            <button id="btnSnapshot" class="btn btn-ghost btn-sm" title="Capture HD Snapshot">
              <i class="fas fa-camera"></i>
            </button>
            <button id="btnClose3DWalkthrough" class="btn btn-ghost btn-sm" style="color:#ef4444;font-size:1.1rem;padding:6px 12px" title="Close Walkthrough">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- 3D Viewport Body -->
        <div class="floorplan-3d-viewport-wrap">
          <div id="walkthroughMount" class="floorplan-3d-mount"></div>

          <!-- VR Stereoscopic Split-Screen Overlay -->
          <div id="walkthroughVrOverlay" class="walkthrough-vr-overlay hidden">
            <!-- Center dividing line / Cardboard alignment notch -->
            <div class="vr-split-divider">
              <div class="vr-center-notch top"></div>
              <div class="vr-center-line"></div>
              <div class="vr-center-notch bottom"></div>
            </div>

            <!-- Left Eye HUD Reticle & Badge -->
            <div class="vr-eye-hud vr-eye-left">
              <div class="vr-eye-badge"><i class="fas fa-eye"></i> LEFT EYE</div>
              <div class="vr-reticle">
                <div class="vr-reticle-dot"></div>
                <div class="vr-reticle-ring"></div>
              </div>
            </div>

            <!-- Right Eye HUD Reticle & Badge -->
            <div class="vr-eye-hud vr-eye-right">
              <div class="vr-eye-badge"><i class="fas fa-eye"></i> RIGHT EYE</div>
              <div class="vr-reticle">
                <div class="vr-reticle-dot"></div>
                <div class="vr-reticle-ring"></div>
              </div>
            </div>

            <!-- Floating VR Controls Bar -->
            <div class="vr-floating-controls">
              <div class="vr-controls-pill">
                <span class="vr-pill-label">
                  <i class="fas fa-vr-cardboard" style="color:#c084fc"></i>
                  <span class="hide-mobile">VR STEREOSCOPIC</span>
                </span>
                
                <div class="vr-ipd-control" title="Adjust Inter-Pupillary Distance (Depth)">
                  <span style="font-size:0.75rem;color:#cbd5e1;font-weight:600"><i class="fas fa-arrows-left-right text-primary"></i> IPD:</span>
                  <input type="range" id="vrIpdSlider" min="45" max="80" value="64" step="1" style="width:70px;cursor:pointer;accent-color:#c084fc" />
                  <span id="vrIpdDisplay" style="font-size:0.75rem;color:#c084fc;font-weight:700;min-width:36px">64mm</span>
                </div>

                <button id="btnVrGyroToggle" class="btn btn-ghost btn-xs" title="Toggle Head Gyroscope Motion Tracking (Mobile)">
                  <i class="fas fa-compass" style="color:var(--primary)"></i> <span class="hide-mobile">Gyro: </span><span id="vrGyroStatus" style="font-weight:700;color:var(--primary)">On</span>
                </button>

                <button id="btnVrFullscreen" class="btn btn-primary btn-xs" style="background:#7c3aed;border-color:#a855f7" title="Enter Edge-to-Edge Fullscreen">
                  <i class="fas fa-expand"></i> <span class="hide-mobile">Fullscreen</span>
                </button>

                <button id="btnExitVr" class="btn btn-xs" style="background:#ef4444;color:#ffffff;border:none;font-weight:700;padding:4px 12px;border-radius:14px;box-shadow:0 0 10px rgba(239,68,68,0.4);cursor:pointer" title="Exit VR Mode and return to standard 3D view (Esc / V)">
                  <i class="fas fa-times"></i> Exit VR
                </button>
              </div>
            </div>
          </div>

          <!-- Camera HUD View Mode Switcher -->
          <div class="walkthrough-hud-camera-modes">
            <button class="cam-mode-btn active" data-mode="orbit" title="Orbit 360°">
              <i class="fas fa-arrows-spin"></i> 360° Orbit
            </button>
            <button class="cam-mode-btn" data-mode="fps" title="First-Person Walkthrough (WASD / Arrows)">
              <i class="fas fa-person-walking"></i> Walkthrough
            </button>
            <button class="cam-mode-btn" data-mode="topdown" title="Architectural Dollhouse Plan">
              <i class="fas fa-layer-group"></i> Top Plan
            </button>
            <button class="cam-mode-btn" data-mode="elevation" title="Front Elevation Facade">
              <i class="fas fa-building"></i> Front Facade
            </button>
            <button class="cam-mode-btn" id="btnCamModeVR" data-mode="vr" title="VR Stereoscopic Split-Screen">
              <i class="fas fa-vr-cardboard" style="color:#c084fc"></i> VR Split
            </button>
          </div>

          <!-- Room Teleport Waypoints Strip -->
          <div class="walkthrough-hud-waypoints" id="walkthroughWaypointsBar">
            <!-- Populated dynamically per plan -->
          </div>

          <!-- HUD Telemetry & Navigation Tips -->
          <div class="walkthrough-hud-telemetry">
            <div id="walkthroughActiveRoom" style="font-weight:700;color:var(--primary)">
              <i class="fas fa-location-dot"></i> Ground Entrance Veranda
            </div>
            <div style="font-size:0.75rem;color:#94a3b8" id="walkthroughInstructions">
              Drag mouse to rotate · Scroll to zoom · Double-click room to teleport
            </div>
          </div>

          <!-- Virtual Joystick for Touch / Mobile Devices -->
          <div class="walkthrough-mobile-controls" id="walkthroughMobileControls">
            <div class="dpad-grid">
              <div></div>
              <button class="dpad-btn" data-key="ArrowUp"><i class="fas fa-chevron-up"></i></button>
              <div></div>
              <button class="dpad-btn" data-key="ArrowLeft"><i class="fas fa-chevron-left"></i></button>
              <div class="dpad-center"><i class="fas fa-person-walking"></i></div>
              <button class="dpad-btn" data-key="ArrowRight"><i class="fas fa-chevron-right"></i></button>
              <div></div>
              <button class="dpad-btn" data-key="ArrowDown"><i class="fas fa-chevron-down"></i></button>
              <div></div>
            </div>
          </div>

          <!-- Vastu Compass HUD in corner -->
          <div class="walkthrough-compass-hud" id="walkthroughCompassHud">
            <div class="compass-dial" id="walkthroughCompassDial">
              <span class="compass-n">N</span>
              <span class="compass-e">E</span>
              <span class="compass-s">S</span>
              <span class="compass-w">W</span>
              <div class="compass-needle"></div>
            </div>
          </div>
        </div>

        <!-- Bottom Room Specifications Strip -->
        <div class="floorplan-3d-footer">
          <div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap;font-size:0.82rem">
            <div><span class="text-muted">Plot Ratio:</span> <strong id="wtPlotRatio" style="color:#fff">30' x 40'</strong></div>
            <div><span class="text-muted">Total Built-up:</span> <strong id="wtBuiltUp" style="color:var(--primary)">1200 Sq Ft</strong></div>
            <div><span class="text-muted">Vastu Score:</span> <strong id="wtVastu" style="color:var(--gold)">98% Compliant</strong></div>
            <div><span class="text-muted">RCC Columns:</span> <strong id="wtCols" style="color:var(--accent)">12 Columns (M25)</strong></div>
            <div><span class="text-muted">Estimated Cost:</span> <strong id="wtCost" style="color:var(--success)">₹24.5L - ₹27.8L</strong></div>
          </div>
          <div>
            <button id="btnSelectInWorkspace" class="btn btn-primary btn-sm" style="padding:6px 14px">
              <i class="fas fa-file-signature" style="margin-right:5px"></i> Proceed with this 3D Design
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.modalEl = modal;

    // Attach local modal button handlers
    modal.querySelector('#btnClose3DWalkthrough').addEventListener('click', () => this.close());
    modal.querySelector('.floorplan-3d-backdrop').addEventListener('click', () => this.close());
    modal.querySelector('#btnToggleRoof').addEventListener('click', () => this.toggleRoof());
    modal.querySelector('#btnLightingToggle').addEventListener('click', () => this.toggleLighting());
    modal.querySelector('#btnToggleVR')?.addEventListener('click', () => this.toggleVrMode());
    modal.querySelector('#btnExitVr')?.addEventListener('click', () => this.exitVrMode());
    modal.querySelector('#btnVrFullscreen')?.addEventListener('click', () => this.toggleFullscreen());
    modal.querySelector('#btnVrGyroToggle')?.addEventListener('click', () => this.toggleGyro());
    modal.querySelector('#btnAutoTour').addEventListener('click', () => this.toggleAutoTour());
    modal.querySelector('#btnSnapshot').addEventListener('click', () => this.takeSnapshot());

    // VR IPD depth slider
    const ipdSlider = modal.querySelector('#vrIpdSlider');
    if (ipdSlider) {
      ipdSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.vrEyeSep = val / 1000;
        const disp = modal.querySelector('#vrIpdDisplay');
        if (disp) disp.textContent = `${val}mm`;
      });
    }

    modal.querySelectorAll('.cam-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.mode === 'vr') {
          this.toggleVrMode();
          return;
        }
        if (this.isVrMode) {
          this.exitVrMode();
        }
        modal.querySelectorAll('.cam-mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.setCameraMode(btn.dataset.mode);
      });
    });

    // Mobile D-pad handlers
    modal.querySelectorAll('.dpad-btn').forEach(btn => {
      const k = btn.dataset.key;
      const start = (e) => { e.preventDefault(); this.keys[k] = true; };
      const end = (e) => { e.preventDefault(); this.keys[k] = false; };
      btn.addEventListener('mousedown', start);
      btn.addEventListener('mouseup', end);
      btn.addEventListener('mouseleave', end);
      btn.addEventListener('touchstart', start);
      btn.addEventListener('touchend', end);
    });
  }

  bindGlobalEvents() {
    window.addEventListener('keydown', (e) => {
      if (this.modalEl && !this.modalEl.classList.contains('hidden')) {
        if (e.code in this.keys) {
          this.keys[e.code] = true;
        }
        if (e.key === 'Escape') {
          if (this.isVrMode) {
            this.exitVrMode();
          } else {
            this.close();
          }
        }
        // V key hotkey to toggle VR stereoscopic mode
        if ((e.key === 'v' || e.key === 'V') && !e.ctrlKey && !e.metaKey && !e.altKey && e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT') {
          this.toggleVrMode();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code in this.keys) {
        this.keys[e.code] = false;
      }
    });

    window.addEventListener('resize', () => {
      if (this.renderer && this.camera && this.mountEl) {
        const w = this.mountEl.clientWidth || window.innerWidth;
        const h = this.mountEl.clientHeight || (window.innerHeight * 0.7);
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
        if (this.isVrMode && this.stereoCamera) {
          this.stereoCamera.aspect = 0.5;
        }
      }
    });

    // Fullscreen change listener to adapt VR canvas layout
    document.addEventListener('fullscreenchange', () => {
      const fsBtn = this.modalEl?.querySelector('#btnVrFullscreen');
      const win = this.modalEl?.querySelector('.floorplan-3d-window');
      if (document.fullscreenElement) {
        if (win) win.classList.add('vr-fullscreen');
        if (fsBtn) {
          fsBtn.innerHTML = '<i class="fas fa-compress"></i> <span class="hide-mobile">Exit Full</span>';
          fsBtn.classList.add('active');
        }
      } else {
        if (win) win.classList.remove('vr-fullscreen');
        if (fsBtn) {
          fsBtn.innerHTML = '<i class="fas fa-expand"></i> <span class="hide-mobile">Fullscreen</span>';
          fsBtn.classList.remove('active');
        }
      }
      setTimeout(() => {
        if (this.renderer && this.camera && this.mountEl) {
          const w = this.mountEl.clientWidth || window.innerWidth;
          const h = this.mountEl.clientHeight || window.innerHeight;
          this.camera.aspect = w / h;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(w, h);
        }
      }, 100);
    });
  }

  open(plan, allPlans = []) {
    this.currentPlan = plan;
    if (allPlans && allPlans.length > 0) {
      this.allPlans = allPlans;
    }
    this.modalEl.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Populate design picker dropdown
    this.populateDesignPicker();

    // Update Header Labels
    this.updateModalHeader(plan);

    // Workspace button hook
    const proceedBtn = this.modalEl.querySelector('#btnSelectInWorkspace');
    if (proceedBtn) {
      proceedBtn.onclick = () => {
        this.close();
        window.location.hash = '#/workspace';
      };
    }

    // Build Waypoint buttons
    this.setupWaypointsBar(plan);

    // Initialize or Reset 3D Scene
    this.mountEl = this.modalEl.querySelector('#walkthroughMount');
    this.setupThreeScene(plan);

    // Show mobile controls if touch device
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const mobileCtrl = this.modalEl.querySelector('#walkthroughMobileControls');
    if (mobileCtrl) {
      mobileCtrl.style.display = isTouch ? 'block' : 'none';
      mobileCtrl.classList.remove('hidden');
    }

    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }

    this.startAnimationLoop();
  }

  populateDesignPicker() {
    const select = this.modalEl.querySelector('#walkthroughPlanSelect');
    if (!select) return;

    if (this.allPlans && this.allPlans.length > 0) {
      select.innerHTML = this.allPlans.map(p => `
        <option value="${p.id}" ${p.id === this.currentPlan?.id ? 'selected' : ''}>
          ${p.title || p.style || p.id}
        </option>
      `).join('');
    } else {
      select.innerHTML = `<option value="${this.currentPlan?.id}">${this.currentPlan?.title || 'Selected Design'}</option>`;
    }

    select.onchange = (e) => {
      const selectedId = e.target.value;
      const targetPlan = this.allPlans.find(p => p.id === selectedId);
      if (targetPlan && targetPlan.id !== this.currentPlan?.id) {
        this.switchDesign(targetPlan);
      }
    };
  }

  switchDesign(newPlan) {
    this.currentPlan = newPlan;
    this.updateModalHeader(newPlan);
    this.setupWaypointsBar(newPlan);

    // Clear existing house and roof groups
    if (this.houseGroup) {
      while (this.houseGroup.children.length > 0) {
        const obj = this.houseGroup.children[0];
        this.houseGroup.remove(obj);
      }
    }
    if (this.roofGroup) {
      while (this.roofGroup.children.length > 0) {
        const obj = this.roofGroup.children[0];
        this.roofGroup.remove(obj);
      }
    }

    // Rebuild 3D model for the newly selected design
    this.buildHouseModel(newPlan);

    // Reset camera to first waypoint of new design
    if (this.tourWaypoints && this.tourWaypoints.length > 0) {
      this.teleportToWaypoint(this.tourWaypoints[0]);
    }
  }

  updateModalHeader(plan) {
    this.modalEl.querySelector('#walkthroughPlanTitle').textContent = plan.title || 'Architectural 3D Walkthrough';
    this.modalEl.querySelector('#walkthroughPlanFacing').textContent = `${plan.facing || 'East'} Facing · ${plan.style || 'Modern'}`;
    this.modalEl.querySelector('#wtPlotRatio').textContent = `${plan.plotWidth || 30}' x ${plan.plotDepth || 40}'`;
    this.modalEl.querySelector('#wtBuiltUp').textContent = `${plan.totalAreaSqFt || 1200} Sq Ft`;
    this.modalEl.querySelector('#wtVastu').textContent = `${plan.vastuScore || 95}% Vastu Compliant`;
    this.modalEl.querySelector('#wtCols').textContent = `${plan.colsCount || 12} Columns (Fe-550 TMT)`;
    this.modalEl.querySelector('#wtCost').textContent = plan.costRange || '₹25L - ₹28L';

    // Update select dropdown if needed
    const select = this.modalEl.querySelector('#walkthroughPlanSelect');
    if (select && select.value !== plan.id) {
      select.value = plan.id;
    }
  }

  close() {
    if (this.isVrMode) {
      this.exitVrMode();
    }
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
    if (this.modalEl) {
      this.modalEl.classList.add('hidden');
    }
    document.body.style.overflow = '';
    this.isAutoTouring = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  setupWaypointsBar(plan) {
    const bar = this.modalEl.querySelector('#walkthroughWaypointsBar');
    if (!bar) return;

    // Define room waypoints tailored to this specific plan
    const rooms = this.getPlanRoomWaypoints(plan);
    this.tourWaypoints = rooms;

    bar.innerHTML = rooms.map((r, i) => `
      <button class="waypoint-pill ${i === 0 ? 'active' : ''}" data-index="${i}">
        <i class="${r.icon || 'fas fa-door-open'}"></i> ${r.name}
      </button>
    `).join('');

    bar.querySelectorAll('.waypoint-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        bar.querySelectorAll('.waypoint-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const idx = parseInt(btn.dataset.index);
        this.teleportToWaypoint(rooms[idx]);
      });
    });
  }

  getPlanRoomWaypoints(plan) {
    const widthFt = plan.plotWidth || 30;
    const depthFt = plan.plotDepth || 40;
    const houseW = Math.max(8, Math.min(14, widthFt * 0.3));
    const houseD = Math.max(10, Math.min(18, depthFt * 0.3));

    return getPlanDedicatedWaypoints(plan, houseW, houseD);
  }

  // ==================== Three.js Setup & Modeling ====================
  setupThreeScene(plan) {
    if (!this.mountEl) return;
    this.mountEl.innerHTML = '';

    const width = this.mountEl.clientWidth || 900;
    const height = this.mountEl.clientHeight || 550;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060d1a);
    this.scene.fog = new THREE.FogExp2(0x060d1a, 0.015);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500);
    this.updateOrbitCamera();

    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    this.mountEl.appendChild(this.renderer.domElement);
    this.canvasEl = this.renderer.domElement;

    // Lighting setup
    this.setupLighting();

    // Construct Master 3D House Model for this Plan
    this.houseGroup = new THREE.Group();
    this.roofGroup = new THREE.Group();
    this.scene.add(this.houseGroup);
    this.scene.add(this.roofGroup);

    this.buildHouseModel(plan);

    // Mouse & Touch interaction
    this.setupMouseEvents();
  }

  setupLighting() {
    this.ambientLight = new THREE.AmbientLight(0x38bdf8, 0.7);
    this.scene.add(this.ambientLight);

    this.directionalLight = new THREE.DirectionalLight(0xfff5ea, 1.8);
    this.directionalLight.position.set(16, 24, 18);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.width = 2048;
    this.directionalLight.shadow.mapSize.height = 2048;
    this.directionalLight.shadow.camera.near = 0.5;
    this.directionalLight.shadow.camera.far = 80;
    const d = 16;
    this.directionalLight.shadow.camera.left = -d;
    this.directionalLight.shadow.camera.right = d;
    this.directionalLight.shadow.camera.top = d;
    this.directionalLight.shadow.camera.bottom = -d;
    this.directionalLight.shadow.bias = -0.0005;
    this.scene.add(this.directionalLight);

    const blueHemisphere = new THREE.HemisphereLight(0x7dd3fc, 0x0c1e36, 0.6);
    this.scene.add(blueHemisphere);

    // Interior Warm LED Spots
    const spot1 = new THREE.PointLight(0xfef08a, 1.4, 12, 1.8);
    spot1.position.set(-1.5, 3.2, 1.5);
    this.scene.add(spot1);
    this.pointLights.push(spot1);

    const spot2 = new THREE.PointLight(0xfef08a, 1.2, 12, 1.8);
    spot2.position.set(-3.2, 3.2, -2.5);
    this.scene.add(spot2);
    this.pointLights.push(spot2);
  }

  buildHouseModel(plan) {
    const planId = plan.id || 'plan-1';
    const widthFt = plan.plotWidth || 30;
    const depthFt = plan.plotDepth || 40;

    // Scale factors: 1 unit ~ 3 feet
    const houseW = Math.max(8, Math.min(14, widthFt * 0.3));
    const houseD = Math.max(10, Math.min(18, depthFt * 0.3));
    const wallH = 3.2;

    // 1. Terrain Ground with Driveway & Grass
    this.createTerrain(houseW, houseD, planId);

    // 2. Foundation Plinth & Floor Slab (Plan-6 stilt parking builds its own elevated slab)
    if (planId !== 'plan-6') {
      const floorGeo = new THREE.BoxGeometry(houseW, 0.4, houseD);
      const floorMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.3,
        metalness: 0.1
      });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.position.y = 0.2;
      floor.receiveShadow = true;
      this.houseGroup.add(floor);

      // Vitrified Flooring Tiles with Subtile Grid Lines
      const tileGeo = new THREE.PlaneGeometry(houseW - 0.2, houseD - 0.2);
      const tileMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        roughness: 0.15,
        metalness: 0.05
      });
      const tileFloor = new THREE.Mesh(tileGeo, tileMat);
      tileFloor.rotation.x = -Math.PI / 2;
      tileFloor.position.y = 0.41;
      tileFloor.receiveShadow = true;
      this.houseGroup.add(tileFloor);
    }

    // 3. Dispatch specific 3D architecture for this plan design
    dispatchHouseModel(plan, this.houseGroup, this.roofGroup, houseW, houseD, wallH);

    // 4. Vastu Sacred Markers
    this.createVastuMarkers(houseW, houseD, plan);

    // 5. Apply roof cutaway state
    if (this.roofGroup) {
      this.roofGroup.visible = this.showRoof;
    }
  }

  createTerrain(houseW, houseD, planId) {
    // Large landscape ground
    const groundGeo = new THREE.PlaneGeometry(houseW + 18, houseD + 18);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x091426,
      roughness: 0.9,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    this.houseGroup.add(ground);

    // CAD Architectural Drafting Grid on Ground
    const grid = new THREE.GridHelper(Math.max(houseW, houseD) + 14, 28, 0x38bdf8, 0x1e3a5f);
    grid.position.y = 0.01;
    grid.material.opacity = 0.45;
    grid.material.transparent = true;
    this.houseGroup.add(grid);

    // Front Paved Driveway / Pathway
    const drivewayGeo = new THREE.BoxGeometry(4.2, 0.04, 7);
    const drivewayMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    const driveway = new THREE.Mesh(drivewayGeo, drivewayMat);
    driveway.position.set(0, 0.02, houseD / 2 + 3.5);
    driveway.receiveShadow = true;
    this.houseGroup.add(driveway);

    // Planters & Landscaping Foliage
    for (let i = -1; i <= 1; i += 2) {
      const planterGeo = new THREE.BoxGeometry(2.4, 0.5, 1.2);
      const planterMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
      const planter = new THREE.Mesh(planterGeo, planterMat);
      planter.position.set(i * (houseW / 2 + 1.2), 0.25, houseD / 2);
      this.houseGroup.add(planter);

      // Shrub foliage spheres
      const shrubGeo = new THREE.SphereGeometry(0.55, 8, 8);
      const shrubMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.8 });
      const shrub = new THREE.Mesh(shrubGeo, shrubMat);
      shrub.position.set(i * (houseW / 2 + 1.2), 0.7, houseD / 2);
      this.houseGroup.add(shrub);
    }
  }

  createVastuMarkers(houseW, houseD, plan) {
    // 1. Central Brahmasthan Glowing Sacred Disc on floor
    const discGeo = new THREE.RingGeometry(0.2, 0.8, 32);
    const discMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6
    });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.rotation.x = -Math.PI / 2;
    disc.position.set(0, 0.42, 0);
    this.houseGroup.add(disc);

    // 2. North-East Eeshanya Diya Marker
    const diyaGeo = new THREE.ConeGeometry(0.12, 0.25, 8);
    const diyaMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const diya = new THREE.Mesh(diyaGeo, diyaMat);
    diya.position.set(houseW * 0.35, 0.55, houseD * 0.35);
    this.houseGroup.add(diya);
  }

  // ==================== Navigation & Modes ====================
  setCameraMode(mode) {
    if (mode === 'vr') {
      this.toggleVrMode();
      return;
    }

    if (this.isVrMode) {
      this.exitVrMode();
    }

    this.cameraMode = mode;
    this.isAutoTouring = false;

    const instEl = this.modalEl.querySelector('#walkthroughInstructions');

    if (mode === 'orbit') {
      this.spherical.radius = 18;
      this.spherical.phi = Math.PI / 3;
      this.spherical.theta = Math.PI / 4;
      this.targetLookAt.set(0, 1.2, 0);
      this.updateOrbitCamera();
      if (instEl) instEl.textContent = 'Drag to rotate 360° · Scroll to zoom · Double-click to focus';
    } else if (mode === 'fps') {
      this.fpsPos.set(0, 1.6, 6.0);
      this.fpsRotation = { pitch: 0, yaw: 0 };
      this.camera.position.copy(this.fpsPos);
      this.camera.lookAt(0, 1.4, 0);
      if (instEl) instEl.textContent = 'Use WASD / Arrow Keys or On-Screen D-Pad to walk through rooms';
    } else if (mode === 'topdown') {
      this.spherical.radius = 22;
      this.spherical.phi = 0.05; // directly overhead
      this.spherical.theta = 0;
      this.targetLookAt.set(0, 0.5, 0);
      this.updateOrbitCamera();
      if (instEl) instEl.textContent = 'Top-Down Architectural CAD Cutaway View';
    } else if (mode === 'elevation') {
      this.spherical.radius = 20;
      this.spherical.phi = Math.PI / 2.1;
      this.spherical.theta = 0;
      this.targetLookAt.set(0, 1.8, 0);
      this.updateOrbitCamera();
      if (instEl) instEl.textContent = 'Front Facade Elevation Perspective View';
    }
  }

  teleportToWaypoint(room) {
    if (!room) return;
    this.isAutoTouring = false;

    // Update active room HUD
    const roomEl = this.modalEl.querySelector('#walkthroughActiveRoom');
    if (roomEl) {
      roomEl.innerHTML = `<i class="${room.icon}"></i> ${room.name} · <span style="color:var(--gold);font-size:0.75rem">${room.zone}</span>`;
    }

    if (this.cameraMode === 'fps') {
      this.fpsPos.copy(room.pos);
      this.camera.position.copy(room.pos);
      this.camera.lookAt(room.look);
    } else {
      // Smoothly re-focus orbit camera near that room
      this.targetLookAt.copy(room.pos);
      this.spherical.radius = 8;
      this.spherical.phi = Math.PI / 3.2;
      this.updateOrbitCamera();
    }
  }

  toggleRoof() {
    this.showRoof = !this.showRoof;
    if (this.roofGroup) {
      this.roofGroup.visible = this.showRoof;
    }
    const btn = this.modalEl.querySelector('#btnToggleRoof');
    if (btn) {
      btn.innerHTML = `<i class="fas fa-home"></i> <span class="hide-mobile">Roof: ${this.showRoof ? 'Full Facade' : 'Cutaway'}</span>`;
      btn.classList.toggle('active', this.showRoof);
    }
  }

  toggleLighting() {
    const states = ['day', 'sunset', 'night'];
    const idx = (states.indexOf(this.timeOfDay) + 1) % states.length;
    this.timeOfDay = states[idx];

    const btn = this.modalEl.querySelector('#btnLightingToggle');

    if (this.timeOfDay === 'day') {
      this.scene.background.setHex(0x060d1a);
      this.scene.fog.color.setHex(0x060d1a);
      this.ambientLight.intensity = 0.7;
      this.directionalLight.color.setHex(0xfff5ea);
      this.directionalLight.intensity = 1.8;
      this.directionalLight.position.set(16, 24, 18);
      if (btn) btn.innerHTML = `<i class="fas fa-sun" style="color:var(--gold)"></i> <span class="hide-mobile">Daylight</span>`;
    } else if (this.timeOfDay === 'sunset') {
      this.scene.background.setHex(0x1a0d09);
      this.scene.fog.color.setHex(0x1a0d09);
      this.ambientLight.intensity = 0.4;
      this.directionalLight.color.setHex(0xf97316);
      this.directionalLight.intensity = 2.2;
      this.directionalLight.position.set(22, 8, 12);
      if (btn) btn.innerHTML = `<i class="fas fa-cloud-sun" style="color:#f97316"></i> <span class="hide-mobile">Sunset</span>`;
    } else {
      this.scene.background.setHex(0x020617);
      this.scene.fog.color.setHex(0x020617);
      this.ambientLight.intensity = 0.25;
      this.directionalLight.color.setHex(0x38bdf8);
      this.directionalLight.intensity = 0.6;
      this.directionalLight.position.set(-12, 18, -12);
      if (btn) btn.innerHTML = `<i class="fas fa-moon" style="color:#38bdf8"></i> <span class="hide-mobile">Night LED</span>`;
    }
  }

  toggleAutoTour() {
    this.isAutoTouring = !this.isAutoTouring;
    const btn = this.modalEl.querySelector('#btnAutoTour');
    if (btn) {
      btn.innerHTML = this.isAutoTouring
        ? `<i class="fas fa-pause"></i> <span>Pause Tour</span>`
        : `<i class="fas fa-play"></i> <span>Auto Tour</span>`;
      btn.classList.toggle('btn-accent', this.isAutoTouring);
    }
  }

  // ==================== VR Stereoscopic Headset Controls ====================
  toggleVrMode() {
    if (this.isVrMode) {
      this.exitVrMode();
    } else {
      this.enterVrMode();
    }
  }

  enterVrMode() {
    this.isVrMode = true;
    this.prevCameraModeBeforeVr = (this.cameraMode && this.cameraMode !== 'vr') ? this.cameraMode : 'orbit';
    this.cameraMode = 'fps'; // First-person walkthrough for 1:1 human immersion in VR
    this.isAutoTouring = false;

    if (!this.stereoCamera) {
      this.stereoCamera = new THREE.StereoCamera();
    }
    this.stereoCamera.aspect = 0.5;
    this.stereoCamera.eyeSep = this.vrEyeSep || 0.064;

    // Position camera at comfortable human eye height
    if (this.fpsPos.y < 1.2 || this.prevCameraModeBeforeVr !== 'fps') {
      this.fpsPos.set(0, 1.6, 5.0);
      this.fpsRotation = { pitch: 0, yaw: 0 };
    }
    this.updateFpsCamera();

    // Show VR Overlay (separator, dual reticles, IPD bar)
    const overlay = this.modalEl.querySelector('#walkthroughVrOverlay');
    if (overlay) overlay.classList.remove('hidden');

    // Hide standard 2D HUD bars that obstruct the stereoscopic dual-eye view
    this.modalEl.querySelector('.walkthrough-hud-camera-modes')?.classList.add('hidden');
    this.modalEl.querySelector('.walkthrough-hud-waypoints')?.classList.add('hidden');
    this.modalEl.querySelector('.walkthrough-hud-telemetry')?.classList.add('hidden');
    const mobileCtrl = this.modalEl.querySelector('#walkthroughMobileControls');
    if (mobileCtrl) mobileCtrl.classList.add('hidden');

    // Update Header VR Button
    const headerBtn = this.modalEl.querySelector('#btnToggleVR');
    if (headerBtn) {
      headerBtn.classList.add('active');
      const label = headerBtn.querySelector('#vrBtnLabel');
      if (label) label.textContent = 'Exit VR';
    }

    // Update Cam Mode HUD Buttons
    this.modalEl.querySelectorAll('.cam-mode-btn').forEach(b => b.classList.remove('active'));
    const vrCamBtn = this.modalEl.querySelector('#btnCamModeVR');
    if (vrCamBtn) vrCamBtn.classList.add('active');

    // Update Instructions HUD
    const instEl = this.modalEl.querySelector('#walkthroughInstructions');
    if (instEl) {
      instEl.innerHTML = '<span style="color:#c084fc;font-weight:700"><i class="fas fa-vr-cardboard"></i> VR Stereoscopic Split-Screen</span> · Use WASD / Arrows / Touch to walk · Headset Dual View';
    }

    // Enable mobile device gyroscope orientation tracking
    this.enableDeviceOrientation();
  }

  exitVrMode() {
    this.isVrMode = false;

    // Hide VR Overlay
    const overlay = this.modalEl.querySelector('#walkthroughVrOverlay');
    if (overlay) overlay.classList.add('hidden');

    // Restore standard 2D HUD bars
    this.modalEl.querySelector('.walkthrough-hud-camera-modes')?.classList.remove('hidden');
    this.modalEl.querySelector('.walkthrough-hud-waypoints')?.classList.remove('hidden');
    this.modalEl.querySelector('.walkthrough-hud-telemetry')?.classList.remove('hidden');
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const mobileCtrl = this.modalEl.querySelector('#walkthroughMobileControls');
    if (mobileCtrl && isTouch) mobileCtrl.classList.remove('hidden');

    // Reset Header VR Button
    const headerBtn = this.modalEl.querySelector('#btnToggleVR');
    if (headerBtn) {
      headerBtn.classList.remove('active');
      const label = headerBtn.querySelector('#vrBtnLabel');
      if (label) label.textContent = 'VR Headset';
    }

    // Reset Cam Mode HUD Button
    const vrCamBtn = this.modalEl.querySelector('#btnCamModeVR');
    if (vrCamBtn) vrCamBtn.classList.remove('active');

    // Detach gyroscope listener
    this.disableDeviceOrientation();

    // Revert to previous camera mode
    const prevMode = this.prevCameraModeBeforeVr || 'orbit';
    const targetBtn = this.modalEl.querySelector(`.cam-mode-btn[data-mode="${prevMode}"]`);
    if (targetBtn) targetBtn.classList.add('active');
    this.setCameraMode(prevMode);

    // Reset WebGL renderer viewport and scissor test cleanly
    if (this.renderer && this.mountEl) {
      this.renderer.setScissorTest(false);
      const w = this.mountEl.clientWidth || 900;
      const h = this.mountEl.clientHeight || 550;
      this.renderer.setViewport(0, 0, w, h);
      this.renderer.setScissor(0, 0, w, h);
      if (this.camera) {
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
      }
    }
  }

  toggleGyro() {
    this.gyroEnabled = !this.gyroEnabled;
    const statusEl = this.modalEl.querySelector('#vrGyroStatus');
    if (statusEl) {
      statusEl.textContent = this.gyroEnabled ? 'On' : 'Off';
      statusEl.style.color = this.gyroEnabled ? 'var(--primary)' : '#94a3b8';
    }
  }

  enableDeviceOrientation() {
    if (this.deviceOrientationHandler) return;

    this.initialAlpha = null;
    this.deviceOrientationHandler = (e) => {
      if (!this.isVrMode || !this.gyroEnabled) return;
      if (e.alpha === null && e.beta === null && e.gamma === null) return;

      if (this.initialAlpha === null) {
        this.initialAlpha = e.alpha || 0;
      }

      const alphaDiff = ((e.alpha || 0) - this.initialAlpha) * (Math.PI / 180);
      const screenAngle = (window.screen?.orientation?.angle) ?? (window.orientation ?? 0);

      if (screenAngle === 90) {
        this.fpsRotation.yaw = -alphaDiff;
        this.fpsRotation.pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, -(e.gamma || 0) * (Math.PI / 180)));
      } else if (screenAngle === -90 || screenAngle === 270) {
        this.fpsRotation.yaw = alphaDiff;
        this.fpsRotation.pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, (e.gamma || 0) * (Math.PI / 180)));
      } else {
        this.fpsRotation.yaw = -alphaDiff;
        this.fpsRotation.pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, ((e.beta || 0) - 45) * (Math.PI / 180)));
      }

      this.updateFpsCamera();
    };

    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(state => {
          if (state === 'granted') {
            window.addEventListener('deviceorientation', this.deviceOrientationHandler);
          }
        })
        .catch(err => console.warn('Gyro permission prompt error:', err));
    } else if (typeof window !== 'undefined' && 'ondeviceorientation' in window) {
      window.addEventListener('deviceorientation', this.deviceOrientationHandler);
    }
  }

  disableDeviceOrientation() {
    if (this.deviceOrientationHandler) {
      window.removeEventListener('deviceorientation', this.deviceOrientationHandler);
      this.deviceOrientationHandler = null;
      this.initialAlpha = null;
    }
  }

  toggleFullscreen() {
    const target = this.modalEl || document.documentElement;
    if (!document.fullscreenElement) {
      if (target.requestFullscreen) {
        target.requestFullscreen().catch(err => console.warn(err));
      } else if (target.webkitRequestFullscreen) {
        target.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.warn(err));
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }

  takeSnapshot() {
    if (!this.renderer) return;
    if (this.isVrMode && this.stereoCamera) {
      const w = this.mountEl.clientWidth || 900;
      const h = this.mountEl.clientHeight || 550;
      const halfW = Math.floor(w / 2);
      this.camera.updateMatrixWorld();
      this.stereoCamera.aspect = 0.5;
      this.stereoCamera.eyeSep = this.vrEyeSep || 0.064;
      this.stereoCamera.update(this.camera);

      this.renderer.setScissorTest(true);
      this.renderer.setScissor(0, 0, halfW, h);
      this.renderer.setViewport(0, 0, halfW, h);
      this.renderer.render(this.scene, this.stereoCamera.cameraL);

      this.renderer.setScissor(halfW, 0, w - halfW, h);
      this.renderer.setViewport(halfW, 0, w - halfW, h);
      this.renderer.render(this.scene, this.stereoCamera.cameraR);
      this.renderer.setScissorTest(false);
    } else {
      this.renderer.render(this.scene, this.camera);
    }
    const dataUrl = this.renderer.domElement.toDataURL('image/jpeg', 0.95);
    const link = document.createElement('a');
    link.download = `${this.currentPlan?.id || 'floorplan'}-${this.isVrMode ? 'stereoscopic-VR' : '3D-walkthrough'}.jpg`;
    link.href = dataUrl;
    link.click();
  }

  // ==================== Mouse / Touch Orbit & Walk Controls ====================
  setupMouseEvents() {
    const canvas = this.canvasEl;
    if (!canvas) return;

    canvas.addEventListener('mousedown', (e) => {
      this.isMouseDown = true;
      this.prevMousePos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isMouseDown = false;
    });

    canvas.addEventListener('mousemove', (e) => {
      if (!this.isMouseDown) return;
      const dx = e.clientX - this.prevMousePos.x;
      const dy = e.clientY - this.prevMousePos.y;
      this.prevMousePos = { x: e.clientX, y: e.clientY };

      if (this.cameraMode === 'fps') {
        this.fpsRotation.yaw -= dx * 0.003;
        this.fpsRotation.pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.fpsRotation.pitch - dy * 0.003));
        this.updateFpsCamera();
      } else {
        // Orbit mode
        this.spherical.theta -= dx * 0.006;
        this.spherical.phi = Math.max(0.08, Math.min(Math.PI / 2.05, this.spherical.phi - dy * 0.006));
        this.updateOrbitCamera();
      }
    });

    // Touch events for mobile orbit
    let prevTouch = null;
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        prevTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    });

    canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && prevTouch) {
        const dx = e.touches[0].clientX - prevTouch.x;
        const dy = e.touches[0].clientY - prevTouch.y;
        prevTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };

        if (this.cameraMode === 'fps') {
          this.fpsRotation.yaw -= dx * 0.005;
          this.fpsRotation.pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.fpsRotation.pitch - dy * 0.005));
          this.updateFpsCamera();
        } else {
          this.spherical.theta -= dx * 0.008;
          this.spherical.phi = Math.max(0.08, Math.min(Math.PI / 2.05, this.spherical.phi - dy * 0.008));
          this.updateOrbitCamera();
        }
      }
    });

    // Wheel zoom
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (this.cameraMode === 'fps') {
        const moveSpeed = e.deltaY > 0 ? -0.8 : 0.8;
        const dir = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.fpsRotation.yaw);
        this.fpsPos.addScaledVector(dir, moveSpeed);
        this.updateFpsCamera();
      } else {
        this.spherical.radius = Math.max(4, Math.min(45, this.spherical.radius + e.deltaY * 0.02));
        this.updateOrbitCamera();
      }
    }, { passive: false });
  }

  updateOrbitCamera() {
    if (!this.camera) return;
    const r = this.spherical.radius;
    const phi = this.spherical.phi;
    const theta = this.spherical.theta;

    this.camera.position.x = this.targetLookAt.x + r * Math.sin(phi) * Math.sin(theta);
    this.camera.position.y = this.targetLookAt.y + r * Math.cos(phi);
    this.camera.position.z = this.targetLookAt.z + r * Math.sin(phi) * Math.cos(theta);
    this.camera.lookAt(this.targetLookAt);

    this.updateCompassHud();
  }

  updateFpsCamera() {
    if (!this.camera) return;
    this.camera.position.copy(this.fpsPos);

    const dir = new THREE.Vector3(
      Math.sin(this.fpsRotation.yaw) * Math.cos(this.fpsRotation.pitch),
      Math.sin(this.fpsRotation.pitch),
      -Math.cos(this.fpsRotation.yaw) * Math.cos(this.fpsRotation.pitch)
    );

    const lookTarget = this.fpsPos.clone().add(dir);
    this.camera.lookAt(lookTarget);

    this.updateCompassHud();
  }

  updateCompassHud() {
    const dial = this.modalEl?.querySelector('#walkthroughCompassDial');
    if (!dial) return;
    const rotDeg = (this.cameraMode === 'fps' ? this.fpsRotation.yaw : -this.spherical.theta) * (180 / Math.PI);
    dial.style.transform = `rotate(${rotDeg}deg)`;
  }

  // ==================== Animation Loop ====================
  startAnimationLoop() {
    const animate = () => {
      this.animId = requestAnimationFrame(animate);
      const delta = this.clock.getDelta();

      // FPS keyboard movement handling
      if (this.cameraMode === 'fps') {
        const speed = 4.5 * delta;
        const forward = new THREE.Vector3(
          Math.sin(this.fpsRotation.yaw),
          0,
          -Math.cos(this.fpsRotation.yaw)
        ).normalize();
        const right = new THREE.Vector3(
          Math.cos(this.fpsRotation.yaw),
          0,
          Math.sin(this.fpsRotation.yaw)
        ).normalize();

        if (this.keys.KeyW || this.keys.ArrowUp) this.fpsPos.addScaledVector(forward, speed);
        if (this.keys.KeyS || this.keys.ArrowDown) this.fpsPos.addScaledVector(forward, -speed);
        if (this.keys.KeyA || this.keys.ArrowLeft) this.fpsPos.addScaledVector(right, -speed);
        if (this.keys.KeyD || this.keys.ArrowRight) this.fpsPos.addScaledVector(right, speed);

        this.updateFpsCamera();
      }

      // Auto-Tour Camera Glide
      if (this.isAutoTouring && this.tourWaypoints.length > 0) {
        this.tourProgress += delta * 0.18;
        const total = this.tourWaypoints.length;
        const currentIdx = Math.floor(this.tourProgress) % total;
        const nextIdx = (currentIdx + 1) % total;
        const alpha = this.tourProgress - Math.floor(this.tourProgress);

        const currentWp = this.tourWaypoints[currentIdx];
        const nextWp = this.tourWaypoints[nextIdx];

        // Smoothly interpolate position & look
        const curPos = currentWp.pos.clone().lerp(nextWp.pos, alpha);
        const curLook = currentWp.look.clone().lerp(nextWp.look, alpha);

        this.camera.position.copy(curPos);
        this.camera.lookAt(curLook);

        // Update HUD indicator
        const roomEl = this.modalEl.querySelector('#walkthroughActiveRoom');
        if (roomEl) {
          roomEl.innerHTML = `<i class="${currentWp.icon}"></i> ${currentWp.name} · <span style="color:var(--gold)">Auto Guided Tour</span>`;
        }
      }

      // Gentle subtle breathing orbit when idle in orbit mode
      if (this.cameraMode === 'orbit' && !this.isMouseDown && !this.isAutoTouring) {
        this.spherical.theta += 0.0012;
        this.updateOrbitCamera();
      }

      if (this.renderer && this.scene && this.camera) {
        if (this.isVrMode && this.stereoCamera) {
          const w = this.mountEl.clientWidth || this.renderer.domElement.width;
          const h = this.mountEl.clientHeight || this.renderer.domElement.height;
          const halfW = Math.floor(w / 2);

          this.camera.updateMatrixWorld();
          this.stereoCamera.aspect = 0.5;
          this.stereoCamera.eyeSep = this.vrEyeSep || 0.064;
          this.stereoCamera.update(this.camera);

          this.renderer.setScissorTest(true);

          // Left Eye Viewport & Scissor Pass
          this.renderer.setScissor(0, 0, halfW, h);
          this.renderer.setViewport(0, 0, halfW, h);
          this.renderer.render(this.scene, this.stereoCamera.cameraL);

          // Right Eye Viewport & Scissor Pass
          this.renderer.setScissor(halfW, 0, w - halfW, h);
          this.renderer.setViewport(halfW, 0, w - halfW, h);
          this.renderer.render(this.scene, this.stereoCamera.cameraR);

          this.renderer.setScissorTest(false);
        } else {
          this.renderer.setScissorTest(false);
          const w = this.mountEl.clientWidth || this.renderer.domElement.width;
          const h = this.mountEl.clientHeight || this.renderer.domElement.height;
          this.renderer.setViewport(0, 0, w, h);
          this.renderer.render(this.scene, this.camera);
        }
      }
    };

    animate();
  }
}

// Global Singleton Instance
let walkthroughInstance = null;

export function getFloorPlan3DWalkthrough() {
  if (!walkthroughInstance) {
    walkthroughInstance = new FloorPlan3DWalkthroughModal();
  }
  return walkthroughInstance;
}
