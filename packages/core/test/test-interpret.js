import { createMachine, interpret, state, transition, reduce, guard, d } from '../machine.js';

QUnit.module('interpret', () => {
  QUnit.test('interpret works when onChange argument is omitted', assert => {
    const machine = createMachine({
      one: state(
        transition('next', 'two')
      ),
      two: state()
    });

    const service = interpret(machine);
    assert.equal(service.machine.current, 'one', 'Starts in state one');
    service.send('next');
    assert.equal(service.machine.current, 'two', 'Transitions to state two without throwing error');
  });

  QUnit.test('onChange receives service instance on transition', assert => {
    let callCount = 0;
    let passedService = null;

    const machine = createMachine({
      one: state(
        transition('next', 'two')
      ),
      two: state()
    });

    const service = interpret(machine, s => {
      callCount++;
      passedService = s;
    });

    service.send('next');
    assert.equal(callCount, 1, 'onChange called once');
    assert.equal(passedService, service, 'onChange passed the service instance');
    assert.equal(passedService.machine.current, 'two', 'Service current state is updated');
  });

  QUnit.test('onChange is called even on self-transitions', assert => {
    let callCount = 0;

    const machine = createMachine({
      one: state(
        transition('ping', 'one',
          reduce(ctx => ({ ...ctx, count: (ctx.count || 0) + 1 }))
        )
      )
    }, () => ({ count: 0 }));

    const service = interpret(machine, () => {
      callCount++;
    });

    service.send('ping');
    assert.equal(callCount, 1, 'onChange called on self-transition');
    assert.equal(service.machine.current, 'one', 'remains in state one');
    assert.equal(service.context.count, 1, 'context updated');
  });

  QUnit.test('service.machine exposes current and state properties', assert => {
    const machine = createMachine({
      idle: state()
    });

    const service = interpret(machine);
    assert.equal(service.machine.current, 'idle', 'service.machine.current');
    assert.equal(service.machine.state.name, 'idle', 'service.machine.state.name');
    assert.equal(typeof service.machine.state.value, 'object', 'service.machine.state.value');
  });

  QUnit.test('Sending event objects passes payload to guards and reducers', assert => {
    const machine = createMachine({
      idle: state(
        transition('input', 'editing',
          guard((ctx, ev) => ev.value && ev.value.length > 0),
          reduce((ctx, ev) => ({ ...ctx, text: ev.value }))
        )
      ),
      editing: state()
    }, () => ({ text: '' }));

    const service = interpret(machine);

    // Guard fails for empty value
    service.send({ type: 'input', value: '' });
    assert.equal(service.machine.current, 'idle', 'Guard blocked invalid input');

    // Guard passes for valid value
    service.send({ type: 'input', value: 'Hello World' });
    assert.equal(service.machine.current, 'editing', 'Transitioned to editing');
    assert.equal(service.context.text, 'Hello World', 'Context updated from event payload');
  });

  QUnit.test('Ignored events do not trigger state changes or onChange (with and without debug mode)', assert => {
    let onChangeCount = 0;

    const machine = createMachine({
      one: state(
        transition('next', 'two')
      ),
      two: state()
    });

    const service = interpret(machine, () => {
      onChangeCount++;
    });

    // 1. With debug mode enabled (d._send throws an error)
    const originalSendHook = d._send;
    try {
      service.send('unknown_event');
      assert.ok(false, 'Should have thrown in debug mode');
    } catch (e) {
      assert.ok(/No transitions for event/.test(e.message), 'Debug mode throws error on unknown event');
    }
    assert.equal(service.machine.current, 'one', 'State unchanged with debug mode');
    assert.equal(onChangeCount, 0, 'onChange not called with debug mode');

    // 2. Without debug mode (d._send is null/undefined)
    d._send = null;
    try {
      service.send('unknown_event');
      assert.ok(true, 'Does not throw when debug mode is disabled');
    } catch (e) {
      assert.ok(false, 'Should not throw when debug mode is disabled');
    } finally {
      d._send = originalSendHook;
    }
    assert.equal(service.machine.current, 'one', 'State unchanged without debug mode');
    assert.equal(onChangeCount, 0, 'onChange not called without debug mode');
  });

  QUnit.test('Original machine definition remains immutable when events are sent', assert => {
    const machine = createMachine({
      one: state(
        transition('next', 'two')
      ),
      two: state()
    });

    const service1 = interpret(machine);
    const service2 = interpret(machine);

    service1.send('next');
    assert.equal(service1.machine.current, 'two', 'service1 transitioned');
    assert.equal(service2.machine.current, 'one', 'service2 remains untouched');
    assert.equal(machine.current, 'one', 'Original machine definition untouched');
  });
});
