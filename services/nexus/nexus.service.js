'use strict'

const Joi = require('@hapi/joi')
const { version: versionColor } = require('../color-formatters')
const { addv } = require('../text-formatters')
const {
  optionalDottedVersionNClausesWithOptionalSuffix,
} = require('../validators')
const { isSnapshotVersion } = require('./nexus-version')
const { BaseJsonService, InvalidResponse, NotFound } = require('..')

const searchApiSchema = Joi.object({
  data: Joi.array()
    .items(
      Joi.object({
        latestRelease: optionalDottedVersionNClausesWithOptionalSuffix,
        latestSnapshot: optionalDottedVersionNClausesWithOptionalSuffix,
        // `version` will almost always follow the same pattern as optionalDottedVersionNClausesWithOptionalSuffix.
        // However, there are a couple exceptions where `version` may be a simple string (like `android-SNAPSHOT`)
        // This schema is relaxed accordingly since for snapshot/release badges the schema has to validate
        // the entire history of each published version for the artifact.
        // Example artifact that includes such a historical version: https://oss.sonatype.org/service/local/lucene/search?g=com.google.guava&a=guava
        version: Joi.string(),
      })
    )
    .required(),
}).required()

const resolveApiSchema = Joi.object({
  data: Joi.object({
    baseVersion: optionalDottedVersionNClausesWithOptionalSuffix,
    version: optionalDottedVersionNClausesWithOptionalSuffix,
  }).required(),
}).required()

module.exports = class Nexus extends BaseJsonService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'nexus',
      // API pattern:
      // /nexus/(r|s|<repo-name>)/(http|https)/<nexus.host>[:port][/<entry-path>]/<group>/<artifact>[:k1=v1[:k2=v2[...]]]
      pattern:
        // Do not base new services on this route pattern.
        // See https://github.com/badges/shields/issues/3714
        ':repo(r|s|[^/]+)/:scheme(http|https)/:hostAndPath+/:groupId/:artifactId([^/:]+?):queryOpt(:.+?)?',
    }
  }

  static get auth() {
    return { userKey: 'nexus_user', passKey: 'nexus_pass' }
  }

  static get examples() {
    return [
      {
        title: 'Sonatype Nexus (Releases)',
        pattern: 'r/:scheme(http|https)/:hostAndPath/:groupId/:artifactId',
        namedParams: {
          scheme: 'https',
          hostAndPath: 'oss.sonatype.org',
          groupId: 'com.google.guava',
          artifactId: 'guava',
        },
        staticPreview: this.render({
          version: 'v27.0.1-jre',
        }),
      },
      {
        title: 'Sonatype Nexus (Snapshots)',
        pattern: 's/:scheme(http|https)/:hostAndPath/:groupId/:artifactId',
        namedParams: {
          scheme: 'https',
          hostAndPath: 'oss.sonatype.org',
          groupId: 'com.google.guava',
          artifactId: 'guava',
        },
        staticPreview: this.render({
          version: 'v24.0-SNAPSHOT',
        }),
      },
      {
        title: 'Sonatype Nexus (Repository)',
        pattern: ':repo/:scheme(http|https)/:hostAndPath/:groupId/:artifactId',
        namedParams: {
          repo: 'developer',
          scheme: 'https',
          hostAndPath: 'repository.jboss.org/nexus',
          groupId: 'ai.h2o',
          artifactId: 'h2o-automl',
        },
        staticPreview: this.render({
          version: '3.22.0.2',
        }),
      },
      {
        title: 'Sonatype Nexus (Query Options)',
        pattern:
          ':repo/:scheme(http|https)/:hostAndPath/:groupId/:artifactId/:queryOpt',
        namedParams: {
          repo: 'fs-public-snapshots',
          scheme: 'https',
          hostAndPath: 'repository.jboss.org/nexus',
          groupId: 'com.progress.fuse',
          artifactId: 'fusehq',
          queryOpt: ':c=agent-apple-osx:p=tar.gz',
        },
        staticPreview: this.render({
          version: '7.0.1-SNAPSHOT',
        }),
        documentation: `
        <p>
          Note that you can use query options with any Nexus badge type (Releases, Snapshots, or Repository).
        </p>
        <p>
          Query options should be provided as key=value pairs separated by a colon.
        </p>
        `,
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'nexus' }
  }

  static render({ version }) {
    return {
      message: addv(version),
      color: versionColor(version),
    }
  }

  addQueryParamsToQueryString({ qs, queryOpt }) {
    // Users specify query options with 'key=value' pairs, using a
    // colon delimiter between pairs ([:k1=v1[:k2=v2[...]]]).
    // queryOpt will be a string containing those key/value pairs,
    // For example:  :c=agent-apple-osx:p=tar.gz
    const keyValuePairs = queryOpt.split(':')
    keyValuePairs.forEach(keyValuePair => {
      const paramParts = keyValuePair.split('=')
      const paramKey = paramParts[0]
      const paramValue = paramParts[1]
      qs[paramKey] = paramValue
    })
  }

  async fetch({ repo, scheme, hostAndPath, groupId, artifactId, queryOpt }) {
    const qs = {
      g: groupId,
      a: artifactId,
    }
    let schema
    let url = `${scheme}://${hostAndPath}/`
    // API pattern:
    // for /nexus/[rs]/... pattern, use the search api of the nexus server, and
    // for /nexus/<repo-name>/... pattern, use the resolve api of the nexus server.
    if (repo === 'r' || repo === 's') {
      schema = searchApiSchema
      url += 'service/local/lucene/search'
    } else {
      schema = resolveApiSchema
      url += 'service/local/artifact/maven/resolve'
      qs.r = repo
      qs.v = 'LATEST'
    }

    if (queryOpt) {
      this.addQueryParamsToQueryString({ qs, queryOpt })
    }

    const json = await this._requestJson({
      schema,
      url,
      options: { qs, auth: this.authHelper.basicAuth },
      errorMessages: {
        404: 'artifact not found',
      },
    })

    return { json }
  }

  transform({ repo, json }) {
    if (json.data.length === 0) {
      throw new NotFound({ prettyMessage: 'artifact or version not found' })
    }
    if (repo === 'r') {
      const version = json.data[0].latestRelease
      if (!version) {
        throw new InvalidResponse({ prettyMessage: 'invalid artifact version' })
      }
      return { version }
    } else if (repo === 's') {
      // only want to match 1.2.3-SNAPSHOT style versions, which may not always be in
      // 'latestSnapshot' so check 'version' as well before continuing to next entry
      for (const artifact of json.data) {
        if (isSnapshotVersion(artifact.latestSnapshot)) {
          return { version: artifact.latestSnapshot }
        }
        if (isSnapshotVersion(artifact.version)) {
          return { version: artifact.version }
        }
      }
      throw new InvalidResponse({ prettyMessage: 'no snapshot versions found' })
    } else {
      const version = json.data.baseVersion || json.data.version
      if (!version) {
        throw new InvalidResponse({ prettyMessage: 'invalid artifact version' })
      }
      return { version }
    }
  }

  async handle({ repo, scheme, hostAndPath, groupId, artifactId, queryOpt }) {
    const { json } = await this.fetch({
      repo,
      scheme,
      hostAndPath,
      groupId,
      artifactId,
      queryOpt,
    })

    const { version } = this.transform({ repo, json })
    return this.constructor.render({ version })
  }
}
