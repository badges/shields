import { BaseService, NotFound, pathParams } from '../index.js'
import { renderLicenseBadge } from '../licenses.js'
import { description, detectSpdxId, httpErrorsFor } from './tangled-helper.js'

const CANDIDATE_PATHS = [
  'LICENSE',
  'LICENSE.md',
  'LICENSE.txt',
  'COPYING',
  'COPYING.md',
]

export default class TangledLicense extends BaseService {
  static category = 'license'
  static route = { base: 'tangled/l', pattern: ':owner/:repo' }
  static openApi = {
    '/tangled/l/{owner}/{repo}': {
      get: {
        summary: 'Tangled License',
        description,
        parameters: pathParams(
          { name: 'owner', example: 'tangled.org' },
          { name: 'repo', example: 'core' },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'license' }

  static render({ license }) {
    if (license === undefined) return { message: 'unknown' }
    if (license === null) return { message: 'not specified' }
    return renderLicenseBadge({ license })
  }

  async handle({ owner, repo }) {
    const httpErrors = httpErrorsFor('repo not found')
    for (const path of CANDIDATE_PATHS) {
      try {
        const { buffer } = await this._request({
          url: `https://tangled.org/${owner}/${repo}/raw/HEAD/${path}`,
          httpErrors,
        })
        return this.constructor.render({
          license: detectSpdxId(buffer.toString()),
        })
      } catch (e) {
        if (e instanceof NotFound) continue
        throw e
      }
    }
    return this.constructor.render({ license: null })
  }
}
