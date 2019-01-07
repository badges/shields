'use strict'

const BaseJsonService = require('../base-json')
const Joi = require('joi')
const { NotFound } = require('../errors')

// source: https://github.com/badges/shields/pull/1362#discussion_r161693830
const statusCodes = {
  0: { color: '#5183A0', label: 'waiting' },
  10: { color: '#5183A0', label: 'queued' },
  20: { color: '#5183A0', label: 'processing' },
  30: { color: '#44CC11', label: 'success' },
  40: { color: '#F8A97D', label: 'skipped' },
  50: { color: '#CEA61B', label: 'unstable' },
  60: { color: '#555555', label: 'timeout' },
  70: { color: '#6BAFBD', label: 'cancelled' },
  80: { color: '#DC5F59', label: 'failed' },
  90: { color: '#555555', label: 'stopped' },
}

const schema = Joi.array()
  .items(
    Joi.object({
      branchName: Joi.string().required(),
      statusCode: Joi.number()
        .valid(Object.keys(statusCodes).map(key => parseInt(key)))
        .required(),
    }).required()
  )
  .required()

module.exports = class Shippable extends BaseJsonService {
  async fetch({ projectId }) {
    const url = `https://api.shippable.com/projects/${projectId}/branchRunStatus`
    return this._requestJson({ schema, url })
  }

  static get defaultBadgeData() {
    return { label: 'shippable' }
  }

  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'shippable',
      format: '([^/]+)(?:/(.+))?',
      capture: ['projectId', 'branch'],
    }
  }

  static get examples() {
    return [
      {
        title: 'Shippable',
        pattern: ':projectId',
        namedParams: { projectId: '5444c5ecb904a4b21567b0ff' },
        staticPreview: this.render({ code: 30 }),
      },
      {
        title: 'Shippable branch',
        pattern: ':projectId/:branch',
        namedParams: {
          projectId: '5444c5ecb904a4b21567b0ff',
          branch: 'master',
        },
        staticPreview: this.render({ code: 30 }),
      },
    ]
  }

  static render({ code }) {
    return {
      label: 'build',
      message: statusCodes[code].label,
      color: statusCodes[code].color,
    }
  }

  async handle({ projectId, branch = 'master' }) {
    const data = await this.fetch({ projectId })
    const builds = data.filter(result => result.branchName === branch)
    if (builds.length === 0) {
      throw new NotFound({ prettyMessage: 'branch not found' })
    }
    return this.constructor.render({ code: builds[0].statusCode })
  }
}
