'use strict'

const { expect } = require('chai')
const InstanceMetadata = require('./instance-metadata')

describe('The instance metadata', function() {
  it('should store passed instance id', function() {
    const instanceMetadata = new InstanceMetadata({ id: 'test-instance-id' })
    expect(instanceMetadata.id).to.equal('test-instance-id')
  })

  it('should return generated instance id', function() {
    const instanceMetadata = new InstanceMetadata()
    expect(instanceMetadata.generatedId).to.not.be.empty
  })

  it('should store passed environment', function() {
    const instanceMetadata = new InstanceMetadata({ env: 'test-env' })
    expect(instanceMetadata.env).to.equal('test-env')
  })

  it('should return hostname', function() {
    const instanceMetadata = new InstanceMetadata({ hostname: 'test-hostname' })
    expect(instanceMetadata.hostname).to.equal('test-hostname')
  })
})
