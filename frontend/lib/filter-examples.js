function exampleMatchesRegex(example, regex) {
  const { title, keywords } = example;
  const haystack = [title].concat(keywords).join(' ');
  return regex.test(haystack);
}

function predicateFromQuery(query) {
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

// Assign each example a unique ID.
export function prepareExamples(categories) {
  let nextKey = 0;
  return mapExamples(categories, examples => examples.map(example => Object.assign(example, {
    key: nextKey++,
  })));
}

export function filterExamples(categories, query) {
  const predicate = predicateFromQuery(query);
  return mapExamples(categories, examples => examples.filter(predicate));
}
