exports.shorthands = undefined

exports.up = pgm => {
  pgm.addColumn('github_user_tokens', {
    scopes: { type: 'text[]' },
  })
  pgm.createIndex('github_user_tokens', 'scopes', { method: 'gin' })
}

exports.down = pgm => {
  pgm.dropIndex('github_user_tokens', 'scopes')
  pgm.dropColumn('github_user_tokens', 'scopes')
}
