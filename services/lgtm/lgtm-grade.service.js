import LgtmBaseService from './lgtm-base.js'

export default class LgtmGrade extends LgtmBaseService {
  static route = {
    base: 'lgtm/grade',
    pattern: `:language/${this.pattern}`,
  }

  static examples = [
    {
      title: 'LGTM Grade',
      namedParams: {
        language: 'java',
        host: 'github',
        user: 'apache',
        repo: 'cloudstack',
      },
      staticPreview: this.render({
        language: 'java',
        data: {
          languages: [
            {
              lang: 'java',
              grade: 'C',
            },
          ],
        },
      }),
    },
  ]

  static getLabel({ language }) {
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
    return languageLabel
  }

  static getGradeAndColor({ language, data }) {
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
    return { grade, color }
  }

  static render({ language, data }) {
    const { grade, color } = this.getGradeAndColor({ language, data })

    return {
      label: `code quality: ${this.getLabel({ language })}`,
      message: grade,
      color,
    }
  }

  async handle({ language, host, user, repo }) {
    const data = await this.fetch({ host, user, repo })
    return this.constructor.render({ language, data })
  }
}
