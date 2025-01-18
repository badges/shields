import { URL } from 'url'
import Joi from 'joi'
import { httpErrors } from '../dynamic-common.js'
import { url } from '../validators.js'
import { fetchEndpointData } from '../endpoint-common.js'
import { BaseJsonService, InvalidParameter, queryParams } from '../index.js'

const blockedDomains = ['github.com', 'shields.io']

const queryParamSchema = Joi.object({
  url,
}).required()

const description = `
Using the endpoint badge, you can provide content for a badge through
a JSON endpoint. The content can be prerendered, or generated on the
fly. To strike a balance between responsiveness and bandwidth
utilization on one hand, and freshness on the other, cache behavior is
configurable, subject to the Shields minimum. The endpoint URL is
provided to Shields through the query string. Shields fetches it and
formats the badge.

The endpoint badge takes a single required query param: <code>url</code>, which is the URL to your JSON endpoint

<div>
  <h2>Example JSON Endpoint Response</h2>
  <code>&#123; "schemaVersion": 1, "label": "hello", "message": "sweet world", "color": "orange" &#125;</code>
  <h2>Example Shields Response</h2>
  <img src="https://img.shields.io/badge/hello-sweet_world-orange" />
</div>
<div>
  <h2>Schema</h2>
  <table>
    <tbody>
      <tr>
        <th>Property</th>
        <th>Description</th>
      </tr>
      <tr>
        <td><code>schemaVersion</code></td>
        <td>Required. Always the number <code>1</code>.</td>
      </tr>
      <tr>
        <td><code>label</code></td>
        <td>
          Required. The left text, or the empty string to omit the left side of
          the badge. This can be overridden by the query string.
        </td>
      </tr>
      <tr>
        <td><code>message</code></td>
        <td>Required. Can't be empty. The right text.</td>
      </tr>
      <tr>
        <td><code>color</code></td>
        <td>
          Default: <code>lightgrey</code>. The right color. Supports the eight
          named colors above, as well as hex, rgb, rgba, hsl, hsla and css named
          colors. This can be overridden by the query string.
        </td>
      </tr>
      <tr>
        <td><code>labelColor</code></td>
        <td>
          Default: <code>grey</code>. The left color. This can be overridden by
          the query string.
        </td>
      </tr>
      <tr>
        <td><code>isError</code></td>
        <td>
          Default: <code>false</code>. <code>true</code> to treat this as an
          error badge. This prevents the user from overriding the color. In the
          future, it may affect cache behavior.
        </td>
      </tr>
      <tr>
        <td><code>namedLogo</code></td>
        <td>
          Default: none. One of the
		  <a href="https://simpleicons.org/">simple-icons</a> slugs. Can be
          overridden by the query string.
        </td>
      </tr>
      <tr>
        <td><code>logoSvg</code></td>
        <td>Default: none. An SVG string containing a custom logo.</td>
      </tr>
      <tr>
        <td><code>logoColor</code></td>
        <td>
          Default: none. Same meaning as the query string. Can be overridden by
          the query string. Only works for simple-icons logos.
        </td>
      </tr>
      <tr>
      <td><code>logoSize</code></td>
      <td>
        Default: none. Make icons adaptively resize by setting <code>auto</code>.
        Useful for some wider logos like <code>amd</code> and <code>amg</code>.
        Supported for simple-icons logos only.
      </td>
    </tr>
      <tr>
        <td><code>logoWidth</code></td>
        <td>
          Default: none. Same meaning as the query string. Can be overridden by
          the query string.
        </td>
      </tr>
      <tr>
        <td><code>style</code></td>
        <td>
          Default: <code>flat</code>. The default template to use. Can be
          overridden by the query string.
        </td>
      </tr>
    </tbody>
  </table>
</div>`

export default class Endpoint extends BaseJsonService {
  static category = 'dynamic'

  static route = {
    base: 'endpoint',
    pattern: '',
    queryParamSchema,
  }

  static openApi = {
    '/endpoint': {
      get: {
        summary: 'Endpoint Badge',
        description,
        parameters: queryParams({
          name: 'url',
          description: 'The URL to your JSON endpoint',
          required: true,
          example: 'https://shields.redsparr0w.com/2473/monday',
        }),
      },
    },
  }

  static _cacheLength = 300
  static defaultBadgeData = { label: 'custom badge' }

  static render({
    isError,
    label,
    message,
    color,
    labelColor,
    namedLogo,
    logoSvg,
    logoColor,
    logoSize,
    logoWidth,
    style,
    cacheSeconds,
  }) {
    return {
      isError,
      label,
      message,
      color,
      labelColor,
      namedLogo,
      logoSvg,
      logoColor,
      logoSize,
      logoWidth,
      style,
      // don't allow the user to set cacheSeconds any shorter than this._cacheLength
      cacheSeconds: Math.max(
        ...[this._cacheLength, cacheSeconds].filter(x => x !== undefined),
      ),
    }
  }

  async handle(namedParams, { url }) {
    let protocol, hostname
    try {
      const parsedUrl = new URL(url)
      protocol = parsedUrl.protocol
      hostname = parsedUrl.hostname
    } catch (e) {
      throw new InvalidParameter({ prettyMessage: 'invalid url' })
    }
    if (protocol !== 'https:') {
      throw new InvalidParameter({ prettyMessage: 'please use https' })
    }
    if (blockedDomains.some(domain => hostname.endsWith(domain))) {
      throw new InvalidParameter({ prettyMessage: 'domain is blocked' })
    }

    const validated = await fetchEndpointData(this, {
      url,
      httpErrors,
      validationPrettyErrorMessage: 'invalid properties',
      includeKeys: true,
    })

    return this.constructor.render(validated)
  }
}
