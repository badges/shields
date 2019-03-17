'use strict'

const { metric } = require('../text-formatters')
const { floorCount: floorCountColor } = require('../color-formatters')

module.exports = function renderQuestionsBadge({
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
