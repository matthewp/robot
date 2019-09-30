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

  QUnit.test('If there are multiple guards, any returning false prevents a transition', assert => {
    let machine = createMachine({
      one: state(
        transition('ping', 'two',
          guard(() => false),
          guard(() => true)
        )
      ),
      two: state()
    });
    let service = interpret(machine, service => {});
    service.send('ping');
    assert.equal(service.machine.current, 'one');
  });

  QUnit.test('Guards are passed the event', assert => {
    let machine = createMachine({
      one: state(
        transition('ping', 'two',
          guard((ctx, ev) => ev.canProceed)
        )
      ),
      two: state()
    });
    let service = interpret(machine, () => {});
    service.send({ type: 'ping' });
    assert.equal(service.machine.current, 'one', 'still in the initial state');
    service.send({ type: 'ping', canProceed: true });
    assert.equal(service.machine.current, 'two', 'now moved');
  });
});