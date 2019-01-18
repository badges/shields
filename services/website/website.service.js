'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { escapeFormat } = require('../../core/badge-urls/path-helpers')

function escapeFormatSlashes(t) {
  return (
    escapeFormat(t)
      // Double slash
      .replace(/\/\//g, '/')
  )
}

const documentation = `
<p>
  The badge is of the form
  <code>https://img.shields.io/website[OPTIONS]/PROTOCOL/URLREST.svg</code>,
  the simplest case being
  <code>https://img.shields.io/website/http/example.com.svg</code>.
  More options are described below.
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
  The URLREST should be URLEncoded:
  <br>
  <input type="text" id="websiteDocUrlField" placeholder="Paste your URL (without the protocol) here" /><br>
  <button onclick="(function(el) { el.value = encodeURIComponent(el.value); })(document.getElementById('websiteDocUrlField'))">Encode</button>
  <button onclick="(function(el) { el.value = decodeURIComponent(el.value); })(document.getElementById('websiteDocUrlField'))">Decode</button>
</p>
<p>
  <code>[OPTIONS]</code> can be:
  <ul>
    <li>
      Nothing:&nbsp;
      <code>…/website/…</code>
    </li>
    <li>
      Online and offline text:&nbsp;
      <code>…/website-up-down/…</code>
    </li>
    <li>
      Online and offline text, then online and offline colors:&nbsp;
      <code>…/website-up-down-green-orange/…</code></li>
    </li>
  </ul>
  <table class="centered"><tbody>
    <tr><td>   Dashes <code>--</code>
      </td><td>  →
      </td><td>  <code>-</code> Dash
    </td></tr>
    <tr><td>   Underscores <code>__</code>
      </td><td>  →
      </td><td>  <code>_</code> Underscore <br/>
    </td></tr>
    <tr><td>   Slashes <code>//</code>
      </td><td>  →
      </td><td>  <code>/</code> Slash <br/>
    </td></tr>
    <tr><td>   <code>_</code> or Space <code>&nbsp;</code>
      </td><td>  →
      </td><td>  <code>&nbsp;</code> Space
    </td></tr>
  </tbody></table>
</p>
`

// This legacy service should be rewritten to use e.g. BaseJsonService.
//
// Tips for rewriting:
// https://github.com/badges/shields/blob/master/doc/rewriting-services.md
//
// Do not base new services on this code.
module.exports = class Website extends LegacyService {
  static get category() {
    return 'monitoring'
  }

  static get route() {
    return {
      base: '',
    }
  }

  static get examples() {
    return [
      {
        previewUrl: 'website-up-down-green-red/https/shields.io',
        queryParams: { label: 'my-website' },
        keywords: ['website'],
        documentation,
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/website(-(([^-/]|--|\/\/)+)-(([^-/]|--|\/\/)+)(-(([^-/]|--|\/\/)+)-(([^-/]|--|\/\/)+))?)?\/([^/]+)\/(.+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const onlineMessage = escapeFormatSlashes(
          match[2] != null ? match[2] : 'online'
        )
        const offlineMessage = escapeFormatSlashes(
          match[4] != null ? match[4] : 'offline'
        )
        const onlineColor = escapeFormatSlashes(
          match[7] != null ? match[7] : 'brightgreen'
        )
        const offlineColor = escapeFormatSlashes(
          match[9] != null ? match[9] : 'red'
        )
        const userProtocol = match[11]
        const userURI = match[12]
        const format = match[13]
        const withProtocolURI = `${userProtocol}://${userURI}`
        const options = {
          method: 'HEAD',
          uri: withProtocolURI,
        }
        const badgeData = getBadgeData('website', data)
        badgeData.colorscheme = undefined
        request(options, (err, res) => {
          // We consider all HTTP status codes below 310 as success.
          if (err != null || res.statusCode >= 310) {
            badgeData.text[1] = offlineMessage
            badgeData.colorB = offlineColor
            sendBadge(format, badgeData)
          } else {
            badgeData.text[1] = onlineMessage
            badgeData.colorB = onlineColor
            sendBadge(format, badgeData)
          }
        })
      })
    )
  }
}
