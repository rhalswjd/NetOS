import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import remarkMermaid from './scripts/remark-mermaid.mjs';
import { unified } from '@astrojs/markdown-remark';
import { deploymentConfig } from './src/lib/deployment.ts';
const { site, base, repoUrl } = deploymentConfig();
export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  output: 'static',
  devToolbar: { enabled: false },
  markdown: { processor: unified({ remarkPlugins: [remarkMermaid] }) },
  integrations: [
    starlight({
      title: 'NetOS',
      disable404Route: true,
      description:
        'A personal archive of systems, connections, and understanding.',
      customCss: ['./src/styles/global.css', './src/styles/docs.css'],
      components: {
        Header: './src/components/Header.astro',
        PageTitle: './src/components/DocTitle.astro',
        Footer: './src/components/DocFooter.astro',
      },
      editLink: repoUrl ? { baseUrl: `${repoUrl}/edit/main/` } : undefined,
      sidebar: [
        {
          label: 'Explore',
          items: [
            { label: 'Network', link: '/network/' },
            { label: 'Operating System', link: '/os/' },
          ],
        },
        {
          label: 'Network concepts',
          items: [{ autogenerate: { directory: 'network/topics' } }],
        },
        {
          label: 'Operating systems',
          items: [{ autogenerate: { directory: 'os/topics' } }],
        },
        { label: 'Labs', items: [{ autogenerate: { directory: 'labs' } }] },
        {
          label: 'Research',
          items: [{ autogenerate: { directory: 'research' } }],
        },
        {
          label: 'Problems',
          items: [{ autogenerate: { directory: 'problems' } }],
        },
      ],
    }),
  ],
});
