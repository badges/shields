import { metric } from '../text-formatters.js'
import { floorCount as floorCountColor } from '../color-formatters.js'

export default function renderQuestionsBadge({
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
