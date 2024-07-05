import Joi from 'joi'
import gql from 'graphql-tag'
import { latest, renderVersionBadge } from '../version.js'
import { InvalidParameter, pathParam } from '../index.js'
import { GithubAuthV4Service } from '../github/github-auth-service.js'
import { transformErrors } from '../github/github-helpers.js'

const schema = Joi.object({
  data: Joi.object({
    repository: Joi.object({
      object: Joi.object({
        entries: Joi.array().items(
          Joi.object({
            type: Joi.string().required(),
            name: Joi.string().required(),
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
    if (json.data.repository.object === null) {
      throw new InvalidParameter({
        prettyMessage: 'package not found',
      })
    }
    const entries = json.data.repository.object.entries
    const directories = entries.filter(file => file.type === 'tree')
    const versions = directories.map(file => file.name)
    const version = latest(versions)

    return renderVersionBadge({ version })
  }
}
