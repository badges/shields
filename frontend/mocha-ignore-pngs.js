import requireHacker from 'require-hacker'

// https://diessi.ca/blog/how-to-exclude-css-images-anything-from-unit-tests/

requireHacker.hook('png', () => 'module.exports = ""')
