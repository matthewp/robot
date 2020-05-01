import { createMachine, state, transition } from 'robot3';
import { useMachine } from '../machine.js';
import { h, render, html } from './preact.js';

let wait = ms => new Promise(resolve => setTimeout(resolve, ms));
let later = () => wait(50);

QUnit.module('useMachine', hooks => {
  let container = null;
  hooks.beforeEach(() => {
    container = document.createElement('div');
    document.body.append(container);
  });

  hooks.afterEach(() => {
    //unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

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
        <button type="button" onClick=${() => send('next')}>
          State: ${current.name}
        </button>
      `;
    }
  
    render(h(App), container);

    let text = () => container.firstElementChild.textContent;
    assert.equal(text(), 'State: one');

    let btn = container.firstElementChild;
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await later();

    assert.equal(text(), 'State: two');
  });
});