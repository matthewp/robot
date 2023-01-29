import { createMachine, state, transition } from 'robot3';
import { useMachine } from '../machine.js';
import { component, html } from 'haunted';

let wait = ms => new Promise(resolve => setTimeout(resolve, ms));
let later = () => wait(50);

QUnit.module('useMachine', () => {
  QUnit.test('Basics', async assert => {
    const machine = createMachine({
      one: state(
        transition('next', 'two')
      ),
      two: state()
    });

    function App() {
      const [current, send] = useMachine(machine);
      
      return html`
        <button type="button" @click=${() => send('next')}>
          State: ${current.name}
        </button>
      `;
    }

    let Element = component(App);
    customElements.define('basics-app', Element);
    let el = new Element();
    document.body.append(el);

    await later();
  
    let text = () => el.shadowRoot.firstElementChild.textContent.trim();
    assert.equal(text(), 'State: one');

    let btn = el.shadowRoot.firstElementChild;
    btn.dispatchEvent(new MouseEvent('click'));
    await later();

    assert.equal(text(), 'State: two');

    el.remove();
  });
});