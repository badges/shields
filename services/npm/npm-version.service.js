import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { NotFound, pathParam, queryParam } from '../index.js'
import NpmBase, { packageNameDescription } from './npm-base.js'

// Joi.string should be a semver.
const schema = Joi.object()
  .keys({ latest: Joi.string().required() })
  .pattern(/./, Joi.string())
  .required()

export default class NpmVersion extends NpmBase {
  static category = 'version'

  static route = this.buildRoute('npm/v', { withTag: true })

  static openApi = {
    '/npm/v/{packageName}': {
      get: {
        summary: 'NPM Version',
        parameters: [
          pathParam({
            name: 'packageName',
            example: 'npm',
            description: packageNameDescription,
          }),
          queryParam({
            name: 'registry_uri',
            example: 'https://registry.npmjs.com',
          }),
        ],
      },
    },
    '/npm/v/{packageName}/{tag}': {
      get: {
        summary: 'NPM Version (with dist tag)',
        parameters: [
          pathParam({
            name: 'packageName',
            example: 'npm',
            description: packageNameDescription,
          }),
          pathParam({
            name: 'tag',
            example: 'next-8',
          }),
          queryParam({
            name: 'registry_uri',
            example: 'https://registry.npmjs.com',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = {
    label: 'npm',
  }

  static render({ tag, version }) {
    const { label: defaultLabel } = this.defaultBadgeData
    return renderVersionBadge({
      tag,
      version,
      defaultLabel,
    })
  }

  async handle(namedParams, queryParams) {
    const { scope, packageName, tag, registryUrl } =
      this.constructor.unpackParams(namedParams, queryParams)

    const slug =
      scope === undefined
        ? packageName
        : this.constructor.encodeScopedPackage({ scope, packageName })

    const packageData = await this._requestJson({
      schema,
      url: `${registryUrl}/-/package/${slug}/dist-tags`,
      httpErrors: { 404: 'package not found' },
    })

    if (tag && !(tag in packageData)) {
      throw new NotFound({ prettyMessage: 'tag not found' })
    }

    return this.constructor.render({
      tag,
      version: packageData[tag || 'latest'],
    })
  }
}
