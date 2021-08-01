import Joi from 'joi'
import { renderLicenseBadge } from '../licenses.js'
import { optionalUrl } from '../validators.js'
import { NotFound } from '../index.js'
import {
  keywords,
  BasePackagistService,
  customServerDocumentationFragment,
} from './packagist-base.js'

const packageSchema = Joi.object()
  .pattern(
    /^/,
    Joi.object({
      'default-branch': Joi.bool(),
      license: Joi.array().required(),
    }).required()
  )
  .required()

const schema = Joi.object({
  packages: Joi.object().pattern(/^/, packageSchema).required(),
}).required()

const queryParamSchema = Joi.object({
  server: optionalUrl,
}).required()

export default class PackagistLicense extends BasePackagistService {
  static category = 'license'

  static route = {
    base: 'packagist/l',
    pattern: ':user/:repo',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'Packagist License',
      namedParams: { user: 'doctrine', repo: 'orm' },
      staticPreview: renderLicenseBadge({ license: 'MIT' }),
      keywords,
    },
    {
      title: 'Packagist License (custom server)',
      namedParams: { user: 'doctrine', repo: 'orm' },
      queryParams: { server: 'https://packagist.org' },
      staticPreview: renderLicenseBadge({ license: 'MIT' }),
      keywords,
      documentation: customServerDocumentationFragment,
    },
  ]

  static defaultBadgeData = {
    label: 'license',
  }

  transform({ json, user, repo }) {
    const branch = this.getDefaultBranch(json, user, repo)
    if (!branch) {
      throw new NotFound({ prettyMessage: 'default branch not found' })
    }
    const { license } = branch
    return { license }
  }

  async handle({ user, repo }, { server }) {
    const json = await this.fetch({ user, repo, schema, server })
    const { license } = this.transform({ json, user, repo })
    return renderLicenseBadge({ license })
  }
}
