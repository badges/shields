'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { isSnapshotVersion: isNexusSnapshotVersion } = require('./nexus-version')
const { addv: versionText } = require('../../lib/text-formatters')
const { version: versionColor } = require('../../lib/color-formatters')

module.exports = class Nexus extends LegacyService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'nexus',
    }
  }

  static get examples() {
    return [
      {
        title: 'Sonatype Nexus (Releases)',
        previewUrl: 'r/https/oss.sonatype.org/com.google.guava/guava',
      },
      {
        title: 'Sonatype Nexus (Snapshots)',
        previewUrl: 's/https/oss.sonatype.org/com.google.guava/guava',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    // standalone sonatype nexus installation
    // API pattern:
    //   /nexus/(r|s|<repo-name>)/(http|https)/<nexus.host>[:port][/<entry-path>]/<group>/<artifact>[:k1=v1[:k2=v2[...]]].<format>
    // for /nexus/[rs]/... pattern, use the search api of the nexus server, and
    // for /nexus/<repo-name>/... pattern, use the resolve api of the nexus server.
    camp.route(
      /^\/nexus\/(r|s|[^/]+)\/(https?)\/((?:[^/]+)(?:\/[^/]+)?)\/([^/]+)\/([^/:]+)(:.+)?\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const repo = match[1] // r | s | repo-name
        const scheme = match[2] // http | https
        const host = match[3] // eg, `nexus.example.com`
        const groupId = encodeURIComponent(match[4]) // eg, `com.google.inject`
        const artifactId = encodeURIComponent(match[5]) // eg, `guice`
        const queryOpt = (match[6] || '').replace(/:/g, '&') // eg, `&p=pom&c=doc`
        const format = match[7]

        const badgeData = getBadgeData('nexus', data)

        const apiUrl = `${scheme}://${host}${
          repo === 'r' || repo === 's'
            ? `/service/local/lucene/search?g=${groupId}&a=${artifactId}${queryOpt}`
            : `/service/local/artifact/maven/resolve?r=${repo}&g=${groupId}&a=${artifactId}&v=LATEST${queryOpt}`
        }`

        request(
          apiUrl,
          { headers: { Accept: 'application/json' } },
          (err, res, buffer) => {
            if (err != null) {
              badgeData.text[1] = 'inaccessible'
              sendBadge(format, badgeData)
              return
            } else if (res && res.statusCode === 404) {
              badgeData.text[1] = 'no-artifact'
              sendBadge(format, badgeData)
              return
            }
            try {
              const parsed = JSON.parse(buffer)
              let version = '0'
              switch (repo) {
                case 'r':
                  if (parsed.data.length === 0) {
                    badgeData.text[1] = 'no-artifact'
                    sendBadge(format, badgeData)
                    return
                  }
                  version = parsed.data[0].latestRelease
                  break
                case 's':
                  if (parsed.data.length === 0) {
                    badgeData.text[1] = 'no-artifact'
                    sendBadge(format, badgeData)
                    return
                  }
                  // only want to match 1.2.3-SNAPSHOT style versions, which may not always be in
                  // 'latestSnapshot' so check 'version' as well before continuing to next entry
                  parsed.data.every(artifact => {
                    if (isNexusSnapshotVersion(artifact.latestSnapshot)) {
                      version = artifact.latestSnapshot
                      return
                    }
                    if (isNexusSnapshotVersion(artifact.version)) {
                      version = artifact.version
                      return
                    }
                    return true
                  })
                  break
                default:
                  version = parsed.data.baseVersion || parsed.data.version
                  break
              }
              if (version !== '0') {
                badgeData.text[1] = versionText(version)
                badgeData.colorscheme = versionColor(version)
              } else {
                badgeData.text[1] = 'undefined'
                badgeData.colorscheme = 'orange'
              }
              sendBadge(format, badgeData)
            } catch (e) {
              badgeData.text[1] = 'invalid'
              sendBadge(format, badgeData)
            }
          }
        )
      })
    )
  }
}
