function transition(from, to) {
  
}

function state(...args) {
  return {
    transitions: args
  };
}

let machine = {
  current: 'red',
  get state() {
    return {
      name: this.current,
      value: this.states[this.current]
    };
  },
  states: {
    red: state(
      transition('next', 'green')
    ),
    yellow: state(
      transition('next', 'red')
    ),
    green: state(
      transition('next', 'yellow')
    )
  }
};

function send(machine, event) {
  
}

const light = document.querySelector('#light');
const btn = document.querySelector('button');
btn.onclick = change;

function change() {
  let state = send(machine, 'next');
}

function render() {
  debugger;
  let state = machine.current;
  light.className = `state ${state.name}`;
}

render();