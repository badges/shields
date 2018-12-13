'use strict'

const BaseJsonService = require('../base-json')
const Joi = require('joi')
const { isSnapshotVersion: isNexusSnapshotVersion } = require('./nexus-version')
const { addv: versionText } = require('../../lib/text-formatters')
const { version: versionColor } = require('../../lib/color-formatters')
const serverSecrets = require('../../lib/server-secrets')

const versionRegex = /^\d+(\.\d+)*(-.*)?$/

const searchApiSchema = Joi.object({
  data: Joi.array()
    .items(
      Joi.object({
        latestRelease: Joi.string().regex(versionRegex),
        latestSnapshot: Joi.string().regex(versionRegex),
        version: Joi.string().regex(versionRegex),
      })
    )
    .required(),
}).required()

const resolveApiSchema = Joi.object({
  data: Joi.object({
    baseVersion: Joi.string().regex(versionRegex),
    version: Joi.string().regex(versionRegex),
  }).required(),
}).required()

const keywords = ['nexus', 'sonatype']

module.exports = class Nexus extends BaseJsonService {
  static render({ message, color }) {
    return {
      message,
      color,
    }
  }

  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'nexus',
      // API pattern:
      // /nexus/(r|s|<repo-name>)/(http|https)/<nexus.host>[:port][/<entry-path>]/<group>/<artifact>[:k1=v1[:k2=v2[...]]]
      format:
        '(r|s|[^/]+)/(https?)/((?:[^/]+)(?:/[^/]+)?)/([^/]+)/([^/:]+)(:.+)?',
      capture: ['repo', 'scheme', 'host', 'groupId', 'artifactId', 'queryOpt'],
    }
  }

  static get defaultBadgeData() {
    return { color: 'blue', label: 'nexus' }
  }

  static get examples() {
    return [
      {
        title: 'Sonatype Nexus (Releases)',
        pattern: 'r/:scheme/:host/:groupId/:artifactId',
        namedParams: {
          scheme: 'https',
          host: 'oss.sonatype.org',
          groupId: 'com.google.guava',
          artifactId: 'guava',
        },
        staticExample: this.render({ message: 'v27.0.1-jre' }),
        keywords,
      },
      {
        title: 'Sonatype Nexus (Snapshots)',
        pattern: 's/:scheme/:host/:groupId/:artifactId',
        namedParams: {
          scheme: 'https',
          host: 'oss.sonatype.org',
          groupId: 'com.google.guava',
          artifactId: 'guava',
        },
        staticExample: this.render({ message: 'v24.0-SNAPSHOT' }),
        keywords,
      },
      {
        title: 'Sonatype Nexus (Repository)',
        pattern: ':repo/:scheme/:host/:groupId/:artifactId',
        namedParams: {
          repo: 'developer',
          scheme: 'https',
          host: 'repository.jboss.org/nexus',
          groupId: 'ai.h2o',
          artifactId: 'h2o-automl',
        },
        staticExample: this.render({ message: '3.22.0.2' }),
        keywords,
      },
      {
        title: 'Sonatype Nexus (Query Options)',
        pattern: ':repo/:scheme/:host/:groupId/:artifactId/:queryOpt',
        namedParams: {
          repo: 'fs-public-snapshots',
          scheme: 'https',
          host: 'repository.jboss.org/nexus',
          groupId: 'com.progress.fuse',
          artifactId: 'fusehq',
          queryOpt: ':c=agent-apple-osx:p=tar.gz',
        },
        staticExample: this.render({
          message: '7.0.1-SNAPSHOT',
          color: 'orange',
        }),
        keywords,
        documentation: `
        <p>
          Note that you can use query options with any Nexus badge type (Releases, Snapshots, or Repository)
        </p>
        <p>
          Query options should be provided as key=value pairs separated by a semicolon
        </p>
        `,
      },
    ]
  }

  async handle({ repo, scheme, host, groupId, artifactId, queryOpt }) {
    const requestParams = this.getRequestParams({
      repo,
      scheme,
      host,
      groupId,
      artifactId,
      queryOpt,
    })
    const json = await this._requestJson(requestParams)
    if (json.data.length === 0) {
      return this.constructor.render({ message: 'no-artifact', color: 'red' })
    }

    let version = '0'
    if (repo === 'r') {
      version = json.data[0].latestRelease
    } else if (repo === 's') {
      json.data.every(artifact => {
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
    } else {
      version = json.data.baseVersion || json.data.version
    }
    return this.buildBadge(version)
  }

  getRequestParams({ repo, scheme, host, groupId, artifactId, queryOpt }) {
    const options = {
      qs: {
        g: groupId,
        a: artifactId,
      },
    }
    let schema
    let url = `${scheme}://${host}/`
    // API pattern:
    // for /nexus/[rs]/... pattern, use the search api of the nexus server, and
    // for /nexus/<repo-name>/... pattern, use the resolve api of the nexus server.
    if (repo === 'r' || repo === 's') {
      schema = searchApiSchema
      url += 'service/local/lucene/search'
    } else {
      schema = resolveApiSchema
      url += 'service/local/artifact/maven/resolve'
      options.qs.r = repo
      options.qs.v = 'LATEST'
    }

    if (queryOpt) {
      const opts = queryOpt.split(':')
      opts.forEach(opt => {
        const kvp = opt.split('=')
        const key = kvp[0]
        const val = kvp[1]
        options.qs[key] = val
      })
    }

    if (serverSecrets) {
      if (serverSecrets.nexus_base64auth) {
        options.headers = {
          Authorization: `basic ${serverSecrets.nexus_base64auth}`,
        }
      } else if (serverSecrets.nexus_user) {
        options.auth = {
          user: serverSecrets.nexus_user,
          pass: serverSecrets.nexus_pass,
        }
      }
    }

    return {
      schema,
      url,
      options,
      errorMessages: {
        404: 'no-artifact',
      },
    }
  }

  buildBadge(version) {
    let message, color
    if (version !== '0') {
      message = versionText(version)
      color = versionColor(version)
    } else {
      message = 'undefined'
      color = 'orange'
    }

    return this.constructor.render({ message, color })
  }
}
