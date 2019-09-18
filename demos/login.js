import { h, html, Component, render } from './preact.js';
import { createMachine, guard, immediate, interpret, reduce, state, transition } from './machine.js';

function fromEvent(send, type) {
  return event => send({ type, event });
}

function canSubmit(ctx) {
  return !!(ctx.login && ctx.password);
}

function updateSubmissionError(ctx) {
  return {
    ...ctx,
    error: 'Missing fields'
  };
}

function hasError(ctx) {
  return !!ctx.error;
}

function clearError(ctx) {
  return { ...ctx, error: '' };
}

function setLogin(ctx, { event }) {
  return {
    ...ctx,
    login: event.target.value
  };
}

function setPassword(ctx, { event }) {
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
      guard(hasError),
      reduce(clearError)
    ),
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
    let { login, error } = service.context;
    let { current: state } = service.machine;
    
    
    return html`
      <div>
        ${state === 'complete' ? html`
        <p>Thank you for logging in <strong>${login}</strong>!</p>
        `: html`
        <form>
          <label>
            Login
            <input type="text" name="login" onInput=${fromEvent(send, 'login')} />
          </label>
          <label>
            Password
            <input type="text" name="password" onInput=${fromEvent(send, 'password')} />
          </label>
          <button type="button" onClick=${fromEvent(send, 'submit')}>Submit</button>

          ${error ? html`
            <p>
              <strong>Error</strong>: ${error}
            </p>
          ` : ''}
        </form>
        `}
      </div>

    `;
  }
}

render(h(App), document.querySelector('main'));