'use strict'

module.exports = {
  invalidJSON: () => [
    200,
    '{{{{{invalid json}}',
    { 'Content-Type': 'application/json' },
  ],
}
