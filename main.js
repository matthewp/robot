function transition(from, to) {
  return { from, to };
}

function state(...transitions) {
  let t = {};
  for(let transition of transitions) {
    t[transition.from] = transition.to;
  }
  
  return {
    transitions: t
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
  let { value: state } = machine.state;
  let newState = state.transitions[event];
  let original = machine.original || machine;
  return Object.create(original, {
    current: { enumerable: true, value: newState },
    original: { value: original }
  });
}

const light = document.querySelector('#light');
const btn = document.querySelector('button');
btn.onclick = change;

function change() {
  machine = send(machine, 'next');
  render();
}

function render() {
  let state = machine.state;
  light.className = `state ${state.name}`;
}

render();