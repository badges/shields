import Joi from 'joi'
import { BaseXmlService } from '../index.js'
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
  }

  static auth = {
    userKey: 'obs_userName',
    passKey: 'obs_userPass',
    authorizedOrigins: [],
    isRequired: true,
  }

  static examples = [
    {
      title: 'openSUSE OBS package build status',
      namedParams: {
        project: 'openSUSE:Tools',
        packageName: 'osc',
        repository: 'Debian_11',
        arch: 'x86_64',
      },
      staticPreview: this.render({
        repository: 'Debian_11',
        status: 'succeeded',
      }),
      keywords: ['open build service'],
    },
  ]

  static defaultBadgeData = { label: 'OBS' }

  static render({ repository, status }) {
    return renderBuildStatusBadge({ repository, status })
  }

  constructor(context, config) {
    super(context, config)
    this.instance = config.public.services.obs.instance
    const { protocol, host } = new URL(this.instance)
    this.authHelper._authorizedOrigins = [`${protocol}//${host}`]
  }

  async fetch({ project, packageName, repository, arch }) {
    return this._requestXml(
      this.authHelper.withBasicAuth({
        schema,
        url: `${this.instance}/build/${project}/${repository}/${arch}/${packageName}/_status`,
        errorMessages: {
          401: 'Not authorized',
          404: 'Package not found', // extend this to project/package/repository/arch?
        },
        parserOptions: {
          ignoreAttributes: false,
        },
      })
    )
  }

  async handle({ project, packageName, repository, arch }) {
    const resp = await this.fetch({ project, packageName, repository, arch })
    return this.constructor.render({
      repository,
      status: resp.status['@_code'],
    })
  }
}
