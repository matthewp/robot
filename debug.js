import { d } from './machine.js';

function unknownState(state) {
  throw new Error(`Cannot transition to unknown state: ${state}`);
}

d._create = function(states) {
  for(let p in states) {
    let state = states[p];
    for(let [, candidates] of state.transitions) {
      for(let {to} of candidates) {
        if(!(to in states)) {
          unknownState(to);
        }
      }
    }
  }
};