import { createMachine, interpret, invoke, reduce, state, transition } from '../machine.js';

QUnit.module('States', hooks => {
  QUnit.test('Basic state change', assert => {
    assert.expect(5);
    let machine = createMachine({
      one: state(
        transition('ping', 'two')
      ),
      two: state(
        transition('pong', 'one')
      )
    });
    let service = interpret(machine, service => {
      assert.ok(true, 'Callback called');
    });
    assert.equal(service.machine.current, 'one');
    service.send('ping');
    assert.equal(service.machine.current, 'two');
    service.send('pong');
    assert.equal(service.machine.current, 'one');
  });

  QUnit.test('Data can be passed into the initial context', assert => {
    let machine = createMachine({
      one: state()
    }, ev => ({ foo: ev.foo }));

    let service = interpret(machine, () => {}, {
      foo: 'bar'
    });

    assert.equal(service.context.foo, 'bar', 'works!');
  });

  QUnit.test('First argument sets the initial state', assert => {
    let machine = createMachine('two', {
      one: state(transition('next', 'two')),
      two: state(transition('next', 'three')),
      three: state()
    });

    let service = interpret(machine, () => {});
    assert.equal(service.machine.current, 'two', 'in the initial state');

    machine = createMachine('two', {
      one: state(transition('next', 'two')),
      two: state(),
    });
    service = interpret(machine, () => {});
    assert.equal(service.machine.current, 'two', 'in the initial state');
    assert.equal(service.machine.state.value.final, true, 'in the final state');
  });

  QUnit.test('Child machines receive the event used to invoke them', assert => {
    let child = createMachine({
      final: state()
    }, (ctx, ev) => ({ count: ev.count }));
    let parent = createMachine({
      start: state(
        transition('next', 'next')
      ),
      next: invoke(child,
        transition('done', 'end',
          reduce((ctx, ev) => ({
            ...ctx,
            ...ev.data
          }))
        )
      ),
      end: state()
    });
    let service = interpret(parent, () => {});
    service.send({ type: 'next', count: 14 });
    assert.equal(service.context.count, 14, 'event sent through');
  });
});