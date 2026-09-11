// ==================== Indian Floor Plans & MakeMyHouse Architectural Engine ====================
// Inspired by IndianFloorPlans.com & MakeMyHouse.com search dimensions, 3D elevations & Vastu principles
import {
  renderFloorPlanBlueprint,
  renderFloorPlanElevation,
  renderFloorPlanStructural
} from './floorPlanGraphics.js';
import { getFloorPlan3DWalkthrough } from '../components/floorPlanWalkthrough/FloorPlan3DWalkthroughModal.js';

export function generate10IndianFloorPlans(sqft = 1200, facing = 'East', bhkPref = 'Auto', width = 30, depth = 40) {
  const sqftNum = parseInt(sqft) || (parseInt(width) * parseInt(depth)) || 1200;
  const widthNum = parseInt(width) || 30;
  const depthNum = parseInt(depth) || 40;
  
  // Base cost estimate factor: ₹1,650 to ₹2,150 per sq ft for construction
  const baseCostMin = Math.round(sqftNum * 1650);
  const baseCostMax = Math.round(sqftNum * 2150);

  // Helper currency formatter
  const formatINR = (val) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} Lakhs`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  // Determine BHK based on sqft if auto
  const getBhk = (index) => {
    if (bhkPref !== 'Auto') return bhkPref;
    if (sqftNum < 700) return index % 2 === 0 ? '1 BHK' : '2 BHK Compact';
    if (sqftNum < 1300) return index % 3 === 0 ? '2 BHK' : (index % 3 === 1 ? '3 BHK Compact' : '2 BHK + Study');
    if (sqftNum < 2200) return index % 2 === 0 ? '3 BHK Luxury' : '4 BHK Villa';
    return '4 BHK Duplex';
  };

  // 10 distinct architectural layout & 3D elevation templates (MakeMyHouse style)
  const templates = [
    {
      id: 'plan-1',
      title: 'Option 1: Modern Minimalist Facade with Vastu Alignment',
      style: 'Modern Minimalist Facade',
      plotRatio: `${widthNum}' x ${depthNum}'`,
      vastuScore: 98,
      facing: facing === 'Any' ? 'East' : facing,
      highlight: '3D Glass Balcony Facade + Kitchen SE, Master SW, Main Door NE',
      elevationPreviewBg: 'linear-gradient(135deg, #0f172a, #1e293b)',
      advantages: ['MakeMyHouse Top Rated Layout', 'High daylight & cross wind circulation', 'Dedicated Puja alcove'],
      rooms: [
        { name: 'Living & Dining Hall', size: `${Math.round(widthNum * 0.9)}' x ${Math.round(depthNum * 0.3)}'` },
        { name: 'Master Bedroom Suite', size: `${Math.round(widthNum * 0.85)}' x ${Math.round(depthNum * 0.25)}' (Attached Bath)` },
        { name: 'Bedroom 2 / Guest', size: `${Math.round(widthNum * 0.8)}' x ${Math.round(depthNum * 0.2)}'` },
        { name: 'SE Modular Kitchen', size: `${Math.round(widthNum * 0.8)}' x ${Math.round(depthNum * 0.15)}'` },
        { name: 'Car Parking Garage', size: `${Math.round(widthNum * 0.95)}' x ${Math.round(depthNum * 0.25)}'` }
      ],
      costRange: `${formatINR(baseCostMin)} - ${formatINR(baseCostMax)}`,
      colsCount: Math.max(8, Math.round(sqftNum / 120)),
      colorScheme: '#38bdf8'
    },
    {
      id: 'plan-2',
      title: 'Option 2: Contemporary Glass Elevation Villa Layout',
      style: 'Glass Elevation Contemporary',
      plotRatio: `${widthNum}' x ${depthNum}'`,
      vastuScore: 94,
      facing: 'North',
      highlight: 'Double-height ceiling hall with floor-to-ceiling glass elevation',
      elevationPreviewBg: 'linear-gradient(135deg, #1e1b4b, #312e81)',
      advantages: ['Ultra-modern kerb appeal', 'Spacious open-plan kitchen island', 'Low maintenance materials'],
      rooms: [
        { name: 'Grand Living Room', size: `${Math.round(widthNum * 0.9)}' x ${Math.round(depthNum * 0.3)}'` },
        { name: 'Open Kitchen & Island', size: `${Math.round(widthNum * 0.8)}' x ${Math.round(depthNum * 0.2)}'` },
        { name: 'Master Suite', size: `${Math.round(widthNum * 0.85)}' x ${Math.round(depthNum * 0.25)}' with Closet` },
        { name: 'Bed 2 / Kids Room', size: `${Math.round(widthNum * 0.8)}' x ${Math.round(depthNum * 0.2)}'` },
        { name: 'Front Glass Terrace', size: `${Math.round(widthNum * 0.9)}' x ${Math.round(depthNum * 0.1)}'` }
      ],
      costRange: `${formatINR(Math.round(baseCostMin * 1.06))} - ${formatINR(Math.round(baseCostMax * 1.09))}`,
      colsCount: Math.max(8, Math.round(sqftNum / 115)),
      colorScheme: '#a855f7'
    },
    {
      id: 'plan-3',
      title: 'Option 3: Traditional Heritage Slope Roof Elevation',
      style: 'South Indian Slope Roof',
      plotRatio: `${widthNum}' x ${depthNum}'`,
      vastuScore: 97,
      facing: 'East',
      highlight: 'Terracotta mangalore tile slope roof with courtyard (Brahmasthan)',
      elevationPreviewBg: 'linear-gradient(135deg, #064e3b, #047857)',
      advantages: ['Natural thermal insulation (3°C cooler)', '100% Vastu Brahmasthan clearance', 'Chettinad wooden pillar veranda'],
      rooms: [
        { name: 'Central Courtyard', size: `${Math.round(widthNum * 0.4)}' x ${Math.round(depthNum * 0.15)}' Open Skylight` },
        { name: 'Formal Living Room', size: `${Math.round(widthNum * 0.9)}' x ${Math.round(depthNum * 0.25)}'` },
        { name: 'Master Bedroom', size: `${Math.round(widthNum * 0.85)}' x ${Math.round(depthNum * 0.25)}'` },
        { name: 'Bedroom 2', size: `${Math.round(widthNum * 0.8)}' x ${Math.round(depthNum * 0.2)}'` },
        { name: 'Traditional Kitchen', size: `${Math.round(widthNum * 0.7)}' x ${Math.round(depthNum * 0.15)}'` }
      ],
      costRange: `${formatINR(Math.round(baseCostMin * 1.1))} - ${formatINR(Math.round(baseCostMax * 1.13))}`,
      colsCount: Math.max(10, Math.round(sqftNum / 110)),
      colorScheme: '#4ade80'
    },
    {
      id: 'plan-4',
      title: 'Option 4: Dual-Balcony High Density Urban Plan',
      style: 'Urban High Density',
      plotRatio: `${widthNum}' x ${depthNum}'`,
      vastuScore: 91,
      facing: 'West',
      highlight: 'Zero passage area waste + dual front and rear balconies',
      elevationPreviewBg: 'linear-gradient(135deg, #451a03, #78350f)',
      advantages: ['100% space utilization efficiency', 'Dual wind tunnel ventilation', 'Built-in lofts for storage'],
      rooms: [
        { name: 'Living & Dining Area', size: `${Math.round(widthNum * 0.95)}' x ${Math.round(depthNum * 0.3)}'` },
        { name: 'Master Bedroom', size: `${Math.round(widthNum * 0.9)}' x ${Math.round(depthNum * 0.25)}'` },
        { name: 'Children Bedroom', size: `${Math.round(widthNum * 0.85)}' x ${Math.round(depthNum * 0.2)}'` },
        { name: 'Modular Kitchen', size: `${Math.round(widthNum * 0.8)}' x ${Math.round(depthNum * 0.15)}'` },
        { name: 'Front Balcony', size: `${Math.round(widthNum * 0.95)}' x ${Math.round(depthNum * 0.1)}'` }
      ],
      costRange: `${formatINR(Math.round(baseCostMin * 0.95))} - ${formatINR(Math.round(baseCostMax * 0.98))}`,
      colsCount: Math.max(8, Math.round(sqftNum / 125)),
      colorScheme: '#f59e0b'
    },
    {
      id: 'plan-5',
      title: 'Option 5: G+1 Duplex Villa with Private Sky Deck',
      style: 'Luxury G+1 Duplex',
      plotRatio: `${widthNum}' x ${depthNum}'`,
      vastuScore: 95,
      facing: 'North-East',
      highlight: 'Internal teakwood spiral staircase & Master bedroom balcony',
      elevationPreviewBg: 'linear-gradient(135deg, #831843, #be185d)',
      advantages: ['Upper floor privacy for bedrooms', 'Terrace gazebo & green lawn space', 'Dedicated home theater room'],
      rooms: [
        { name: 'Ground Floor Living', size: `${Math.round(widthNum * 0.9)}' x ${Math.round(depthNum * 0.35)}'` },
        { name: 'First Floor Family Lounge', size: `${Math.round(widthNum * 0.9)}' x ${Math.round(depthNum * 0.25)}'` },
        { name: 'Master Bedroom Suite', size: `${Math.round(widthNum * 0.85)}' x ${Math.round(depthNum * 0.25)}'` },
        { name: 'Bedroom 2 & 3', size: `${Math.round(widthNum * 0.8)}' x ${Math.round(depthNum * 0.2)}' Each` },
        { name: 'Roof Terrace Garden', size: `Full Roof Coverage` }
      ],
      costRange: `${formatINR(Math.round(baseCostMin * 1.18))} - ${formatINR(Math.round(baseCostMax * 1.25))}`,
      colsCount: Math.max(12, Math.round(sqftNum / 100)),
      colorScheme: '#ec4899'
    },
    {
      id: 'plan-6',
      title: 'Option 6: Stilt Parking + Independent Residence Plan',
      style: 'Stilt+1 Metropolitan',
      plotRatio: `${widthNum}' x ${depthNum}'`,
      vastuScore: 92,
      facing: 'South',
      highlight: 'Ground stilt parking for 2 cars & 4 two-wheelers + upper residence',
      elevationPreviewBg: 'linear-gradient(135deg, #164e63, #0891b2)',
      advantages: ['Solves narrow plot parking constraints', 'High safety & security raised floor', 'Future floor expansion ready'],
      rooms: [
        { name: 'Ground Stilt Parking', size: `${Math.round(widthNum * 1.0)}' x ${Math.round(depthNum * 0.8)}'` },
        { name: 'First Floor Hall', size: `${Math.round(widthNum * 0.9)}' x ${Math.round(depthNum * 0.3)}'` },
        { name: 'Master Bedroom', size: `${Math.round(widthNum * 0.85)}' x ${Math.round(depthNum * 0.25)}'` },
        { name: 'Guest Room', size: `${Math.round(widthNum * 0.8)}' x ${Math.round(depthNum * 0.2)}'` },
        { name: 'Semi-Open Utility Terrace', size: `${Math.round(widthNum * 0.9)}' x ${Math.round(depthNum * 0.15)}'` }
      ],
      costRange: `${formatINR(Math.round(baseCostMin * 1.12))} - ${formatINR(Math.round(baseCostMax * 1.15))}`,
      colsCount: Math.max(10, Math.round(sqftNum / 105)),
      colorScheme: '#06b6d4'
    },
    {
      id: 'plan-7',
      title: 'Option 7: Rental Portion Ground + Owner Residence Plan',
      style: 'Multi-family Income Generator',
      plotRatio: `${widthNum}' x ${depthNum}'`,
      vastuScore: 93,
      facing: 'East',
      highlight: 'Independent 1BHK unit on Ground floor for passive rental income',
      elevationPreviewBg: 'linear-gradient(135deg, #064e3b, #059669)',
      advantages: ['Generates monthly rental income', 'Separate electricity & water meters', 'Private owner entrance from side staircase'],
      rooms: [
        { name: 'Ground Rental 1BHK Unit', size: `${Math.round(sqftNum * 0.4)} sq ft Complete Unit` },
        { name: 'Upper Owner 2BHK Residence', size: `${Math.round(sqftNum * 0.6)} sq ft Complete Unit` },
        { name: 'Dual Parking Bays', size: `${Math.round(widthNum * 0.9)}' x ${Math.round(depthNum * 0.2)}'` },
        { name: 'Common Stairwell', size: `${Math.round(widthNum * 0.4)}' x ${Math.round(depthNum * 0.15)}'` }
      ],
      costRange: `${formatINR(Math.round(baseCostMin * 1.08))} - ${formatINR(Math.round(baseCostMax * 1.12))}`,
      colsCount: Math.max(12, Math.round(sqftNum / 100)),
      colorScheme: '#10b981'
    },
    {
      id: 'plan-8',
      title: 'Option 8: Eco-Green Solar Passive House Plan',
      style: 'Sustainable Solar Passive',
      plotRatio: `${widthNum}' x ${depthNum}'`,
      vastuScore: 96,
      facing: 'South-East',
      highlight: 'Solar panel roof orientation + fly-ash brick thermal insulation',
      elevationPreviewBg: 'linear-gradient(135deg, #365314, #65a30d)',
      advantages: ['Cuts electricity bills by 60%', 'Rainwater harvesting tank built-in', 'Thermal comfort all seasons'],
      rooms: [
        { name: 'Naturally Lit Living Room', size: `${Math.round(widthNum * 0.9)}' x ${Math.round(depthNum * 0.3)}'` },
        { name: 'Solar Kitchen & Dining', size: `${Math.round(widthNum * 0.8)}' x ${Math.round(depthNum * 0.2)}'` },
        { name: 'Eco Master Bedroom', size: `${Math.round(widthNum * 0.85)}' x ${Math.round(depthNum * 0.25)}'` },
        { name: 'Rooftop Solar Deck', size: `Full Roof Coverage` }
      ],
      costRange: `${formatINR(Math.round(baseCostMin * 1.04))} - ${formatINR(Math.round(baseCostMax * 1.06))}`,
      colsCount: Math.max(8, Math.round(sqftNum / 120)),
      colorScheme: '#84cc16'
    },
    {
      id: 'plan-9',
      title: 'Option 9: Low-Budget Smart Steel-Concrete Modular Plan',
      style: 'Cost-Optimized Budget Smart',
      plotRatio: `${widthNum}' x ${depthNum}'`,
      vastuScore: 89,
      facing: 'North-West',
      highlight: 'Standardized column grid reducing construction cost by 15%',
      elevationPreviewBg: 'linear-gradient(135deg, #881337, #e11d48)',
      advantages: ['Fastest completion time (under 4 months)', 'Minimal material wastage', 'Strong structural RCC frame'],
      rooms: [
        { name: 'Compact Living Room', size: `${Math.round(widthNum * 0.9)}' x ${Math.round(depthNum * 0.3)}'` },
        { name: 'Smart Dining & Kitchenette', size: `${Math.round(widthNum * 0.8)}' x ${Math.round(depthNum * 0.2)}'` },
        { name: 'Master Bedroom', size: `${Math.round(widthNum * 0.85)}' x ${Math.round(depthNum * 0.25)}'` },
        { name: 'Bedroom 2', size: `${Math.round(widthNum * 0.8)}' x ${Math.round(depthNum * 0.2)}'` }
      ],
      costRange: `${formatINR(Math.round(baseCostMin * 0.88))} - ${formatINR(Math.round(baseCostMax * 0.92))}`,
      colsCount: Math.max(8, Math.round(sqftNum / 130)),
      colorScheme: '#f43f5e'
    },
    {
      id: 'plan-10',
      title: 'Option 10: Luxury Villa with Swimming Pool & Wooden Deck',
      style: 'High-End Luxury Resort Villa',
      plotRatio: `${widthNum}' x ${depthNum}'`,
      vastuScore: 97,
      facing: 'East',
      highlight: 'Private lap pool, wooden deck lounge, and glass elevation facade',
      elevationPreviewBg: 'linear-gradient(135deg, #311b92, #512da8)',
      advantages: ['Resort style living experience', 'Spacious master suite with bath tub', 'Smart home automation ready'],
      rooms: [
        { name: 'Double Height Living Room', size: `${Math.round(widthNum * 0.95)}' x ${Math.round(depthNum * 0.35)}'` },
        { name: 'Private Lap Pool & Deck', size: `${Math.round(widthNum * 0.8)}' x ${Math.round(depthNum * 0.2)}'` },
        { name: 'Master Presidential Suite', size: `${Math.round(widthNum * 0.9)}' x ${Math.round(depthNum * 0.25)}'` },
        { name: 'Guest Villa Rooms', size: `${Math.round(widthNum * 0.8)}' x ${Math.round(depthNum * 0.2)}' Each` },
        { name: 'Modular German Kitchen', size: `${Math.round(widthNum * 0.8)}' x ${Math.round(depthNum * 0.2)}'` }
      ],
      costRange: `${formatINR(Math.round(baseCostMin * 1.35))} - ${formatINR(Math.round(baseCostMax * 1.48))}`,
      colsCount: Math.max(14, Math.round(sqftNum / 90)),
      colorScheme: '#6366f1'
    }
  ];

  return templates.map((t, idx) => ({
    ...t,
    bhk: getBhk(idx),
    totalAreaSqFt: sqftNum,
    plotWidth: widthNum,
    plotDepth: depthNum,
    estimatedDays: Math.round(110 + (sqftNum / 15)),
    svgBlueprint: renderFloorPlanBlueprint(t, sqftNum, widthNum, depthNum),
    svg3dElevation: renderFloorPlanElevation(t, widthNum, depthNum),
    svgStructuralGrid: renderFloorPlanStructural(t, widthNum, depthNum)
  }));
}


// ==================== Floor Plans Page Template ====================
export function floorPlansPage() {
  const initialWidth = 10;
  const initialDepth = 40;
  const initialSqFt = 400;
  const initialPlans = generate10IndianFloorPlans(initialSqFt, 'East', 'Auto', initialWidth, initialDepth);

  return `
    <section class="section">
      <div class="container">
        
        <!-- Header Banner (MakeMyHouse Style) -->
        <div style="text-align:center;max-width:880px;margin:0 auto 36px">
          <h1 style="font-size:2.2rem;margin-bottom:24px;letter-spacing:-0.5px">
            Online House Plans, 3D Elevation & Structural Drawings <br>
            <span style="background:linear-gradient(135deg,var(--primary),var(--gold));-webkit-background-clip:text;-webkit-text-fill-color:transparent">Search By Plot Dimensions & Vastu Direction</span>
          </h1>
        </div>

        <!-- MakeMyHouse Dimension & Direction Control Panel -->
        <div class="card" style="background:rgba(15,23,42,0.92);border:1px solid var(--border-glow);padding:28px;margin-bottom:36px;box-shadow:0 12px 36px rgba(0,0,0,0.5)">
          <form id="floorPlanFilterForm">
            
            <!-- Quick Preset Dimensions Buttons (MakeMyHouse Popular Sizes) -->
            <div style="margin-bottom:20px">
              <label class="form-label" style="display:flex;justify-content:space-between;align-items:center">
                <span><i class="fas fa-ruler-combined" style="color:var(--primary);margin-right:6px"></i> Search by Popular Plot Dimensions (Ft):</span>
                <strong style="color:var(--gold);font-size:1.05rem" id="sqftDisplayValue">10 ft x 40 ft (400 Sq Ft)</strong>
              </label>
              <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px">
                <button type="button" class="btn btn-primary btn-sm dim-preset-btn active" data-width="10" data-depth="40">10 x 40 (400 SqFt)</button>
                <button type="button" class="btn btn-ghost btn-sm dim-preset-btn" data-width="15" data-depth="40">15 x 40 (600 SqFt)</button>
                <button type="button" class="btn btn-ghost btn-sm dim-preset-btn" data-width="20" data-depth="40">20 x 40 (800 SqFt)</button>
                <button type="button" class="btn btn-ghost btn-sm dim-preset-btn" data-width="20" data-depth="50">20 x 50 (1000 SqFt)</button>
                <button type="button" class="btn btn-ghost btn-sm dim-preset-btn" data-width="25" data-depth="50">25 x 50 (1250 SqFt)</button>
                <button type="button" class="btn btn-ghost btn-sm dim-preset-btn" data-width="30" data-depth="40">30 x 40 (1200 SqFt)</button>
                <button type="button" class="btn btn-ghost btn-sm dim-preset-btn" data-width="30" data-depth="50">30 x 50 (1500 SqFt)</button>
                <button type="button" class="btn btn-ghost btn-sm dim-preset-btn" data-width="35" data-depth="60">35 x 60 (2100 SqFt)</button>
                <button type="button" class="btn btn-ghost btn-sm dim-preset-btn" data-width="40" data-depth="60">40 x 60 (2400 SqFt)</button>
                <button type="button" class="btn btn-ghost btn-sm dim-preset-btn" data-width="50" data-depth="60">50 x 60 (3000 SqFt)</button>
                <button type="button" class="btn btn-ghost btn-sm dim-preset-btn" data-width="50" data-depth="80">50 x 80 (4000 SqFt)</button>
              </div>
            </div>

            <!-- Custom Dimension Inputs Grid -->
            <div class="grid grid-5" style="gap:14px;align-items:end">
              
              <div class="form-group" style="margin:0">
                <label class="form-label">Frontage Width (Ft)</label>
                <input type="number" id="inputPlotWidth" class="form-input" value="10" min="10" max="200" placeholder="e.g. 10">
              </div>

              <div class="form-group" style="margin:0">
                <label class="form-label">Plot Depth (Ft)</label>
                <input type="number" id="inputPlotDepth" class="form-input" value="40" min="10" max="300" placeholder="e.g. 40">
              </div>

              <div class="form-group" style="margin:0">
                <label class="form-label"><i class="fas fa-compass" style="color:var(--gold);margin-right:6px"></i> 8 Vastu Directions</label>
                <select id="inputFacing" class="form-select">
                  <option value="East">East (Kitchen SE / Entry NE)</option>
                  <option value="North">North (Kubera Money Corner)</option>
                  <option value="South">South (High Privacy Villa)</option>
                  <option value="West">West (Sunset Terrace View)</option>
                  <option value="North-East">North-East (Eeshanya Pure Vastu)</option>
                  <option value="South-East">South-East (Agneya Fire Zone)</option>
                  <option value="North-West">North-West (Vayavya Guest)</option>
                  <option value="South-West">South-West (Nairutya Master)</option>
                  <option value="Any">Any Facing Direction</option>
                </select>
              </div>

              <div class="form-group" style="margin:0">
                <label class="form-label"><i class="fas fa-bed" style="color:var(--accent);margin-right:6px"></i> Bedrooms (BHK)</label>
                <select id="inputBhk" class="form-select">
                  <option value="Auto">Auto Match</option>
                  <option value="1 BHK">1 BHK</option>
                  <option value="2 BHK">2 BHK</option>
                  <option value="3 BHK">3 BHK</option>
                  <option value="4 BHK">4 BHK Villa</option>
                </select>
              </div>

              <div>
                <button type="submit" class="btn btn-primary btn-block pulse-btn" style="padding:13px;font-size:0.92rem">
                  <i class="fas fa-search"></i> Search 10 Plans
                </button>
              </div>

            </div>

          </form>
        </div>

        <!-- MakeMyHouse Architectural Drawings Switcher & Results Header -->
        <div class="flex-between" style="margin-bottom:24px;flex-wrap:wrap;gap:14px">
          <div>
            <h3 style="margin:0;display:flex;align-items:center;gap:8px">
              <i class="fas fa-building" style="color:var(--primary)"></i> 
              <span id="resultsHeaderTitle">10 Executable House Plans for 10 ft x 40 ft (400 Sq Ft) · East Facing</span>
            </h3>
            <p class="text-muted" style="font-size:0.85rem;margin-top:2px">
              Includes 2D Floor Plan Blueprint, 3D Elevation Render, and Structural Engineering Grid for every option.
            </p>
          </div>

          <!-- Drawing View Mode Switcher Buttons -->
          <div style="display:flex;gap:6px;background:rgba(15,23,42,0.8);padding:4px;border-radius:var(--radius-md);border:1px solid var(--border);flex-wrap:wrap">
            <button class="btn btn-primary btn-sm view-mode-btn active" data-view-mode="2d">
              <i class="fas fa-layer-group"></i> 2D Blueprint
            </button>
            <button class="btn btn-ghost btn-sm view-mode-btn" data-view-mode="3d">
              <i class="fas fa-cube"></i> 3D Elevation
            </button>
            <button class="btn btn-ghost btn-sm view-mode-btn" data-view-mode="structural">
              <i class="fas fa-table-cells"></i> Structural Grid
            </button>
            <button class="btn btn-ghost btn-sm view-mode-btn" data-view-mode="walkthrough" style="border:1px solid rgba(56,189,248,0.35);color:var(--primary)">
              <i class="fas fa-vr-cardboard"></i> 3D Walkthrough
            </button>
          </div>
        </div>

        <!-- 10 Plans Grid Container -->
        <div class="grid grid-2" id="floorPlansGridContainer" style="gap:24px;margin-bottom:40px">
          ${renderPlansListHtml(initialPlans, '2d')}
        </div>

      </div>
    </section>
  `;
}

// Render the 10 Floor Plan Cards HTML with viewMode (2d, 3d, structural, or walkthrough)
export function renderPlansListHtml(plans, currentViewMode = '2d') {
  return plans.map((plan, idx) => {
    let renderGraphic = plan.svgBlueprint;
    let modeTitle = '2D ARCHITECTURAL BLUEPRINT SCHEMATIC';
    if (currentViewMode === '3d') {
      renderGraphic = plan.svg3dElevation;
      modeTitle = '3D FRONT ELEVATION ARCHITECTURAL FACADE';
    } else if (currentViewMode === 'structural') {
      renderGraphic = plan.svgStructuralGrid;
      modeTitle = 'RCC COLUMN & BEAM STRUCTURAL LAYOUT';
    } else if (currentViewMode === 'walkthrough') {
      renderGraphic = plan.svg3dElevation;
      modeTitle = 'INTERACTIVE 3D CAD WALKTHROUGH · CLICK TO ENTER';
    }

    return `
      <div class="floor-plan-card animate-in delay-${(idx % 3) + 1}" id="floor-plan-card-${plan.id}" data-plan-id="${plan.id}">
        
        <!-- 1: Top Badge & Header -->
        <div>
          <div class="flex-between" style="margin-bottom:12px;flex-wrap:wrap;gap:8px">
            <span class="badge badge-primary" style="font-size:0.78rem;font-weight:700">Option ${idx + 1} of 10</span>
            <div style="display:flex;gap:6px">
              <span class="badge badge-gold" style="font-size:0.75rem;box-shadow:0 0 10px rgba(245,158,11,0.25)"><i class="fas fa-star" style="color:var(--gold)"></i> ${plan.vastuScore}% Vastu</span>
              <span class="badge badge-accent" style="font-size:0.75rem">${plan.bhk}</span>
            </div>
          </div>

          <h3 style="margin:0 0 6px;font-size:1.18rem;font-weight:700;color:var(--text-primary);letter-spacing:-0.3px">${plan.title}</h3>
          <p class="text-muted" style="font-size:0.82rem;margin-bottom:8px;line-height:1.4">
            <i class="fas fa-ruler-combined" style="color:var(--primary);margin-right:5px"></i> <strong>Plot Dimensions:</strong> ${plan.plotWidth}' x ${plan.plotDepth}' (${plan.totalAreaSqFt} Sq Ft) · <strong>Facing:</strong> ${plan.facing}
          </p>
        </div>

        <!-- 2: Dynamic Graphic Container (2D Blueprint / 3D Elevation / Structural Grid / 3D Walkthrough Portal) -->
        <div class="blueprint-viewport-box" data-plan-id="${plan.id}" title="Click to launch interactive 3D Walkthrough Model">
          <div class="blueprint-mode-tag">
            <i class="${currentViewMode === 'walkthrough' ? 'fas fa-vr-cardboard' : 'fas fa-drafting-compass'}" style="color:var(--primary)"></i> ${modeTitle}
          </div>
          ${renderGraphic}
          <button type="button" class="viewport-walkthrough-btn launch-3d-walkthrough" data-plan-id="${plan.id}" title="Launch Interactive 3D Walkthrough">
            <i class="fas fa-vr-cardboard"></i> <span>3D Walkthrough</span>
          </button>
        </div>

        <!-- 3: Room Specs & Advantages -->
        <div style="padding:14px;background:rgba(255,255,255,0.02);border-radius:var(--radius-sm);border:1px solid rgba(56,189,248,0.15)">
          <div style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:10px;line-height:1.4">
            <strong style="color:var(--gold)"><i class="fas fa-lightbulb" style="margin-right:5px"></i> Special Feature:</strong> ${plan.highlight}
          </div>
          <div style="font-size:0.78rem;color:var(--text-secondary);display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <div><i class="fas fa-clock" style="color:var(--primary);margin-right:5px"></i> <strong>Est. Days:</strong> ${plan.estimatedDays} days</div>
            <div><i class="fas fa-cubes" style="color:var(--accent);margin-right:5px"></i> <strong>RCC Columns:</strong> ${plan.colsCount} Columns</div>
          </div>
        </div>

        <!-- 4: Price Quote & Action Buttons -->
        <div style="padding-top:14px;border-top:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
          <div>
            <span class="text-muted" style="font-size:0.75rem;display:block;margin-bottom:2px">Est. Construction Cost</span>
            <strong style="color:var(--success);font-size:1.12rem;font-family:var(--font-mono)">${plan.costRange}</strong>
          </div>

          <div style="display:flex;gap:8px">
            <button type="button" class="btn btn-secondary btn-sm launch-3d-walkthrough" data-plan-id="${plan.id}" style="font-size:0.82rem;padding:7px 13px;border:1px solid rgba(56,189,248,0.45);background:rgba(15,23,42,0.9);color:var(--primary)">
              <i class="fas fa-cube" style="margin-right:4px"></i> 3D Walkthrough
            </button>
            <a class="btn btn-primary btn-sm select-plan-btn" data-route="/workspace" data-plan-title="${plan.title}" style="font-size:0.82rem;padding:7px 16px;box-shadow:0 4px 14px rgba(56,189,248,0.3)">
              <i class="fas fa-check-circle" style="margin-right:4px"></i> Select Plan
            </a>
          </div>
        </div>

      </div>
    `;
  }).join('');
}

// Setup Interactive Handlers for the Floor Plans Page
export function setupFloorPlanPageHandlers() {
  const form = document.getElementById('floorPlanFilterForm');
  if (!form) return;

  const widthInput = document.getElementById('inputPlotWidth');
  const depthInput = document.getElementById('inputPlotDepth');
  const facingSelect = document.getElementById('inputFacing');
  const bhkSelect = document.getElementById('inputBhk');
  const sqftDisplay = document.getElementById('sqftDisplayValue');
  const gridContainer = document.getElementById('floorPlansGridContainer');
  const resultsHeader = document.getElementById('resultsHeaderTitle');
  const dimPresetBtns = document.querySelectorAll('.dim-preset-btn');
  const viewModeBtns = document.querySelectorAll('.view-mode-btn');

  let activeViewMode = '2d';
  // Keep cache of currently active plans
  let currentPlans = generate10IndianFloorPlans(400, 'East', '1 BHK', 10, 40);

  // Click handler for 3D walkthrough (delegated on gridContainer)
  if (gridContainer) {
    gridContainer.addEventListener('click', (e) => {
      const trigger = e.target.closest('.launch-3d-walkthrough, .blueprint-viewport-box');
      if (trigger) {
        const planId = trigger.getAttribute('data-plan-id') || trigger.closest('.floor-plan-card')?.getAttribute('data-plan-id');
        const plan = currentPlans.find(p => p.id === planId) || currentPlans[0];
        if (plan) {
          getFloorPlan3DWalkthrough().open(plan, currentPlans);
        }
      }
    });
  }

  // Handle dimension preset buttons click
  dimPresetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      dimPresetBtns.forEach(b => b.classList.remove('active', 'btn-primary'));
      dimPresetBtns.forEach(b => b.classList.add('btn-ghost'));
      btn.classList.remove('btn-ghost');
      btn.classList.add('active', 'btn-primary');

      const w = parseInt(btn.getAttribute('data-width')) || 30;
      const d = parseInt(btn.getAttribute('data-depth')) || 40;
      
      widthInput.value = w;
      depthInput.value = d;
      
      updateSqFtDisplay(w, d);
      triggerGeneratePlans();
    });
  });

  // Handle custom width/depth inputs
  const updateDimensionText = () => {
    const w = parseInt(widthInput.value) || 30;
    const d = parseInt(depthInput.value) || 40;
    updateSqFtDisplay(w, d);
  };

  widthInput?.addEventListener('input', updateDimensionText);
  depthInput?.addEventListener('input', updateDimensionText);

  function updateSqFtDisplay(w, d) {
    const totalSqFt = w * d;
    if (sqftDisplay) {
      sqftDisplay.textContent = `${w} ft x ${d} ft (${totalSqFt} Sq Ft)`;
    }
  }

  // Handle view mode switcher (2D, 3D, Structural, Walkthrough)
  viewModeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      viewModeBtns.forEach(b => b.classList.remove('active', 'btn-primary'));
      viewModeBtns.forEach(b => b.classList.add('btn-ghost'));
      btn.classList.remove('btn-ghost');
      btn.classList.add('active', 'btn-primary');

      activeViewMode = btn.getAttribute('data-view-mode') || '2d';
      if (activeViewMode === 'walkthrough') {
        const activePlan = currentPlans[0];
        if (activePlan) {
          getFloorPlan3DWalkthrough().open(activePlan, currentPlans);
        }
      }
      triggerGeneratePlans();
    });
  });

  // Form submit handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    triggerGeneratePlans();
  });

  function triggerGeneratePlans() {
    const w = parseInt(widthInput.value) || 30;
    const d = parseInt(depthInput.value) || 40;
    const totalSqFt = w * d;
    const facing = facingSelect.value;
    const bhk = bhkSelect.value;

    const newPlans = generate10IndianFloorPlans(totalSqFt, facing, bhk, w, d);
    currentPlans = newPlans;

    if (resultsHeader) {
      resultsHeader.textContent = `10 Executable House Plans for ${w} ft x ${d} ft (${totalSqFt} Sq Ft) · ${facing} Facing`;
    }

    if (gridContainer) {
      gridContainer.innerHTML = renderPlansListHtml(newPlans, activeViewMode);
    }
  }
}
