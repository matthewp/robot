import { expectTypeOf } from 'expect-type';
import { test } from 'node:test';
import {
  createMachine,
  transition,
  state,
} from 'robot3';
import {
  createUseMachine
} from 'robot-hooks';

test('send(event) is typed', () => {
  const useMachine = createUseMachine(null, null);
  const machine = createMachine({
    one: state(transition('go-two', 'two')),
    two: state(transition('go-one', 'one')),
    three: state()
  });

  const [_state, send] = useMachine(machine);

  type Params = Parameters<typeof send>;
  type EventParam = Params[0];
  type StringParams = Extract<EventParam, string>;
  expectTypeOf<StringParams>().toEqualTypeOf<'go-one' | 'go-two'>();

  type ObjectParams = Extract<EventParam, { type: string; }>;
  expectTypeOf<ObjectParams['type']>().toEqualTypeOf<'go-one' | 'go-two'>();
});