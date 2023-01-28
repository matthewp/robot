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
    assert.ok(true, 'it is errored');
  }
});

QUnit.test('Errors when no transitions for event from the current state', assert => {
  try {
    const machine = createMachine('one', {
      one: state(),
    });
    const { send } = interpret(machine, () => {});
    send('go');
    assert.ok(false, 'should have failed');
  } catch(e) {
    assert.ok(true, 'it is errored');
  }
});
