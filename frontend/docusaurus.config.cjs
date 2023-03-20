const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Shields.io",
  tagline: "Concise, consistent, and legible badges in SVG and raster format",
  url: "https://shields.io",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "badges",
  projectName: "shields",

  themes: [
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
      ({
        hashed: true,
        indexPages: true,
      }),
    ],
  ],

  presets: [
    [
      "docusaurus-preset-openapi",
      /** @type {import('docusaurus-preset-openapi').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.cjs"),
          // Please change this to your repo.
          editUrl:
            "https://github.com/badges/shields/",
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            "https://github.com/badges/shields/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
        api: {
          path: 'categories',
          routeBasePath: 'badges',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('docusaurus-preset-openapi').ThemeConfig} */
    ({
      languageTabs: [],
      navbar: {
        title: "Shields.io",
        logo: {
          alt: "Shields Logo",
          src: "img/logo.png",
        },
        items: [
          { to: "/badges", label: "Badges", position: "left" },
          { to: "/community", label: "Community", position: "left" },
          {
            href: "https://github.com/badges/shields",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Community",
            items: [
              {
                label: "Discord",
                href: "https://discord.gg/HjJCwm5",
              },
              {
                label: "Twitter",
                href: "https://twitter.com/shields_io",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "Blog",
                to: "/blog",
              },
              {
                label: "GitHub",
                href: "https://github.com/badges/shields",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Shields.io, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
