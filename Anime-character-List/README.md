# 🎨 Anime Character Gallery

A modern, production-ready Next.js application for managing anime characters with secure authentication, cloud-synced data, and a premium UI.

## ✨ Features

- 🔐 **Secure Authentication** - Password-based login with Supabase Auth
- 🗄️ **Cloud Database** - PostgreSQL database with Row Level Security
- 🖼️ **Image Storage** - Upload and manage character images
- 🎨 **Modern UI** - Built with shadcn/ui and Hero UI
- 📱 **Responsive Design** - Mobile-first approach
- 🔄 **Real-time Sync** - Data syncs across all devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works great!)

### 1. Clone and Install

```bash
cd /Users/uzair/Developer/Projects/anime-char-gallery
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to initialize (~2 minutes)
3. Go to **Project Settings** > **API** and copy:
   - Project URL (looks like: `https://xxxxx.supabase.co`)
   - Anon/Public Key (starts with `eyJ...`)

### 3. Configure Environment Variables

Create a `.env.local` file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Set Up Database

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the contents of `supabase/schema.sql`
4. Paste and run the query to create tables and security policies

### 5. Set Up Storage

1. In Supabase Dashboard, go to **Storage**
2. Click **Create a new bucket**
3. Name it: `character-images`
4. Make it **Public**
5. Click Create

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## 📖 Usage

1. **Sign Up**: Create an account on the login page
2. **Add Categories**: Click "Categories" to create character categories (e.g., "Shonen", "Seinen")
3. **Add Characters**: Click "Add Character" to upload character images
4. **Manage**: Click the edit/delete icons on character cards to update your collection

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **UI Components**: shadcn/ui + Hero UI
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## 📁 Project Structure

```
anime-char-gallery/
├── app/
│   ├── actions/          # Server Actions
│   │   ├── characters.ts
│   │   ├── categories.ts
│   │   └── storage.ts
│   ├── dashboard/        # Main dashboard page
│   ├── login/           # Authentication page
│   └── layout.tsx       # Root layout
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── character-card.tsx
│   ├── character-grid.tsx
│   ├── add-character-modal.tsx
│   └── edit-character-modal.tsx
├── lib/
│   ├── supabase/        # Supabase clients
│   ├── database.types.ts # TypeScript types
│   └── utils.ts         # Utility functions
└── supabase/
    └── schema.sql       # Database schema
```

## 🔒 Security

- Row Level Security (RLS) ensures users can only access their own data
- Images are stored in Supabase Storage with secure URLs
- Authentication handled by Supabase Auth
- Server-side validation on all data mutations

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables (same as `.env.local`)
5. Deploy!

Your app will be live at `https://your-app.vercel.app`

## 📝 License

MIT

## 🤝 Contributing

Feel free to submit issues and enhancement requests!
