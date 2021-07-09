import { expect } from 'chai'
import { buildRedirectUrl, buildUrl } from './jenkins-common.js'

describe('jenkins-common', function () {
  describe('buildUrl', function () {
    it('returns the json api url', function () {
      const actualResult = buildUrl({
        jobUrl: 'https://ci.eclipse.org/jgit/job/jgit',
      })

      expect(actualResult).to.equal(
        'https://ci.eclipse.org/jgit/job/jgit/lastCompletedBuild/api/json'
      )
    })

    it('returns the json api url including a plugin name', function () {
      const actualResult = buildUrl({
        jobUrl: 'https://ci.eclipse.org/jgit/job/jgit',
        plugin: 'cobertura',
      })

      expect(actualResult).to.equal(
        'https://ci.eclipse.org/jgit/job/jgit/lastCompletedBuild/cobertura/api/json'
      )
    })

    it('returns the json api url without the lastCompletedBuild element', function () {
      const actualResult = buildUrl({
        jobUrl: 'https://ci.eclipse.org/jgit/job/jgit',
        lastCompletedBuild: false,
      })

      expect(actualResult).to.equal(
        'https://ci.eclipse.org/jgit/job/jgit/api/json'
      )
    })
  })

  describe('buildRedirectUrl', function () {
    it('returns the job url', function () {
      const actualResult = buildRedirectUrl({
        protocol: 'https',
        host: 'jenkins.sqlalchemy.org',
        job: 'job/alembic_coverage',
      })

      expect(actualResult).to.equal(
        'https://jenkins.sqlalchemy.org/job/alembic_coverage'
      )
    })

    it('returns the job url and adds missing /job prefixes', function () {
      const actualResult = buildRedirectUrl({
        protocol: 'https',
        host: 'jenkins.sqlalchemy.org',
        job: 'alembic_coverage',
      })

      expect(actualResult).to.equal(
        'https://jenkins.sqlalchemy.org/job/alembic_coverage'
      )
    })
  })
})
