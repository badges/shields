import Joi from 'joi'
import gql from 'graphql-tag'
import { renderVersionBadge } from '../version.js'
import { InvalidParameter, pathParam } from '../index.js'
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

export default class WingetVersion extends GithubAuthV4Service {
  static category = 'version'

  static route = {
    base: 'winget/v',
    pattern: ':name',
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
      schema,
      transformErrors,
    })
  }

  async handle({ name }) {
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

    return renderVersionBadge({ version })
  }
}
