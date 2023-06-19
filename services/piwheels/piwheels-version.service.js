import Joi from 'joi'
import { BaseJsonService, InvalidResponse } from '../index.js'
import { renderVersionBadge } from '../version.js'
import { pep440VersionColor } from '../color-formatters.js'

const schema = Joi.object({
  releases: Joi.object()
    .pattern(
      Joi.string(),
      Joi.object({
        prerelease: Joi.boolean().required(),
        yanked: Joi.boolean().required(),
        files: Joi.object().required(),
      })
    )
    .required(),
}).required()

const queryParamSchema = Joi.object({
  include_prereleases: Joi.equal(''),
}).required()

const keywords = ['python', 'arm', 'raspberry pi']

export default class PiWheelsVersion extends BaseJsonService {
  static category = 'version'

  static route = { base: 'piwheels/v', pattern: ':wheel', queryParamSchema }

  static examples = [
    {
      title: 'piwheels',
      namedParams: { wheel: 'numpy' },
      staticPreview: this.render({ version: '1.22.2' }),
      keywords,
    },
    {
      title: 'piwheels (including prereleases)',
      namedParams: { wheel: 'flask' },
      queryParams: {
        include_prereleases: null,
      },
      staticPreview: this.render({ version: '2.0.0rc2' }),
      keywords,
    },
  ]

  static defaultBadgeData = { label: 'piwheels' }

  static render({ version }) {
    return renderVersionBadge({ version, versionFormatter: pep440VersionColor })
  }

  async fetch({ wheel }) {
    return this._requestJson({
      schema,
      url: `https://www.piwheels.org/project/${wheel}/json/`,
      httpErrors: { 404: 'package not found' },
    })
  }

  static transform(releases, includePrereleases) {
    const allReleases = Object.keys(releases)
      .reduce(
        (acc, key) =>
          acc.concat({
            version: key,
            prerelease: releases[key].prerelease,
            yanked: releases[key].yanked,
            hasFiles: Object.keys(releases[key].files).length > 0,
          }),
        []
      )
      .filter(release => !release.yanked) // exclude any yanked releases
      .filter(release => release.hasFiles) // exclude any releases with no wheels

    if (allReleases.length === 0) {
      throw new InvalidResponse({ prettyMessage: 'no versions found' })
    }

    if (includePrereleases) {
      return allReleases[0].version
    }

    const stableReleases = allReleases.filter(release => !release.prerelease)
    if (stableReleases.length > 0) {
      return stableReleases[0].version
    }
    return allReleases[0].version
  }

  async handle({ wheel }, queryParams) {
    const includePrereleases = queryParams.include_prereleases !== undefined
    const { releases } = await this.fetch({ wheel })
    const version = this.constructor.transform(releases, includePrereleases)
    return this.constructor.render({ version })
  }
}
