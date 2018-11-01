'use strict'

const BaseSvgScrapingService = require('../base-svg-scraping')
const { NotFound } = require('../errors')

module.exports = class ReadTheDocs extends BaseSvgScrapingService {
  static get category() {
    return 'build'
  }

  static get url() {
    return {
      base: 'readthedocs',
      format: '([^/]+)(?:/(.+))?',
      capture: ['project', 'version'],
    }
  }

  static get examples() {
    return [
      {
        title: 'Read the Docs',
        previewUrl: 'pip',
        urlPattern: ':package',
        staticExample: this.render({ status: 'passing' }),
        keywords: ['documentation'],
      },
      {
        title: 'Read the Docs (version)',
        previewUrl: 'pip/stable',
        urlPattern: ':package/:version',
        staticExample: this.render({ status: 'passing' }),
        keywords: ['documentation'],
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'docs',
    }
  }

  static render({ status }) {
    let color
    if (status === 'passing') {
      color = 'brightgreen'
    } else if (status === 'failing') {
      color = 'red'
    } else if (status === 'unknown') {
      color = 'yellow'
    } else {
      color = 'red'
    }
    return {
      message: status,
      color,
    }
  }

  async handle({ project, version }) {
    const { message: status } = await this._requestSvg({
      url: `https://readthedocs.org/projects/${encodeURIComponent(
        project
      )}/badge/`,
    })
    if (status === 'unknown') {
      throw new NotFound({ prettyMessage: 'project or build not found' })
    }
    return this.constructor.render({ status })
  }
}
