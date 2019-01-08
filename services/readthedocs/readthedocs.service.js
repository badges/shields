'use strict'

const Joi = require('joi')
const BaseSvgScrapingService = require('../base-svg-scraping')
const { NotFound } = require('../errors')

const keywords = ['documentation']

const schema = Joi.object({
  message: Joi.string().required(),
}).required()

module.exports = class ReadTheDocs extends BaseSvgScrapingService {
  static get category() {
    return 'build'
  }

  static get route() {
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
        pattern: ':packageName',
        namedParams: { packageName: 'pip' },
        staticPreview: this.render({ status: 'passing' }),
        keywords,
      },
      {
        title: 'Read the Docs (version)',
        pattern: ':packageName/:version',
        namedParams: { packageName: 'pip', version: 'stable' },
        staticPreview: this.render({ status: 'passing' }),
        keywords,
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
      schema,
      url: `https://readthedocs.org/projects/${encodeURIComponent(
        project
      )}/badge/`,
      options: { qs: { version } },
    })
    if (status === 'unknown') {
      throw new NotFound({
        prettyMessage: 'project or version not found',
      })
    }
    return this.constructor.render({ status })
  }
}
