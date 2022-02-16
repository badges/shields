import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { NotFound } from '../index.js'
import NpmBase from './npm-base.js'

const keywords = ['node']

// Joi.string should be a semver.
const schema = Joi.object()
  .keys({ latest: Joi.string().required() })
  .pattern(/./, Joi.string())
  .required()

export default class NpmVersion extends NpmBase {
  static category = 'version'

  static route = this.buildRoute('npm/v', { withTag: true })

  static examples = [
    {
      title: 'npm',
      pattern: ':packageName',
      namedParams: { packageName: 'npm' },
      staticPreview: this.render({ version: '6.3.0' }),
      keywords,
    },
    {
      title: 'npm (scoped)',
      pattern: ':scope/:packageName',
      namedParams: { scope: '@cycle', packageName: 'core' },
      staticPreview: this.render({ version: '7.0.0' }),
      keywords,
    },
    {
      title: 'npm (tag)',
      pattern: ':packageName/:tag',
      namedParams: { packageName: 'npm', tag: 'next-8' },
      staticPreview: this.render({ tag: 'latest', version: '6.3.0' }),
      keywords,
    },
    {
      title: 'npm (custom registry)',
      pattern: ':packageName/:tag',
      namedParams: { packageName: 'npm', tag: 'next-8' },
      queryParams: { registry_uri: 'https://registry.npmjs.com' },
      staticPreview: this.render({ tag: 'latest', version: '7.0.0' }),
      keywords,
    },
    {
      title: 'npm (scoped with tag)',
      pattern: ':scope/:packageName/:tag',
      namedParams: { scope: '@cycle', packageName: 'core', tag: 'canary' },
      staticPreview: this.render({ tag: 'latest', version: '6.3.0' }),
      keywords,
    },
  ]

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
      errorMessages: { 404: 'package not found' },
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
