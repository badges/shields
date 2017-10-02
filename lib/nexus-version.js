'use strict';

function isSnapshotVersion(version) {
  const pattern = /(\d+\.)*\d\-SNAPSHOT/;
  if (version) {
    return version.match(pattern);
  } else {
    return false;
  }
}

module.exports = {
  isSnapshotVersion
};
