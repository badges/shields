import Joi from 'joi'

// https://support.codefactor.io/i14-glossary
// https://github.com/badges/shields/issues/4269
const colorMap = {
  'A+': 'brightgreen',
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
  '-': 'lightgrey',
}

const isValidGrade = Joi.valid(...Object.keys(colorMap)).required()

function gradeColor(grade) {
  const color = colorMap[grade]
  if (color === undefined) {
    throw Error(`Unknown grade: ${grade}`)
  }
  return color
}

export { isValidGrade, gradeColor }
