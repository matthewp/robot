import { createMachine, action, interpret, state, transition } from '../machine.js';

QUnit.module('Action', () => {
  QUnit.test('Can be used to do side-effects', assert => {
    let count = 0;
    let orig = {};
    let machine = createMachine({
      one: state(
        transition('ping', 'two',
          action(() => count++)
        )
      ),
      two: state()
    }, () => orig);
    let service = interpret(machine, () => {});
    service.send('ping');

    assert.equal(service.context, orig, 'context stays the same');
    assert.equal(count, 1, 'side-effect performed');
  });

  QUnit.test('Discards the return value', assert => {
    let orig = {};
    let machine = createMachine({
      one: state(
        transition('ping', 'two',
          action(() => -1)
        )
      ),
      two: state()
    }, () => orig);
    let service = interpret(machine, () => {});
    service.send('ping');

    assert.equal(service.context, orig, 'context stays the same');
  });
});
