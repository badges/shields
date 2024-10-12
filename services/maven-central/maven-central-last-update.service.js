import Joi from 'joi'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
import dayjs from 'dayjs'
import { InvalidResponse, pathParams } from '../index.js'
import { nonNegativeInteger } from '../validators.js'
import { formatDate } from '../text-formatters.js'
import { age as ageColor } from '../color-formatters.js'
import MavenCentralBase from './maven-central-base.js'
dayjs.extend(customParseFormat)

const updateResponseSchema = Joi.object({
  metadata: Joi.object({
    versioning: Joi.object({
      lastUpdated: nonNegativeInteger,
    }).required(),
  }).required(),
}).required()

export default class MavenCentralLastUpdate extends MavenCentralBase {
  static category = 'activity'

  static route = {
    base: 'maven-central/last-update',
    pattern: ':groupId/:artifactId',
  }

  static openApi = {
    '/maven-central/last-update/{groupId}/{artifactId}': {
      get: {
        summary: 'Maven Central Last Update',
        parameters: pathParams(
          { name: 'groupId', example: 'com.google.guava' },
          { name: 'artifactId', example: 'guava' },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'last updated' }

  static render({ date }) {
    return {
      message: formatDate(date),
      color: ageColor(date),
    }
  }

  async handle({ groupId, artifactId }) {
    const { metadata } = await this.fetch({
      groupId,
      artifactId,
      schema: updateResponseSchema,
    })

    const date = dayjs(
      String(metadata.versioning.lastUpdated),
      'YYYYMMDDHHmmss',
    )

    if (!date.isValid) {
      throw new InvalidResponse({ prettyMessage: 'invalid date' })
    }

    return this.constructor.render({ date })
  }
}
