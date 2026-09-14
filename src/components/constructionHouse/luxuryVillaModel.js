// ==================== Modern Luxury Villa 3D Architectural Builder ====================
// Generates a buildable, realistic modern luxury villa with physical PBR materials,
// complete Ground Floor, First Floor, Rooftop, Landscaped Garden, Car Porch,
// and full parametric adaptability for 30x40, 40x60, and 50x80 ft plots.

import * as THREE from 'three';
import {
  getTravertineTexture,
  getConcreteTexture,
  getWoodSlatTexture,
  getModernBrickTexture,
  getSlateTexture,
  getMarbleTexture,
  getPaverTexture,
  getGrassTexture,
  getParquetTexture
} from './villaTextures.js';

export class LuxuryVillaModel {
  constructor(options = {}) {
    this.plotPreset = options.plotPreset || '30x40'; // '30x40', '40x60', '50x80'
    this.materialCladding = options.materialCladding || 'travertine'; // 'travertine', 'concrete', 'brick', 'wood', 'slate'
    this.flooringType = options.flooringType || 'marble';
    this.floorFilter = options.floorFilter || 'all'; // 'all', 'ground', 'first', 'roof'
    this.timeOfDay = options.timeOfDay || 'day'; // 'day', 'night'
    this.showDimensions = options.showDimensions !== undefined ? options.showDimensions : true;
    this.selectedRoom = options.selectedRoom || null;

    this.rootGroup = new THREE.Group();
    this.rootGroup.name = 'LuxuryVillaRoot';

    // Sub-groups for floor-by-floor cutaways
    this.siteGroup = new THREE.Group();
    this.groundFloorGroup = new THREE.Group();
    this.firstFloorGroup = new THREE.Group();
    this.roofGroup = new THREE.Group();
    this.furnitureGroup = new THREE.Group();
    this.lightsGroup = new THREE.Group();
    this.annotationsGroup = new THREE.Group();
    this.roomBoundsGroup = new THREE.Group();

    this.rootGroup.add(this.siteGroup);
    this.rootGroup.add(this.groundFloorGroup);
    this.rootGroup.add(this.firstFloorGroup);
    this.rootGroup.add(this.roofGroup);
    this.rootGroup.add(this.furnitureGroup);
    this.rootGroup.add(this.lightsGroup);
    this.rootGroup.add(this.annotationsGroup);
    this.rootGroup.add(this.roomBoundsGroup);

    this.disposables = [];
    this.facadeMeshes = [];
    this.roomBoundingBoxes = new Map();
    this.telemetry = {};

    this.initMaterials();
    this.buildVilla();
  }

  // ==================== PBR Material System ====================
  initMaterials() {
    // 1. Facade Cladding Materials Map
    this.claddingTextures = {
      travertine: getTravertineTexture(),
      concrete: getConcreteTexture(),
      brick: getModernBrickTexture(),
      wood: getWoodSlatTexture(),
      slate: getSlateTexture()
    };

    // Active primary facade finish
    this.primaryFacadeMat = new THREE.MeshStandardMaterial({
      map: this.claddingTextures[this.materialCladding] || this.claddingTextures.travertine,
      roughness: 0.75,
      metalness: 0.05
    });

    // Secondary warm teak wood accent cladding
    this.woodAccentMat = new THREE.MeshStandardMaterial({
      map: getWoodSlatTexture(),
      roughness: 0.6,
      metalness: 0.08
    });

    // Clean off-white architectural stucco/concrete
    this.whiteStuccoMat = new THREE.MeshStandardMaterial({
      map: getConcreteTexture(),
      color: 0xf1f5f9,
      roughness: 0.85,
      metalness: 0.02
    });

    // Dark architectural metal (window mullions, fascia, pergola beams)
    this.darkMetalMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.35,
      metalness: 0.85
    });

    // Luxury Tinted Transparent Glass
    this.glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      roughness: 0.05,
      metalness: 0.1,
      transparent: true,
      opacity: 0.45,
      transmission: 0.85,
      ior: 1.52,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      reflectivity: 0.9
    });

    // Ground & Landscape Materials
    this.grassMat = new THREE.MeshStandardMaterial({
      map: getGrassTexture(),
      roughness: 0.9,
      metalness: 0.0
    });

    this.paverMat = new THREE.MeshStandardMaterial({
      map: getPaverTexture(),
      roughness: 0.7,
      metalness: 0.1
    });

    // Interior Flooring
    this.groundFloorTileMat = new THREE.MeshStandardMaterial({
      map: getMarbleTexture(),
      roughness: 0.18,
      metalness: 0.12
    });

    this.upperFloorWoodMat = new THREE.MeshStandardMaterial({
      map: getParquetTexture(),
      roughness: 0.4,
      metalness: 0.05
    });

    // Furniture & Decorative Materials
    this.sofaFabricMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.85,
      metalness: 0.02
    });

    this.bedLinenMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.9,
      metalness: 0.0
    });

    this.pillowAccentMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.7,
      metalness: 0.05
    });

    this.goldBrassMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.25,
      metalness: 0.9
    });

    this.kitchenQuartzMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.2,
      metalness: 0.1
    });

    this.disposables.push(
      this.primaryFacadeMat, this.woodAccentMat, this.whiteStuccoMat,
      this.darkMetalMat, this.glassMat, this.grassMat, this.paverMat,
      this.groundFloorTileMat, this.upperFloorWoodMat, this.sofaFabricMat,
      this.bedLinenMat, this.pillowAccentMat, this.goldBrassMat, this.kitchenQuartzMat
    );
  }

  // ==================== Parametric Dimensions Calculator ====================
  calculateDimensions() {
    // Standard Villa Metric scaling: 1 unit in Three.js = 1 meter (~3.28 ft)
    if (this.plotPreset === '40x60') {
      // 40x60 ft plot: 12.2m x 18.3m
      this.plotW = 12.2;
      this.plotL = 16.5;
      this.villaW = 8.6;
      this.villaL = 11.2;
      this.bhk = '4 BHK Executive Villa';
      this.builtUpSqFt = 3420;
      this.estCost = '₹58.5L - ₹65.2L';
      this.vastuScore = '98% Vastu Compliant';
      this.rccCols = '18 Columns (M25 RCC)';
    } else if (this.plotPreset === '50x80') {
      // 50x80 ft plot: 15.2m x 24.4m
      this.plotW = 14.8;
      this.plotL = 19.5;
      this.villaW = 10.4;
      this.villaL = 13.6;
      this.bhk = '5 BHK Grand Luxury Estate';
      this.builtUpSqFt = 5180;
      this.estCost = '₹88.0L - ₹97.5L';
      this.vastuScore = '99% Vastu Compliant';
      this.rccCols = '24 Columns (M25 RCC)';
    } else {
      // Default 30x40 ft plot: 9.1m x 12.2m
      this.plotPreset = '30x40';
      this.plotW = 9.8;
      this.plotL = 13.2;
      this.villaW = 6.8;
      this.villaL = 8.8;
      this.bhk = '3 BHK Modern Luxury Villa';
      this.builtUpSqFt = 1860;
      this.estCost = '₹32.5L - ₹36.8L';
      this.vastuScore = '96% Vastu Compliant';
      this.rccCols = '14 Columns (M25 RCC)';
    }

    this.floorHeight = 3.1; // 3.1m standard luxury clear height (~10.2 ft)
    this.slabThickness = 0.22; // 220mm RCC floor slab
    this.wallThick = 0.23; // 9-inch exterior wall
    this.partitionThick = 0.12; // 4.5-inch interior wall

    this.telemetry = {
      preset: this.plotPreset,
      bhk: this.bhk,
      plotDimensions: `${this.plotW.toFixed(1)}m × ${this.plotL.toFixed(1)}m (${this.plotPreset.replace('x', '×')} ft)`,
      builtUpArea: `${this.builtUpSqFt.toLocaleString()} sq.ft`,
      estCost: this.estCost,
      vastuScore: this.vastuScore,
      rccCols: this.rccCols,
      clearHeight: `${this.floorHeight}m (10.2 ft)`,
      wallThickness: '230mm Ext / 115mm Int'
    };
  }

  // ==================== Build Master Villa ====================
  buildVilla() {
    this.calculateDimensions();

    this.buildSiteAndLandscaping();
    this.buildCarPorch();
    this.buildGroundFloor();
    this.buildFirstFloor();
    this.buildRoofAndPergola();
    this.buildArchitecturalLighting();
    this.buildDimensionAnnotations();
    this.updateFloorVisibility();
    this.updateTimeOfDayLighting();
  }

  // ==================== 1. Site, Plinth & Landscaping ====================
  buildSiteAndLandscaping() {
    const pW = this.plotW;
    const pL = this.plotL;

    // A. Main Plot Lawn Ground (Sub-grade)
    const siteGeo = new THREE.BoxGeometry(pW, 0.2, pL);
    const siteMesh = new THREE.Mesh(siteGeo, this.grassMat);
    siteMesh.position.set(0, -0.1, 0);
    siteMesh.receiveShadow = true;
    this.siteGroup.add(siteMesh);
    this.disposables.push(siteGeo);

    // B. Elevated Foundation Plinth (+450mm above garden grade)
    const plinthW = this.villaW + 0.6;
    const plinthL = this.villaL + 0.6;
    const plinthH = 0.45;
    const plinthGeo = new THREE.BoxGeometry(plinthW, plinthH, plinthL);
    const plinthMesh = new THREE.Mesh(plinthGeo, this.whiteStuccoMat);
    plinthMesh.position.set(0, plinthH / 2, -0.4);
    this.siteGroup.add(plinthMesh);
    this.disposables.push(plinthGeo);

    // C. Paver Driveway & Entrance Walkway
    const drivewayW = 3.6;
    const drivewayL = pL / 2 + 0.4;
    const drivewayGeo = new THREE.BoxGeometry(drivewayW, 0.06, drivewayL);
    const drivewayMesh = new THREE.Mesh(drivewayGeo, this.paverMat);
    drivewayMesh.position.set(-pW / 2 + drivewayW / 2 + 0.6, 0.03, pL / 4);
    this.siteGroup.add(drivewayMesh);
    this.disposables.push(drivewayGeo);

    // D. Modern Stepping Stone Pathway from Gate to Front Porch
    for (let s = 0; s < 5; s++) {
      const stepGeo = new THREE.BoxGeometry(1.2, 0.08, 0.65);
      const step = new THREE.Mesh(stepGeo, this.whiteStuccoMat);
      step.position.set(0.6, 0.04, pL / 2 - 1.2 - s * 0.95);
      this.siteGroup.add(step);
      this.disposables.push(stepGeo);
    }

    // E. Perimeter Boundary Wall with Contemporary Dark Metal Louvers
    this.buildBoundaryWalls(pW, pL);

    // F. Outdoor Landscaped Planters & Trees
    this.buildVegetation(pW, pL);

    // G. Outdoor Garden Patio with Lounge Armchairs & Low Stone Table
    this.buildOutdoorPatio(pW, pL);
  }

  buildBoundaryWalls(pW, pL) {
    const wallH = 1.6;
    const wallThick = 0.18;

    // Back wall
    const backWallGeo = new THREE.BoxGeometry(pW, wallH, wallThick);
    const backWall = new THREE.Mesh(backWallGeo, this.whiteStuccoMat);
    backWall.position.set(0, wallH / 2, -pL / 2);
    this.siteGroup.add(backWall);

    // Left wall
    const leftWallGeo = new THREE.BoxGeometry(wallThick, wallH, pL);
    const leftWall = new THREE.Mesh(leftWallGeo, this.whiteStuccoMat);
    leftWall.position.set(-pW / 2, wallH / 2, 0);
    this.siteGroup.add(leftWall);

    // Right wall
    const rightWallGeo = new THREE.BoxGeometry(wallThick, wallH, pL);
    const rightWall = new THREE.Mesh(rightWallGeo, this.whiteStuccoMat);
    rightWall.position.set(pW / 2, wallH / 2, 0);
    this.siteGroup.add(rightWall);

    // Front wall with Main Entrance Gate Opening
    const gateW = 3.6;
    const frontPartW = (pW - gateW) / 2;

    const fWall1Geo = new THREE.BoxGeometry(frontPartW, wallH, wallThick);
    const fWall1 = new THREE.Mesh(fWall1Geo, this.whiteStuccoMat);
    fWall1.position.set(-pW / 2 + frontPartW / 2, wallH / 2, pL / 2);
    this.siteGroup.add(fWall1);

    const fWall2 = new THREE.Mesh(fWall1Geo, this.whiteStuccoMat);
    fWall2.position.set(pW / 2 - frontPartW / 2, wallH / 2, pL / 2);
    this.siteGroup.add(fWall2);

    // Gate Pillars with Top Accent Lights
    const pillarGeo = new THREE.BoxGeometry(0.45, wallH + 0.3, 0.45);
    const pil1 = new THREE.Mesh(pillarGeo, this.primaryFacadeMat);
    pil1.position.set(-pW / 2 + frontPartW, (wallH + 0.3) / 2, pL / 2);
    this.siteGroup.add(pil1);

    const pil2 = new THREE.Mesh(pillarGeo, this.primaryFacadeMat);
    pil2.position.set(pW / 2 - frontPartW, (wallH + 0.3) / 2, pL / 2);
    this.siteGroup.add(pil2);

    // Modern Motorized Slat Sliding Gate
    const gateGeo = new THREE.BoxGeometry(gateW - 0.2, 1.4, 0.06);
    const gateMesh = new THREE.Mesh(gateGeo, this.darkMetalMat);
    gateMesh.position.set(0, 0.8, pL / 2);
    this.siteGroup.add(gateMesh);

    this.disposables.push(backWallGeo, leftWallGeo, rightWallGeo, fWall1Geo, pillarGeo, gateGeo);
  }

  buildVegetation(pW, pL) {
    // 1. Manicured Hedges along boundary
    const hedgeMat = new THREE.MeshStandardMaterial({
      color: 0x166534,
      roughness: 0.9
    });

    const hedgeGeo = new THREE.BoxGeometry(0.5, 0.7, pL * 0.45);
    const hedgeR = new THREE.Mesh(hedgeGeo, hedgeMat);
    hedgeR.position.set(pW / 2 - 0.45, 0.35, 0);
    this.siteGroup.add(hedgeR);

    // 2. Modern Cylindrical Concrete Planters with Architectural Trees
    const planterGeo = new THREE.CylinderGeometry(0.42, 0.35, 0.65, 16);
    const foliageGeo = new THREE.IcosahedronGeometry(0.75, 2);
    const trunkGeo = new THREE.CylinderGeometry(0.08, 0.1, 1.2, 8);

    const treeMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.85 });
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });

    const treePositions = [
      [-pW / 2 + 1.2, -pL / 2 + 1.4],
      [pW / 2 - 1.2, -pL / 2 + 1.4],
      [pW / 2 - 1.2, pL / 2 - 2.2]
    ];

    treePositions.forEach(([tx, tz]) => {
      const p = new THREE.Mesh(planterGeo, this.whiteStuccoMat);
      p.position.set(tx, 0.32, tz);
      this.siteGroup.add(p);

      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.set(tx, 1.0, tz);
      this.siteGroup.add(trunk);

      const foliage = new THREE.Mesh(foliageGeo, treeMat);
      foliage.position.set(tx, 1.85, tz);
      foliage.scale.set(1.1, 1.3, 1.1);
      this.siteGroup.add(foliage);
    });

    this.disposables.push(hedgeMat, hedgeGeo, planterGeo, foliageGeo, trunkGeo, treeMat, trunkMat);
  }

  buildOutdoorPatio(pW, pL) {
    // Patio Tile Deck on the Right Garden Lawn
    const patioW = 2.8;
    const patioL = 3.2;
    const patioGeo = new THREE.BoxGeometry(patioW, 0.12, patioL);
    const patio = new THREE.Mesh(patioGeo, this.paverMat);
    patio.position.set(this.villaW / 2 + 0.8, 0.06, 0.8);
    this.siteGroup.add(patio);

    // Modern Low Stone Coffee/Fire Pit Table
    const tableGeo = new THREE.BoxGeometry(1.1, 0.35, 0.75);
    const table = new THREE.Mesh(tableGeo, this.darkMetalMat);
    table.position.set(this.villaW / 2 + 0.8, 0.24, 0.8);
    this.siteGroup.add(table);

    // 2 Outdoor Armchairs
    const chairGeo = new THREE.BoxGeometry(0.7, 0.55, 0.7);
    const c1 = new THREE.Mesh(chairGeo, this.sofaFabricMat);
    c1.position.set(this.villaW / 2 + 0.8 - 0.9, 0.32, 0.8);
    this.siteGroup.add(c1);

    const c2 = new THREE.Mesh(chairGeo, this.sofaFabricMat);
    c2.position.set(this.villaW / 2 + 0.8 + 0.9, 0.32, 0.8);
    this.siteGroup.add(c2);

    this.disposables.push(patioGeo, tableGeo, chairGeo);
  }

  // ==================== 2. Covered Car Porch & SUV Silhouette ====================
  buildCarPorch() {
    const porchW = 3.4;
    const porchL = 5.2;
    const porchH = 3.2;
    const posX = -this.villaW / 2 + porchW / 2 - 0.2;
    const posZ = this.villaL / 2 - porchL / 2 + 0.8;

    // A. Steel Columns & Trellis Beams
    const colGeo = new THREE.BoxGeometry(0.18, porchH, 0.18);
    const col1 = new THREE.Mesh(colGeo, this.darkMetalMat);
    col1.position.set(posX - porchW / 2 + 0.1, porchH / 2, posZ + porchL / 2 - 0.2);
    this.groundFloorGroup.add(col1);

    const col2 = new THREE.Mesh(colGeo, this.darkMetalMat);
    col2.position.set(posX + porchW / 2 - 0.1, porchH / 2, posZ + porchL / 2 - 0.2);
    this.groundFloorGroup.add(col2);

    // B. Pergola Roof Slat Frame with Glass Canopy
    const roofSlabGeo = new THREE.BoxGeometry(porchW, 0.16, porchL);
    const roofSlab = new THREE.Mesh(roofSlabGeo, this.darkMetalMat);
    roofSlab.position.set(posX, porchH, posZ);
    this.groundFloorGroup.add(roofSlab);

    // Wood Slat Under-Ceiling Soffit
    const soffitGeo = new THREE.BoxGeometry(porchW - 0.2, 0.04, porchL - 0.2);
    const soffit = new THREE.Mesh(soffitGeo, this.woodAccentMat);
    soffit.position.set(posX, porchH - 0.09, posZ);
    this.groundFloorGroup.add(soffit);

    // C. Luxury Modern SUV 3D Volume (Aerodynamic Body & Wheels)
    const suvGroup = new THREE.Group();
    suvGroup.position.set(posX, 0.5, posZ - 0.2);

    const carBodyGeo = new THREE.BoxGeometry(1.9, 0.75, 4.2);
    const carMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Deep midnight sapphire
      roughness: 0.15,
      metalness: 0.9
    });
    const carBody = new THREE.Mesh(carBodyGeo, carMat);
    carBody.position.y = 0.45;
    suvGroup.add(carBody);

    // Greenhouse / Cabin Glass
    const cabinGeo = new THREE.BoxGeometry(1.65, 0.65, 2.3);
    const cabin = new THREE.Mesh(cabinGeo, this.glassMat);
    cabin.position.set(0, 0.95, -0.2);
    suvGroup.add(cabin);

    // 4 Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.26, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.8 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.9 });

    const wPositions = [
      [-0.95, 0, -1.3], [0.95, 0, -1.3],
      [-0.95, 0, 1.3], [0.95, 0, 1.3]
    ];
    wPositions.forEach(([wx, wy, wz]) => {
      const tire = new THREE.Mesh(wheelGeo, wheelMat);
      tire.rotation.z = Math.PI / 2;
      tire.position.set(wx, wy, wz);
      suvGroup.add(tire);

      const rimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.28, 8);
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.z = Math.PI / 2;
      rim.position.set(wx, wy, wz);
      suvGroup.add(rim);
    });

    // Headlights
    const lightGeo = new THREE.BoxGeometry(0.35, 0.12, 0.05);
    const lightMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.8
    });
    const hl1 = new THREE.Mesh(lightGeo, lightMat);
    hl1.position.set(-0.65, 0.55, 2.12);
    suvGroup.add(hl1);
    const hl2 = new THREE.Mesh(lightGeo, lightMat);
    hl2.position.set(0.65, 0.55, 2.12);
    suvGroup.add(hl2);

    this.groundFloorGroup.add(suvGroup);

    this.registerRoomBox('car_porch', 'Car Porch & Driveway', posX, 1.5, posZ, porchW, 3.0, porchL);

    this.disposables.push(colGeo, roofSlabGeo, soffitGeo, carBodyGeo, carMat, cabinGeo, wheelGeo, wheelMat, rimMat, lightGeo, lightMat);
  }

  // ==================== 3. Ground Floor Layout & Rooms ====================
  buildGroundFloor() {
    const vW = this.villaW;
    const vL = this.villaL;
    const fH = this.floorHeight;
    const baseY = 0.45; // Plinth height

    // A. Ground Floor Marble Slab
    const floorSlabGeo = new THREE.BoxGeometry(vW, this.slabThickness, vL);
    const floorSlab = new THREE.Mesh(floorSlabGeo, this.groundFloorTileMat);
    floorSlab.position.set(0, baseY + this.slabThickness / 2, -0.4);
    this.groundFloorGroup.add(floorSlab);
    this.disposables.push(floorSlabGeo);

    // B. Architectural Wall Volumes (Clean Rectangular Contemporary Massing)
    // Left Zone: Guest Suite & Utility / Bath
    // Center-Right: Foyer, Great Living Room & Open Dining/Kitchen

    // Exterior Back Wall
    this.createExteriorWall(0, baseY + fH / 2, -0.4 - vL / 2, vW, fH, this.wallThick, this.primaryFacadeMat, this.groundFloorGroup);

    // Left Exterior Wall (Split into Stone Cladding + Feature Wood Accent)
    this.createExteriorWall(-vW / 2, baseY + fH / 2, -0.4, this.wallThick, fH, vL, this.primaryFacadeMat, this.groundFloorGroup);

    // Right Exterior Wall with Floor-to-Ceiling Living Room Glass Curtain
    const rightGlassL = vL * 0.55;
    this.createGlassCurtainWall(vW / 2, baseY + fH / 2, -0.4 + (vL - rightGlassL) / 2, this.wallThick, fH, rightGlassL, this.groundFloorGroup);
    this.createExteriorWall(vW / 2, baseY + fH / 2, -0.4 - rightGlassL / 2, this.wallThick, fH, vL - rightGlassL, this.whiteStuccoMat, this.groundFloorGroup);

    // Front Facade: Grand Covered Entrance Foyer with Warm Wood Cladding
    const frontWallW = vW * 0.45;
    this.createExteriorWall(-vW / 2 + frontWallW / 2, baseY + fH / 2, -0.4 + vL / 2, frontWallW, fH, this.wallThick, this.woodAccentMat, this.groundFloorGroup);

    // Front Entrance Door & Canopy
    this.buildGrandEntranceDoor(0.2, baseY, -0.4 + vL / 2);

    // Large Floor-to-Ceiling Living Room Front Glass
    const frontGlassW = vW * 0.42;
    this.createGlassCurtainWall(vW / 2 - frontGlassW / 2, baseY + fH / 2, -0.4 + vL / 2, frontGlassW, fH, this.wallThick, this.groundFloorGroup);

    // C. Interior Partition Walls
    // Dividing Guest Suite & Bath from Living
    this.createInteriorWall(-vW * 0.15, baseY + fH / 2, -0.4, this.partitionThick, fH, vL * 0.85, this.groundFloorGroup);
    // Dividing Kitchen from Guest Room
    this.createInteriorWall(-vW * 0.32, baseY + fH / 2, -0.4 - vL * 0.15, vW * 0.35, fH, this.partitionThick, this.groundFloorGroup);

    // D. Ground Floor Rooms & Furniture Silhouettes
    this.buildGroundFloorFurniture(vW, vL, baseY);
  }

  buildGrandEntranceDoor(x, baseY, z) {
    // Grand Pivot Door in Dark Walnut with Brushed Brass Long Handle
    const doorW = 1.3;
    const doorH = 2.4;
    const doorGeo = new THREE.BoxGeometry(doorW, doorH, 0.08);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.5 });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(x, baseY + doorH / 2, z);
    this.groundFloorGroup.add(door);

    // Long Vertical Brushed Brass Handle
    const handleGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.4, 12);
    const handle = new THREE.Mesh(handleGeo, this.goldBrassMat);
    handle.position.set(x + doorW / 2 - 0.15, baseY + doorH / 2, z + 0.07);
    this.groundFloorGroup.add(handle);

    // Modern Entrance Porch Canopy with Recessed Warm LED Spot
    const canopyGeo = new THREE.BoxGeometry(2.4, 0.18, 1.8);
    const canopy = new THREE.Mesh(canopyGeo, this.darkMetalMat);
    canopy.position.set(x, baseY + doorH + 0.2, z + 0.9);
    this.groundFloorGroup.add(canopy);

    const canopySoffitGeo = new THREE.BoxGeometry(2.3, 0.04, 1.7);
    const canopySoffit = new THREE.Mesh(canopySoffitGeo, this.woodAccentMat);
    canopySoffit.position.set(x, baseY + doorH + 0.1, z + 0.9);
    this.groundFloorGroup.add(canopySoffit);

    this.registerRoomBox('entrance_foyer', 'Grand Entrance Foyer', x, baseY + 1.5, z - 0.8, 2.5, 2.8, 2.2);

    this.disposables.push(doorGeo, doorMat, handleGeo, canopyGeo, canopySoffitGeo);
  }

  buildGroundFloorFurniture(vW, vL, baseY) {
    // 1. Great Living Room (Front Right Zone)
    const livingX = vW * 0.22;
    const livingZ = 0.6;

    // L-Shaped Sectional Sofa
    const sofaMainGeo = new THREE.BoxGeometry(2.4, 0.65, 0.95);
    const sofaL = new THREE.Mesh(sofaMainGeo, this.sofaFabricMat);
    sofaL.position.set(livingX, baseY + 0.35, livingZ);
    this.furnitureGroup.add(sofaL);

    const sofaChaiseGeo = new THREE.BoxGeometry(0.9, 0.65, 1.4);
    const sofaC = new THREE.Mesh(sofaChaiseGeo, this.sofaFabricMat);
    sofaC.position.set(livingX - 0.75, baseY + 0.35, livingZ + 0.7);
    this.furnitureGroup.add(sofaC);

    // Designer Marble Coffee Table
    const tableGeo = new THREE.BoxGeometry(1.2, 0.32, 0.7);
    const table = new THREE.Mesh(tableGeo, this.kitchenQuartzMat);
    table.position.set(livingX + 0.1, baseY + 0.2, livingZ + 0.6);
    this.furnitureGroup.add(table);

    // Media Console Feature Wall with Slatted Wood Panel
    const mediaWallGeo = new THREE.BoxGeometry(2.6, 2.2, 0.1);
    const mediaWall = new THREE.Mesh(mediaWallGeo, this.woodAccentMat);
    mediaWall.position.set(livingX, baseY + 1.2, -0.4 + vL / 2 - 0.15);
    this.furnitureGroup.add(mediaWall);

    // OLED TV Display
    const tvGeo = new THREE.BoxGeometry(1.6, 0.95, 0.04);
    const tv = new THREE.Mesh(tvGeo, this.darkMetalMat);
    tv.position.set(livingX, baseY + 1.3, -0.4 + vL / 2 - 0.22);
    this.furnitureGroup.add(tv);

    this.registerRoomBox('living_room', 'Great Living Room', livingX, baseY + 1.5, livingZ, 3.8, 2.9, 3.6);

    // 2. Open Dining Area (Back Right Zone)
    const diningX = vW * 0.24;
    const diningZ = -1.8;

    const dTableGeo = new THREE.BoxGeometry(1.8, 0.75, 1.0);
    const dTable = new THREE.Mesh(dTableGeo, this.darkMetalMat);
    dTable.position.set(diningX, baseY + 0.4, diningZ);
    this.furnitureGroup.add(dTable);

    // 6 Dining Chairs
    const chairGeo = new THREE.BoxGeometry(0.42, 0.85, 0.42);
    for (let c = 0; c < 3; c++) {
      const chair1 = new THREE.Mesh(chairGeo, this.sofaFabricMat);
      chair1.position.set(diningX - 0.6 + c * 0.6, baseY + 0.45, diningZ - 0.7);
      this.furnitureGroup.add(chair1);

      const chair2 = new THREE.Mesh(chairGeo, this.sofaFabricMat);
      chair2.position.set(diningX - 0.6 + c * 0.6, baseY + 0.45, diningZ + 0.7);
      this.furnitureGroup.add(chair2);
    }

    this.registerRoomBox('dining_area', 'Formal Dining Area', diningX, baseY + 1.5, diningZ, 3.2, 2.9, 2.6);

    // 3. Gourmet Kitchen with Central Quartz Island
    const kitchenX = -vW * 0.05;
    const kitchenZ = -2.2;

    const islandGeo = new THREE.BoxGeometry(1.9, 0.9, 0.95);
    const island = new THREE.Mesh(islandGeo, this.kitchenQuartzMat);
    island.position.set(kitchenX, baseY + 0.48, kitchenZ);
    this.furnitureGroup.add(island);

    // 3 Modern Barstools
    const stoolGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.68, 12);
    for (let b = 0; b < 3; b++) {
      const stool = new THREE.Mesh(stoolGeo, this.goldBrassMat);
      stool.position.set(kitchenX - 0.6 + b * 0.6, baseY + 0.35, kitchenZ + 0.7);
      this.furnitureGroup.add(stool);
    }

    this.registerRoomBox('kitchen', 'Gourmet Kitchen & Island', kitchenX, baseY + 1.5, kitchenZ, 2.6, 2.9, 2.4);

    // 4. Guest Bedroom Suite (Left Back Zone)
    const guestX = -vW * 0.32;
    const guestZ = -2.0;

    const bedGeo = new THREE.BoxGeometry(1.6, 0.55, 2.0);
    const bed = new THREE.Mesh(bedGeo, this.bedLinenMat);
    bed.position.set(guestX, baseY + 0.3, guestZ);
    this.furnitureGroup.add(bed);

    // Bed Headboard & Pillows
    const hbGeo = new THREE.BoxGeometry(1.8, 1.1, 0.12);
    const headboard = new THREE.Mesh(hbGeo, this.woodAccentMat);
    headboard.position.set(guestX, baseY + 0.6, guestZ - 1.05);
    this.furnitureGroup.add(headboard);

    this.registerRoomBox('guest_bedroom', 'Ground Guest Bedroom Suite', guestX, baseY + 1.5, guestZ, 2.8, 2.9, 2.8);

    // 5. Architectural Open-Riser Floating Staircase
    const stairX = -vW * 0.08;
    const stairZ = 0.2;
    const numSteps = 12;
    const stepRise = this.floorHeight / numSteps;
    const stepRun = 0.26;

    for (let s = 0; s < numSteps; s++) {
      const treadGeo = new THREE.BoxGeometry(0.95, 0.06, stepRun);
      const tread = new THREE.Mesh(treadGeo, this.upperFloorWoodMat);
      tread.position.set(stairX, baseY + (s + 1) * stepRise, stairZ - s * stepRun);
      this.furnitureGroup.add(tread);
      this.disposables.push(treadGeo);
    }

    // Glass Balustrade along stairs
    const stairGlassGeo = new THREE.BoxGeometry(0.04, 1.2, numSteps * stepRun);
    const stairGlass = new THREE.Mesh(stairGlassGeo, this.glassMat);
    stairGlass.position.set(stairX + 0.5, baseY + this.floorHeight / 2 + 0.4, stairZ - (numSteps * stepRun) / 2);
    stairGlass.rotation.x = -Math.atan2(this.floorHeight, numSteps * stepRun);
    this.furnitureGroup.add(stairGlass);

    this.disposables.push(
      sofaMainGeo, sofaChaiseGeo, tableGeo, mediaWallGeo, tvGeo,
      dTableGeo, chairGeo, islandGeo, stoolGeo, bedGeo, hbGeo, stairGlassGeo
    );
  }

  // ==================== 4. First Floor Master Suite, Bedrooms & Balcony ====================
  buildFirstFloor() {
    const vW = this.villaW;
    const vL = this.villaL;
    const fH = this.floorHeight;
    const baseY = 0.45 + fH; // Upper floor base

    // A. Upper Floor Slab (With Cantilevered Master Balcony Overhang)
    const upperSlabW = vW + 0.4;
    const upperSlabL = vL + 0.8;
    const upperSlabGeo = new THREE.BoxGeometry(upperSlabW, this.slabThickness, upperSlabL);
    const upperSlab = new THREE.Mesh(upperSlabGeo, this.upperFloorWoodMat);
    upperSlab.position.set(0, baseY + this.slabThickness / 2, -0.2);
    this.firstFloorGroup.add(upperSlab);
    this.disposables.push(upperSlabGeo);

    // B. Exterior Upper Walls
    // Back Wall
    this.createExteriorWall(0, baseY + fH / 2, -0.4 - vL / 2, vW, fH, this.wallThick, this.primaryFacadeMat, this.firstFloorGroup);

    // Left Wall (Bedroom 2 & 3 side) with architectural windows
    this.createExteriorWall(-vW / 2, baseY + fH / 2, -0.4, this.wallThick, fH, vL, this.primaryFacadeMat, this.firstFloorGroup);

    // Right Wall (Master Suite side) with Teak Wood Slat Cladding
    this.createExteriorWall(vW / 2, baseY + fH / 2, -0.4, this.wallThick, fH, vL, this.woodAccentMat, this.firstFloorGroup);

    // Front Wall with Large Floor-to-Ceiling Sliding Glass Doors Opening to Balcony
    const frontSolidW = vW * 0.35;
    this.createExteriorWall(-vW / 2 + frontSolidW / 2, baseY + fH / 2, -0.4 + vL / 2, frontSolidW, fH, this.wallThick, this.whiteStuccoMat, this.firstFloorGroup);

    // Balcony French Sliding Glass Wall (Master Bedroom & Family Lounge Access)
    const balconyGlassW = vW * 0.65;
    this.createGlassCurtainWall(vW / 2 - balconyGlassW / 2, baseY + fH / 2, -0.4 + vL / 2, balconyGlassW, fH, this.wallThick, this.firstFloorGroup);

    // C. Expansive Cantilevered Master Balcony & Glass Railing
    this.buildCantileveredBalcony(vW, vL, baseY);

    // D. First Floor Rooms & Furniture
    this.buildFirstFloorFurniture(vW, vL, baseY);
  }

  buildCantileveredBalcony(vW, vL, baseY) {
    const balcW = vW * 0.65;
    const balcL = 2.2;
    const balcX = vW / 2 - balcW / 2;
    const balcZ = -0.4 + vL / 2 + balcL / 2;

    // Balcony Floor with Cedar Wood Soffit Underneath
    const balcFloorGeo = new THREE.BoxGeometry(balcW, 0.18, balcL);
    const balcFloor = new THREE.Mesh(balcFloorGeo, this.whiteStuccoMat);
    balcFloor.position.set(balcX, baseY + 0.09, balcZ);
    this.firstFloorGroup.add(balcFloor);

    // Frameless Tempered Glass Railing with Dark Charcoal Capping
    const railH = 1.05;
    const frontRailGeo = new THREE.BoxGeometry(balcW, railH, 0.05);
    const frontRail = new THREE.Mesh(frontRailGeo, this.glassMat);
    frontRail.position.set(balcX, baseY + 0.18 + railH / 2, balcZ + balcL / 2);
    this.firstFloorGroup.add(frontRail);

    // Top Handrail Cap
    const capGeo = new THREE.BoxGeometry(balcW, 0.05, 0.08);
    const cap = new THREE.Mesh(capGeo, this.darkMetalMat);
    cap.position.set(balcX, baseY + 0.18 + railH, balcZ + balcL / 2);
    this.firstFloorGroup.add(cap);

    // Side Glass Railing
    const sideRailGeo = new THREE.BoxGeometry(0.05, railH, balcL);
    const sideRail = new THREE.Mesh(sideRailGeo, this.glassMat);
    sideRail.position.set(balcX + balcW / 2, baseY + 0.18 + railH / 2, balcZ);
    this.firstFloorGroup.add(sideRail);

    // Outdoor Lounger Chairs on Balcony
    const loungerGeo = new THREE.BoxGeometry(0.65, 0.45, 1.6);
    const lounger = new THREE.Mesh(loungerGeo, this.sofaFabricMat);
    lounger.position.set(balcX + 0.6, baseY + 0.35, balcZ);
    this.firstFloorGroup.add(lounger);

    this.registerRoomBox('master_balcony', 'Expansive Master Balcony', balcX, baseY + 1.2, balcZ, balcW, 2.2, balcL);

    this.disposables.push(balcFloorGeo, frontRailGeo, capGeo, sideRailGeo, loungerGeo);
  }

  buildFirstFloorFurniture(vW, vL, baseY) {
    // 1. Master Bedroom Suite (Front Right)
    const masterX = vW * 0.22;
    const masterZ = 0.4;

    // King Size Luxury Platform Bed
    const bedGeo = new THREE.BoxGeometry(2.0, 0.55, 2.2);
    const bed = new THREE.Mesh(bedGeo, this.bedLinenMat);
    bed.position.set(masterX, baseY + 0.35, masterZ);
    this.furnitureGroup.add(bed);

    // Wood Slat Accent Feature Wall behind King Bed
    const wallGeo = new THREE.BoxGeometry(3.0, 2.4, 0.08);
    const wall = new THREE.Mesh(wallGeo, this.woodAccentMat);
    wall.position.set(masterX, baseY + 1.25, masterZ - 1.2);
    this.furnitureGroup.add(wall);

    // Designer Pillows
    const pillowGeo = new THREE.BoxGeometry(0.6, 0.18, 0.35);
    const p1 = new THREE.Mesh(pillowGeo, this.pillowAccentMat);
    p1.position.set(masterX - 0.45, baseY + 0.68, masterZ - 0.7);
    this.furnitureGroup.add(p1);
    const p2 = new THREE.Mesh(pillowGeo, this.pillowAccentMat);
    p2.position.set(masterX + 0.45, baseY + 0.68, masterZ - 0.7);
    this.furnitureGroup.add(p2);

    this.registerRoomBox('master_bedroom', 'Master Bedroom Suite', masterX, baseY + 1.5, masterZ, 3.6, 2.9, 3.4);

    // 2. Family Lounge / Media Snug (Center Front)
    const loungeX = -vW * 0.08;
    const loungeZ = 0.6;

    const sofaGeo = new THREE.BoxGeometry(1.6, 0.6, 0.75);
    const sofa = new THREE.Mesh(sofaGeo, this.sofaFabricMat);
    sofa.position.set(loungeX, baseY + 0.35, loungeZ);
    this.furnitureGroup.add(sofa);

    this.registerRoomBox('family_lounge', 'Family Lounge & Library', loungeX, baseY + 1.5, loungeZ, 2.4, 2.9, 2.6);

    // 3. Bedroom 2 (Left Back)
    const b2X = -vW * 0.28;
    const b2Z = -1.8;

    const b2Geo = new THREE.BoxGeometry(1.5, 0.5, 1.9);
    const b2 = new THREE.Mesh(b2Geo, this.bedLinenMat);
    b2.position.set(b2X, baseY + 0.3, b2Z);
    this.furnitureGroup.add(b2);

    this.registerRoomBox('bedroom_2', 'Bedroom 2 with Attached Bath', b2X, baseY + 1.5, b2Z, 2.8, 2.9, 2.8);

    // 4. Bedroom 3 / Home Office (Left Front)
    const b3X = -vW * 0.28;
    const b3Z = 0.8;

    const deskGeo = new THREE.BoxGeometry(1.4, 0.75, 0.6);
    const desk = new THREE.Mesh(deskGeo, this.darkMetalMat);
    desk.position.set(b3X, baseY + 0.4, b3Z);
    this.furnitureGroup.add(desk);

    this.registerRoomBox('bedroom_3', 'Bedroom 3 / Study Suite', b3X, baseY + 1.5, b3Z, 2.6, 2.9, 2.4);

    this.disposables.push(bedGeo, wallGeo, pillowGeo, sofaGeo, b2Geo, deskGeo);
  }

  // ==================== 5. Layered Flat Roof & Cantilevered Pergola ====================
  buildRoofAndPergola() {
    const vW = this.villaW;
    const vL = this.villaL;
    const fH = this.floorHeight;
    const roofY = 0.45 + fH * 2; // Roof slab level

    // A. Main Roof Slab with Parapet Wall Coping
    const roofSlabGeo = new THREE.BoxGeometry(vW + 0.6, 0.24, vL + 0.6);
    const roofSlab = new THREE.Mesh(roofSlabGeo, this.whiteStuccoMat);
    roofSlab.position.set(0, roofY + 0.12, -0.4);
    this.roofGroup.add(roofSlab);

    // Parapet Wall (0.65m height for safety & clean modern line)
    const pWallGeo = new THREE.BoxGeometry(vW + 0.6, 0.65, 0.16);
    const pFront = new THREE.Mesh(pWallGeo, this.primaryFacadeMat);
    pFront.position.set(0, roofY + 0.24 + 0.32, -0.4 + (vL + 0.6) / 2);
    this.roofGroup.add(pFront);

    // B. Cantilevered Architectural Pergola on Roof
    const pergolaW = vW * 0.45;
    const pergolaL = 3.6;
    const pergH = 2.4;
    const pergX = vW * 0.2;
    const pergZ = 0.2;

    const beamMat = this.darkMetalMat;
    for (let b = 0; b < 6; b++) {
      const beamGeo = new THREE.BoxGeometry(pergolaW, 0.1, 0.15);
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(pergX, roofY + pergH, pergZ - pergolaL / 2 + b * (pergolaL / 5));
      this.roofGroup.add(beam);
      this.disposables.push(beamGeo);
    }

    // Solar Panel Arrays on Concealed Roof Section
    const solarGeo = new THREE.BoxGeometry(1.6, 0.08, 1.0);
    const solarMat = new THREE.MeshStandardMaterial({
      color: 0x0369a1,
      roughness: 0.1,
      metalness: 0.8
    });
    for (let sp = 0; sp < 3; sp++) {
      const solar = new THREE.Mesh(solarGeo, solarMat);
      solar.position.set(-vW * 0.25, roofY + 0.35, -1.2 - sp * 1.2);
      solar.rotation.x = Math.PI * 0.08;
      this.roofGroup.add(solar);
      this.disposables.push(solarGeo);
    }

    this.registerRoomBox('roof_terrace', 'Skyline Roof Terrace & Pergola', 0, roofY + 1.2, -0.4, vW, 2.4, vL);

    this.disposables.push(roofSlabGeo, pWallGeo, solarMat);
  }

  // ==================== 6. Architectural Lighting System ====================
  buildArchitecturalLighting() {
    // 1. Natural Golden Sun Light (Daylight Key)
    this.sunLight = new THREE.DirectionalLight(0xfff8ee, 2.6);
    this.sunLight.position.set(16, 22, 14);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 60;
    this.sunLight.shadow.camera.left = -16;
    this.sunLight.shadow.camera.right = 16;
    this.sunLight.shadow.camera.top = 16;
    this.sunLight.shadow.camera.bottom = -16;
    this.lightsGroup.add(this.sunLight);

    // 2. Soft Ambient Skylight
    this.hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x1e293b, 1.2);
    this.lightsGroup.add(this.hemiLight);

    // 3. Interior Warm 3000K Illumination Clusters (Living, Dining, Master Bed)
    this.interiorLight = new THREE.PointLight(0xfef08a, 0.0, 10.0); // Activated in night mode
    this.interiorLight.position.set(1.5, 2.0, 0.5);
    this.lightsGroup.add(this.interiorLight);

    // 4. Exterior Facade Wall Washer Uplights (Night Drama)
    this.facadeUplight = new THREE.SpotLight(0xfbbf24, 0.0, 12.0, Math.PI / 4, 0.5);
    this.facadeUplight.position.set(-this.villaW / 2 + 1.0, 0.4, this.villaL / 2 + 1.2);
    this.facadeUplight.target.position.set(-this.villaW / 2 + 1.0, 3.5, this.villaL / 2 - 0.4);
    this.lightsGroup.add(this.facadeUplight);
    this.lightsGroup.add(this.facadeUplight.target);

    // 5. Entrance Porch Recessed Downlight
    this.porchDownlight = new THREE.PointLight(0xfef08a, 0.0, 6.0);
    this.porchDownlight.position.set(0.2, 3.2, this.villaL / 2 + 0.4);
    this.lightsGroup.add(this.porchDownlight);
  }

  // ==================== 7. Dimension Lines & Measurement Annotations ====================
  buildDimensionAnnotations() {
    this.annotationsGroup.clear();

    if (!this.showDimensions) return;

    const pW = this.plotW;
    const pL = this.plotL;
    const vW = this.villaW;
    const vH = this.floorHeight * 2 + 0.6;

    // 1. Plot Frontage Dimension Line
    this.createCADDimension(
      new THREE.Vector3(-pW / 2, 0.15, pL / 2 + 1.2),
      new THREE.Vector3(pW / 2, 0.15, pL / 2 + 1.2),
      `Plot Frontage: ${pW.toFixed(1)}m (${this.plotPreset.split('x')[0]}')`,
      0x00f2fe
    );

    // 2. Plot Depth Dimension Line
    this.createCADDimension(
      new THREE.Vector3(pW / 2 + 1.2, 0.15, -pL / 2),
      new THREE.Vector3(pW / 2 + 1.2, 0.15, pL / 2),
      `Plot Depth: ${pL.toFixed(1)}m (${this.plotPreset.split('x')[1]}')`,
      0x38bdf8
    );

    // 3. Villa Height Dimension Line
    this.createCADDimension(
      new THREE.Vector3(-pW / 2 - 0.6, 0.45, 0),
      new THREE.Vector3(-pW / 2 - 0.6, 0.45 + vH, 0),
      `Height: ${vH.toFixed(1)}m (G+1 Villa)`,
      0xa855f7
    );

    // 4. Built-Up Area Callout
    const areaSprite = this.createTextSprite(`Built-Up: ${this.builtUpSqFt.toLocaleString()} sq.ft | ${this.bhk}`, '#10b981');
    areaSprite.position.set(0, 0.35, pL / 2 + 1.8);
    areaSprite.scale.set(3.4, 0.8, 1);
    this.annotationsGroup.add(areaSprite);
  }

  createCADDimension(pA, pB, text, colorHex = 0x00f2fe) {
    const points = [pA, pB];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color: colorHex, linewidth: 2 });
    this.annotationsGroup.add(new THREE.Line(geo, mat));

    // Midpoint Text Sprite
    const mid = new THREE.Vector3().addVectors(pA, pB).multiplyScalar(0.5);
    const sprite = this.createTextSprite(text, `#${colorHex.toString(16).padStart(6, '0')}`);
    sprite.position.copy(mid).add(new THREE.Vector3(0, 0.3, 0));
    sprite.scale.set(2.4, 0.6, 1);
    this.annotationsGroup.add(sprite);

    this.disposables.push(geo, mat);
  }

  createTextSprite(text, color = '#00f2fe') {
    const canvas = document.createElement('canvas');
    canvas.width = 380;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(10, 19, 41, 0.85)';
    ctx.roundRect(4, 4, 372, 88, 14);
    ctx.fill();

    ctx.strokeStyle = `${color}66`;
    ctx.lineWidth = 2;
    ctx.roundRect(4, 4, 372, 88, 14);
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 190, 48);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    return new THREE.Sprite(spriteMat);
  }

  // ==================== Helper Builders ====================
  createExteriorWall(x, y, z, w, h, d, material, parentGroup) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parentGroup.add(mesh);
    this.facadeMeshes.push(mesh);
    this.disposables.push(geo);
    return mesh;
  }

  createInteriorWall(x, y, z, w, h, d, parentGroup) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, this.whiteStuccoMat);
    mesh.position.set(x, y, z);
    parentGroup.add(mesh);
    this.disposables.push(geo);
    return mesh;
  }

  createGlassCurtainWall(x, y, z, w, h, d, parentGroup) {
    // Glass Pane
    const geo = new THREE.BoxGeometry(w, h, d);
    const glass = new THREE.Mesh(geo, this.glassMat);
    glass.position.set(x, y, z);
    parentGroup.add(glass);

    // Architectural Dark Mullion Frames
    const frameGeo = new THREE.BoxGeometry(w + 0.04, h + 0.04, 0.06);
    const frame = new THREE.Mesh(frameGeo, this.darkMetalMat);
    frame.position.set(x, y, z);
    parentGroup.add(frame);

    this.disposables.push(geo, frameGeo);
  }

  registerRoomBox(id, name, cx, cy, cz, w, h, d) {
    this.roomBoundingBoxes.set(id, {
      id,
      name,
      center: new THREE.Vector3(cx, cy, cz),
      size: new THREE.Vector3(w, h, d)
    });
  }

  // ==================== Dynamic State Controllers ====================
  setPlotPreset(preset) {
    if (this.plotPreset === preset) return;
    this.plotPreset = preset;
    this.rebuild();
  }

  setMaterialCladding(cladding) {
    this.materialCladding = cladding;
    const tex = this.claddingTextures[cladding] || this.claddingTextures.travertine;
    this.primaryFacadeMat.map = tex;
    this.primaryFacadeMat.needsUpdate = true;
  }

  setFloorFilter(filter) {
    this.floorFilter = filter; // 'all', 'ground', 'first', 'roof'
    this.updateFloorVisibility();
  }

  updateFloorVisibility() {
    if (this.floorFilter === 'ground') {
      this.groundFloorGroup.visible = true;
      this.firstFloorGroup.visible = false;
      this.roofGroup.visible = false;
    } else if (this.floorFilter === 'first') {
      this.groundFloorGroup.visible = false;
      this.firstFloorGroup.visible = true;
      this.roofGroup.visible = false;
    } else if (this.floorFilter === 'roof') {
      this.groundFloorGroup.visible = true;
      this.firstFloorGroup.visible = true;
      this.roofGroup.visible = true;
    } else {
      // 'all'
      this.groundFloorGroup.visible = true;
      this.firstFloorGroup.visible = true;
      this.roofGroup.visible = true;
    }
  }

  setTimeOfDay(timeOfDay) {
    this.timeOfDay = timeOfDay;
    this.updateTimeOfDayLighting();
  }

  updateTimeOfDayLighting() {
    const isNight = this.timeOfDay === 'night';

    if (this.sunLight) {
      this.sunLight.intensity = isNight ? 0.08 : 2.6;
      this.sunLight.color.setHex(isNight ? 0x38bdf8 : 0xfff8ee);
    }

    if (this.hemiLight) {
      this.hemiLight.intensity = isNight ? 0.25 : 1.2;
      this.hemiLight.color.setHex(isNight ? 0x1e1b4b : 0xe0f2fe);
      this.hemiLight.groundColor.setHex(isNight ? 0x050b18 : 0x1e293b);
    }

    if (this.interiorLight) {
      this.interiorLight.intensity = isNight ? 4.2 : 0.4;
      this.interiorLight.color.setHex(0xfef08a);
    }

    if (this.facadeUplight) {
      this.facadeUplight.intensity = isNight ? 5.5 : 0.0;
    }

    if (this.porchDownlight) {
      this.porchDownlight.intensity = isNight ? 3.8 : 0.2;
    }
  }

  toggleDimensions(visible) {
    this.showDimensions = visible !== undefined ? visible : !this.showDimensions;
    this.annotationsGroup.visible = this.showDimensions;
  }

  selectRoom(roomId) {
    this.selectedRoom = roomId;
    this.roomBoundsGroup.clear();

    if (!roomId || !this.roomBoundingBoxes.has(roomId)) return null;

    const room = this.roomBoundingBoxes.get(roomId);
    const boxGeo = new THREE.BoxGeometry(room.size.x, room.size.y, room.size.z);
    const boxMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      wireframe: true,
      transparent: true,
      opacity: 0.75
    });
    const highlightMesh = new THREE.Mesh(boxGeo, boxMat);
    highlightMesh.position.copy(room.center);
    this.roomBoundsGroup.add(highlightMesh);

    return room;
  }

  rebuild() {
    // Clear all child groups
    this.siteGroup.clear();
    this.groundFloorGroup.clear();
    this.firstFloorGroup.clear();
    this.roofGroup.clear();
    this.furnitureGroup.clear();
    this.lightsGroup.clear();
    this.annotationsGroup.clear();
    this.roomBoundsGroup.clear();
    this.facadeMeshes = [];
    this.roomBoundingBoxes.clear();

    this.buildVilla();
  }

  getAttachmentPoints() {
    const vW = this.villaW;
    const vL = this.villaL;
    const fH = this.floorHeight;
    return {
      'roof': new THREE.Vector3(0, 0.45 + fH * 2 + 1.2, -0.4),
      'upper-cantilever': new THREE.Vector3(vW * 0.2, 0.45 + fH + 1.2, -0.4 + vL / 2 + 1.1),
      'interior': new THREE.Vector3(vW * 0.22, 0.45 + 1.5, 0.6),
      'walls': new THREE.Vector3(-vW / 2, 0.45 + fH * 0.8, -0.4),
      'exterior-facade': new THREE.Vector3(vW / 2, 0.45 + fH * 1.5, -0.4),
      'foundation-slab': new THREE.Vector3(0, 0.45, -0.4 + vL / 2),
      'ground-plane': new THREE.Vector3(this.plotW * 0.35, 0.1, 0.8),
      'ground-floor-door': new THREE.Vector3(0.2, 0.45 + 1.4, -0.4 + vL / 2),
      'structural-columns': new THREE.Vector3(-vW / 2, 0.45 + fH, -0.4 + vL / 2),
      'balcony-railing': new THREE.Vector3(vW * 0.2, 0.45 + fH + 1.0, -0.4 + vL / 2 + 2.2)
    };
  }

  dispose() {
    this.disposables.forEach(item => {
      if (item && typeof item.dispose === 'function') {
        item.dispose();
      }
    });
  }
}
