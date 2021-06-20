import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { InvalidResponse } from '../index.js'
import { ConditionalGithubAuthV3Service } from './github-auth-service.js'
import { fetchRepoContent } from './github-common-fetch.js'
import { documentation } from './github-helpers.js'

const queryParamSchema = Joi.object({
  filename: Joi.string(),
}).required()

const goVersionRegExp = /^go (.+)$/m

const keywords = ['golang']

export default class GithubGoModGoVersion extends ConditionalGithubAuthV3Service {
  static category = 'version'
  static route = {
    base: 'github/go-mod/go-version',
    pattern: ':user/:repo/:branch*',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'GitHub go.mod Go version',
      pattern: ':user/:repo',
      namedParams: { user: 'gohugoio', repo: 'hugo' },
      staticPreview: this.render({ version: '1.12' }),
      documentation,
      keywords,
    },
    {
      title: 'GitHub go.mod Go version (branch)',
      pattern: ':user/:repo/:branch',
      namedParams: { user: 'gohugoio', repo: 'hugo', branch: 'master' },
      staticPreview: this.render({ version: '1.12', branch: 'master' }),
      documentation,
      keywords,
    },
    {
      title: 'GitHub go.mod Go version (subdirectory of monorepo)',
      pattern: ':user/:repo',
      namedParams: { user: 'golang', repo: 'go' },
      queryParams: { filename: 'src/go.mod' },
      staticPreview: this.render({ version: '1.14' }),
      documentation,
      keywords,
    },
    {
      title: 'GitHub go.mod Go version (branch & subdirectory of monorepo)',
      pattern: ':user/:repo/:branch',
      namedParams: { user: 'golang', repo: 'go', branch: 'master' },
      queryParams: { filename: 'src/go.mod' },
      staticPreview: this.render({ version: '1.14' }),
      documentation,
      keywords,
    },
  ]

  static defaultBadgeData = { label: 'Go' }

  static render({ version, branch }) {
    return renderVersionBadge({
      version,
      tag: branch,
      defaultLabel: 'Go',
    })
  }

  static transform(content) {
    const match = goVersionRegExp.exec(content)
    if (!match) {
      throw new InvalidResponse({
        prettyMessage: 'Go version missing in go.mod',
      })
    }

    return {
      go: match[1],
    }
  }

  async handle({ user, repo, branch }, { filename = 'go.mod' }) {
    const content = await fetchRepoContent(this, {
      user,
      repo,
      branch,
      filename,
    })
    const { go } = this.constructor.transform(content)
    return this.constructor.render({ version: go, branch })
  }
}
