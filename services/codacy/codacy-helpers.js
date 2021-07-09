import Joi from 'joi'

const codacyGrade = Joi.equal('A', 'B', 'C', 'D', 'E', 'F')

export { codacyGrade }
