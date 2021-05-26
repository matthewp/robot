import { d } from './machine.js';

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
