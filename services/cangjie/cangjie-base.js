import Joi from 'joi'
import {
  BaseService,
  InvalidParameter,
  InvalidResponse,
  NotFound,
} from '../index.js'
import { latest } from '../version.js'

const indexEntrySchema = Joi.object({
  organization: Joi.string(),
  name: Joi.string().required(),
  version: Joi.string().required(),
  yanked: Joi.boolean().required(),
  'index-version': Joi.string().required(),
}).required()

export class BaseCangjieService extends BaseService {
  static defaultBadgeData = { label: 'cangjie' }

  static getIndexPath({ moduleName }) {
    if (moduleName.length < 3) {
      throw new InvalidParameter({ prettyMessage: 'invalid module name' })
    }

    if (moduleName.length === 3) {
      return `${moduleName.slice(0, 2)}/${moduleName[2]}/${moduleName}`
    }

    return `${moduleName.slice(0, 2)}/${moduleName.slice(2, 4)}/${moduleName}`
  }

  static parseIndexEntries(indexBody) {
    return indexBody
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        let entry
        try {
          entry = JSON.parse(line)
        } catch (e) {
          throw new InvalidResponse({ prettyMessage: 'invalid index entry' })
        }

        return this._validate(entry, indexEntrySchema, {
          prettyErrorMessage: 'invalid index entry',
        })
      })
  }

  static getLatestVersion(entries) {
    const version = latest(
      entries.filter(({ yanked }) => !yanked).map(({ version }) => version),
    )

    if (version === undefined) {
      throw new NotFound({ prettyMessage: 'no releases' })
    }

    return version
  }

  async fetch({ moduleName, organization }) {
    const indexPath = this.constructor.getIndexPath({ moduleName })
    const options = organization
      ? { searchParams: { organization } }
      : undefined

    const { buffer } = await this._request({
      url: `https://pkg.cangjie-lang.cn/registry/index/${indexPath}`,
      options,
    })

    return this.constructor.parseIndexEntries(buffer.toString())
  }
}
