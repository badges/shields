import Joi from 'joi'
import { pathParams } from '../index.js'
import { parseDate, renderDateBadge } from '../date.js'
import { nonNegativeInteger } from '../validators.js'
import MavenCentralBase from './maven-central-base.js'

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

  async handle({ groupId, artifactId }) {
    const { metadata } = await this.fetch({
      groupId,
      artifactId,
      schema: updateResponseSchema,
    })

    const date = parseDate(
      String(metadata.versioning.lastUpdated),
      'YYYYMMDDHHmmss',
    )

    return renderDateBadge(date)
  }
}
