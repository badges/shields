'use strict'

const Joi = require('joi')
const { BaseJsonService } = require('..')
const { metric } = require('../text-formatters')

const schema = Joi.any()

module.exports = class WaffleLabel extends BaseJsonService {
  static get category() {
    return 'issue-tracking'
  }

  static get route() {
    return {
      base: 'waffle/label',
      pattern: ':user/:repo/:label?',
    }
  }

  static get defaultBadgeData() {
    return { label: 'waffle' }
  }

  static render({ label, color, count }) {
    if (count === 'absent') {
      return { message: count }
    }
    if (count === 0) {
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
          user: 'evancohen',
          repo: 'smart-mirror',
          label: 'status: in progress',
        },
        staticPreview: {
          label: 'status: in progress',
          message: '2',
          color: '000',
        },
      },
    ]
  }

  async fetch({ user, repo }) {
    const url = `https://api.waffle.io/${user}/${repo}/columns?with=count`
    return this._requestJson({
      schema,
      url,
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

  async handle({ user, repo, label = 'ready' }) {
    const json = await this.fetch({ user, repo })
    const { count, color } = this.transform({ json, label })
    return this.constructor.render({ label, color, count })
  }
}
