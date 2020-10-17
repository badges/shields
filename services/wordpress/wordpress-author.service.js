'use strict'

const BaseWordpress = require('./wordpress-base')

const extensionData = {
  plugin: {
    capt: 'Plugin',
    exampleSlug: 'akismet',
  },
  theme: {
    capt: 'Theme',
    exampleSlug: 'twentytwenty',
  },
}

function AuthorForType(extensionType) {
  const { capt, exampleSlug } = extensionData[extensionType]

  return class WordpressAuthor extends BaseWordpress {
    static name = `Wordpress${capt}Author`

    static category = 'social'

    static route = {
      base: `wordpress/${extensionType}/author`,
      pattern: ':slug',
    }

    static examples = [
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

    static defaultBadgeData = {
      label: 'author',
      namedLogo: 'wordpress',
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

const authorModules = ['plugin', 'theme'].map(AuthorForType)
module.exports = authorModules
