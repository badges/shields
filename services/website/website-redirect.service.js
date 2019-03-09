'use strict'

const { escapeFormat } = require('../../core/badge-urls/path-helpers')
const { redirector } = require('..')

function escapeFormatSlashes(t) {
  return (
    escapeFormat(t)
      // Double slash
      .replace(/\/\//g, '/')
  )
}

/*
Old documentation, for reference:

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
*/

module.exports = redirector({
  category: 'monitoring',
  route: {
    base: '',
    format:
      'website-(([^-/]|--|//)+)-(([^-/]|--|//)+)(-(([^-/]|--|//)+)-(([^-/]|--|//)+))?/([^/]+)/(.+)',
    capture: [
      // Some of these could be made into non-capturing groups so these unused
      // params would not need to be declared.
      'upMessage',
      'unused2',
      'downMessage',
      'unused4',
      'unused5',
      'upColor',
      'unused7',
      'downColor',
      'unused8',
      'protocol',
      'hostAndPath',
    ],
  },
  transformPath: ({ protocol, hostAndPath }) =>
    `/website/${protocol}/${hostAndPath}`,
  transformQueryParams: ({ upMessage, downMessage, upColor, downColor }) => ({
    up_message: upMessage ? escapeFormatSlashes(upMessage) : undefined,
    down_message: downMessage ? escapeFormatSlashes(downMessage) : undefined,
    up_color: upColor,
    down_color: downColor,
  }),
  dateAdded: new Date('2019-03-08'),
})
