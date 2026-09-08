import { createMachine, interpret, state, transition, guard, reduce, action } from '../machine.js';

QUnit.module('Transition', () => {
  QUnit.test('Basic transition from one state to another', assert => {
    const machine = createMachine({
      sleep: state(
        transition('wake', 'breakfast')
      ),
      breakfast: state(
        transition('eat', 'work')
      ),
      work: state()
    });

    const service = interpret(machine);
    assert.equal(service.machine.current, 'sleep');

    service.send('wake');
    assert.equal(service.machine.current, 'breakfast');

    service.send('eat');
    assert.equal(service.machine.current, 'work');
  });

  QUnit.test('Multiple transitions for the same event with guards (conditional branching)', assert => {
    const amHungry = ctx => ctx.hungry;

    const machine = createMachine({
      shopping: state(
        transition('buy', 'food',
          guard(amHungry)
        ),
        transition('buy', 'clothes')
      ),
      food: state(),
      clothes: state()
    }, (ctx) => ({ hungry: false, ...ctx }));

    // Case 1: hungry is false -> second transition taken
    let service = interpret(machine);
    service.send('buy');
    assert.equal(service.machine.current, 'clothes', 'Transitions to clothes when not hungry');

    // Case 2: hungry is true -> first transition taken
    let service2 = interpret(machine, () => { }, { hungry: true });
    service2.send('buy');
    assert.equal(service2.machine.current, 'food', 'Transitions to food when hungry');
  });

  QUnit.test('Self-transitions update context while staying in same state', assert => {
    const machine = createMachine({
      counter: state(
        transition('increment', 'counter',
          reduce((ctx, ev) => ({ ...ctx, count: ctx.count + (ev.amount || 1) }))
        )
      )
    }, () => ({ count: 0 }));

    const service = interpret(machine);
    service.send({ type: 'increment', amount: 5 });
    assert.equal(service.machine.current, 'counter', 'remains in counter state');
    assert.equal(service.context.count, 5, 'context updated');

    service.send({ type: 'increment', amount: 3 });
    assert.equal(service.machine.current, 'counter');
    assert.equal(service.context.count, 8);
  });

  QUnit.test('Transition execution order: Guard -> Reducer/Action -> State Change -> Listener', assert => {
    const events = [];

    const machine = createMachine({
      start: state(
        transition('go', 'end',
          guard((ctx) => {
            events.push('guard');
            return true;
          }),
          action(() => {
            events.push('action');
          }),
          reduce((ctx) => {
            events.push('reduce');
            return { ...ctx, step: 1 };
          })
        )
      ),
      end: state()
    });

    const service = interpret(machine, () => {
      events.push('listener');
    });

    service.send('go');

    assert.deepEqual(
      events,
      ['guard', 'action', 'reduce', 'listener'],
      'Execution order strictly followed'
    );
    assert.equal(service.machine.current, 'end');
    assert.equal(service.context.step, 1);
  });
});
