'use strict'

const Joi = require('joi')
const { nonNegativeInteger } = require('../validators')
const { BaseJsonService, NotFound } = require('..')

const schema = Joi.object({
  LayerCount: nonNegativeInteger,
  // DownloadSize may be missing in some cases
  DownloadSize: Joi.number().integer().min(0),
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
        DownloadSize: Joi.number().integer().min(0),
      })
    )
    .required(),
}).required()

module.exports = class BaseMicrobadgerService extends BaseJsonService {
  static category = 'size'

  async fetch({ user, repo }) {
    if (user === '_') {
      user = 'library'
    }
    return this._requestJson({
      schema,
      url: `https://api.microbadger.com/v1/images/${user}/${repo}`,
    })
  }

  static getImage(response, tag) {
    if (!tag) {
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
