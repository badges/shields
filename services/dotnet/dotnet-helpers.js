function normalizeTargetFramework(targetFramework) {
  if (!targetFramework) {
    return 'all'
  }
  if (targetFramework.startsWith('.NETFramework')) {
    const version = targetFramework.slice('.NETFramework'.length)
    return `net${version.replace(/\./g, '')}`
  }
  if (targetFramework.startsWith('.NETStandard')) {
    return `netstandard${targetFramework.slice('.NETStandard'.length)}`
  }
  if (targetFramework.startsWith('.NETCoreApp')) {
    return `netcoreapp${targetFramework.slice('.NETCoreApp'.length)}`
  }
  return targetFramework.toLowerCase()
}

function extractTargetFrameworks(dependencyGroups) {
  const frameworks = dependencyGroups.map(group =>
    normalizeTargetFramework(group.targetFramework),
  )
  return [...new Set(frameworks)].sort()
}

const REGISTRATION_BASE_URL =
  'https://api.nuget.org/v3/registration5-gz-semver2/'

export {
  normalizeTargetFramework,
  extractTargetFrameworks,
  REGISTRATION_BASE_URL,
}
