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
      one: state(
        transition('go', 'two')
      ),
      two: final()
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
          assert.notEqual(thisService.machine.states, service.machine.states, 'second time a different service');
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
    assert.ok(!!service.child, 'there is a child service');

    service.child.send('next');
    assert.notOk(!!service.child, 'No longer a child');
  });

  QUnit.test('Nested child machines resolve "done" in correctly', async assert => {
    assert.expect(11);
    let grandChild = createMachine({
      grandChildStart: state(
        transition('go', 'grandChildDone'),
      ),
      grandChildDone: final(),
    });
    let child = createMachine({
      childStart: state(
        transition('go', 'grandChild')
      ),
      grandChild: invoke(grandChild, transition('done', 'childIdle')),
      childIdle: state(transition('go', 'childDone')),
      childDone: final(),
    });
    let root = createMachine({
      rootStart: state(
        transition('go', 'child')
      ),
      child: invoke(child,
        transition('done', 'rootDone')
      ),
      rootDone: final()
    });
    let c = 0;
    let service = interpret(root, thisService => {
      switch(c) {
        case 0:
          assert.equal(service.machine.current, 'child');
          break;
        case 1:
          assert.notEqual(thisService.machine.states, service.machine.states, 'second time a different service');
          assert.equal(service.child.machine.current, 'grandChild');
          assert.equal(service.child.child.machine.current, 'grandChildStart');
          break;
        case 2:
          assert.equal(service.child.machine.current, 'grandChild');
          assert.equal(service.child.child.machine.current, 'grandChildDone');
          break;
        case 3:
          assert.equal(service.child.machine.current, 'childIdle');
          assert.equal(service.machine.current, 'child', 'now in child state');
          break;
        case 4:
          assert.equal(service.child.machine.current, 'childDone');
          break;
        case 5:
          assert.equal(service.machine.current, 'rootDone', 'now in rootDone state');
          break;
      }
      c++;
    });
    service.send('go');
    service.child.send('go');
    service.child.child.send('go');
    service.child.send('go');
    assert.equal(c, 6, 'there were 6 transitions');
  });
});
