import { createMachine, interpret, reduce, state, transition } from '../machine.js';

QUnit.module('Reduce', () => {
  QUnit.test('Basic state change', assert => {
    let machine = createMachine({
      one: state(
        transition('ping', 'two',
          reduce((ev, ctx) => ({ ...ctx, one: 1 })),
          reduce((ev, ctx) => ({ ...ctx, two: 2 }))
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
});