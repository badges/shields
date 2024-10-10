import Joi from 'joi'
import { pathParams } from '../index.js'
import { nonNegativeInteger } from '../validators.js'
import { formatDate } from '../text-formatters.js'
import { age as ageColor } from '../color-formatters.js'
import MavenCentralBase from './maven-central-base.js'

const updateResponseSchema = Joi.object({
  metadata: Joi.object({
    versioning: Joi.object({
      lastUpdated: nonNegativeInteger,
    }),
  }),
})

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
    const date = new Date(
      `${metadata.versioning.lastUpdated}`.replace(
        /^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/,
        '$4:$5:$6 $2/$3/$1',
      ),
    )
    return this.constructor.render({ date })
  }
}
