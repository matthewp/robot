import { createMachine, state, transition } from 'robot3';
import { useMachine } from '../machine.js';
import React from 'react';
import { act } from './test-utils.js';
import htm from 'https://unpkg.com/htm@2.2.1/dist/htm.module.js';
import { render, unmountComponentAtNode } from './react-dom.js';

const html = htm.bind(React.createElement);

QUnit.module('useMachine', hooks => {
  let container = null;
  hooks.beforeEach(() => {
    container = document.createElement('div');
    document.body.append(container);
  });

  hooks.afterEach(() => {
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  QUnit.test('Basics', assert => {
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
  
    act(() => {
      render(React.createElement(App), container);
    });

    let text = container.firstElementChild.textContent;
    assert.equal(text, 'State: one');

    act(() => {
      let btn = container.firstElementChild;
      btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    text = container.firstElementChild.textContent;
    assert.equal(text, 'State: two');
  });
});