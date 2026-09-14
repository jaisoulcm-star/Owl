// ==================== Interactive 3D Realistic Modern Luxury Villa Engine ====================
// Professional architectural visualization and parametric AI House Planner engine for
// modern luxury villas, featuring PBR materials, day/night simulation, first-person walkthrough,
// floor cutaways, CAD measurement dimensions, live construction telemetry, and 12 intelligence nodes.

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { LuxuryVillaModel } from './luxuryVillaModel.js';
import { CONSTRUCTION_FEATURES, getFeatureById } from './constructionFeaturesData.js';
import { getFloorPlan3DWalkthrough } from '../floorPlanWalkthrough/FloorPlan3DWalkthroughModal.js';
import { generate10IndianFloorPlans } from '../../pages/floorPlans.js';

export class ConstructionHouse3D {
  constructor(options = {}) {
    this.container = typeof options.container === 'string'
      ? document.querySelector(options.container)
      : options.container;

    this.mountEl = options.mountEl
      ? (typeof options.mountEl === 'string' ? document.querySelector(options.mountEl) : options.mountEl)
      : this.container?.querySelector('.skill-canvas-mount');

    this.labelsOverlay = options.labelsOverlay
      ? (typeof options.labelsOverlay === 'string' ? document.querySelector(options.labelsOverlay) : options.labelsOverlay)
      : this.container?.querySelector('.skill-labels-overlay');

    this.svgLinesEl = options.svgLinesEl
      ? (typeof options.svgLinesEl === 'string' ? document.querySelector(options.svgLinesEl) : options.svgLinesEl)
      : this.container?.querySelector('.skill-lines-svg');

    this.detailCardEl = options.detailCardEl
      ? (typeof options.detailCardEl === 'string' ? document.querySelector(options.detailCardEl) : options.detailCardEl)
      : this.container?.querySelector('.skill-detail-card');

    this.fallbackEl = options.fallbackEl
      ? (typeof options.fallbackEl === 'string' ? document.querySelector(options.fallbackEl) : options.fallbackEl)
      : this.container?.querySelector('.skill-fallback-layout');

    this.activeCategory = options.initialCategory || 'ALL';
    this.isRotating = true;
    this.isDestroyed = false;
    this.isInViewport = true;
    this.hoveredFeatureId = null;
    this.selectedFeatureId = null;

    // Camera & Viewport Modes
    // Modes: 'exterior', 'interior', 'top', 'floorplan', 'walkthrough'
    this.viewMode = 'exterior';
    this.timeOfDay = 'day'; // 'day', 'night'
    this.plotPreset = '30x40'; // '30x40', '40x60', '50x80'
    this.activeMaterial = 'travertine'; // 'travertine', 'concrete', 'brick', 'wood', 'slate'
    this.activeFloor = 'all'; // 'all', 'ground', 'first', 'roof'
    this.showDimensions = true;

    // First Person Walkthrough State
    this.walkSpeed = 4.8;
    this.keys = { KeyW: false, KeyS: false, KeyA: false, KeyD: false, ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
    this.fpsYaw = 0;
    this.fpsPitch = 0;
    this.isMouseDown = false;
    this.lastMousePos = { x: 0, y: 0 };
    this.targetCameraPos = null;
    this.targetCameraLookAt = null;

    this.mouse = { x: 0, y: 0 };
    this.normalizedPointer = new THREE.Vector2(-999, -999);
    this.raycaster = new THREE.Raycaster();

    this.featureNodeMeshes = [];
    this.houseConnectionLines = [];
    this.dataPackets = [];
    this.htmlLabelElements = new Map();
    this.disposables = [];

    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (this.reducedMotion) {
      this.isRotating = false;
    }

    this.init();
  }

  // ==================== WebGL Detection & Init ====================
  checkWebGLSupport() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  init() {
    if (!this.checkWebGLSupport()) {
      console.warn('[ConstructionHouse3D] WebGL unavailable, falling back to 2D UI.');
      this.render2DFallback();
      return;
    }

    if (!this.mountEl) {
      console.error('[ConstructionHouse3D] Mount container element not found.');
      return;
    }

    this.setupScene();
    this.createRealisticLuxuryVilla();
    this.createBlueprintGroundAndCompass();
    this.createFeatureNodes();
    this.createHouseConduits();
    this.createDataPulseSystem();
    this.createHtmlLabels();
    this.injectArchitecturalControlsHUD();
    this.setupEventListeners();
    this.setupIntersectionObserver();

    this.clock = new THREE.Clock();
    this.animate();

    requestAnimationFrame(() => {
      this.onResize();
      this.updateTelemetryHUD();
    });
  }

  // ==================== Scene & Lighting ====================
  setupScene() {
    const rect = this.mountEl.getBoundingClientRect();
    this.width = rect.width || this.mountEl.clientWidth || 960;
    this.height = rect.height || this.mountEl.clientHeight || 700;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060c18);
    this.scene.fog = new THREE.FogExp2(0x060c18, 0.01);

    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000);
    this.camera.position.set(15, 12, 16);
    this.camera.lookAt(0, 2.5, 0);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    this.mountEl.innerHTML = '';
    this.mountEl.appendChild(this.renderer.domElement);
    this.canvas = this.renderer.domElement;

    // OrbitControls with full natural rotation, pan and zoom
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableZoom = true;
    this.controls.enablePan = true;
    this.controls.minDistance = 2.0;
    this.controls.maxDistance = 45.0;
    this.controls.minPolarAngle = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02; // Prevent going beneath ground plane
    this.controls.target.set(0, 2.0, 0);

    this.universeGroup = new THREE.Group();
    this.scene.add(this.universeGroup);
  }

  // ==================== Create Realistic Luxury Villa ====================
  createRealisticLuxuryVilla() {
    if (this.villaModel) {
      this.universeGroup.remove(this.villaModel.rootGroup);
      this.villaModel.dispose();
    }

    this.villaModel = new LuxuryVillaModel({
      plotPreset: this.plotPreset,
      materialCladding: this.activeMaterial,
      floorFilter: this.activeFloor,
      timeOfDay: this.timeOfDay,
      showDimensions: this.showDimensions
    });

    this.universeGroup.add(this.villaModel.rootGroup);
    this.houseGroup = this.villaModel.rootGroup;
    this.houseAttachmentPoints = this.villaModel.getAttachmentPoints();
  }

  // ==================== Blueprint Ground & Compass Disc ====================
  createBlueprintGroundAndCompass() {
    this.groundGroup = new THREE.Group();
    this.groundGroup.position.y = -0.22;
    this.universeGroup.add(this.groundGroup);

    // Subtle CAD Grid
    const gridHelper = new THREE.GridHelper(32, 32, 0x00f2fe, 0x1e293b);
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.25;
    this.groundGroup.add(gridHelper);
    this.disposables.push(gridHelper.geometry, gridHelper.material);

    // Architectural Vastu Compass Ring
    const ringPoints = [];
    const r = 11.5;
    for (let i = 0; i <= 64; i++) {
      const theta = (i / 64) * Math.PI * 2;
      ringPoints.push(new THREE.Vector3(Math.cos(theta) * r, 0.02, Math.sin(theta) * r));
    }
    const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPoints);
    const ringMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35 });
    this.groundGroup.add(new THREE.Line(ringGeo, ringMat));
    this.disposables.push(ringGeo, ringMat);
  }

  // ==================== 12 Intelligent Feature Nodes ====================
  createFeatureNodes() {
    this.nodesGroup = new THREE.Group();
    this.universeGroup.add(this.nodesGroup);

    CONSTRUCTION_FEATURES.forEach((feature) => {
      const nodeGroup = new THREE.Group();
      nodeGroup.name = `feature-node-${feature.id}`;
      nodeGroup.userData = {
        featureId: feature.id,
        featureData: feature,
        isFeatureNode: true,
        baseAngle: feature.orbitAngle,
        radiusX: feature.radiusX * 1.2,
        radiusY: feature.radiusY * 1.2,
        elevation: feature.elevation,
        floatOffset: Math.random() * Math.PI * 2
      };

      const posX = Math.cos(feature.orbitAngle) * (feature.radiusX * 1.2);
      const posZ = Math.sin(feature.orbitAngle) * (feature.radiusY * 1.2);
      const posY = feature.elevation + 1.2;
      nodeGroup.position.set(posX, posY, posZ);
      nodeGroup.userData.basePos = new THREE.Vector3(posX, posY, posZ);

      // Core Glass Bead Sphere
      const coreGeo = new THREE.SphereGeometry(0.26, 24, 24);
      const coreMat = new THREE.MeshStandardMaterial({
        color: feature.colorHex,
        emissive: feature.colorHex,
        emissiveIntensity: 0.7,
        roughness: 0.2,
        metalness: 0.5
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      nodeGroup.add(coreMesh);

      // Outer Wireframe Gyro Ring
      const ringGeo = new THREE.TorusGeometry(0.42, 0.02, 12, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: feature.colorHex, transparent: true, opacity: 0.75 });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      nodeGroup.add(ringMesh);

      this.nodesGroup.add(nodeGroup);
      this.featureNodeMeshes.push({
        group: nodeGroup,
        core: coreMesh,
        ring: ringMesh,
        feature
      });

      this.disposables.push(coreGeo, coreMat, ringGeo, ringMat);
    });
  }

  // ==================== Dynamic Conduits Connecting Nodes to Villa ====================
  createHouseConduits() {
    this.conduitsGroup = new THREE.Group();
    this.universeGroup.add(this.conduitsGroup);
    this.houseConnectionLines = [];

    this.featureNodeMeshes.forEach((nodeItem) => {
      const zoneKey = nodeItem.feature.connectedBuildingZone || 'interior';
      const pNode = nodeItem.group.position;
      const targetPos = this.houseAttachmentPoints[zoneKey] || new THREE.Vector3(0, 2, 0);

      const points = [pNode.clone(), targetPos.clone()];
      const conduitGeo = new THREE.BufferGeometry().setFromPoints(points);
      const conduitMat = new THREE.LineBasicMaterial({
        color: nodeItem.feature.colorHex,
        transparent: true,
        opacity: 0.35,
        linewidth: 1
      });

      const conduitLine = new THREE.Line(conduitGeo, conduitMat);
      this.conduitsGroup.add(conduitLine);

      this.houseConnectionLines.push({
        line: conduitLine,
        geometry: conduitGeo,
        material: conduitMat,
        nodeItem,
        targetZoneKey: zoneKey
      });

      this.disposables.push(conduitGeo, conduitMat);
    });
  }

  // ==================== Data Pulse Packets ====================
  createDataPulseSystem() {
    this.dataPacketsGroup = new THREE.Group();
    this.universeGroup.add(this.dataPacketsGroup);

    const numPackets = 16;
    const positions = new Float32Array(numPackets * 3);
    const colors = new Float32Array(numPackets * 3);

    for (let i = 0; i < numPackets; i++) {
      this.dataPackets.push({
        conduitIndex: i % this.houseConnectionLines.length,
        progress: Math.random(),
        speed: 0.25 + Math.random() * 0.35
      });

      colors[i * 3] = 0.22;
      colors[i * 3 + 1] = 0.74;
      colors[i * 3 + 2] = 0.97;
    }

    const packetGeo = new THREE.BufferGeometry();
    packetGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    packetGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const packetMat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    this.packetPointsMesh = new THREE.Points(packetGeo, packetMat);
    this.dataPacketsGroup.add(this.packetPointsMesh);
    this.disposables.push(packetGeo, packetMat);
  }

  // ==================== HTML Labels Overlay ====================
  createHtmlLabels() {
    if (!this.labelsOverlay) return;
    this.labelsOverlay.innerHTML = '';
    this.htmlLabelElements.clear();

    this.featureNodeMeshes.forEach((nodeItem) => {
      const f = nodeItem.feature;
      const label = document.createElement('div');
      label.className = 'skill-glass-label';
      label.dataset.featureId = f.id;
      label.innerHTML = `
        <span class="label-dot" style="background:${f.color};box-shadow:0 0 10px ${f.color}"></span>
        <span class="label-text">${f.shortName || f.name}</span>
        <i class="fas ${f.icon} label-icon" style="color:${f.color}"></i>
      `;

      label.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleFeatureSelect(f.id);
      });

      label.addEventListener('mouseenter', () => this.handleFeatureHover(f.id));
      label.addEventListener('mouseleave', () => this.handleFeatureHover(null));

      this.labelsOverlay.appendChild(label);
      this.htmlLabelElements.set(f.id, label);
    });
  }

  // ==================== Floating Architectural Controls HUD ====================
  injectArchitecturalControlsHUD() {
    const parent = this.mountEl.parentElement;
    if (!parent) return;

    // Check if HUD already injected
    let hud = parent.querySelector('#villaArchHud');
    if (hud) hud.remove();

    hud = document.createElement('div');
    hud.id = 'villaArchHud';
    hud.className = 'villa-arch-hud';
    hud.innerHTML = `
      <!-- Top Modes Ribbon -->
      <div class="arch-hud-top-ribbon">
        <div class="arch-hud-modes">
          <button class="hud-btn active" data-mode="exterior" title="360° Perspective Hero View">
            <i class="fas fa-arrows-spin"></i> <span>360° Orbit</span>
          </button>
          <button class="hud-btn" data-mode="interior" title="Interior Living Room & Foyer View">
            <i class="fas fa-couch"></i> <span>Interior</span>
          </button>
          <button class="hud-btn" data-mode="top" title="Top-Down Dollhouse View">
            <i class="fas fa-layer-group"></i> <span>Top View</span>
          </button>
          <button class="hud-btn" data-mode="floorplan" title="Architectural Cutaway Floor Plan with CAD Dimensions">
            <i class="fas fa-drafting-compass"></i> <span>Floor Plan</span>
          </button>
          <button class="hud-btn" data-mode="walkthrough" title="First-Person Interactive Walkthrough (WASD / Arrows)">
            <i class="fas fa-person-walking"></i> <span>Walkthrough</span>
          </button>
          <button class="hud-btn" id="btnHudDayNight" title="Toggle Natural Sunlight vs Luxury Twilight Accent Lighting">
            <i class="fas fa-sun" style="color:#f59e0b"></i> <span>Day / Night</span>
          </button>
        </div>

        <!-- Parametric Plot & Material Bar -->
        <div class="arch-hud-parametric">
          <!-- Plot Size Presets -->
          <div class="hud-pill-group" title="Parametric Plot Dimensions">
            <span class="hud-pill-label"><i class="fas fa-ruler-combined"></i> Plot:</span>
            <button class="hud-sub-btn active" data-plot="30x40">30×40'</button>
            <button class="hud-sub-btn" data-plot="40x60">40×60'</button>
            <button class="hud-sub-btn" data-plot="50x80">50×80'</button>
          </div>

          <!-- Floor Level Cutaway -->
          <div class="hud-pill-group" title="Floor-by-Floor View Cutaway">
            <span class="hud-pill-label"><i class="fas fa-building"></i> Floor:</span>
            <button class="hud-sub-btn active" data-floor="all">All</button>
            <button class="hud-sub-btn" data-floor="ground">Ground</button>
            <button class="hud-sub-btn" data-floor="first">First</button>
            <button class="hud-sub-btn" data-floor="roof">Roof</button>
          </div>

          <!-- Facade Finish Swatches -->
          <div class="hud-pill-group" title="Real-Time Exterior PBR Material Finishes">
            <span class="hud-pill-label"><i class="fas fa-palette"></i> Facade:</span>
            <button class="hud-mat-swatch active" data-mat="travertine" title="Travertine Stone" style="background:#dfd7cc"></button>
            <button class="hud-mat-swatch" data-mat="concrete" title="Exposed Concrete" style="background:#9ca3af"></button>
            <button class="hud-mat-swatch" data-mat="brick" title="Modern Linear Brick" style="background:#a0522d"></button>
            <button class="hud-mat-swatch" data-mat="wood" title="Teak Wood Louvers" style="background:#b4743c"></button>
            <button class="hud-mat-swatch" data-mat="slate" title="Anthracite Slate" style="background:#1e293b"></button>
          </div>

          <!-- CAD Dimensions Toggle -->
          <button class="hud-btn active" id="btnToggleDimensions" title="Toggle CAD Measurement Annotations">
            <i class="fas fa-ruler"></i> <span>CAD: On</span>
          </button>
        </div>
      </div>

      <!-- Walkthrough Floating Guide & Touch D-Pad (Active in Walkthrough Mode) -->
      <div class="arch-walkthrough-overlay hidden" id="archWalkthroughOverlay">
        <div class="walkthrough-room-badge" id="archActiveRoomBadge">
          <i class="fas fa-location-dot"></i> <span id="archActiveRoomText">Great Living Room</span>
        </div>
        <div class="walkthrough-nav-tip">
          <i class="fas fa-keyboard"></i> <strong>W / A / S / D</strong> or <strong>Arrow Keys</strong> to Walk · Drag Mouse to Look
        </div>
        <div class="walkthrough-dpad">
          <button class="dpad-key" data-key="KeyW"><i class="fas fa-chevron-up"></i></button>
          <div class="dpad-row">
            <button class="dpad-key" data-key="KeyA"><i class="fas fa-chevron-left"></i></button>
            <button class="dpad-key" data-key="KeyS"><i class="fas fa-chevron-down"></i></button>
            <button class="dpad-key" data-key="KeyD"><i class="fas fa-chevron-right"></i></button>
          </div>
        </div>
      </div>

      <!-- Bottom Live Construction Telemetry Banner -->
      <div class="arch-hud-bottom-bar" id="archTelemetryBanner">
        <div class="telemetry-item">
          <span class="telemetry-label">Plot & Typology:</span>
          <strong class="telemetry-val" id="telPlot">30' × 40' (3 BHK Luxury Villa)</strong>
        </div>
        <div class="telemetry-item">
          <span class="telemetry-label">Built-Up Area:</span>
          <strong class="telemetry-val text-primary" id="telArea">1,860 Sq.Ft</strong>
        </div>
        <div class="telemetry-item">
          <span class="telemetry-label">Est. Construction:</span>
          <strong class="telemetry-val text-success" id="telCost">₹32.5L - ₹36.8L</strong>
        </div>
        <div class="telemetry-item">
          <span class="telemetry-label">Vastu Score:</span>
          <strong class="telemetry-val text-gold" id="telVastu">96% Compliant</strong>
        </div>
        <div class="telemetry-item">
          <span class="telemetry-label">Structural Grid:</span>
          <strong class="telemetry-val" id="telStructure">14 Columns (M25 RCC)</strong>
        </div>
        <div class="telemetry-item">
          <span class="telemetry-label">Clear Heights:</span>
          <strong class="telemetry-val" id="telHeight">10.2 Ft (3.1m)</strong>
        </div>
      </div>
    `;

    parent.appendChild(hud);
    this.hudEl = hud;

    // Attach HUD Event Listeners
    // 1. View Modes
    hud.querySelectorAll('.arch-hud-modes .hud-btn[data-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        hud.querySelectorAll('.arch-hud-modes .hud-btn[data-mode]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.setVisualizationMode(btn.dataset.mode);
      });
    });

    // 2. Day / Night Toggle
    const dayNightBtn = hud.querySelector('#btnHudDayNight');
    if (dayNightBtn) {
      dayNightBtn.addEventListener('click', () => {
        this.timeOfDay = this.timeOfDay === 'day' ? 'night' : 'day';
        this.villaModel.setTimeOfDay(this.timeOfDay);
        dayNightBtn.innerHTML = this.timeOfDay === 'night'
          ? '<i class="fas fa-moon" style="color:#38bdf8"></i> <span>Night View</span>'
          : '<i class="fas fa-sun" style="color:#f59e0b"></i> <span>Day View</span>';
      });
    }

    // 3. Plot Preset Switches
    hud.querySelectorAll('[data-plot]').forEach(btn => {
      btn.addEventListener('click', () => {
        hud.querySelectorAll('[data-plot]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.setPlotPreset(btn.dataset.plot);
      });
    });

    // 4. Floor Cutaways
    hud.querySelectorAll('[data-floor]').forEach(btn => {
      btn.addEventListener('click', () => {
        hud.querySelectorAll('[data-floor]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.setFloorCutaway(btn.dataset.floor);
      });
    });

    // 5. Facade Material Finishes
    hud.querySelectorAll('[data-mat]').forEach(btn => {
      btn.addEventListener('click', () => {
        hud.querySelectorAll('[data-mat]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.setFacadeMaterial(btn.dataset.mat);
      });
    });

    // 6. CAD Dimensions Toggle
    const dimBtn = hud.querySelector('#btnToggleDimensions');
    if (dimBtn) {
      dimBtn.addEventListener('click', () => {
        this.showDimensions = !this.showDimensions;
        this.villaModel.toggleDimensions(this.showDimensions);
        dimBtn.classList.toggle('active', this.showDimensions);
        dimBtn.querySelector('span').textContent = this.showDimensions ? 'CAD: On' : 'CAD: Off';
      });
    }

    // 7. Walkthrough On-Screen D-Pad Keys
    hud.querySelectorAll('.dpad-key').forEach(btn => {
      const k = btn.dataset.key;
      const start = (e) => { e.preventDefault(); this.keys[k] = true; };
      const end = (e) => { e.preventDefault(); this.keys[k] = false; };
      btn.addEventListener('mousedown', start);
      btn.addEventListener('mouseup', end);
      btn.addEventListener('mouseleave', end);
      btn.addEventListener('touchstart', start, { passive: false });
      btn.addEventListener('touchend', end, { passive: false });
    });
  }

  // ==================== Visualization Modes Controller ====================
  setVisualizationMode(mode) {
    this.viewMode = mode;
    const wtOverlay = this.hudEl?.querySelector('#archWalkthroughOverlay');

    if (mode === 'walkthrough') {
      this.controls.enabled = false;
      this.isRotating = false;
      if (wtOverlay) wtOverlay.classList.remove('hidden');

      // Set camera to eye height at Entrance Foyer
      this.camera.position.set(0.5, 1.85, 3.8);
      this.camera.lookAt(0.5, 1.85, -2.0);
      this.fpsYaw = 0;
      this.fpsPitch = 0;
    } else {
      this.controls.enabled = true;
      if (wtOverlay) wtOverlay.classList.add('hidden');

      if (mode === 'interior') {
        this.controls.target.set(1.5, 1.4, 0.4);
        this.smoothTransitionCamera(new THREE.Vector3(1.2, 1.6, 2.8), new THREE.Vector3(1.5, 1.4, -0.6));
      } else if (mode === 'top') {
        this.controls.target.set(0, 0, 0);
        this.smoothTransitionCamera(new THREE.Vector3(0, 24, 0.1), new THREE.Vector3(0, 0, 0));
      } else if (mode === 'floorplan') {
        // Cut off upper floors for clean dollhouse architectural floor plan
        this.setFloorCutaway('ground');
        this.controls.target.set(0, 0.8, 0);
        this.smoothTransitionCamera(new THREE.Vector3(0, 16, 6), new THREE.Vector3(0, 0.8, -0.5));
      } else {
        // 'exterior' 360 Orbit
        this.setFloorCutaway('all');
        this.controls.target.set(0, 2.0, 0);
        this.smoothTransitionCamera(new THREE.Vector3(15, 12, 16), new THREE.Vector3(0, 2.0, 0));
      }
    }
  }

  smoothTransitionCamera(targetPos, targetLookAt) {
    this.targetCameraPos = targetPos;
    this.targetCameraLookAt = targetLookAt;
  }

  setPlotPreset(preset) {
    this.plotPreset = preset;
    this.villaModel.setPlotPreset(preset);
    this.houseAttachmentPoints = this.villaModel.getAttachmentPoints();
    this.updateTelemetryHUD();
  }

  setFloorCutaway(floor) {
    this.activeFloor = floor;
    this.villaModel.setFloorFilter(floor);
  }

  setFacadeMaterial(matKey) {
    this.activeMaterial = matKey;
    this.villaModel.setMaterialCladding(matKey);
  }

  updateTelemetryHUD() {
    if (!this.hudEl || !this.villaModel) return;
    const tel = this.villaModel.telemetry;
    const pEl = this.hudEl.querySelector('#telPlot');
    const aEl = this.hudEl.querySelector('#telArea');
    const cEl = this.hudEl.querySelector('#telCost');
    const vEl = this.hudEl.querySelector('#telVastu');
    const sEl = this.hudEl.querySelector('#telStructure');
    const hEl = this.hudEl.querySelector('#telHeight');

    if (pEl) pEl.textContent = `${tel.preset.replace('x', '×')}' (${tel.bhk})`;
    if (aEl) aEl.textContent = tel.builtUpArea;
    if (cEl) cEl.textContent = tel.estCost;
    if (vEl) vEl.textContent = tel.vastuScore;
    if (sEl) sEl.textContent = tel.rccCols;
    if (hEl) hEl.textContent = tel.clearHeight;
  }

  // ==================== Event Listeners ====================
  setupEventListeners() {
    this.onResize = this.onResize.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onCanvasClick = this.onCanvasClick.bind(this);

    window.addEventListener('resize', this.onResize);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);

    if (this.mountEl) {
      this.mountEl.addEventListener('mousemove', this.onMouseMove);
      this.mountEl.addEventListener('mousedown', this.onMouseDown);
      this.mountEl.addEventListener('mouseup', this.onMouseUp);
      this.mountEl.addEventListener('click', this.onCanvasClick);
      this.mountEl.addEventListener('mouseleave', () => {
        this.isMouseDown = false;
        this.handleFeatureHover(null);
      });
    }

    // Detail card close button
    const closeBtn = this.detailCardEl?.querySelector('#skillCardCloseBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.handleFeatureSelect(null);
      });
    }

    // Category filters on skillsPage
    const filtersContainer = document.getElementById('skillCategoryFilters');
    if (filtersContainer) {
      filtersContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.skill-filter-btn');
        if (!btn) return;
        filtersContainer.querySelectorAll('.skill-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.setCategoryFilter(btn.dataset.category);
      });
    }
  }

  onKeyDown(e) {
    if (this.viewMode === 'walkthrough') {
      if (['KeyW', 'KeyS', 'KeyA', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        this.keys[e.code] = true;
      }
    }
  }

  onKeyUp(e) {
    if (this.viewMode === 'walkthrough') {
      if (['KeyW', 'KeyS', 'KeyA', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        this.keys[e.code] = false;
      }
    }
  }

  onMouseDown(e) {
    this.isMouseDown = true;
    this.lastMousePos = { x: e.clientX, y: e.clientY };
  }

  onMouseUp() {
    this.isMouseDown = false;
  }

  onMouseMove(e) {
    const rect = this.mountEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.normalizedPointer.x = (x / rect.width) * 2 - 1;
    this.normalizedPointer.y = -(y / rect.height) * 2 + 1;

    if (this.viewMode === 'walkthrough' && this.isMouseDown) {
      const dx = e.clientX - this.lastMousePos.x;
      const dy = e.clientY - this.lastMousePos.y;
      this.lastMousePos = { x: e.clientX, y: e.clientY };

      this.fpsYaw -= dx * 0.0045;
      this.fpsPitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.fpsPitch - dy * 0.0045));

      const dir = new THREE.Vector3(
        Math.sin(this.fpsYaw) * Math.cos(this.fpsPitch),
        Math.sin(this.fpsPitch),
        -Math.cos(this.fpsYaw) * Math.cos(this.fpsPitch)
      );
      this.camera.lookAt(this.camera.position.clone().add(dir));
    }
  }

  onCanvasClick(e) {
    if (this.viewMode === 'walkthrough') return;

    this.raycaster.setFromCamera(this.normalizedPointer, this.camera);
    const meshes = this.featureNodeMeshes.map(n => n.core);
    const intersects = this.raycaster.intersectObjects(meshes, true);

    if (intersects.length > 0) {
      const hit = intersects[0];
      const nodeGroup = hit.object.parent;
      if (nodeGroup && nodeGroup.userData.featureId) {
        this.handleFeatureSelect(nodeGroup.userData.featureId);
      }
    }
  }

  onResize() {
    if (!this.mountEl || !this.renderer || !this.camera) return;
    const rect = this.mountEl.getBoundingClientRect();
    const w = rect.width || this.mountEl.clientWidth || 960;
    const h = rect.height || this.mountEl.clientHeight || 700;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  setupIntersectionObserver() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          this.isInViewport = entry.isIntersecting;
        });
      }, { threshold: 0.1 });

      if (this.container) {
        this.observer.observe(this.container);
      }
    }

    if ('ResizeObserver' in window && this.mountEl) {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
            this.onResize();
          }
        }
      });
      this.resizeObserver.observe(this.mountEl);
    }
  }

  // ==================== Feature Selection & Detail Card ====================
  handleFeatureHover(featureId) {
    this.hoveredFeatureId = featureId;

    this.htmlLabelElements.forEach((label, id) => {
      if (featureId && id === featureId) {
        label.classList.add('hovered');
      } else {
        label.classList.remove('hovered');
      }
    });

    this.houseConnectionLines.forEach(conn => {
      if (featureId && conn.nodeItem.feature.id === featureId) {
        conn.material.opacity = 0.9;
        conn.material.linewidth = 2;
      } else {
        conn.material.opacity = 0.35;
      }
    });
  }

  handleFeatureSelect(featureId) {
    this.selectedFeatureId = featureId;

    this.htmlLabelElements.forEach((label, id) => {
      label.classList.toggle('selected', id === featureId);
    });

    if (!featureId) {
      if (this.detailCardEl) {
        this.detailCardEl.classList.remove('active');
        this.detailCardEl.classList.add('hidden');
      }
      return;
    }

    const feature = getFeatureById(featureId);
    if (!feature || !this.detailCardEl) return;

    const iconEl = this.detailCardEl.querySelector('#cardSkillIcon');
    const catEl = this.detailCardEl.querySelector('#cardSkillCategory');
    const titleEl = this.detailCardEl.querySelector('#cardSkillTitle');
    const sumEl = this.detailCardEl.querySelector('#cardSkillSummary');
    const lvlEl = this.detailCardEl.querySelector('#cardSkillLevel');
    const pctEl = this.detailCardEl.querySelector('#cardSkillPct');
    const barEl = this.detailCardEl.querySelector('#cardSkillProgressBar');
    const tagsEl = this.detailCardEl.querySelector('#cardSkillTags');
    const connEl = this.detailCardEl.querySelector('#cardSkillConnections');

    if (iconEl) iconEl.innerHTML = `<i class="fas ${feature.icon}" style="color:${feature.color}"></i>`;
    if (catEl) {
      catEl.textContent = feature.category;
      catEl.style.color = feature.color;
    }
    if (titleEl) titleEl.textContent = feature.name;
    if (sumEl) sumEl.textContent = feature.summary;
    if (lvlEl) lvlEl.textContent = feature.level;
    if (pctEl) {
      pctEl.textContent = feature.metric;
      pctEl.style.color = feature.color;
    }
    if (barEl) {
      barEl.style.width = '95%';
      barEl.style.background = feature.color;
    }

    if (tagsEl) {
      tagsEl.innerHTML = feature.tags.map(t => `<span class="skill-tag">${t}</span>`).join('');
    }

    if (connEl) {
      connEl.innerHTML = feature.connections.map(cId => {
        const cFeat = getFeatureById(cId);
        return cFeat ? `<button class="skill-conn-pill" data-target="${cFeat.id}" style="border-color:${cFeat.color};color:#fff">${cFeat.shortName || cFeat.name}</button>` : '';
      }).join('');

      connEl.querySelectorAll('.skill-conn-pill').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const target = btn.dataset.target;
          if (target) this.handleFeatureSelect(target);
        });
      });
    }

    this.detailCardEl.classList.remove('hidden');
    this.detailCardEl.classList.add('active');
  }

  setCategoryFilter(category) {
    this.activeCategory = category;

    this.featureNodeMeshes.forEach(item => {
      const match = category === 'ALL' || item.feature.category === category;
      item.group.visible = match;

      const label = this.htmlLabelElements.get(item.feature.id);
      if (label) {
        label.style.display = match ? 'inline-flex' : 'none';
      }
    });

    this.houseConnectionLines.forEach(conn => {
      const match = category === 'ALL' || conn.nodeItem.feature.category === category;
      conn.line.visible = match;
    });
  }

  // ==================== Walkthrough Engine & Room Detection ====================
  updateWalkthrough(delta) {
    if (this.viewMode !== 'walkthrough') return;

    const moveVector = new THREE.Vector3();
    const forward = new THREE.Vector3(Math.sin(this.fpsYaw), 0, -Math.cos(this.fpsYaw));
    const right = new THREE.Vector3(Math.cos(this.fpsYaw), 0, Math.sin(this.fpsYaw));

    if (this.keys.KeyW || this.keys.ArrowUp) moveVector.add(forward);
    if (this.keys.KeyS || this.keys.ArrowDown) moveVector.sub(forward);
    if (this.keys.KeyD || this.keys.ArrowRight) moveVector.add(right);
    if (this.keys.KeyA || this.keys.ArrowLeft) moveVector.sub(right);

    if (moveVector.lengthSq() > 0) {
      moveVector.normalize().multiplyScalar(this.walkSpeed * delta);
      this.camera.position.add(moveVector);

      // Keep eye height at realistic human perspective
      this.camera.position.y = 1.85;

      // Plot Boundary Constraints
      const pW = this.villaModel.plotW / 2 - 0.4;
      const pL = this.villaModel.plotL / 2 - 0.4;
      this.camera.position.x = Math.max(-pW, Math.min(pW, this.camera.position.x));
      this.camera.position.z = Math.max(-pL, Math.min(pL, this.camera.position.z));

      // Re-orient Look At
      const dir = new THREE.Vector3(
        Math.sin(this.fpsYaw) * Math.cos(this.fpsPitch),
        Math.sin(this.fpsPitch),
        -Math.cos(this.fpsYaw) * Math.cos(this.fpsPitch)
      );
      this.camera.lookAt(this.camera.position.clone().add(dir));
    }

    // Room Detection
    let activeRoomName = 'Exterior Villa Grounds';
    for (const [id, room] of this.villaModel.roomBoundingBoxes.entries()) {
      const dx = Math.abs(this.camera.position.x - room.center.x);
      const dz = Math.abs(this.camera.position.z - room.center.z);
      if (dx <= room.size.x / 2 && dz <= room.size.z / 2) {
        activeRoomName = room.name;
        break;
      }
    }

    const badge = this.hudEl?.querySelector('#archActiveRoomText');
    if (badge && badge.textContent !== activeRoomName) {
      badge.textContent = activeRoomName;
    }
  }

  // ==================== Main Render Loop ====================
  animate() {
    if (this.isDestroyed) return;
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    if (!this.isInViewport) return;

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsedTime = this.clock.getElapsedTime();

    // Smooth Camera Transition Lerp
    if (this.targetCameraPos && this.viewMode !== 'walkthrough') {
      this.camera.position.lerp(this.targetCameraPos, delta * 4.0);
      if (this.targetCameraLookAt) {
        this.controls.target.lerp(this.targetCameraLookAt, delta * 4.0);
      }
      if (this.camera.position.distanceTo(this.targetCameraPos) < 0.1) {
        this.targetCameraPos = null;
        this.targetCameraLookAt = null;
      }
    }

    // Controls Update
    if (this.controls && this.controls.enabled) {
      this.controls.update();
    }

    // Walkthrough Update
    if (this.viewMode === 'walkthrough') {
      this.updateWalkthrough(delta);
    }

    // Feature Nodes Gentle Float & Gyro Spin
    this.featureNodeMeshes.forEach((nodeItem) => {
      const offset = nodeItem.group.userData.floatOffset || 0;
      const basePos = nodeItem.group.userData.basePos;
      const floatY = Math.sin(elapsedTime * 1.6 + offset) * 0.14;
      nodeItem.group.position.y = basePos.y + floatY;

      nodeItem.ring.rotation.x += delta * 0.45;
      nodeItem.ring.rotation.y += delta * 0.65;
    });

    // Update SVG Lines and Labels
    this.updateLabelsAndConduits();

    // Render Scene
    this.renderer.render(this.scene, this.camera);
  }

  updateLabelsAndConduits() {
    if (!this.mountEl || !this.camera) return;
    const rect = this.mountEl.getBoundingClientRect();
    const widthHalf = rect.width / 2;
    const heightHalf = rect.height / 2;

    const pNodeWorld = new THREE.Vector3();
    const pHouseWorld = new THREE.Vector3();

    // Update 3D Line Conduits
    this.houseConnectionLines.forEach((conn) => {
      conn.nodeItem.group.getWorldPosition(pNodeWorld);
      const targetOffset = this.houseAttachmentPoints[conn.targetZoneKey] || new THREE.Vector3(0, 2, 0);
      pHouseWorld.copy(targetOffset);

      this.conduitsGroup.worldToLocal(pNodeWorld);
      this.conduitsGroup.worldToLocal(pHouseWorld);

      const positions = conn.geometry.attributes.position.array;
      positions[0] = pNodeWorld.x;
      positions[1] = pNodeWorld.y;
      positions[2] = pNodeWorld.z;
      positions[3] = pHouseWorld.x;
      positions[4] = pHouseWorld.y;
      positions[5] = pHouseWorld.z;
      conn.geometry.attributes.position.needsUpdate = true;
    });

    // Project 2D Glassmorphism Labels
    this.featureNodeMeshes.forEach((nodeItem) => {
      const label = this.htmlLabelElements.get(nodeItem.feature.id);
      if (!label || !nodeItem.group.visible) return;

      nodeItem.group.getWorldPosition(pNodeWorld);
      pNodeWorld.project(this.camera);

      // Check if behind camera
      if (pNodeWorld.z > 1.0) {
        label.style.opacity = '0';
        return;
      }

      const screenX = pNodeWorld.x * widthHalf + widthHalf;
      const screenY = -(pNodeWorld.y * heightHalf) + heightHalf;

      label.style.opacity = '1';
      label.style.transform = `translate3d(${screenX}px, ${screenY}px, 0) translate(-50%, -50%)`;
    });
  }

  // ==================== 2D Fallback ====================
  render2DFallback() {
    if (!this.fallbackEl) return;
    this.fallbackEl.classList.remove('hidden');
    if (this.mountEl) this.mountEl.style.display = 'none';

    const grid = this.fallbackEl.querySelector('#skillFallbackGrid') || this.fallbackEl.querySelector('.fallback-grid');
    if (!grid) return;

    grid.innerHTML = CONSTRUCTION_FEATURES.map(f => `
      <div class="fallback-skill-card" style="border-top: 3px solid ${f.color}">
        <div class="flex-between">
          <span style="font-weight:700;color:#fff">${f.name}</span>
          <span style="color:${f.color}"><i class="fas ${f.icon}"></i></span>
        </div>
        <p style="font-size:0.85rem;color:var(--text-muted);margin:8px 0">${f.summary}</p>
        <span class="badge" style="background:${f.color}22;color:${f.color}">${f.metric}</span>
      </div>
    `).join('');
  }

  // ==================== Cleanup & Disposal ====================
  dispose() {
    this.destroy();
  }

  destroy() {
    this.isDestroyed = true;
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (this.observer) this.observer.disconnect();
    if (this.resizeObserver) this.resizeObserver.disconnect();

    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);

    if (this.mountEl) {
      this.mountEl.removeEventListener('mousemove', this.onMouseMove);
      this.mountEl.removeEventListener('mousedown', this.onMouseDown);
      this.mountEl.removeEventListener('mouseup', this.onMouseUp);
      this.mountEl.removeEventListener('click', this.onCanvasClick);
    }

    if (this.hudEl) this.hudEl.remove();

    if (this.villaModel) this.villaModel.dispose();

    this.disposables.forEach(item => {
      if (item && typeof item.dispose === 'function') {
        item.dispose();
      }
    });

    if (this.controls) this.controls.dispose();
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }

    this.htmlLabelElements.clear();
  }
}
