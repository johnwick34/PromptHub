-- PromptHub upgrade. Safe to run more than once. It ONLY ADDS things; your existing prompts and config are not changed.
-- Supabase dashboard -> SQL Editor -> New query -> paste all of this -> Run.

-- 1) extra columns on prompts (existing rows get blank / 0)
alter table prompts add column if not exists model text default '';
alter table prompts add column if not exists author text default '';
alter table prompts add column if not exists copies integer default 0;
alter table prompts add column if not exists views integer default 0;

-- 2) visitor counters: lets the public site add +1 to copies/views, and nothing else
create or replace function bump_prompt(p_id bigint, p_field text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_field = 'copies' then update prompts set copies = coalesce(copies,0) + 1 where id = p_id;
  elsif p_field = 'views' then update prompts set views = coalesce(views,0) + 1 where id = p_id;
  end if;
end $$;
grant execute on function bump_prompt(bigint, text) to anon, authenticated;

-- 3) community submissions (anyone can send one; only the signed-in admin can read/approve/delete)
create table if not exists submissions (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  title text not null check (char_length(title) <= 120),
  category text not null,
  model text default '',
  tags text[] default '{}',
  prompt text not null check (char_length(prompt) <= 2000),
  image text default '' check (char_length(image) <= 400000),
  author text default '' check (char_length(author) <= 60)
);
alter table submissions enable row level security;
drop policy if exists "Anyone can submit" on submissions;
create policy "Anyone can submit" on submissions for insert to anon, authenticated with check (true);
drop policy if exists "Admins read submissions" on submissions;
create policy "Admins read submissions" on submissions for select to authenticated using (true);
drop policy if exists "Admins delete submissions" on submissions;
create policy "Admins delete submissions" on submissions for delete to authenticated using (true);

-- 4) newsletter subscribers (anyone can subscribe; only the admin can see the list)
create table if not exists subscribers (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  email text not null unique check (char_length(email) <= 120 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);
alter table subscribers enable row level security;
drop policy if exists "Anyone can subscribe" on subscribers;
create policy "Anyone can subscribe" on subscribers for insert to anon, authenticated with check (true);
drop policy if exists "Admins read subscribers" on subscribers;
create policy "Admins read subscribers" on subscribers for select to authenticated using (true);
drop policy if exists "Admins delete subscribers" on subscribers;
create policy "Admins delete subscribers" on subscribers for delete to authenticated using (true);

-- 5) image storage (1 GB free): new uploads become fast, cacheable, Google-indexable image URLs
insert into storage.buckets (id, name, public) values ('prompt-images', 'prompt-images', true) on conflict (id) do nothing;
drop policy if exists "Public read prompt images" on storage.objects;
create policy "Public read prompt images" on storage.objects for select using (bucket_id = 'prompt-images');
drop policy if exists "Admins upload prompt images" on storage.objects;
create policy "Admins upload prompt images" on storage.objects for insert to authenticated with check (bucket_id = 'prompt-images');
drop policy if exists "Admins update prompt images" on storage.objects;
create policy "Admins update prompt images" on storage.objects for update to authenticated using (bucket_id = 'prompt-images');
drop policy if exists "Admins delete prompt images" on storage.objects;
create policy "Admins delete prompt images" on storage.objects for delete to authenticated using (bucket_id = 'prompt-images');
