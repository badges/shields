import { test, given } from 'sazerac'
import { detectSpdxId } from './tangled-helper.js'
import TangledLicense from './tangled-license.service.js'

const MIT_TEXT = `MIT License

Copyright (c) 2024 Example

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction,`

const MIT_TEXT_ALT_YEAR = `MIT License

Copyright (c) 2019 Another Author

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction,`

const APACHE_TEXT = `                                 Apache License
                                                Version 2.0, January 2004
                           TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION`

const GPL3_TEXT = `                    GNU GENERAL PUBLIC LICENSE
                       Version 3, 29 June 2007`

const BSD3_TEXT = `Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of the copyright holder nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.`

const BSD2_TEXT = `Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.`

test(TangledLicense.render, () => {
  given({ license: undefined }).expect({ message: 'unknown' })
  given({ license: null }).expect({ message: 'not specified' })
  given({ license: 'MIT' }).expect({ message: 'MIT', color: 'green' })
  given({ license: 'Apache-2.0' }).expect({
    message: 'Apache-2.0',
    color: 'green',
  })
  given({ license: 'GPL-3.0' }).expect({ message: 'GPL-3.0', color: 'orange' })
})

test(detectSpdxId, () => {
  given(MIT_TEXT).expect('MIT')
  given(MIT_TEXT_ALT_YEAR).expect('MIT')
  given(APACHE_TEXT).expect('Apache-2.0')
  given(GPL3_TEXT).expect('GPL-3.0')
  given(BSD3_TEXT).expect('BSD-3-Clause')
  given(BSD2_TEXT).expect('BSD-2-Clause')
  given('This is a proprietary software license.').expect(undefined)
})
