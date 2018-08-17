'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')

const circleSchema = Joi.array()
  .items(Joi.object({ status: Joi.string().required() }))
  .min(1)
  .required()

module.exports = class CircleCi extends BaseJsonService {
  async fetch({ token, vcsType, userRepo, branch }) {
    let url = `https://circleci.com/api/v1.1/project/${vcsType}/${userRepo}`
    if (branch != null) {
      url += `/tree/${branch}`
    }
    const query = { filter: 'completed', limit: 1 }
    if (token) {
      query['circle-token'] = token
    }
    return this._requestJson({
      url,
      schema: circleSchema,
      options: { qs: query },
      errorMessages: { 404: 'project not found' },
    })
  }

  static render({ status, color }) {
    return { message: status, color: color }
  }

  static transform(data) {
    let passCount = 0
    let circleStatus, shieldsStatus, color

    for (let i = 0; i < data.length; i++) {
      circleStatus = data[i].status
      if (['success', 'fixed'].includes(circleStatus)) {
        passCount++
      } else if (circleStatus === 'failed') {
        shieldsStatus = 'failed'
        color = 'red'
        return { status: shieldsStatus, color: color }
      } else if (['no_tests', 'scheduled', 'not_run'].includes(circleStatus)) {
        color = 'yellow'
        shieldsStatus = circleStatus.replace('_', ' ')
        return { status: shieldsStatus, color: color }
      } else {
        color = 'lightgrey'
        shieldsStatus = circleStatus.replace('_', ' ')
        return { status: shieldsStatus, color: color }
      }
    }

    if (passCount === data.length) {
      color = 'brightgreen'
      shieldsStatus = 'passing'
    }

    return { status: shieldsStatus, color: color }
  }

  async handle({ token, vcsType, userRepo, branch }) {
    const json = await this.fetch({ token, vcsType, userRepo, branch })
    const { status, color } = this.constructor.transform(json)
    return this.constructor.render({ status, color })
  }

  // Metadata
  static get defaultBadgeData() {
    return { label: 'build' }
  }

  static get category() {
    return 'build'
  }

  static get url() {
    return {
      base: 'circleci',
      format:
        '(?:token/(w+))?[+/]?project/(?:(github|bitbucket)/)?([^/]+/[^/]+)(?:/(.*))?',
      capture: ['token', 'vcsType', 'userRepo', 'branch'],
    }
  }

  static get examples() {
    return [
      {
        title: 'CircleCI',
        previewUrl: 'project/github/RedSparr0w/node-csgo-parser',
      },
      {
        title: 'CircleCI branch',
        previewUrl: 'project/github/RedSparr0w/node-csgo-parser/master',
      },
      {
        title: 'CircleCI token',
        previewUrl: 'project/github/RedSparr0w/node-csgo-parser/master',
        exampleUrl:
          'token/YOURTOKEN/project/github/RedSparr0w/node-csgo-parser/master',
      },
    ]
  }
}
