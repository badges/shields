function exampleMatchesRegex(example, regex) {
  const { title, keywords } = example;
  const haystack = [title].concat(keywords).join(' ');
  return regex.test(haystack);
}

export default function filterExamples(examples, query) {
  if (! query) {
    return examples;
  }

  const regex = new RegExp(query, 'i'); // Case-insensitive.

  return examples
    .map(({ category, examples }) => ({
      category,
      examples: examples.filter(ex => exampleMatchesRegex(ex, regex)),
    }))
    // Remove empty sections.
    .filter(({ category, examples }) => examples.length > 0);
}
