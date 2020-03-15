import escapeStringRegexp from 'escape-string-regexp'
import { Example, ServiceDefinition } from '.'

export function exampleMatchesRegex(example: Example, regex: RegExp): boolean {
  const { title, keywords } = example
  const haystack = [title].concat(keywords).join(' ')
  return regex.test(haystack)
}

export function predicateFromQuery(
  query: string
): ({ examples }: { examples: Example[] }) => boolean {
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

  public static create(
    definitionData: ServiceDefinition[]
  ): ServiceDefinitionSetHelper {
    return new ServiceDefinitionSetHelper(definitionData)
  }

  public getCategory(wantedCategory: string): ServiceDefinitionSetHelper {
    return ServiceDefinitionSetHelper.create(
      this.definitionData.filter(({ category }) => category === wantedCategory)
    )
  }

  public search(query: string): ServiceDefinitionSetHelper {
    const predicate = predicateFromQuery(query)
    return ServiceDefinitionSetHelper.create(
      this.definitionData.filter(predicate)
    )
  }

  public notDeprecated(): ServiceDefinitionSetHelper {
    return ServiceDefinitionSetHelper.create(
      this.definitionData.filter(({ isDeprecated }) => !isDeprecated)
    )
  }

  public toArray(): ServiceDefinition[] {
    return this.definitionData
  }
}
