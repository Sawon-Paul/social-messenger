# ConnectHub - Implementation Plan

## Overview
Building a Facebook + Messenger-style web app that is:
- Fully responsive (phone → iPad → laptop)
- Android-app-ready architecture (Next.js PWA capable)
- Zero-cost infrastructure ($0 free tiers)

---

## Phase 1: Project Setup & Foundation (Step 1-3)

### Step 1: Initialize Next.js Project ✅
- Create Next.js 15 project with TypeScript, Tailwind CSS
- Configure shadcn/ui components
- Set up folder structure (App Router)
- Install all dependencies

### Step 2: Core Layout & Responsive Shell
- Persistent Top Navbar (responsive hamburger menu on mobile)
- Left Navigation Sidebar (collapsible on tablet, hidden on phone)
- Right Contacts sidebar (hidden on tablet/phone)
- Bottom tab bar for mobile
- Floating Chat Dock component
- WebRTC PiP overlay container

### Step 3: Supabase Integration & Auth
- Configure Supabase client (server + client)
- Auth pages (Sign In / Sign Up / Forgot Password)
- Protected route middleware
- Database schema setup (SQL file)

---

## Phase 2: Core Features (Step 4-8)

### Step 4: User Profile & Authentication Flow
- Profile page with avatar, cover photo
- Edit profile functionality
- User search
- Friend request system (backend logic + UI)

### Step 5: News Feed Engine
- Post composer (text, images, @mentions, #hashtags)
- Client-side WebP image compression
- Feed display with infinite scroll
- Emoji reactions (Like, Love, Haha, Wow, Sad, Angry)
- 2-level nested comments
- Content privacy guard (PUBLIC/FRIENDS/ONLY_ME)

### Step 6: Stories System
- Story upload with camera/gallery
- 24-hour ephemeral display
- Story viewer carousel
- Reply to story → Messenger thread

### Step 7: Communities / Groups
- Create/join groups
- Group-specific feed
- Admin controls
- Link to messenger group chat

### Step 8: Messenger Engine (Core)
- Contact list with online status
- 1-on-1 chat threads
- Floating mini-chat dock (3 simultaneous)
- Full-screen Messenger view (/messages/[id])
- Message types: text, images, voice notes, code snippets
- Reply quoting, message unsending
- Read receipts & typing indicators
- Group chats with admin controls

---

## Phase 3: Real-Time Features (Step 9-10)

### Step 9: WebRTC Calling Engine
- PeerJS + WebRTC integration
- Audio call UI
- Video call UI
- Screen sharing
- Picture-in-Picture mode
- Call signaling via Supabase Broadcast

### Step 10: Notifications System
- Real-time notification badge
- Friend request notifications
- Post interaction notifications
- Notification center page

---

## Phase 4: Polish & Deployment (Step 11-12)

### Step 11: Performance Optimization
- DOM virtualization (@tanstack/react-virtual)
- Image lazy loading
- Debounced typing events
- Last-read pointer pattern
- Service Worker for PWA

### Step 12: Deployment & CI/CD
- Vercel deployment setup
- GitHub Actions keep-alive cron
- Database cleanup jobs
- Final responsive testing (phone, tablet, desktop)

---

## Responsive Breakpoints Strategy
| Device | Width | Layout Changes |
|--------|-------|----------------|
| Phone | < 640px | Bottom tab bar, full-screen pages, slide-over drawers |
| Tablet | 640-1024px | Collapsible sidebar, hidden right panel |
| Laptop+ | > 1024px | Full 3-column layout with floating chat dock |

## Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend/DB**: Supabase (PostgreSQL + Realtime)
- **Auth**: Supabase Auth
- **Storage**: Cloudinary
- **Real-time**: Supabase Broadcast + WebRTC (PeerJS)
- **Hosting**: Vercel (free tier)
