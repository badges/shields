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
      `SELECT token FROM ${this.table} ORDER BY RANDOM();`,
    )
    return result.rows.map(row => row.token)
  }

  async stop() {
    if (this.pool) {
      await this.pool.end()
    }
  }

  async onTokenAdded(token) {
    return await this.pool.query(
      `INSERT INTO ${this.table} (token) VALUES ($1::text) ON CONFLICT (token) DO NOTHING;`,
      [token],
    )
  }

  async onTokenRemoved(token) {
    return await this.pool.query(
      `DELETE FROM ${this.table} WHERE token=$1::text;`,
      [token],
    )
  }

  async noteTokenAdded(token) {
    try {
      await this.onTokenAdded(token)
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
