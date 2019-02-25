'use strict'

const Joi = require('joi')
const { BaseXmlService } = require('..')
const { renderVersionBadge } = require('../version')

const schema = Joi.object({
  metadata: Joi.object({
    versioning: Joi.object({
      versions: Joi.object({
        version: Joi.array()
          .items(
            Joi.alternatives(Joi.string().required(), Joi.number().required())
          )
          .required(),
      }).required(),
    }).required(),
  }).required(),
}).required()

module.exports = class MavenMetadata extends BaseXmlService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'maven-metadata/v',
      pattern: ':protocol(http|https)/:hostAndPath+',
    }
  }

  static get examples() {
    return [
      {
        title: 'Maven metadata URL',
        namedParams: {
          protocol: 'http',
          hostAndPath:
            'central.maven.org/maven2/com/google/code/gson/gson/maven-metadata.xml',
        },
        staticPreview: renderVersionBadge({ version: '2.8.5' }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'maven' }
  }

  async fetch({ protocol, hostAndPath }) {
    const url = `${protocol}://${hostAndPath}`
    return this._requestXml({ schema, url })
  }

  async handle({ protocol, hostAndPath }) {
    const data = await this.fetch({ protocol, hostAndPath })
    return renderVersionBadge({
      version: data.metadata.versioning.versions.version.slice(-1)[0],
    })
  }
}
