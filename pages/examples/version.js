import ExamplesPage from '../../frontend/components/examples-page';

export default class VersionExamplePage extends ExamplesPage {

  constructor(props) {
    super(props);
    this.preparedExamples = this.prepareExamples('version');
  }

}
