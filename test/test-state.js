import { createMachine, interpret, state, transition } from '../machine.js';

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
});