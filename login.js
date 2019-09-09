import { h, html, Component, render } from './preact.js';
import { createMachine, guard, immediate, reduce, state, transition } from './machine.js';

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

function fromEvent(send, type) {
  return event => ({ type, event });
}

function canSubmit() {
  return false;
}

function updateSubmissionError(ctx) {
  return {
    ...ctx
  };
}

const context = () => ({ login: '', password: '' });

const machine = createMachine({
  form: state(
    transition('login', 'input'),
    transition('password', 'input'),
    transition('submit', 'validate')
  ),
  input: state(
    immediate('form')
  ),
  validate: state(
    immediate('complete',
      guard(canSubmit)
    ),
    immediate('form',
      reduce(updateSubmissionError)
    )
  ),
  complete: state()
}, context);

class App extends Component {
  render() {
    let { send } = this.state;
    
    
    return html`
      <form>
        <label for="login">Login</label>
        <input type="text" name="login" onInput=${fromEvent(send, 'login')} />
      </form>
    `;
  }
}

render(h(App), document.querySelector('main'));