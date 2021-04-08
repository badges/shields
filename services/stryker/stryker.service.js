'use strict'

const Joi = require('joi')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  message: Joi.string().required(),
  color: Joi.string().required(),
  label: Joi.string().required(),
}).required()

module.exports = class Stryker extends BaseJsonService {
  static category = 'analysis'
  static route = {
    base: 'stryker',
    pattern: ':user/:repo/:branch*',
  }

  static examples = [
    {
      title: 'Stryker Mutator',
      namedParams: {
        user: 'tiagoporto',
        repo: 'gerador-validador-cpf',
        branch: 'main',
      },
      staticPreview: this.render({
        color: 'green',
        label: 'Mutation score',
        message: '93.4%',
      }),
    },
  ]

  static defaultBadgeData = { label: 'Mutation score' }

  static render(data) {
    return data
  }

  async handle({ user, repo, branch = 'main' }) {
    const data = await this._requestJson({
      schema,
      url: `https://badge-api.stryker-mutator.io/github.com/${user}/${repo}/${branch}`,
    })
    return this.constructor.render(data)
  }
}
