import groupBy from 'lodash.groupby'

import { services } from '../../../service-definitions.yml'
export { services, categories } from '../../../service-definitions.yml'

export function getCategoryName(category) {
  return category.find(({ id }) => id === category).map(({ name } = {}) => name)
}

const byCategory = groupBy(services, 'category')
export function getDefinitionsForCategory(category) {
  return byCategory[category]
}
