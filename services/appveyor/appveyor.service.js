'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')

const appVeyorSchema = Joi.object({
  build: Joi.object({
    status: Joi.string().required(),
  }),
}).required()

module.exports = class AppVeyor extends BaseJsonService {
  async fetch({ repo, branch }) {
    let url = `https://ci.appveyor.com/api/projects/${repo}`
    if (branch != null) {
      url += `/branch/${branch}`
    }
    return this._requestJson({
      schema: appVeyorSchema,
      url,
      notFoundMessage: 'project not found or access denied',
    })
  }

  static render({ status }) {
    if (status === 'success') {
      return { message: 'passing', color: 'brightgreen' }
    } else if (status !== 'running' && status !== 'queued') {
      return { message: 'failing', color: 'red' }
    } else {
      return { message: status }
    }
  }

  async handle({ repo, branch }) {
    const {
      build: { status },
    } = await this.fetch({ repo, branch })
    return this.constructor.render({ status })
  }

  // Metadata
  static get category() {
    return 'build'
  }

  static get url() {
    return {
      base: 'appveyor/ci',
      format: '([^/]+/[^/]+)(?:/(.+))?',
      capture: ['repo', 'branch'],
    }
  }

  static get examples() {
    return [
      {
        previewUrl: 'gruntjs/grunt',
      },
      {
        title: `${this.name} branch`,
        previewUrl: 'gruntjs/grunt/master',
      },
    ]
  }
}
