'use strict'

const Joi = require('@hapi/joi')
const { isBuildStatus, renderBuildStatusBadge } = require('../build-status')
const { BaseSvgScrapingService, NotFound } = require('..')

const keywords = ['documentation']

const schema = Joi.object({
  message: Joi.alternatives()
    .try(isBuildStatus, Joi.equal('unknown'))
    .required(),
}).required()

module.exports = class ReadTheDocs extends BaseSvgScrapingService {
  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'readthedocs',
      pattern: ':project/:version?',
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
    return renderBuildStatusBadge({ status })
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
