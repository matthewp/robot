import { h, html, Component, render } from './preact.js';
import { createMachine, guard, immediate, interpret, reduce, state, transition } from './machine.js';

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
  return event => send({ type, event });
}

function canSubmit() {
  return false;
}

function updateSubmissionError(ctx) {
  return {
    ...ctx
  };
}

function setLogin({ event }, ctx) {
  return {
    ...ctx,
    login: event.target.value
  };
}

function setPassword({ event }, ctx) {
  return {
    ...ctx,
    password: event.target.value
  };
}

const context = () => ({ login: '', password: '' });

const machine = createMachine({
  form: state(
    transition('login', 'input', reduce(setLogin)),
    transition('password', 'input', reduce(setPassword)),
    transition('submit', 'validate')
  ),
  input: state(
    immediate('form',
      
    )
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
    constructor(...args) {
      super(...args);
      
      let service = interpret(machine, service => {
        this.setState({ send: service.send, service });
      });
      
      this.state = {
        send: service.send,
        service
      };
    }
  
  render() {
    let { service, send } = this.state;
    let { login } = service.context;
    
    
    return html`
      <form>
        <label>
          Login
          <input type="text" name="login" onInput=${fromEvent(send, 'login')} />
        </label>
        <label>
          Password
          <input type="text" name="password" onInput=${fromEvent(send, 'password')} />
        </label>

        <p>
          Hello <strong>${login}</strong>
        </p>
      </form>
    `;
  }
}

render(h(App), document.querySelector('main'));