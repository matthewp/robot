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

  QUnit.test('Can immediately transitions past 2 states', assert => {
    let machine = createMachine({
      one: state(
        immediate('two')
      ),
      two: state(
        immediate('three')
      ),
      three: state()
    });

    let service = interpret(machine, () => {});
    assert.equal(service.machine.current, 'three', 'transitioned to 3');
    assert.ok(service.machine.state.value.final, 'in the final state');
  });
});