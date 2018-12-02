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
    return ServiceDefinitionSetHelper.create(
      this.definitionData.filter(() => false)
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
