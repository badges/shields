import ExamplesPage from '../../frontend/components/examples-page';

export default class IssueTrackingExamplePage extends ExamplesPage {

  constructor(props) {
    super(props);
    this.preparedExamples = this.prepareExamples('issue-tracking');
  }

}
