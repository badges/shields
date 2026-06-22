import Joi from 'joi'
import {
  BaseJsonService,
  InvalidResponse,
  NotFound,
  pathParams,
} from '../index.js'
import { stripBuildMetadata, selectVersion } from '../nuget/nuget-helpers.js'
import {
  extractTargetFrameworks,
  REGISTRATION_BASE_URL,
} from './dotnet-helpers.js'

const registrationIndexSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        '@id': Joi.string().required(),
      }),
    )
    .required(),
}).required()

const catalogEntrySchema = Joi.object({
  version: Joi.string().required(),
  dependencyGroups: Joi.array()
    .items(
      Joi.object({
        targetFramework: Joi.string().allow(null),
      }),
    )
    .default([]),
})

const registrationPageSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        '@id': Joi.string(),
        catalogEntry: catalogEntrySchema,
        items: Joi.array(),
      }),
    )
    .required(),
}).required()

const description = `
Shows the .NET target frameworks supported by a NuGet package, based on the
package's dependency groups in the NuGet registration API.
`

async function collectCatalogEntries(service, url) {
  const page = await service._requestJson({
    schema: registrationPageSchema,
    url,
  })
  const lastItem = page.items[page.items.length - 1]
  if (lastItem.catalogEntry) {
    return page.items
  }
  if (lastItem.items) {
    const nestedLast = lastItem.items[lastItem.items.length - 1]
    if (nestedLast.catalogEntry) {
      return lastItem.items
    }
  }
  return collectCatalogEntries(service, lastItem['@id'])
}

export default class Dotnet extends BaseJsonService {
  static category = 'platform-support'

  static route = {
    base: 'dotnet',
    pattern: ':variant(v|vpre)/:packageName',
  }

  static openApi = {
    '/dotnet/{variant}/{packageName}': {
      get: {
        summary: '.NET Target Framework',
        description,
        parameters: pathParams(
          {
            name: 'variant',
            example: 'v',
            schema: { type: 'variant', enum: ['v', 'vpre'] },
            description:
              'Latest stable package version (`v`) or latest version including prereleases (`vpre`).',
          },
          { name: 'packageName', example: 'Humanizer.Core' },
        ),
      },
    },
  }

  static defaultBadgeData = {
    label: 'dotnet',
    namedLogo: 'dotnet',
  }

  static render({ frameworks }) {
    return {
      message: frameworks.join(' | '),
      color: 'blue',
    }
  }

  registrationIndexUrl({ packageName }) {
    return `${REGISTRATION_BASE_URL}${packageName.toLowerCase()}/index.json`
  }

  transform({ catalogEntries, includePrereleases }) {
    if (catalogEntries.length === 0) {
      throw new NotFound({ prettyMessage: 'package not found' })
    }
    const versions = catalogEntries.map(entry =>
      stripBuildMetadata(entry.catalogEntry.version),
    )
    const version = selectVersion(versions, includePrereleases)
    const catalogEntry = catalogEntries.find(
      entry => stripBuildMetadata(entry.catalogEntry.version) === version,
    ).catalogEntry
    const frameworks = extractTargetFrameworks(
      catalogEntry.dependencyGroups || [],
    )
    if (frameworks.length === 0) {
      throw new InvalidResponse({
        prettyMessage: 'target frameworks missing',
      })
    }
    return frameworks
  }

  async fetchCatalogEntries({ packageName }) {
    const index = await this._requestJson({
      schema: registrationIndexSchema,
      url: this.registrationIndexUrl({ packageName }),
      httpErrors: {
        404: 'package not found',
      },
    })
    const lastPageUrl = index.items[index.items.length - 1]['@id']
    return collectCatalogEntries(this, lastPageUrl)
  }

  async handle({ variant, packageName }) {
    const includePrereleases = variant === 'vpre'
    const catalogEntries = await this.fetchCatalogEntries({ packageName })
    const frameworks = this.transform({ catalogEntries, includePrereleases })
    return this.constructor.render({ frameworks })
  }
}
