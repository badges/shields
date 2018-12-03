import { predicateFromQuery } from '../prepare-examples'

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

  asNative() {
    return this.definitionData
  }
}
