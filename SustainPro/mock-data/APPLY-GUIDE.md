# SustainPro Mock Data — Apply Guide

## One-time setup (you've already done this ✓)

```bash
git clone https://github.com/vyann755-755/SustainPro.git
cd SustainPro/SustainPro     # nested folder where package.json lives
```

---

## Apply the mock-data package

You'll need the contents of THIS project's `mock-data/` folder on your machine. Two ways:

### Easiest: download as a zip
From this project, use the **Download** action on the `mock-data` folder. Unzip it.
You should end up with a `mock-data/` folder containing:

```
mock-data/
├── apply-changes.sh
├── seedActivitySubmissions.ts
├── seed-supabase.sql
├── dedicatedFormulas.ts             (reference only)
├── README.md
└── patched/
    └── src/
        ├── data/formulasData.ts
        └── components/sa/activitiesData.ts
```

### Run the apply script
From inside your local SustainPro repo (where `package.json` lives):

```bash
# Make the script executable (one time only)
chmod +x /path/to/mock-data/apply-changes.sh

# Run it from the repo root
/path/to/mock-data/apply-changes.sh
```

It will:
1. Copy `seedActivitySubmissions.ts` → `src/data/`
2. Copy `seed-supabase.sql` → repo root
3. Overwrite `src/data/formulasData.ts` (adds 3 dedicated formulas)
4. Overwrite `src/components/sa/activitiesData.ts` (re-binds 3 activities to dedicated formulas)
5. Patch `src/components/customer/ActivityData.tsx` (1 added import + replaces mockSubmissions block)

Re-run safe — idempotent.

---

## Verify, commit, push

```bash
git status        # should show 5 changed/new files
git diff          # eyeball the edits

git add .
git commit -m "feat: FY2025 interrelated mock data + dedicated formulas + Supabase seed"
git push origin main
```

Vercel picks it up automatically.

---

## Run the Supabase seed (once)

Open `seed-supabase.sql` in your repo, paste into the Supabase SQL editor at
[https://supabase.com/dashboard/project/iqjlbqhpojsqxcpdvkbs/sql](https://supabase.com/dashboard/project/iqjlbqhpojsqxcpdvkbs/sql), run it.
The file is self-contained (creates tables if missing, then seeds the data).

---

## Keeping local ↔ GitHub in sync going forward

Two simple habits cover 99 % of the cases:

### Before you start a working session — pull
```bash
cd SustainPro/SustainPro
git pull origin main
```
This fetches whatever I (or anyone else) committed since last time.

### After every working session — push
```bash
git add .
git commit -m "describe what changed"
git push origin main
```

### Optional: turn on auto-fetch in your editor
- **VS Code**: Settings → `git.autofetch` → `true`. The Source Control panel pings GitHub every few minutes and tells you when there's something new to pull.
- **GitHub Desktop**: Fetch is automatic every 10 minutes.
- **JetBrains (WebStorm/IntelliJ)**: Settings → Version Control → Git → enable "Auto-update on push" and the toolbar shows incoming changes.

### Truly automatic (advanced)
If you want a background script that keeps `main` always synced when you're not actively coding:

```bash
# cron entry: pull every 5 minutes (only if working tree is clean)
*/5 * * * * cd ~/path/to/SustainPro/SustainPro && \
            git diff --quiet && git pull --ff-only origin main >> ~/.git-autopull.log 2>&1
```

I don't recommend this on a folder you're actively editing — it can fight with unsaved work — but it's solid for a "view-only" mirror.

---

## What does NOT auto-sync

- This design project's files do **not** automatically reach GitHub. Every time I generate new files for you, you still need to download them + run the apply script + push. There's no avoiding this one round-trip — I do not have write access to your repo (and the GitHub tools available to me here are read-only by design).
- Changes you make in the GitHub web UI **do** push to `main`, but your local clone won't see them until you `git pull`.

---

## Recovery — undo if something goes wrong

If the apply script left things in a bad state and you haven't pushed yet:

```bash
# Discard ALL local changes since last commit (destructive!)
git reset --hard HEAD

# Or, for a specific file:
git checkout -- src/components/customer/ActivityData.tsx
```

If you already pushed and want to undo:

```bash
# Reverts the last commit by adding an inverse commit (safe for shared branches)
git revert HEAD
git push origin main
```
