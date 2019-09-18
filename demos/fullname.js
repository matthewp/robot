import { guard, state, transition, createMachine, interpret, reduce } from './machine.js';

const setFirst = (ctx, ev) => ({ ...ctx, first: ev.target.value });
const setLast = (ctx, ev) => ({ ...ctx, last: ev.target.value });
const nothingEntered = ({ first, last }) => !first && !last;
const somethingEntered = (ctx) => !nothingEntered(ctx);

const machine = createMachine({
  waiting: state(
    transition('first', 'waiting',
      reduce(setFirst)
    ),
    transition('last', 'waiting',
      reduce(setLast)
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