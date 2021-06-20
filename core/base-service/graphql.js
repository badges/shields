/**
 * @module
 */

/**
 * Utility function to merge two graphql queries together
 * This is basically copied from
 * [graphql-query-merge](https://www.npmjs.com/package/graphql-query-merge)
 * but can't use that due to incorrect packaging.
 *
 * @param {...object} queries queries to merge
 * @returns {object} merged query
 */
function mergeQueries(...queries) {
  const merged = {
    kind: 'Document',
    definitions: [
      {
        directives: [],
        operation: 'query',
        variableDefinitions: [],
        kind: 'OperationDefinition',
        selectionSet: { kind: 'SelectionSet', selections: [] },
      },
    ],
  }

  queries.forEach(query => {
    const parsedQuery = query
    parsedQuery.definitions.forEach(definition => {
      merged.definitions[0].directives = [
        ...merged.definitions[0].directives,
        ...definition.directives,
      ]

      merged.definitions[0].variableDefinitions = [
        ...merged.definitions[0].variableDefinitions,
        ...definition.variableDefinitions,
      ]

      merged.definitions[0].selectionSet.selections = [
        ...merged.definitions[0].selectionSet.selections,
        ...definition.selectionSet.selections,
      ]
    })
  })

  return merged
}

export { mergeQueries }
