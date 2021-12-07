import Joi from 'joi'

const queryParamSchema = Joi.object({
  up_message: Joi.string(),
  down_message: Joi.string(),
  up_color: Joi.alternatives(Joi.string(), Joi.number()),
  down_color: Joi.alternatives(Joi.string(), Joi.number()),
  status_code_less_than: Joi.number().integer().min(1).max(999),
  status_code_more_than: Joi.number().integer().min(0).max(998),
}).required()

const exampleQueryParams = {
  up_message: 'online',
  up_color: 'blue',
  down_message: 'offline',
  down_color: 'lightgrey',
  status_code_less_than: '400',
  status_code_more_than: '199',
}

function renderWebsiteStatus({
  isUp,
  upMessage = 'up',
  downMessage = 'down',
  upColor = 'brightgreen',
  downColor = 'red',
  statusCodeLessThan = 310,
  statusCodeMoreThan = 0,
}) {
  if (isUp) {
    return { message: upMessage, color: upColor }
  } else {
    return { message: downMessage, color: downColor }
  }
}

export { queryParamSchema, exampleQueryParams, renderWebsiteStatus }
