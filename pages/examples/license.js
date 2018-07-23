import ExamplesPage from '../../frontend/components/examples-page';

export default class LicenseExamplePage extends ExamplesPage {

  constructor(props) {
    super(props);
    this.preparedExamples = this.prepareExamples('license');
  }

}
