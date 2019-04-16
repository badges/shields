import groupBy from 'lodash.groupby'
import { services, categories } from '../../../service-definitions.yml'
export { services, categories } from '../../../service-definitions.yml'

export function findCategory(category) {
  return categories.find(({ id }) => id === category)
}

const byCategory = groupBy(services, 'category')
export function getDefinitionsForCategory(category) {
  return byCategory[category]
}

export function getExampleWithServiceByPattern(pattern) {
  const service = services.find(
    service =>
      service.examples.find(e => e.example.pattern === pattern) !== undefined
  )
  if (service === undefined) {
    return undefined
  } else {
    const example = service.examples.find(e => e.example.pattern === pattern)
    return { service, example }
  }
}
