import {expectTypeOf} from 'expect-type';
import {test} from 'node:test';
import assert from 'node:assert';
import {
  type Service,
  createMachine,
  transition,
  state,
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

