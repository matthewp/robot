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
export let action = fn => reduce((ctx, ev) => !!~fn(ctx, ev) && ctx);

let guardType = {};
export let guard = fnType.bind(guardType);

function filter(Type, arr) {
  return arr.filter(value => Type.isPrototypeOf(value));
}

function makeTransition(from, to, ...args) {
  let guards = stack(filter(guardType, args).map(t => t.fn), truthy, callBoth);
  let reducers = stack(filter(reduceType, args).map(t => t.fn), identity, callForward);
  return create(this, {
    from: valueEnumerable(from),
    to: valueEnumerable(to),
    guards: valueEnumerable(guards),
    reducers: valueEnumerable(reducers)
  });
}

let transitionType = {};
let immediateType = {};
export let transition = makeTransition.bind(transitionType);
export let immediate = makeTransition.bind(immediateType, null);

function enterImmediate(machine, service, event) {
  return transitionTo(service, machine, event, this.immediates) || machine;
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

let invokeFnType = {
  enter(machine2, service, event) {
    let rn = this.fn.call(service, service.context, event)
    if(machine.isPrototypeOf(rn))
      return create(invokeMachineType, {
        machine: valueEnumerable(rn),
        transitions: valueEnumerable(this.transitions)
      }).enter(machine2, service, event)
    rn.then(data => service.send({ type: 'done', data }))
      .catch(error => service.send({ type: 'error', error }));
    return machine2;
  }
};
let invokeMachineType = {
  enter(machine, service, event) {
    service.child = interpret(this.machine, s => {
      service.onChange(s);
      if(service.child == s && s.machine.state.value.final) {
        delete service.child;
        service.send({ type: 'done', data: s.context });
      }
    }, service.context, event);
    if(service.child.machine.state.value.final) {
      let data = service.child.context;
      delete service.child;
      return transitionTo(service, machine, { type: 'done', data }, this.transitions.get('done'));
    }
    return machine;
  }
};
export function invoke(fn, ...transitions) {
  let t = valueEnumerable(transitionsToMap(transitions));
  return machine.isPrototypeOf(fn) ?
    create(invokeMachineType, {
      machine: valueEnumerable(fn),
      transitions: t
    }) :
    create(invokeFnType, {
      fn: valueEnumerable(fn),
      transitions: t
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

export function createMachine(current, states, contextFn = empty) {
  if(typeof current !== 'string') {
    contextFn = states || empty;
    states = current;
    current = Object.keys(states)[0];
  }
  if(d._create) d._create(current, states);
  return create(machine, {
    context: valueEnumerable(contextFn),
    current: valueEnumerable(current),
    states: valueEnumerable(states)
  });
}

function transitionTo(service, machine, fromEvent, candidates) {
  let { context } = service;
  for(let { to, guards, reducers } of candidates) {  
    if(guards(context, fromEvent)) {
      service.context = reducers.call(service, context, fromEvent);

      let original = machine.original || machine;
      let newMachine = create(original, {
        current: valueEnumerable(to),
        original: { value: original }
      });

      if (d._onEnter) d._onEnter(machine, to, service.context, context, fromEvent);
      let state = newMachine.state.value;
      return state.enter(newMachine, service, fromEvent);
    }
  }
}

function send(service, event) {
  let eventName = event.type || event;
  let { machine } = service;
  let { value: state, name: currentStateName } = machine.state;
  
  if(state.transitions.has(eventName)) {
    return transitionTo(service, machine, event, state.transitions.get(eventName)) || machine;
  } else {
    if(d._send) d._send(eventName, currentStateName);
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
    context: valueEnumerableWritable(machine.context(initialContext, event)),
    onChange: valueEnumerable(onChange)
  });
  s.send = s.send.bind(s);
  s.machine = s.machine.state.value.enter(s.machine, s, event);
  return s;
} 
