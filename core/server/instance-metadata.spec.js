'use strict'

const { expect } = require('chai')
const InstanceMetadata = require('./instance-metadata')

describe('The instance metadata', function() {
  it('should store passed instance id', function() {
    const instanceMetadata = new InstanceMetadata({ id: 'test-instance-id' })
    expect(instanceMetadata.id).to.equal('test-instance-id')
  })

  it('should generate instance id if id is not passed', function() {
    const instanceMetadata = new InstanceMetadata()
    expect(instanceMetadata.id).to.not.be.empty
  })

  it('should generate instance id if passed id is empty', function() {
    const instanceMetadata = new InstanceMetadata({ id: '' })
    expect(instanceMetadata.id).to.not.be.empty
  })
})
