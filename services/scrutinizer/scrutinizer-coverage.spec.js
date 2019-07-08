'use strict'

const { expect } = require('chai')
const { test, given } = require('sazerac')
const [ScrutinizerCoverage] = require('./scrutinizer-coverage.service')
const { NotFound } = require('..')

describe('ScrutinizerCoverage', function() {
  test(ScrutinizerCoverage.render, () => {
    given({ coverage: 39 }).expect({
      message: '39%',
      color: 'red',
    })
    given({ coverage: 40 }).expect({
      message: '40%',
      color: 'yellow',
    })
    given({ coverage: 60 }).expect({
      message: '60%',
      color: 'yellow',
    })
    given({ coverage: 61 }).expect({
      message: '61%',
      color: 'brightgreen',
    })
  })

  context('transform()', function() {
    it('throws NotFound error when there is no coverage data', function() {
      try {
        ScrutinizerCoverage.prototype.transform({
          branch: 'master',
          json: {
            applications: {
              master: {
                index: {
                  _embedded: {
                    project: {
                      metric_values: {},
                    },
                  },
                },
              },
            },
          },
        })
        expect.fail('Expected to throw')
      } catch (e) {
        expect(e).to.be.an.instanceof(NotFound)
        expect(e.prettyMessage).to.equal('coverage not found')
      }
    })
  })
})
