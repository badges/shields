'use strict'

function generateInstanceId() {
  // from https://gist.github.com/gordonbrander/2230317
  return Math.random()
    .toString(36)
    .substr(2, 9)
}

module.exports = generateInstanceId
