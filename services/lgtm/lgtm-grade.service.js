'use strict'

const LgtmBaseService = require('./lgtm-base')

module.exports = class LgtmGrade extends LgtmBaseService {
  static get route() {
    return {
      base: 'lgtm/grade',
      pattern: ':language/g/:user/:repo',
    }
  }

  async handle({ language, user, repo }) {
    const data = await this.fetch({ user, repo })

    const languageLabel = (() => {
      switch (language) {
        case 'cpp':
          return 'c/c++'
        case 'csharp':
          return 'c#'
        // Javascript analysis on LGTM also includes TypeScript
        case 'javascript':
          return 'js/ts'
        default:
          return language
      }
    })()

    let grade = 'no language data'
    let color = 'red'

    for (const languageData of data.languages) {
      if (languageData.lang === language && 'grade' in languageData) {
        // Pretty label for the language
        grade = languageData.grade
        // Pick colour based on grade
        if (languageData.grade === 'A+') {
          color = 'brightgreen'
        } else if (languageData.grade === 'A') {
          color = 'green'
        } else if (languageData.grade === 'B') {
          color = 'yellowgreen'
        } else if (languageData.grade === 'C') {
          color = 'yellow'
        } else if (languageData.grade === 'D') {
          color = 'orange'
        }
      }
    }

    return this.constructor.render({ languageLabel, grade, color })
  }

  static render({ languageLabel, grade, color }) {
    return {
      label:
        languageLabel === undefined ? 'lgtm' : `code quality: ${languageLabel}`,
      message: grade,
      color,
    }
  }

  static get examples() {
    return [
      {
        title: 'LGTM Grade',
        namedParams: {
          language: 'java',
          user: 'apache',
          repo: 'cloudstack',
        },
        staticPreview: this.render({
          languageLabel: 'java',
          grade: 'D',
          color: 'orange',
        }),
      },
    ]
  }
}
