import { createMachine, state, transition, interpret } from '../machine.js';

QUnit.module('createMachine', () => {
  QUnit.test('First state defined is the default initial state', assert => {
    const machine = createMachine({
      idle: state(
        transition('start', 'running')
      ),
      running: state()
    });

    assert.equal(machine.current, 'idle', 'Default initial state is the first state');
    const service = interpret(machine);
    assert.equal(service.machine.current, 'idle', 'Service starts in the first state');
  });

  QUnit.test('Initial state can be explicitly provided as the first argument', assert => {
    const machine = createMachine('running', {
      idle: state(
        transition('start', 'running')
      ),
      running: state(
        transition('stop', 'idle')
      )
    });

    assert.equal(machine.current, 'running', 'Explicit initial state is set on machine');
    const service = interpret(machine);
    assert.equal(service.machine.current, 'running', 'Service starts in the explicit initial state');
  });

  QUnit.test('Context function receives initialContext and event', assert => {
    const contextFn = (initialContext, event) => {
      assert.deepEqual(initialContext, { user: 'Alice' }, 'initialContext passed to context function');
      assert.deepEqual(event, { type: 'init' }, 'event passed to context function');
      return { user: initialContext.user, role: 'admin' };
    };

    const machine = createMachine({
      idle: state()
    }, contextFn);

    const service = interpret(machine, () => { }, { user: 'Alice' }, { type: 'init' });
    assert.deepEqual(service.context, { user: 'Alice', role: 'admin' }, 'context resolved properly');
  });

  QUnit.test('Machine object structure and immutability', assert => {
    const machine = createMachine({
      one: state(),
      two: state()
    });

    assert.equal(typeof machine.states, 'object', 'states property exists');
    assert.ok(machine.states.one, 'state one exists');
    assert.ok(machine.states.two, 'state two exists');
    assert.ok(Object.isFrozen(machine), 'machine object is frozen');
  });
});
