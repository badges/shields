'use strict'

const { expect } = require('chai')
const { mergeQueries } = require('./graphql')

require('../register-chai-plugins.spec')

describe('mergeQueries function', function() {
  it('merges valid gql queries', function() {
    expect(
      mergeQueries('query ($param: String!) { foo(param: $param) { bar } }')
    ).to.equalIgnoreSpaces(
      'query ($param: String!) { foo(param: $param) { bar } }'
    )

    expect(
      mergeQueries(
        'query ($param: String!) { foo(param: $param) { bar } }',
        'query { baz }'
      )
    ).to.equalIgnoreSpaces(
      'query ($param: String!) { foo(param: $param) { bar } baz }'
    )

    expect(
      mergeQueries('query { foo }', 'query { bar }', 'query { baz }')
    ).to.equalIgnoreSpaces('{ foo bar baz }')

    expect(mergeQueries('{ foo }', '{ bar }')).to.equalIgnoreSpaces(
      '{ foo bar }'
    )
  })

  it('throws an error when passed invalid gql queries', function() {
    expect(() => mergeQueries('', '')).to.throw(Error)
    expect(() => mergeQueries(undefined, 17, true)).to.throw(Error)
  })
})
