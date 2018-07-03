import ExamplesPage from '../../frontend/components/examples-page';

export default class FundingExamplePage extends ExamplesPage {

  constructor(props) {
    super(props);
    this.preparedExamples = this.prepareExamples('funding');
  }

}
