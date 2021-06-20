import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService, NotFound } from '../index.js'

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

export default class BaseMicrobadgerService extends BaseJsonService {
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
