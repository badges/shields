import Joi from 'joi'
import gql from 'graphql-tag'
import yaml from 'js-yaml'
import { renderVersionBadge } from '../version.js'
import {
  InvalidParameter,
  InvalidResponse,
  pathParam,
  queryParam,
} from '../index.js'
import { GithubAuthV4Service } from '../github/github-auth-service.js'
import { transformErrors } from '../github/github-helpers.js'
import { parseDate } from '../date.js'
import { latest } from './version.js'

const queryParamSchema = Joi.object({
  include_release_date: Joi.equal(''),
}).required()

const treeSchema = Joi.object({
  data: Joi.object({
    repository: Joi.object({
      object: Joi.object({
        entries: Joi.array().items(
          Joi.object({
            type: Joi.string().required(),
            name: Joi.string().required(),
            object: Joi.object({
              entries: Joi.array().items(
                Joi.object({
                  type: Joi.string().required(),
                  name: Joi.string().required(),
                }),
              ),
            }).required(),
          }),
        ),
      })
        .allow(null)
        .required(),
    }).required(),
  }).required(),
}).required()

const manifestSchema = Joi.object({
  data: Joi.object({
    repository: Joi.object({
      object: Joi.object({
        text: Joi.string().required(),
      })
        .allow(null)
        .required(),
    }).required(),
  }).required(),
}).required()

export default class WingetVersion extends GithubAuthV4Service {
  static category = 'version'

  static route = {
    base: 'winget/v',
    pattern: ':name',
    queryParamSchema,
  }

  static openApi = {
    '/winget/v/{name}': {
      get: {
        summary: 'WinGet Package Version',
        description: 'WinGet Community Repository',
        parameters: [
          pathParam({
            name: 'name',
            example: 'Microsoft.WSL',
          }),
          queryParam({
            name: 'include_release_date',
            schema: { type: 'boolean' },
            example: null,
            description:
              'Include the ReleaseDate value in the badge, when available',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = {
    label: 'winget',
  }

  async fetch({ name }) {
    const nameFirstLower = name[0].toLowerCase()
    const nameSlashed = name.replaceAll('.', '/')
    const path = `manifests/${nameFirstLower}/${nameSlashed}`
    const expression = `HEAD:${path}`
    return this._requestGraphql({
      query: gql`
        query RepoFiles($expression: String!) {
          repository(owner: "microsoft", name: "winget-pkgs") {
            object(expression: $expression) {
              ... on Tree {
                entries {
                  type
                  name
                  object {
                    ... on Tree {
                      entries {
                        type
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: { expression },
      schema: treeSchema,
      transformErrors,
    })
  }

  async fetchManifestText({ path }) {
    const expression = `HEAD:${path}`
    const json = await this._requestGraphql({
      query: gql`
        query RepoFile($expression: String!) {
          repository(owner: "microsoft", name: "winget-pkgs") {
            object(expression: $expression) {
              ... on Blob {
                text
              }
            }
          }
        }
      `,
      variables: { expression },
      schema: manifestSchema,
      transformErrors,
    })

    if (json.data.repository.object?.text == null) {
      throw new InvalidResponse({ prettyMessage: 'manifest not found' })
    }

    return json.data.repository.object.text
  }

  static getPreferredManifestFilenames({ name, files }) {
    const yamlFiles = files.filter(file => file.endsWith('.yaml'))
    const expectedYaml = `${name}.yaml`
    const expectedInstallerYaml = `${name}.installer.yaml`

    const priority = file => {
      if (file === expectedInstallerYaml) return 0
      if (file === expectedYaml) return 1
      if (file.startsWith(`${name}.`) && file.endsWith('.installer.yaml'))
        return 2
      if (file.startsWith(`${name}.`)) return 3
      if (file.endsWith('.installer.yaml')) return 4
      return 5
    }

    return [...yamlFiles].sort((a, b) => priority(a) - priority(b))
  }

  async fetchReleaseDate({ manifestPath, manifestFilenames }) {
    for (const filename of manifestFilenames) {
      const text = await this.fetchManifestText({
        path: `${manifestPath}/${filename}`,
      })
      let parsed
      try {
        parsed = yaml.load(text)
      } catch (err) {
        throw new InvalidResponse({
          prettyMessage: 'unparseable manifest',
          underlyingError: err,
        })
      }

      const releaseDate = parsed?.ReleaseDate
      if (releaseDate != null) {
        return parseDate(releaseDate).format('D MMM YYYY').toLowerCase()
      }
    }
  }

  async handle({ name }, queryParams) {
    const json = await this.fetch({ name })
    if (json.data.repository.object?.entries == null) {
      throw new InvalidParameter({
        prettyMessage: 'package not found',
      })
    }
    const entries = json.data.repository.object.entries
    const directories = entries.filter(entry => entry.type === 'tree')
    const versionDirs = directories.filter(dir =>
      dir.object.entries.some(
        file => file.type === 'blob' && file.name === `${name}.yaml`,
      ),
    )
    const versions = versionDirs.map(dir => dir.name)
    const version = latest(versions)

    if (version == null) {
      throw new InvalidParameter({
        prettyMessage: 'no versions found',
      })
    }

    const includeReleaseDate = queryParams.include_release_date !== undefined
    if (!includeReleaseDate) {
      return renderVersionBadge({ version })
    }

    const latestDir = versionDirs.find(dir => dir.name === version)
    const manifestFiles = latestDir?.object?.entries
      ?.filter(entry => entry.type === 'blob')
      .map(entry => entry.name)

    const nameFirstLower = name[0].toLowerCase()
    const nameSlashed = name.replaceAll('.', '/')
    const manifestPath = `manifests/${nameFirstLower}/${nameSlashed}/${version}`

    const releaseDate = await this.fetchReleaseDate({
      manifestPath,
      manifestFilenames: this.constructor.getPreferredManifestFilenames({
        name,
        files: manifestFiles ?? [],
      }),
    })

    return renderVersionBadge({
      version,
      suffix: releaseDate ? `(${releaseDate})` : undefined,
    })
  }
}
