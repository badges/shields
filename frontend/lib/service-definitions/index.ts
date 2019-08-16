import groupBy from 'lodash.groupby'
// load using js-yaml-loader
import definitions from '../../../service-definitions.yml'

export interface Category {
  id: string
  name: string
}

export interface Example {
  title: string
  example: {
    pattern: string
    namedParams: { [k: string]: string }
    queryParams: { [k: string]: string }
  }
  preview: {
    label?: string
    message: string
    color: string
    style?: string
    namedLogo?: string
  }
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

export function findCategory(category: string) {
  return categories.find(({ id }) => id === category)
}

const byCategory = groupBy(services, 'category')
export function getDefinitionsForCategory(category: string) {
  return byCategory[category]
}
