import escapeStringRegexp from 'escape-string-regexp'

export function exampleMatchesRegex(example, regex) {
  const { title, keywords } = example
  const haystack = [title].concat(keywords).join(' ')
  return regex.test(haystack)
}

export function predicateFromQuery(query) {
  const escaped = escapeStringRegexp(query)
  const regex = new RegExp(escaped, 'i') // Case-insensitive.
  return ({ examples }) =>
    examples.some(example => exampleMatchesRegex(example, regex))
}

export default class ServiceDefinitionSetHelper {
  constructor(definitionData) {
    this.definitionData = definitionData
  }

  static create(definitionData) {
    return new ServiceDefinitionSetHelper(definitionData)
  }

  getCategory(wantedCategory) {
    return ServiceDefinitionSetHelper.create(
      this.definitionData.filter(({ category }) => category === wantedCategory)
    )
  }

  search(query) {
    const predicate = predicateFromQuery(query)
    return ServiceDefinitionSetHelper.create(
      this.definitionData.filter(predicate)
    )
  }

  notDeprecated() {
    return ServiceDefinitionSetHelper.create(
      this.definitionData.filter(({ isDeprecated }) => !isDeprecated)
    )
  }

  toArray() {
    return this.definitionData
  }
}
