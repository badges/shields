import pg from 'pg'
import log from '../server/log.js'

export default class SqlTokenPersistence {
  constructor({ url, table }) {
    this.url = url
    this.table = table
    this.noteTokenAdded = this.noteTokenAdded.bind(this)
    this.noteTokenRemoved = this.noteTokenRemoved.bind(this)
  }

  async initialize(pool) {
    if (pool) {
      this.pool = pool
    } else {
      this.pool = new pg.Pool({ connectionString: this.url })
    }
    const result = await this.pool.query(
      `SELECT token, scopes FROM ${this.table} ORDER BY RANDOM();`,
    )
    return result.rows.map(({ token, scopes }) => ({ token, scopes }))
  }

  async stop() {
    if (this.pool) {
      await this.pool.end()
    }
  }

  async onTokenAdded(token, { scopes } = {}) {
    return await this.pool.query(
      `
        INSERT INTO ${this.table} (token, scopes)
        VALUES ($1::text, $2::text[])
        ON CONFLICT (token) DO UPDATE
        SET scopes = EXCLUDED.scopes
        WHERE EXCLUDED.scopes IS NOT NULL;
      `,
      [token, scopes],
    )
  }

  async onTokenRemoved(token) {
    return await this.pool.query(
      `DELETE FROM ${this.table} WHERE token=$1::text;`,
      [token],
    )
  }

  async noteTokenAdded(token, data) {
    try {
      await this.onTokenAdded(token, data)
    } catch (e) {
      log.error(e)
    }
  }

  async noteTokenRemoved(token) {
    try {
      await this.onTokenRemoved(token)
    } catch (e) {
      log.error(e)
    }
  }
}
