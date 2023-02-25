import pg from 'pg'
import RedisTokenPersistence from '../core/token-pooling/redis-token-persistence.js'

let redisUrl, postgresUrl

try {
  redisUrl = process.argv[2]
  postgresUrl = process.argv[3]
  if (
    !redisUrl.startsWith('rediss://') ||
    !postgresUrl.startsWith('postgresql://')
  ) {
    throw new Error()
  }
} catch (e) {
  process.stdout.write(
    'Usage: migrate-token-pool.js [redis-url] [postgres-url]\n'
  )
  process.exit(1)
}

;(async () => {
  const redis = new RedisTokenPersistence({
    url: redisUrl,
    key: 'githubUserTokens',
  })

  const tokens = await redis.initialize()
  await redis.stop()
  console.log(`${tokens.length} tokens in redis source`)

  const pool = new pg.Pool({ connectionString: postgresUrl })

  let bulkInsert = 'INSERT INTO github_user_tokens (token) VALUES '
  bulkInsert += tokens.map(token => `('${token}')`).join(',')
  bulkInsert += ' ON CONFLICT (token) DO NOTHING;'
  await pool.query(bulkInsert)

  const result = await pool.query('SELECT COUNT(*) FROM github_user_tokens;')
  console.log(`${result.rows[0].count} tokens in postgres dest`)
  await pool.end()
})()
