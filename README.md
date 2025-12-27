# Hivemind - Solana Wallet Adapter Integration

This project is a simple static site. I added support for Solana wallet connections. There are two connection methods included:

1. A lightweight `wallet-connect.js` which uses the injected `window.solana` provider (Phantom-compatible). No build step required.
2. An optional, official integration using `@solana/wallet-adapter` packages. This requires Node, npm, and a build step to produce `dist/wallet-adapter-bundle.js`.

How to build the official adapter bundle

1. Install dependencies:

```powershell
npm install
```

2. Build the bundle (produces `dist/wallet-adapter-bundle.js`):

```powershell
npm run build
```

3. Serve the site (you can use the bundled start script or a simple HTTP server):

```powershell
# optional: start python http server
python -m http.server 8000
# then open http://localhost:8000/index.html in a browser with a Solana wallet extension
```

Notes

- The adapter bundle uses `esbuild` to create a browser bundle. If you prefer another bundler (Vite/webpack/rollup), you can adapt `package.json` accordingly.
- After building, `index.html` includes `./dist/wallet-adapter-bundle.js`. If you don't build, the site will fall back to `wallet-connect.js` which uses the injected provider.

If you want me to run `npm install` and `npm run build` here I can, but that will install packages into your workspace — tell me if you want me to proceed and I'll run the commands and report the results.
