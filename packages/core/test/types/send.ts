import {expectTypeOf} from 'expect-type';
import {test} from 'node:test';
import assert from 'node:assert';
import {
  type Service,
  createMachine,
  transition,
  state,
  immediate,
  reduce,
  action,
  invoke, interpret
} from 'robot3';

test('send(event) is typed', () => {
  const machine = createMachine({
    one: state(transition('go-two', 'two')),
    two: state(transition('go-one', 'one')),
    three: state()
  });

  type Params = Parameters<Service<typeof machine>['send']>;
  type EventParam = Params[0];
  type StringParams = Extract<EventParam, string>;
  expectTypeOf<StringParams>().toEqualTypeOf<'go-one' | 'go-two'>();

  type ObjectParams = Extract<EventParam, { type: string; }>;
  expectTypeOf<ObjectParams['type']>().toEqualTypeOf<'go-one' | 'go-two'>();
});

test('types machine with multiple transitions from one state', () => {
  const machine = createMachine({
    one: state(transition('go-two', 'two'), transition('go-three', 'three')),
    two: state(transition('go-one', 'one')),
    three: state()
  });

  type Params = Parameters<Service<typeof machine>['send']>;
  type EventParam = Params[0];
  type StringParams = Extract<EventParam, string>;
  expectTypeOf<StringParams>().toEqualTypeOf<'go-one' | 'go-two' | 'go-three'>();

  type ObjectParams = Extract<EventParam, { type: string; }>;
  expectTypeOf<ObjectParams['type']>().toEqualTypeOf<'go-one' | 'go-two' | 'go-three'>();
});


test('types states with different events per transition (#262)', () => {
  const machine = createMachine({
    idle: state(
      transition('start', 'running')
    ),
    running: state(
      transition('pause', 'paused'),
      transition('stop', 'idle')
    ),
    paused: state(
      transition('resume', 'running'),
      transition('stop', 'idle')
    )
  });

  type EventParam = Parameters<Service<typeof machine>['send']>[0];
  expectTypeOf<Extract<EventParam, string>>().toEqualTypeOf<'start' | 'pause' | 'stop' | 'resume'>();
});

test('immediate does not widen the event type', () => {
  const machine = createMachine({
    idle: state(transition('check', 'checking')),
    checking: state(immediate('done')),
    done: state(transition('reset', 'idle'))
  });

  type EventParam = Parameters<Service<typeof machine>['send']>[0];
  expectTypeOf<Extract<EventParam, string>>().toEqualTypeOf<'check' | 'reset'>();
});

test('reducers and actions in state() do not add events', () => {
  const machine = createMachine({
    idle: state(
      reduce((ctx: { n: number }) => ({ ...ctx, n: 0 })),
      action(() => {}),
      transition('go', 'done')
    ),
    done: state(reduce((ctx: { n: number }) => ctx))
  }, () => ({ n: 0 }));

  type EventParam = Parameters<Service<typeof machine>['send']>[0];
  expectTypeOf<Extract<EventParam, string>>().toEqualTypeOf<'go'>();
});

test('types nested machine', () => {
  const stopwalk = createMachine({
    walk: state(
      transition('startBlinking', 'blink'),
    ),
    blink: state(
      transition('finishBlinking', 'dontWalk'),
    ),
    dontWalk: state()
  });

  const stoplight = createMachine({
    green: state(
      transition('next', 'yellow')
    ),
    yellow: state(
      transition('next', 'red')
    ),
    red: invoke(stopwalk,
      transition('done', 'green')
    )
  });

  const s = interpret(stoplight, console.log);

  assert.equal(s.machine.current, 'green')
  s.send("next")
  assert.equal(s.machine.current, 'yellow')
  s.send("next")
  assert.equal(s.machine.current, 'red')
  assert.equal(s.child?.machine.current, 'walk')
  s.child?.send("startBlinking")
  assert.equal(s.child?.machine.current, 'blink')
  s.child?.send("finishBlinking")
  assert.equal(s.child, undefined)
  assert.equal(s.machine.current, "green")

  type Params = Parameters<Service<typeof stoplight>['send']>;
  type EventParam = Params[0];
  type StringParams = Extract<EventParam, string>;
  expectTypeOf<StringParams>().toEqualTypeOf<'next' | 'startBlinking' | 'finishBlinking'>();

  type ObjectParams = Extract<EventParam, { type: string; }>;
  expectTypeOf<ObjectParams['type']>().toEqualTypeOf<'next' | 'startBlinking' | 'finishBlinking'>();
})

