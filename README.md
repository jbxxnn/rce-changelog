# Team Log

A shared changelog for your team — website updates, marketing changes, product
tweaks, anything worth logging. Everyone who has the link can view and add
entries. No login required.

## Deploy it (one time setup, ~5 minutes)

1. **Put this folder on GitHub.**
   - Create a new repository at github.com, and upload this folder to it
     (drag-and-drop works fine on github.com if you don't use git).

2. **Import it into Vercel.**
   - Go to vercel.com → **Add New → Project** → pick the repository you just
     created → click **Deploy**. Don't worry about any settings, the defaults
     are correct.
   - The first deploy will finish, but the page won't work fully yet — it
     needs a place to store entries. That's the next step.

3. **Add storage.**
   - In your new Vercel project, go to the **Storage** tab → **Create
     Database** → choose **KV** (Vercel's built-in key-value store, powered
     by Upstash) → follow the prompts to create it and connect it to this
     project.
   - Vercel will automatically add the connection details your app needs —
     you don't have to copy/paste anything.

4. **Redeploy.**
   - Go to the **Deployments** tab → click the **⋯** menu on the latest
     deployment → **Redeploy**. This picks up the storage connection.

5. **Open the link Vercel gives you** (something like
   `team-log.vercel.app`) — that's the page everyone on your team can
   bookmark and use.

## Using it day to day

- Click **+ New entry**, fill in what changed, pick a category, add your
  name, click **Log it**.
- Use the filter chips or search box to find past entries.
- No further setup needed — anyone with the link can read and add entries.

## If something breaks

- **Page loads but "+ New entry" fails to save:** the Storage step (3–4
  above) was probably skipped or needs a redeploy.
- **Want to restrict who can add entries:** this version is open to anyone
  with the link, by design (simplicity for a small team). Adding a
  password or login is possible but is a separate step — ask if you want
  that added.
# rce-changelog
