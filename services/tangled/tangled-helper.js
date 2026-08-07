const description = `
[Tangled](https://tangled.org) does not expose license metadata via its AT Protocol record,
so this badge fetches the project's LICENSE file from the default branch and matches it
against well-known license texts to derive an SPDX id.
`

function httpErrorsFor(notFoundMessage = 'repo not found') {
  return { 404: notFoundMessage }
}

// Order matters: more-specific patterns must precede subsets.
const LICENSE_PATTERNS = [
  { spdx: 'AGPL-3.0', re: /GNU AFFERO GENERAL PUBLIC LICENSE\s+Version 3/i },
  { spdx: 'GPL-3.0', re: /GNU GENERAL PUBLIC LICENSE\s+Version 3/i },
  { spdx: 'GPL-2.0', re: /GNU GENERAL PUBLIC LICENSE\s+Version 2/i },
  { spdx: 'LGPL-3.0', re: /GNU LESSER GENERAL PUBLIC LICENSE\s+Version 3/i },
  { spdx: 'LGPL-2.1', re: /GNU LESSER GENERAL PUBLIC LICENSE\s+Version 2\.1/i },
  { spdx: 'Apache-2.0', re: /Apache License,?\s+Version 2\.0/i },
  { spdx: 'MPL-2.0', re: /Mozilla Public License Version 2\.0/i },
  { spdx: 'BSL-1.0', re: /Boost Software License - Version 1\.0/i },
  { spdx: 'EPL-2.0', re: /Eclipse Public License - v 2\.0/i },
  {
    spdx: 'BSD-3-Clause',
    re: /Redistribution and use in source and binary forms[\s\S]+Neither the name of[\s\S]+nor the names/i,
  },
  {
    spdx: 'BSD-2-Clause',
    re: /Redistribution and use in source and binary forms/i,
  },
  // ISC before 0BSD: ISC requires the copyright notice, 0BSD does not.
  {
    spdx: 'ISC',
    re: /Permission to use, copy, modify, and\/or distribute this software[\s\S]+provided that the above copyright notice/i,
  },
  {
    spdx: '0BSD',
    re: /Permission to use, copy, modify, and\/or distribute this software/i,
  },
  {
    spdx: 'MIT',
    re: /Permission is hereby granted, free of charge, to any person obtaining a copy/i,
  },
  { spdx: 'WTFPL', re: /DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE/i },
  {
    spdx: 'Unlicense',
    re: /This is free and unencumbered software released into the public domain/i,
  },
  { spdx: 'CC0-1.0', re: /Creative Commons (?:CC0|Zero) 1\.0/i },
]

const SCAN_BYTES = 4096

function detectSpdxId(content) {
  const head = content.slice(0, SCAN_BYTES)
  for (const { spdx, re } of LICENSE_PATTERNS) {
    if (re.test(head)) return spdx
  }
  return undefined
}

export { description, httpErrorsFor, detectSpdxId }
