import { createMachine, state, transition } from 'robot3';
import Robot from '../machine.js';
import { LitElement, html } from 'lit';

let wait = ms => new Promise(resolve => setTimeout(resolve, ms));
let later = () => wait(10);

QUnit.module('useMachine', hooks => {
  QUnit.test('Basics', async assert => {
    let service;
    const machine = createMachine({
      one: state(
        transition('next', 'two')
      ),
      two: state()
    });

    class MyApp extends Robot(LitElement) {
      static machine = machine;

      render() {
        service = this.service;
        let state = this.machine.state;

        return html`
          <div>State: ${state.name}</div>
        `;
      }
    }

    customElements.define('my-app', MyApp);

    let el = new MyApp();
    let text = () => el.shadowRoot.firstElementChild.textContent.trim();
    document.body.append(el);
    await later();

    assert.equal(text(), 'State: one');

    service.send('next');
    await later();

    assert.equal(text(), 'State: two');
    el.remove();
  });

  QUnit.test('Context gets the element', async assert => {
    const machine = createMachine({
      one: state()
    }, ev => ({
      el: ev.element
    }));

    class MyApp extends Robot(LitElement) {
      static machine = machine;

      render() {
        let context = this.service.context;
        let tagName = context.el.tagName;

        return html`
          <div>Element: ${tagName}</div>
        `;
      }
    }

    customElements.define('my-app2', MyApp);

    let el = new MyApp();
    let text = () => el.shadowRoot.firstElementChild.textContent.trim();
    document.body.append(el);
    await later();

    assert.equal(text(), 'Element: MY-APP2');
    el.remove();
  });
});