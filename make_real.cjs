const fs = require('fs');
const file = 'src/components/constructionHouse/ConstructionHouse3D.js';
let content = fs.readFileSync(file, 'utf8');

// Disable wireframes completely
content = content.replace(
  /addWireframeEdges\(mesh, geometry, colorHex = 0x00f2fe, opacity = 0\.85\) \{/g,
  `addWireframeEdges(mesh, geometry, colorHex = 0x00f2fe, opacity = 0.85) {\n    return; // DISABLED for realistic mode`
);

// Update materials to realistic values
content = content.replace(
  /this\.facadeMat = new THREE\.MeshStandardMaterial\(\{[\s\S]*?opacity: 0\.92\s*\}\);/m,
  `this.facadeMat = new THREE.MeshStandardMaterial({
      color: 0xe5e7eb, // Off-white stucco
      roughness: 0.8,
      metalness: 0.1
    });`
);

content = content.replace(
  /this\.upperFacadeMat = new THREE\.MeshStandardMaterial\(\{[\s\S]*?opacity: 0\.9\s*\}\);/m,
  `this.upperFacadeMat = new THREE.MeshStandardMaterial({
      color: 0x8b5a2b, // Wood siding
      roughness: 0.9,
      metalness: 0.05
    });`
);

content = content.replace(
  /this\.glassMat = new THREE\.MeshPhysicalMaterial\(\{[\s\S]*?ior: 1\.5\s*\}\);/m,
  `this.glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x000000,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.6,
      transmission: 0.8,
      ior: 1.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });`
);

content = content.replace(
  /const structuralFrameMat = new THREE\.MeshStandardMaterial\(\{[\s\S]*?metalness: 0\.9\s*\}\);/m,
  `const structuralFrameMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Dark slate metal
      roughness: 0.4,
      metalness: 0.7
    });`
);

content = content.replace(
  /this\.roofMat = new THREE\.MeshStandardMaterial\(\{[\s\S]*?metalness: 0\.75\s*\}\);/m,
  `this.roofMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937, // Dark asphalt
      roughness: 0.9,
      metalness: 0.1
    });`
);

// Turn up ambient and directional light a bit to show true colors, since neon is gone.
content = content.replace(
  /const ambientLight = new THREE\.AmbientLight\(0x0f2444, 1\.8\);/g,
  `const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);`
);

content = content.replace(
  /const cyanKeyLight = new THREE\.DirectionalLight\(0x00f2fe, 2\.2\);/g,
  `const cyanKeyLight = new THREE.DirectionalLight(0xffffff, 2.5);`
);

content = content.replace(
  /const purpleRimLight = new THREE\.DirectionalLight\(0xa855f7, 1\.8\);/g,
  `const purpleRimLight = new THREE.DirectionalLight(0xfff0dd, 1.2);`
);

fs.writeFileSync(file, content);
console.log("Made real!");
