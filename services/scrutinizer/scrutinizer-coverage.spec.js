import { expect } from 'chai'
import { test, given } from 'sazerac'
import { InvalidResponse, NotFound } from '../index.js'
import { ScrutinizerCoverage } from './scrutinizer-coverage.service.js'

describe('ScrutinizerCoverage', function () {
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

  context('transform()', function () {
    it('throws NotFound error when there is no coverage data', function () {
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
    it('throws InvalidResponse error when branch is missing statistics', function () {
      expect(() =>
        ScrutinizerCoverage.prototype.transform({
          branch: 'gh-pages',
          json: {
            applications: {
              master: { index: {} },
              'gh-pages': {
                build_status: {
                  status: 'unknown',
                },
              },
            },
          },
        })
      )
        .to.throw(InvalidResponse)
        .with.property('prettyMessage', 'metrics missing for branch')
    })
  })
})
