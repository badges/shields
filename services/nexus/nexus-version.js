'use strict'

function isSnapshotVersion(version) {
  const pattern = /(\d+\.)*\d-SNAPSHOT/
  return version && version.match(pattern)
}

module.exports = {
  isSnapshotVersion,
}
