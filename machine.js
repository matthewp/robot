function valueEnumerable(value) {
  return { enumerable: true, value };
}

function valueEnumerableWritable(value) {
  return { enumerable: true, writable: true, value };
}

let truthy = () => true;
let empty = () => ({});

function stack(fns) {
  return fns.reduce((par, fn) => {
    return function(...args) {
      return fn.apply(this, args);
    };
  }, truthy);
}

function fnType(fn) {
  return Object.create(this, { fn: valueEnumerable(fn) });
}

let actionType = {};
export let action = fnType.bind(actionType);

let reduceType = {};
export let reduce = fnType.bind(reduceType);

let guardType = {};
export let guard = fnType.bind(guardType);

function filter(Type, arr) {
  return arr.filter(value => Type.isPrototypeOf(value));
}

export function transition(from, to, ...args) {
  let reducers = stack(filter(reduceType, args).map(t => t.fn));
  let guards = stack(filter(guardType, args).map(t => t.fn));
  return { from, to, guards, reducers };
}

export function state(...transitions) {
  return {
    transitions: Object.fromEntries(transitions.map(t => [t.from, t]))
  };
}

let invokeType = {};
export function invoke(fn, done, error) {
  return Object.create(invokeType, {
    fn: valueEnumerable(fn),
    transitions: valueEnumerable([transition('done', done), transition('error', error)])
  });
}

let machine = {
  get state() {
    return {
      name: this.current,
      value: this.states[this.current]
    };
  }
};
export function createMachine(states, contextFn) {
  let current = Object.keys(states)[0];
  return Object.create(machine, {
    context: valueEnumerable(contextFn || empty),
    current: valueEnumerable(current),
    states: valueEnumerable(states)
  });
}

export function send(service, event) {
  let eventName = event.type || event;
  let { machine, context } = service;
  let { value: state } = machine.state;
  
  if(eventName in state.transitions) {
    let { to, guards, reducers } = state.transitions[eventName];
    
    if(guards(context)) {
      service.context = reducers.call(service, event, context);
      
      let original = machine.original || machine;
      return Object.create(original, {
        current: valueEnumerable(to),
        original: { value: original }
      });
    }
  }
  
  return machine;
}

function run(service, invoker) {
  
}


let service = {
  send(event) {
    this.machine = send(this, event);
    let state = this.machine.state.value;
    
    // TODO detect change
    this.onChange(this);
    
    if(invokeType.isPrototypeOf(state)) {
      run(this, state);
    }
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