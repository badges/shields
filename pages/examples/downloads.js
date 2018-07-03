import ExamplesPage from '../../frontend/components/examples-page';

export default class DownloadsExamplePage extends ExamplesPage {

  constructor(props) {
    super(props);
    this.preparedExamples = this.prepareExamples('downloads');
  }

}
