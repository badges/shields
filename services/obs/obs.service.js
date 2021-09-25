import Joi from 'joi'
import { BaseXmlService } from '../index.js'
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

  static examples = [
    {
      title: 'OBS package build status',
      namedParams: {
        project: 'openSUSE:Tools',
        packageName: 'osc',
        repository: 'Debian_11',
        arch: 'x86_64',
      },
      queryParams: { instance: 'https://api.opensuse.org' },
      staticPreview: this.render({
        repository: 'Debian_11',
        status: 'succeeded',
      }),
      keywords: ['open build service'],
    },
  ]

  static defaultBadgeData = { label: 'build' }

  static render({ repository, status }) {
    return renderBuildStatusBadge({ repository, status })
  }

  async fetch({ instance, project, packageName, repository, arch }) {
    return this._requestXml(
      this.authHelper.withBasicAuth({
        schema,
        url: `${instance}/build/${project}/${repository}/${arch}/${packageName}/_status`,
        parserOptions: {
          ignoreAttributes: false,
        },
      })
    )
  }

  async handle(
    { project, packageName, repository, arch },
    { instance = 'https://api.opensuse.org' }
  ) {
    const resp = await this.fetch({
      instance,
      project,
      packageName,
      repository,
      arch,
    })
    return this.constructor.render({
      repository,
      status: resp.status['@_code'],
    })
  }
}
