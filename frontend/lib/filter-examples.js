export function exampleMatchesRegex(example, regex) {
  const { title, keywords } = example;
  const haystack = [title].concat(keywords).join(' ');
  return regex.test(haystack);
}

export function predicateFromQuery(query) {
  if (query) {
    const regex = new RegExp(query, 'i'); // Case-insensitive.
    return example => exampleMatchesRegex(example, regex);
  } else {
    return () => true;
  }
}

export function mapExamples(categories, iteratee) {
  return categories
    .map(({ category, examples }) => ({
      category,
      examples: iteratee(examples),
    }))
    // Remove empty categories.
    .filter(({ category, examples }) => examples.length > 0);
}

export function extendExamplesWithFilter(categories, predicateProvider) {
  return mapExamples(categories, examples => examples.map(example => Object.assign(example, {
    shouldDisplay: () => predicateProvider()(example),
  })));
}
