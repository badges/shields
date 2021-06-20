import Joi from 'joi'

const COLOR_MAP = {
  checking: 'brightgreen',
  compliant: 'green',
  'non-compliant': 'red',
  unregistered: 'red',
}

const isReuseCompliance = Joi.string()
  .valid('compliant', 'non-compliant', 'checking', 'unregistered')
  .required()

export { isReuseCompliance, COLOR_MAP }
