'use strict'

class InstanceMetadata {
  constructor(properties = {}) {
    this._id = properties.id || this._generateInstanceId()
  }

  get id() {
    return this._id
  }

  _generateInstanceId() {
    // from https://gist.github.com/gordonbrander/2230317
    return Math.random()
      .toString(36)
      .substr(2, 9)
  }
}

module.exports = InstanceMetadata
