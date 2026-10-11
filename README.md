# PromptHub

Free AI image prompt library. Plain HTML, CSS and JavaScript, backed by Supabase (Postgres database + Authentication) for live content — no server code of your own to write or host, and no credit card ever required on Supabase's free plan.

## Run it
Double-click `index.html`, or run `npx serve .` for a local server. You'll need Supabase connected (below) to see real content — without it, the site shows the starter prompts baked into `js/data.js`.

## Files
```
index.html              the public website
admin.html               your admin page (add/edit prompts and images)
css/style.css            all styles
js/supabase-config.js    YOUR Supabase project's URL + anon key (paste in after setup)
js/data.js               starter/fallback content only — not what visitors normally see
js/core.js               shared constants, helpers, and the Supabase connection
js/app.js                site logic: search, filters, modal, copy
js/admin.js              admin page logic: sign-in + database read/write
images/                  optional: your own image files
favicon.svg
```

## How content works now
Adding, editing or deleting a prompt in the admin panel writes straight to your Supabase database — **visitors see it immediately**, with no download, no git push, no redeploy. `js/data.js` is only a fallback: the starter content shown before Supabase is connected, and what "Seed database" (in the admin panel) loads in the first time.

## Setting up Supabase (one-time, free, no credit card)
1. Go to **supabase.com** → sign up (GitHub sign-in is easiest) → **New project** → give it a name and a database password (you won't need the password day-to-day — Supabase stores it) → pick a region near you → Create project. Wait a minute or two while it provisions.
2. **Settings (gear icon) → API.** Copy the **Project URL** and the **anon public** key into `js/supabase-config.js` in this project.
3. **SQL Editor → New query**, paste this in, and click **Run**:
   ```sql
   create table prompts (
     id bigint primary key,
     title text not null,
     image text default '',
     category text not null,
     tags text[] default '{}',
     badge text default '',
     prompt text not null
   );
   create table config (
     id text primary key default 'site',
     email text default '',
     whatsapp text default '',
     socials jsonb default '{}'
   );
   insert into config (id) values ('site') on conflict do nothing;

   alter table prompts enable row level security;
   alter table config enable row level security;

   create policy "Public can read prompts" on prompts for select using (true);
   create policy "Admins can insert prompts" on prompts for insert to authenticated with check (true);
   create policy "Admins can update prompts" on prompts for update to authenticated using (true) with check (true);
   create policy "Admins can delete prompts" on prompts for delete to authenticated using (true);

   create policy "Public can read config" on config for select using (true);
   create policy "Admins can insert config" on config for insert to authenticated with check (true);
   create policy "Admins can update config" on config for update to authenticated using (true) with check (true);
   ```
   This means anyone can view prompts (needed for the public site), but only a signed-in admin can add, edit or delete. This is real, server-enforced security — not a cosmetic lock.
4. **Authentication → Users → Add user.** Enter your admin email and a password, and check **Auto Confirm User** (so there's no email verification step) → Create user. This is what you'll sign in with on `admin.html`.
5. Deploy the site as usual (push to GitHub, Vercel redeploys). Open `admin.html`, sign in, and click **Seed database** once to load the starter prompts — after that, everything you add goes live directly.

Note: a free Supabase project pauses itself after 7 days with zero traffic, and wakes up again (a couple of seconds' delay) on the next visit — a non-issue for a site getting any regular visitors.

## Where is the admin panel?
Open `admin.html`, or click the small **Admin** link at the bottom of the website footer. It asks for the email and password of the Supabase user you created in setup step 4. Use **Sign out** to lock it again.

### Changing the admin login
Go to Supabase dashboard → Authentication → Users, and edit or add a user there. There's nothing to change in the code.

## Add a new prompt (step by step)
1. Open `admin.html` and sign in.
2. Fill in the title, category, tags and the full prompt. Upload a reference image (it is resized automatically).
3. Click **Add prompt**. It's live on the public site immediately — no further steps.

Tip: use the "Contact and social links" box in the admin page to set your email, WhatsApp and social URLs — saved the same way, live right away, and that's what the "Hire me" buttons use.

## Edit by hand (advanced)
Prompts live in the database, not a file — edit them directly in Supabase dashboard → Table Editor → the `prompts` table, or just use `admin.html`. Each prompt row looks like:
```js
{id: 15, title: "My Prompt", image: "images/my-prompt.jpg", category: "Cinematic",
 tags: ["portrait","rain"], badge: "TRENDING", prompt: "Full prompt text..."}
```
`badge` can be `"TRENDING"`, `"NEW"`, `"EDITOR'S PICK"` or `""`. Leave `image` empty to get generated placeholder art.

## Deploy for free
- **Netlify:** go to app.netlify.com/drop and drag the whole project folder in.
- **GitHub Pages:** push the folder to a repo, then Settings > Pages > deploy from the main branch.
- **Vercel:** `npx vercel` in the project folder, or connect the GitHub repo on vercel.com.
You only need to redeploy when you change the site's code (files in this project) — not for everyday content changes, which go straight to the database.

## Backing up your content
The admin page has two safety-net buttons, separate from everyday editing:
- **Backup (.json)** — downloads everything currently in the database (prompts, email, social links). Keep it somewhere safe. **Restore backup** loads a backup file back into the database — handy for recovering from a mistake or moving to a new Supabase project.
- **Export fallback data.js** — optional. Downloads a snapshot of your live content in the same format as `js/data.js`, in case you want to update the offline fallback/seed file in your repo too.

## Notes
- Supabase's free tier (500MB database, unlimited API requests) is generous for a project this size — you're unlikely to hit it.
- There's no practical per-row size limit, but the admin panel still resizes uploaded images automatically to keep the database lean.
- For a very large image library, put image files in `images/` (deployed with the site) and use their paths in the `image` field instead of uploading through the admin panel.
