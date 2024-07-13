import { escapeFormat } from '../../core/badge-urls/path-helpers.js'
import { BaseStaticService } from '../index.js'

const description = `
The static badge accepts a single required path parameter which encodes either:

<ul>
  <li>
    Label, message and color separated by a dash <code>-</code>. For example:<br />
    <img alt="any text: you like" src="https://img.shields.io/badge/any_text-you_like-blue" /> -
    https://img.shields.io/badge/any_text-you_like-blue
  </li>
  <li>
    Message and color only, separated by a dash <code>-</code>. For example:<br />
    <img alt="just the message" src="https://img.shields.io/badge/just%20the%20message-8A2BE2" /> -
    https://img.shields.io/badge/just%20the%20message-8A2BE2
  </li>
</ul>

<table>
  <tbody>
    <tr>
      <th>URL input</th>
      <th>Badge output</th>
    </tr>
    <tr>
      <td>Underscore <code>_</code> or <code>%20</code></td>
      <td>Space <code>&nbsp;</code></td>
    </tr>
    <tr>
      <td>Double underscore <code>__</code></td>
      <td>Underscore <code>_</code></td>
    </tr>
    <tr>
      <td>Double dash <code>--</code></td>
      <td>Dash <code>-</code></td>
    </tr>
  </tbody>
</table>

Hex, rgb, rgba, hsl, hsla and css named colors may be used.
`

export default class StaticBadge extends BaseStaticService {
  static category = 'static'
  static route = {
    base: '',
    format: '(?::|badge/)((?:[^-]|--)*?)-?((?:[^-]|--)*)-((?:[^-.]|--)+)',
    capture: ['label', 'message', 'color'],
  }

  static openApi = {
    '/badge/{badgeContent}': {
      get: {
        summary: 'Static Badge',
        description,
        parameters: [
          {
            name: 'badgeContent',
            description:
              'Label, (optional) message, and color. Separated by dashes',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: 'build-passing-brightgreen',
          },
        ],
      },
    },
  }

  handle({ label, message, color }) {
    return { label: escapeFormat(label), message: escapeFormat(message), color }
  }
}
