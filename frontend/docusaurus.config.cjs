const lightCodeTheme = require('prism-react-renderer').themes.github
const darkCodeTheme = require('prism-react-renderer').themes.dracula
const stripCodeBlockLinks = require('./src/plugins/strip-code-block-links')

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Shields.io',
  tagline: 'Concise, consistent, and legible badges',
  url: 'https://shields.io',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'badges',
  projectName: 'shields',

  themes: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
      ({
        hashed: true,
        indexPages: true,
      }),
    ],
  ],

  markdown: {
    mdx1Compat: {
      comments: true,
      admonitions: true,
      headingIds: true,
    },
  },

  presets: [
    [
      'docusaurus-preset-openapi',
      /** @type {import('docusaurus-preset-openapi').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.cjs'),
          editUrl: 'https://github.com/badges/shields/tree/master/frontend',
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/badges/shields/tree/master/frontend',
          onInlineAuthors: 'ignore',
          onUntruncatedBlogPosts: 'ignore',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        api: {
          path: 'categories',
          routeBasePath: 'badges',
          rehypePlugins: [stripCodeBlockLinks],
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('docusaurus-preset-openapi').ThemeConfig} */
    ({
      languageTabs: [],
      navbar: {
        title: 'Shields.io',
        logo: {
          alt: 'Shields Logo',
          src: 'img/logo.png',
        },
        items: [
          { to: '/badges', label: 'Badges', position: 'left' },
          {
            to: '/docs',
            label: 'Documentation',
            position: 'left',
          },
          { to: '/donate', label: 'Donate', position: 'left' },
          { to: '/community', label: 'Community', position: 'left' },
          { to: '/blog', label: 'Blog', position: 'left' },
          {
            href: 'https://github.com/badges/shields',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Community',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/badges/shields',
              },
              {
                label: 'Open Collective',
                href: 'https://opencollective.com/shields',
              },
              {
                label: 'Discord',
                href: 'https://discord.gg/HjJCwm5',
              },
              {
                label: 'Awesome Badges',
                href: 'https://github.com/badges/awesome-badges',
              },
            ],
          },
          {
            title: 'Stats',
            items: [
              {
                label: 'Service Status (Upptime)',
                href: 'https://badges.github.io/uptime-monitoring/',
              },
              {
                label: 'Service Status (NodePing)',
                href: 'https://nodeping.com/reports/status/YBISBQB254',
              },
              {
                label: 'Metrics dashboard',
                href: 'https://metrics.shields.io/',
              },
            ],
          },
          {
            title: 'Policy',
            items: [
              {
                label: 'Privacy Policy',
                href: '/privacy',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Shields.io. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
}

module.exports = config
