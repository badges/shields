'use strict'

const fs = require('fs')
const tmp = require('tmp')
const readFile = require('fs-readfile-promise')
const { expect } = require('chai')
const FsTokenPersistence = require('./fs-token-persistence')
const githubAuth = require('./github-auth')

describe('File system token persistence', function() {
  beforeEach(githubAuth.removeAllTokens)
  afterEach(githubAuth.removeAllTokens)

  let path, persistence
  beforeEach(function() {
    path = tmp.tmpNameSync()
    persistence = new FsTokenPersistence({ path })
  })

  context('when the file does not exist', function() {
    it('does nothing', async function() {
      await persistence.initialize()
      expect(githubAuth.getAllTokenIds()).to.deep.equal([])
    })

    it('saving creates an empty file', async function() {
      await persistence.initialize()

      await persistence.save()

      const json = JSON.parse(await readFile(path))
      expect(json).to.deep.deep.equal([])
    })
  })

  context('when the file exists', function() {
    const initialTokens = ['a', 'b', 'c'].map(char => char.repeat(40))

    beforeEach(async function() {
      fs.writeFileSync(path, JSON.stringify(initialTokens))
    })

    it('loads the contents', async function() {
      await persistence.initialize()
      expect(githubAuth.getAllTokenIds()).to.deep.equal(initialTokens)
    })

    context('when tokens are added', function() {
      it('saves the change', async function() {
        const newToken = 'e'.repeat(40)
        const expected = initialTokens.slice()
        expected.push(newToken)

        await persistence.initialize()
        githubAuth.addGithubToken(newToken)
        await persistence.noteTokenAdded(newToken)

        const savedTokens = JSON.parse(await readFile(path))
        expect(savedTokens).to.deep.equal(expected)
      })
    })

    context('when tokens are removed', function() {
      it('saves the change', async function() {
        const expected = Array.from(initialTokens)
        const toRemove = expected.pop()

        await persistence.initialize()

        githubAuth.rmGithubToken(toRemove)
        await persistence.noteTokenRemoved(toRemove)

        const savedTokens = JSON.parse(await readFile(path))
        expect(savedTokens).to.deep.equal(expected)
      })
    })
  })
})
