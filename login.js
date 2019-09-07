import { h, html, Component, render } from './preact.js';
import { createMachine, state } from './machine.js';

/*
  context ${{ login: '', password: '' }}
  action setLogin = assign login ${(_, ev) => ev.e.target.value}
  action setPassword = assign password ${(_, ev) => ev.e.target.value}
  
  action updateSubmissionError = assign submissionError ${submissionError}
  action clearError = assign submissionError ${() => null}
  guard canSubmit = ${({login, password}) => login && password}
  guard hasError = ${({ submissionError }) => !!(submissionError)}
  initial state form {
    login => setLogin => input
    password => setPassword => input
    submit => validate
  }
  state input {
    => hasError => clearError => form
    => form
  }
  state validate {
    => canSubmit => complete
    => updateSubmissionError => form
  }
  state complete {
  }

*/

const context = () => ({ login: '', password: '' });

const machine = createMachine({
  form: state(
  
  ),
  input: state(
  
  ),
  validate: state(
  
  ),
  complete: state()
}, context);

class App extends Component {
  render() {
    return html`
      <div>Hello world</div>
    `;
  }
}

render(h(App), document.querySelector('main'));