import { send, state, transition, createMachine, interpret } from './machine.js';



const machine = createMachine('red', {
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

const service = interpret(machine);


const light = document.querySelector('#light');
const btn = document.querySelector('button');
btn.onclick = change;

function change() {
  service.send('next');
  render();
}

function render() {
  let state = service.machine.state;
  light.className = `state ${state.name}`;
}

render();