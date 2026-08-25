# Class Updates & Homework Tracking Application

A web application for instructors to record student class updates, track Classwork (CW) and Homework (HW), review unchecked homework, prevent duplicate records, and generate reports.

Built with **React + TypeScript + Tailwind CSS**, powered by **Supabase (PostgreSQL + Auth + Row Level Security)**, and deployable for **₹0/month** on **Cloudflare Pages**.

---

## 🚀 Key Features

* **New Class Entry:**
  * Search/select student master list.
  * Duration combobox: presets (`30 mins`, `45 mins`, `1 hr`, `1.5 hrs`, `2 hrs`) or custom input (stored in minutes).
  * Classwork (CW) and Homework (HW) free-text tracking.
  * Historical date picker (evaluates previous homework accurately relative to the selected class date).
* **Separate Homework Entity & Atomic Save:**
  * Previous unchecked homework automatically loads when selecting a student and class date.
  * Check off completed homework and save the new class in **one atomic database transaction** (`save_class_update` RPC).
* **Duplicate Record Prevention:**
  * UI pre-check warning before saving.
  * Database constraint on `(student_id, instructor_id, subject_id, class_date)`.
* **Class & Student History:**
  * Searchable table with filters for date range, student, instructor, and subject.
  * One-click CSV export.
* **Reports Dashboard:**
  * Month-to-date (MTD), full-month, and custom date range summaries.
  * Duration calculation (total hours & minutes).
  * Pending vs Checked homework breakdown.
  * Clean print stylesheet for direct paper/PDF printing.
* **Master Data Administration:**
  * Manage active/inactive students, instructors, subjects, and grade levels.
* **Zero Initial Cost:**
  * Runs on Cloudflare Pages and Supabase free tier.

---

## 📁 Project Structure

```
class_management/
├── supabase_schema.sql         # Complete PostgreSQL DDL, RLS, Indexes, Seed Data & RPC
├── requirement_specs.md        # Technical and functional requirements
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── src/
│   ├── types/index.ts          # TypeScript interfaces
│   ├── lib/
│   │   ├── supabase.ts         # Supabase client initializer
│   │   └── api.ts              # Unified API with offline sandbox fallback
│   ├── contexts/
│   │   └── AuthContext.tsx     # Authentication and role state
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── ClassDurationPicker.tsx
│   │   ├── PendingHomeworkList.tsx
│   │   └── StudentSelect.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── NewClassUpdate.tsx
│   │   ├── ClassHistory.tsx
│   │   ├── Reports.tsx
│   │   ├── AdminManagement.tsx
│   │   └── Login.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
```

---

## 🛠️ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Locally in Sandbox Mode
You can immediately start and test the UI without setting up database keys:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Supabase Backend Setup

1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste and execute the contents of `supabase_schema.sql`.
4. Copy your project URL and anon public key from **Project Settings -> API**.
5. Create a `.env` file in this directory:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```
6. Restart your Vite dev server (`npm run dev`) and the app will automatically switch from Sandbox to Live Supabase!

---

## ☁️ Deployment (Cloudflare Pages)

1. Push this repository to GitHub.
2. Go to **Cloudflare Dashboard** -> **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**.
3. Select your repository and set build settings:
   * **Framework preset:** `Vite`
   * **Build command:** `npm run build`
   * **Build output directory:** `dist`
4. Add environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
5. Click **Save and Deploy**.
