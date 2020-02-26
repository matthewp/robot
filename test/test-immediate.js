import { createMachine, guard, interpret, immediate, state, transition } from '../machine.js';

QUnit.module('Immediate', hooks => {
  QUnit.test('Will immediately transition', assert => {
    let machine = createMachine({
      one: state(
        transition('ping', 'two')
      ),
      two: state(
        immediate('three')
      ),
      three: state()
    });
    let service = interpret(machine, () => {});
    service.send('ping');
    assert.equal(service.machine.current, 'three');
  });

  QUnit.test('Will not reject state when a guard fails', assert => {
    let machine = createMachine({
      one: state(
        transition('ping', 'two')
      ),
      two: state(
        immediate('three', guard(() => false)),
        transition('next', 'three')
      ),
      three: state()
    });
    let service = interpret(machine, () => {});
    service.send('ping');
    assert.equal(service.machine.current, 'two');
    service.send('next');
    assert.equal(service.machine.current, 'three');
  });
});