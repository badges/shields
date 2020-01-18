'use strict'

const Joi = require('@hapi/joi')
const { nonNegativeInteger } = require('../validators')
const { BaseJsonService, NotFound } = require('..')

const schema = Joi.object({
  LayerCount: nonNegativeInteger,
  // DownloadSize may be missing in some cases
  DownloadSize: Joi.number()
    .integer()
    .min(0),
  LatestVersion: Joi.string(),
  Versions: Joi.array()
    .items(
      Joi.object({
        Tags: Joi.array()
          .items(
            Joi.object({
              tag: Joi.string().required(),
            })
          )
          .required(),
        LayerCount: nonNegativeInteger,
        DownloadSize: Joi.number()
          .integer()
          .min(0),
      })
    )
    .required(),
}).required()

module.exports = class BaseMicrobadgerService extends BaseJsonService {
  static get category() {
    return 'size'
  }

  async fetch({ user, repo, tag }) {
    if (user === '_') {
      user = 'library'
    }
    let url = ''
    if (!tag) {
      url = `https://api.microbadger.com/v1/images/${user}/${repo}`
    } else {
      url = `https://api.microbadger.com/v1/images/${user}/${repo}:${tag}`
    }
    return this._requestJson({
      schema,
      url,
    })
  }

  static getImage(response, tag, versionlookup) {
    if (!tag || versionlookup) {
      return response
    }
    const image =
      response.Versions &&
      response.Versions.find(v => v.Tags.some(t => t.tag === tag))
    if (!image) {
      throw new NotFound()
    }
    return image
  }
}
