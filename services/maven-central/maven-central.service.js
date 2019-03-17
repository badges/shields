'use strict'

const xml2js = require('xml2js')
const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { addv: versionText } = require('../text-formatters')
const { version: versionColor } = require('../color-formatters')

// This legacy service should be rewritten to use e.g. BaseJsonService.
//
// Tips for rewriting:
// https://github.com/badges/shields/blob/master/doc/rewriting-services.md
//
// Do not base new services on this code.
module.exports = class MavenCentral extends LegacyService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'maven-central/v',
      pattern: '',
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

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/maven-central\/v\/([^/]*)\/([^/]*)(?:\/([^/]*))?\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const groupId = match[1] // eg, `com.google.inject`
        const artifactId = match[2] // eg, `guice`
        const versionPrefix = match[3] || '' // eg, `1.`
        const format = match[4] || 'gif' // eg, `svg`
        // Based on repo1.maven.org rather than search.maven.org because of #846.
        const metadataUrl = `${'http://repo1.maven.org/maven2' +
          '/'}${encodeURIComponent(groupId).replace(
          /\./g,
          '/'
        )}/${encodeURIComponent(artifactId)}/maven-metadata.xml`
        const badgeData = getBadgeData('maven-central', data)
        request(
          metadataUrl,
          { headers: { Accept: 'text/xml' } },
          (err, res, buffer) => {
            if (err != null) {
              badgeData.text[1] = 'inaccessible'
              sendBadge(format, badgeData)
              return
            }
            xml2js.parseString(buffer.toString(), (err, data) => {
              if (err != null) {
                badgeData.text[1] = 'invalid'
                sendBadge(format, badgeData)
                return
              }
              try {
                const versions = data.metadata.versioning[0].versions[0].version.reverse()
                const version = versions.find(
                  version => version.indexOf(versionPrefix) === 0
                )
                badgeData.text[1] = versionText(version)
                badgeData.colorscheme = versionColor(version)
                sendBadge(format, badgeData)
              } catch (e) {
                badgeData.text[1] = 'invalid'
                sendBadge(format, badgeData)
              }
            })
          }
        )
      })
    )
  }
}
