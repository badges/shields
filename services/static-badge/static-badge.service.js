import { escapeFormat } from '../../core/badge-urls/path-helpers.js'
import { BaseStaticService } from '../index.js'

export default class StaticBadge extends BaseStaticService {
  static category = 'static'
  static route = {
    base: '',
    format: '(?::|badge/)((?:[^-]|--)*?)-?((?:[^-]|--)*)-((?:[^-.]|--)+)',
    capture: ['label', 'message', 'color'],
  }

  static examples = [
    {
      title: 'Static Badge',
      namedParams: { badgeContent: 'build-passing-brightgreen' },
      pattern: 'badge/:badgeContent',

      documentation: `<p>
        The static badge accepts a single required path parameter which encodes either:
        <ul>
          <li>
            Label, message and color seperated by a dash <code>-</code>. For example:<br />
            <img alt="any text: you like" src="https://img.shields.io/badge/any_text-you_like-blue" /> -
            <a href="https://img.shields.io/badge/any_text-you_like-blue">https://img.shields.io/badge/any_text-you_like-blue</a>
          </li>
          <li>
            Message and color only, seperated by a dash <code>-</code>. For example:<br />
            <img alt="just the message" src="https://img.shields.io/badge/just%20the%20message-8A2BE2" /> -
            <a href="https://img.shields.io/badge/just%20the%20message-8A2BE2">https://img.shields.io/badge/just%20the%20message-8A2BE2</a>
          </li>
        </ul>
      </p>
      <table>
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
      </table>
      <p>
        Hex, rgb, rgba, hsl, hsla and css named colors may be used.
      </p>`,
      staticPreview: {
        label: 'build',
        message: 'passing',
        color: 'brightgreen',
      },
    },
  ]

  handle({ label, message, color }) {
    return { label: escapeFormat(label), message: escapeFormat(message), color }
  }
}
