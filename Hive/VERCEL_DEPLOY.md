# How to deploy this project to Vercel

Options covered:
- Quick: Vercel CLI (manual deploy)
- Recommended: GitHub repo + Vercel continuous deploy

## Prerequisites
- Node.js and npm installed
- A Vercel account (https://vercel.com)
- Optional: a GitHub account (for automatic deploys)

## 1) GitHub + Vercel (Recommended for continuous deploy)
1. Push your code to a GitHub repository.
2. Go to https://vercel.com/new.
3. Import your GitHub repository.
4. Vercel should automatically detect the settings from `vercel.json`:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Click **Deploy**.

## 2) From local machine: Vercel CLI
1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy the project:
   ```bash
   vercel
   ```
   - Follow the prompts.
   - When asked `? In which directory is your code located?`, press Enter (default is `./`).
   - When asked `? Want to modify these settings?`, answer `N` (it should pick up `vercel.json`).

4. For production deployment:
   ```bash
   vercel --prod
   ```

## Notes
- The `vercel.json` file configures the build command and output directory so you don't have to manually set them in the dashboard.
- The build script (`scripts/build.js`) cleans the `dist` folder and copies necessary files, sanitizing filenames (removing fragments like `#iefix`) to ensure compatibility.
