// ==================== Plan Architectures 3D Models ====================
// Dedicated 3D architectural house walkthrough models tailored to each of the 10 designs.
// Includes structural framing, interior CAD furnishings, multi-level elevations,
// staircases, vehicles, landscape, and exact room waypoints.

import * as THREE from 'three';

// Common Materials Cache
function getMaterials(planColorHex = 0x38bdf8) {
  return {
    wallMat: new THREE.MeshStandardMaterial({
      color: 0x111e33,
      roughness: 0.7,
      metalness: 0.15
    }),
    wallWhiteMat: new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.8,
      metalness: 0.05
    }),
    wallBrickMat: new THREE.MeshStandardMaterial({
      color: 0x9a3412,
      roughness: 0.85,
      metalness: 0.1
    }),
    wallWoodMat: new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.6,
      metalness: 0.1
    }),
    accentMat: new THREE.MeshStandardMaterial({
      color: planColorHex,
      roughness: 0.3,
      metalness: 0.5,
      emissive: planColorHex,
      emissiveIntensity: 0.15
    }),
    tileFloorMat: new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.2,
      metalness: 0.05
    }),
    woodFloorMat: new THREE.MeshStandardMaterial({
      color: 0xa16207,
      roughness: 0.45,
      metalness: 0.1
    }),
    terracottaFloorMat: new THREE.MeshStandardMaterial({
      color: 0xc2410c,
      roughness: 0.7,
      metalness: 0.05
    }),
    glassMat: new THREE.MeshPhysicalMaterial({
      color: 0x7dd3fc,
      transmission: 0.9,
      opacity: 0.65,
      transparent: true,
      roughness: 0.05,
      ior: 1.5
    }),
    frameMat: new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.2,
      metalness: 0.8
    }),
    goldMat: new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.2,
      metalness: 0.9
    }),
    roofMat: new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.6,
      metalness: 0.2
    }),
    terracottaTileMat: new THREE.MeshStandardMaterial({
      color: 0xb45309,
      roughness: 0.8,
      metalness: 0.1
    }),
    grassMat: new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.9
    }),
    waterMat: new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.05,
      metalness: 0.8,
      transparent: true,
      opacity: 0.85
    })
  };
}

// Helper: Add standard wall
function createWall(group, w, h, d, x, y, z, mat, accentMat) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);

  if (accentMat) {
    const capGeo = new THREE.BoxGeometry(w + 0.02, 0.05, d + 0.02);
    const cap = new THREE.Mesh(capGeo, accentMat);
    cap.position.set(x, y + h / 2 + 0.025, z);
    group.add(cap);
  }
  return mesh;
}

// Helper: Add Low-Poly CAD Vehicle
export function createCADVehicle(color = 0x38bdf8, isSuv = false) {
  const car = new THREE.Group();
  const bodyH = isSuv ? 0.8 : 0.55;
  const bodyW = isSuv ? 2.0 : 1.8;
  const bodyL = isSuv ? 4.2 : 3.8;

  // Lower Chassis
  const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.25, metalness: 0.7 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(bodyW, bodyH, bodyL), bodyMat);
  body.position.y = 0.5 + bodyH / 2;
  body.castShadow = true;
  car.add(body);

  // Cabin
  const cabinH = isSuv ? 0.75 : 0.55;
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(bodyW * 0.9, cabinH, bodyL * 0.55),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.9 })
  );
  cabin.position.set(0, 0.5 + bodyH + cabinH / 2, -0.2);
  car.add(cabin);

  // Wheels
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.85 });
  const wRadius = isSuv ? 0.4 : 0.32;
  const wheelGeo = new THREE.CylinderGeometry(wRadius, wRadius, 0.26, 16);
  [
    [-bodyW / 2 - 0.06, bodyL * 0.28],
    [bodyW / 2 + 0.06, bodyL * 0.28],
    [-bodyW / 2 - 0.06, -bodyL * 0.28],
    [bodyW / 2 + 0.06, -bodyL * 0.28]
  ].forEach(([wx, wz]) => {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(wx, wRadius, wz);
    wheel.castShadow = true;
    car.add(wheel);
  });

  // Headlights
  const hlMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  [-0.6, 0.6].forEach(lx => {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 0.05), hlMat);
    hl.position.set(lx, 0.5 + bodyH * 0.5, bodyL / 2 + 0.03);
    car.add(hl);
  });

  return car;
}

// Helper: Add Standard Living Room Furniture Set
function addLivingRoomSet(group, cx, cz, mats) {
  // L-Shaped Sectional Sofa
  const sofaMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.7 });
  const sofa1 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.65, 0.9), sofaMat);
  sofa1.position.set(cx, 0.72, cz);
  sofa1.castShadow = true;
  group.add(sofa1);

  const sofa2 = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.65, 1.4), sofaMat);
  sofa2.position.set(cx - 0.75, 0.72, cz - 1.15);
  sofa2.castShadow = true;
  group.add(sofa2);

  // Modern Coffee Table
  const table = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.35, 0.7), mats.frameMat);
  table.position.set(cx, 0.58, cz - 0.8);
  group.add(table);

  // TV Wall Unit
  const tvPanel = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 1.2, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.1, metalness: 0.95 })
  );
  tvPanel.position.set(cx, 1.8, cz - 2.8);
  group.add(tvPanel);

  const consoleUnit = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.4, 0.5), mats.wallWoodMat);
  consoleUnit.position.set(cx, 0.6, cz - 2.8);
  group.add(consoleUnit);
}

// Helper: Add Modular Kitchen Counter
function addKitchenSet(group, cx, cz, mats, isIsland = false) {
  const cabMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 });
  const graniteMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.15, metalness: 0.4 });

  // Main Counter Run
  const c1 = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.85, 0.7), cabMat);
  c1.position.set(cx, 0.83, cz);
  group.add(c1);

  const top1 = new THREE.Mesh(new THREE.BoxGeometry(2.65, 0.06, 0.75), graniteMat);
  top1.position.set(cx, 1.28, cz);
  group.add(top1);

  // Gas Stove Hob
  const stove = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.04, 0.45), mats.frameMat);
  stove.position.set(cx - 0.4, 1.32, cz);
  group.add(stove);

  // Chimney Hood
  const hood = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.5), mats.frameMat);
  hood.position.set(cx - 0.4, 2.4, cz);
  group.add(hood);

  if (isIsland) {
    // Island Counter with Bar Stools
    const island = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.9, 1.0), graniteMat);
    island.position.set(cx, 0.85, cz + 1.8);
    group.add(island);

    for (let s = -0.6; s <= 0.6; s += 0.6) {
      const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.75, 12), mats.wallWoodMat);
      stool.position.set(cx + s, 0.78, cz + 2.6);
      group.add(stool);
    }
  }
}

// Helper: Add Master Bedroom Suite
function addMasterBedroom(group, cx, cz, mats) {
  // King Size Bed Base
  const bed = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.45, 2.4), mats.wallWoodMat);
  bed.position.set(cx, 0.63, cz);
  group.add(bed);

  // White Linen Mattress
  const mattress = new THREE.Mesh(
    new THREE.BoxGeometry(2.1, 0.35, 2.3),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 })
  );
  mattress.position.set(cx, 0.98, cz);
  group.add(mattress);

  // Pillows
  for (let p = -0.55; p <= 0.55; p += 1.1) {
    const pillow = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.18, 0.45),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.8 })
    );
    pillow.position.set(cx + p, 1.2, cz - 0.75);
    group.add(pillow);
  }

  // Side Tables with Table Lamps
  [-1.45, 1.45].forEach(sx => {
    const sideTable = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.5), mats.wallWoodMat);
    sideTable.position.set(cx + sx, 0.7, cz - 0.6);
    group.add(sideTable);

    const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.3, 12), mats.goldMat);
    lamp.position.set(cx + sx, 1.15, cz - 0.6);
    group.add(lamp);
  });

  // Wardrobe Closet
  const wardrobe = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 2.4, 2.2),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.3 })
  );
  wardrobe.position.set(cx - 2.0, 1.6, cz);
  group.add(wardrobe);
}

// Helper: Add Traditional Chettinad Teakwood Pillar
function createChettinadPillar(mats, height = 3.2) {
  const pillar = new THREE.Group();

  // Stone Footing Base
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.3, 0.48), mats.frameMat);
  base.position.y = 0.15;
  pillar.add(base);

  // Turned Teak Shaft
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, height - 0.6, 16), mats.wallWoodMat);
  shaft.position.y = 0.3 + (height - 0.6) / 2;
  pillar.add(shaft);

  // Brass Ring Accent
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.03, 8, 24), mats.goldMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 1.6;
  pillar.add(ring);

  // Carved Wooden Capital Bracket
  const cap = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.3, 0.52), mats.wallWoodMat);
  cap.position.y = height - 0.15;
  pillar.add(cap);

  return pillar;
}

// Helper: Add Traditional Tulsi Vrindavan Pedestal
function createTulsiPedestal(mats) {
  const tulsiGroup = new THREE.Group();

  // Stone Step Platform
  const step = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.15, 1.2), mats.frameMat);
  step.position.y = 0.075;
  tulsiGroup.add(step);

  // Ornate Carved Pedestal
  const pedestal = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.7, 0.8), mats.terracottaFloorMat);
  pedestal.position.y = 0.15 + 0.35;
  tulsiGroup.add(pedestal);

  // Diya Niche on Pedestal
  const niche = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.18, 8), mats.goldMat);
  niche.position.set(0, 0.85, 0.41);
  tulsiGroup.add(niche);

  // Green Tulsi Plant Foliage
  const plantMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.9 });
  const bush = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), plantMat);
  bush.position.y = 0.85 + 0.35;
  tulsiGroup.add(bush);

  return tulsiGroup;
}

// ==================== 10 Tailored Plan Builders ====================

// 1. OPTION 1: Modern Minimalist Facade with Vastu Alignment (plan-1)
export function buildPlan1Minimalist(houseGroup, roofGroup, houseW, houseD, wallH, planColorHex) {
  const mats = getMaterials(planColorHex);
  const midY = 0.4 + wallH / 2;
  const halfW = houseW / 2;
  const halfD = houseD / 2;

  // Exterior Perimeter Walls
  createWall(houseGroup, houseW, wallH, 0.24, 0, midY, -halfD, mats.wallMat, mats.accentMat);
  createWall(houseGroup, 0.24, wallH, houseD, -halfW, midY, 0, mats.wallMat, mats.accentMat);
  createWall(houseGroup, 0.24, wallH, houseD, halfW, midY, 0, mats.wallMat, mats.accentMat);

  // Front Wall with North-East Entrance
  const doorW = 2.2;
  createWall(houseGroup, houseW * 0.55, wallH, 0.24, -halfW + houseW * 0.275, midY, halfD, mats.wallMat, mats.accentMat);
  createWall(houseGroup, houseW * 0.25, wallH, 0.24, halfW - houseW * 0.125, midY, halfD, mats.wallMat, mats.accentMat);
  // Lintel over door
  createWall(houseGroup, doorW, 0.8, 0.24, halfW - houseW * 0.25 - doorW / 2, 0.4 + wallH - 0.4, halfD, mats.wallMat);

  // Front Left Horizontal Cedar Louvers
  for (let l = 0.8; l < wallH; l += 0.35) {
    const louver = new THREE.Mesh(new THREE.BoxGeometry(houseW * 0.48, 0.08, 0.08), mats.wallWoodMat);
    louver.position.set(-halfW + houseW * 0.25, 0.4 + l, halfD + 0.15);
    houseGroup.add(louver);
  }

  // Interior Partitions
  // Living divider
  createWall(houseGroup, houseW * 0.65, wallH, 0.2, -houseW * 0.15, midY, 0, mats.wallMat);
  // Master bed vs kitchen divider
  createWall(houseGroup, 0.2, wallH, halfD, 0, midY, -halfD / 2, mats.wallMat);
  // Puja Sanctum Enclosure (North-East)
  createWall(houseGroup, 1.8, wallH, 0.15, halfW - 0.9, midY, halfD * 0.35, mats.wallWhiteMat);
  createWall(houseGroup, 0.15, wallH, 1.6, halfW - 1.8, midY, halfD * 0.35 + 0.8, mats.wallWhiteMat);

  // Mandir Marble Shrine
  const mandir = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.5), mats.wallWhiteMat);
  mandir.position.set(halfW - 0.8, 1.0, halfD * 0.35 + 0.8);
  houseGroup.add(mandir);

  const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 0.18, 12), mats.goldMat);
  bell.position.set(halfW - 0.8, 2.1, halfD * 0.35 + 0.8);
  houseGroup.add(bell);

  // Furnishings
  addLivingRoomSet(houseGroup, -houseW * 0.25, houseD * 0.25, mats);
  addKitchenSet(houseGroup, houseW * 0.25, -houseD * 0.28, mats);
  addMasterBedroom(houseGroup, -houseW * 0.25, -houseD * 0.28, mats);

  // Front Car Parking Port with Parked Sedan
  const car = createCADVehicle(0x38bdf8, false);
  car.position.set(-houseW * 0.5 - 2.2, 0, houseD * 0.3);
  houseGroup.add(car);

  // Flat RCC Roof with Water Tank
  const slab = new THREE.Mesh(new THREE.BoxGeometry(houseW + 0.6, 0.25, houseD + 0.6), mats.roofMat);
  slab.position.set(0, wallH + 0.52, 0);
  roofGroup.add(slab);

  // Overhead Sintex Water Tank
  const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 1.4, 16), mats.frameMat);
  tank.position.set(-halfW + 1.2, wallH + 0.52 + 0.85, -halfD + 1.2);
  roofGroup.add(tank);
}

// 2. OPTION 2: Contemporary Glass Elevation Villa Layout (plan-2)
export function buildPlan2GlassDuplex(houseGroup, roofGroup, houseW, houseD, wallH, planColorHex) {
  const mats = getMaterials(planColorHex);
  const doubleH = wallH * 1.7; // Double height great room!
  const halfW = houseW / 2;
  const halfD = houseD / 2;

  // Exterior Back & Side Walls (Tall Double Height)
  createWall(houseGroup, houseW, doubleH, 0.24, 0, 0.4 + doubleH / 2, -halfD, mats.wallMat, mats.accentMat);
  createWall(houseGroup, 0.24, doubleH, houseD, -halfW, 0.4 + doubleH / 2, 0, mats.wallMat, mats.accentMat);
  createWall(houseGroup, 0.24, doubleH, houseD, halfW, 0.4 + doubleH / 2, 0, mats.wallMat, mats.accentMat);

  // FRONT FACADE: Full 2-Story Glass Curtain Wall with Dark Mullions!
  const glassFront = new THREE.Mesh(new THREE.BoxGeometry(houseW - 0.4, doubleH - 0.2, 0.08), mats.glassMat);
  glassFront.position.set(0, 0.4 + doubleH / 2, halfD);
  houseGroup.add(glassFront);

  // Black Mullion Grid Lines
  for (let mx = -halfW + 1.6; mx < halfW; mx += 1.8) {
    const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.1, doubleH, 0.12), mats.frameMat);
    mullion.position.set(mx, 0.4 + doubleH / 2, halfD);
    houseGroup.add(mullion);
  }
  const midBeam = new THREE.Mesh(new THREE.BoxGeometry(houseW, 0.2, 0.16), mats.frameMat);
  midBeam.position.set(0, 0.4 + wallH, halfD);
  houseGroup.add(midBeam);

  // Floating Cantilevered Open Staircase
  const numSteps = 12;
  const stepH = (wallH) / numSteps;
  const stepL = 1.1;
  const startX = houseW * 0.28;
  for (let s = 0; s < numSteps; s++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(stepL, 0.08, 0.32), mats.woodFloorMat);
    step.position.set(startX, 0.4 + s * stepH + 0.04, houseD * 0.25 - s * 0.32);
    houseGroup.add(step);
  }

  // Upper Mezzanine Gallery Floor Slab
  const mezGeo = new THREE.BoxGeometry(houseW * 0.55, 0.22, houseD * 0.45);
  const mezFloor = new THREE.Mesh(mezGeo, mats.woodFloorMat);
  mezFloor.position.set(-houseW * 0.22, 0.4 + wallH, -houseD * 0.25);
  houseGroup.add(mezFloor);

  // Mezzanine Glass Balustrade Guardrail
  const mezRail = new THREE.Mesh(new THREE.BoxGeometry(houseW * 0.55, 0.9, 0.05), mats.glassMat);
  mezRail.position.set(-houseW * 0.22, 0.4 + wallH + 0.45, -houseD * 0.02);
  houseGroup.add(mezRail);

  // Suspended Modern Geometric Chandelier
  const chanCord = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.2, 8), mats.goldMat);
  chanCord.position.set(0, 0.4 + doubleH - 1.2, houseD * 0.2);
  houseGroup.add(chanCord);

  const chanRing = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.05, 8, 24), mats.goldMat);
  chanRing.rotation.x = Math.PI / 2;
  chanRing.position.set(0, 0.4 + doubleH - 2.2, houseD * 0.2);
  houseGroup.add(chanRing);

  // Double-Height Great Room Furniture + Island Kitchen
  addLivingRoomSet(houseGroup, -houseW * 0.22, houseD * 0.2, mats);
  addKitchenSet(houseGroup, houseW * 0.22, -houseD * 0.2, mats, true);

  // Roof with Skylight
  const roof = new THREE.Mesh(new THREE.BoxGeometry(houseW + 0.6, 0.25, houseD + 0.6), mats.roofMat);
  roof.position.set(0, 0.4 + doubleH + 0.12, 0);
  roofGroup.add(roof);

  const skylight = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 3.2), mats.glassMat);
  skylight.position.set(0, 0.4 + doubleH + 0.25, 0);
  roofGroup.add(skylight);
}

// 3. OPTION 3: Traditional Heritage Slope Roof Elevation with Courtyard (plan-3)
export function buildPlan3HeritageCourtyard(houseGroup, roofGroup, houseW, houseD, wallH, planColorHex) {
  const mats = getMaterials(planColorHex);
  const midY = 0.4 + wallH / 2;
  const halfW = houseW / 2;
  const halfD = houseD / 2;

  // Exterior Terracotta/Red-Oxide Perimeter Walls
  createWall(houseGroup, houseW, wallH, 0.26, 0, midY, -halfD, mats.wallMat, mats.accentMat);
  createWall(houseGroup, 0.26, wallH, houseD, -halfW, midY, 0, mats.wallMat, mats.accentMat);
  createWall(houseGroup, 0.26, wallH, houseD, halfW, midY, 0, mats.wallMat, mats.accentMat);

  // Front Raised Thinnai Veranda with Red-Oxide Floor
  const thinnaiH = 0.45;
  const thinnaiFloor = new THREE.Mesh(
    new THREE.BoxGeometry(houseW, thinnaiH, 2.4),
    mats.terracottaFloorMat
  );
  thinnaiFloor.position.set(0, thinnaiH / 2, halfD + 1.2);
  houseGroup.add(thinnaiFloor);

  // Front Veranda Carved Teakwood Pillars
  for (let px = -halfW + 0.6; px <= halfW - 0.6; px += (houseW - 1.2) / 3) {
    const p = createChettinadPillar(mats, wallH);
    p.position.set(px, thinnaiH, halfD + 2.2);
    houseGroup.add(p);
  }

  // Traditional Carved Double Entrance Door
  const door1 = new THREE.Mesh(new THREE.BoxGeometry(0.65, 2.3, 0.08), mats.wallWoodMat);
  door1.position.set(-0.35, 0.4 + 1.15, halfD);
  houseGroup.add(door1);
  const door2 = new THREE.Mesh(new THREE.BoxGeometry(0.65, 2.3, 0.08), mats.wallWoodMat);
  door2.position.set(0.35, 0.4 + 1.15, halfD);
  houseGroup.add(door2);

  // Central Open-To-Sky Brahmasthan Courtyard with Stone Curb
  const cSize = 3.0;
  // Courtyard low stone boundary curb
  createWall(houseGroup, cSize + 0.3, 0.35, 0.2, 0, 0.4 + 0.175, -cSize / 2, mats.frameMat);
  createWall(houseGroup, cSize + 0.3, 0.35, 0.2, 0, 0.4 + 0.175, cSize / 2, mats.frameMat);
  createWall(houseGroup, 0.2, 0.35, cSize, -cSize / 2, 0.4 + 0.175, 0, mats.frameMat);
  createWall(houseGroup, 0.2, 0.35, cSize, cSize / 2, 0.4 + 0.175, 0, mats.frameMat);

  // Four Inner Courtyard Carved Pillars
  const halfC = cSize / 2 - 0.1;
  [[-halfC, -halfC], [halfC, -halfC], [-halfC, halfC], [halfC, halfC]].forEach(([cx, cz]) => {
    const cp = createChettinadPillar(mats, wallH);
    cp.position.set(cx, 0.4, cz);
    houseGroup.add(cp);
  });

  // Central Sacred Tulsi Vrindavan Pedestal
  const tulsi = createTulsiPedestal(mats);
  tulsi.position.set(0, 0.4, 0);
  houseGroup.add(tulsi);

  // Traditional Hanging Brass Lamps (Thooku Vilakku)
  [[-1.8, 1.6], [1.8, 1.6]].forEach(([lx, lz]) => {
    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.2, 6), mats.goldMat);
    chain.position.set(lx, 0.4 + wallH - 0.6, lz);
    houseGroup.add(chain);

    const lampBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.08, 0.15, 12), mats.goldMat);
    lampBowl.position.set(lx, 0.4 + wallH - 1.2, lz);
    houseGroup.add(lampBowl);
  });

  // Furnishings
  addLivingRoomSet(houseGroup, -houseW * 0.28, houseD * 0.28, mats);
  addKitchenSet(houseGroup, houseW * 0.28, -houseD * 0.28, mats);
  addMasterBedroom(houseGroup, -houseW * 0.28, -houseD * 0.28, mats);

  // Mangalore Sloping Clay Tile Roof (4 Sloped Pyramidal Planes with Central Courtyard Opening)
  const roofH = 1.6;
  const tileGeo = new THREE.ConeGeometry(houseW * 0.75, roofH, 4);
  const tileRoof = new THREE.Mesh(tileGeo, mats.terracottaTileMat);
  tileRoof.position.set(0, 0.4 + wallH + roofH / 2, 0);
  tileRoof.rotation.y = Math.PI / 4;
  roofGroup.add(tileRoof);
}

// 4. OPTION 4: Dual-Balcony High Density Urban Plan (plan-4)
export function buildPlan4UrbanDualBalcony(houseGroup, roofGroup, houseW, houseD, wallH, planColorHex) {
  const mats = getMaterials(planColorHex);
  const midY = 0.4 + wallH / 2;
  const halfW = houseW / 2;
  const halfD = houseD / 2;

  // Exterior Perimeter
  createWall(houseGroup, houseW, wallH, 0.24, 0, midY, -halfD, mats.wallMat, mats.accentMat);
  createWall(houseGroup, 0.24, wallH, houseD, -halfW, midY, 0, mats.wallMat, mats.accentMat);
  createWall(houseGroup, 0.24, wallH, houseD, halfW, midY, 0, mats.wallMat, mats.accentMat);

  // 1. Front Cantilevered Street Balcony
  const balcDepth = 1.6;
  const frontBalc = new THREE.Mesh(new THREE.BoxGeometry(houseW * 0.7, 0.2, balcDepth), mats.tileFloorMat);
  frontBalc.position.set(0, 0.4 + 0.1, halfD + balcDepth / 2);
  houseGroup.add(frontBalc);

  // Front Balcony Glass & Chrome Railing
  const frontRail = new THREE.Mesh(new THREE.BoxGeometry(houseW * 0.7, 0.95, 0.05), mats.glassMat);
  frontRail.position.set(0, 0.4 + 0.2 + 0.475, halfD + balcDepth);
  houseGroup.add(frontRail);

  // Front Sliding Multi-Track Glass Patio Doors
  const slideDoor = new THREE.Mesh(new THREE.BoxGeometry(houseW * 0.5, 2.4, 0.08), mats.glassMat);
  slideDoor.position.set(0, 0.4 + 1.2, halfD);
  houseGroup.add(slideDoor);

  // 2. Rear Utility Drying Balcony
  const rearBalc = new THREE.Mesh(new THREE.BoxGeometry(houseW * 0.6, 0.2, balcDepth), mats.tileFloorMat);
  rearBalc.position.set(0, 0.4 + 0.1, -halfD - balcDepth / 2);
  houseGroup.add(rearBalc);

  // Rear Louvered Privacy Screen
  for (let rz = 0.6; rz <= 1.8; rz += 0.3) {
    const louver = new THREE.Mesh(new THREE.BoxGeometry(houseW * 0.6, 0.08, 0.08), mats.frameMat);
    louver.position.set(0, 0.4 + rz, -halfD - balcDepth);
    houseGroup.add(louver);
  }

  // Rear Washing Machine Niche
  const washer = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.85, 0.7), mats.wallWhiteMat);
  washer.position.set(-houseW * 0.2, 0.4 + 0.45, -halfD - 0.7);
  houseGroup.add(washer);

  // Integrated Study Desk Pod
  const desk = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.75, 0.6), mats.wallWoodMat);
  desk.position.set(-halfW + 1.2, 0.4 + 0.375, houseD * 0.1);
  houseGroup.add(desk);

  const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.25, 0.3), mats.wallWoodMat);
  shelf.position.set(-halfW + 1.2, 0.4 + 1.6, houseD * 0.1);
  houseGroup.add(shelf);

  // Furnishings
  addLivingRoomSet(houseGroup, -houseW * 0.15, houseD * 0.2, mats);
  addKitchenSet(houseGroup, houseW * 0.25, -houseD * 0.2, mats);
  addMasterBedroom(houseGroup, -houseW * 0.22, -houseD * 0.25, mats);

  // Flat Roof with Access Door
  const roof = new THREE.Mesh(new THREE.BoxGeometry(houseW + 0.6, 0.25, houseD + 0.6), mats.roofMat);
  roof.position.set(0, 0.4 + wallH + 0.12, 0);
  roofGroup.add(roof);
}

// 5. OPTION 5: Luxury G+1 Duplex Villa with Private Sky Deck (plan-5)
export function buildPlan5LuxuryG1Duplex(houseGroup, roofGroup, houseW, houseD, wallH, planColorHex) {
  const mats = getMaterials(planColorHex);
  const gHeight = wallH;
  const fHeight = wallH;
  const totalH = gHeight + fHeight;
  const halfW = houseW / 2;
  const halfD = houseD / 2;

  // Ground Floor Exterior Walls
  createWall(houseGroup, houseW, gHeight, 0.24, 0, 0.4 + gHeight / 2, -halfD, mats.wallMat, mats.accentMat);
  createWall(houseGroup, 0.24, gHeight, houseD, -halfW, 0.4 + gHeight / 2, 0, mats.wallMat, mats.accentMat);
  createWall(houseGroup, 0.24, gHeight, houseD, halfW, 0.4 + gHeight / 2, 0, mats.wallMat, mats.accentMat);

  // First Floor Intermediate Slab with Cutaway Void for Double Height
  const firstFloorSlab = new THREE.Mesh(
    new THREE.BoxGeometry(houseW * 0.65, 0.28, houseD),
    mats.woodFloorMat
  );
  firstFloorSlab.position.set(-houseW * 0.175, 0.4 + gHeight, 0);
  houseGroup.add(firstFloorSlab);

  // First Floor Exterior Walls
  const firstMidY = 0.4 + gHeight + fHeight / 2;
  createWall(houseGroup, houseW * 0.65, fHeight, 0.24, -houseW * 0.175, firstMidY, -halfD, mats.wallMat, mats.accentMat);
  createWall(houseGroup, 0.24, fHeight, houseD, -halfW, firstMidY, 0, mats.wallMat, mats.accentMat);

  // Cantilevered Master Bedroom Balcony on First Floor
  const balcGeo = new THREE.BoxGeometry(houseW * 0.4, 0.2, 1.6);
  const fBalc = new THREE.Mesh(balcGeo, mats.tileFloorMat);
  fBalc.position.set(-houseW * 0.25, 0.4 + gHeight + 0.1, halfD + 0.8);
  houseGroup.add(fBalc);

  const fRail = new THREE.Mesh(new THREE.BoxGeometry(houseW * 0.4, 0.9, 0.05), mats.glassMat);
  fRail.position.set(-houseW * 0.25, 0.4 + gHeight + 0.55, halfD + 1.55);
  houseGroup.add(fRail);

  // Internal Curved / Spiral Staircase
  const poleGeo = new THREE.CylinderGeometry(0.12, 0.12, gHeight, 16);
  const pole = new THREE.Mesh(poleGeo, mats.frameMat);
  pole.position.set(houseW * 0.22, 0.4 + gHeight / 2, 0);
  houseGroup.add(pole);

  const numSpiral = 14;
  for (let i = 0; i < numSpiral; i++) {
    const angle = (i / numSpiral) * Math.PI * 1.5;
    const step = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.06, 0.35), mats.wallWoodMat);
    step.position.set(
      houseW * 0.22 + Math.cos(angle) * 0.6,
      0.4 + (i / numSpiral) * gHeight + 0.03,
      Math.sin(angle) * 0.6
    );
    step.rotation.y = -angle;
    houseGroup.add(step);
  }

  // Furnishings: Ground Living Room & Kitchen
  addLivingRoomSet(houseGroup, -houseW * 0.22, houseD * 0.25, mats);
  addKitchenSet(houseGroup, houseW * 0.22, -houseD * 0.25, mats);

  // Furnishings: First Floor Master Suite & Family Lounge
  const upperBed = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.45, 2.4), mats.wallWoodMat);
  upperBed.position.set(-houseW * 0.25, 0.4 + gHeight + 0.3, -houseD * 0.25);
  houseGroup.add(upperBed);

  // ROOFTOP SKY DECK (Terrace Garden with Pergola Gazebo & Loungers)
  const skyDeck = new THREE.Mesh(new THREE.BoxGeometry(houseW, 0.24, houseD), mats.roofMat);
  skyDeck.position.set(0, 0.4 + totalH + 0.12, 0);
  roofGroup.add(skyDeck);

  // Artificial Grass Turf Rug on Sky Deck
  const turf = new THREE.Mesh(new THREE.PlaneGeometry(houseW * 0.6, houseD * 0.5), mats.grassMat);
  turf.rotation.x = -Math.PI / 2;
  turf.position.set(0, 0.4 + totalH + 0.25, 0);
  roofGroup.add(turf);

  // Timber Pergola Gazebo Structure
  const pergH = 2.4;
  const pergW = 3.6;
  const pergD = 3.2;
  const pergY = 0.4 + totalH + 0.25;

  // 4 Pergola Posts
  [[-pergW / 2, -pergD / 2], [pergW / 2, -pergD / 2], [-pergW / 2, pergD / 2], [pergW / 2, pergD / 2]].forEach(([px, pz]) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, pergH, 0.18), mats.wallWoodMat);
    post.position.set(px, pergY + pergH / 2, pz);
    roofGroup.add(post);
  });

  // Pergola Rafter Slats
  for (let r = -pergD / 2; r <= pergD / 2; r += 0.6) {
    const rafter = new THREE.Mesh(new THREE.BoxGeometry(pergW + 0.4, 0.12, 0.1), mats.wallWoodMat);
    rafter.position.set(0, pergY + pergH + 0.06, r);
    roofGroup.add(rafter);
  }

  // Outdoor Chaise Loungers on Sky Deck
  [-0.8, 0.8].forEach(lx => {
    const lounger = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.35, 1.8), mats.frameMat);
    lounger.position.set(lx, pergY + 0.2, 0);
    roofGroup.add(lounger);
  });
}

// 6. OPTION 6: Stilt Parking + Independent Residence Plan (plan-6)
export function buildPlan6StiltParking(houseGroup, roofGroup, houseW, houseD, wallH, planColorHex) {
  const mats = getMaterials(planColorHex);
  const stiltH = 3.2; // Stilt ground clearance
  const resH = wallH;
  const halfW = houseW / 2;
  const halfD = houseD / 2;

  // 1. GROUND STILT LEVEL: Open RCC Columns Grid
  const colSize = 0.42;
  const colMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.3 });

  const colGrid = [
    [-halfW + 0.3, -halfD + 0.3], [0, -halfD + 0.3], [halfW - 0.3, -halfD + 0.3],
    [-halfW + 0.3, 0], [0, 0], [halfW - 0.3, 0],
    [-halfW + 0.3, halfD - 0.3], [0, halfD - 0.3], [halfW - 0.3, halfD - 0.3]
  ];

  colGrid.forEach(([cx, cz]) => {
    const col = new THREE.Mesh(new THREE.BoxGeometry(colSize, stiltH, colSize), colMat);
    col.position.set(cx, 0.4 + stiltH / 2, cz);
    col.castShadow = true;
    houseGroup.add(col);
  });

  // Enclosed Ground Security Cabin & Staircase Core
  createWall(houseGroup, 2.4, stiltH, 3.2, halfW - 1.5, 0.4 + stiltH / 2, -halfD + 1.8, mats.wallMat);

  // 2 PARKED CARS IN THE STILT BAYS!
  // Car 1: SUV
  const suv = createCADVehicle(0x06b6d4, true);
  suv.position.set(-houseW * 0.25, 0, 0.5);
  houseGroup.add(suv);

  // Car 2: Compact Sedan
  const sedan = createCADVehicle(0x94a3b8, false);
  sedan.position.set(houseW * 0.15, 0, 0.5);
  houseGroup.add(sedan);

  // 2. FIRST FLOOR ELEVATED RESIDENCE SLAB
  const resFloor = new THREE.Mesh(new THREE.BoxGeometry(houseW + 0.8, 0.3, houseD + 0.8), mats.tileFloorMat);
  resFloor.position.set(0, 0.4 + stiltH, 0);
  houseGroup.add(resFloor);

  // Elevated Residence Exterior Walls
  const resMidY = 0.4 + stiltH + resH / 2;
  createWall(houseGroup, houseW, resH, 0.24, 0, resMidY, -halfD, mats.wallMat, mats.accentMat);
  createWall(houseGroup, 0.24, resH, houseD, -halfW, resMidY, 0, mats.wallMat, mats.accentMat);
  createWall(houseGroup, 0.24, resH, houseD, halfW, resMidY, 0, mats.wallMat, mats.accentMat);

  // Wrap-around Cantilevered Viewing Balcony
  const wrapRail = new THREE.Mesh(new THREE.BoxGeometry(houseW + 0.8, 0.95, 0.06), mats.glassMat);
  wrapRail.position.set(0, 0.4 + stiltH + 0.15 + 0.475, halfD + 0.4);
  houseGroup.add(wrapRail);

  // Elevated Living & Bed Furnishings
  addLivingRoomSet(houseGroup, -houseW * 0.2, houseD * 0.2, mats);
  addKitchenSet(houseGroup, houseW * 0.25, -houseD * 0.25, mats);
  addMasterBedroom(houseGroup, -houseW * 0.25, -houseD * 0.25, mats);

  // Roof
  const roof = new THREE.Mesh(new THREE.BoxGeometry(houseW + 0.8, 0.25, houseD + 0.8), mats.roofMat);
  roof.position.set(0, 0.4 + stiltH + resH + 0.12, 0);
  roofGroup.add(roof);
}

// 7. OPTION 7: Rental Portion Ground + Owner Residence Plan (plan-7)
export function buildPlan7RentalOwnerDuplex(houseGroup, roofGroup, houseW, houseD, wallH, planColorHex) {
  const mats = getMaterials(planColorHex);
  const halfW = houseW / 2;
  const halfD = houseD / 2;

  // Ground Floor 1BHK Rental Unit
  createWall(houseGroup, houseW * 0.75, wallH, 0.24, -houseW * 0.125, 0.4 + wallH / 2, -halfD, mats.wallMat);
  createWall(houseGroup, 0.24, wallH, houseD, -halfW, 0.4 + wallH / 2, 0, mats.wallMat);

  // Rental Unit Front Door & Signboard
  const rentDoor = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.2, 0.08), mats.wallWoodMat);
  rentDoor.position.set(-houseW * 0.25, 0.4 + 1.1, halfD);
  houseGroup.add(rentDoor);

  // External Covered Side Staircase to Upper Floor
  const numSteps = 14;
  const stairW = 1.1;
  const startX = halfW - stairW / 2;
  for (let s = 0; s < numSteps; s++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(stairW, 0.1, 0.35), mats.frameMat);
    step.position.set(startX, 0.4 + s * (wallH / numSteps) + 0.05, halfD - s * 0.35);
    houseGroup.add(step);
  }

  // First Floor Owner Residence Slab
  const upperFloor = new THREE.Mesh(new THREE.BoxGeometry(houseW, 0.25, houseD), mats.tileFloorMat);
  upperFloor.position.set(0, 0.4 + wallH, 0);
  houseGroup.add(upperFloor);

  // Upper Floor Walls
  const uMidY = 0.4 + wallH + wallH / 2;
  createWall(houseGroup, houseW, wallH, 0.24, 0, uMidY, -halfD, mats.wallMat, mats.accentMat);
  createWall(houseGroup, 0.24, wallH, houseD, -halfW, uMidY, 0, mats.wallMat, mats.accentMat);

  // Owner Front Balcony
  const ownerBalc = new THREE.Mesh(new THREE.BoxGeometry(houseW * 0.6, 0.95, 0.05), mats.glassMat);
  ownerBalc.position.set(-houseW * 0.15, 0.4 + wallH + 0.475, halfD + 0.8);
  houseGroup.add(ownerBalc);

  // Furnishings: Ground 1BHK Rental Unit
  addKitchenSet(houseGroup, -houseW * 0.15, -houseD * 0.3, mats);
  addLivingRoomSet(houseGroup, -houseW * 0.2, houseD * 0.1, mats);

  // Roof
  const roof = new THREE.Mesh(new THREE.BoxGeometry(houseW + 0.6, 0.25, houseD + 0.6), mats.roofMat);
  roof.position.set(0, 0.4 + wallH * 2 + 0.12, 0);
  roofGroup.add(roof);
}

// 8. OPTION 8: Eco-Green Solar Passive House Plan (plan-8)
export function buildPlan8EcoSolarPassive(houseGroup, roofGroup, houseW, houseD, wallH, planColorHex) {
  const mats = getMaterials(planColorHex);
  const midY = 0.4 + wallH / 2;
  const halfW = houseW / 2;
  const halfD = houseD / 2;

  // Exterior Earth-Toned Plaster Walls
  createWall(houseGroup, houseW, wallH, 0.24, 0, midY, -halfD, mats.wallMat, mats.accentMat);
  createWall(houseGroup, 0.24, wallH, houseD, -halfW, midY, 0, mats.wallMat, mats.accentMat);
  createWall(houseGroup, 0.24, wallH, houseD, halfW, midY, 0, mats.wallMat, mats.accentMat);

  // Vertical Living Green Wall / Trellis on Side Facade
  const trellisGeo = new THREE.BoxGeometry(0.08, wallH * 0.85, houseD * 0.4);
  const trellis = new THREE.Mesh(trellisGeo, mats.grassMat);
  trellis.position.set(halfW + 0.1, 0.4 + wallH * 0.45, 0);
  houseGroup.add(trellis);

  // Rainwater Harvesting Cylinder Tower
  const rwhTank = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 2.6, 16), mats.frameMat);
  rwhTank.position.set(-halfW - 1.2, 0.4 + 1.3, -halfD + 1.8);
  houseGroup.add(rwhTank);

  // Downpipe to RWH tank
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, wallH, 8), mats.wallWhiteMat);
  pipe.position.set(-halfW - 0.2, 0.4 + wallH / 2, -halfD + 1.8);
  houseGroup.add(pipe);

  // Central Raised Clerestory Wind-Catch Tower
  const chimneyW = 2.4;
  const chimneyH = 1.4;
  const chimney = new THREE.Mesh(new THREE.BoxGeometry(chimneyW, chimneyH, chimneyW), mats.wallMat);
  chimney.position.set(0, 0.4 + wallH + chimneyH / 2, 0);
  roofGroup.add(chimney);

  // Chimney Louvers
  for (let c = 0.2; c < chimneyH; c += 0.3) {
    const louver = new THREE.Mesh(new THREE.BoxGeometry(chimneyW + 0.1, 0.06, 0.06), mats.wallWoodMat);
    louver.position.set(0, 0.4 + wallH + c, chimneyW / 2 + 0.04);
    roofGroup.add(louver);
  }

  // ROOFTOP PHOTOVOLTAIC (PV) SOLAR POWER ARRAY!
  const solarMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a8a,
    roughness: 0.1,
    metalness: 0.95
  });

  // 2 Rows of Angled Solar Panels
  [-1.8, 1.8].forEach(rowX => {
    for (let pz = -2.2; pz <= 2.2; pz += 1.6) {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.05, 1.2), solarMat);
      panel.position.set(rowX, 0.4 + wallH + 0.6, pz);
      panel.rotation.x = -Math.PI / 8; // Tilted 22.5° towards sun
      roofGroup.add(panel);

      // Galvanized steel mount legs
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 6), mats.frameMat);
      leg.position.set(rowX, 0.4 + wallH + 0.3, pz - 0.4);
      roofGroup.add(leg);
    }
  });

  // Furnishings
  addLivingRoomSet(houseGroup, -houseW * 0.22, houseD * 0.25, mats);
  addKitchenSet(houseGroup, houseW * 0.22, -houseD * 0.25, mats);
  addMasterBedroom(houseGroup, -houseW * 0.22, -houseD * 0.25, mats);

  // Roof Slab
  const roof = new THREE.Mesh(new THREE.BoxGeometry(houseW + 0.6, 0.25, houseD + 0.6), mats.roofMat);
  roof.position.set(0, 0.4 + wallH + 0.12, 0);
  roofGroup.add(roof);
}

// 9. OPTION 9: Cost-Optimized Budget Smart Steel-Concrete Modular Plan (plan-9)
export function buildPlan9ModularBudgetSmart(houseGroup, roofGroup, houseW, houseD, wallH, planColorHex) {
  const mats = getMaterials(planColorHex);
  const midY = 0.4 + wallH / 2;
  const halfW = houseW / 2;
  const halfD = houseD / 2;

  // Exterior Brick & Plaster Partition Walls
  createWall(houseGroup, houseW, wallH, 0.24, 0, midY, -halfD, mats.wallBrickMat);
  createWall(houseGroup, 0.24, wallH, houseD, -halfW, midY, 0, mats.wallBrickMat);
  createWall(houseGroup, 0.24, wallH, houseD, halfW, midY, 0, mats.wallBrickMat);

  // Standardized 3m Modular RCC Column Grid & Overhead Tie-Beams
  const colSize = 0.34;
  const colPositions = [
    [-halfW + 0.17, -halfD + 0.17], [0, -halfD + 0.17], [halfW - 0.17, -halfD + 0.17],
    [-halfW + 0.17, 0], [0, 0], [halfW - 0.17, 0],
    [-halfW + 0.17, halfD - 0.17], [0, halfD - 0.17], [halfW - 0.17, halfD - 0.17]
  ];

  colPositions.forEach(([cx, cz]) => {
    const col = new THREE.Mesh(new THREE.BoxGeometry(colSize, wallH + 0.4, colSize), mats.frameMat);
    col.position.set(cx, 0.4 + (wallH + 0.4) / 2, cz);
    houseGroup.add(col);
  });

  // Exposed Overhead RCC Tie-Beams
  const beam1 = new THREE.Mesh(new THREE.BoxGeometry(houseW, 0.3, 0.25), mats.frameMat);
  beam1.position.set(0, 0.4 + wallH - 0.15, 0);
  houseGroup.add(beam1);

  // Cantilevered Pre-cast Window Chajjas (Sunshades)
  [-halfW * 0.5, halfW * 0.5].forEach(wx => {
    const chajja = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.6), mats.frameMat);
    chajja.position.set(wx, 0.4 + 2.2, halfD + 0.3);
    houseGroup.add(chajja);
  });

  // Modular Open Furnishings
  addLivingRoomSet(houseGroup, -houseW * 0.25, houseD * 0.22, mats);
  addKitchenSet(houseGroup, houseW * 0.25, -houseD * 0.25, mats);
  addMasterBedroom(houseGroup, -houseW * 0.25, -houseD * 0.25, mats);

  // Roof
  const roof = new THREE.Mesh(new THREE.BoxGeometry(houseW + 0.6, 0.25, houseD + 0.6), mats.roofMat);
  roof.position.set(0, 0.4 + wallH + 0.12, 0);
  roofGroup.add(roof);
}

// 10. OPTION 10: Luxury Villa with Swimming Pool & Wooden Deck (plan-10)
export function buildPlan10LuxuryPoolVilla(houseGroup, roofGroup, houseW, houseD, wallH, planColorHex) {
  const mats = getMaterials(planColorHex);
  const midY = 0.4 + wallH / 2;
  const halfW = houseW / 2;
  const halfD = houseD / 2;

  // Exterior Perimeter Walls
  createWall(houseGroup, houseW * 0.6, wallH, 0.24, -houseW * 0.2, midY, -halfD, mats.wallMat, mats.accentMat);
  createWall(houseGroup, 0.24, wallH, houseD, -halfW, midY, 0, mats.wallMat, mats.accentMat);

  // Full-Height Motorized Sliding Glass Pocket Walls Facing Pool Terrace!
  const pocketGlass = new THREE.Mesh(new THREE.BoxGeometry(houseW * 0.6, wallH - 0.2, 0.06), mats.glassMat);
  pocketGlass.position.set(-houseW * 0.2, midY, halfD);
  houseGroup.add(pocketGlass);

  // OUTDOOR TURQUOISE LAP SWIMMING POOL
  const poolW = 3.6;
  const poolL = 7.0;
  const poolDepth = 1.1;
  const poolX = houseW * 0.35 + poolW / 2;
  const poolZ = 0;

  // Pool Basin
  const poolBasin = new THREE.Mesh(
    new THREE.BoxGeometry(poolW, poolDepth, poolL),
    new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.1, metalness: 0.4 })
  );
  poolBasin.position.set(poolX, poolDepth / 2 - 0.2, poolZ);
  houseGroup.add(poolBasin);

  // Crystal Clear Shimmering Water Surface
  const water = new THREE.Mesh(new THREE.BoxGeometry(poolW - 0.1, 0.05, poolL - 0.1), mats.waterMat);
  water.position.set(poolX, poolDepth - 0.25, poolZ);
  houseGroup.add(water);

  // Submerged Tanning Ledge Bench
  const bench = new THREE.Mesh(new THREE.BoxGeometry(poolW - 0.2, 0.45, 1.4), mats.waterMat);
  bench.position.set(poolX, 0.4, poolZ - poolL / 2 + 0.8);
  houseGroup.add(bench);

  // Underwater LED Pool Lights
  [-1.5, 1.5].forEach(lz => {
    const lightSpot = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), mats.glassMat);
    lightSpot.position.set(poolX - poolW / 2 + 0.05, 0.4, poolZ + lz);
    houseGroup.add(lightSpot);
  });

  // TEAKWOOD POOL DECK SURROUND
  const deckW = poolW + 2.4;
  const deckL = poolL + 2.0;
  const deck = new THREE.Mesh(new THREE.BoxGeometry(deckW, 0.2, deckL), mats.woodFloorMat);
  deck.position.set(poolX, 0.4 + 0.1, poolZ);
  deck.receiveShadow = true;
  houseGroup.add(deck);

  // Poolside Reclining Sun Loungers with Parasol Umbrella
  [-1.2, 1.2].forEach(lx => {
    const lounger = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.35, 1.9), mats.wallWhiteMat);
    lounger.position.set(poolX + lx, 0.4 + 0.35, poolZ + poolL / 2 - 0.5);
    houseGroup.add(lounger);
  });

  // Large Parasol Resort Umbrella
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.4, 8), mats.frameMat);
  pole.position.set(poolX, 0.4 + 1.2, poolZ + poolL / 2 - 0.5);
  houseGroup.add(pole);

  const canopy = new THREE.Mesh(new THREE.ConeGeometry(1.6, 0.6, 8), mats.wallWhiteMat);
  canopy.position.set(poolX, 0.4 + 2.3, poolZ + poolL / 2 - 0.5);
  houseGroup.add(canopy);

  // Alfresco BBQ Island & Outdoor Bar Counter
  const bbqCounter = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 0.9), mats.frameMat);
  bbqCounter.position.set(poolX, 0.4 + 0.45, -poolL / 2 - 0.8);
  houseGroup.add(bbqCounter);

  // Bar Stools
  for (let s = -0.7; s <= 0.7; s += 0.7) {
    const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.75, 12), mats.wallWoodMat);
    stool.position.set(poolX + s, 0.4 + 0.38, -poolL / 2 - 1.6);
    houseGroup.add(stool);
  }

  // Master Furnishings inside
  addLivingRoomSet(houseGroup, -houseW * 0.25, houseD * 0.2, mats);
  addKitchenSet(houseGroup, -houseW * 0.25, -houseD * 0.3, mats);

  // Roof
  const roof = new THREE.Mesh(new THREE.BoxGeometry(houseW * 0.7, 0.25, houseD + 0.6), mats.roofMat);
  roof.position.set(-houseW * 0.15, 0.4 + wallH + 0.12, 0);
  roofGroup.add(roof);
}

// Master Dispatcher: Build house according to plan ID
export function dispatchHouseModel(plan, houseGroup, roofGroup, houseW, houseD, wallH) {
  const planId = plan.id || 'plan-1';
  const planColorHex = parseInt((plan.colorScheme || '#38bdf8').replace('#', '0x'), 16);

  switch (planId) {
    case 'plan-1':
      buildPlan1Minimalist(houseGroup, roofGroup, houseW, houseD, wallH, planColorHex);
      break;
    case 'plan-2':
      buildPlan2GlassDuplex(houseGroup, roofGroup, houseW, houseD, wallH, planColorHex);
      break;
    case 'plan-3':
      buildPlan3HeritageCourtyard(houseGroup, roofGroup, houseW, houseD, wallH, planColorHex);
      break;
    case 'plan-4':
      buildPlan4UrbanDualBalcony(houseGroup, roofGroup, houseW, houseD, wallH, planColorHex);
      break;
    case 'plan-5':
      buildPlan5LuxuryG1Duplex(houseGroup, roofGroup, houseW, houseD, wallH, planColorHex);
      break;
    case 'plan-6':
      buildPlan6StiltParking(houseGroup, roofGroup, houseW, houseD, wallH, planColorHex);
      break;
    case 'plan-7':
      buildPlan7RentalOwnerDuplex(houseGroup, roofGroup, houseW, houseD, wallH, planColorHex);
      break;
    case 'plan-8':
      buildPlan8EcoSolarPassive(houseGroup, roofGroup, houseW, houseD, wallH, planColorHex);
      break;
    case 'plan-9':
      buildPlan9ModularBudgetSmart(houseGroup, roofGroup, houseW, houseD, wallH, planColorHex);
      break;
    case 'plan-10':
      buildPlan10LuxuryPoolVilla(houseGroup, roofGroup, houseW, houseD, wallH, planColorHex);
      break;
    default:
      buildPlan1Minimalist(houseGroup, roofGroup, houseW, houseD, wallH, planColorHex);
      break;
  }
}

// Dedicated Waypoints Tailored for Each Specific Design
export function getPlanDedicatedWaypoints(plan, houseW, houseD) {
  const id = plan.id || 'plan-1';
  const halfW = houseW / 2;
  const halfD = houseD / 2;

  switch (id) {
    case 'plan-1':
      return [
        { name: 'Car Parking Port', icon: 'fas fa-car', pos: new THREE.Vector3(-halfW - 2.2, 1.6, halfD + 2), look: new THREE.Vector3(-halfW - 2.2, 1.2, 0), zone: 'Covered Portico Driveway' },
        { name: 'Main Entrance Veranda', icon: 'fas fa-door-open', pos: new THREE.Vector3(0, 1.6, halfD + 2.5), look: new THREE.Vector3(0, 1.4, 0), zone: 'North-East Eeshanya Entrance' },
        { name: 'Living & Dining Lounge', icon: 'fas fa-couch', pos: new THREE.Vector3(-houseW * 0.25, 1.6, houseD * 0.25), look: new THREE.Vector3(-houseW * 0.25, 1.4, -1), zone: 'Centrum Vitrified Lounge' },
        { name: 'SE Modular Kitchen', icon: 'fas fa-utensils', pos: new THREE.Vector3(houseW * 0.25, 1.6, -houseD * 0.15), look: new THREE.Vector3(houseW * 0.25, 1.4, -houseD * 0.35), zone: 'South-East Agneya Zone' },
        { name: 'SW Master Suite', icon: 'fas fa-bed', pos: new THREE.Vector3(-houseW * 0.25, 1.6, -houseD * 0.15), look: new THREE.Vector3(-houseW * 0.25, 1.4, -houseD * 0.35), zone: 'South-West Nairutya Zone' },
        { name: 'NE Marble Mandir', icon: 'fas fa-om', pos: new THREE.Vector3(halfW - 1.2, 1.6, halfD * 0.35 + 1.2), look: new THREE.Vector3(halfW - 0.8, 1.2, halfD * 0.35 + 0.8), zone: 'North-East Sacred Shrine' }
      ];

    case 'plan-2':
      return [
        { name: 'Double-Height Great Room', icon: 'fas fa-up-right-and-down-left-from-center', pos: new THREE.Vector3(-houseW * 0.2, 1.8, houseD * 0.2), look: new THREE.Vector3(-houseW * 0.2, 3.2, -1), zone: 'Double-Height Atrium (5.5m)' },
        { name: 'Glass Curtain Wall Facade', icon: 'fas fa-table-cells', pos: new THREE.Vector3(0, 2.0, halfD + 2.5), look: new THREE.Vector3(0, 2.8, 0), zone: 'Two-Story Glass Elevation' },
        { name: 'Floating Staircase Base', icon: 'fas fa-stairs', pos: new THREE.Vector3(houseW * 0.28, 1.6, houseD * 0.35), look: new THREE.Vector3(houseW * 0.28, 3.0, -1), zone: 'Cantilevered Steel & Timber Steps' },
        { name: 'Upper Mezzanine Gallery', icon: 'fas fa-bridge', pos: new THREE.Vector3(-houseW * 0.2, 4.2, -houseD * 0.1), look: new THREE.Vector3(-houseW * 0.2, 2.0, houseD * 0.25), zone: 'First Floor Catwalk Gallery' },
        { name: 'Open Chef Island Kitchen', icon: 'fas fa-kitchen-set', pos: new THREE.Vector3(houseW * 0.22, 1.6, -houseD * 0.1), look: new THREE.Vector3(houseW * 0.22, 1.4, -houseD * 0.35), zone: 'Waterfall Marble Island' }
      ];

    case 'plan-3':
      return [
        { name: 'Front Thinnai Veranda', icon: 'fas fa-landmark', pos: new THREE.Vector3(0, 1.6, halfD + 2.8), look: new THREE.Vector3(0, 1.4, halfD), zone: 'Raised Red-Oxide Porch' },
        { name: 'Heritage Carved Entrance', icon: 'fas fa-door-closed', pos: new THREE.Vector3(0, 1.6, halfD + 0.8), look: new THREE.Vector3(0, 1.4, 0), zone: 'Teakwood Studded Doors' },
        { name: 'Central Brahmasthan Courtyard', icon: 'fas fa-sun', pos: new THREE.Vector3(0, 1.6, 0.5), look: new THREE.Vector3(0, 1.0, 0), zone: 'Open-To-Sky Sacred Atrium' },
        { name: 'Sacred Tulsi Vrindavan', icon: 'fas fa-seedling', pos: new THREE.Vector3(0, 1.4, -0.8), look: new THREE.Vector3(0, 0.9, 0), zone: 'Carved Stone Pedestal' },
        { name: 'Chettinad Pillar Colonnade', icon: 'fas fa-monument', pos: new THREE.Vector3(-1.4, 1.6, 0), look: new THREE.Vector3(0, 1.4, 0), zone: 'Turned Timber Pillars' },
        { name: 'Traditional Kitchen', icon: 'fas fa-fire-burner', pos: new THREE.Vector3(houseW * 0.28, 1.6, -houseD * 0.25), look: new THREE.Vector3(houseW * 0.28, 1.4, -houseD * 0.4), zone: 'South-East Hearth' }
      ];

    case 'plan-4':
      return [
        { name: 'Living Hall & Wind Tunnel', icon: 'fas fa-wind', pos: new THREE.Vector3(-houseW * 0.15, 1.6, 1.5), look: new THREE.Vector3(0, 1.4, -2), zone: 'Cross-Ventilation Corridor' },
        { name: 'Front Street Balcony', icon: 'fas fa-binoculars', pos: new THREE.Vector3(0, 1.6, halfD + 1.2), look: new THREE.Vector3(0, 1.4, halfD + 3), zone: 'Cantilever Glass Balcony' },
        { name: 'Rear Utility Drying Balcony', icon: 'fas fa-shirt', pos: new THREE.Vector3(0, 1.6, -halfD - 1.2), look: new THREE.Vector3(0, 1.4, -halfD - 3), zone: 'Louvered Utility Deck' },
        { name: 'Integrated Study Pod', icon: 'fas fa-laptop', pos: new THREE.Vector3(-halfW + 1.8, 1.6, houseD * 0.1), look: new THREE.Vector3(-halfW + 0.8, 1.4, houseD * 0.1), zone: 'Floating Desk & Shelves' },
        { name: 'Master Suite & Loft', icon: 'fas fa-bed', pos: new THREE.Vector3(-houseW * 0.22, 1.6, -houseD * 0.25), look: new THREE.Vector3(-houseW * 0.22, 1.4, -houseD * 0.4), zone: 'Space-Saving Built-in Loft' }
      ];

    case 'plan-5':
      return [
        { name: 'Ground Entrance Foyer', icon: 'fas fa-door-open', pos: new THREE.Vector3(0, 1.6, halfD + 2.5), look: new THREE.Vector3(0, 1.4, 0), zone: 'Duplex Foyer' },
        { name: 'Formal Living Room', icon: 'fas fa-couch', pos: new THREE.Vector3(-houseW * 0.22, 1.6, houseD * 0.25), look: new THREE.Vector3(-houseW * 0.22, 1.4, 0), zone: 'Ground Level Lounge' },
        { name: 'Curved Teak Staircase', icon: 'fas fa-stairs', pos: new THREE.Vector3(houseW * 0.22, 1.6, 1.2), look: new THREE.Vector3(houseW * 0.22, 3.2, 0), zone: 'Helical Timber Ascender' },
        { name: 'First Floor Family Lounge', icon: 'fas fa-tv', pos: new THREE.Vector3(-houseW * 0.2, 4.4, 1.5), look: new THREE.Vector3(-houseW * 0.2, 2.0, -1), zone: 'Upper Mezzanine Lounge' },
        { name: 'Master Suite & Balcony', icon: 'fas fa-bed', pos: new THREE.Vector3(-houseW * 0.25, 4.4, -houseD * 0.25), look: new THREE.Vector3(-houseW * 0.25, 4.2, halfD), zone: 'First Floor Master Suite' },
        { name: 'Rooftop Pergola Sky Deck', icon: 'fas fa-umbrella-beach', pos: new THREE.Vector3(0, 7.5, 0.5), look: new THREE.Vector3(0, 7.2, -3), zone: 'Gazebo & Turf Terrace' }
      ];

    case 'plan-6':
      return [
        { name: 'Ground Stilt Parking Bays', icon: 'fas fa-square-parking', pos: new THREE.Vector3(0, 1.6, 4.5), look: new THREE.Vector3(0, 1.2, 0), zone: 'Covered 2-Car Stilt Parking' },
        { name: 'Security Cabin & Core', icon: 'fas fa-shield-halved', pos: new THREE.Vector3(halfW - 1.2, 1.6, -halfD + 1.5), look: new THREE.Vector3(halfW - 1.2, 1.4, 0), zone: 'Guard Post & Entrance Core' },
        { name: 'Dog-Leg Stairwell', icon: 'fas fa-stairs', pos: new THREE.Vector3(halfW - 1.8, 2.8, 0), look: new THREE.Vector3(halfW - 1.8, 4.5, -halfD), zone: 'Ascent to Elevated Residence' },
        { name: 'First Floor Elevated Lounge', icon: 'fas fa-couch', pos: new THREE.Vector3(-houseW * 0.2, 4.6, houseD * 0.2), look: new THREE.Vector3(-houseW * 0.2, 4.4, -1), zone: 'Elevated Residence Hall (+3.4m)' },
        { name: 'Wrap-Around Balcony', icon: 'fas fa-eye', pos: new THREE.Vector3(0, 4.6, halfD + 1.5), look: new THREE.Vector3(0, 4.4, halfD + 4), zone: 'Cantilevered Glass Terrace' }
      ];

    case 'plan-7':
      return [
        { name: 'Ground 1BHK Rental Unit', icon: 'fas fa-key', pos: new THREE.Vector3(-houseW * 0.25, 1.6, halfD + 2.0), look: new THREE.Vector3(-houseW * 0.25, 1.4, 0), zone: 'Independent Rental Door' },
        { name: 'Rental Living & Kitchenette', icon: 'fas fa-utensils', pos: new THREE.Vector3(-houseW * 0.2, 1.6, 1.0), look: new THREE.Vector3(-houseW * 0.2, 1.4, -houseD * 0.3), zone: 'Compact Rental Apartment' },
        { name: 'External Covered Staircase', icon: 'fas fa-stairs', pos: new THREE.Vector3(halfW - 0.6, 2.2, halfD + 1.2), look: new THREE.Vector3(halfW - 0.6, 4.2, -1), zone: 'Private Owner Access' },
        { name: 'Owner 2BHK Upper Hall', icon: 'fas fa-couch', pos: new THREE.Vector3(-houseW * 0.15, 4.6, houseD * 0.2), look: new THREE.Vector3(-houseW * 0.15, 4.4, -1), zone: 'First Floor Owner Residence' },
        { name: 'Owner Front Balcony', icon: 'fas fa-mountain-sun', pos: new THREE.Vector3(-houseW * 0.15, 4.6, halfD + 1.8), look: new THREE.Vector3(-houseW * 0.15, 4.4, halfD + 4), zone: 'Spacious Front Balcony' }
      ];

    case 'plan-8':
      return [
        { name: 'Eco Front Entrance', icon: 'fas fa-door-open', pos: new THREE.Vector3(0, 1.6, halfD + 2.5), look: new THREE.Vector3(0, 1.4, 0), zone: 'Sustainable Habitat Entry' },
        { name: 'Naturally Lit Living Room', icon: 'fas fa-sun', pos: new THREE.Vector3(-houseW * 0.22, 1.6, houseD * 0.25), look: new THREE.Vector3(-houseW * 0.22, 1.4, 0), zone: 'Thermal Mass Living Hall' },
        { name: 'Vertical Green Living Trellis', icon: 'fas fa-leaf', pos: new THREE.Vector3(halfW + 1.8, 1.6, 0), look: new THREE.Vector3(halfW, 1.8, 0), zone: 'Bio-Climatic Ivy Wall' },
        { name: 'Rainwater Harvesting Tower', icon: 'fas fa-faucet-drip', pos: new THREE.Vector3(-halfW - 2.0, 1.6, -halfD + 1.8), look: new THREE.Vector3(-halfW - 1.2, 1.4, -halfD + 1.8), zone: 'Filtration Tank & Downpipes' },
        { name: 'Rooftop Solar PV Power Array', icon: 'fas fa-solar-panel', pos: new THREE.Vector3(0, 4.8, 1.5), look: new THREE.Vector3(0, 4.4, -2), zone: 'Photovoltaic Clean Energy Roof' },
        { name: 'Wind-Catch Cooling Tower', icon: 'fas fa-wind', pos: new THREE.Vector3(0, 4.8, -1.2), look: new THREE.Vector3(0, 4.2, 0), zone: 'Clerestory Stack Ventilation' }
      ];

    case 'plan-9':
      return [
        { name: 'Modular Frame Entrance', icon: 'fas fa-door-open', pos: new THREE.Vector3(0, 1.6, halfD + 2.5), look: new THREE.Vector3(0, 1.4, 0), zone: 'Structural RCC Grid Entry' },
        { name: 'Compact Living Lounge', icon: 'fas fa-couch', pos: new THREE.Vector3(-houseW * 0.25, 1.6, houseD * 0.22), look: new THREE.Vector3(-houseW * 0.25, 1.4, 0), zone: 'Zero Space Waste Living' },
        { name: 'Breakfast Bar & Kitchenette', icon: 'fas fa-mug-hot', pos: new THREE.Vector3(houseW * 0.25, 1.6, -houseD * 0.15), look: new THREE.Vector3(houseW * 0.25, 1.4, -houseD * 0.35), zone: 'Modular Kitchen Run' },
        { name: 'Master Bedroom', icon: 'fas fa-bed', pos: new THREE.Vector3(-houseW * 0.25, 1.6, -houseD * 0.15), look: new THREE.Vector3(-houseW * 0.25, 1.4, -houseD * 0.35), zone: 'Optimized Bedroom' },
        { name: 'Overhead RCC Tie-Beams', icon: 'fas fa-trowel-bricks', pos: new THREE.Vector3(0, 2.4, 4.5), look: new THREE.Vector3(0, 3.2, 0), zone: 'Exposed Concrete & Chajjas' }
      ];

    case 'plan-10':
      return [
        { name: 'Grand Living Hall', icon: 'fas fa-couch', pos: new THREE.Vector3(-houseW * 0.25, 1.6, houseD * 0.2), look: new THREE.Vector3(houseW * 0.3, 1.4, 0), zone: 'Panoramic Open Living Lounge' },
        { name: 'Motorized Glass Pocket Wall', icon: 'fas fa-arrow-right-arrow-left', pos: new THREE.Vector3(-houseW * 0.2, 1.6, halfD), look: new THREE.Vector3(houseW * 0.3, 1.4, 0), zone: 'Indoor-Outdoor Seamless Barrier' },
        { name: 'Turquoise Lap Swimming Pool', icon: 'fas fa-water', pos: new THREE.Vector3(houseW * 0.35 + 1.8, 1.6, 2.8), look: new THREE.Vector3(houseW * 0.35 + 1.8, 0.4, 0), zone: 'Resort Pool with Step Ledge' },
        { name: 'Teakwood Sun Deck & Loungers', icon: 'fas fa-umbrella-beach', pos: new THREE.Vector3(houseW * 0.35 + 3.2, 1.6, 0), look: new THREE.Vector3(houseW * 0.35 + 1.8, 0.6, 0), zone: 'Poolside Chaise Loungers & Parasol' },
        { name: 'Alfresco BBQ & Bar Island', icon: 'fas fa-martini-glass-citrus', pos: new THREE.Vector3(houseW * 0.35 + 1.8, 1.6, -halfD + 1.5), look: new THREE.Vector3(houseW * 0.35 + 1.8, 1.2, -halfD), zone: 'Outdoor Granite Bar Counter' }
      ];

    default:
      return [
        { name: 'Main Entrance', icon: 'fas fa-door-open', pos: new THREE.Vector3(0, 1.6, halfD + 2.5), look: new THREE.Vector3(0, 1.4, 0), zone: 'Front Entrance' },
        { name: 'Living Room', icon: 'fas fa-couch', pos: new THREE.Vector3(-houseW * 0.25, 1.6, houseD * 0.25), look: new THREE.Vector3(-houseW * 0.25, 1.4, 0), zone: 'Living Area' },
        { name: 'Kitchen', icon: 'fas fa-utensils', pos: new THREE.Vector3(houseW * 0.25, 1.6, -houseD * 0.25), look: new THREE.Vector3(houseW * 0.25, 1.4, -houseD * 0.4), zone: 'Kitchen Area' },
        { name: 'Master Suite', icon: 'fas fa-bed', pos: new THREE.Vector3(-houseW * 0.25, 1.6, -houseD * 0.25), look: new THREE.Vector3(-houseW * 0.25, 1.4, -houseD * 0.4), zone: 'Master Bedroom' }
      ];
  }
}
