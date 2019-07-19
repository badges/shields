import escapeStringRegexp from 'escape-string-regexp'
import { Example, ServiceDefinition } from '.'

export function exampleMatchesRegex(example: Example, regex: RegExp) {
  const { title, keywords } = example
  const haystack = [title].concat(keywords).join(' ')
  return regex.test(haystack)
}

export function predicateFromQuery(query: string) {
  const escaped = escapeStringRegexp(query)
  const regex = new RegExp(escaped, 'i') // Case-insensitive.
  return ({ examples }: { examples: Example[] }) =>
    examples.some(example => exampleMatchesRegex(example, regex))
}

export default class ServiceDefinitionSetHelper {
  private readonly definitionData: ServiceDefinition[]

  constructor(definitionData: ServiceDefinition[]) {
    this.definitionData = definitionData
  }

  static create(definitionData: ServiceDefinition[]) {
    return new ServiceDefinitionSetHelper(definitionData)
  }

  getCategory(wantedCategory: string) {
    return ServiceDefinitionSetHelper.create(
      this.definitionData.filter(({ category }) => category === wantedCategory)
    )
  }

  search(query: string) {
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
