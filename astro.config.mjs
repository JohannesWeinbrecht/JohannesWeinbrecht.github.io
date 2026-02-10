// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://JohannesWeinbrecht.github.io',
    base: 'JohannesWeinbrecht.github.io',
	integrations: [mdx(), sitemap()],
	experimental: {
        fonts: [{
            provider: fontProviders.google(),
            name: "Comfortaa",
            cssVariable: "--font-comfortaa"
        }]
	}
});
