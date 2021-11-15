import Joi from 'joi'
import { version as versionColor } from '../color-formatters.js'
import { addv } from '../text-formatters.js'
import {
  optionalUrl,
  optionalDottedVersionNClausesWithOptionalSuffix,
} from '../validators.js'
import { BaseJsonService, InvalidResponse, NotFound } from '../index.js'
import { isSnapshotVersion } from './nexus-version.js'

const nexus2SearchApiSchema = Joi.object({
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

const nexus3SearchApiSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        // This schema is relaxed similarly to nexux2SearchApiSchema
        version: Joi.string().required(),
      })
    )
    .required(),
}).required()

const nexus2ResolveApiSchema = Joi.object({
  data: Joi.object({
    baseVersion: optionalDottedVersionNClausesWithOptionalSuffix,
    version: optionalDottedVersionNClausesWithOptionalSuffix,
  }).required(),
}).required()

const queryParamSchema = Joi.object({
  server: optionalUrl.required(),
  queryOpt: Joi.string()
    .regex(/(:[\w.]+=[^:]*)+/i)
    .optional(),
  nexusVersion: Joi.equal('2', '3'),
}).required()

export default class Nexus extends BaseJsonService {
  static category = 'version'

  static route = {
    base: 'nexus',
    pattern: ':repo(r|s|[^/]+)/:groupId/:artifactId',
    queryParamSchema,
  }

  static auth = {
    userKey: 'nexus_user',
    passKey: 'nexus_pass',
    serviceKey: 'nexus',
  }

  static examples = [
    {
      title: 'Sonatype Nexus (Releases)',
      pattern: 'r/:groupId/:artifactId',
      namedParams: {
        groupId: 'org.apache.commons',
        artifactId: 'commons-lang3',
      },
      queryParams: {
        server: 'https://nexus.pentaho.org',
        nexusVersion: '3',
      },
      staticPreview: this.render({
        version: '3.9',
      }),
      documentation: `
    <p>
      Specifying 'nexusVersion=3' when targeting Nexus 3 servers will speed up the badge rendering.
      Note that you can use this query parameter with any Nexus badge type (Releases, Snapshots, or Repository).
    </p>
    `,
    },
    {
      title: 'Sonatype Nexus (Snapshots)',
      pattern: 's/:groupId/:artifactId',
      namedParams: {
        groupId: 'com.google.guava',
        artifactId: 'guava',
      },
      queryParams: {
        server: 'https://oss.sonatype.org',
      },
      staticPreview: this.render({
        version: 'v24.0-SNAPSHOT',
      }),
    },
    {
      title: 'Sonatype Nexus (Repository)',
      pattern: ':repo/:groupId/:artifactId',
      namedParams: {
        repo: 'developer',
        groupId: 'ai.h2o',
        artifactId: 'h2o-automl',
      },
      queryParams: {
        server: 'https://repository.jboss.org/nexus',
      },
      staticPreview: this.render({
        version: '3.22.0.2',
      }),
    },
    {
      title: 'Sonatype Nexus (Query Options)',
      pattern: ':repo/:groupId/:artifactId',
      namedParams: {
        repo: 'fs-public-snapshots',
        groupId: 'com.progress.fuse',
        artifactId: 'fusehq',
      },
      queryParams: {
        server: 'https://repository.jboss.org/nexus',
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
    <p>
      Possible values:
      <ul>
        <li><a href="https://nexus.pentaho.org/swagger-ui/#/search/search">All Nexus 3 badges</a></li>
        <li><a href="https://repository.sonatype.org/nexus-restlet1x-plugin/default/docs/path__artifact_maven_resolve.html">Nexus 2 Releases and Snapshots badges</a></li>
        <li><a href=https://repository.sonatype.org/nexus-indexer-lucene-plugin/default/docs/path__lucene_search.html">Nexus 2 Repository badges</a></li>
      </ul>
    </p>
    `,
    },
  ]

  static defaultBadgeData = {
    label: 'nexus',
  }

  static render({ version }) {
    return {
      message: addv(version),
      color: versionColor(version),
    }
  }

  addQueryParamsToQueryString({ searchParams, queryOpt }) {
    // Users specify query options with 'key=value' pairs, using a
    // colon delimiter between pairs ([:k1=v1[:k2=v2[...]]]).
    // queryOpt will be a string containing those key/value pairs,
    // For example:  :c=agent-apple-osx:p=tar.gz
    const keyValuePairs = queryOpt.split(':')
    keyValuePairs.forEach(keyValuePair => {
      const paramParts = keyValuePair.split('=')
      const paramKey = paramParts[0]
      const paramValue = paramParts[1]
      searchParams[paramKey] = paramValue
    })
  }

  async fetch({ server, repo, groupId, artifactId, queryOpt, nexusVersion }) {
    if (nexusVersion === '3') {
      return this.fetch3({ server, repo, groupId, artifactId, queryOpt })
    }
    // Most servers still use Nexus 2. Fall back to Nexus 3 if the hitting a
    // Nexus 2 endpoint returns a Bad Request (=> InvalidResponse, for path /service/local/artifact/maven/resolve)
    // or a Not Found (for path /service/local/artifact/maven/resolve).
    try {
      return await this.fetch2({ server, repo, groupId, artifactId, queryOpt })
    } catch (e) {
      if (e instanceof InvalidResponse || e instanceof NotFound) {
        return this.fetch3({ server, repo, groupId, artifactId, queryOpt })
      }
      throw e
    }
  }

  async fetch2({ server, repo, groupId, artifactId, queryOpt }) {
    const searchParams = {
      g: groupId,
      a: artifactId,
    }
    let schema
    let url = `${server}${server.slice(-1) === '/' ? '' : '/'}`
    // API pattern:
    // for /nexus/[rs]/... pattern, use the search api of the nexus server, and
    // for /nexus/<repo-name>/... pattern, use the resolve api of the nexus server.
    if (repo === 'r' || repo === 's') {
      schema = nexus2SearchApiSchema
      url += 'service/local/lucene/search'
    } else {
      schema = nexus2ResolveApiSchema
      url += 'service/local/artifact/maven/resolve'
      searchParams.r = repo
      searchParams.v = 'LATEST'
    }

    if (queryOpt) {
      this.addQueryParamsToQueryString({ searchParams, queryOpt })
    }

    const json = await this._requestJson(
      this.authHelper.withBasicAuth({
        schema,
        url,
        options: { searchParams },
        errorMessages: {
          404: 'artifact not found',
        },
      })
    )

    return { actualNexusVersion: '2', json }
  }

  async fetch3({ server, repo, groupId, artifactId, queryOpt }) {
    const searchParams = {
      group: groupId,
      name: artifactId,
      sort: 'version',
    }

    switch (repo) {
      case 's':
        searchParams.prerelease = 'true'
        break
      case 'r':
        searchParams.prerelease = 'false'
        break
      default:
        searchParams.repository = repo
        break
    }

    if (queryOpt) {
      this.addQueryParamsToQueryString({ searchParams, queryOpt })
    }

    const url = `${server}${
      server.slice(-1) === '/' ? '' : '/'
    }service/rest/v1/search`

    const json = await this._requestJson(
      this.authHelper.withBasicAuth({
        schema: nexus3SearchApiSchema,
        url,
        options: { searchParams },
        errorMessages: {
          404: 'artifact not found',
        },
      })
    )

    return { actualNexusVersion: '3', json }
  }

  transform({ repo, json, actualNexusVersion }) {
    return actualNexusVersion === '3'
      ? this.transform3({ repo, json })
      : this.transform2({ repo, json })
  }

  transform2({ repo, json }) {
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

  transform3({ repo, json }) {
    if (json.items.length === 0) {
      const versionType = repo === 's' ? 'snapshot ' : ''
      throw new NotFound({
        prettyMessage: `artifact or ${versionType}version not found`,
      })
    }
    return { version: json.items[0].version }
  }

  async handle(
    { repo, groupId, artifactId },
    { server, queryOpt, nexusVersion }
  ) {
    const { actualNexusVersion, json } = await this.fetch({
      repo,
      server,
      groupId,
      artifactId,
      queryOpt,
      nexusVersion,
    })

    const { version } = this.transform({ repo, json, actualNexusVersion })
    return this.constructor.render({ version })
  }
}
