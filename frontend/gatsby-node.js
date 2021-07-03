'use strict'

/*
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

const fs = require('fs')
const yaml = require('js-yaml')
const envFlag = require('node-env-flag')

const includeDevPages = envFlag(process.env.INCLUDE_DEV_PAGES, true)

const { categories } = yaml.load(
  fs.readFileSync('./service-definitions.yml', 'utf8')
)

// Often in Gatsby context gets piped through GraphQL, but GraphQL adds
// unnecessary complexity here, so this uses the programmatic API.
// https://www.gatsbyjs.org/docs/using-gatsby-without-graphql/#the-approach-fetch-data-and-use-gatsbys-createpages-api
async function createPages({ actions: { createPage } }) {
  if (includeDevPages) {
    createPage({
      path: '/dev/styles',
      component: require.resolve('./components/development/style-page.tsx'),
    })
    createPage({
      path: '/dev/logos',
      component: require.resolve('./components/development/logo-page.tsx'),
    })
  }

  categories.forEach(category => {
    const { id } = category
    createPage({
      path: `/category/${id}`,
      component: require.resolve('./components/main.tsx'),
      // `context` provided here becomes `props.pageContext` on the page.
      context: { category },
    })
  })
}

module.exports = { createPages }
