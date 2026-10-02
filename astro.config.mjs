// @ts-check
import { defineConfig } from 'astro/config';
import gallery from 'astro-gallery';

const githubPagesBase = '/effer-glass.github.io/effer_glass_cloud/';

// https://astro.build/config
export default defineConfig({
	site: 'https://chrisbarruedaz-max.github.io',
	base: process.env.GITHUB_ACTIONS === 'true' ? githubPagesBase : '/',
	integrations: [gallery({ locale: 'es' })],
});
