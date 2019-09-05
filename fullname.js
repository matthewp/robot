import { assign, send, state, transition, createMachine, interpret } from './machine.js';

const machine = createMachine('wait', {
  wait: state(
    transition('first', 'wait',
      assign('first', (ev) => ev.target.value)
    ),
    transition('last', 'wait',
      assign('last', (ev) => ev.target.value)
    )
  ),
  input: state(
    transition('done', 'wait')
  )
});

const name = document.querySelector('#name');
const firstInput = document.querySelector('[name="first"]');
const lastInput = document.querySelector('[name="last"]');

const service = interpret(machine, () => {
  const { first = '', last = '' } = service.machine.context;
  name.textContent = `${first} ${last}`;
});

firstInput.oninput = ev => service.send({ type: 'first', target: ev.target });
lastInput.oninput = ev => service.send({ type: 'last', target: ev.target });