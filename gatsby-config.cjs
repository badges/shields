import path from 'path'
import { fileURLToPath } from 'url'

export const siteMetadata = {
  title: 'Shields.io: Quality metadata badges for open source projects',
  description:
    'We serve fast and scalable informational images as badges for GitHub, Travis CI, Jenkins, WordPress and many more services. Use them to track the state of your projects, or for promotional purposes.',
  author: '@shields_io',
}
export const plugins = [
  {
    resolve: 'gatsby-plugin-page-creator',
    options: {
      path: path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        'frontend',
        'pages'
      ),
    },
  },
  'gatsby-plugin-react-helmet',
  'gatsby-plugin-catch-links',
  'gatsby-plugin-styled-components',
  'gatsby-plugin-remove-trailing-slashes',
  'gatsby-plugin-typescript',
  // This currently is not being used.
  // {
  //   resolve: 'gatsby-source-filesystem',
  //   options: {
  //     name: 'static',
  //     path: `${path.dirname(fileURLToPath(import.meta.url))}/frontend/static`,
  //   },
  // },
]
