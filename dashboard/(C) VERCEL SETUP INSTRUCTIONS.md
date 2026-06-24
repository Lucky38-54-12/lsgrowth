# LS Growth Dashboard — Vercel Deployment Setup

## Current Status
✅ Next.js 14 app built and pushed to GitHub (dashboard folder)
✅ All pages created (Dashboard, Calls, Pipeline, Emails, Analytics, Reports, Settings)
✅ All components created (Sidebar, Header, MetricCard, ChartCard, AlertCard)
✅ Configuration files completed (next.config.js, tailwind.config.js, jsconfig.json, postcss.config.js, vercel.json, .eslintrc.json)

## Vercel Configuration Required

Your Vercel project needs to be configured with the **Root Directory** set to `dashboard/` since the Next.js app is in a subdirectory of the lsgrowth repo.

### Steps to Fix Vercel Root Directory:

1. **Go to Vercel Dashboard** → https://vercel.com/dashboard
2. **Select your lsgrowth project**
3. **Go to Settings → General**
4. **Scroll to "Root Directory"** 
5. **Set to `dashboard`** (without leading slash)
6. **Save**

Once configured, Vercel will:
- Install dependencies from `dashboard/package.json`
- Build using `npm run build` (runs `next build`)
- Deploy from `.next/` output directory

## GitHub Status

Latest commits pushed:
- `a92b2b6` - Add .gitignore for Next.js project
- `cd6eb16` - Add Next.js configuration files
- `e3e90fd` - Add dashboard pages, layout, components, and styles

All files are now in the GitHub repo under `dashboard/` folder.

## Next Steps

1. **Verify Vercel Root Directory is set to `dashboard`**
2. **Trigger a redeploy from Vercel UI** (Settings → Git → Deployments → Redeploy)
3. **Check build logs** - should show "✓ Compiled successfully"
4. **Visit https://app.lsgrowth.agency** to see the live dashboard

## Troubleshooting

If build still fails:
- Check Vercel build logs (Settings → Deployments → Select failed build → Logs)
- Common issues:
  - Root Directory not set to `dashboard`
  - Node modules not properly installed (check `package.json`)
  - Missing environment variables (check .env in Settings → Environment Variables)

## Local Development

To test locally before deploying:

```bash
cd dashboard
npm install
npm run dev
```

Then visit http://localhost:3000
