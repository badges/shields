'use strict'

function isSnapshotVersion(version) {
  const pattern = /(\d+\.)*[0-9a-fA-F]-SNAPSHOT/
  return version && version.match(pattern)
}

module.exports = {
  isSnapshotVersion,
}
