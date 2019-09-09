import { createMachine, interpret, guard, state, transition } from '../machine.js';

QUnit.module('Guards', hooks => {
  QUnit.test('Can prevent changing states', assert => {
    let canProceed = false;
    let machine = createMachine({
      one: state(
        transition('ping', 'two', guard(() => canProceed))
      ),
      two: state()
    });
    let service = interpret(machine, service => {});
    service.send('ping');
    assert.equal(service.machine.current, 'one');
    canProceed = true;
    service.send('ping');
    assert.equal(service.machine.current, 'two');
  });
});