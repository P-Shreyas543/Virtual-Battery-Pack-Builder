# Virtual Battery Pack Builder

An interactive, browser-based tool for designing and visualising custom lithium-ion battery packs. Configure your target voltage and capacity, choose a cell form factor, and the tool instantly calculates the optimal series/parallel architecture along with key electrical and physical specifications.

## Features

- **Automatic S×P Architecture Calculation** – enter target pack voltage and capacity, get the exact series (S) and parallel (P) cell count.
- **Two Cell Form Factors** – cylindrical (e.g. 18650, 21700, 4680) and prismatic (e.g. LiFePO4 blocks), each with sensible presets.
- **Comprehensive Electrical Specs** – total energy (kWh), pack internal resistance, maximum continuous power, and estimated cell weight.
- **BMS Protection Limits** – automatically derived Over-Voltage (OVP), Under-Voltage (UVP), and Over-Current (OCP) thresholds.
- **Dynamic 3D Pack Visualiser** – an isometric CSS grid that scales to fit the viewport and renders each cell with a depth shadow effect. Large packs (> 1 500 cells) are gracefully hidden to prevent browser slowdown.
- **Responsive Layout** – two-column grid on desktop, single column on mobile (≤ 850 px).

## Project Structure

```
Virtual-Battery-Pack-Builder/
├── index.html        # Application markup
├── css/
│   └── style.css     # All styles (layout, components, 3D visualiser)
├── js/
│   └── app.js        # Calculation logic and DOM interactions
└── README.md
```

## Getting Started

No build step or dependencies are required. Simply open `index.html` in any modern browser:

```bash
# Clone the repository
git clone https://github.com/P-Shreyas543/Virtual-Battery-Pack-Builder.git
cd Virtual-Battery-Pack-Builder

# Open directly in your default browser (macOS)
open index.html

# Or serve with any static file server, e.g. Python
python -m http.server 8080
# then visit http://localhost:8080
```

## Usage

1. **Set target requirements** – enter the desired pack voltage (V) and capacity (Ah).
2. **Select cell type** – choose *Cylindrical* or *Prismatic*; common electrical presets are filled in automatically.
3. **Adjust cell specifications** – nominal voltage, capacity, max/min voltage, max discharge current, internal resistance, and cell weight.
4. **Read the results** – the right-hand panel updates in real time with the calculated architecture, energy, BMS limits, and physical footprint.
5. **View the 3D layout** – the bottom section renders an isometric visualisation of the complete pack.

## How the Calculations Work

| Parameter | Formula |
|---|---|
| Series cells (S) | `ceil(targetVoltage / cellNominalVoltage)` |
| Parallel cells (P) | `ceil(targetCapacity / cellCapacity)` |
| Total energy | `(S × cellNomV) × (P × cellCap) / 1000` kWh |
| Pack IR | `(cellIR × S) / P` mΩ |
| OVP | `S × cellMaxVoltage` |
| UVP | `S × cellMinVoltage` |
| OCP | `P × cellMaxCurrent` |
| Max power | `packVoltage × OCP` W |
| Total weight | `S × P × cellWeight / 1000` kg |

## Browser Compatibility

Works in any modern browser that supports CSS Grid and CSS 3D transforms (Chrome, Firefox, Safari, Edge).

## License

This project is open source. Feel free to use, modify, and distribute it.
