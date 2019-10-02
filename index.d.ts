declare module 'robot3' {
  /**
   * The `createMachine` function creates a state machine. It takes an object of *states* with the key being the state name.
   * The value is usually *state* but might also be *invoke*.
   *
   * @param initial - Creates a machine that has *initial* as it's initial state.
   * @param states - An object of states, where each key is a state name, and the values are one of *state* or *invoke*.
   * @param context - A function that returns an object of extended state values. The function can receive an `event` argument.
   */
  export function createMachine<S, C>(
    initial: string,
    states: { [K in keyof S]: MachineState },
    context?: ContextFunction<C>
  ): Machine<typeof states, C, keyof typeof states>
  /**
   * The `createMachine` function creates a state machine. It takes an object of *states* with the key being the state name.
   * The value is usually *state* but might also be *invoke*.
   *
   * @param states - An object of states, where each key is a state name, and the values are one of *state* or *invoke*.
   * @param context - A function that returns an object of extended state values. The function can receive an `event` argument.
   */
  export function createMachine<S, C>(
    states: { [K in keyof S]: MachineState },
    context?: ContextFunction<C>
  ): Machine<typeof states, C, keyof typeof states>

  /**
   * The `state` function returns a state object. A state can take transitions and immediates as arguments.
   *
   * @param args - Any argument needs to be of type Transition or Immediate.
   */
  export function state(...args: (Transition | Immediate)[]): MachineState

  /**
   * A `transition` function is used to move from one state to another.
   *
   * @param event - This will give the name of the event that triggers this transition.
   * @param state - The name of the destination state.
   * @param args - Any extra argument will be evaluated to check if they are one of Reducer, Guard or Action.
   */
  export function transition<C>(
    event: string,
    state: string,
    ...args: (Reducer<C> | Guard<C> | Action<C>)[]
  ): Transition

  /**
   * An `immediate` function is a type of transition that occurs immediately; it doesn't wait for an event to proceed.
   * This is a state that immediately proceeds to the next.
   *
   * @param state - The name of the destination state.
   * @param args - Any extra argument will be evaluated to check if they are a Reducer or a Guard.
   */
  export function immediate<C>(
    state: string,
    ...args: (Reducer<C> | Guard<C>)[]
  ): Transition

  /**
   * A `guard` is a method that determines if a transition can proceed.
   * Returning true allows the transition to occur, returning false prevents it from doing so and leaves the state in its current place.
   *
   * @param guardFunction A Function that can receive *context* and will return true or false.
   */
  export function guard<C>(guardFunction?: GuardFunction<C>): Guard<C>

  /**
   * A `reduce` takes a reducer function for changing the context of the machine. A common use case is to set values coming from form fields.
   *
   * @param reduceFunction A Function that can receive *context* and *event* and will return the context.
   */
  export function reduce<C>(reduceFunction?: ReduceFunction<C>): Reducer<C>

  /**
   * An `action` function takes a function that will be run during a transition. The primary purpose of using action is to perform side-effects.
   *
   * @param actionFunction A Function that can receive *context*, returned values are discarded.
   */
  export function action<C>(actionFunction?: ActionFunction<C>): Action<C>

  /* General Types */

  export type ContextFunction<T> = (context: T) => T

  export type GuardFunction<T> = (context: T) => boolean

  export type ActionFunction<T> = (context: T) => boolean

  export type ReduceFunction<T> = (context: T, event: unknown) => T

  export type Machine<S, C, K> = {
    context: C
    current: K
    states: S
  }

  export type Action<C> = {
    fn: (context: C) => void
  }

  export type Reducer<C> = {
    fn: (context: C, event: unknown) => C
  }

  export type Guard<C> = {
    fn: (context: C) => boolean
  }

  export interface MachineState {
    final: boolean
    transitions: Map<string, Transition>
    immediates?: Map<string, Transition>
    enter?: any
  }

  export interface Transition {
    from: string | null
    to: string
    guards: any[]
    reducers: any[]
  }

  export type Immediate = Transition
}
