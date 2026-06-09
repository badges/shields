//
import Joi from 'joi'
import gql from 'graphql-tag'
import yaml from 'js-yaml'
import { renderDateBadge } from '../date.js'
import { InvalidParameter, pathParam, InvalidResponse } from '../index.js'
import { GithubAuthV4Service } from '../github/github-auth-service.js'
import { transformErrors } from '../github/github-helpers.js'
import { latest } from './version.js'

const schema = Joi.object({
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
      }).allow(null),
    }).required(),
  }).required(),
}).required()

export default class WingetReleaseDate extends GithubAuthV4Service {
  static category = 'activity'

  static route = {
    base: 'winget',
    pattern: 'release-date/:name',
  }

  static openApi = {
    '/winget/release-date/{name}': {
      get: {
        summary: 'WinGet Package Release Date',
        description: 'WinGet Community Repository',
        parameters: [
          pathParam({
            name: 'name',
            example: 'Microsoft.WSL',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = {
    label: 'release date',
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
      schema,
      transformErrors,
    })
  }

  async handle({ name }) {
    const nameFirstLower = name[0].toLowerCase()
    const nameSlashed = name.replaceAll('.', '/')
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

    const manifestPath = `manifests/${nameFirstLower}/${nameSlashed}/${version}`
    const filesToTry = [`${name}.installer.yaml`, `${name}.yaml`]

    let releaseDate
    for (const file of filesToTry) {
      const json = await this.fetchManifest({
        expression: `HEAD:${manifestPath}/${file}`,
      })
      const text = json.data.repository.object?.text
      if (!text) continue
      const manifest = yaml.load(text)
      if (manifest?.ReleaseDate) {
        releaseDate = manifest.ReleaseDate
        break
      }
    }

    if (!releaseDate) {
      throw new InvalidResponse({ prettyMessage: 'no release date found' })
    }

    return renderDateBadge(releaseDate)
  }

  async fetchManifest({ expression }) {
    return this._requestGraphql({
      query: gql`
        query Manifest($expression: String!) {
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
  }
}
