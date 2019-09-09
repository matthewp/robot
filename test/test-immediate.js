import { createMachine, interpret, immediate, state, transition } from '../machine.js';

QUnit.module('Immediate', hooks => {
  QUnit.test('Will immediately transition', assert => {
    let canProceed = false;
    let machine = createMachine({
      one: state(
        transition('ping', 'two')
      ),
      two: state(
        immediate('three')
      ),
      three: state()
    });
    let service = interpret(machine, service => {});
    service.send('ping');
    assert.equal(service.machine.current, 'three');
  });
});