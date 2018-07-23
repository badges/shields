import ExamplesPage from '../../frontend/components/examples-page';

export default class SocialExamplePage extends ExamplesPage {

  constructor(props) {
    super(props);
    this.preparedExamples = this.prepareExamples('social');
  }

}
