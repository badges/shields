import Joi from 'joi'
import gql from 'graphql-tag'
import { renderDateBadge } from '../date.js'
import { InvalidParameter, InvalidResponse, pathParam } from '../index.js'
import { GithubAuthV4Service } from '../github/github-auth-service.js'
import { transformErrors } from '../github/github-helpers.js'
import { latest } from './version.js'

// Schema for the first query: list version directories
const versionListSchema = Joi.object({
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

// Schema for the second query: read installer YAML file content
const fileContentSchema = Joi.object({
  data: Joi.object({
    repository: Joi.object({
      object: Joi.object({
        text: Joi.string().allow(null).required(),
      })
        .allow(null)
        .required(),
    }).required(),
  }).required(),
}).required()

export default class WingetReleaseDate extends GithubAuthV4Service {
  static category = 'activity'

  static route = {
    base: 'winget/release-date',
    pattern: ':name',
  }

  static openApi = {
    '/winget/release-date/{name}': {
      get: {
        summary: 'WinGet Package Release Date',
        description:
          'Displays the ReleaseDate of the latest version of a WinGet package. ReleaseDate is an optional field in the WinGet manifest and may not be present for all packages.',
        parameters: [
          pathParam({
            name: 'name',
            example: 'UPX.UPX',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = {
    label: 'release date',
  }

  async fetchVersions({ name }) {
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
      schema: versionListSchema,
      transformErrors,
    })
  }

  async fetchInstallerYaml({ name, version }) {
    const nameFirstLower = name[0].toLowerCase()
    const nameSlashed = name.replaceAll('.', '/')
    const expression = `HEAD:manifests/${nameFirstLower}/${nameSlashed}/${version}/${name}.installer.yaml`
    return this._requestGraphql({
      query: gql`
        query FileContent($expression: String!) {
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
      schema: fileContentSchema,
      transformErrors,
    })
  }

  async handle({ name }) {
    // Step 1: find the latest version
    const versionJson = await this.fetchVersions({ name })

    if (versionJson.data.repository.object?.entries == null) {
      throw new InvalidParameter({
        prettyMessage: 'package not found',
      })
    }

    const entries = versionJson.data.repository.object.entries
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

    // Step 2: fetch the installer YAML content and extract ReleaseDate
    const fileJson = await this.fetchInstallerYaml({ name, version })
    const text = fileJson.data.repository.object?.text

    if (!text) {
      throw new InvalidResponse({
        prettyMessage: 'installer manifest not found',
      })
    }

    // Parse ReleaseDate from YAML text (e.g., "ReleaseDate: 2025-07-20")
    const match = text.match(/^ReleaseDate:\s*(\S+)/m)
    if (!match) {
      throw new InvalidResponse({
        prettyMessage: 'release date not available',
      })
    }

    const releaseDate = match[1]
    return renderDateBadge(releaseDate, true)
  }
}
