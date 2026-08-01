import { expect } from 'chai'
import sinon from 'sinon'
import SqlTokenPersistence from './sql-token-persistence.js'

describe('SQL token persistence unit', function () {
  const tableName = 'github_user_tokens'

  let pool
  let persistence

  beforeEach(function () {
    pool = { query: sinon.stub() }
    persistence = new SqlTokenPersistence({
      url: 'postgres://example.test/shields',
      table: tableName,
    })
  })

  it('loads token scopes', async function () {
    pool.query.resolves({
      rows: [
        { token: 'unscoped-token', scopes: null },
        { token: 'scoped-token', scopes: ['read:packages'] },
      ],
    })

    const tokens = await persistence.initialize(pool)

    expect(tokens).to.deep.equal([
      { token: 'unscoped-token', scopes: null },
      { token: 'scoped-token', scopes: ['read:packages'] },
    ])
    sinon.assert.calledOnceWithExactly(
      pool.query,
      `SELECT token, scopes FROM ${tableName} ORDER BY RANDOM();`,
    )
  })

  it('saves token scopes', async function () {
    pool.query.resolves({ rows: [] })
    await persistence.initialize(pool)

    await persistence.onTokenAdded('scoped-token', {
      scopes: ['read:packages'],
    })

    const [, params] = pool.query.secondCall.args
    expect(params).to.deep.equal(['scoped-token', ['read:packages']])
  })
})
