function isNexusSnapshotVersion(version) {
  var pattern = /(\d+\.)*\d\-SNAPSHOT/;
  if (version) {
    return version.match(pattern);
  } else {
    return false;
  }
}

module.exports = {
  isNexusSnapshotVersion
};
