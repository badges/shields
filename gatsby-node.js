/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

const fs = require('fs')
const yaml = require('js-yaml')

const { services, categories } = yaml.safeLoad(
  fs.readFileSync('./service-definitions.yml', 'utf8')
)

async function createPages({ actions: { createPage } }) {
  categories.forEach(category => {
    const { id } = category
    createPage({
      path: `/category/${id}`,
      component: require.resolve('./frontend/components/main'),
      context: { category },
    })
  })
}

module.exports = { createPages }
