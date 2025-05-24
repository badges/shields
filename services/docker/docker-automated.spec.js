import DockerAutomatedBuild from './docker-automated.service.js'
const { expect } = require('chai')
const { createServiceTester } = require('../tester')
const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')

const t = createServiceTester(DockerAutomatedBuild)

describe('DockerAutomatedBuild', function () {
  it('returns the expected response', async function () {
    const response = await t.request({ user: 'jrottenberg', name: 'ffmpeg' })
    expect(response).to.be.an('object')
    expect(response).to.have.property('schemaVersion', 1)
    expect(response).to.have.property('label', 'docker build')
    expect(response).to.have.property('message')
    expect(response.message).to.match(isVPlusDottedVersionAtLeastOne)
  })
})
