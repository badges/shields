'use strict'

const Joi = require('@hapi/joi')

const codacyGrade = Joi.equal('A', 'B', 'C', 'D', 'E', 'F')

module.exports = { codacyGrade }
