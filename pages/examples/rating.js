import ExamplesPage from '../../frontend/components/examples-page';

export default class RatingExamplePage extends ExamplesPage {

  constructor(props) {
    super(props);
    this.preparedExamples = this.prepareExamples('rating');
  }

}
