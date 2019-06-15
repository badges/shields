'use strict'

const Joi = require('@hapi/joi')
const { isBuildStatus, renderBuildStatusBadge } = require('../build-status')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  subject: Joi.string().required(),
  status: Joi.alternatives()
    .try(isBuildStatus, Joi.equal('unknown'))
    .required(),
}).required()
const queryParamSchema = Joi.object({
  task: Joi.string(),
  script: Joi.string(),
}).required()

module.exports = class Cirrus extends BaseJsonService {
  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'cirrus',
      pattern: 'github/:user/:repo/:branch*',
      queryParamSchema,
    }
  }

  static get examples() {
    return [
      {
        title: 'Cirrus CI - Base Branch Build Status',
        namedParams: { user: 'flutter', repo: 'flutter' },
        pattern: 'github/:user/:repo',
        queryParams: { task: 'analyze', script: 'test' },
        staticPreview: this.render({ status: 'passing' }),
      },
      {
        title: 'Cirrus CI - Specific Branch Build Status',
        pattern: 'github/:user/:repo/:branch',
        namedParams: { user: 'flutter', repo: 'flutter', branch: 'master' },
        queryParams: { task: 'analyze', script: 'test' },
        staticPreview: this.render({ status: 'passing' }),
      },
      {
        title: 'Cirrus CI - Specific Task Build Status',
        pattern: 'github/:user/:repo',
        queryParams: { task: 'analyze' },
        namedParams: { user: 'flutter', repo: 'flutter' },
        staticPreview: this.render({ subject: 'analyze', status: 'passing' }),
      },
      {
        title: 'Cirrus CI - Task and Script Build Status',
        pattern: 'github/:user/:repo',
        queryParams: { task: 'analyze', script: 'test' },
        namedParams: {
          user: 'flutter',
          repo: 'flutter',
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

  async handle({ user, repo, branch }, { script, task }) {
    const json = await this._requestJson({
      schema,
      url: `https://api.cirrus-ci.com/github/${user}/${repo}.json`,
      options: { qs: { branch, script, task } },
    })

    return this.constructor.render(json)
  }
}
