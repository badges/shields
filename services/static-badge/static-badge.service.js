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

Examples of additional options:
<ul>
  <li>
    <b>Style:</b> <img alt="style: for-the-badge" src="https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge" /> -
    https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge
  </li>
  <li>
    <b>Color (named):</b> <img alt="color: orange" src="https://img.shields.io/badge/coverage-95%25-orange" /> -
    https://img.shields.io/badge/coverage-95%25-orange
  </li>
  <li>
    <b>Logo:</b> <img alt="logo: GitHub" src="https://img.shields.io/badge/github-repo-blue?logo=github" /> -
    https://img.shields.io/badge/github-repo-blue?logo=github
  </li>
</ul>

<i>Hex, rgb, rgba, hsl, hsla and css named colors may be used. <b>Note:</b> Some named colors may differ from CSS color values. For a list of named colors, see the <a href="https://github.com/badges/shields/tree/master/badge-maker#colors" target="_blank">badge-maker readme</a>.</i>
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
