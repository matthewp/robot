import { createMachine, interpret, reduce, state, transition } from '../machine.js';

QUnit.module('Reduce', () => {
  QUnit.test('Basic state change', assert => {
    let machine = createMachine({
      one: state(
        transition('ping', 'two',
          reduce((ctx) => ({ ...ctx, one: 1 })),
          reduce((ctx) => ({ ...ctx, two: 2 }))
        )
      ),
      two: state()
    });
    let service = interpret(machine, () => { });
    service.send('ping');

    let { one, two } = service.context;
    assert.equal(one, 1, 'first reducer ran');
    assert.equal(two, 2, 'second reducer ran');
  });

  QUnit.test('If no reducers, the context remains', assert => {
    let machine = createMachine({
      one: state(
        transition('go', 'two')
      ),
      two: state()
    }, () => ({ one: 1, two: 2 }));

    let service = interpret(machine, () => { });
    service.send('go');
    assert.deepEqual(service.context, { one: 1, two: 2 }, 'context remains');
  });

  QUnit.test('Reducer receives context and event parameters', assert => {
    assert.expect(4);

    let machine = createMachine({
      one: state(
        transition('go', 'two',
          reduce(function (ctx, ev) {
            assert.equal(ctx.val, 42, 'context received');
            assert.equal(ev, 'go', 'event string received');
            return { ...ctx, worked: true };
          })
        ),
        transition('ping', 'two',
          reduce((ctx, ev) => {
            assert.equal(ev.type, 'ping', 'event object received');
            return { ...ctx, worked: true };
          })
        )
      ),
      two: state()
    }, () => ({ val: 42 }));

    let service = interpret(machine, () => { });
    service.send('go');
    assert.equal(service.context.worked, true, 'changed the context');

    let service2 = interpret(machine, () => { });
    service2.send({ type: 'ping' });
  });

  QUnit.test('Multiple reducers execute in sequence', assert => {
    let order = [];
    let machine = createMachine({
      one: state(
        transition('go', 'two',
          reduce(() => order.push('first')),
          reduce(() => order.push('second')),
          reduce(() => order.push('third'))
        )
      ),
      two: state()
    });

    let service = interpret(machine, () => { });
    service.send('go');
    assert.deepEqual(order, ['first', 'second', 'third'], 'Reducers ran in order');
  });
});
