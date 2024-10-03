import Joi from 'joi'
import { BaseXmlService, pathParam, queryParam } from '../index.js'
import { optionalUrl } from '../validators.js'
import { isBuildStatus, renderBuildStatusBadge } from './obs-build-status.js'

const schema = Joi.object({
  status: Joi.object({
    '@_code': isBuildStatus,
  }).required(),
}).required()

export default class ObsService extends BaseXmlService {
  static category = 'build'
  static route = {
    base: 'obs',
    pattern: ':project/:packageName/:repository/:arch',
    queryParamSchema: Joi.object({
      instance: optionalUrl,
    }).required(),
  }

  static auth = {
    userKey: 'obs_user',
    passKey: 'obs_pass',
    serviceKey: 'obs',
    isRequired: true,
  }

  static openApi = {
    '/obs/{project}/{packageName}/{repository}/{arch}': {
      get: {
        summary: 'OBS package build status',
        description:
          '[Open Build Service](https://openbuildservice.org/) (OBS) is a generic system to build and distribute binary packages',
        parameters: [
          pathParam({ name: 'project', example: 'openSUSE:Tools' }),
          pathParam({ name: 'packageName', example: 'osc' }),
          pathParam({ name: 'repository', example: 'Debian_11' }),
          pathParam({ name: 'arch', example: 'x86_64' }),
          queryParam({ name: 'instance', example: 'https://api.opensuse.org' }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'build' }

  static render({ status }) {
    return renderBuildStatusBadge({ status })
  }

  async fetch({ instance, project, packageName, repository, arch }) {
    return this._requestXml(
      this.authHelper.withBasicAuth({
        schema,
        url: `${instance}/build/${project}/${repository}/${arch}/${packageName}/_status`,
        parserOptions: {
          ignoreAttributes: false,
        },
      }),
    )
  }

  async handle(
    { project, packageName, repository, arch },
    { instance = 'https://api.opensuse.org' },
  ) {
    const resp = await this.fetch({
      instance,
      project,
      packageName,
      repository,
      arch,
    })
    return this.constructor.render({
      status: resp.status['@_code'],
    })
  }
}
