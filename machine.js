function valueEnumerable(value) {
  return { enumerable: true, value };
}

function valueEnumerableWritable(value) {
  return { enumerable: true, writable: true, value };
}

export let d = {};
let truthy = () => true;
let empty = () => ({});
let identity = a => a;
let callBoth = (par, fn, self, args) => par.apply(self, args) && fn.apply(self, args);
let callForward = (par, fn, self, [a, b]) => fn.call(self, par.call(self, a, b), b);
let create = (a, b) => Object.freeze(Object.create(a, b));

function stack(fns, def, caller) {
  return fns.reduce((par, fn) => {
    return function(...args) {
      return caller(par, fn, this, args);
    };
  }, def);
}

function fnType(fn) {
  return create(this, { fn: valueEnumerable(fn) });
}

let reduceType = {};
export let reduce = fnType.bind(reduceType);

let guardType = {};
export let guard = fnType.bind(guardType);

function filter(Type, arr) {
  return arr.filter(value => Type.isPrototypeOf(value));
}

function extractActions(args) {
  let guards = stack(filter(guardType, args).map(t => t.fn), truthy, callBoth);
  let reducers = stack(filter(reduceType, args).map(t => t.fn), identity, callForward);
  return [guards, reducers];
}

let transitionType = {};
export function transition(from, to, ...args) {
  let [guards, reducers] = extractActions(args);
  return create(transitionType, {
    from: valueEnumerable(from),
    to: valueEnumerable(to),
    guards: valueEnumerable(guards),
    reducers: valueEnumerable(reducers)
  });
}

let immediateType = {};
export function immediate(to, ...args) {
  let [guards, reducers] = extractActions(args);
  return create(immediateType, {
    to: valueEnumerable(to),
    guards: valueEnumerable(guards),
    reducers: valueEnumerable(reducers)
  });
}

function enterImmediate(machine, service, event) {
  return transitionTo(service, event, this.immediates);
}

function transitionsToMap(transitions) {
  let m = new Map();
  for(let t of transitions) {
    if(!m.has(t.from)) m.set(t.from, []);
    m.get(t.from).push(t);
  }
  return m;
}

let stateType = { enter: identity };
export function state(...args) {
  let transitions = filter(transitionType, args);
  let immediates = filter(immediateType, args);
  let desc = {
    final: valueEnumerable(args.length === 0),
    transitions: valueEnumerable(transitionsToMap(transitions))
  };
  if(immediates.length) {
    desc.immediates = valueEnumerable(immediates);
    desc.enter = valueEnumerable(enterImmediate);
  }
  return create(stateType, desc);
}

let invokeType = {
  enter(machine, service, event) {
    this.fn.call(service, service.context, event)
      .then(data => service.send({ type: 'done', data }))
      .catch(error => service.send({ type: 'error', error }));
    return machine;
  }
};
function machineToPromise(machine) {
  return function(ctx, ev) {
    return new Promise(resolve => {
      this.child = interpret(machine, s => {
        this.onChange(s);
        if(s.machine.state.value.final) {
          resolve(s.context);
        }
      }, ctx, ev);
    });
  };
}
export function invoke(fn, ...transitions) {
  return create(invokeType, {
    fn: valueEnumerable(machine.isPrototypeOf(fn) ? machineToPromise(fn) : fn),
    transitions: valueEnumerable(transitionsToMap(transitions))
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
export function createMachine(states, contextFn = empty) {
  if(d._create) d._create(states);
  let current = Object.keys(states)[0];
  return create(machine, {
    context: valueEnumerable(contextFn),
    current: valueEnumerable(current),
    states: valueEnumerable(states)
  });
}

function transitionTo(service, fromEvent, candidates) {
  let { machine, context } = service;
  for(let { to, guards, reducers } of candidates) {  
    if(guards(context)) {
      service.context = reducers.call(service, context, fromEvent);

      let original = machine.original || machine;
      let newMachine = create(original, {
        current: valueEnumerable(to),
        original: { value: original }
      });

      let state = newMachine.state.value;
      return state.enter(newMachine, service, fromEvent);
    }
  }
}

function send(service, event) {
  let eventName = event.type || event;
  let { machine } = service;
  let { value: state } = machine.state;
  
  if(state.transitions.has(eventName)) {
    return transitionTo(service, event, state.transitions.get(eventName)) || machine;
  }
  return machine;
}

let service = {
  send(event) {
    this.machine = send(this, event);
    
    // TODO detect change
    this.onChange(this);
  }
};

export function interpret(machine, onChange, initialContext, event) {
  let s = Object.create(service, {
    machine: valueEnumerableWritable(machine),
    context: valueEnumerableWritable(machine.context(initialContext)),
    onChange: valueEnumerable(onChange)
  });
  s.send = s.send.bind(s);
  s.machine = s.machine.state.value.enter(s.machine, s, event);
  return s;
} 
