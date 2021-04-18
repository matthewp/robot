import { createMachine, interpret, state, transition, reduce, d} from '../machine.js';

QUnit.module('robot/debug');

QUnit.test('Errors for transitions to states that don\'t exist', assert => {
  try {
    createMachine({
      one: state(
        transition('go', 'two')
      )
    });
  } catch(e) {
    assert.ok(/unknown state/.test(e.message), 'Gets an error about unknown states');
  }
});

QUnit.test('Does not error for transitions to states when state does exist', assert => {
  try {
    createMachine({
      one: state(
        transition('go', 'two')
      ),
      two: state()
    });
    assert.ok(true, 'Created a valid machine!');
  } catch(e) {
    assert.ok(false, 'Should not have errored');
  }
});

QUnit.test('Errors if an invalid initial state is provided', assert => {
  try {
    createMachine('oops', {
      one: state()
    });
    assert.ok(false, 'should have failed');
  } catch(e) {
    assert.ok(true, 'it errored');
  }
});

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
