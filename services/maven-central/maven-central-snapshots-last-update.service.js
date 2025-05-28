import Joi from 'joi'
import { pathParams } from '../index.js'
import { parseDate, renderDateBadge } from '../date.js'
import { nonNegativeInteger } from '../validators.js'
import MavenCentralSnapshotsBase from './maven-central-snapshots-base.js'

const updateResponseSchema = Joi.object({
  metadata: Joi.object({
    versioning: Joi.object({
      lastUpdated: nonNegativeInteger,
    }).required(),
  }).required(),
}).required()

export default class MavenCentralSnapshotsLastUpdate extends MavenCentralSnapshotsBase {
  static category = 'activity'

  static route = {
    base: 'maven-central-snapshots/last-update',
    pattern: ':groupId/:artifactId',
  }

  static openApi = {
    '/maven-central-snapshots/last-update/{groupId}/{artifactId}': {
      get: {
        summary: 'Maven Central Snapshots Last Update',
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
