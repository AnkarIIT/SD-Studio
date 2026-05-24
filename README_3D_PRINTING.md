LayerBound 3D — 3D Printing eCommerce Features
===============================================

Overview
--------
LayerBound 3D is a small eCommerce demo focused on custom, made-to-order 3D-printed products. This repository contains a React + TypeScript storefront with features tailored for 3D printing businesses: clear "Made to Order" messaging, production timelines, technical specifications, durability ratings, and a framework-ready 3D model viewer.

What’s included
---------------
- Product catalog and UI built with React + TypeScript and Tailwind CSS.
- "Made to Order" workflow: product cards and modals show production expectations and status.
- Product technical specifications: material, dimensions, print time, infill %, layer height, supports.
- Durability ratings to set customer expectations (display-only, light-use, moderate-use, heavy-use).
- Production timeline visualization with four stages: Order → Printing → Quality Check → Shipping.
- Placeholder 3D model viewer (`src/components/ModelViewer.tsx`) ready for Three.js / GLTF integration.
- New components:
  - `src/components/ProductSpecs.tsx`
  - `src/components/ProductionTimeline.tsx`
  - `src/components/ModelViewer.tsx`
  - Modifications to `src/components/ProductCard.tsx` and `src/components/ProductModal.tsx`
- New documentation: `3D_PRINTING_FEATURES.md` (feature summary and roadmap).

Quick start
-----------
Prerequisites
- Node.js 18+ and npm
- Git

Install
```bash
npm install
```

Run (development)
```bash
npm run dev
```

Build
```bash
npm run build
```

Testing
-------
This project includes TypeScript; run the dev server and watch for TypeScript/React errors. Add tests as needed for components and utils.

Development notes
-----------------
- Product types were extended in `src/types.ts` to include `durabilityRating`, `madeToOrder`, `productionTime`, `modelUrl`, and `materialSwatches`.
- Product metadata updated in `src/constants.ts` to include production times and technical specs for sample products.
- Line endings: this repo uses a `.gitattributes` file to normalize EOL to LF in the repository; on Windows you may still see `CRLF` locally — `git` will handle normalization.

How to add 3D models
--------------------
1. Convert or export 3D assets to GLTF/GLB for browser-friendly loading.
2. Host files on a CDN or public storage and add the `modelUrl` to the product object in `src/constants.ts`.
3. Integrate the model into `src/components/ModelViewer.tsx` using Three.js or a lightweight viewer like `model-viewer`.

Deployment
----------
Deploy the built `dist` output to any static host (Vercel, Netlify, GitHub Pages) or containerize the app depending on your backend needs.

Contributing
------------
1. Fork the repo
2. Create a feature branch
3. Open a PR with a clear description and screenshots

Contact
-------
For questions about these 3D printing features, or to request integrations (email/SMS production updates, order-tracking), open an issue or reach out on the repo.
