'use strict'

const { test, given } = require('sazerac')
const CodeFactorGrade = require('./codefactor-grade.service')

describe('CodeFactorGrade', function () {
  test(CodeFactorGrade.render, () => {
    given({ grade: 'A' }).expect({
      message: 'A',
      color: 'brightgreen',
    })
    given({ grade: 'A-' }).expect({
      message: 'A-',
      color: 'green',
    })
    given({ grade: 'B+' }).expect({
      message: 'B+',
      color: 'yellowgreen',
    })
    given({ grade: 'B' }).expect({
      message: 'B',
      color: 'yellowgreen',
    })
    given({ grade: 'B-' }).expect({
      message: 'B-',
      color: 'yellowgreen',
    })
    given({ grade: 'C+' }).expect({
      message: 'C+',
      color: 'yellow',
    })
    given({ grade: 'C' }).expect({
      message: 'C',
      color: 'yellow',
    })
    given({ grade: 'C-' }).expect({
      message: 'C-',
      color: 'yellow',
    })
    given({ grade: 'D+' }).expect({
      message: 'D+',
      color: 'orange',
    })
    given({ grade: 'D' }).expect({
      message: 'D',
      color: 'orange',
    })
    given({ grade: 'D-' }).expect({
      message: 'D-',
      color: 'orange',
    })
    given({ grade: 'F' }).expect({
      message: 'F',
      color: 'red',
    })
  })
})
