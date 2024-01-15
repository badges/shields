import Joi from 'joi'

const arrayOfStrings = Joi.array().items(Joi.string()).min(0).required()

const objectOfKeyValues = Joi.object()
  .pattern(/./, Joi.string().allow(null))
  .required()

const openApiSchema = Joi.object().pattern(
  /./,
  Joi.object({
    get: Joi.object({
      summary: Joi.string().required(),
      description: Joi.string(),
      parameters: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().required(),
            description: Joi.string(),
            in: Joi.string().valid('query', 'path').required(),
            required: Joi.boolean().required(),
            schema: Joi.object({
              type: Joi.string().required(),
              enum: Joi.array(),
            }).required(),
            allowEmptyValue: Joi.boolean(),
            example: Joi.string().allow(null),
          }),
        )
        .min(1)
        .required(),
    }).required(),
  }).required(),
)

const serviceDefinition = Joi.object({
  category: Joi.string().required(),
  name: Joi.string().required(),
  isDeprecated: Joi.boolean().required(),
  route: Joi.alternatives().try(
    Joi.object({
      pattern: Joi.string().required(),
      queryParams: arrayOfStrings,
    }),
    Joi.object({
      format: Joi.string().required(),
      queryParams: arrayOfStrings,
    }),
  ),
  examples: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().required(),
        example: Joi.object({
          pattern: Joi.string(),
          namedParams: objectOfKeyValues,
          queryParams: objectOfKeyValues,
        }).required(),
        preview: Joi.object({
          label: Joi.string(),
          message: Joi.string().allow('').required(),
          color: Joi.string().required(),
          style: Joi.string(),
          namedLogo: Joi.string(),
        }).required(),
        keywords: arrayOfStrings,
        documentation: Joi.object({
          __html: Joi.string().required(), // Valid HTML.
        }),
      }),
    )
    .default([]),
  openApi: openApiSchema,
}).required()

function assertValidServiceDefinition(service, message = undefined) {
  Joi.assert(service, serviceDefinition, message)
}

const serviceDefinitionExport = Joi.object({
  schemaVersion: Joi.equal('0').required(),
  categories: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required(),
        name: Joi.string().required(),
        keywords: arrayOfStrings,
      }),
    )
    .required(),
  services: Joi.array().items(serviceDefinition).required(),
}).required()

function assertValidServiceDefinitionExport(examples, message = undefined) {
  Joi.assert(examples, serviceDefinitionExport, message)
}

export {
  assertValidServiceDefinition,
  assertValidServiceDefinitionExport,
  openApiSchema,
}
