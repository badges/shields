import pg from 'pg'
import { expect } from 'chai'
import configModule from 'config'
import SqlTokenPersistence from './sql-token-persistence.js'

const config = configModule.util.toObject()
const postgresUrl = config?.private?.postgres_url
const tableName = 'token_persistence_integration_test'

describe('SQL token persistence', function () {
  let pool
  let persistence

  before('Mock db connection and load app', async function () {
    // Create a new pool with a connection limit of 1
    pool = new pg.Pool({
      connectionString: postgresUrl,

      // Reuse the connection to make sure we always hit the same pg_temp schema
      max: 1,

      // Disable auto-disconnection of idle clients to make sure we always hit the same pg_temp schema
      idleTimeoutMillis: 0,
    })
    persistence = new SqlTokenPersistence({
      url: postgresUrl,
      table: tableName,
    })
  })
  after(async function () {
    if (persistence) {
      await persistence.stop()
      persistence = undefined
    }
  })

  beforeEach('Create temporary table', async function () {
    await pool.query(
      `CREATE TEMPORARY TABLE ${tableName} (LIKE github_user_tokens INCLUDING ALL);`,
    )
  })
  afterEach('Drop temporary table', async function () {
    await pool.query(`DROP TABLE IF EXISTS pg_temp.${tableName};`)
  })

  context('when the key does not exist', function () {
    it('does nothing', async function () {
      const tokens = await persistence.initialize(pool)
      expect(tokens).to.deep.equal([])
    })
  })

  context('when the key exists', function () {
    const initialTokens = ['a', 'b', 'c'].map(char => char.repeat(40))

    beforeEach(async function () {
      initialTokens.forEach(async token => {
        await pool.query(
          `INSERT INTO pg_temp.${tableName} (token) VALUES ($1::text);`,
          [token],
        )
      })
    })

    it('loads the contents', async function () {
      const tokens = await persistence.initialize(pool)
      expect(tokens.sort()).to.deep.equal(initialTokens)
    })

    context('when tokens are added', function () {
      it('saves the change', async function () {
        const newToken = 'e'.repeat(40)
        const expected = initialTokens.slice()
        expected.push(newToken)

        await persistence.initialize(pool)
        await persistence.noteTokenAdded(newToken)

        const result = await pool.query(
          `SELECT token FROM pg_temp.${tableName};`,
        )
        const savedTokens = result.rows.map(row => row.token)
        expect(savedTokens.sort()).to.deep.equal(expected)
      })
    })

    context('when tokens are removed', function () {
      it('saves the change', async function () {
        const expected = Array.from(initialTokens)
        const toRemove = expected.pop()

        await persistence.initialize(pool)
        await persistence.noteTokenRemoved(toRemove)

        const result = await pool.query(
          `SELECT token FROM pg_temp.${tableName};`,
        )
        const savedTokens = result.rows.map(row => row.token)
        expect(savedTokens.sort()).to.deep.equal(expected)
      })
    })
  })
})
