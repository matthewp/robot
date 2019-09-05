import { assign, send, state, transition, createMachine, interpret } from './machine.js';

const machine = createMachine('wait', {
  wait: state(
    transition('first', 'input',
      assign('first', (ev) => ev.target.value)
    )
  ),
  input: state(
    transition('done', 'wait')
  )
});

const service = interpret(machine);

const name = document.querySelector('#name');
const firstInput = document.querySelector('[name="first"]');
const lastInput = document.querySelector('[name="last"]');

firstInput.oninput = ev => service.send({ type: 'first', target: ev.target });