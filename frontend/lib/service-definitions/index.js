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
