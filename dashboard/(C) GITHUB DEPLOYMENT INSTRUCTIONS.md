# GitHub & Vercel Deployment — Push to Production

**Status:** Ready to push  
**Target:** app.lsgrowth.agency (Vercel)  
**GitHub:** your-repo/lsgrowth  

---

## 🚀 Step 1: Initialize Local Git

```bash
cd "03 Projects/The Comeback/04 System/dashboard"

# Initialize git if not already done
git init

# Add all files
git add .

# Initial commit
git commit -m "feat: premium dashboard redesign with Next.js

- New dark theme design (premium feel)
- 7 pages: Dashboard, Calls, Pipeline, Emails, Analytics, Reports, Settings
- Real-time metric cards with progress tracking
- Interactive charts (Line, Funnel, Bar)
- Responsive mobile design
- Tailwind CSS with custom color palette
- Recharts integration
- Ready for Vercel deployment"
```

---

## 🔗 Step 2: Connect to GitHub Repository

### If repo doesn't exist yet:
```bash
# Create new repo on GitHub first
# Then:
git remote add origin https://github.com/yourusername/lsgrowth.git
git branch -M main
git push -u origin main
```

### If repo already exists:
```bash
git remote add origin https://github.com/yourusername/lsgrowth.git
# Or if origin already exists:
git remote set-url origin https://github.com/yourusername/lsgrowth.git

# Push dashboard folder to repo
git subtree push --prefix=dashboard origin main
# Or if pushing entire project:
git push -u origin main
```

---

## 📦 Step 3: Push to Vercel

### Option A: CLI (Simplest)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts:
# - Project name: ls-growth or lsgrowth
# - Framework: Next.js
# - Root directory: dashboard/
# - Build command: npm run build
# - Output directory: .next
```

### Option B: Web (GitHub Connected)
1. Go to https://vercel.com
2. Import project from GitHub
3. Select your repository
4. Set root directory: `dashboard/`
5. Add environment variables (see below)
6. Deploy

### Option C: Git Push to Deploy
```bash
git push origin main
# Vercel auto-deploys if linked to GitHub
```

---

## ⚙️ Step 4: Configure Environment on Vercel

In Vercel dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL = https://api.lsgrowth.agency
NEXT_PUBLIC_DASHBOARD_API = https://app.lsgrowth.agency/api
NODE_ENV = production
```

---

## ✅ Step 5: Verify Deployment

1. Check Vercel dashboard — should show "Ready"
2. Visit your Vercel URL (auto-generated)
3. Verify all pages load
4. Check metrics updating
5. Test mobile responsiveness

---

## 🔄 Updates & Changes

### When you make changes:
```bash
# In dashboard folder
git add .
git commit -m "feat: description of changes"
git push origin main

# Vercel auto-deploys on push
# Check deployment at https://vercel.com/dashboard
```

---

## 📊 GitHub & Vercel Links

Once deployed:
- **GitHub:** https://github.com/yourusername/lsgrowth
- **Vercel:** https://vercel.com/dashboard
- **Live Site:** https://lsgrowth.vercel.app (or your custom domain)

---

## 🎯 Next: Custom Domain

To use `app.lsgrowth.agency`:

1. In Vercel dashboard → Settings → Domains
2. Add domain: `app.lsgrowth.agency`
3. Update DNS records (instructions on Vercel)
4. Wait for propagation (5-30 min)
5. Verify SSL certificate issued
6. Live! 🎉

---

## 📝 File Structure on GitHub

```
lsgrowth/
├── dashboard/              ← Your Next.js app
│   ├── app/
│   ├── components/
│   ├── public/
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── vercel.json
├── .gitignore
├── README.md
└── [other project files]
```

---

## 🔐 Security Notes

- Never commit `.env.local` — only `.env.local.example`
- Add to `.gitignore`: `.env`, `.env.local`, `node_modules/`
- Use Vercel secrets for production keys
- API keys should be environment variables only

---

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check `npm run build` locally first |
| Pages not showing | Verify root directory is `dashboard/` in Vercel |
| Env vars not working | Restart deployment after adding vars |
| Domain not resolving | Wait for DNS propagation, check records |
| Data not loading | Check API URL in environment variables |

---

## 📞 Git Commands Reference

```bash
# Check status
git status

# Add files
git add .

# Commit
git commit -m "message"

# Push
git push origin main

# Pull latest
git pull origin main

# View history
git log

# Undo last commit
git revert HEAD

# Switch branch
git checkout -b new-branch
```

---

## ✨ After Deployment

1. ✅ Update app.lsgrowth.agency DNS
2. ✅ Enable auto-deployments from GitHub
3. ✅ Set up status checks (optional)
4. ✅ Enable analytics in Vercel
5. ✅ Configure custom domain SSL
6. ✅ Set up monitoring/alerts (optional)

---

**Ready to deploy. Run commands above when you're ready.** 🚀

