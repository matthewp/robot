import { assign, send, state, transition, createMachine, interpret, reduce } from './machine.js';

const machine = createMachine('wait', {
  wait: state(
    transition('first', 'wait',
      reduce((ev, ctx) => ({ ...ctx, first: ev.target.value }))
    ),
    transition('last', 'wait',
      reduce((ev, ctx) => ({ ...ctx, last: ev.target.value }))
    )
  )
});

const name = document.querySelector('#name');
const firstInput = document.querySelector('[name="first"]');
const lastInput = document.querySelector('[name="last"]');

const service = interpret(machine, ({ context }) => {
  const { first = '', last = '' } = context;
  name.textContent = `${first} ${last}`;
});

firstInput.oninput = ev => service.send({ type: 'first', target: ev.target });
lastInput.oninput = ev => service.send({ type: 'last', target: ev.target });