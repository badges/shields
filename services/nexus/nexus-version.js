function isSnapshotVersion(version) {
  const pattern = /(\d+\.)*[0-9a-f]-SNAPSHOT/
  return version && version.match(pattern)
}

export { isSnapshotVersion }
