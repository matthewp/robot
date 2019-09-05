function valueEnumerable(value) {
  return { enumerable: true, value };
}

export function transition(from, to) {
  return { from, to };
}

export function state(...transitions) {
  return {
    transitions: Object.fromEntries(transitions.map(t => [t.from, t]))
  };
}

const machine = {
  get state() {
    return {
      name: this.current,
      value: this.states[this.current]
    };
  }
};

export function createMachine(current, states) {
  return Object.create(machine, {
    current: valueEnumerable(current),
  });
}


export function send(machine, event) {
  let { value: state } = machine.state;
  let newState = state.transitions[event].to;
  let original = machine.original || machine;
  return Object.create(original, {
    current: { enumerable: true, value: newState },
    original: { value: original }
  });
}