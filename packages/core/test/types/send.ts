import { expectTypeOf } from 'expect-type';
import { test } from 'node:test';
import {
  type Service,
  createMachine,
  transition,
  state,
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