import Joi from 'joi'
import { optionalUrl } from '../validators.js'
import { BaseService } from '../index.js'
import { renderVersionBadge } from '../version.js'
import { getCachedResource } from '../../core/base-service/resource-cache.js'

const ARTIFACTORY_LATEST_VERSION_ENDPOINT = 'api/search/latestVersion'
const ONE_HOUR = 1 * 3600 * 1000

const queryParamSchema = Joi.object({
  // auth related optional properties
  server: optionalUrl.default(''),
  token: Joi.string().default(''),
  username: Joi.string().default(''),
  password: Joi.string().default(''),

  // api related optional properties
  repos: Joi.string().default(''),
  remote: Joi.string().default(''),
  version: Joi.string().default(''),
}).required()

const documentation = `
  <p>
    Query for the last released version of an artifact using the <b>Latest Version</b> endpoint.
    <br />
    <br />
    This service will cache results for <b>1 hour</b> so as not to overload a given Artifactory instance with potentially long running query operations.
    <br />
    <br />
    Authentication is done either through basic auth or using a bearer token. While the options exist to pass along credentials as query params, users
    are strongly encouraged to instead set the relevant auth related environment variables server side which this service will pick up and read at runtime.
    <br />
    <br />
    The following environment variables are supported:
    <ul>
      <li>ARTIFACTORY_URL</li>
      <li>ARTIFACTORY_TOKEN</li>
      <li>ARTIFACTORY_USERNAME</li>
      <li>ARTIFACTORY_PASSWORD</li>
    </ul>
    If using a <b>Token</b> for authentication you do not need to set the username and password env-vars.
    <br />
    <br />
    For more technical information on the available properties the <b>Latest Version</b> endpoint uses, and their potential drawbacks and limitations, please consult the following <a target="_blank" href="https://jfrog.com/help/r/jfrog-rest-apis/artifact-latest-version-search-based-on-layout">developer documentation here</a>.
  </p>
  `

export default class Artifactory extends BaseService {
  static category = 'version'
  static route = {
    base: 'artifactory/v',
    pattern: ':group/:artifact?',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'Artifactory Latest Version',
      documentation,
      namedParams: {
        group: 'org.jfrog.artifactory.client',
        artifact: 'artifactory-java-client-services',
      },
      queryParams: {
        repos: 'libs-release-local',
        remote: '1',
        version: '1.0-SNAPSHOT',
        server: 'https://my.artifactory.server/artifactory',
        token: 'OTEfj876SDF2345JKIB/H&+FFGH',
        username: 'jerry',
        password: 'seinfeld',
      },
      staticPreview: Artifactory.render('2.1.0'),
    },
  ]

  static defaultBadgeData = { label: 'artifactory' }

  static render(version) {
    return renderVersionBadge({ version })
  }

  static orElseEnvVar(possibleValue, envVarName) {
    if (possibleValue !== '') {
      return possibleValue
    } else {
      const envValue = process.env[envVarName]
      if (envValue && envValue !== 'undefined') {
        return envValue
      } else {
        return ''
      }
    }
  }

  static getAuthorizationHeaderValue(
    possibleToken,
    possibleUsername,
    possiblePassword,
  ) {
    // check for token value first
    const artToken = Artifactory.orElseEnvVar(
      possibleToken,
      'ARTIFACTORY_TOKEN',
    )
    if (artToken !== '') {
      return `Bearer ${artToken}`
    }

    // if no token then check for username and password
    const artUsername = Artifactory.orElseEnvVar(
      possibleUsername,
      'ARTIFACTORY_USERNAME',
    )
    if (artUsername !== '') {
      const artPassword = Artifactory.orElseEnvVar(
        possiblePassword,
        'ARTIFACTORY_PASSWORD',
      )
      if (artUsername !== '') {
        return `Basic ${btoa(`${artUsername}:${artPassword}`)}`
      }
    }

    return ''
  }

  async fetchVersion({ requestParams }) {
    // cache results so as not to overload
    const result = await getCachedResource({
      url: requestParams.artifactoryEndpoint,
      ttl: ONE_HOUR,
      json: false,
      scraper: response => response,
      options: requestParams.options,
    })

    //  Request path here does not use caching but does
    //  allow us to catch specific errors and return
    //  more specific responses: can we do something
    //  similar when using the cachedResource function?
    //
    // const { res, buffer } = await this._request({
    //  url: requestParams.artifactoryEndpoint,
    //  options: requestParams.options,
    //  httpErrors: { 404: 'Not Found', 401: 'Bad Credentials' },
    // })

    return result
  }

  async handle(
    { group, artifact },
    { server, token, username, password, repos, remote, version },
  ) {
    // Artifactory can return plain/text or json for this endpoint we're hitting so
    // we need to effectively accept all as we're not sure what we're going to be returned
    const defaultHeaders = { Accept: '*/*' }

    // dump query params to debug console
    console.debug(`***** artifactory found the following query properties *****

      group=${group}
      artifact=${artifact}
      server=${server}
      token=${token}
      username=${username}
      password=${password}
      repos=${repos}
      remote=${remote}
      version=${version}
    `)

    // set and check Artifactory URL
    const artifactoryUrl = Artifactory.orElseEnvVar(server, 'ARTIFACTORY_URL')
    if (artifactoryUrl === '') {
      const msg = 'No Artifactory URL found'
      return this.constructor.render({ msg })
    }
    const artifactoryEndpoint = `${artifactoryUrl}/${ARTIFACTORY_LATEST_VERSION_ENDPOINT}`

    // set and check authorization values
    const authValue = Artifactory.getAuthorizationHeaderValue(
      token,
      username,
      password,
    )
    if (authValue) {
      defaultHeaders.Authorization = authValue
    }

    // set our request parameters to query Artifactory
    const requestParams = {
      artifactoryEndpoint,
      options: {
        headers: defaultHeaders,
        searchParams: {
          g: group,
          a: artifact,
          v: version,
          remote,
          repos,
        },
      },
    }

    const foundVersion = await this.fetchVersion({ requestParams })
    return Artifactory.render(foundVersion)
  }
}
