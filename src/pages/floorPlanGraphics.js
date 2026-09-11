// ==================== Bespoke Architectural Graphics Engine ====================
// Generates unique 2D Blueprints, 3D Elevations, and Structural Grids for all 10 Floor Plans

export function renderFloorPlanBlueprint(template, sqft, width, depth) {
  const color = template.colorScheme || '#38bdf8';
  const widthNum = parseInt(width) || 30;
  const depthNum = parseInt(depth) || 40;
  const totalArea = Math.round(widthNum * depthNum);

  // Common SVG Header with CAD Grid & Dimension Chains
  const svgHeader = (customDefs = '') => `
    <svg viewBox="0 0 400 280" width="100%" height="230" class="blueprint-svg" style="background:#060c18;border-radius:10px;border:1px solid rgba(56,189,248,0.25);box-shadow:inset 0 2px 14px rgba(0,0,0,0.6)">
      <defs>
        <pattern id="grid-${template.id}" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(56,189,248,0.07)" stroke-width="0.8"/>
          <circle cx="20" cy="20" r="0.8" fill="rgba(56,189,248,0.18)"/>
        </pattern>
        ${customDefs}
      </defs>
      <rect width="400" height="280" fill="url(#grid-${template.id})" rx="8" />
      <!-- Dimension Chains -->
      <line x1="25" y1="14" x2="375" y2="14" stroke="rgba(56,189,248,0.4)" stroke-width="1" />
      <line x1="25" y1="10" x2="25" y2="18" stroke="${color}" stroke-width="1.5" />
      <line x1="375" y1="10" x2="375" y2="18" stroke="${color}" stroke-width="1.5" />
      <text x="200" y="11" fill="${color}" font-size="8.5" font-weight="700" letter-spacing="0.5" text-anchor="middle">PLOT WIDTH: ${widthNum}'-0" [${(widthNum * 0.3048).toFixed(1)}m]</text>
      <line x1="14" y1="25" x2="14" y2="255" stroke="rgba(56,189,248,0.4)" stroke-width="1" />
      <line x1="10" y1="25" x2="18" y2="255" stroke="${color}" stroke-width="1.5" />
      <text x="9" y="140" fill="${color}" font-size="8.5" font-weight="700" letter-spacing="0.5" text-anchor="middle" transform="rotate(-90 9 140)">DEPTH: ${depthNum}'-0"</text>
      <!-- Perimeter 9" Wall -->
      <rect x="25" y="25" width="350" height="230" fill="#0c1729" stroke="${color}" stroke-width="3" rx="4" />
      <rect x="29" y="29" width="342" height="222" fill="#080f1e" stroke="rgba(255,255,255,0.22)" stroke-width="1" stroke-dasharray="4,4" />
  `;

  const svgFooter = (stampText = 'AUTOCAD ARCHITECTURAL DWG · SCALE 1:100') => `
      <!-- Compass Rose -->
      <circle cx="362" cy="45" r="13" fill="#0f172a" stroke="${color}" stroke-width="1.5" />
      <line x1="362" y1="34" x2="362" y2="56" stroke="rgba(255,255,255,0.3)" stroke-width="1" />
      <line x1="351" y1="45" x2="373" y2="45" stroke="rgba(255,255,255,0.3)" stroke-width="1" />
      <polygon points="362,34 364,45 362,42 360,45" fill="#ef4444" />
      <text x="362" y="42" fill="#ef4444" font-size="7.5" font-weight="bold" text-anchor="middle">N</text>
      <text x="362" y="53" fill="${color}" font-size="6.5" text-anchor="middle">${template.facing.substring(0,1)}</text>
      <!-- Title Block -->
      <line x1="25" y1="255" x2="375" y2="255" stroke="rgba(56,189,248,0.3)" stroke-width="1" />
      <text x="32" y="268" fill="#94a3b8" font-size="7.5" font-weight="600" letter-spacing="0.5">${stampText}</text>
      <text x="368" y="268" fill="${color}" font-size="7.5" font-weight="700" letter-spacing="0.5" text-anchor="end">VASTU: ${template.vastuScore}% COMPLIANT</text>
    </svg>
  `;

  switch(template.id) {
    // -------------------------------------------------------------
    // PLAN 1: Modern Minimalist Vastu Layout
    // -------------------------------------------------------------
    case 'plan-1':
      return `
        ${svgHeader()}
        <!-- Living & Dining -->
        <rect x="35" y="35" width="200" height="130" fill="rgba(56,189,248,0.06)" stroke="${color}" stroke-width="1.5" rx="3" />
        <path d="M 44 48 L 84 48 L 84 64 L 62 64 L 62 94 L 44 94 Z" fill="rgba(56,189,248,0.12)" stroke="rgba(56,189,248,0.45)" stroke-width="1" />
        <path d="M 70 70 L 92 70 L 92 88 L 70 88 Z" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.3)" stroke-width="0.8" rx="2" />
        <path d="M 170 55 L 210 55 L 210 85 L 170 85 Z" fill="rgba(56,189,248,0.08)" stroke="rgba(56,189,248,0.4)" stroke-width="1" rx="2" />
        <circle cx="190" cy="50" r="3" fill="rgba(56,189,248,0.3)" stroke="${color}" stroke-width="0.8"/>
        <circle cx="190" cy="90" r="3" fill="rgba(56,189,248,0.3)" stroke="${color}" stroke-width="0.8"/>
        <text x="135" y="94" fill="#ffffff" font-size="11" font-weight="700" text-anchor="middle">LIVING &amp; DINING</text>
        <text x="135" y="110" fill="${color}" font-size="9" font-weight="600" text-anchor="middle">${Math.round(widthNum * 0.9)}' x ${Math.round(depthNum * 0.3)}'</text>
        <text x="135" y="124" fill="#94a3b8" font-size="7.5" text-anchor="middle">NE ISHANYA ZONE · VITRIFIED</text>

        <!-- Master Bedroom SW -->
        <rect x="245" y="35" width="120" height="130" fill="rgba(168,85,247,0.07)" stroke="${color}" stroke-width="1.5" rx="3" />
        <path d="M 258 44 L 314 44 L 314 88 L 258 88 Z" fill="rgba(168,85,247,0.14)" stroke="#c084fc" stroke-width="1" rx="2" />
        <rect x="248" y="48" width="8" height="10" fill="rgba(168,85,247,0.2)" stroke="#a855f7" stroke-width="0.8" rx="1" />
        <rect x="316" y="48" width="8" height="10" fill="rgba(168,85,247,0.2)" stroke="#a855f7" stroke-width="0.8" rx="1" />
        <path d="M 302 110 L 365 110 L 365 165 L 302 165 Z" fill="rgba(56,189,248,0.05)" stroke="rgba(255,255,255,0.25)" stroke-width="1" />
        <text x="334" y="128" fill="#7dd3fc" font-size="7" font-weight="bold" text-anchor="middle">TOILET</text>
        <text x="290" y="96" fill="#ffffff" font-size="11" font-weight="700" text-anchor="middle">MASTER BED</text>
        <text x="290" y="110" fill="#c084fc" font-size="9" font-weight="600" text-anchor="middle">SW · NAIRUTYA ZONE</text>

        <!-- SE Kitchen -->
        <rect x="35" y="173" width="130" height="72" fill="rgba(245,158,11,0.07)" stroke="${color}" stroke-width="1.5" rx="3" />
        <path d="M 37 175 L 88 175 L 88 192 L 52 192 L 52 243 L 37 243 Z" fill="rgba(245,158,11,0.18)" stroke="#f59e0b" stroke-width="1" />
        <circle cx="44" cy="183" r="2.8" fill="#fbbf24" />
        <circle cx="58" cy="183" r="2.8" fill="#fbbf24" />
        <text x="100" y="206" fill="#ffffff" font-size="10.5" font-weight="700" text-anchor="middle">SE KITCHEN</text>
        <text x="100" y="220" fill="#fbbf24" font-size="8.5" text-anchor="middle">AGNEYA FIRE CORNER</text>

        <!-- Bed 2 & Puja -->
        <rect x="173" y="173" width="192" height="72" fill="rgba(74,222,128,0.07)" stroke="${color}" stroke-width="1.5" rx="3" />
        <path d="M 175 175 L 216 175 L 216 206 L 175 206 Z" fill="rgba(251,191,36,0.15)" stroke="#fbbf24" stroke-width="1" rx="2" />
        <circle cx="195" cy="190" r="3.5" fill="#f59e0b" />
        <text x="195" y="202" fill="#fbbf24" font-size="7" font-weight="bold" text-anchor="middle">PUJA</text>
        <path d="M 285 180 L 335 180 L 335 220 L 285 220 Z" fill="rgba(74,222,128,0.14)" stroke="#4ade80" stroke-width="1" rx="2" />
        <text x="256" y="206" fill="#ffffff" font-size="10.5" font-weight="700" text-anchor="middle">BED 2 / PUJA</text>
        <text x="256" y="220" fill="#4ade80" font-size="8.5" text-anchor="middle">NW VAYAVYA GUEST</text>

        <!-- Main Entry -->
        <path d="M 120 25 L 140 25 A 20 20 0 0 1 120 45 Z" fill="rgba(234,179,8,0.12)" stroke="#eab308" stroke-width="2" />
        <line x1="120" y1="25" x2="120" y2="45" stroke="#fbbf24" stroke-width="2" />
        <text x="135" y="20" fill="#eab308" font-size="8.5" font-weight="bold" text-anchor="middle">MAIN ENTRY (EAST)</text>
        ${svgFooter('OPTION 1 · VASTU COMPLIANT RESIDENTIAL DWG')}
      `;

    // -------------------------------------------------------------
    // PLAN 2: Contemporary Glass Villa (Open Great Room + Island + Deck)
    // -------------------------------------------------------------
    case 'plan-2':
      return `
        ${svgHeader()}
        <!-- Double-Height Great Room with Curtain Glass -->
        <rect x="35" y="35" width="220" height="145" fill="rgba(168,85,247,0.06)" stroke="${color}" stroke-width="2" rx="3" />
        <!-- Huge Curtain Wall Glass Facade Indicator -->
        <line x1="35" y1="35" x2="150" y2="35" stroke="#c084fc" stroke-width="4" />
        <line x1="35" y1="37" x2="150" y2="37" stroke="#ffffff" stroke-width="1.2" />
        <text x="92" y="22" fill="#c084fc" font-size="7.5" font-weight="bold" text-anchor="middle">CURTAIN GLASS WALL (DOUBLE HEIGHT)</text>
        
        <!-- Curved Sectional Lounge -->
        <path d="M 45 55 Q 85 55 105 85 L 90 95 Q 75 75 45 70 Z" fill="rgba(168,85,247,0.2)" stroke="#c084fc" stroke-width="1" />
        <ellipse cx="75" cy="85" rx="14" ry="8" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.4)" stroke-width="0.8" />
        <text x="100" y="110" fill="#ffffff" font-size="11" font-weight="700" text-anchor="middle">DOUBLE HEIGHT GREAT HALL</text>
        <text x="100" y="125" fill="#c084fc" font-size="8.5" font-weight="600" text-anchor="middle">20' CEILING · ITALIAN MARBLE</text>

        <!-- Gourmet Island Kitchen with Bar Stools -->
        <rect x="160" y="55" width="80" height="42" fill="rgba(168,85,247,0.12)" stroke="#a855f7" stroke-width="1" rx="2" />
        <circle cx="175" cy="105" r="4" fill="#a855f7" stroke="#fff" stroke-width="0.8" />
        <circle cx="200" cy="105" r="4" fill="#a855f7" stroke="#fff" stroke-width="0.8" />
        <circle cx="225" cy="105" r="4" fill="#a855f7" stroke="#fff" stroke-width="0.8" />
        <text x="200" y="78" fill="#e9d5ff" font-size="8.5" font-weight="bold" text-anchor="middle">ISLAND BAR</text>

        <!-- Master Suite with Walk-In Closet -->
        <rect x="265" y="35" width="100" height="145" fill="rgba(56,189,248,0.06)" stroke="${color}" stroke-width="1.5" rx="3" />
        <path d="M 275 45 L 325 45 L 325 85 L 275 85 Z" fill="rgba(56,189,248,0.15)" stroke="#38bdf8" stroke-width="1" rx="2" />
        <rect x="332" y="45" width="28" height="50" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.25)" stroke-width="0.8" stroke-dasharray="2,2" />
        <text x="346" y="72" fill="#94a3b8" font-size="6.5" font-weight="bold" text-anchor="middle">WALK-IN</text>
        <!-- Designer Bath with Freestanding Oval Soaking Tub -->
        <ellipse cx="315" cy="150" rx="14" ry="9" fill="rgba(56,189,248,0.18)" stroke="#38bdf8" stroke-width="1.2" />
        <text x="315" y="153" fill="#7dd3fc" font-size="6.5" font-weight="bold" text-anchor="middle">SOAK TUB</text>
        <text x="300" y="105" fill="#ffffff" font-size="10" font-weight="700" text-anchor="middle">MASTER SUITE</text>

        <!-- Front Glass Terrace Deck -->
        <rect x="35" y="190" width="180" height="55" fill="rgba(168,85,247,0.08)" stroke="#a855f7" stroke-width="1.5" rx="3" />
        <line x1="35" y1="245" x2="215" y2="245" stroke="#e9d5ff" stroke-width="2.5" stroke-dasharray="8,4" />
        <circle cx="70" cy="215" r="7" fill="rgba(255,255,255,0.1)" stroke="#c084fc" stroke-width="0.8" />
        <circle cx="100" cy="215" r="7" fill="rgba(255,255,255,0.1)" stroke="#c084fc" stroke-width="0.8" />
        <text x="140" y="215" fill="#c084fc" font-size="9" font-weight="700">GLASS TERRACE DECK</text>
        <text x="140" y="228" fill="#94a3b8" font-size="7">CANTILEVERED BALCONY</text>

        <!-- Kids Bedroom / Study -->
        <rect x="225" y="190" width="140" height="55" fill="rgba(245,158,11,0.07)" stroke="${color}" stroke-width="1.5" rx="3" />
        <rect x="235" y="198" width="45" height="38" fill="rgba(245,158,11,0.15)" stroke="#fbbf24" stroke-width="0.8" rx="2" />
        <text x="257" y="218" fill="#fef08a" font-size="6.5" font-weight="bold" text-anchor="middle">BUNK BED</text>
        <text x="315" y="215" fill="#ffffff" font-size="9.5" font-weight="700" text-anchor="middle">KIDS SUITE</text>
        <text x="315" y="228" fill="#fbbf24" font-size="7.5" text-anchor="middle">WITH STUDY DESK</text>
        ${svgFooter('OPTION 2 · CONTEMPORARY GLASS VILLA ARCHITECTURE')}
      `;

    // -------------------------------------------------------------
    // PLAN 3: Traditional Heritage Courtyard (Brahmasthan & Pillared Veranda)
    // -------------------------------------------------------------
    case 'plan-3':
      return `
        ${svgHeader()}
        <!-- Central Sunken Courtyard / Nadumuttam (Brahmasthan) -->
        <rect x="145" y="85" width="110" height="90" fill="#042017" stroke="#4ade80" stroke-width="2" rx="3" />
        <rect x="155" y="95" width="90" height="70" fill="none" stroke="#22c55e" stroke-width="1" stroke-dasharray="3,3" />
        <!-- Sacred Tulsi Thara in Center -->
        <rect x="190" y="120" width="20" height="20" fill="#15803d" stroke="#86efac" stroke-width="1.2" rx="2" />
        <circle cx="200" cy="130" r="4" fill="#facc15" />
        <text x="200" y="112" fill="#86efac" font-size="7.5" font-weight="bold" text-anchor="middle">TULSI MANDAP</text>
        <text x="200" y="152" fill="#4ade80" font-size="7" font-weight="bold" text-anchor="middle">OPEN SKY COURTYARD</text>

        <!-- 4 Heritage Carved Teakwood Corner Pillars -->
        <circle cx="145" cy="85" r="4.5" fill="#b45309" stroke="#fcd34d" stroke-width="1" />
        <circle cx="255" cy="85" r="4.5" fill="#b45309" stroke="#fcd34d" stroke-width="1" />
        <circle cx="145" cy="175" r="4.5" fill="#b45309" stroke="#fcd34d" stroke-width="1" />
        <circle cx="255" cy="175" r="4.5" fill="#b45309" stroke="#fcd34d" stroke-width="1" />

        <!-- Surrounding Chettinad / Kerala Pillared Veranda Corridor -->
        <rect x="125" y="65" width="150" height="130" fill="none" stroke="rgba(250,204,21,0.3)" stroke-width="1" stroke-dasharray="4,4" />

        <!-- Formal Drawing Room (Left) -->
        <rect x="35" y="35" width="80" height="210" fill="rgba(74,222,128,0.06)" stroke="${color}" stroke-width="1.5" rx="3" />
        <rect x="42" y="45" width="66" height="25" fill="rgba(180,83,9,0.2)" stroke="#b45309" stroke-width="1" rx="2" />
        <text x="75" y="60" fill="#fde68a" font-size="6.5" font-weight="bold" text-anchor="middle">CHARUPADI BENCH</text>
        <text x="75" y="130" fill="#ffffff" font-size="10.5" font-weight="700" text-anchor="middle" transform="rotate(-90 75 130)">FORMAL HALL</text>
        <text x="75" y="225" fill="#4ade80" font-size="7.5" font-weight="bold" text-anchor="middle">EAST VERANDA</text>

        <!-- Heritage Master Bedroom (Top Right) -->
        <rect x="285" y="35" width="85" height="100" fill="rgba(234,179,8,0.06)" stroke="${color}" stroke-width="1.5" rx="3" />
        <rect x="295" y="45" width="45" height="45" fill="rgba(180,83,9,0.25)" stroke="#d97706" stroke-width="1" rx="2" />
        <text x="317" y="70" fill="#fed7aa" font-size="6" font-weight="bold" text-anchor="middle">4-POSTER BED</text>
        <text x="327" y="115" fill="#ffffff" font-size="9" font-weight="700" text-anchor="middle">HERITAGE SUITE</text>

        <!-- Traditional Kitchen & Dining (Bottom Right) -->
        <rect x="285" y="145" width="85" height="100" fill="rgba(245,158,11,0.06)" stroke="${color}" stroke-width="1.5" rx="3" />
        <path d="M 290 155 L 345 155 L 345 180" fill="none" stroke="#f59e0b" stroke-width="1.5" />
        <circle cx="305" cy="165" r="2.5" fill="#f59e0b" />
        <circle cx="325" cy="165" r="2.5" fill="#f59e0b" />
        <text x="327" y="210" fill="#ffffff" font-size="9" font-weight="700" text-anchor="middle">MUD KITCHEN</text>
        <text x="327" y="224" fill="#fbbf24" font-size="7" text-anchor="middle">SE AGNEYA</text>
        ${svgFooter('OPTION 3 · TRADITIONAL COURTYARD (BRAHMASTHAN) DWG')}
      `;

    // -------------------------------------------------------------
    // PLAN 4: Urban High Density Linear Dual-Balcony Plan
    // -------------------------------------------------------------
    case 'plan-4':
      return `
        ${svgHeader()}
        <!-- Deep Front Balcony -->
        <rect x="35" y="35" width="330" height="35" fill="rgba(245,158,11,0.09)" stroke="#f59e0b" stroke-width="1.8" rx="2" />
        <line x1="35" y1="35" x2="365" y2="35" stroke="#fbbf24" stroke-width="2.5" stroke-dasharray="6,3" />
        <circle cx="70" cy="52" r="5" fill="#78350f" stroke="#fbbf24" stroke-width="0.8" />
        <circle cx="100" cy="52" r="5" fill="#78350f" stroke="#fbbf24" stroke-width="0.8" />
        <text x="200" y="55" fill="#fef08a" font-size="9" font-weight="700" text-anchor="middle">CANTILEVERED FRONT STREET BALCONY (100% CROSS BREEZE)</text>

        <!-- Linear Living & Dining Corridor -->
        <rect x="35" y="75" width="200" height="95" fill="rgba(245,158,11,0.05)" stroke="${color}" stroke-width="1.5" rx="2" />
        <rect x="45" y="85" width="60" height="24" fill="rgba(245,158,11,0.18)" stroke="#f59e0b" stroke-width="1" rx="2" />
        <rect x="135" y="85" width="40" height="40" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.3)" stroke-width="0.8" rx="2" />
        <text x="135" y="145" fill="#ffffff" font-size="11" font-weight="700" text-anchor="middle">URBAN LIVING &amp; DINING</text>
        <text x="135" y="160" fill="#fbbf24" font-size="8" text-anchor="middle">ZERO CORRIDOR WASTAGE · 100% USEABLE</text>

        <!-- Galley Kitchen Core -->
        <rect x="240" y="75" width="125" height="95" fill="rgba(56,189,248,0.06)" stroke="${color}" stroke-width="1.5" rx="2" />
        <line x1="245" y1="90" x2="360" y2="90" stroke="#38bdf8" stroke-width="2" />
        <line x1="245" y1="140" x2="360" y2="140" stroke="#38bdf8" stroke-width="2" />
        <text x="302" y="115" fill="#ffffff" font-size="9.5" font-weight="700" text-anchor="middle">PARALLEL GALLEY</text>
        <text x="302" y="128" fill="#7dd3fc" font-size="7.5" text-anchor="middle">KITCHEN &amp; PANTRY</text>

        <!-- Rear Kids Bedroom (Left) -->
        <rect x="35" y="175" width="150" height="70" fill="rgba(74,222,128,0.07)" stroke="${color}" stroke-width="1.5" rx="2" />
        <rect x="42" y="185" width="45" height="35" fill="rgba(74,222,128,0.18)" stroke="#4ade80" stroke-width="1" rx="2" />
        <text x="120" y="210" fill="#ffffff" font-size="9.5" font-weight="700" text-anchor="middle">KIDS ROOM</text>
        <text x="120" y="224" fill="#86efac" font-size="7" text-anchor="middle">BUILT-IN LOFTS</text>

        <!-- Rear Master Suite with Private Rear Balcony -->
        <rect x="190" y="175" width="175" height="70" fill="rgba(168,85,247,0.07)" stroke="${color}" stroke-width="1.5" rx="2" />
        <rect x="198" y="185" width="50" height="40" fill="rgba(168,85,247,0.18)" stroke="#c084fc" stroke-width="1" rx="2" />
        <!-- Rear Private Balcony Strip -->
        <rect x="325" y="177" width="38" height="66" fill="rgba(245,158,11,0.15)" stroke="#fbbf24" stroke-width="1" stroke-dasharray="3,2" />
        <text x="344" y="215" fill="#fde68a" font-size="6.5" font-weight="bold" text-anchor="middle" transform="rotate(-90 344 215)">REAR BALCONY</text>
        <text x="278" y="210" fill="#ffffff" font-size="9.5" font-weight="700" text-anchor="middle">MASTER SUITE</text>
        <text x="278" y="224" fill="#c084fc" font-size="7" text-anchor="middle">PRIVATE RETREAT</text>
        ${svgFooter('OPTION 4 · DUAL BALCONY HIGH-DENSITY URBAN DWG')}
      `;

    // -------------------------------------------------------------
    // PLAN 5: G+1 Luxury Duplex Villa with Spiral Staircase
    // -------------------------------------------------------------
    case 'plan-5':
      return `
        ${svgHeader()}
        <!-- Grand Double Height Living Hall -->
        <rect x="35" y="35" width="190" height="135" fill="rgba(236,72,153,0.07)" stroke="${color}" stroke-width="1.8" rx="3" />
        <!-- Sectional Sofa -->
        <path d="M 45 50 L 95 50 L 95 70 L 65 70 L 65 110 L 45 110 Z" fill="rgba(236,72,153,0.18)" stroke="#f472b6" stroke-width="1" />
        <text x="130" y="95" fill="#ffffff" font-size="11" font-weight="700" text-anchor="middle">GRAND DUPLEX HALL</text>
        <text x="130" y="112" fill="#f472b6" font-size="8.5" font-weight="600" text-anchor="middle">SOARING 22' HIGH VOID</text>

        <!-- Sculptural Curved Spiral Staircase -->
        <circle cx="270" cy="100" r="32" fill="#180718" stroke="#ec4899" stroke-width="2" />
        ${[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => {
          const rad = (deg * Math.PI) / 180;
          const x2 = 270 + 32 * Math.cos(rad);
          const y2 = 100 + 32 * Math.sin(rad);
          return `<line x1="270" y1="100" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="rgba(244,114,182,0.6)" stroke-width="1" />`;
        }).join('')}
        <circle cx="270" cy="100" r="7" fill="#fb7185" stroke="#fff" stroke-width="1" />
        <text x="270" y="75" fill="#fbcfe8" font-size="6.5" font-weight="bold" text-anchor="middle">UP TO L1</text>
        <text x="270" y="145" fill="#ec4899" font-size="8" font-weight="700" text-anchor="middle">SPIRAL STAIRS</text>

        <!-- Master Suite L1 Projection / Sky Deck -->
        <rect x="312" y="35" width="55" height="135" fill="rgba(244,63,94,0.08)" stroke="#f43f5e" stroke-width="1.5" rx="2" />
        <text x="339" y="105" fill="#fda4af" font-size="7" font-weight="bold" text-anchor="middle" transform="rotate(-90 339 105)">FIRST FLOOR MASTER</text>

        <!-- Ground Floor Chef's Kitchen & Dining -->
        <rect x="35" y="175" width="160" height="70" fill="rgba(245,158,11,0.07)" stroke="${color}" stroke-width="1.5" rx="3" />
        <path d="M 40 180 L 100 180 L 100 195" fill="none" stroke="#f59e0b" stroke-width="2" />
        <circle cx="55" cy="188" r="2.5" fill="#fbbf24" />
        <circle cx="75" cy="188" r="2.5" fill="#fbbf24" />
        <text x="100" y="212" fill="#ffffff" font-size="9.5" font-weight="700" text-anchor="middle">CHEF'S KITCHEN</text>
        <text x="100" y="226" fill="#fbbf24" font-size="7.5" text-anchor="middle">ISLAND BREAKFAST BAR</text>

        <!-- Private Sky Deck & Pergola Lounge -->
        <rect x="200" y="175" width="167" height="70" fill="rgba(56,189,248,0.08)" stroke="#38bdf8" stroke-width="1.5" rx="3" />
        <!-- Pergola Slats -->
        <line x1="210" y1="180" x2="210" y2="240" stroke="rgba(56,189,248,0.3)" stroke-width="1.5" />
        <line x1="235" y1="180" x2="235" y2="240" stroke="rgba(56,189,248,0.3)" stroke-width="1.5" />
        <line x1="260" y1="180" x2="260" y2="240" stroke="rgba(56,189,248,0.3)" stroke-width="1.5" />
        <circle cx="290" cy="205" r="9" fill="rgba(255,255,255,0.1)" stroke="#38bdf8" stroke-width="0.8" />
        <circle cx="320" cy="205" r="9" fill="rgba(255,255,255,0.1)" stroke="#38bdf8" stroke-width="0.8" />
        <text x="280" y="228" fill="#38bdf8" font-size="8.5" font-weight="700" text-anchor="middle">SKY DECK PERGOLA LOUNGE</text>
        ${svgFooter('OPTION 5 · LUXURY G+1 DUPLEX VILLA DWG')}
      `;

    // -------------------------------------------------------------
    // PLAN 6: Stilt Parking + Independent Residence Plan
    // -------------------------------------------------------------
    case 'plan-6':
      return `
        ${svgHeader()}
        <!-- Covered Stilt Parking Zone (Ground Level) -->
        <rect x="35" y="35" width="220" height="210" fill="rgba(6,182,212,0.06)" stroke="#06b6d4" stroke-width="2" rx="3" />
        
        <!-- Sedan Car Bay 1 -->
        <rect x="45" y="45" width="90" height="55" fill="rgba(6,182,212,0.12)" stroke="#22d3ee" stroke-width="1" stroke-dasharray="4,2" rx="3" />
        <rect x="55" y="52" width="70" height="40" fill="rgba(255,255,255,0.08)" stroke="#22d3ee" stroke-width="1" rx="6" />
        <line x1="65" y1="52" x2="65" y2="92" stroke="#22d3ee" stroke-width="1" />
        <line x1="115" y1="52" x2="115" y2="92" stroke="#22d3ee" stroke-width="1" />
        <text x="90" y="76" fill="#a5f3fc" font-size="7.5" font-weight="bold" text-anchor="middle">CAR BAY 1 (SUV)</text>

        <!-- Sedan Car Bay 2 -->
        <rect x="45" y="110" width="90" height="55" fill="rgba(6,182,212,0.12)" stroke="#22d3ee" stroke-width="1" stroke-dasharray="4,2" rx="3" />
        <rect x="55" y="117" width="70" height="40" fill="rgba(255,255,255,0.08)" stroke="#22d3ee" stroke-width="1" rx="6" />
        <line x1="65" y1="117" x2="65" y2="157" stroke="#22d3ee" stroke-width="1" />
        <line x1="115" y1="117" x2="115" y2="157" stroke="#22d3ee" stroke-width="1" />
        <text x="90" y="141" fill="#a5f3fc" font-size="7.5" font-weight="bold" text-anchor="middle">CAR BAY 2 (SEDAN)</text>

        <!-- Two-Wheeler / Bike Parking Slots -->
        <rect x="45" y="175" width="100" height="60" fill="rgba(6,182,212,0.05)" stroke="rgba(255,255,255,0.2)" stroke-width="1" stroke-dasharray="2,2" rx="2" />
        <line x1="70" y1="175" x2="70" y2="235" stroke="#22d3ee" stroke-width="0.8" />
        <line x1="95" y1="175" x2="95" y2="235" stroke="#22d3ee" stroke-width="0.8" />
        <line x1="120" y1="175" x2="120" y2="235" stroke="#22d3ee" stroke-width="0.8" />
        <text x="95" y="210" fill="#a5f3fc" font-size="7" font-weight="bold" text-anchor="middle">4x BIKE SLOTS</text>

        <!-- Security Guard Cabin & Core -->
        <rect x="150" y="45" width="95" height="40" fill="rgba(245,158,11,0.1)" stroke="#f59e0b" stroke-width="1" rx="2" />
        <text x="197" y="68" fill="#fbbf24" font-size="7.5" font-weight="bold" text-anchor="middle">SECURITY CABIN</text>

        <!-- High-Speed Passenger Lift & Stair Core -->
        <rect x="150" y="95" width="95" height="140" fill="rgba(15,23,42,0.9)" stroke="#38bdf8" stroke-width="1.5" rx="2" />
        <rect x="160" y="105" width="40" height="40" fill="rgba(56,189,248,0.2)" stroke="#38bdf8" stroke-width="1" />
        <line x1="160" y1="105" x2="200" y2="145" stroke="#38bdf8" stroke-width="1" />
        <line x1="200" y1="105" x2="160" y2="145" stroke="#38bdf8" stroke-width="1" />
        <text x="180" y="160" fill="#38bdf8" font-size="6.5" font-weight="bold" text-anchor="middle">LIFT</text>
        <text x="197" y="200" fill="#ffffff" font-size="8" font-weight="bold" text-anchor="middle">ENTRY STAIRS</text>
        <text x="197" y="215" fill="#94a3b8" font-size="6.5" text-anchor="middle">TO UPPER RESIDENCE</text>

        <!-- Upper Floor Plan Projection (Right Side) -->
        <rect x="265" y="35" width="100" height="210" fill="rgba(56,189,248,0.06)" stroke="${color}" stroke-width="1.5" rx="3" />
        <text x="315" y="60" fill="#38bdf8" font-size="8.5" font-weight="bold" text-anchor="middle">UPPER FLOOR</text>
        <text x="315" y="75" fill="#ffffff" font-size="10" font-weight="700" text-anchor="middle">LIVING &amp; BED 1</text>
        <rect x="275" y="90" width="80" height="60" fill="rgba(168,85,247,0.12)" stroke="#a855f7" stroke-width="1" rx="2" />
        <text x="315" y="125" fill="#e9d5ff" font-size="8.5" font-weight="bold" text-anchor="middle">MASTER SUITE</text>
        <rect x="275" y="160" width="80" height="75" fill="rgba(74,222,128,0.1)" stroke="#4ade80" stroke-width="1" rx="2" />
        <text x="315" y="200" fill="#bbf7d0" font-size="8.5" font-weight="bold" text-anchor="middle">BALCONY DECK</text>
        ${svgFooter('OPTION 6 · STILT PARKING + INDEPENDENT RESIDENCE DWG')}
      `;

    // -------------------------------------------------------------
    // PLAN 7: Dual-Unit Rental Ground + Owner Residence (Income Generator)
    // -------------------------------------------------------------
    case 'plan-7':
      return `
        ${svgHeader()}
        <!-- Prominent Dividing Acoustic Party Wall -->
        <line x1="165" y1="25" x2="165" y2="255" stroke="#10b981" stroke-width="3" stroke-dasharray="8,4" />
        <rect x="155" y="130" width="20" height="20" fill="#042217" stroke="#10b981" stroke-width="1" rx="2" />
        <text x="165" y="143" fill="#34d399" font-size="6" font-weight="bold" text-anchor="middle">WALL</text>

        <!-- LEFT SIDE: Independent 1BHK Rental Unit (Generates ₹18,000/mo) -->
        <rect x="35" y="35" width="125" height="210" fill="rgba(16,185,129,0.06)" stroke="#10b981" stroke-width="1.5" rx="3" />
        <rect x="42" y="42" width="111" height="20" fill="rgba(16,185,129,0.2)" rx="2" />
        <text x="97" y="55" fill="#6ee7b7" font-size="7.5" font-weight="bold" text-anchor="middle">TENANT 1BHK UNIT</text>

        <rect x="45" y="70" width="105" height="50" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.2)" rx="2" />
        <text x="97" y="95" fill="#ffffff" font-size="9" font-weight="700" text-anchor="middle">TENANT LIVING</text>
        <text x="97" y="108" fill="#a7f3d0" font-size="7" text-anchor="middle">+ KITCHENETTE</text>

        <rect x="45" y="130" width="105" height="65" fill="rgba(16,185,129,0.12)" stroke="#10b981" rx="2" />
        <text x="97" y="160" fill="#ffffff" font-size="9" font-weight="700" text-anchor="middle">TENANT BEDROOM</text>
        <text x="97" y="174" fill="#a7f3d0" font-size="7" text-anchor="middle">ATTACHED BATH</text>

        <text x="97" y="225" fill="#34d399" font-size="8" font-weight="bold" text-anchor="middle">SEPARATE GATE ENTRY</text>

        <!-- RIGHT SIDE: Owner's Grand Residence -->
        <rect x="175" y="35" width="190" height="210" fill="rgba(56,189,248,0.06)" stroke="${color}" stroke-width="1.5" rx="3" />
        <rect x="182" y="42" width="176" height="20" fill="rgba(56,189,248,0.2)" rx="2" />
        <text x="270" y="55" fill="#7dd3fc" font-size="7.5" font-weight="bold" text-anchor="middle">OWNER PRIVATE DUPLEX RESIDENCE</text>

        <!-- Owner Grand Living Room -->
        <rect x="185" y="70" width="170" height="75" fill="rgba(56,189,248,0.08)" stroke="${color}" rx="2" />
        <text x="270" y="105" fill="#ffffff" font-size="11" font-weight="700" text-anchor="middle">OWNER DRAWING HALL</text>
        <text x="270" y="120" fill="#38bdf8" font-size="8" text-anchor="middle">ITALIAN MARBLE · GRAND ENTRANCE</text>

        <!-- Owner Private Marble Staircase to Upper Floors -->
        <rect x="185" y="155" width="80" height="80" fill="rgba(245,158,11,0.1)" stroke="#f59e0b" stroke-width="1" rx="2" />
        ${[165, 175, 185, 195, 205, 215, 225].map(y => `<line x1="185" y1="${y}" x2="265" y2="${y}" stroke="rgba(251,191,36,0.5)" stroke-width="1" />`).join('')}
        <text x="225" y="200" fill="#fef08a" font-size="7.5" font-weight="bold" text-anchor="middle">PRIVATE STAIRS</text>

        <!-- Owner Master Bedroom & Puja -->
        <rect x="275" y="155" width="80" height="80" fill="rgba(168,85,247,0.1)" stroke="#a855f7" rx="2" />
        <text x="315" y="190" fill="#ffffff" font-size="9.5" font-weight="700" text-anchor="middle">MASTER SUITE</text>
        <text x="315" y="205" fill="#e9d5ff" font-size="7" text-anchor="middle">+ MANDIR ALCOVE</text>
        ${svgFooter('OPTION 7 · MULTI-FAMILY PASSIVE INCOME DWG')}
      `;

    // -------------------------------------------------------------
    // PLAN 8: Eco-Green Solar Passive House Plan
    // -------------------------------------------------------------
    case 'plan-8':
      return `
        ${svgHeader()}
        <!-- Central Indoor Green Lightwell & Courtyard -->
        <rect x="135" y="75" width="130" height="110" fill="#0c2005" stroke="#84cc16" stroke-width="2" rx="4" />
        <!-- Lush Indoor Plant & Foliage Symbols -->
        <circle cx="200" cy="120" r="18" fill="#4d7c0f" stroke="#a3e635" stroke-width="1.2" />
        <circle cx="190" cy="115" r="10" fill="#65a30d" />
        <circle cx="210" cy="115" r="10" fill="#65a30d" />
        <circle cx="200" cy="130" r="10" fill="#65a30d" />
        <text x="200" y="152" fill="#d9f99d" font-size="8" font-weight="bold" text-anchor="middle">BIOPHILIC ATRIUM</text>
        <text x="200" y="165" fill="#a3e635" font-size="7" text-anchor="middle">STACK VENTILATION SHAFT</text>

        <!-- Deep Shaded South Verandah with Louvers -->
        <rect x="35" y="35" width="330" height="35" fill="rgba(132,204,22,0.08)" stroke="#84cc16" stroke-width="1.5" rx="2" />
        <line x1="45" y1="42" x2="355" y2="42" stroke="#a3e635" stroke-width="1" stroke-dasharray="6,4" />
        <text x="200" y="55" fill="#bef264" font-size="8.5" font-weight="bold" text-anchor="middle">DEEP OVERHANG VERANDAH (PASSIVE SOLAR SHADING -4°C)</text>

        <!-- Naturally Lit Living Room (Left) -->
        <rect x="35" y="75" width="95" height="110" fill="rgba(132,204,22,0.06)" stroke="${color}" rx="2" />
        <text x="82" y="125" fill="#ffffff" font-size="10" font-weight="700" text-anchor="middle">LIVING ROOM</text>
        <text x="82" y="140" fill="#bef264" font-size="7" text-anchor="middle">DAYLIGHT OPTIMIZED</text>

        <!-- Eco Master Bedroom (Right) -->
        <rect x="270" y="75" width="95" height="110" fill="rgba(56,189,248,0.06)" stroke="${color}" rx="2" />
        <text x="317" y="125" fill="#ffffff" font-size="10" font-weight="700" text-anchor="middle">ECO BEDROOM</text>
        <text x="317" y="140" fill="#7dd3fc" font-size="7" text-anchor="middle">CROSS-BREEZE WINDOWS</text>

        <!-- Solar Kitchen & Dining (Bottom Left) -->
        <rect x="35" y="190" width="160" height="55" fill="rgba(245,158,11,0.07)" stroke="#f59e0b" rx="2" />
        <text x="115" y="215" fill="#ffffff" font-size="9.5" font-weight="700" text-anchor="middle">SOLAR KITCHEN &amp; DINING</text>
        <text x="115" y="228" fill="#fbbf24" font-size="7" text-anchor="middle">ORIENTATION FOR NATURAL LIGHT</text>

        <!-- Rainwater Harvesting Storage Cistern (Bottom Right) -->
        <rect x="205" y="190" width="160" height="55" fill="rgba(6,182,212,0.1)" stroke="#06b6d4" stroke-width="1.5" rx="2" />
        <circle cx="230" cy="217" r="14" fill="#083344" stroke="#22d3ee" stroke-width="1.2" />
        <text x="230" y="220" fill="#38bdf8" font-size="6" font-weight="bold" text-anchor="middle">RWH</text>
        <text x="290" y="215" fill="#a5f3fc" font-size="8" font-weight="bold">10,000L CISTERN</text>
        <text x="290" y="228" fill="#94a3b8" font-size="6.5">RAINWATER RECHARGE</text>
        ${svgFooter('OPTION 8 · ECO-GREEN PASSIVE SOLAR DWG')}
      `;

    // -------------------------------------------------------------
    // PLAN 9: Cost-Optimized Modular 4-Quadrant Plan
    // -------------------------------------------------------------
    case 'plan-9':
      return `
        ${svgHeader()}
        <!-- Central Symmetrical Grid Partition Lines -->
        <line x1="200" y1="25" x2="200" y2="255" stroke="rgba(244,63,94,0.4)" stroke-width="2" stroke-dasharray="6,4" />
        <line x1="25" y1="140" x2="375" y2="140" stroke="rgba(244,63,94,0.4)" stroke-width="2" stroke-dasharray="6,4" />

        <!-- QUAD 1 (Top Left): Open Living-Dining Studio -->
        <rect x="35" y="35" width="160" height="100" fill="rgba(244,63,94,0.06)" stroke="${color}" stroke-width="1.5" rx="2" />
        <text x="115" y="80" fill="#ffffff" font-size="11" font-weight="700" text-anchor="middle">OPEN LIVING STUDIO</text>
        <text x="115" y="96" fill="#fb7185" font-size="8.5" font-weight="600" text-anchor="middle">ZERO DEAD SPACE (SAVE 15%)</text>

        <!-- QUAD 2 (Top Right): Symmetrical Bedroom 1 -->
        <rect x="205" y="35" width="160" height="100" fill="rgba(56,189,248,0.06)" stroke="${color}" stroke-width="1.5" rx="2" />
        <rect x="215" y="45" width="55" height="40" fill="rgba(56,189,248,0.15)" stroke="#38bdf8" rx="2" />
        <text x="285" y="80" fill="#ffffff" font-size="10.5" font-weight="700" text-anchor="middle">BEDROOM 1</text>
        <text x="285" y="96" fill="#7dd3fc" font-size="8" text-anchor="middle">STANDARD 12'x12' BAY</text>

        <!-- CENTRAL PLUMBING CORE SHAFT (SHARED BATHS) -->
        <rect x="175" y="115" width="50" height="50" fill="#1f0a10" stroke="#f43f5e" stroke-width="1.5" rx="3" />
        <line x1="175" y1="140" x2="225" y2="140" stroke="#fb7185" stroke-width="1" />
        <text x="200" y="132" fill="#fda4af" font-size="6.5" font-weight="bold" text-anchor="middle">BATH 1</text>
        <text x="200" y="152" fill="#fda4af" font-size="6.5" font-weight="bold" text-anchor="middle">BATH 2</text>

        <!-- QUAD 3 (Bottom Left): Linear Efficient Kitchen & Utility -->
        <rect x="35" y="145" width="160" height="100" fill="rgba(245,158,11,0.06)" stroke="${color}" stroke-width="1.5" rx="2" />
        <path d="M 40 155 L 140 155 L 140 180" fill="none" stroke="#f59e0b" stroke-width="2" />
        <circle cx="55" cy="165" r="2.5" fill="#fbbf24" />
        <circle cx="85" cy="165" r="2.5" fill="#fbbf24" />
        <text x="115" y="200" fill="#ffffff" font-size="10" font-weight="700" text-anchor="middle">MODULAR KITCHEN</text>
        <text x="115" y="214" fill="#fbbf24" font-size="8" text-anchor="middle">DIRECT PLUMBING SHAFT ALIGN</text>

        <!-- QUAD 4 (Bottom Right): Symmetrical Bedroom 2 -->
        <rect x="205" y="145" width="160" height="100" fill="rgba(74,222,128,0.06)" stroke="${color}" stroke-width="1.5" rx="2" />
        <rect x="215" y="155" width="55" height="40" fill="rgba(74,222,128,0.15)" stroke="#4ade80" rx="2" />
        <text x="285" y="200" fill="#ffffff" font-size="10.5" font-weight="700" text-anchor="middle">BEDROOM 2</text>
        <text x="285" y="214" fill="#86efac" font-size="8" text-anchor="middle">REPETITIVE RCC SHUTTERING</text>
        ${svgFooter('OPTION 9 · STANDARDIZED MODULAR COST-OPTIMIZED DWG')}
      `;

    // -------------------------------------------------------------
    // PLAN 10: Luxury Villa with Swimming Pool & Wooden Deck
    // -------------------------------------------------------------
    case 'plan-10':
      return `
        ${svgHeader(`
          <linearGradient id="pool-water-${template.id}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0284c7" />
            <stop offset="50%" stop-color="#06b6d4" />
            <stop offset="100%" stop-color="#0891b2" />
          </linearGradient>
        `)}
        <!-- Private Turquoise Swimming Lap Pool -->
        <rect x="180" y="35" width="185" height="95" fill="url(#pool-water-${template.id})" stroke="#38bdf8" stroke-width="2" rx="4" />
        <!-- Pool Water Wave Ripple Lines -->
        <path d="M 195 55 Q 215 50 235 55 T 275 55 T 315 55" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.2" />
        <path d="M 215 80 Q 235 75 255 80 T 295 80 T 335 80" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.2" />
        <path d="M 195 105 Q 215 100 235 105 T 275 105 T 315 105" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.2" />
        <!-- Stainless Steel Pool Ladder -->
        <rect x="190" y="40" width="12" height="18" fill="none" stroke="#ffffff" stroke-width="1.5" />
        <text x="275" y="70" fill="#ffffff" font-size="10.5" font-weight="800" letter-spacing="1" text-anchor="middle">PRIVATE LAP POOL</text>
        <text x="275" y="85" fill="#e0f2fe" font-size="7.5" font-weight="600" text-anchor="middle">4.5' DEPTH · RECIRCULATION JETS</text>

        <!-- Teakwood Poolside Sun Deck with Chaise Lounges -->
        <rect x="180" y="135" width="185" height="40" fill="#451a03" stroke="#b45309" stroke-width="1.5" rx="2" />
        ${[195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345].map(x => `<line x1="${x}" y1="135" x2="${x}" y2="175" stroke="#78350f" stroke-width="1" />`).join('')}
        <!-- Two Sun Lounger Chairs & Parasol -->
        <rect x="200" y="145" width="22" height="12" fill="#fde68a" stroke="#d97706" rx="1" />
        <rect x="235" y="145" width="22" height="12" fill="#fde68a" stroke="#d97706" rx="1" />
        <circle cx="280" cy="155" r="9" fill="#fbbf24" stroke="#ffffff" stroke-width="1" />
        <text x="325" y="158" fill="#fed7aa" font-size="7.5" font-weight="bold">TEAK DECK</text>

        <!-- Grand L-Shaped Resort Living Hall Opening to Pool -->
        <rect x="35" y="35" width="140" height="140" fill="rgba(99,102,241,0.07)" stroke="${color}" stroke-width="1.8" rx="3" />
        <!-- Full-Height Sliding Glass Pocket Doors Overlooking Pool -->
        <line x1="175" y1="35" x2="175" y2="135" stroke="#38bdf8" stroke-width="4" stroke-dasharray="10,4" />
        <text x="105" y="90" fill="#ffffff" font-size="11" font-weight="700" text-anchor="middle">GREAT ROOM</text>
        <text x="105" y="106" fill="#818cf8" font-size="8.5" text-anchor="middle">GLASS WALL FACING POOL</text>

        <!-- Presidential Master Suite with Free-Standing Jacuzzi Tub -->
        <rect x="35" y="180" width="330" height="65" fill="rgba(168,85,247,0.07)" stroke="${color}" stroke-width="1.5" rx="3" />
        <path d="M 45 190 L 105 190 L 105 235 L 45 235 Z" fill="rgba(168,85,247,0.18)" stroke="#c084fc" stroke-width="1" rx="2" />
        <ellipse cx="320" cy="212" rx="18" ry="11" fill="rgba(56,189,248,0.2)" stroke="#38bdf8" stroke-width="1.5" />
        <text x="320" y="215" fill="#7dd3fc" font-size="6.5" font-weight="bold" text-anchor="middle">JACUZZI</text>
        <text x="185" y="210" fill="#ffffff" font-size="10.5" font-weight="700" text-anchor="middle">PRESIDENTIAL SUITE</text>
        <text x="185" y="225" fill="#c084fc" font-size="8" text-anchor="middle">POOL WATERFALL VIEW · DUAL ENSUITE</text>
        ${svgFooter('OPTION 10 · ULTRA LUXURY RESORT POOL VILLA DWG')}
      `;

    default:
      return `${svgHeader()}${svgFooter()}`;
  }
}

// ==================== 3D Front Elevation Render SVG Dispatcher ====================
export function renderFloorPlanElevation(template, width, depth) {
  const color = template.colorScheme || '#38bdf8';

  const elevationHeader = (customDefs = '') => `
    <svg viewBox="0 0 400 280" width="100%" height="230" class="blueprint-svg" style="background:${template.elevationPreviewBg};border-radius:10px;border:1px solid rgba(255,255,255,0.18);box-shadow:inset 0 2px 14px rgba(0,0,0,0.6)">
      <defs>
        ${customDefs}
      </defs>
      <!-- Ground Horizon Line & Paved Driveway -->
      <rect x="0" y="225" width="400" height="55" fill="#0b1324" />
      <line x1="0" y1="225" x2="400" y2="225" stroke="${color}" stroke-width="2" />
  `;

  const elevationFooter = (badgeTitle) => `
      <!-- Facade Style Badge -->
      <rect x="100" y="8" width="200" height="20" fill="rgba(7,13,24,0.9)" stroke="rgba(255,255,255,0.2)" rx="10" />
      <text x="200" y="22" fill="#ffffff" font-size="10" font-weight="700" letter-spacing="0.5" text-anchor="middle">${badgeTitle}</text>
      <text x="200" y="265" fill="${color}" font-size="9" font-weight="700" letter-spacing="0.5" text-anchor="middle">3D FRONT ELEVATION ARCHITECTURAL FACADE</text>
    </svg>
  `;

  switch(template.id) {
    // -------------------------------------------------------------
    // PLAN 1: Modern Minimalist Facade
    // -------------------------------------------------------------
    case 'plan-1':
      return `
        ${elevationHeader()}
        <!-- Ground Floor Mass -->
        <rect x="55" y="115" width="290" height="110" fill="#111c30" stroke="${color}" stroke-width="2" rx="4" />
        <!-- First Floor Cantilever Deck -->
        <rect x="70" y="35" width="260" height="80" fill="#0c1526" stroke="#ffffff" stroke-width="1.8" rx="4" />
        <!-- Glass Balcony -->
        <rect x="70" y="88" width="260" height="26" fill="rgba(56,189,248,0.2)" stroke="${color}" stroke-width="1.2" rx="2" />
        <line x1="70" y1="88" x2="330" y2="88" stroke="#ffffff" stroke-width="2" />
        <!-- Teak Door -->
        <rect x="175" y="145" width="50" height="80" fill="#78350f" stroke="#f59e0b" stroke-width="1.8" rx="2" />
        <line x1="215" y1="170" x2="215" y2="198" stroke="#fef08a" stroke-width="2.5" stroke-linecap="round" />
        <!-- Windows -->
        <rect x="80" y="46" width="65" height="38" fill="rgba(56,189,248,0.28)" stroke="#ffffff" stroke-width="1.5" rx="2" />
        <rect x="250" y="46" width="65" height="38" fill="rgba(56,189,248,0.28)" stroke="#ffffff" stroke-width="1.5" rx="2" />
        <!-- Foliage -->
        <path d="M 20 225 Q 35 195 50 225 Z" fill="#10b981" />
        <path d="M 350 225 Q 365 195 380 225 Z" fill="#10b981" />
        ${elevationFooter('MODERN MINIMALIST FACADE')}
      `;

    // -------------------------------------------------------------
    // PLAN 2: Contemporary Soaring Glass Villa
    // -------------------------------------------------------------
    case 'plan-2':
      return `
        ${elevationHeader()}
        <!-- Towering Double-Height Structural Glass Curtain Wall -->
        <rect x="60" y="35" width="160" height="190" fill="rgba(168,85,247,0.15)" stroke="#c084fc" stroke-width="2" rx="4" />
        <!-- Curtain Wall Vertical & Horizontal Steel Mullions -->
        <line x1="100" y1="35" x2="100" y2="225" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" />
        <line x1="140" y1="35" x2="140" y2="225" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" />
        <line x1="180" y1="35" x2="180" y2="225" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" />
        <line x1="60" y1="95" x2="220" y2="95" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" />
        <line x1="60" y1="160" x2="220" y2="160" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" />
        <!-- Interior Chandelier Silhouette Glowing Through Glass -->
        <line x1="140" y1="35" x2="140" y2="75" stroke="#fef08a" stroke-width="1.5" />
        <circle cx="140" cy="80" r="10" fill="rgba(254,240,138,0.3)" stroke="#fef08a" stroke-width="1.5" />
        <circle cx="140" cy="80" r="3" fill="#ffffff" />

        <!-- Floating Slate Charcoal Cantilever Box (Right) -->
        <rect x="230" y="45" width="120" height="85" fill="#1e1b4b" stroke="#a855f7" stroke-width="2" rx="3" />
        <rect x="245" y="60" width="90" height="40" fill="rgba(56,189,248,0.3)" stroke="#fff" stroke-width="1.2" />
        <!-- Ground Entrance Lounge -->
        <rect x="230" y="140" width="120" height="85" fill="#0f0e26" stroke="#c084fc" stroke-width="1.5" rx="3" />
        <rect x="260" y="155" width="50" height="70" fill="#312e81" stroke="#a855f7" stroke-width="1.5" />
        ${elevationFooter('CONTEMPORARY DOUBLE-HEIGHT GLASS ELEVATION')}
      `;

    // -------------------------------------------------------------
    // PLAN 3: Traditional Heritage Pitched Slope Roof (Mangalore Tiles)
    // -------------------------------------------------------------
    case 'plan-3':
      return `
        ${elevationHeader()}
        <!-- Sloped Pitched Mangalore Terracotta Tile Roof (Triangle Gable) -->
        <polygon points="200,35 45,120 355,120" fill="#7c2d12" stroke="#ea580c" stroke-width="2.5" />
        ${[50, 65, 80, 95, 110].map(y => `<line x1="${200 - (y-35)*1.8}" y1="${y}" x2="${200 + (y-35)*1.8}" y2="${y}" stroke="#ea580c" stroke-width="1.2" />`).join('')}
        
        <!-- Ornamental Wooden Gable Finial on Peak -->
        <line x1="200" y1="20" x2="200" y2="35" stroke="#fcd34d" stroke-width="3" />
        <circle cx="200" cy="18" r="4" fill="#d97706" stroke="#fef08a" stroke-width="1" />

        <!-- Traditional Veranda with Carved Chettinad Timber Pillars -->
        <rect x="65" y="120" width="270" height="105" fill="#14532d" stroke="#facc15" stroke-width="1.8" />
        ${[80, 140, 200, 260, 320].map(x => `
          <rect x="${x-4}" y="120" width="8" height="105" fill="#b45309" stroke="#fde68a" stroke-width="1" rx="1" />
          <polygon points="${x-8},120 ${x+8},120 ${x},130" fill="#d97706" />
        `).join('')}

        <!-- Arched Wooden Double Door with Brass Ring Knocker -->
        <path d="M 180 155 Q 200 135 220 155 L 220 225 L 180 225 Z" fill="#78350f" stroke="#f59e0b" stroke-width="1.5" />
        <circle cx="195" cy="185" r="2.5" fill="#facc15" />
        <circle cx="205" cy="185" r="2.5" fill="#facc15" />
        ${elevationFooter('SOUTH INDIAN TRADITIONAL SLOPE ROOF ELEVATION')}
      `;

    // -------------------------------------------------------------
    // PLAN 4: Urban High Density Stacked Dual Balconies
    // -------------------------------------------------------------
    case 'plan-4':
      return `
        ${elevationHeader()}
        <!-- Concrete Geometric Urban Mass -->
        <rect x="70" y="35" width="260" height="190" fill="#291a0c" stroke="#f59e0b" stroke-width="2" rx="4" />
        
        <!-- Upper Balcony Cantilever -->
        <rect x="55" y="45" width="140" height="60" fill="rgba(245,158,11,0.15)" stroke="#fbbf24" stroke-width="2" rx="2" />
        <!-- Horizontal Louvers -->
        ${[55, 65, 75, 85].map(y => `<line x1="55" y1="${y}" x2="195" y2="${y}" stroke="#d97706" stroke-width="1.5" />`).join('')}
        
        <!-- Lower Balcony Cantilever -->
        <rect x="205" y="115" width="140" height="60" fill="rgba(245,158,11,0.15)" stroke="#fbbf24" stroke-width="2" rx="2" />
        ${[125, 135, 145, 155].map(y => `<line x1="205" y1="${y}" x2="345" y2="${y}" stroke="#d97706" stroke-width="1.5" />`).join('')}

        <!-- Street Level Entrance -->
        <rect x="90" y="150" width="55" height="75" fill="#1c1917" stroke="#fbbf24" stroke-width="1.5" rx="2" />
        ${elevationFooter('URBAN HIGH-DENSITY DUAL BALCONY FACADE')}
      `;

    // -------------------------------------------------------------
    // PLAN 5: G+1 Luxury Duplex Villa with Sky Deck Pergola
    // -------------------------------------------------------------
    case 'plan-5':
      return `
        ${elevationHeader()}
        <!-- Rooftop Pergola Canopy -->
        <rect x="80" y="20" width="130" height="8" fill="#be185d" stroke="#f472b6" stroke-width="1" />
        ${[95, 115, 135, 155, 175, 195].map(x => `<line x1="${x}" y1="20" x2="${x}" y2="55" stroke="#f472b6" stroke-width="1.5" />`).join('')}

        <!-- First Floor Cantilevered Master Suite -->
        <rect x="65" y="55" width="270" height="80" fill="#1f0717" stroke="#ec4899" stroke-width="2" rx="3" />
        <rect x="75" y="65" width="120" height="50" fill="rgba(236,72,153,0.25)" stroke="#ffffff" stroke-width="1.5" />
        <!-- Floating Glass Balustrade -->
        <rect x="210" y="90" width="115" height="35" fill="rgba(56,189,248,0.2)" stroke="#ec4899" stroke-width="1" />

        <!-- Ground Floor Grand Entrance -->
        <rect x="55" y="135" width="290" height="90" fill="#12040e" stroke="#f43f5e" stroke-width="2" rx="3" />
        <rect x="170" y="150" width="60" height="75" fill="#78350f" stroke="#f59e0b" stroke-width="1.5" />
        ${elevationFooter('LUXURY G+1 DUPLEX VILLA WITH SKY DECK')}
      `;

    // -------------------------------------------------------------
    // PLAN 6: Stilt Parking Ground + Elevated Residence
    // -------------------------------------------------------------
    case 'plan-6':
      return `
        ${elevationHeader()}
        <!-- High-Clearance Ground Stilt Concrete Columns (Open Air) -->
        ${[70, 150, 230, 310].map(x => `
          <rect x="${x-7}" y="145" width="14" height="80" fill="#083344" stroke="#22d3ee" stroke-width="1.5" />
        `).join('')}

        <!-- Parked Cars Silhouette in Ground Stilt -->
        <path d="M 85 185 Q 100 170 120 170 Q 140 170 145 185 L 145 215 L 85 215 Z" fill="rgba(6,182,212,0.3)" stroke="#06b6d4" stroke-width="1.2" />
        <circle cx="100" cy="215" r="7" fill="#0f172a" stroke="#22d3ee" />
        <circle cx="135" cy="215" r="7" fill="#0f172a" stroke="#22d3ee" />

        <path d="M 245 185 Q 260 170 280 170 Q 300 170 305 185 L 305 215 L 245 215 Z" fill="rgba(6,182,212,0.3)" stroke="#06b6d4" stroke-width="1.2" />
        <circle cx="260" cy="215" r="7" fill="#0f172a" stroke="#22d3ee" />
        <circle cx="295" cy="215" r="7" fill="#0f172a" stroke="#22d3ee" />

        <!-- Floating Upper Residential Box with Decorative CNC Screen -->
        <rect x="50" y="35" width="300" height="110" fill="#0b1728" stroke="#06b6d4" stroke-width="2.2" rx="4" />
        <rect x="65" y="50" width="120" height="80" fill="rgba(6,182,212,0.15)" stroke="#38bdf8" stroke-width="1.5" />
        <!-- CNC Jali Screen (Geometric Dots) -->
        <rect x="205" y="50" width="130" height="80" fill="#031a24" stroke="#22d3ee" stroke-width="1.2" />
        ${[65, 85, 105].map(y => [220, 245, 270, 295, 320].map(x => `<circle cx="${x}" cy="${y}" r="2" fill="#22d3ee" />`).join('')).join('')}
        ${elevationFooter('STILT PARKING + FLOATING RESIDENCE FACADE')}
      `;

    // -------------------------------------------------------------
    // PLAN 7: Dual-Unit Income House (Two Front Doors)
    // -------------------------------------------------------------
    case 'plan-7':
      return `
        ${elevationHeader()}
        <!-- Main Duplex Massing -->
        <rect x="50" y="35" width="300" height="190" fill="#061c14" stroke="#10b981" stroke-width="2" rx="4" />
        <line x1="170" y1="35" x2="170" y2="225" stroke="#34d399" stroke-width="2" stroke-dasharray="6,3" />

        <!-- Left Unit A (Rental Unit Door & Window) -->
        <rect x="75" y="150" width="42" height="75" fill="#047857" stroke="#34d399" stroke-width="1.5" rx="2" />
        <rect x="75" y="132" width="42" height="14" fill="#022c22" stroke="#34d399" rx="2" />
        <text x="96" y="142" fill="#6ee7b7" font-size="6.5" font-weight="bold" text-anchor="middle">UNIT 101</text>
        <rect x="70" y="55" width="75" height="50" fill="rgba(16,185,129,0.2)" stroke="#ffffff" stroke-width="1.2" />

        <!-- Right Unit B (Owner Grand Door & Balcony) -->
        <rect x="230" y="140" width="55" height="85" fill="#78350f" stroke="#f59e0b" stroke-width="1.8" rx="2" />
        <rect x="230" y="122" width="55" height="14" fill="#1e1b4b" stroke="#f59e0b" rx="2" />
        <text x="257" y="132" fill="#fde68a" font-size="6.5" font-weight="bold" text-anchor="middle">OWNER VILLA</text>
        <!-- Owner Cantilever Deck -->
        <rect x="200" y="55" width="130" height="45" fill="rgba(56,189,248,0.25)" stroke="#10b981" stroke-width="1.5" />
        ${elevationFooter('MULTI-FAMILY DUAL-ENTRY INCOME FACADE')}
      `;

    // -------------------------------------------------------------
    // PLAN 8: Eco-Green Solar Passive House (Angled Solar Roof)
    // -------------------------------------------------------------
    case 'plan-8':
      return `
        ${elevationHeader()}
        <!-- Slanted Solar Photovoltaic Roof (Angled at 22°) -->
        <polygon points="50,60 350,25 350,70 50,105" fill="#082f49" stroke="#38bdf8" stroke-width="2" />
        <!-- Photovoltaic Solar Cells Grid -->
        ${[90, 130, 170, 210, 250, 290].map(x => `
          <line x1="${x}" y1="${55 - (x-50)*0.11}" x2="${x}" y2="${100 - (x-50)*0.11}" stroke="#38bdf8" stroke-width="1" />
        `).join('')}
        <text x="200" y="65" fill="#7dd3fc" font-size="7.5" font-weight="bold" text-anchor="middle">5KW MONOCRYSTALLINE ROOF ARRAY</text>

        <!-- Vertical Living Green Wall (Climbing Creepers) -->
        <rect x="55" y="105" width="65" height="120" fill="#14532d" stroke="#84cc16" stroke-width="1.8" rx="2" />
        ${[120, 140, 160, 180, 200].map(y => `
          <path d="M 65 ${y} Q 85 ${y-10} 105 ${y} Q 95 ${y+10} 65 ${y}" fill="#65a30d" opacity="0.8" />
        `).join('')}
        <text x="87" y="215" fill="#d9f99d" font-size="6.5" font-weight="bold" text-anchor="middle">VERTICAL JARDIN</text>

        <!-- Natural Stone Residence -->
        <rect x="135" y="105" width="215" height="120" fill="#1a2e05" stroke="#84cc16" stroke-width="2" rx="3" />
        <rect x="155" y="125" width="80" height="50" fill="rgba(132,204,22,0.2)" stroke="#fff" stroke-width="1.2" />
        <rect x="265" y="145" width="50" height="80" fill="#713f12" stroke="#facc15" stroke-width="1.5" />
        ${elevationFooter('SUSTAINABLE SOLAR PASSIVE GREEN ELEVATION')}
      `;

    // -------------------------------------------------------------
    // PLAN 9: Cost-Optimized Modular Box Architecture
    // -------------------------------------------------------------
    case 'plan-9':
      return `
        ${elevationHeader()}
        <!-- Bauhaus Minimalist Box Volume -->
        <rect x="60" y="45" width="280" height="180" fill="#1c070f" stroke="#f43f5e" stroke-width="2.5" rx="2" />
        <rect x="50" y="40" width="300" height="10" fill="#881337" stroke="#fb7185" stroke-width="1" />
        
        <!-- Symmetrical Window Hoods in Bold Pop Accent Color -->
        <rect x="85" y="65" width="90" height="55" fill="rgba(244,63,94,0.15)" stroke="#fb7185" stroke-width="2" rx="2" />
        <rect x="75" y="58" width="110" height="8" fill="#f43f5e" />

        <rect x="225" y="65" width="90" height="55" fill="rgba(244,63,94,0.15)" stroke="#fb7185" stroke-width="2" rx="2" />
        <rect x="215" y="58" width="110" height="8" fill="#f43f5e" />

        <!-- Crisp Clean Ground Floor Entry Door -->
        <rect x="175" y="145" width="50" height="80" fill="#0f172a" stroke="#fb7185" stroke-width="2" rx="2" />
        <line x1="210" y1="170" x2="210" y2="200" stroke="#fda4af" stroke-width="2.5" />
        ${elevationFooter('COST-OPTIMIZED MODULAR CUBIC ARCHITECTURE')}
      `;

    // -------------------------------------------------------------
    // PLAN 10: Luxury Resort Pool Villa Facade
    // -------------------------------------------------------------
    case 'plan-10':
      return `
        ${elevationHeader()}
        <!-- Sparkling Foreground Swimming Pool with Glass Edge -->
        <rect x="30" y="185" width="340" height="40" fill="rgba(6,182,212,0.4)" stroke="#38bdf8" stroke-width="1.8" rx="4" />
        <line x1="30" y1="195" x2="370" y2="195" stroke="rgba(255,255,255,0.6)" stroke-width="1" stroke-dasharray="12,6" />
        <text x="200" y="210" fill="#e0f2fe" font-size="8.5" font-weight="bold" text-anchor="middle">INFINITY POOL FORECOURT REFLECTION</text>

        <!-- Stepping Stone Walkway Across Pool -->
        <rect x="185" y="180" width="30" height="10" fill="#cbd5e1" stroke="#475569" stroke-width="1" rx="2" />

        <!-- Two Tropical Palm Trees Flanking Villa -->
        <line x1="45" y1="185" x2="40" y2="85" stroke="#78350f" stroke-width="4" />
        <circle cx="40" cy="80" r="18" fill="#047857" opacity="0.9" />
        <line x1="355" y1="185" x2="360" y2="85" stroke="#78350f" stroke-width="4" />
        <circle cx="360" cy="80" r="18" fill="#047857" opacity="0.9" />

        <!-- Ultra Luxury Resort Villa Massing with Full Height Sliding Glass -->
        <rect x="65" y="35" width="270" height="150" fill="#0c0926" stroke="#6366f1" stroke-width="2.5" rx="4" />
        <rect x="75" y="45" width="250" height="90" fill="rgba(99,102,241,0.2)" stroke="#ffffff" stroke-width="1.5" />
        <line x1="160" y1="45" x2="160" y2="135" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" />
        <line x1="240" y1="45" x2="240" y2="135" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" />
        <text x="200" y="95" fill="#ffffff" font-size="11" font-weight="800" text-anchor="middle">PANORAMIC SLIDING GLASS REVEAL</text>
        ${elevationFooter('ULTRA-LUXURY RESORT POOL VILLA FACADE')}
      `;

    default:
      return `${elevationHeader()}${elevationFooter(template.style.toUpperCase())}`;
  }
}

// ==================== Structural Engineering Grid SVG Dispatcher ====================
export function renderFloorPlanStructural(template, width, depth) {
  const color = template.colorScheme || '#38bdf8';

  const structHeader = () => `
    <svg viewBox="0 0 400 280" width="100%" height="230" class="blueprint-svg" style="background:#050914;border-radius:10px;border:1px solid rgba(255,255,255,0.15);box-shadow:inset 0 2px 14px rgba(0,0,0,0.6)">
  `;

  const structFooter = (notes) => `
      <rect x="30" y="248" width="340" height="24" fill="rgba(15,23,42,0.9)" stroke="rgba(255,255,255,0.15)" rx="4" />
      <text x="200" y="263" fill="#38bdf8" font-size="8" font-weight="700" letter-spacing="0.4" text-anchor="middle">${notes}</text>
    </svg>
  `;

  switch(template.id) {
    // Courtyard plan: C1-C12 framing courtyard
    case 'plan-3':
      return `
        ${structHeader()}
        <g stroke="rgba(255,255,255,0.22)" stroke-width="1" stroke-dasharray="4,4">
          <line x1="60" y1="35" x2="60" y2="240" />
          <line x1="150" y1="35" x2="150" y2="240" />
          <line x1="250" y1="35" x2="250" y2="240" />
          <line x1="340" y1="35" x2="340" y2="240" />
          <line x1="35" y1="65" x2="365" y2="65" />
          <line x1="35" y1="140" x2="365" y2="140" />
          <line x1="35" y1="215" x2="365" y2="215" />
        </g>
        <!-- Courtyard Void in Center -->
        <rect x="150" y="100" width="100" height="80" fill="none" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="4,3" />
        <text x="200" y="145" fill="#4ade80" font-size="8" font-weight="bold" text-anchor="middle">COURTYARD VOID</text>
        ${[
          {x:60,y:65,id:'C1'},{x:150,y:65,id:'C2'},{x:250,y:65,id:'C3'},{x:340,y:65,id:'C4'},
          {x:60,y:140,id:'C5'},{x:150,y:100,id:'C6'},{x:250,y:100,id:'C7'},{x:340,y:140,id:'C8'},
          {x:60,y:215,id:'C9'},{x:150,y:180,id:'C10'},{x:250,y:180,id:'C11'},{x:340,y:215,id:'C12'}
        ].map(c => `
          <rect x="${c.x-6}" y="${c.y-6}" width="12" height="12" fill="#ef4444" stroke="#fff" stroke-width="1.5" rx="1"/>
          <text x="${c.x+8}" y="${c.y-4}" fill="#fca5a5" font-size="7" font-weight="bold">${c.id}</text>
        `).join('')}
        ${structFooter(`${template.colsCount} COLUMNS · BRAHMASTHAN COURTYARD BEAM TIES · M25`)}
      `;

    // Stilt Parking plan: Heavy Duty 450x450 Columns
    case 'plan-6':
      return `
        ${structHeader()}
        <g stroke="rgba(255,255,255,0.22)" stroke-width="1" stroke-dasharray="4,4">
          <line x1="70" y1="35" x2="70" y2="240" />
          <line x1="160" y1="35" x2="160" y2="240" />
          <line x1="250" y1="35" x2="250" y2="240" />
          <line x1="330" y1="35" x2="330" y2="240" />
          <line x1="35" y1="65" x2="365" y2="65" />
          <line x1="35" y1="140" x2="365" y2="140" />
          <line x1="35" y1="215" x2="365" y2="215" />
        </g>
        <!-- Heavy Duty Square Columns for Ground Parking Clearance -->
        ${[
          {x:70,y:65,id:'SC1'},{x:160,y:65,id:'SC2'},{x:250,y:65,id:'SC3'},{x:330,y:65,id:'SC4'},
          {x:70,y:140,id:'SC5'},{x:160,y:140,id:'SC6'},{x:250,y:140,id:'SC7'},{x:330,y:140,id:'SC8'},
          {x:70,y:215,id:'SC9'},{x:205,y:215,id:'SC10'},{x:330,y:215,id:'SC11'}
        ].map(c => `
          <rect x="${c.x-8}" y="${c.y-8}" width="16" height="16" fill="#06b6d4" stroke="#ffffff" stroke-width="2" rx="2"/>
          <line x1="${c.x-5}" y1="${c.y-5}" x2="${c.x+5}" y2="${c.y+5}" stroke="#fff" stroke-width="1" />
          <text x="${c.x+10}" y="${c.y-6}" fill="#67e8f9" font-size="7" font-weight="bold">${c.id}</text>
        `).join('')}
        ${structFooter('11 HEAVY-DUTY STILT COLUMNS (450x450mm) · SOFT-STOREY EARTHQUAKE DESIGN')}
      `;

    // Modular 3x3 Grid
    case 'plan-9':
      return `
        ${structHeader()}
        <g stroke="rgba(255,255,255,0.22)" stroke-width="1" stroke-dasharray="4,4">
          <line x1="80" y1="35" x2="80" y2="240" />
          <line x1="200" y1="35" x2="200" y2="240" />
          <line x1="320" y1="35" x2="320" y2="240" />
          <line x1="45" y1="65" x2="355" y2="65" />
          <line x1="45" y1="140" x2="355" y2="140" />
          <line x1="45" y1="215" x2="355" y2="215" />
        </g>
        ${[
          {x:80,y:65,id:'M1'},{x:200,y:65,id:'M2'},{x:320,y:65,id:'M3'},
          {x:80,y:140,id:'M4'},{x:200,y:140,id:'M5'},{x:320,y:140,id:'M6'},
          {x:80,y:215,id:'M7'},{x:200,y:215,id:'M8'},{x:320,y:215,id:'M9'}
        ].map(c => `
          <rect x="${c.x-7}" y="${c.y-7}" width="14" height="14" fill="#f43f5e" stroke="#fff" stroke-width="1.8" rx="1.5"/>
          <text x="${c.x+9}" y="${c.y-5}" fill="#fda4af" font-size="7.5" font-weight="bold">${c.id}</text>
        `).join('')}
        ${structFooter('UNIFORM 3x3 MODULAR GRID (9 COLUMNS) · 100% STANDARDIZED SHUTTERING')}
      `;

    // Standard Grid for others
    default:
      return `
        ${structHeader()}
        <g stroke="rgba(255,255,255,0.22)" stroke-width="1" stroke-dasharray="4,4">
          <line x1="60" y1="35" x2="60" y2="245" />
          <line x1="160" y1="35" x2="160" y2="245" />
          <line x1="260" y1="35" x2="260" y2="245" />
          <line x1="340" y1="35" x2="340" y2="245" />
          <line x1="35" y1="65" x2="365" y2="65" />
          <line x1="35" y1="140" x2="365" y2="140" />
          <line x1="35" y1="215" x2="365" y2="215" />
        </g>
        ${['A','B','C','D'].map((lbl, i) => {
          const x = [60, 160, 260, 340][i];
          return `
            <circle cx="${x}" cy="24" r="9" fill="#0b1424" stroke="${color}" stroke-width="1.2" />
            <text x="${x}" y="27" fill="${color}" font-size="8.5" font-weight="bold" text-anchor="middle">${lbl}</text>
          `;
        }).join('')}
        ${[
          {x:60,y:65,id:'C1'},{x:160,y:65,id:'C2'},{x:260,y:65,id:'C3'},{x:340,y:65,id:'C4'},
          {x:60,y:140,id:'C5'},{x:160,y:140,id:'C6'},{x:260,y:140,id:'C7'},{x:340,y:140,id:'C8'},
          {x:60,y:215,id:'C9'},{x:160,y:215,id:'C10'},{x:260,y:215,id:'C11'},{x:340,y:215,id:'C12'}
        ].map(c => `
          <rect x="${c.x-7}" y="${c.y-7}" width="14" height="14" fill="#ef4444" stroke="#ffffff" stroke-width="1.8" rx="1.5"/>
          <text x="${c.x+10}" y="${c.y-6}" fill="#fca5a5" font-size="7" font-weight="bold">${c.id}</text>
        `).join('')}
        ${structFooter(`${template.colsCount} RCC COLUMNS (9" x 12") · Fe-550 TMT STEEL · M25`)}
      `;
  }
}
