# PromptHub

Free AI image prompt library. Plain HTML, CSS and JavaScript. No build step, no backend, no database.

## Run it
Double-click `index.html`. That's it. (Or run `npx serve .` for a local server.)

## Files
```
index.html        the public website
admin.html        your admin page (add/edit prompts and images)
css/style.css     all styles
js/data.js        YOUR CONTENT: prompts, email, social links
js/core.js        shared constants and helpers
js/app.js         site logic: search, filters, modal, copy
js/admin.js       admin page logic
images/           optional: your own image files
favicon.svg
```

## Where is the admin panel?
Open `admin.html` (in the same folder as `index.html`), or click the small **Admin** link at the very bottom of the website footer.
It asks for the **admin email and phone number** before showing anything. These are fixed in `js/data.js` (as hashes, not plain text) — not something a visitor can set up themselves. Use **Lock** to sign out.

**Important, read this:** there is no server, so this sign-in is a lock on the page itself, not real server security — a technical person could bypass it. That still cannot change your live website, because publishing requires uploading `data.js` to your hosting account, and that is protected by your host login (Netlify, GitHub, Vercel). Use a strong password on your hosting account — that's what actually protects the site.

### Changing the admin login
The email and phone are stored as SHA-256 hashes in `js/data.js` (`CONFIG.adminEmailHash` / `adminPhoneHash`), so the plain values don't sit in the page source. To change them, generate new hashes and paste them in:
```js
async function hash(s){const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode("prompthub:v1:"+s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")}
hash("email:youremail@example.com").then(console.log)   // -> adminEmailHash
hash("phone:01XXXXXXXXX").then(console.log)              // -> adminPhoneHash (digits only, no spaces/dashes)
```
Run that in any browser console, then replace the two values in `CONFIG` and redeploy.

## Add a new prompt (step by step)
1. Open `admin.html`.
2. Fill in the title, category, tags and the full prompt. Upload a reference image (it is resized automatically).
3. Click **Add prompt**. Repeat for more prompts. Use **Preview draft** to see the site with your changes.
4. Click **Download data.js**.
5. Replace the file `js/data.js` in your project with the downloaded `data.js`.
6. Redeploy (see below). Done.

Tip: use the "Contact and social links" box in the admin page to set your email, WhatsApp and social URLs. They are saved into `data.js` too, so the "Hire me" buttons work.

## Edit by hand (no admin)
Open `js/data.js`. Each prompt looks like this:
```js
{id: 15, title: "My Prompt", image: "images/my-prompt.jpg", category: "Cinematic",
 tags: ["portrait","rain"], badge: "TRENDING", prompt: "Full prompt text..."}
```
`badge` can be `"TRENDING"`, `"NEW"`, `"EDITOR'S PICK"` or `""`. Leave `image` empty to get generated placeholder art.

## Deploy for free
- **Netlify:** go to app.netlify.com/drop and drag the whole project folder in.
- **GitHub Pages:** push the folder to a repo, then Settings > Pages > deploy from the main branch.
- **Vercel:** `npx vercel` in the project folder.
After the first deploy, updating content means replacing `js/data.js` (and any new files in `images/`) and deploying again.

## Backing up your work
The admin page has two different download buttons — they do different jobs:
- **Download data.js** — publishes your changes. Replace `js/data.js` with this file and redeploy.
- **Backup draft (.json)** — a private safety copy of your in-progress work (including unfinished edits and draft images), separate from the live site. Keep it somewhere safe. **Restore backup** loads it back in — handy if you clear your browser's data, switch computers, or want to hand off editing to another device.

## Notes
- Your admin draft is stored on this device using IndexedDB (much roomier than old-style browser storage), so dozens of uploaded images are comfortable — but it still only lives on this device/browser until you back it up. For very large libraries, put image files in `images/` and use their paths instead of uploading.
- Download `data.js` (to publish) or Backup draft (to keep a safety copy) before clearing browser data or switching computers.
- The "Preview draft" button works best when `index.html` and `admin.html` are opened the same way (both from a local server or both from your deployed site).
