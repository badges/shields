'use strict'

const Joi = require('@hapi/joi')
const { renderVersionBadge } = require('../version')
const { BaseXmlService, NotFound } = require('..')

const schema = Joi.object({
  metadata: Joi.object({
    versioning: Joi.object({
      versions: Joi.object({
        version: Joi.array()
          .items(
            Joi.alternatives(Joi.string().required(), Joi.number().required())
          )
          .single()
          .required(),
      }).required(),
    }).required(),
  }).required(),
}).required()

module.exports = class MavenCentral extends BaseXmlService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'maven-central/v',
      pattern: ':groupId/:artifactId/:versionPrefix?',
    }
  }

  static get examples() {
    return [
      {
        title: 'Maven Central',
        pattern: ':groupId/:artifactId',
        namedParams: {
          groupId: 'org.apache.maven',
          artifactId: 'apache-maven',
        },
        staticPreview: {
          label: 'maven-central',
          message: 'v3.6.0',
          color: 'blue',
        },
      },
      {
        title: 'Maven Central with version prefix filter',
        pattern: ':groupId/:artifactId/:versionPrefix',
        namedParams: {
          groupId: 'org.apache.maven',
          artifactId: 'apache-maven',
          versionPrefix: '2',
        },
        staticPreview: {
          label: 'maven-central',
          message: 'v2.2.1',
          color: 'blue',
        },
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'maven-central' }
  }

  async fetch({ groupId, artifactId }) {
    const group = encodeURIComponent(groupId).replace(/\./g, '/')
    const artifact = encodeURIComponent(artifactId)
    const url = `https://repo1.maven.org/maven2/${group}/${artifact}/maven-metadata.xml`
    return this._requestXml({ schema, url })
  }

  async handle({ groupId, artifactId, versionPrefix }) {
    const data = await this.fetch({ groupId, artifactId })
    const versions = data.metadata.versioning.versions.version.reverse()
    let version = versions[0]
    if (versionPrefix !== undefined) {
      version = versions.filter(v => v.toString().startsWith(versionPrefix))[0]
      // if the filter returned no results, throw a NotFound
      if (version === undefined)
        throw new NotFound({ prettyMessage: 'version prefix not found' })
    }
    return renderVersionBadge({ version })
  }
}
