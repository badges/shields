import Joi from 'joi'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  status: Joi.allow(
    'insecure',
    'outofdate',
    'notsouptodate',
    'uptodate',
    'none'
  ).required(),
}).required()

const queryParamSchema = Joi.object({
  path: Joi.string(),
}).required()

const statusMap = {
  insecure: {
    color: 'red',
    message: 'insecure',
  },
  outofdate: {
    color: 'red',
    message: 'out of date',
  },
  notsouptodate: {
    color: 'yellow',
    message: 'up to date',
  },
  uptodate: {
    color: 'brightgreen',
    message: 'up to date',
  },
  none: {
    color: 'brightgreen',
    message: 'none',
  },
}

export default class David extends BaseJsonService {
  static category = 'dependencies'
  static route = {
    base: 'david',
    pattern: ':kind(dev|optional|peer)?/:user/:repo',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'David',
      namedParams: { user: 'expressjs', repo: 'express' },
      staticPreview: this.render({ status: 'uptodate' }),
    },
    {
      title: 'David (path)',
      namedParams: { user: 'babel', repo: 'babel' },
      queryParams: { path: 'packages/babel-core' },
      staticPreview: this.render({ status: 'uptodate' }),
    },
  ]

  static defaultBadgeData = { label: 'dependencies' }

  static render({ status, kind }) {
    return {
      message: statusMap[status].message,
      color: statusMap[status].color,
      label: `${kind ? `${kind} ` : ''}dependencies`,
    }
  }

  async fetch({ kind, user, repo, path }) {
    const url = `https://david-dm.org/${user}/${repo}/${
      kind ? `${kind}-` : ''
    }info.json`

    return this._requestJson({
      schema,
      url,
      options: { qs: { path } },
      errorMessages: {
        /* note:
        david returns a 504 response for 'not found'
        e.g: https://david-dm.org/foo/barbaz/info.json
        not a 404 so we can't handle 'not found' cleanly
        because this might also be some other error.
        */
        504: 'repo or path not found or david internal error',
      },
    })
  }

  async handle({ kind, user, repo }, { path }) {
    const json = await this.fetch({ kind, user, repo, path })
    return this.constructor.render({ status: json.status, kind })
  }
}
