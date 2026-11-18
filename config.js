// ─────────────────────────────────────────────────────────────
//  টাকা যায় কই? — settings you fill in
// ─────────────────────────────────────────────────────────────

// 1) Supabase (Project Settings → API Keys / Data API).
//    Leave SUPABASE_URL empty ("") to run in DEMO mode: everything stays on this one phone.
export const SUPABASE_URL = "https://bfgdcrmytaxnbfgntqgd.supabase.co";            // e.g. "https://abcdxyz.supabase.co"
export const SUPABASE_ANON_KEY = "https://bfgdcrmytaxnbfgntqgd.supabase.co";       // the publishable / anon key (safe to put in the app)

// 2) Admins are set in the database, not here:
//    insert into public.admins(email) values ('you@example.com');   (see supabase.sql)

// 3) The bKash number users send money to.
export const BKASH_NUMBER = "01675291441";

// 4) Pricing & limits
export const PRO_PRICE = 89;        // ৳, one time. Must match supabase.sql (payments.amount check)
export const TRIAL_DAYS = 7;        // counted from the day the app is first opened on the phone
export const FREE_TARGETS = 3;

// 5) Payment method. "manual-bkash" now; later swap to a gateway module (see payments.js).
export const PAYMENT_METHOD = "manual-bkash";

export const APP_VERSION = "2.0.0";
