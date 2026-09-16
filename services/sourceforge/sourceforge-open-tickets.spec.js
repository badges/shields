import { expect } from 'chai'
import { InvalidParameter } from '../index.js'
import SourceforgeOpenTickets from './sourceforge-open-tickets.service.js'

describe('SourceforgeOpenTickets', function () {
  it('accepts valid ticket types', async function () {
    const service = new SourceforgeOpenTickets({}, {})
    service.fetch = async () => ({ count: 3 })

    const result = await service.handle({ project: 'example', type: 'bugs' })

    expect(result).to.deep.equal({ message: '3' })
  })

  it('rejects invalid ticket types', async function () {
    const service = new SourceforgeOpenTickets({}, {})

    try {
      await service.handle({ project: 'example', type: 'invalid' })
      expect.fail('Expected InvalidParameter error to be thrown')
    } catch (error) {
      expect(error).to.be.instanceOf(InvalidParameter)
      expect(error).to.have.property('prettyMessage', 'invalid ticket type')
    }
  })
})
