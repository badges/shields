'use strict'

const {
  queryParamSchema,
  exampleQueryParams,
  renderWebsiteStatus,
} = require('../website-status')
const { BaseService } = require('..')

const documentation = `
<p>
  The badge is of the form
  <code>https://img.shields.io/website/PROTOCOL/URLREST.svg</code>.
</p>
<p>
  The whole URL is obtained by concatenating the <code>PROTOCOL</code>
  (<code>http</code> or <code>https</code>, for example) with the
  <code>URLREST</code> (separating them with <code>://</code>).
</p>
<p>
  The existence of a specific path on the server can be checked by appending
  a path after the domain name, e.g.
  <code>https://img.shields.io/website/http/www.website.com/path/to/page.html.svg</code>.
</p>
<p>
  The messages and colors for the up and down states can also be customized.
</p>
`

module.exports = class Website extends BaseService {
  static get category() {
    return 'monitoring'
  }

  static get route() {
    return {
      base: 'website',
      // Do not base new services on this route pattern.
      // See https://github.com/badges/shields/issues/3714
      pattern: ':protocol(https|http)/:hostAndPath+',
      queryParamSchema,
    }
  }

  static get examples() {
    return [
      {
        title: 'Website',
        namedParams: {
          protocol: 'https',
          hostAndPath: 'shields.io',
        },
        queryParams: exampleQueryParams,
        staticPreview: renderWebsiteStatus({ isUp: true }),
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'website',
    }
  }

  async handle(
    { protocol, hostAndPath },
    {
      up_message: upMessage,
      down_message: downMessage,
      up_color: upColor,
      down_color: downColor,
    }
  ) {
    let isUp
    try {
      const {
        res: { statusCode },
      } = await this._request({
        url: `${protocol}://${hostAndPath}`,
        options: {
          method: 'HEAD',
        },
      })
      // We consider all HTTP status codes below 310 as success.
      isUp = statusCode < 310
    } catch (e) {
      // Catch all errors thrown by the request.
      isUp = false
    }

    return renderWebsiteStatus({
      isUp,
      upMessage,
      downMessage,
      upColor,
      downColor,
    })
  }
}
