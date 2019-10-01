'use strict'

const Joi = require('@hapi/joi')

// https://support.codefactor.io/i14-glossary
const colorMap = {
  A: 'brightgreen',
  'A-': 'green',
  'B+': 'yellowgreen',
  B: 'yellowgreen',
  'B-': 'yellowgreen',
  'C+': 'yellow',
  C: 'yellow',
  'C-': 'yellow',
  'D+': 'orange',
  D: 'orange',
  'D-': 'orange',
  F: 'red',
}

const isValidGrade = Joi.valid(...Object.keys(colorMap)).required()

function gradeColor(grade) {
  const color = colorMap[grade]
  if (color === undefined) {
    throw Error(`Unknown grade: ${grade}`)
  }
  return color
}

module.exports = { isValidGrade, gradeColor }
