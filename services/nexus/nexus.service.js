'use strict'

const Joi = require('joi')
const { version: versionColor } = require('../../lib/color-formatters')
const { addv } = require('../../lib/text-formatters')
const serverSecrets = require('../../lib/server-secrets')
const { BaseJsonService, InvalidResponse, NotFound } = require('..')
const {
  optionalDottedVersionNClausesWithOptionalSuffix,
} = require('../validators')
const { isSnapshotVersion } = require('./nexus-version')

const searchApiSchema = Joi.object({
  data: Joi.array()
    .items(
      Joi.object({
        latestRelease: optionalDottedVersionNClausesWithOptionalSuffix,
        latestSnapshot: optionalDottedVersionNClausesWithOptionalSuffix,
        version: optionalDottedVersionNClausesWithOptionalSuffix,
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
  static render({ version }) {
    return {
      message: addv(version),
      color: versionColor(version),
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
        staticPreview: this.render({
          version: 'v27.0.1-jre',
        }),
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
        staticPreview: this.render({
          version: 'v24.0-SNAPSHOT',
        }),
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
        staticPreview: this.render({
          version: '3.22.0.2',
        }),
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
        staticPreview: this.render({
          version: '7.0.1-SNAPSHOT',
        }),
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

  transform({ repo, json }) {
    if (repo === 'r') {
      return { version: json.data[0].latestRelease }
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
      return { version: json.data.baseVersion || json.data.version }
    }
  }

  async handle({ repo, scheme, host, groupId, artifactId, queryOpt }) {
    const { json } = await this.fetch({
      repo,
      scheme,
      host,
      groupId,
      artifactId,
      queryOpt,
    })
    if (json.data.length === 0) {
      throw new NotFound({ prettyMessage: 'artifact or version not found' })
    }
    const { version } = this.transform({ repo, json })
    if (!version) {
      throw new InvalidResponse({ prettyMessage: 'invalid artifact version' })
    }
    return this.constructor.render({ version })
  }

  addQueryParamsToQueryString({ qs, queryOpt }) {
    // Users specify query options with 'key=value' pairs, using a
    // semicolon delimiter between pairs ([:k1=v1[:k2=v2[...]]]).
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

  async fetch({ repo, scheme, host, groupId, artifactId, queryOpt }) {
    const qs = {
      g: groupId,
      a: artifactId,
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
      qs.r = repo
      qs.v = 'LATEST'
    }

    if (queryOpt) {
      this.addQueryParamsToQueryString({ qs, queryOpt })
    }

    const options = { qs }

    if (serverSecrets.nexus_user) {
      options.auth = {
        user: serverSecrets.nexus_user,
        pass: serverSecrets.nexus_pass,
      }
    }

    const json = await this._requestJson({
      schema,
      url,
      options,
      errorMessages: {
        404: 'artifact not found',
      },
    })

    return { json }
  }
}
