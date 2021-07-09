import { test, given } from 'sazerac'
import { escapeFormat } from './path-helpers.js'

describe('Badge URL helper functions', function () {
  test(escapeFormat, () => {
    given('_single leading underscore').expect(' single leading underscore')
    given('single trailing underscore_').expect('single trailing underscore ')
    given('__double leading underscores').expect('_double leading underscores')
    given('double trailing underscores__').expect(
      'double trailing underscores_'
    )
    given('treble___underscores').expect('treble_ underscores')
    given('fourfold____underscores').expect('fourfold__underscores')
    given('double--dashes').expect('double-dashes')
    given('treble---dashes').expect('treble--dashes')
    given('fourfold----dashes').expect('fourfold--dashes')
    given('once_in_a_blue--moon').expect('once in a blue-moon')
  })
})
