# টাকা যায় কই? (Money Tracking)

A simple monthly expense tracker for your phone, in Bangla and English. It works offline with no account. Signing in once turns on backup and sync through Supabase.

## What's in the folder

| File | What it does |
|---|---|
| `index.html`, `styles.css`, `app.js` | The app |
| `i18n.js` | All Bangla/English text, the 8 starting categories, category suggestions, 183 icons, 9 colours, 5+5 fonts. **Edit wording here.** |
| `config.js` | **Your settings**: Supabase URL and key, bKash number, price, trial days |
| `store.js` | Backup and sync (Supabase, or demo mode when `SUPABASE_URL` is empty) |
| `charts.js`, `icons.js` | Charts and line icons |
| `payments.js` | Payment module: manual bKash TrxID now, gateway later |
| `admin.html`, `admin.js` | Your page for approving bKash payments |
| `supabase.sql` | Database tables, security rules and admin functions. Run once in Supabase. |
| `sw.js`, `manifest.webmanifest`, `icons/`, `fonts/` | Install-to-home-screen, offline support, the app icon and the default Bangla font |

## 1. Try it first

With `SUPABASE_URL = ""` in `config.js` the app runs in **demo mode**. Sign-in and backup are simulated in the browser, so you can try everything, including `admin.html`.

```bash
python3 -m http.server 8080      # then open http://localhost:8080
```

## 2. Supabase setup

| Step | Where | What to do |
|---|---|---|
| 1 | supabase.com → **New project** | Region: **Singapore**. Save the database password. |
| 2 | **SQL Editor → New query** | Open `supabase.sql` and change `your-email@example.com` on the last lines to **your email**. Paste everything and press **Run**. It should say *Success*. |
| 3 | **Project Settings → API Keys** | Copy the **Project URL** and the **publishable / anon key** into `config.js` (`SUPABASE_URL`, `SUPABASE_ANON_KEY`). Never put the secret / `service_role` key in the app. |
| 4 | `config.js` | Set `BKASH_NUMBER`. |
| 5 | **Authentication → Sign In / Providers → Email** | Keep Email on. **Confirm email**: on is safer, because users verify their email once before signing in. Off makes sign-up instant. The app handles both. |

## 3. GitHub Pages

| Step | Where | What to do |
|---|---|---|
| 1 | GitHub → **New repository** | Upload all the files from this folder to the root. |
| 2 | Repo **Settings → Pages** | Source: *Deploy from a branch*, branch `main`, folder `/ (root)`. Wait a minute for the link, e.g. `https://yourname.github.io/taka-jay-koi/` |
| 3 | Supabase **Authentication → URL Configuration** | **Site URL** = your GitHub Pages link. Under **Redirect URLs**, add the same link followed by `**`. Without this, email verification and password-reset links won't open the app. |
| 4 | The app | Open the link → **সেটিংস → ব্যাকআপ → সাইন ইন** with your admin email. Then open `…/admin.html`. |

**Updates:** when you change files, bump `V` in `sw.js` (e.g. `tk-v2.0.1`) so phones load the new version.

## 4. Daily admin work (bKash)

1. A user sends ৳89 by bKash and enters the TrxID in the app. Payment needs a signed-in account.
2. Open `yoursite/admin.html` and look under **⏳ অপেক্ষায়**.
3. Match the TrxID and the amount against your bKash statement, then tap **Approve**.
4. Pro turns on for that user within about 30 seconds, or right away when they open the app.

To add another admin, run this in the SQL Editor: `insert into public.admins(email) values ('name@email.com');`

## How backup works

- Everything is saved on the phone first, so the app works with no internet and no account.
- After a one-time sign-in, changes upload in the background. Changes made offline wait and upload when the internet returns.
- On a new phone, sign in and all your expenses, categories, targets, colour and fonts come back.
- If two phones change the same expense, the newest change wins, and the server enforces this.
- Signing out removes the data from that phone. It stays in the backup.

## Privacy: be honest with users

Expenses are stored in your Supabase project without encryption. Users can't see each other's data, because row-level security blocks it. **As the project owner, you can see users' expenses in the Supabase dashboard.** Say so in a short privacy note. If you want this to change later, encryption tied to each user's password can be added without asking users for a PIN.

## Free vs Pro (৳89 one-time; Pro free for the first 7 days)

| Free | Pro |
|---|---|
| Unlimited expenses, back-dating, notes, quick notes | Unlimited targets (free: 3) |
| Pie, month, year and compare charts | 6 more colours |
| Backup and sync, search, calendar | Excel and PDF export |
| 3 colours, dark/light, Bangla/English, 5+5 fonts | Recurring expenses (rent, bills) |
| Badges, month card | Extra animations |

The trial is counted from the day the app is first opened on a phone.

**Changing the price:** update `PRO_PRICE` in `config.js`, and in the SQL Editor run:
```sql
alter table public.payments drop constraint payments_amount_check, add constraint payments_amount_check check (amount = 99);
```

## Later

| Feature | How |
|---|---|
| Official bKash or gateway checkout | Implement `startGateway()` in `payments.js`. Add a Supabase Edge Function that verifies the payment callback and sets `profiles.pro = true`. The app already reacts when that changes. |
| Family / shared book | The tables are already built for it (`books`, `book_members`, `entries.by`). Add an invite function that inserts a member row; existing data doesn't move. |

## Free-plan note

Supabase pauses a free project after about a week with no activity. Regular use keeps it awake. If it pauses, press **Restore** in the dashboard.
