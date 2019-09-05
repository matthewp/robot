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

function filter(Type, arr) {
  return arr.filter(value => Type.isPrototypeOf(value));
}

export function transition(from, to, ...args) {
  let assigns = filter(assignType, args);
  return { from, to, assigns };
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

function defaultContext() {
  return {};
}

export function createMachine(current, states) {
  const contextFn = defaultContext;
  return Object.create(machine, {
    context: valueEnumerable(contextFn),
    current: valueEnumerable(current),
    states: valueEnumerable(states)
  });
}

export function send(machine, event) {
  let eventName = event.type || event;
  let { value: state } = machine.state;
  
  if(eventName in state.transitions) {
    let { to, assigns } = state.transitions[eventName];
    assigns.forEach(a => machine.context[a.key] = a.fn.call(null, event, machine.context));
    let original = machine.original || machine;
    return Object.create(original, {
      current: { enumerable: true, value: to },
      original: { value: original }
    });
  }
  
  return machine;
}

const service = {
  send(event) {
    this.machine = send(this.machine, event);
    this.onChange();
  }
};
export function interpret(machine, onChange) {
  let s = Object.create(service, {
    machine: {
      enumerable: true,
      writable: true,
      value: Object.create(machine, {
        context: valueEnumerable(machine.context())
      })
    },
    onChange: valueEnumerable(onChange)
  });
  s.send = s.send.bind(s);
  return s;
}