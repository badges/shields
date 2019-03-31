'use strict'

const Joi = require('joi')
const { BaseJsonService } = require('..')
const { Deprecated } = require('..')
const { metric } = require('../text-formatters')
const { nonNegativeInteger } = require('../validators')

const schema = Joi.array()
  .items(
    Joi.object({
      label: Joi.object({
        name: Joi.string().required(),
        color: Joi.string().hex(),
      }).allow(null),
      count: nonNegativeInteger,
    })
  )
  .required()

module.exports = class WaffleLabel extends BaseJsonService {
  static get category() {
    return 'issue-tracking'
  }

  static get route() {
    return {
      base: 'waffle/label',
      pattern: ':user/:repo/:label',
    }
  }

  static get defaultBadgeData() {
    return { label: 'waffle' }
  }

  static get isDeprecated() {
    const now = new Date()
    return now.getTime() >= new Date('2019-05-16')
  }

  static render({ label, color, count }) {
    if (count === 'absent') {
      return { message: count }
    }
    if (count === 0 || !color) {
      color = '78bdf2'
    }
    return {
      label,
      message: metric(count),
      color,
    }
  }

  static get examples() {
    return [
      {
        title: 'Waffle.io Label',
        namedParams: {
          user: 'ritwickdey',
          repo: 'vscode-live-server',
          label: 'closed',
        },
        staticPreview: this.render({
          label: 'closed',
          count: 2145,
          color: 'A3D3F8',
        }),
      },
    ]
  }

  async fetch({ user, repo }) {
    const url = `https://api.waffle.io/${user}/${repo}/columns`
    return this._requestJson({
      schema,
      url,
      options: { qs: { with: 'count' } },
      errorMessages: {
        404: 'project not found',
      },
    })
  }

  transform({ json, label }) {
    if (json.length === 0) {
      return { count: 'absent' }
    }

    for (const col of json) {
      if (col.label && col.label.name === label) {
        return {
          count: col.count,
          color: col.label.color,
        }
      }
    }

    return { count: 0 }
  }

  async handle({ user, repo, label }) {
    if (this.constructor.isDeprecated) {
      throw new Deprecated()
    }
    const json = await this.fetch({ user, repo })
    const { count, color } = this.transform({ json, label })
    return this.constructor.render({ label, color, count })
  }
}
