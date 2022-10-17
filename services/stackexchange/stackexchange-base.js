import { BaseJsonService } from '../index.js'
import { metric } from '../text-formatters.js'
import { floorCount as floorCountColor } from '../color-formatters.js'

export function renderQuestionsBadge({
  suffix,
  stackexchangesite,
  query,
  numValue,
}) {
  const label = `${stackexchangesite} ${query} questions`
  return {
    label,
    message: `${metric(numValue)}${suffix}`,
    color: floorCountColor(numValue, 1000, 10000, 20000),
  }
}

export class StackExchangeBase extends BaseJsonService {
  static category = 'chat'

  static defaultBadgeData = {
    label: 'stackoverflow',
  }
}
