class MissingOptionalDependencyError extends Error {
  constructor(dependencyName) {
    super(
      `${dependencyName} is not installed. Please install it to use related features.`,
    )
    this.name = 'MissingOptionalDependencyError'
    if (!MissingOptionalDependencyError.warnCreated) {
      MissingOptionalDependencyError.warnCreated = {}
    }
    if (!MissingOptionalDependencyError.warnCreated[dependencyName]) {
      console.warn(this.message)
      MissingOptionalDependencyError.warnCreated[dependencyName] = true
    }
  }
}

export { MissingOptionalDependencyError }
