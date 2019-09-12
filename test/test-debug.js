import { createMachine, interpret, state, transition } from '../machine.js';

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