import ExamplesPage from '../../frontend/components/examples-page';

export default class OtherExamplePage extends ExamplesPage {

  constructor(props) {
    super(props);
    this.preparedExamples = this.prepareExamples('other');
  }

}
