# MY POD hive website

Static website (HTML + GSAP + Three.js) with a free, Git-based admin panel (Sveltia CMS).

## Folders
- `index.html`: the whole website
- `images/`: product photos (`images/uploads/` receives photos you upload from the admin)
- `js/`: GSAP, ScrollTrigger, Three.js and the 3D studio
- `data/products.json`: the product catalogue (edited from the admin)
- `admin/`: the admin panel (`index.html` + `config.yml`)

## Publish free (Cloudflare Pages, recommended)
1. Upload everything in this folder to a new GitHub repository (index.html at the top level).
2. In `admin/config.yml`, change `repo:` to `your-github-username/your-repo-name` and commit.
3. Go to dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git → choose the repository.
4. Framework preset: None. Build command: leave empty. Build output directory: `/`. Deploy.
5. Your site is live at `https://your-project.pages.dev`. Every change committed to GitHub redeploys automatically.

GitHub Pages also works: repository Settings → Pages → Deploy from branch → main → / (root).

## Manage products (admin)
1. Create a GitHub token once: github.com → Settings → Developer settings → Personal access tokens →
   Fine-grained tokens → Generate new token. Repository access: only this repository.
   Permissions: Contents → Read and write. Copy the token.
2. Open `https://your-site/admin/` → "Sign in with Token" → paste the token.
3. Open Products → Product catalogue. Edit text, prices and specs, drag products to reorder,
   untick "Show on website" to hide one, and upload photos in Hero / Card / Gallery.
4. Click Save. The site updates within a minute or two (after the automatic redeploy).

Photo tips: JPG or WEBP, 1920 px or wider for hero photos, under 20 MB each, file names without spaces.
Keep your token private. If it leaks, delete it on GitHub and create a new one.
