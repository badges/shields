import groupBy from 'lodash.groupby'
// load using js-yaml-loader
import definitions from '../../service-definitions.yml'

export interface Category {
  id: string
  name: string
  keywords: string[]
}

export interface ExampleSignature {
  pattern: string
  namedParams: { [k: string]: string }
  queryParams: { [k: string]: string }
}

export interface Preview {
  label?: string
  message: string
  color: string
  style?: string
  namedLogo?: string
}

export interface Example {
  title: string
  example: ExampleSignature
  preview: Preview
  keywords: string[]
  documentation?: {
    __html: string
  }
}

export interface Route {
  pattern: string
  queryParams: string[]
}

export interface LegacyRoute {
  format: string
  queryParams: string[]
}

export interface ServiceDefinition {
  category: string
  name: string
  isDeprecated: boolean
  route: Route | LegacyRoute
  examples: Example[]
}

export const services = definitions.services as ServiceDefinition[]
export const categories = definitions.categories as Category[]

export function findCategory(category: string): Category | undefined {
  return categories.find(({ id }) => id === category)
}

const byCategory = groupBy(services, 'category')
export function getDefinitionsForCategory(
  category: string
): ServiceDefinition[] {
  return byCategory[category] || []
}

export interface Suggestion {
  title: string
  link: string
  example: ExampleSignature
  preview: {
    style?: string
  }
}

export type RenderableExample = Example | Suggestion
