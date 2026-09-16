exports.shorthands = undefined

exports.up = pgm => {
  pgm.addColumn('github_user_tokens', {
    scopes: { type: 'text[]' },
  })
}

exports.down = pgm => {
  pgm.dropColumn('github_user_tokens', 'scopes')
}
