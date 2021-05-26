import { createMachine, interpret, state, transition, reduce, d} from '../machine.js';

QUnit.module('robot/logging');

QUnit.test('Calls the onEnter function if the state is changed', assert => {
  const machine = createMachine({
    one: state(
      transition('go', 'two', reduce((ctx) => (
        { ...ctx, x: 1 }
      )))
    ),
    two: state()
  }, () => ({x: 0, y: 0}));

  const service = interpret(machine, () => {});
  const enterFN = (m, to, state, prevState, event) => {
    assert.deepEqual(m, machine, 'Machines equal');
    assert.deepEqual(state, {x:1, y:0}, 'Changed state passed.')
    assert.deepEqual(prevState, {x:0, y:0}, 'Previous state passed.')
    assert.equal(to, 'two', 'To state passed.')
    assert.equal(event, 'go', 'Send event passed.')
  }

  d._onEnter = enterFN;

  service.send('go');
});
