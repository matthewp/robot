import { createMachine, interpret, state, transition } from './machine.js';

let machine = createMachine({
  red: state(
    transition('next', 'green')
  ),
  yellow: state(
    transition('next', 'red')
  ),
  green: state(
    transition('next', 'yellow')
  )
});

const light = document.querySelector('#light');
const btn = document.querySelector('button');
btn.onclick = change;

const service = interpret(machine, service => {
  render();
});

function change() {
  service.send('next');
}

function render() {
  let state = service.machine.state;
  light.className = `state ${state.name}`;
}

render();