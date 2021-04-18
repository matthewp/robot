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

d._onEnter = function(machine, to, state, prevState, event) {
  console.log(`Enter state ${to}`);
  console.groupCollapsed(`Details:`);
  console.log(`Machine ${{...machine}}`);
  console.log(`Current state ${{...state}}`);
  console.log(`Previous state ${{...prevState}}`);

  if (event) {
    console.log(`Event ${typeof event === "string" ? event : {...event}}`);
  }

  console.groupEnd();
}
