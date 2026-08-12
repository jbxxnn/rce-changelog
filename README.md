# Team Log

A shared changelog for your team — website updates, marketing changes, product
tweaks, anything worth logging. Only people signed in with a **@re-circuit.com**
Google account can view or add entries.

## Deploy it (one time setup, ~20–30 minutes because of the sign-in step)

### 1. Put this folder on GitHub
Create a new repository at github.com, and upload this folder to it
(drag-and-drop works fine on github.com if you don't use git).

### 2. Import it into Vercel
Go to vercel.com → **Add New → Project** → pick the repository you just
created → click **Deploy**. Don't worry about any settings, the defaults are
correct. The first deploy will finish, but the page won't fully work yet —
it needs storage and sign-in set up. That's the next two sections.

### 3. Add storage (Upstash)
In your Vercel project, go to the **Storage** tab → **Browse Storage** →
under **Marketplace Database Providers**, choose **Upstash** → pick
**Redis** → create a database. When the "Configure" dialog appears:
- Leave **Custom Environment Variable Prefix** blank.
- Click **Connect Project**.

### 4. Set up Google sign-in
This restricts the app to your organization's Google accounts.

**a) Create OAuth credentials in Google Cloud Console**
1. Go to [console.cloud.google.com](https://console.cloud.google.com) and
   create a new project (or pick an existing one) — top left project
   selector → **New Project**.
2. Go to **APIs & Services → OAuth consent screen**.
   - User type: choose **Internal** (this option only appears for Google
     Workspace organizations, and means only people at re-circuit.com can
     ever see the sign-in screen — an extra layer of safety on top of the
     app's own check).
   - Fill in an app name (e.g. "Team Log") and your email, then save.
3. Go to **APIs & Services → Credentials → + Create Credentials → OAuth
   client ID**.
   - Application type: **Web application**.
   - Under **Authorized redirect URIs**, add:
     `https://YOUR-VERCEL-DOMAIN/api/auth/callback/google`
     (use the domain Vercel gave you in step 2 — you can add the real one
     now and skip local testing, or add `http://localhost:3000/api/auth/callback/google`
     too if you want to run it on your own machine first).
   - Click **Create**. Copy the **Client ID** and **Client Secret** shown —
     you'll need them next.

**b) Add environment variables in Vercel**
Go to your Vercel project → **Settings → Environment Variables** and add:

| Name | Value |
|---|---|
| `GOOGLE_CLIENT_ID` | the Client ID from step 4a |
| `GOOGLE_CLIENT_SECRET` | the Client Secret from step 4a |
| `NEXTAUTH_SECRET` | any long random string — generate one at https://generate-secret.vercel.app/32 |
| `NEXTAUTH_URL` | `https://YOUR-VERCEL-DOMAIN` (no trailing slash) |

Apply all four to **Production** (and Preview too, if you want preview
deployments to work).

### 5. Redeploy
Go to **Deployments** → **⋯** on the latest one → **Redeploy**. This picks
up both the storage and sign-in setup.

### 6. Open the link
Visit the domain Vercel gave you — you'll be asked to sign in with Google.
Only @re-circuit.com accounts will get in.

## Using it day to day

- Sign in once with your @re-circuit.com Google account — your browser
  will stay signed in after that.
- Click **+ New entry**, fill in what changed, pick a category, click
  **Log it**. Your name is filled in automatically from your Google
  account — nothing to type.
- Use the filter chips or search box to find past entries.

## If something breaks

- **"Failed to parse URL" or Redis errors:** the Upstash connection (step
  3) needs a redeploy, or wasn't actually linked to this project — check
  Storage → your database → connected projects.
- **Stuck on the sign-in screen / "Access blocked":** double check the
  redirect URI in Google Cloud Console matches your real Vercel domain
  exactly, and that `NEXTAUTH_URL` in Vercel matches too.
- **A non-re-circuit.com email tries to sign in:** they'll be rejected
  automatically — the app only accepts @re-circuit.com addresses. This is
  set in `pages/api/auth/[...nextauth].js` if you ever need to change the
  allowed domain.
