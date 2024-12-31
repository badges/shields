exports.shorthands = undefined

exports.up = pgm => {
  pgm.createTable('github_user_tokens', {
    id: 'id',
    token: { type: 'varchar(1000)', notNull: true, unique: true },
  })
}

exports.down = pgm => {
  pgm.dropTable('github_user_tokens')
}
