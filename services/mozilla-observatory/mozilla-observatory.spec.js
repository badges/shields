import { test, given } from 'sazerac'
import MozillaObservatory from './mozilla-observatory.service.js'

describe('MozillaObservatory', function () {
  test(MozillaObservatory.render, () => {
    given({ format: 'grade', grade: 'A' }).expect({
      message: 'A',
      color: 'brightgreen',
    })
    given({ format: 'grade', grade: 'A+' }).expect({
      message: 'A+',
      color: 'brightgreen',
    })
    given({ format: 'grade', grade: 'A-' }).expect({
      message: 'A-',
      color: 'brightgreen',
    })

    given({ format: 'grade', grade: 'B' }).expect({
      message: 'B',
      color: 'green',
    })
    given({ format: 'grade', grade: 'B+' }).expect({
      message: 'B+',
      color: 'green',
    })
    given({ format: 'grade', grade: 'B-' }).expect({
      message: 'B-',
      color: 'green',
    })

    given({ format: 'grade', grade: 'C' }).expect({
      message: 'C',
      color: 'yellow',
    })
    given({ format: 'grade', grade: 'C+' }).expect({
      message: 'C+',
      color: 'yellow',
    })
    given({ format: 'grade', grade: 'C-' }).expect({
      message: 'C-',
      color: 'yellow',
    })

    given({ format: 'grade', grade: 'D' }).expect({
      message: 'D',
      color: 'orange',
    })
    given({ format: 'grade', grade: 'D+' }).expect({
      message: 'D+',
      color: 'orange',
    })
    given({ format: 'grade', grade: 'D-' }).expect({
      message: 'D-',
      color: 'orange',
    })

    given({ format: 'grade', grade: 'E' }).expect({
      message: 'E',
      color: 'orange',
    })
    given({ format: 'grade', grade: 'E+' }).expect({
      message: 'E+',
      color: 'orange',
    })
    given({ format: 'grade', grade: 'E-' }).expect({
      message: 'E-',
      color: 'orange',
    })

    given({ format: 'grade', grade: 'F' }).expect({
      message: 'F',
      color: 'red',
    })
    given({ format: 'grade', grade: 'F+' }).expect({
      message: 'F+',
      color: 'red',
    })
    given({ format: 'grade', grade: 'F-' }).expect({
      message: 'F-',
      color: 'red',
    })

    given({
      format: 'grade-score',
      grade: 'A',
      score: '115',
    }).expect({
      message: 'A (115/100)',
      color: 'brightgreen',
    })
  })
})
