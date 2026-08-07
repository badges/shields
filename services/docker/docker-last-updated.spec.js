import { expect } from 'chai'
import { test, given } from 'sazerac'
import { NotFound } from '../index.js'
import DockerLastUpdated from './docker-last-updated.service.js'

describe('DockerLastUpdated', function () {
  test(DockerLastUpdated.prototype.transform, () => {
    given({
      tag: '',
      data: {
        count: 1,
        results: [{ last_updated: '2026-08-06T20:24:42.17447Z' }],
      },
    }).expect({
      date: '2026-08-06T20:24:42.17447Z',
    })
    given({
      tag: 'latest',
      data: { last_updated: '2026-06-16T02:24:22.835730996Z' },
    }).expect({
      date: '2026-06-16T02:24:22.835730996Z',
    })
  })

  it('throws NotFound when repository has no tags', function () {
    expect(() => {
      DockerLastUpdated.prototype.transform({
        tag: '',
        data: { count: 0, results: [] },
      })
    })
      .to.throw(NotFound)
      .with.property('prettyMessage', 'repository not found')
  })

  it('throws NotFound when results list is empty', function () {
    expect(() => {
      DockerLastUpdated.prototype.transform({
        tag: '',
        data: { count: 1, results: [] },
      })
    })
      .to.throw(NotFound)
      .with.property('prettyMessage', 'repository not found')
  })
})
