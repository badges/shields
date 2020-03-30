'use strict'

const { expect } = require('chai')
const {
  getStableVersions,
  getCurrentVersion,
  versionColorForRangeLts,
  versionColorForRangeCurrent,
} = require('./node-version-color')

describe('node version color', function() {
  describe(`stable`, function() {
    it('should only return lts versions', async function() {
      this.timeout(4000)
      const versions = await getStableVersions()
      versions.sort()
      const major = parseInt(
        versions[versions.length - 1].match(/(\d+)/)[0],
        10
      )
      expect(major % 2).to.eql(0)
    })
    it('should print green on lts versions', async function() {
      const versions = await getStableVersions()
      const range = versions.reduce(
        (range, version) => `${range} || ${version}`
      )
      const color = await versionColorForRangeLts(range)
      expect(color).to.eql('brightgreen')
    })
    it('should print yellow on lts bigger than range', async function() {
      const versions = await getStableVersions()
      versions.sort()
      const major = parseInt(versions[0].match(/(\d+)/)[0], 10) - 1
      const range = `^${major}`
      const color = await versionColorForRangeLts(range)
      expect(color).to.eql('yellow')
    })
  })
  describe(`latest`, function() {
    it('should print green on latest version', async function() {
      const version = await getCurrentVersion()
      const color = await versionColorForRangeCurrent(version)
      expect(color).to.eql('brightgreen')
    })
    it('should print yellow on latest bigger than range', async function() {
      const version = await getCurrentVersion()
      const major = parseInt(version.match(/(\d+)/)[0], 10) - 1
      const range = `^${major}`
      const color = await versionColorForRangeCurrent(range)
      expect(color).to.eql('yellow')
    })
  })
})
