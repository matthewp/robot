import { d } from './machine.js';

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
  }
};

d._send = function(eventName, currentStateName) {
  throw new Error(`No transitions for event ${eventName} from the current state [${currentStateName}]`);
};
