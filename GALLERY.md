# Gallery uploads

Put each album in `public/assets/gallery/<category>/<album>/`:

```text
public/assets/gallery/eventos/boda-maria/01.jpg
public/assets/gallery/eventos/boda-maria/02.webp
public/assets/gallery/retratos/jose-rivera/retrato-1.jpg
public/assets/gallery/negocios/redbar/cocteles.jpg
```

Supported formats: JPG, JPEG, PNG, WebP, and AVIF. Folder names become the category and album titles. Use descriptive file names for image alt text; number filenames to control display order. Category and album routes are created from these folders at build time. Run `npm run dev` to preview locally, and rebuild/redeploy the static site for uploads to appear online.