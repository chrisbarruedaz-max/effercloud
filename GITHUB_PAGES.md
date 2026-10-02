# GitHub Pages deployment

The Astro site deploys below the repository's existing root page:

`https://chrisbarruedaz-max.github.io/effer-glass.github.io/effer_glass_cloud/`

The workflow in `.github/workflows/deploy-effer-glass.yml` builds Astro and stages its output in `effer_glass_cloud/`, while preserving the existing root `index.html`. Push updates to `main` to publish them.

In the repository settings, select **Settings → Pages → Build and deployment → Source → GitHub Actions**. Local development continues to use the root path.