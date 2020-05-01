import { createMachine, state, transition, invoke } from 'robot3';
import { createUseMachine } from '../machine.js';
import { component, useEffect, useState, html } from 'https://unpkg.com/haunted/haunted.js';

const useMachine = createUseMachine(useEffect, useState);

const later = () => new Promise(resolve => setTimeout(resolve, 50));

let namesCount = 0;
async function createSandbox(App, cb) {
  let tag = `element-${namesCount++}`;
  let Element = component(App);
  customElements.define(tag, Element);
  let el = new Element();
  document.body.append(el);
  await later();

  let gen = cb(el.shadowRoot);

  while(true) {
    let { done } = gen.next(el.shadowRoot);
    if(done) {
      break;
    }
    await later();
  }
  el.remove();
}

QUnit.module('useMachine', hooks => {
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

    const Element = component(App);
    customElements.define('basics-app', Element);

    let app = new Element();
    document.body.append(app);
    let root = app.shadowRoot;

    await later();

    let btn = root.firstElementChild;
    let text = () => btn.textContent.trim();

    assert.equal(text(), 'State: one');

    btn.dispatchEvent(new MouseEvent('click'));
    await later();

    assert.equal(text(), 'State: two');
    app.remove();
  });

  QUnit.test('passes along initial context', async assert => {
    const context = initial => ({ ...initial });

    const machine = createMachine({
      solid: state()
    }, context);

    function App() {
      const [current] = useMachine(machine, { test: 42 });

      return html`
        <span>
          Context: ${JSON.stringify(current.context)}
        </span>
      `;
    }

    const Element = component(App);
    customElements.define('initial-context', Element);

    let app = new Element();
    document.body.append(app);
    let root = app.shadowRoot;

    await later();

    assert.equal(root.firstElementChild.textContent.trim(), 'Context: {"test":42}');
    app.remove();
  });

  QUnit.test('can change machines', async assert => {
    const basicMachine = (name) => createMachine({
      [name]: state()
    }, () => ({ name }));
    const one = basicMachine('one');
    const two = basicMachine('two');
    let setOne;

    function App() {
      const [isOne, setOne2] = useState(true);
      const [current] = useMachine(isOne ? one : two);
      const { name } = current.context;
      setOne = setOne2;

      return html`
        <div>Machine ${name}</div>
      `;
    }

    const Element = component(App);
    customElements.define('multi-machine', Element);
    let el = new Element();
    document.body.append(el);
    let text = () => el.shadowRoot.firstElementChild.textContent.trim();

    await later();

    assert.equal(text(), 'Machine one', 'the first machine');
    setOne(false);

    await later();
    assert.equal(text(), 'Machine two', 'the second machine');

    el.remove();
  });

  QUnit.test('Invoking machines the "current" is the child machine', async assert => {
    const nested = createMachine({
      nestedOne: state(
        transition('next', 'nestedTwo')
      ),
      nestedTwo: state()
    });
    const machine = createMachine({
      one: state(
        transition('next', 'two')
      ),
      two: invoke(nested, 
        transition('done', 'three')
      ),
      three: state()
    });

    let current, send, service;
    function App() {
      const [currentState, sendEvent, thisService] = useMachine(machine);
      current = currentState;
      send = sendEvent;
      service = thisService;

      return html`
        <div>State: ${current.name}</div>
      `;
    }

    await createSandbox(App, function* (shadow) {
      let el = shadow.firstElementChild;
      let text = () => el.textContent.trim();

      assert.equal(text(), 'State: one');
      yield send('next');

      assert.equal(text(), 'State: nestedOne');
      yield service.child.send('next');
      
      assert.equal(text(), 'State: three');
    });
  });

  QUnit.test('Doesn\'t update when the component is torn down', async assert => {
    let machine = createMachine({
      one: state(
        transition('toggle', 'two')
      ),
      two: state(
        transition('toggle', 'one')
      )
    });

    let sendEvent;
    let tag = `element-teardown`;
    let Element = component(function() {
      let [current, send] = useMachine(machine);
      sendEvent = send;
      return html`<span>${current.name}</span>`;
    });
    customElements.define(tag, Element);
    let el = new Element();
    document.body.append(el);
    await later();

    let span = el.shadowRoot.firstElementChild;
    assert.equal(span.textContent, 'one');

    el.remove();
    await later();

    sendEvent('toggle');
    await later();

    assert.equal(span.textContent, 'one', 'did not change');
  });
});