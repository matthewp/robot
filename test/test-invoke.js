import { createMachine, interpret, invoke, reduce, state, transition } from '../machine.js';

QUnit.module('Invoke');

QUnit.test('Goes to the "done" event when complete', async assert => {
  let machine = createMachine({
    one: state(transition('click', 'two')),
    two: invoke(() => Promise.resolve(13),
      transition('done', 'three',
        reduce((ev, ctx) => ({ ...ctx, age: ev.data }))
      )
    ),
    three: state()
  }, () => ({age: 0}));

  let service = interpret(machine, () => {});
  service.send('click');
  await Promise.resolve();
  assert.equal(service.context.age, 13, 'Invoked');
  assert.equal(service.machine.current, 'three', 'now in the next state');
});

QUnit.test('Goes to the "error" event when there is an error', async assert => {
  let machine = createMachine({
    one: state(transition('click', 'two')),
    two: invoke(() => Promise.reject(new Error('oh no')),
      transition('error', 'three',
        reduce((ev, ctx) => ({ ...ctx, error: ev.error }))
      )
    ),
    three: state()
  }, () => ({age: 0}));

  let service = interpret(machine, () => {});
  service.send('click');
  await Promise.resolve(); await Promise.resolve();
  assert.equal(service.context.error.message, 'oh no', 'Got the right error');
});

QUnit.test('The initial state can be an invoke', async assert => {
  let machine = createMachine({
    one: invoke(() => Promise.resolve(2),
      transition('done', 'two', reduce((ev, ctx) => ({...ctx, age: ev.data})))
    ),
    two: state()
  }, () => ({ age: 0 }));

  let service = interpret(machine, () => {});
  await Promise.resolve();
  assert.equal(service.context.age, 2, 'Invoked immediately');
  assert.equal(service.machine.current, 'two', 'in the new state');
});