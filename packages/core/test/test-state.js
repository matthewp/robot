import { action, createMachine, guard, immediate, interpret, invoke, reduce, state, transition } from '../machine.js';

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

  QUnit.test('Reducers run when entering the initial state', assert => {
    let machine = createMachine({
      one: state(
        reduce(ctx => ({ ...ctx, entered: true })),
        transition('next', 'two')
      ),
      two: state()
    });
    let service = interpret(machine, () => {});
    assert.equal(service.context.entered, true);
  });

  QUnit.test('Reducers run when entering a state, after the transition\'s reducers', assert => {
    let machine = createMachine({
      one: state(
        transition('next', 'two',
          reduce((ctx, ev) => ({ ...ctx, log: [...ctx.log, 'transition ' + ev.value] }))
        )
      ),
      two: state(
        reduce((ctx, ev) => ({ ...ctx, log: [...ctx.log, 'enter ' + ev.value] }))
      )
    }, () => ({ log: [] }));
    let calls = [];
    let service = interpret(machine, s => calls.push(s.context.log.slice()));
    assert.deepEqual(service.context.log, [], 'not run before entering');
    service.send({ type: 'next', value: 1 });
    assert.deepEqual(service.context.log, ['transition 1', 'enter 1']);
    assert.deepEqual(calls, [['transition 1', 'enter 1']], 'onChange called once with the entered context');
  });

  QUnit.test('Reducers do not run on a self-transition', assert => {
    let machine = createMachine({
      counting: state(
        reduce(ctx => ({ ...ctx, entries: ctx.entries + 1, count: 0 })),
        transition('inc', 'counting', reduce(ctx => ({ ...ctx, count: ctx.count + 1 }))),
        transition('leave', 'away')
      ),
      away: state(
        transition('back', 'counting')
      )
    }, () => ({ entries: 0, count: 0 }));
    let service = interpret(machine, () => {});
    service.send('inc');
    service.send('inc');
    assert.equal(service.context.count, 2, 'self-transition kept the count');
    assert.equal(service.context.entries, 1, 'entered once');
    service.send('leave');
    service.send('back');
    assert.equal(service.context.entries, 2, 'runs again after leaving and coming back');
    assert.equal(service.context.count, 0, 'reset on re-entry');
  });

  QUnit.test('Reducers run before immediates are checked', assert => {
    let machine = createMachine({
      start: state(transition('next', 'check')),
      check: state(
        reduce(ctx => ({ ...ctx, ready: true })),
        immediate('ready', guard(ctx => ctx.ready)),
        immediate('notReady')
      ),
      ready: state(),
      notReady: state()
    }, () => ({ ready: false }));
    let service = interpret(machine, () => {});
    service.send('next');
    assert.equal(service.machine.current, 'ready');
  });

  QUnit.test('Actions run when entering a state', assert => {
    let entered = [];
    let machine = createMachine({
      one: state(
        action(() => entered.push('one')),
        transition('next', 'two')
      ),
      two: state(
        action(() => entered.push('two'))
      )
    });
    let service = interpret(machine, () => {});
    service.send('next');
    assert.deepEqual(entered, ['one', 'two']);
  });

  QUnit.test('A state with only reducers is final', assert => {
    let machine = createMachine({
      one: state(transition('next', 'done')),
      done: state(reduce(ctx => ({ ...ctx, finished: true })))
    });
    let service = interpret(machine, () => {});
    service.send('next');
    assert.equal(service.machine.state.value.final, true);
    assert.equal(service.context.finished, true);
  });
});
