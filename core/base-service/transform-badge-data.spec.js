import { transformBadgeData } from './transform-badge-data.js'

describe('transformBadgeData()', () => {
  it('should produce the expected JSON', function () {
    expect(
      transformBadgeData({
        label: 'cactus',
        message: 'grown',
        format: 'json',
        links: ['https://example.com/', 'https://other.example.com/'],
      })
    ).to.deep.equal({
      name: 'cactus',
      label: 'cactus',
      value: 'grown',
      message: 'grown',
      link: ['https://example.com/', 'https://other.example.com/'],
    })
  })
})
