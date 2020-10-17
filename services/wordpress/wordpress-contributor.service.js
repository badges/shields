'use strict'

const { NotFound } = require('..')
const BaseWordpress = require('./wordpress-base')

class WordpressPluginContributor extends BaseWordpress {
  static category = 'social'

  static route = {
    base: `wordpress/plugin/contributor`,
    pattern: ':slug/:contributor',
  }

  static examples = [
    {
      title: `WordPress Plugin Contributor`,
      namedParams: { slug: 'akismet', contributor: 'automattic' },
      staticPreview: {
        label: 'contributor',
        message: 'wordpress',
        style: 'social',
      },
    },
  ]

  static defaultBadgeData = {
    label: 'contributor',
    namedLogo: 'wordpress',
  }

  static render({ contributor, link }) {
    return {
      label: 'contributor',
      message: contributor,
      namedLogo: 'wordpress',
      link,
    }
  }

  async handle({ slug, contributor }) {
    const { contributors } = await this.fetch({
      extensionType: 'plugin',
      slug,
    })

    if (contributor in contributors) {
      const data = contributors[contributor]
      return this.constructor.render({
        contributor: data.display_name,
        link: data.profile,
      })
    } else {
      throw new NotFound({ prettyMessage: 'Contributor not found in plugin' })
    }
  }
}

module.exports = [WordpressPluginContributor]
