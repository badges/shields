import { escapeFormat } from '../../core/badge-urls/path-helpers.js'
import { redirector } from '../index.js'

function escapeFormatSlashes(t) {
  return (
    escapeFormat(t)
      // Double slash
      .replace(/\/\//g, '/')
  )
}

function splitDashSeparatedOptionalParams(s) {
  const parts = []
  let cur = ''
  for (let i = 0; i < s.length; ) {
    const ch = s[i]
    const next = s[i + 1]
    if (ch === '-' && next === '-') {
      cur += '-'
      i += 2
    } else if (ch === '/' && next === '/') {
      cur += '/'
      i += 2
    } else if (ch === '-') {
      parts.push(cur)
      cur = ''
      i += 1
    } else {
      cur += ch
      i += 1
    }
  }
  parts.push(cur)
  return parts
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

export default [
  redirector({
    category: 'monitoring',
    route: {
      base: '',
      pattern: 'website-:labels/:protocol/:hostAndPath+',
    },
    transformPath: () => '/website',
    transformQueryParams: ({ labels, protocol, hostAndPath }) => {
      const parts = splitDashSeparatedOptionalParams(labels || '')
      const [upMessage, downMessage, upColor, downColor] = parts

      return {
        up_message: upMessage ? escapeFormatSlashes(upMessage) : undefined,
        down_message: downMessage
          ? escapeFormatSlashes(downMessage)
          : undefined,
        up_color: upColor,
        down_color: downColor,
        url: `${protocol}://${hostAndPath}`,
      }
    },
    dateAdded: new Date('2019-03-08'),
  }),
  redirector({
    category: 'monitoring',
    name: 'WebsiteUrlQueryParamRedirect',
    route: {
      base: 'website',
      pattern: ':protocol(https|http)/:hostAndPath+',
    },
    transformPath: () => '/website',
    transformQueryParams: ({ protocol, hostAndPath }) => ({
      url: `${protocol}://${hostAndPath}`,
    }),
    dateAdded: new Date('2019-09-17'),
  }),
]
