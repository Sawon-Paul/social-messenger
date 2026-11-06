# Social Messenger - Deployment Guide

## Prerequisites
- Supabase project with all tables created
- Vercel account (recommended) or other hosting provider
- Domain name (optional)

---

## 1. Environment Variables

Copy `.env.local.example` to `.env.production` and fill in your values:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# PeerJS (for WebRTC calling)
PEERJS_HOST=
PEERJS_PORT=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 2. Deploy to Vercel (Recommended)

### Option A: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Option B: Using GitHub Integration
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables in Vercel dashboard
6. Click "Deploy"

### Environment Variables in Vercel Dashboard
Go to **Project Settings → Environment Variables** and add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`

---

## 3. Deploy to Other Platforms

### Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy

# Deploy to production
netlify deploy --prod
```

Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Docker
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=runner /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["npm", "start"]
```

---

## 4. Database Setup (If not done)

Run these SQL queries in Supabase SQL Editor:

1. **Initial Schema** - Run `supabase/schema.sql`
2. **Notifications Table** - Run the notifications section from schema.sql

---

## 5. Post-Deployment Checklist

- [ ] All environment variables are set
- [ ] Database tables are created in Supabase
- [ ] RLS policies are enabled
- [ ] Email confirmation is disabled (or configured)
- [ ] OAuth providers are configured (Google, Facebook, etc.)
- [ ] Storage buckets are created (avatars, posts, stories)
- [ ] CORS origins are whitelisted
- [ ] Custom domain is configured (optional)
- [ ] SSL certificate is active
- [ ] Monitoring is set up (Sentry, LogRocket, etc.)

---

## 6. Storage Buckets Setup

In Supabase Dashboard → Storage:

1. Create bucket: `avatars` (public)
2. Create bucket: `posts` (public)
3. Create bucket: `stories` (public)
4. Create bucket: `communities` (public)

### Bucket Policies
```sql
-- Allow public read on all buckets
create policy "Allow public read"
on storage.objects for select
using ( bucket_id = 'avatars' );

create policy "Allow public write"
on storage.objects for insert
with check ( auth.uid() = owner_id );
```

---

## 7. Email Configuration (Optional)

If you want email verification:
1. Go to Supabase Dashboard → Authentication → Providers → Email
2. Enable "Confirm email"
3. Customize email templates

---

## 8. Monitoring & Analytics

### Recommended Tools
- **Sentry** - Error tracking: `npm install @sentry/nextjs`
- **PostHog** - Analytics: `npm install posthog-js`
- **UptimeRobot** - Uptime monitoring (free)

---

## 9. Performance Optimization Tips

1. **Enable CDN** - Vercel has built-in CDN
2. **Image Optimization** - Use Next.js `<Image>` component
3. **Lazy Loading** - Components loaded on demand
4. **Database Indexes** - Already configured in schema
5. **Caching** - Implemented in `src/lib/cache.ts`

---

## 10. Troubleshooting

### Issue: Images not loading
- Check storage bucket is public
- Verify CORS settings in Supabase

### Issue: Auth not working
- Verify environment variables
- Check OAuth redirect URLs in Supabase

### Issue: Real-time not working
- Check Supabase realtime settings
- Verify RLS policies allow subscriptions

---

## 11. Backup & Recovery

### Database Backup
```bash
# Install Supabase CLI
npm install -g supabase

# Link your project
supabase link --project-ref your-project-ref

# Create backup
supabase db dump -f supabase/backups/backup.sql
```

---

## 12. Domain Setup (Optional)

In Vercel Dashboard:
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. SSL certificate auto-provisioned

---

**Your app is ready for production! 🚀**
