'use strict'

const invalidJSONString = '{{{{{invalid json}}'

module.exports = {
  invalidJSON: () => [
    200,
    invalidJSONString,
    { 'Content-Type': 'application/json' },
  ],
  invalidJSONString,
}
