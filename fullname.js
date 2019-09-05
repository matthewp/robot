import { assign, send, state, transition, createMachine, interpret } from './machine.js';

const machine = createMachine('wait', {
  wait: state(
    transition('first', 'input',
      assign('first', (ev, ctx) => ev.target.value)
    )
  ),
  input: state(
    transition('done', 'wait')
  )
});

const service = interpret(machine);



function render() {
  let state = service.machine.state;
  light.className = `state ${state.name}`;
}

render();