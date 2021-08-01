function transform({ dependencies }) {
  return {
    deprecatedCount: dependencies.filter(dep => dep.deprecated).length,
    outdatedCount: dependencies.filter(dep => dep.outdated).length,
  }
}

function renderDependenciesBadge({ deprecatedCount, outdatedCount }) {
  if (deprecatedCount > 0) {
    // Deprecated dependencies are really bad
    return {
      message: `${deprecatedCount} deprecated`,
      color: 'red',
    }
  } else if (outdatedCount > 0) {
    // Out of date dependencies are pretty bad
    return {
      message: `${outdatedCount} out of date`,
      color: 'orange',
    }
  } else {
    return {
      message: 'up to date',
      color: 'brightgreen',
    }
  }
}

export { transform, renderDependenciesBadge }
