'use strict'

const Joi = require('joi')
const { isBuildStatus, renderBuildStatusBadge } = require('../build-status')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  message: Joi.alternatives()
    .try(isBuildStatus, Joi.equal('unknown'))
    .required(),
}).required()

module.exports = class Cirrus extends BaseJsonService {
  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'cirrus',
      pattern: '/github/:user/:repo',
    }
  }

  static get examples() {
    return [
      {
        title: 'Cirrus CI - Base Branch Build Status',
        namedParams: { user: 'flutter', repo: 'flutter' },
        staticPreview: this.render({ subject: 'Ci', status: 'passing' }),
      },
      {
        title: 'Cirrus CI - Specific Branch Build Status',
        pattern: '/github/:user/:repo/:branch',
        namedParams: { user: 'flutter', repo: 'flutter', branch: 'master' },
        staticPreview: this.render({ subject: 'Ci', status: 'passing' }),
      },
      {
        title: 'Cirrus CI - Specific Task Build Status',
        pattern: '/github/:user/:repo',
        queryParams: { task: 'analyze' },
        namedParams: { user: 'flutter', repo: 'flutter' },
        staticPreview: this.render({ subject: 'analyze', status: 'passing' }),
      },
      {
        title: 'Cirrus CI - Task and Script Build Status',
        pattern: '/github/:user/:repo',
        namedParams: {
          user: 'flutter',
          repo: 'flutter',
          task: 'analyze',
          script: 'test',
        },
        staticPreview: this.render({ subject: 'test', status: 'passing' }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'build' }
  }

  static render({ subject, status }) {
    return renderBuildStatusBadge({ label: subject, status })
  }

  async handle({ user, repo, branch}, { script, task }) {
    const json = await this._requestJson({
      schema,
      url: `https://api.cirrus-ci.com/${userRepo}.json`,
      options: { qs: { branch, script } },
      valueMatcher: />([^<>]+)<\/text><\/g>/,
    })

    return this.constructor.render(json)
  }
}
