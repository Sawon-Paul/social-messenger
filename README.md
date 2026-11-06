# 🚀 ConnectHub

A fully responsive Facebook + Messenger-style web application built with Next.js 15, Supabase, and WebRTC. Designed for phone, tablet, and laptop — with Android app architecture ready.

## ✨ Features

### 🔐 Authentication
- Email/Password login & registration
- Google OAuth integration
- Forgot password recovery
- Protected routes & middleware

### 👤 User Profile
- Editable profile with cover photo & avatar
- Bio editing
- Posts/Friends/Photos/Videos tabs
- Public profile pages

### 👥 Friends System
- Send/accept/reject friend requests
- Search users
- Friend list management
- Real-time status updates

### 📰 News Feed
- Infinite scroll feed
- Create posts with text & images
- Like & comment on posts
- Stories (24-hour disappearing content)

### 💬 Messenger
- Real-time messaging (Supabase realtime)
- Chat list with search
- Online status indicators
- Read receipts (✓ single, ✓✓ double)
- Floating chat windows
- Mobile-responsive layout

### 📞 WebRTC Calling
- Peer-to-peer audio calls
- Video calls with camera toggle
- Incoming call notifications
- Call duration timer
- Mute/hangup controls

### 🔔 Notifications
- Real-time notification bell
- Dropdown preview
- Full notifications page
- Search & filter (All/Unread)
- Auto-create on: friend requests, likes, comments

### 🏘️ Communities/Groups
- Browse & search communities
- Join/leave communities
- Community posts
- Member management
- Public/Private privacy settings

### 📱 Responsive Design
- **Mobile**: Bottom tab navigation
- **Tablet**: Collapsible sidebar
- **Desktop**: Full layout with sidebars
- **Android-ready architecture**

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Real-time | Supabase Realtime + WebSockets |
| State Management | Zustand |
| Video/Audio | PeerJS + WebRTC |
| Icons | Lucide React |
| Virtualization | @tanstack/react-virtual |

---

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd connecthub
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Set Up Database
1. Go to your Supabase Dashboard → SQL Editor
2. Run `supabase/schema.sql`
3. Run the notifications section (in schema.sql)

### 5. Create Storage Buckets
In Supabase Dashboard → Storage:
- `avatars` (public)
- `posts` (public)
- `stories` (public)
- `communities` (public)

### 6. Configure OAuth (Optional)
1. Supabase Dashboard → Authentication → Providers
2. Enable Google OAuth
3. Add your client ID & secret
4. Set redirect URL: `https://your-domain.com/auth/callback`

---

## 🚀 Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Production Build

```bash
npm run build
npm start
```

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

**Option 1: Using CLI**
```bash
npm i -g vercel
vercel login
vercel --prod
```

**Option 2: GitHub Integration**
1. Push code to GitHub
2. Connect repository at [vercel.com](https://vercel.com)
3. Add environment variables in dashboard
4. Deploy!

### Other Platforms
See [DEPLOYMENT.md](./DEPLOYMENT.md) for Netlify, Docker, and more.

---

## 📁 Project Structure

```
socialhub
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── auth/callback/      # OAuth callback route
│   │   ├── notifications/      # Notifications page
│   │   ├── (main)/             # Main layout group
│   │   │   ├── page.tsx        # News Feed
│   │   │   ├── profile/        # User profile
│   │   │   ├── friends/        # Friends management
│   │   │   ├── messages/       # Messenger
│   │   │   └── communities/    # Communities/Groups
│   │   ├── login/              # Login page
│   │   ├── register/           # Registration page
│   │   ├── forgot-password/    # Password reset
│   │   ├── layout.tsx          # Root layout
│   │   └── globals.css         # Global styles
│   ├── components/             # React components
│   │   ├── calling/            # WebRTC call components
│   │   ├── communities/        # Community components
│   │   ├── layout/             # Navbar, Sidebars, etc.
│   │   ├── messenger/          # Chat components
│   │   ├── notifications/      # Notification bell
│   │   ├── posts/              # Post components
│   │   ├── stories/            # Story components
│   │   └── utils/              # Utility components
│   ├── lib/                    # Utilities & configs
│   │   ├── supabase/           # Supabase clients
│   │   ├── cache.ts            # Caching strategies
│   │   ├── image-utils.ts      # Image optimization
│   │   └── notifications.ts    # Notification types
│   └── store/                  # Zustand stores
│       ├── useAppStore.ts      # Global app state
│       └── useCallStore.ts     # Call state
├── supabase/
│   └── schema.sql              # Database schema
├── .github/workflows/          # CI/CD pipelines
├── DEPLOYMENT.md               # Deployment guide
├── IMPLEMENTATION_PLAN.md      # Development plan
├── PROGRESS.md                 # Progress tracker
├── vercel.json                 # Vercel config
└── package.json
```

---

## 📱 Responsive Breakpoints

| Device | Width | Layout |
|--------|-------|--------|
| Phone | < 768px | Bottom tab bar, hidden sidebars |
| Tablet | 768px - 1024px | Collapsible sidebar |
| Desktop | > 1024px | Full layout with all sidebars |

---

## 🔒 Security

- **Row Level Security (RLS)** enabled on all tables
- **Middleware** protects authenticated routes
- **Storage policies** control file access
- **Environment variables** for secrets

---

## 🧪 Testing

```bash
# Run ESLint
npm run lint

# Type check
npx tsc --noEmit
```

---

## 📝 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [PeerJS](https://peerjs.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://github.com/pmndrs/zustand)

---

## 📧 Support

For issues or questions, please open an issue in the repository.

---

**Built with ❤️ using Next.js & Supabase**

---

## 📧 Support

For issues or questions, please open an issue at [github.com/Sawon-Paul/social-messenger](https://github.com/Sawon-Paul/social-messenger).
