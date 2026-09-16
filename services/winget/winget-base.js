import Joi from 'joi'
import gql from 'graphql-tag'
import { InvalidParameter } from '../index.js'
import { GithubAuthV4Service } from '../github/github-auth-service.js'
import { transformErrors } from '../github/github-helpers.js'
import { latest } from './version.js'

const directorySchema = Joi.object({
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

export default class WingetBase extends GithubAuthV4Service {
  static defaultBadgeData = {
    label: 'winget',
  }

  static manifestPathFor({ name, version }) {
    const nameFirstLower = name[0].toLowerCase()
    const nameSlashed = name.replaceAll('.', '/')
    return `manifests/${nameFirstLower}/${nameSlashed}/${version}`
  }

  // Returns GraphQL response for the package's version directory listing.
  async fetchVersions({ name }) {
    const nameFirstLower = name[0].toLowerCase()
    const nameSlashed = name.replaceAll('.', '/')
    const expression = `HEAD:manifests/${nameFirstLower}/${nameSlashed}`
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
      schema: directorySchema,
      transformErrors,
    })
  }

  // Returns the text content of a single manifest file at the given expression.
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

  // Returns the latest version string for a package, or throws if not found.
  async getLatestVersion({ name }) {
    const json = await this.fetchVersions({ name })
    if (json.data.repository.object?.entries == null) {
      throw new InvalidParameter({ prettyMessage: 'package not found' })
    }
    const entries = json.data.repository.object.entries
    const directories = entries.filter(entry => entry.type === 'tree')
    const versionDirs = directories.filter(dir =>
      dir.object.entries.some(
        file => file.type === 'blob' && file.name === `${name}.yaml`,
      ),
    )
    const version = latest(versionDirs.map(dir => dir.name))
    if (version == null) {
      throw new InvalidParameter({ prettyMessage: 'no versions found' })
    }
    return version
  }
}
