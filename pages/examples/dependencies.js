import ExamplesPage from '../../frontend/components/examples-page';

export default class DependenciesExamplePage extends ExamplesPage {

  constructor(props) {
    super(props);
    this.preparedExamples = this.prepareExamples('dependencies');
  }

}
