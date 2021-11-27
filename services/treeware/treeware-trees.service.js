import crypto from 'crypto'
import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { floorCount } from '../color-formatters.js'
import { BaseJsonService } from '../index.js'

const apiSchema = Joi.object({
  total: Joi.number().required(),
}).required()

export default class TreewareTrees extends BaseJsonService {
  static category = 'other'

  static route = {
    base: 'treeware/trees',
    pattern: ':owner/:packageName',
  }

  static examples = [
    {
      title: 'Treeware (Trees)',
      namedParams: { owner: 'stoplightio', packageName: 'spectral' },
      staticPreview: this.render({ count: 250 }),
    },
  ]

  static defaultBadgeData = {
    label: 'trees',
  }

  static render({ count }) {
    return { message: metric(count), color: floorCount(count, 10, 50, 100) }
  }

  async fetch({ reference }) {
    const url = `https://public.offset.earth/users/treeware/trees`
    return this._requestJson({
      url,
      schema: apiSchema,
      options: {
        searchParams: { ref: reference },
      },
    })
  }

  async handle({ owner, packageName }) {
    const reference = crypto
      .createHash('md5')
      .update(`${owner}/${packageName}`)
      .digest('hex')
    const { total } = await this.fetch({ reference })

    return this.constructor.render({ count: total })
  }
}
