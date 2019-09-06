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

  public constructor(definitionData: ServiceDefinition[]) {
    this.definitionData = definitionData
  }

  public static create(definitionData: ServiceDefinition[]) {
    return new ServiceDefinitionSetHelper(definitionData)
  }

  public getCategory(wantedCategory: string) {
    return ServiceDefinitionSetHelper.create(
      this.definitionData.filter(({ category }) => category === wantedCategory)
    )
  }

  public search(query: string) {
    const predicate = predicateFromQuery(query)
    return ServiceDefinitionSetHelper.create(
      this.definitionData.filter(predicate)
    )
  }

  public notDeprecated() {
    return ServiceDefinitionSetHelper.create(
      this.definitionData.filter(({ isDeprecated }) => !isDeprecated)
    )
  }

  public toArray() {
    return this.definitionData
  }
}
