import { escapeFormat } from '../../core/badge-urls/path-helpers.js'
import { BaseStaticService } from '../index.js'

export default class StaticBadge extends BaseStaticService {
  static category = 'static'

  static route = {
    base: '',
    format: '(?::|badge/)((?:[^-]|--)*?)-?((?:[^-]|--)*)-((?:[^-.]|--)+)',
    capture: ['label', 'message', 'color'],
  }

  handle({ label, message, color }) {
    return { label: escapeFormat(label), message: escapeFormat(message), color }
  }
}
