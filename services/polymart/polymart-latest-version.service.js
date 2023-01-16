import { NotFound } from '../../core/base-service/errors.js'
import { BasePolymartService, documentation } from './polymart-base.js'

const ignoredVersionPatterns = /^[^0-9]|[0-9]{4}-[0-9]{2}-[0-9]{2}/
export default class PolymartLatestVersion extends BasePolymartService {
  static category = 'version'

  static route = {
    base: 'polymart/version',
    pattern: ':resourceId',
  }

  static examples = [
    {
      title: 'Polymart Version',
      namedParams: {
        resourceId: '323',
      },
      staticPreview: this.render({
        version: '1.2.9',
      }),
      documentation,
    },
  ]

  static defaultBadgeData = {
    label: 'polymart',
  }

  static addv(version) {
    version = `${version}`
    if (version.startsWith('v') || ignoredVersionPatterns.test(version)) {
      return version
    } else {
      return `v${version}`
    }
  }

  static version(version) {
    if (typeof version !== 'string' && typeof version !== 'number') {
      throw new Error(`Can't generate a version color for ${version}`)
    }
    version = `${version}`
    let first = version[0]
    if (first === 'v') {
      first = version[1]
    }
    if (first === '0' || /alpha|beta|snapshot|dev|pre/i.test(version)) {
      return 'orange'
    } else {
      return 'blue'
    }
  }

  static render({ version, tag, defaultLabel }) {
    return {
      label: tag ? `${defaultLabel}@${tag}` : undefined,
      message: this.addv(version),
      color: this.versionColor(version),
    }
  }

  async handle({ resourceId }) {
    const { response } = await this.fetch({ resourceId })
    if (!response.resource) {
      throw new NotFound()
    }
    return this.constructor.render({
      version: response.resource.updates.latest.version,
    })
  }
}
