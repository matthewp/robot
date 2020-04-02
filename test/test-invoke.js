import { createMachine, immediate, interpret, invoke, reduce, state, state as final, transition } from '../machine.js';

QUnit.module('Invoke', hooks => {
  QUnit.module('Promise');

  QUnit.test('Goes to the "done" event when complete', async assert => {
    let machine = createMachine({
      one: state(transition('click', 'two')),
      two: invoke(() => Promise.resolve(13),
        transition('done', 'three',
          reduce((ctx, ev) => ({ ...ctx, age: ev.data }))
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
          reduce((ctx, ev) => ({ ...ctx, error: ev.error }))
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
        transition('done', 'two', reduce((ctx, ev) => ({...ctx, age: ev.data})))
      ),
      two: state()
    }, () => ({ age: 0 }));
  
    let service = interpret(machine, () => {});
    await Promise.resolve();
    assert.equal(service.context.age, 2, 'Invoked immediately');
    assert.equal(service.machine.current, 'two', 'in the new state');
  });

  QUnit.module('Machine');

  QUnit.test('Can invoke a child machine', async assert => {
    assert.expect(4);
    let one = createMachine({
      nestedOne: state(
        transition('go', 'nestedTwo')
      ),
      nestedTwo: final()
    });
    let two = createMachine({
      one: state(
        transition('go', 'two')
      ),
      two: invoke(one,
        transition('done', 'three')
      ),
      three: final()
    });
    let c = 0;
    let service = interpret(two, thisService => {
      switch(c) {
        case 0:
          assert.equal(service.machine.current, 'two');
          break;
        case 1:
          assert.notEqual(thisService, service, 'second time a different service');
          break;
        case 2:
          assert.equal(service.machine.current, 'three', 'now in three state');
          break;
      }
      c++;
    });
    service.send('go');
    service.child.send('go');
    assert.equal(c, 3, 'there were 3 transitions');
  });

  QUnit.test('Child machines receive events from their parents', async assert => {
    const action = fn =>
    reduce((ctx, ev) => {
      fn(ctx, ev);
      return ctx;
    });
  
    const wait = ms => () => new Promise(resolve => setTimeout(resolve, ms));
  
    const child = createMachine({
      init: state(
        immediate('waiting',
          action(ctx => {
            ctx.stuff.push(1);
          })
        )
      ),
      waiting: invoke(
        wait(50),
        transition('done', 'fin',
          action(ctx => {
            ctx.stuff.push(2);
          })
        )
      ),
      fin: state()
    }, ctx => ctx);
  
    const machine = createMachine(
      {
        idle: state(transition("next", "child")),
        child: invoke(child, transition("done", "end")),
        end: state()
      },
      () => ({ stuff: [] })
    );

    let service = interpret(machine, () => {});
    service.send('next');

    await wait(50)();

    assert.deepEqual(service.context.stuff, [1, 2]);
  });

  QUnit.test('Service does not have a child when not in an invoked state', assert => {
    const child = createMachine({
      nestedOne: state(
        transition('next', 'nestedTwo')
      ),
      nestedTwo: state()
    });
    const parent = createMachine({
      one: invoke(child,
        transition('done', 'two')
      ),
      two: state()
    });

    let service = interpret(parent, () => {});
    assert.ok(service.child, 'there is a child service');

    service.child.send('next');
    assert.notOk(service.child, 'No longer a child');
  });

  QUnit.test('Multi level nested machines resolve in correct order', async assert => {
    assert.expect(18);

    const four = createMachine({
      init: state(
        transition('START', 'start'),
      ),
      start: state(
        transition('DONE', 'done'),
      ),
      done: state(),
    })

    const three = createMachine({
      init: state(
        transition('START', 'start'),
      ),
      start: invoke(four,
        transition('done', 'done'),
      ),
      done: state(),
    })

    const two = createMachine({
      init: state(
        transition('START', 'start'),
      ),
      start: invoke(three,
        transition('done', 'done'),
      ),
      done: state(),
    })

    const one = createMachine({
      init: state(
        transition('START', 'start'),
      ),
      start: invoke(two,
        transition('done', 'done'),
      ),
      done: state(),
    })

    let c = 0;
    let service = interpret(one, thisService => {
      switch (c) {
        case 0:
          assert.equal(service.machine.current, 'start', 'initial state');
          break;
        case 1:
          assert.notEqual(thisService.machine.states, service.machine.states, 'second time a different service');
          assert.ok(service.child, 'has child');
          assert.equal(service.child.machine.current, 'start');
          break;
        case 2:
          assert.ok(service.child.child, 'has grand child');
          assert.equal(service.child.machine.current, 'start');
          assert.equal(service.child.child.machine.current, 'start');
          break;
        case 3:
          assert.ok(service.child.child.child, 'has grand grand child');
          assert.equal(service.child.child.machine.current, 'start');
          assert.equal(service.child.child.child.machine.current, 'start');
          break;
        case 4:
          assert.equal(service.child.child.child.machine.current, 'done');
          break;
        case 5:
          assert.equal(service.child.child.machine.current, 'done');
          assert.equal(service.child.child.child, undefined, 'child is removed when resolved');
          break;
        case 6:
          assert.equal(service.child.machine.current, 'done');
          assert.equal(service.child.child, undefined, 'child is removed when resolved');
          break;
        case 7:
          assert.equal(service.machine.current, 'done');
          assert.equal(service.child, undefined, 'child is removed when resolved');
          break;
      }
      c++;
    });
    service.send('START') // machine one
    service.child.send('START') // machine two
    service.child.child.send('START') // machine tree
    service.child.child.child.send('START') // machine four
    service.child.child.child.send('DONE') // machine four
    assert.equal(c, 8, 'there were 6 transitions');
  });

  QUnit.test('Invoking a machine that immediately finishes', async assert => {
    assert.expect(1);

    const child = createMachine({
      nestedOne: state(
        immediate('nestedTwo')
      ),
      nestedTwo: final()
    });

    const parent = createMachine({
      one: state(
        transition('next', 'two')
      ),
      two: invoke(child,
        transition('done', 'three')
      ),
      three: final()
    });

    let service = interpret(parent, s => {
      // TODO not totally sure if this is correct, but I think it should
      // hit this only once and be equal to three
      assert.equal(s.machine.current, 'three');
    });

    service.send('next');
  });
});