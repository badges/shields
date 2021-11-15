import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { BaseJsonService, NotFound } from '../index.js'

const schema = Joi.object({
  entries: Joi.array()
    .items(
      Joi.object({
        source_package_version: Joi.string().required(),
      })
    )
    .required(),
}).required()

export default class Ubuntu extends BaseJsonService {
  static category = 'version'

  static route = {
    base: 'ubuntu/v',
    pattern: ':packageName/:series?',
  }

  static examples = [
    {
      title: 'Ubuntu package',
      namedParams: { series: 'bionic', packageName: 'ubuntu-wallpapers' },
      staticPreview: renderVersionBadge({ version: '18.04.1-0ubuntu1' }),
    },
  ]

  static defaultBadgeData = {
    label: 'ubuntu',
  }

  async fetch({ packageName, series }) {
    const seriesParam = series
      ? {
          distro_series: `https://api.launchpad.net/1.0/ubuntu/${encodeURIComponent(
            series
          )}`,
        }
      : {}
    return this._requestJson({
      schema,
      url: 'https://api.launchpad.net/1.0/ubuntu/+archive/primary',
      options: {
        searchParams: {
          'ws.op': 'getPublishedSources',
          exact_match: 'true',
          order_by_date: 'true',
          status: 'Published',
          source_name: packageName,
          ...seriesParam,
        },
      },
      errorMessages: {
        400: 'series not found',
      },
    })
  }

  async handle({ packageName, series }) {
    const data = await this.fetch({ packageName, series })
    if (!data.entries.length) {
      throw new NotFound()
    }
    return renderVersionBadge({
      version: data.entries[0].source_package_version,
    })
  }
}
