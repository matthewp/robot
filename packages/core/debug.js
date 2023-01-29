import { d, invoke } from './machine.js';

const invokePromiseType = Object.getPrototypeOf(invoke(Promise.resolve()));

function unknownState(from, state) {
  throw new Error(`Cannot transition from ${from} to unknown state: ${state}`);
}

d._create = function(current, states) {
  if(!(current in states)) {
    throw new Error(`Initial state [${current}] is not a known state.`);
  }
  for(let p in states) {
    let state = states[p];
    for(let [, candidates] of state.transitions) {
      for(let {to} of candidates) {
        if(!(to in states)) {
          unknownState(p, to);
        }
      }
    }
    if (invokePromiseType.isPrototypeOf(state)) {
      let hasErrorFrom = false;
      for(let [, candidates] of state.transitions) {
        for(let {from} of candidates) {
          if (from === 'error') hasErrorFrom = true;
        }
      }
      if(!hasErrorFrom) {
        console.warn(
          `When using invoke [current state: ${p}] with Promise-returning function, you need to add 'error' state. Otherwise, robot will hide errors in Promise-returning function`
        );
      }
    }
  }
};

d._send = function(eventName, currentStateName) {
  throw new Error(`No transitions for event ${eventName} from the current state [${currentStateName}]`);
};
