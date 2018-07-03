import ExamplesPage from '../../frontend/components/examples-page';

export default class BuildExamplePage extends ExamplesPage {

  constructor(props) {
    super(props);
    this.preparedExamples = this.prepareExamples('build');
  }

}
