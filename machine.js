function valueEnumerable(value) {
  return { enumerable: true, value };
}

const assignType = {};
export function assign(key, fn) {
  return Object.create(assignType, {
    key: valueEnumerable(key),
    fn: valueEnumerable(fn)
  });
}

export function transition(from, ...args) {
  
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
    context: valueEnumerable(Function.prototype),
    current: valueEnumerable(current),
    states: valueEnumerable(states)
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

const service = {
  send(event) {
    this.machine = send(this.machine, event);
  }
};
export function interpret(machine) {
  let s = Object.create(service, {
    machine: {
      enumerable: true,
      writable: true,
      value: Object.create(machine, {
        context: valueEnumerable(machine.context())
      })
    }
  });
  s.send = s.send.bind(s);
  return s;
}