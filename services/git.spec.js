'use strict'

const { expect } = require('chai')
const { getDefaultBranch } = require('./git')
const { InvalidResponse, NotFound } = require('.')

function mockSimpleGitValid(text) {
  return {
    listRemote: async function () {
      return text
    },
  }
}

function mockSimpleGitInvalid() {
  return {
    listRemote: async function () {
      throw new Error()
    },
  }
}

describe('git helper', function () {
  it('finds the branch name with expected response', async function () {
    expect(
      await getDefaultBranch({
        baseUrl: 'https://github.com',
        user: 'badges',
        repo: 'shields',
        simpleGit: mockSimpleGitValid(
          'ref: refs/heads/trunk	HEAD\na24edacbf872f4eca987e5400432084eb8b4f635	HEAD\na475913d60b3ddc5c66641686fc765b18b04fa58	refs/heads/HEAD'
        ),
      })
    ).to.equal('trunk')
  })

  it('throws InvalidResponse with unexpected response', async function () {
    expect(
      getDefaultBranch({
        baseUrl: 'https://github.com',
        user: 'badges',
        repo: 'shields',
        simpleGit: mockSimpleGitValid('foobar'),
      })
    ).to.be.rejectedWith(InvalidResponse)
  })

  it('throws NotFound if repo not found/private', async function () {
    expect(
      getDefaultBranch({
        baseUrl: 'https://github.com',
        user: 'badges',
        repo: 'shields',
        simpleGit: mockSimpleGitInvalid('foobar'),
      })
    ).to.be.rejectedWith(NotFound)
  })
})
