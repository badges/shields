import chaiFriendlyPlugin from 'eslint-plugin-chai-friendly'
import cypressPlugin from 'eslint-plugin-cypress/flat'
import jsdocPlugin from 'eslint-plugin-jsdoc'
import mochaPlugin from 'eslint-plugin-mocha'
import icedfrisbyPlugin from 'eslint-plugin-icedfrisby'
import sortClassMembersPlugin from 'eslint-plugin-sort-class-members'
import importPlugin from 'eslint-plugin-import'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import prettierConfig from 'eslint-plugin-prettier/recommended'
import promisePlugin from 'eslint-plugin-promise'
import globals from 'globals'
import neostandard from 'neostandard'
import tsParser from '@typescript-eslint/parser'
import js from '@eslint/js'

// Config that is used across the whole codebase
// and customisations to built-in ESLint rules
const globalConfig = {
  plugins: {
    import: importPlugin,
    promise: promisePlugin,
  },

  rules: {
    'import/order': ['error', { 'newlines-between': 'never' }],
    'promise/prefer-await-to-then': 'error',

    // ESLint built-in rules config
    'no-empty': ['error', { allowEmptyCatch: true }],
    'no-var': 'error',
    'prefer-const': 'error',
    'arrow-body-style': ['error', 'as-needed'],
    'object-shorthand': ['error', 'properties'],
    'prefer-template': 'error',
    'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
    'new-cap': ['error', { capIsNew: true }],
    quotes: [
      'error',
      'single',
      { avoidEscape: true, allowTemplateLiterals: false },
    ],
    camelcase: [
      'error',
      {
        ignoreDestructuring: true,
        properties: 'never',
        ignoreGlobals: true,
        allow: ['^UNSAFE_'],
      },
    ],
  },
}

// config specific to linting Node (CommonJS) files
const commonJsConfig = {
  files: ['badge-maker/**/*.js', '**/*.cjs'],

  languageOptions: {
    globals: {
      ...globals.node,
    },
  },
}

// config specific to linting Node (ESModules) files
const nodeEsmConfig = {
  files: ['**/*.@(js|mjs)', '!frontend/**/*.js', '!badge-maker/**/*.js'],

  languageOptions: {
    globals: {
      ...globals.node,
    },
    parser: tsParser,
    sourceType: 'module',
  },

  rules: {
    'no-console': 'off',
  },
}

// config specific to linting Frontend (ESModules) files
const frontendConfig = {
  files: ['frontend/**/*.js'],

  plugins: {
    'react-hooks': reactHooksPlugin,
  },

  languageOptions: {
    globals: {
      ...globals.browser,
    },
    sourceType: 'module',
  },

  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',
  },
}

// config specific to linting Services
const servicesConfig = {
  files: ['core/base-service/**/*.js', 'services/**/*.js'],

  plugins: {
    'sort-class-members': sortClassMembersPlugin,
  },

  rules: {
    'sort-class-members/sort-class-members': [
      'error',
      {
        order: [
          'name',
          'category',
          'isDeprecated',
          'route',
          'auth',
          'openApi',
          '_cacheLength',
          'defaultBadgeData',
          'render',
          'constructor',
          'fetch',
          'transform',
          'handle',
        ],
      },
    ],
  },
}

// config specific to linting Mocha tests
const mochaConfig = {
  files: [
    '**/*.spec.@(js|mjs|ts)',
    '**/*.integration.js',
    '**/test-helpers.js',
    'core/service-test-runner/**/*.js',
  ],

  plugins: {
    mocha: mochaPlugin,
  },

  languageOptions: {
    globals: {
      ...globals.mocha,
    },
  },

  rules: {
    'mocha/no-exclusive-tests': 'error',
    'mocha/no-skipped-tests': 'error',
    'mocha/no-mocha-arrows': 'error',
    'mocha/prefer-arrow-callback': 'error',
    'no-unused-expressions': 'off',
  },
}

// config specific to linting Cypress tests
const cypressConfig = {
  files: ['**/*.cy.@(js|ts)'],
  ...cypressPlugin.configs.recommended,
}
// append these to cypress.configs.recommended, without overwriting
cypressConfig.plugins.mocha = mochaPlugin
cypressConfig.rules['mocha/no-exclusive-tests'] = 'error'
cypressConfig.rules['mocha/no-skipped-tests'] = 'error'
cypressConfig.rules['mocha/no-mocha-arrows'] = 'off'

// config specific to linting Service tests (IcedFrisby)
const serviceTestsConfig = {
  files: ['services/**/*.tester.js'],

  plugins: {
    icedfrisby: icedfrisbyPlugin,
  },

  rules: {
    'icedfrisby/no-exclusive-tests': 'error',
    'icedfrisby/no-skipped-tests': 'error',
    'no-unused-expressions': 'off',
  },
}

// config specific to linting JSDoc comments
const jsDocConfig = {
  plugins: {
    jsdoc: jsdocPlugin,
  },

  rules: {
    'jsdoc/require-jsdoc': 'off',
    'jsdoc/no-undefined-types': ['error', { definedTypes: ['Joi'] }],
    'jsdoc/check-alignment': 'error',
    'jsdoc/check-param-names': 'error',
    'jsdoc/check-tag-names': 'error',
    'jsdoc/check-types': 'error',
    'jsdoc/implements-on-classes': 'error',
    'jsdoc/tag-lines': ['error', 'any', { startLines: 1 }],
    'jsdoc/require-param': 'error',
    'jsdoc/require-param-description': 'error',
    'jsdoc/require-param-name': 'error',
    'jsdoc/require-param-type': 'error',
    'jsdoc/require-returns': 'error',
    'jsdoc/require-returns-check': 'error',
    'jsdoc/require-returns-description': 'error',
    'jsdoc/require-returns-type': 'error',
    'jsdoc/valid-types': 'error',
  },
}

const config = [
  {
    ignores: [
      'api-docs/',
      'build',
      'coverage',
      '__snapshots__',
      'public',
      'badge-maker/node_modules/',
      '!.github/',
      'frontend/.docusaurus/**',
    ],
  },

  js.configs.recommended,
  chaiFriendlyPlugin.configs.recommendedFlat,
  ...neostandard({ noStyle: true }),

  globalConfig,
  commonJsConfig,
  nodeEsmConfig,
  frontendConfig,
  servicesConfig,
  mochaConfig,
  cypressConfig,
  serviceTestsConfig,
  jsDocConfig,

  // register prettierConfig last, as per
  // https://github.com/prettier/eslint-plugin-prettier?tab=readme-ov-file#configuration-new-eslintconfigjs
  prettierConfig,
]

export default config
