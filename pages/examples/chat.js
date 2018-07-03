import ExamplesPage from '../../frontend/components/examples-page';

export default class ChatExamplePage extends ExamplesPage {

  constructor(props) {
    super(props);
    this.preparedExamples = this.prepareExamples('chat');
  }

}
