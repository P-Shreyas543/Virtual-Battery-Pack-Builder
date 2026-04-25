// Cell Type Toggle
const cellTypeSelect = document.getElementById('cellType');
const cylInputs = document.getElementById('cylInputs');
const prisInputs = document.getElementById('prisInputs');

// Inputs
const inputs = document.querySelectorAll('input, select');
const targetVoltageIn = document.getElementById('targetVoltage');
const targetCapacityIn = document.getElementById('targetCapacity');
const cellNominalVoltageIn = document.getElementById('cellNominalVoltage');
const cellCapacityIn = document.getElementById('cellCapacity');
const cellMaxVoltageIn = document.getElementById('cellMaxVoltage');
const cellMinVoltageIn = document.getElementById('cellMinVoltage');
const cellMaxCurrentIn = document.getElementById('cellMaxCurrent');
const cellIRIn = document.getElementById('cellIR');
const cellWeightIn = document.getElementById('cellWeight');

// Dimension Inputs
const cylDiaIn = document.getElementById('cylDia');
const cylHeightIn = document.getElementById('cylHeight');
const prisLengthIn = document.getElementById('prisLength');
const prisThicknessIn = document.getElementById('prisThickness');
const prisHeightIn = document.getElementById('prisHeight');

// Outputs
const archOutput = document.getElementById('archOutput');
const seriesOutput = document.getElementById('seriesOutput');
const parallelOutput = document.getElementById('parallelOutput');
const ovpOutput = document.getElementById('ovpOutput');
const uvpOutput = document.getElementById('uvpOutput');
const ocpOutput = document.getElementById('ocpOutput');
const kwhOutput = document.getElementById('kwhOutput');
const irOutput = document.getElementById('irOutput');
const weightOutput = document.getElementById('weightOutput');
const powerOutput = document.getElementById('powerOutput');
const footprintOutput = document.getElementById('footprintOutput');

const batteryVisualizer = document.getElementById('batteryVisualizer');
const vizWarning = document.getElementById('vizWarning');

// Handle Form Factor Toggle
cellTypeSelect.addEventListener('change', (e) => {
    if (e.target.value === 'cylindrical') {
        cylInputs.style.display = 'grid';
        prisInputs.style.display = 'none';
        // Auto-fill common cylindrical presets
        cellCapacityIn.value = 2.5;
        cellNominalVoltageIn.value = 3.6;
        cellWeightIn.value = 45;
    } else {
        cylInputs.style.display = 'none';
        prisInputs.style.display = 'grid';
        // Auto-fill common prismatic presets (e.g., 100Ah LiFePO4)
        cellCapacityIn.value = 100;
        cellNominalVoltageIn.value = 3.2;
        cellMinVoltageIn.value = 2.5;
        cellMaxVoltageIn.value = 3.65;
        cellMaxCurrentIn.value = 100;
        cellWeightIn.value = 2000;
    }
    calculatePack();
});

// Main calculation function
function calculatePack() {
    const targetV = parseFloat(targetVoltageIn.value) || 0;
    const targetC = parseFloat(targetCapacityIn.value) || 0;
    const cellNomV = parseFloat(cellNominalVoltageIn.value) || 0;
    const cellCap = parseFloat(cellCapacityIn.value) || 0;
    const cellMaxV = parseFloat(cellMaxVoltageIn.value) || 0;
    const cellMinV = parseFloat(cellMinVoltageIn.value) || 0;
    const cellMaxI = parseFloat(cellMaxCurrentIn.value) || 0;
    const cellIR = parseFloat(cellIRIn.value) || 0;
    const cellWeight = parseFloat(cellWeightIn.value) || 0;
    const cellType = cellTypeSelect.value;

    if (cellNomV <= 0 || cellCap <= 0) return;

    // Series and Parallel Calc
    const series = Math.ceil(targetV / cellNomV);
    const parallel = Math.ceil(targetC / cellCap);

    // Extended Specs
    const actualV = series * cellNomV;
    const actualC = parallel * cellCap;
    const totalKwh = (actualV * actualC) / 1000;
    const packIR = (cellIR * series) / parallel;
    const totalWeightKg = (series * parallel * cellWeight) / 1000;
    const ocp = parallel * cellMaxI;
    const maxPowerW = actualV * ocp;
    const ovp = series * cellMaxV;
    const uvp = series * cellMinV;

    // Dimensions handling for 3D Visualizer and Footprint
    let cellBaseW, cellBaseH, cellDepth, cellGap;

    if (cellType === 'cylindrical') {
        const dia = parseFloat(cylDiaIn.value) || 18;
        cellBaseW = dia;
        cellBaseH = dia;
        cellDepth = parseFloat(cylHeightIn.value) || 65;
        cellGap = 2; // mm gap
    } else {
        cellBaseW = parseFloat(prisLengthIn.value) || 130;
        cellBaseH = parseFloat(prisThicknessIn.value) || 36;
        cellDepth = parseFloat(prisHeightIn.value) || 200;
        cellGap = 1; // tight fit
    }

    const packPhysicalWidth = (parallel * cellBaseW) + ((parallel - 1) * cellGap);
    const packPhysicalLength = (series * cellBaseH) + ((series - 1) * cellGap);

    // Update UI
    seriesOutput.textContent = series;
    parallelOutput.textContent = parallel;
    archOutput.textContent = `${series}S${parallel}P`;
    kwhOutput.textContent = totalKwh.toFixed(2);
    irOutput.textContent = packIR.toFixed(1);
    weightOutput.textContent = totalWeightKg.toFixed(2);
    powerOutput.textContent = Math.round(maxPowerW).toLocaleString();
    footprintOutput.textContent = `${packPhysicalWidth.toFixed(0)} x ${packPhysicalLength.toFixed(0)}`;
    ovpOutput.textContent = ovp.toFixed(1);
    uvpOutput.textContent = uvp.toFixed(1);
    ocpOutput.textContent = ocp.toFixed(1);

    // Render Model
    render3DModel(series, parallel, cellType, cellBaseW, cellBaseH, cellDepth, cellGap);
}

// Shadow generator for 3D depth effect (optimized)
function generateDepthShadow(color, visualDepthPx, maxLayers = 15) {
    let shadow = [];
    let layers = Math.min(Math.round(visualDepthPx), maxLayers);
    if (layers < 1) layers = 1;

    for (let i = 1; i <= layers; i++) {
        let offset = (visualDepthPx / layers) * i;
        shadow.push(`-${offset}px ${offset}px 0 ${color}`);
    }
    // Base shadow
    shadow.push(`-${visualDepthPx + 3}px ${visualDepthPx + 3}px 10px rgba(0,0,0,0.5)`);
    return shadow.join(', ');
}

function render3DModel(series, parallel, type, baseW, baseH, depth, gapMm) {
    const totalCells = series * parallel;
    batteryVisualizer.innerHTML = '';
    vizWarning.style.display = 'none';

    // Limit render size to prevent browser crash
    if (totalCells > 1500) {
        batteryVisualizer.style.display = 'none';
        vizWarning.style.display = 'block';
        vizWarning.textContent = `Visualization hidden: Pack size (${totalCells} cells) is too large to render smoothly in 3D.`;
        return;
    }

    batteryVisualizer.style.display = 'grid';

    // Calculate dynamic scaling so it always fits in the viewport container
    const maxContainerViewPx = 450;
    const unscaledPackWidth = (parallel * baseW) + (parallel * gapMm);
    const unscaledPackHeight = (series * baseH) + (series * gapMm);
    const unscaledDepth = depth;

    // Rough isometric bounds calculation
    const isoWidth = unscaledPackWidth + unscaledDepth;
    const isoHeight = unscaledPackHeight + unscaledDepth;
    const maxUnscaled = Math.max(isoWidth, isoHeight);

    let scaleFactor = maxContainerViewPx / maxUnscaled;

    // Cap scaling to prevent small packs from looking absurdly huge
    if (scaleFactor > 3) scaleFactor = 3;
    if (scaleFactor < 0.2) scaleFactor = 0.2;

    // Convert to Px
    const pxW = baseW * scaleFactor;
    const pxH = baseH * scaleFactor;
    const pxDepth = depth * scaleFactor;
    const pxGap = gapMm * scaleFactor;

    batteryVisualizer.style.gap = `${pxGap}px`;
    batteryVisualizer.style.gridTemplateColumns = `repeat(${parallel}, ${pxW}px)`;
    batteryVisualizer.style.gridTemplateRows = `repeat(${series}, ${pxH}px)`;

    // Determine colors based on type
    const baseColor = type === 'cylindrical' ? '#3498db' : '#ecf0f1';
    const shadowColor = type === 'cylindrical' ? '#2980b9' : '#bdc3c7';

    const generatedShadow = generateDepthShadow(shadowColor, pxDepth);

    for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement('div');
        cell.className = `cell-3d cell-${type}`;
        cell.style.width = `${pxW}px`;
        cell.style.height = `${pxH}px`;
        cell.style.boxShadow = generatedShadow;

        // Allow override of background for prismatic to look more metallic
        if (type === 'prismatic') cell.style.backgroundColor = baseColor;

        batteryVisualizer.appendChild(cell);
    }
}

// Attach Listeners
inputs.forEach(input => {
    input.addEventListener('input', calculatePack);
});

// Run Initial Calc
calculatePack();
