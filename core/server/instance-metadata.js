'use strict'

class InstanceMetadata {
  constructor(properties = {}) {
    this._id = properties.id
    this._generatedId = this._generateInstanceId()
    this._env = properties.env
    this._hostname = properties.hostname
  }

  get id() {
    return this._id
  }

  get env() {
    return this._env
  }

  get hostname() {
    return this._hostname
  }

  get generatedId() {
    return this._generatedId
  }

  _generateInstanceId() {
    // from https://gist.github.com/gordonbrander/2230317
    return Math.random()
      .toString(36)
      .substr(2, 9)
  }
}

module.exports = InstanceMetadata
