-- ═══════════════════════════════════════════════════════════════════
--  টাকা যায় কই? (Money Tracking) — Supabase setup
--  Run ONCE: Supabase → SQL Editor → New query → paste everything → Run.
--  ⚠️ Change the admin email on the last lines (marked CHANGE ME).
-- ═══════════════════════════════════════════════════════════════════

-- ── Tables ───────────────────────────────────────────────────────────
create table if not exists public.admins (
  email text primary key
);

create table if not exists public.profiles (
  id         uuid primary key references auth.users on delete cascade,
  email      text,
  pro        boolean not null default false,
  pro_since  timestamptz,
  book_id    uuid,
  created_at timestamptz not null default now()
);

-- A "book" holds expenses. v1: one personal book per user.
-- Built this way so a book can be shared with family later without moving any data.
create table if not exists public.books (
  id         uuid primary key default gen_random_uuid(),
  owner      uuid not null references auth.users on delete cascade,
  kind       text not null default 'personal',
  created_at timestamptz not null default now()
);

create table if not exists public.book_members (
  book_id  uuid references public.books on delete cascade,
  user_id  uuid references auth.users on delete cascade,
  role     text not null default 'owner',
  added_at timestamptz not null default now(),
  primary key (book_id, user_id)
);

-- Expenses. Deleted ones are kept as small "deleted" markers so every phone learns about the delete.
create table if not exists public.entries (
  book_id    uuid references public.books on delete cascade,
  id         text not null check (length(id) <= 64),
  amt        numeric(14, 2) not null default 0 check (amt >= 0),
  cat        text check (length(cat) <= 64),
  note       text check (length(note) <= 200),
  date       date,
  rec        text,
  created    bigint,
  updated_at bigint not null,                       -- phone time in ms; newest version wins
  deleted    boolean not null default false,
  by         uuid not null default auth.uid(),
  synced_at  timestamptz not null default clock_timestamp(),
  primary key (book_id, id)
);
create index if not exists entries_sync_idx on public.entries (book_id, synced_at);

-- Categories, targets, theme, fonts… (one row per user)
create table if not exists public.user_settings (
  user_id    uuid primary key default auth.uid() references auth.users on delete cascade,
  data       jsonb not null,
  updated_at bigint not null
);

-- bKash payments. TrxID is the key, so the same TrxID can never be used twice.
create table if not exists public.payments (
  trx_id     text primary key check (trx_id ~ '^[A-Z0-9]{8,12}$'),
  uid        uuid not null default auth.uid() references auth.users on delete cascade,
  email      text,
  sender     text check (sender is null or sender ~ '^[0-9]{0,4}$'),
  amount     int  not null check (amount = 89),          -- price ৳89 (change here if the price changes)
  status     text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  method     text not null default 'manual-bkash',
  created_at timestamptz not null default now(),
  decided_at timestamptz
);
create index if not exists payments_uid_idx on public.payments (uid);
create index if not exists payments_created_idx on public.payments (created_at desc);

-- ── Newest version wins (protects against an old phone overwriting newer data) ──
create or replace function public.entries_newest_wins() returns trigger
language plpgsql as $$
begin
  if tg_op = 'UPDATE' and new.updated_at < old.updated_at then
    return old;                       -- keep what's there
  end if;
  new.synced_at := clock_timestamp();
  return new;
end $$;
drop trigger if exists entries_newest_wins on public.entries;
create trigger entries_newest_wins before insert or update on public.entries
  for each row execute function public.entries_newest_wins();

-- ── Helper functions ────────────────────────────────────────────────
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admins a
    join auth.users u on lower(u.email) = lower(a.email)
    where u.id = auth.uid() and u.email_confirmed_at is not null
  );
$$;

create or replace function public.is_member(b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.book_members where book_id = b and user_id = auth.uid());
$$;

-- First sign-in: make the profile + personal book. Later calls just return the profile.
create or replace function public.ensure_account() returns setof public.profiles
language plpgsql security definer set search_path = public as $$
declare v_book uuid;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if not exists (select 1 from public.profiles where id = auth.uid()) then
    insert into public.books (owner) values (auth.uid()) returning id into v_book;
    insert into public.book_members (book_id, user_id, role) values (v_book, auth.uid(), 'owner');
    insert into public.profiles (id, email, book_id)
      values (auth.uid(), (select email from auth.users where id = auth.uid()), v_book)
      on conflict (id) do nothing;
  end if;
  return query select * from public.profiles where id = auth.uid();
end $$;

-- Admin: approve a TrxID → that user becomes Pro
create or replace function public.approve_payment(p_trx text) returns void
language plpgsql security definer set search_path = public as $$
declare v_uid uuid;
begin
  if not public.is_admin() then raise exception 'not admin'; end if;
  update public.payments set status = 'approved', decided_at = now()
    where trx_id = p_trx and status = 'pending' returning uid into v_uid;
  if v_uid is null then raise exception 'payment not found or already decided'; end if;
  update public.profiles set pro = true, pro_since = coalesce(pro_since, now()) where id = v_uid;
end $$;

create or replace function public.reject_payment(p_trx text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not admin'; end if;
  update public.payments set status = 'rejected', decided_at = now() where trx_id = p_trx and status = 'pending';
end $$;

-- Admin: give Pro by email (e.g. a gift). Returns false if there is no such user.
create or replace function public.grant_pro(p_email text) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not admin'; end if;
  update public.profiles set pro = true, pro_since = coalesce(pro_since, now()) where lower(email) = lower(p_email);
  return found;
end $$;

revoke execute on function public.ensure_account(), public.approve_payment(text), public.reject_payment(text), public.grant_pro(text) from public, anon;
grant execute on function public.ensure_account(), public.approve_payment(text), public.reject_payment(text), public.grant_pro(text),
  public.is_admin(), public.is_member(uuid) to authenticated;

-- ── Row Level Security: each user reaches only their own rows ───────
alter table public.admins        enable row level security;   -- no policies: nobody reads it from the app
alter table public.profiles      enable row level security;
alter table public.books         enable row level security;
alter table public.book_members  enable row level security;
alter table public.entries       enable row level security;
alter table public.user_settings enable row level security;
alter table public.payments      enable row level security;

-- Profiles: read your own (admins read all). No direct insert/update — Pro only via admin functions.
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles for select using (id = auth.uid() or public.is_admin());

drop policy if exists "members read book" on public.books;
create policy "members read book" on public.books for select using (public.is_member(id));

drop policy if exists "read own membership" on public.book_members;
create policy "read own membership" on public.book_members for select using (user_id = auth.uid());

-- Expenses: only members of the book.
drop policy if exists "members read entries" on public.entries;
drop policy if exists "members add entries" on public.entries;
drop policy if exists "members edit entries" on public.entries;
create policy "members read entries" on public.entries for select using (public.is_member(book_id));
create policy "members add entries"  on public.entries for insert with check (public.is_member(book_id) and by = auth.uid());
create policy "members edit entries" on public.entries for update using (public.is_member(book_id)) with check (public.is_member(book_id) and by = auth.uid());
revoke delete on public.entries from anon, authenticated;     -- deletes are synced as "deleted" markers

drop policy if exists "own settings" on public.user_settings;
create policy "own settings" on public.user_settings for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Payments: submit your own (as pending) and see your own; admins see all.
drop policy if exists "submit own payment" on public.payments;
drop policy if exists "read payments" on public.payments;
create policy "submit own payment" on public.payments for insert
  with check (uid = auth.uid() and status = 'pending' and decided_at is null);
create policy "read payments" on public.payments for select using (uid = auth.uid() or public.is_admin());
revoke update, delete on public.payments from anon, authenticated;

-- ── Your admin email ────────────────────────────────────────────────
insert into public.admins (email) values ('your-email@example.com')   -- ⚠️ CHANGE ME
on conflict do nothing;
