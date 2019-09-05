function valueEnumerable(value) {
  return { enumerable: true, value };
}

function valueEnumerableWritable(value) {
  return { enumerable: true, writable: true, value };
}

function fnType(fn) {
  return Object.create(this, { fn: valueEnumerable(fn) });
}

function stack(fns) {
  return fns.reduce((par, fn)
}

const actionType = {};
export function action(fn) {
  return Object.create(actionType, {
    fn: valueEnumerable(fn)
  });
}
export const action2 = fnType.bind(actionType);
export const reduce2 = fnType.bind({});

const guardType = {};
export const guard = fnType.bind(guardType);

export function reduce(fn) {
  return action(fn);
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
  let actions = filter(actionType, args);
  let guards = filter(guardType, args);
  return { from, to, actions, guards };
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

export function createMachine(states) {
  const current = Object.keys(states)[0];
  const contextFn = defaultContext;
  return Object.create(machine, {
    context: valueEnumerable(contextFn),
    current: valueEnumerable(current),
    states: valueEnumerable(states)
  });
}

export function send(service, event) {
  let eventName = event.type || event;
  let { machine, context } = service;
  let { value: state } = machine.state;
  
  if(eventName in state.transitions) {
    let { to, actions, guards } = state.transitions[eventName];
    service.context = actions.reduce(
      (ctx, a) => a.fn.call(service, event, ctx),
      service.context
    );
    
    
    
    let original = machine.original || machine;
    return Object.create(original, {
      current: valueEnumerable(to),
      original: { value: original }
    });
  }
  
  return machine;
}

const service = {
  send(event) {
    this.machine = send(this, event);
    this.onChange(this);
  }
};
export function interpret(machine, onChange) {
  let s = Object.create(service, {
    machine: valueEnumerableWritable(machine),
    context: valueEnumerableWritable(machine.context()),
    onChange: valueEnumerable(onChange)
  });
  s.send = s.send.bind(s);
  return s;
}