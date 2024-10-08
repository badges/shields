exports.shorthands = undefined

exports.up = pgm => {
  pgm.addColumn('github_user_tokens', {
    created: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  })
}

exports.down = pgm => {
  pgm.dropColumn('github_user_tokens', 'created')
}
