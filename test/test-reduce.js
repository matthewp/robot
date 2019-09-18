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
    let service = interpret(machine, () => {});
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

    let service = interpret(machine, () => {});
    service.send('go');
    assert.deepEqual(service.context, { one: 1, two: 2 }, 'context remains');
  });

  QUnit.test('Event is the second argument', assert => {
    assert.expect(2);

    let machine = createMachine({
      one: state(
        transition('go', 'two',
          reduce(function(ctx, ev) {
            assert.equal(ev, 'go');
            return { ...ctx, worked: true };
          })
        )
      ),
      two: state()
    });
    let service = interpret(machine, () => {});
    service.send('go');
    assert.equal(service.context.worked, true, 'changed the context');
  });
});