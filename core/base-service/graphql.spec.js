import { expect } from 'chai'
import gql from 'graphql-tag'
import { print } from 'graphql/language/printer.js'
import { mergeQueries } from './graphql.js'

import '../register-chai-plugins.spec.js'

describe('mergeQueries function', function () {
  it('merges valid gql queries', function () {
    expect(
      print(
        mergeQueries(
          gql`
            query ($param: String!) {
              foo(param: $param) {
                bar
              }
            }
          `
        )
      )
    ).to.equalIgnoreSpaces(
      'query ($param: String!) { foo(param: $param) { bar } }'
    )

    expect(
      print(
        mergeQueries(
          gql`
            query ($param: String!) {
              foo(param: $param) {
                bar
              }
            }
          `,
          gql`
            query {
              baz
            }
          `
        )
      )
    ).to.equalIgnoreSpaces(
      'query ($param: String!) { foo(param: $param) { bar } baz }'
    )

    expect(
      print(
        mergeQueries(
          gql`
            query {
              foo
            }
          `,
          gql`
            query {
              bar
            }
          `,
          gql`
            query {
              baz
            }
          `
        )
      )
    ).to.equalIgnoreSpaces('{ foo bar baz }')

    expect(
      print(
        mergeQueries(
          gql`
            {
              foo
            }
          `,
          gql`
            {
              bar
            }
          `
        )
      )
    ).to.equalIgnoreSpaces('{ foo bar }')
  })

  it('throws an error when passed invalid params', function () {
    expect(() => mergeQueries('', '')).to.throw(Error)
    expect(() => mergeQueries(undefined, 17, true)).to.throw(Error)
    expect(() => mergeQueries(gql``, gql`foo`)).to.throw(Error)
  })
})
