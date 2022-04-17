import { expect } from 'chai'
import { makeJsonBadge } from './make-json-badge.js'

describe('makeJsonBadge()', function () {
  it('should produce the expected JSON', function () {
    expect(
      makeJsonBadge({
        label: 'cactus',
        message: 'grown',
        links: ['https://example.com/', 'https://other.example.com/'],
      })
    ).to.deep.equal({
      name: 'cactus',
      label: 'cactus',
      value: 'grown',
      message: 'grown',
      link: ['https://example.com/', 'https://other.example.com/'],
      color: undefined,
      labelColor: undefined,
      logoWidth: undefined,
    })
  })
})
