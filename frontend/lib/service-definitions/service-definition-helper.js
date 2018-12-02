export default class ServiceDefinitionHelper {
  constructor(serviceDefinitionData) {
    this.serviceDefinitionData = serviceDefinitionData
  }

  get isDeprecated() {
    return this.serviceDefinitionData.isDeprecated
  }
}
