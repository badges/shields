'use strict'

const { NotFound } = require('..')
const BaseWordpress = require('./wordpress-base')

const extensionData = {
  plugin: {
    capt: 'Plugin',
    exampleSlug: 'bbpress',
  },
  theme: {
    capt: 'Theme',
    exampleSlug: 'twentytwenty',
  },
}

function AuthorForType(extensionType) {
  const { capt, exampleSlug } = extensionData[extensionType]

  return class WordpressAuthor extends BaseWordpress {
    static get category() {
      return 'social'
    }

    static get route() {
      return {
        base: `wordpress/${extensionType}/author`,
        pattern: ':slug',
      }
    }

    static get examples() {
      return [
        {
          title: `WordPress ${capt} Author`,
          namedParams: { slug: exampleSlug },
          staticPreview: {
            label: 'author',
            message: 'wordpress',
            style: 'social',
          },
        },
      ]
    }

    static get defaultBadgeData() {
      return {
        label: 'author',
        namedLogo: 'wordpress',
      }
    }

    static render({ author, link }) {
      return {
        label: 'author',
        message: author,
        namedLogo: 'wordpress',
        link,
      }
    }

    transform(rawAuthor) {
      return rawAuthor.substring(
        rawAuthor.lastIndexOf('">') + 2,
        rawAuthor.lastIndexOf('<')
      )
    }

    async handle({ slug }) {
      if (extensionType === 'plugin') {
        const { author: rawAuthor, author_profile: profile } = await this.fetch(
          {
            extensionType,
            slug,
          }
        )
        const author = this.transform(rawAuthor)
        return this.constructor.render({ author, link: profile })
      } else {
        const { author: rawAuthor } = await this.fetch({
          extensionType,
          slug,
        })
        const author = rawAuthor.display_name
        const profile = rawAuthor.profile
        return this.constructor.render({ author, link: profile })
      }
    }
  }
}

class WordpressPluginContributor extends BaseWordpress {
  static get category() {
    return 'social'
  }

  static get route() {
    return {
      base: `wordpress/plugin/contributor`,
      pattern: ':slug/:contributor',
    }
  }

  static get examples() {
    return [
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
  }

  static get defaultBadgeData() {
    return {
      label: 'contributor',
      namedLogo: 'wordpress',
    }
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

const authorModules = ['plugin', 'theme'].map(AuthorForType)
const modules = [...authorModules, WordpressPluginContributor]
module.exports = modules
