# MWITools

Tools for the game MilkyWayIdle.

This script is in Chinese. 本插件是中文的。

Shows total action time.

Shows market prices.

Shows action number quick inputs.

Shows how many actions are needed to reach a certain skill level.

Shows skill exp percentages.

Shows total networth.

Shows combat summary.

Shows combat maps index.

Shows item level on item icons.

Shows how many ability books are needed to reach a certain level.

Shows market equipment filters.

# Mooneycalc-Importer

For the game MilkyWayIdle.
This script imports player info to the following websites with one click of a button:
https://mooneycalc.vercel.app/
https://mwisim.github.io/
https://cowculator.info/

# Development

The installable userscript is [`MWITools.js`](./MWITools.js). It is generated from the feature-oriented modules under [`src/`](./src); do not edit the generated file directly.

```bash
npm install
npm run dev        # Vite watch build
npm run typecheck  # tsc --noEmit
npm run build
npm run check      # typecheck + build + syntax check
```

Source modules are TypeScript files. Vite compiles the ordered modules in [`src/manifest.json`](./src/manifest.json) into the single installable `MWITools.js`. See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for module boundaries, startup flow, and instructions for adding features.
