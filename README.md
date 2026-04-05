# 🌍 Worldpad

A real-time public sticky note board where anyone can drop thoughts, tagged by location or interest.

---

## 🚀 Setup Instructions

### Step 1: Set up the Database (Supabase)

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open the file `SUPABASE_SETUP.sql` from this folder
5. Copy ALL the SQL inside it
6. Paste it into the SQL editor
7. Click **Run** (green button)
8. You should see "Success" — your tables are ready!

---

### Step 2: Run the app locally

Open a terminal / command prompt in this folder and run:

```bash
npm install
npm run dev
```

Then open your browser and go to: **http://localhost:5173**

---

### Step 3: Deploy to Vercel (make it live!)

1. Push this folder to GitHub:
```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/worldpad.git
git push -u origin main
```

2. Go to vercel.com → New Project → Import your GitHub repo
3. Add Environment Variables in Vercel:
   - `VITE_SUPABASE_URL` = your supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your publishable key
4. Click Deploy!

---

## ✨ Features

- 📌 Drop sticky notes with 150 char limit
- 💬 Comment and reply on any note
- 🎨 8 note colors to choose from
- 📍 Tag by location (country/state/city)
- 🏷️ Tag by interest (15 categories)
- 🎲 Surprise Me — shows random notes from anywhere
- ⏰ Notes expire after 24 hours automatically
- 🦅 Random animal name per device (no signup needed)
- ⚡ Real-time updates via Supabase

---

Built with React + Vite + Supabase 💙
