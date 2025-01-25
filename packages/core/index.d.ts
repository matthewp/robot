declare module 'robot3' {

  /**
   * TS Helpers
   */
  type NestedKeys<T> = T extends object
    ? {
       [P in keyof T]-?: P extends string ? keyof T[P] : never
     }[keyof T]
   : never

  type AllStateKeys<T> = NestedKeys<T> | keyof T;

  type MachineStates<S = {}, F extends string = string> = {
    [K in keyof S]: {
      final: boolean
      transitions: Map<string, Transition<F>[]>
      immediates?: Map<string, Immediate<F>[]>
      enter?: any
    }
  }

  /**
   * The debugging object contains an _onEnter method, wich can be set to invoke
   * this function on every transition.
   */
  export const d: {
    _onEnter?: OnEnterFunction<Machine<any>>
  }

  /**
   * The `createMachine` function creates a state machine. It takes an object of *states* with the key being the state name.
   * The value is usually *state* but might also be *invoke*.
   *
   * @param initial - Creates a machine that has *initial* as it's initial state.
   * @param states - An object of states, where each key is a state name, and the values are one of *state* or *invoke*.
   * @param context - A function that returns an object of extended state values. The function can receive an `event` argument.
   */
  export function createMachine<S extends MachineStates<S, F>, C = {}, F extends string = string>(
    initial: keyof S,
    states: S,
    context?: ContextFunction<C>
  ): Machine<S, C, AllStateKeys<S>>
  /**
   * The `createMachine` function creates a state machine. It takes an object of *states* with the key being the state name.
   * The value is usually *state* but might also be *invoke*.
   *
   * @param states - An object of states, where each key is a state name, and the values are one of *state* or *invoke*.
   * @param context - A function that returns an object of extended state values. The function can receive an `event` argument.
   */
  export function createMachine<S extends MachineStates<S, F>, C = {}, F extends string = string>(
    states: S,
    context?: ContextFunction<C>
  ): Machine<S, C, AllStateKeys<S>>;

  /**
   * The `state` function returns a state object. A state can take transitions and immediates as arguments.
   *
   * @param args - Any argument needs to be of type Transition or Immediate.
   */
  export function state<T extends (Transition<any> | Immediate<any>)[]>(
    ...args: T
  ): MachineState<T[number] extends (Transition<infer F>)? F : string>;

  /**
   * A `transition` function is used to move from one state to another.
   *
   * @param event - This will give the name of the event that triggers this transition.
   * @param state - The name of the destination state.
   * @param args - Any extra argument will be evaluated to check if they are one of Reducer, Guard or Action.
   */
  export function transition<F extends string, C, E>(
    event: F,
    state: string,
    ...args: (Reducer<C, E> | Guard<C, E> | Action<C, E>)[]
  ): Transition<F>;

  /**
   * An `immediate` function is a type of transition that occurs immediately; it doesn't wait for an event to proceed.
   * This is a state that immediately proceeds to the next.
   *
   * @param state - The name of the destination state.
   * @param args - Any extra argument will be evaluated to check if they are a Reducer or a Guard.
   */
  export function immediate<F extends string, C, E>(
    state: string,
    ...args: (Reducer<C, E> | Guard<C, E> | Action<C, E>)[]
  ): Transition<F>

  /**
   * A `guard` is a method that determines if a transition can proceed.
   * Returning true allows the transition to occur, returning false prevents it from doing so and leaves the state in its current place.
   *
   * @param guardFunction A Function that can receive *context* and *event* and will return true or false.
   */
  export function guard<C, E>(guardFunction?: GuardFunction<C, E>): Guard<C, E>

  /**
   * A `reduce` takes a reducer function for changing the context of the machine. A common use case is to set values coming from form fields.
   *
   * @param reduceFunction A Function that can receive *context* and *event* and will return the context.
   */
  export function reduce<C, E>(reduceFunction?: ReduceFunction<C, E>): Reducer<C, E>

  /**
   * An `action` function takes a function that will be run during a transition. The primary purpose of using action is to perform side-effects.
   *
   * @param actionFunction A Function that can receive *context* and *event*. Returned values are discarded.
   */
  export function action<C, E>(actionFunction?: ActionFunction<C, E>): Action<C, E>

  /**
   * The `interpret` function takes a machine and creates a service that can send events into the machine, changing its states.
   * A service does not mutate a machine, but rather creates derived machines with the current state set.
   *
   * @param machine The state `machine`, created with *createMachine* to create a new service for.
   * @param onChange A callback that is called when the machine completes a transition. Even if the transition results in returning to the same state, the `onChange` callback is still called.
   * @param event The `event` can be any object. It is passed to the context function
   */
  export function interpret<M extends Machine, E>(
    machine: M,
    onChange?: InterpretOnChangeFunction<typeof machine>,
    initialContext?: M['context'],
    event?: { [K in keyof E]: any }
  ): Service<typeof machine>

  /**
   * The `invoke` is a special type of state that immediately invokes a Promise-returning or Machine-returning function, or another machine.
   *
   * @param fn - Promise-returning function
   * @param args - Any argument needs to be of type Transition or Immediate.
   */
  export function invoke<C, T, E extends {} = any>(fn: (ctx: C, e?: E) => Promise<T>, ...args: (Transition<any> | Immediate<any>)[]): MachineState<any>
  
  /**
   * The `invoke` is a special type of state that immediately invokes a Promise-returning or Machine-returning function, or another machine.
   *
   * @param fn - Machine-returning function
   * @param args - Any argument needs to be of type Transition or Immediate.
   */
  export function invoke<C, E extends {} = any, M extends Machine = any>(fn: (ctx: C, e?: E) => M, ...args: (Transition<any> | Immediate<any>)[]): MachineState<any>

  /**
   * The `invoke` is a special type of state that immediately invokes a Promise-returning or Machine-returning function, or another machine.
   *
   * @param machine - Machine
   * @param args - Any argument needs to be of type Transition or Immediate.
   */
  export function invoke<M extends Machine>(machine: M, ...args: (Transition<any> | Immediate<any>)[]): MachineState<any>

  /* General Types */

  export type ContextFunction<T> = (initialContext: T) => T

  export type GuardFunction<C, E> = (context: C, event: E) => boolean

  export type ActionFunction<C, E> = (context: C, event: E) => unknown

  export type ReduceFunction<C, E> = (context: C, event: E) => C

  export type InterpretOnChangeFunction<T extends Machine> = (
    service: Service<T>
  ) => void

  export type SendEvent<T extends string = string> = T | { type: T; [key: string]: any }
  export type SendFunction<T extends string> = (event: SendEvent<T> & {}) => void

  /**
   * This function is invoked before entering a new state and is bound to the debug
   * object. It is usable to inspect or log changes.
   *
   * @param machine - Machine
   * @param to - name of the target state
   * @param state - current state
   * @param prevState - previous state
   * @param event - event provoking the state change
   */
  export type OnEnterFunction<M extends Machine<any>> =
    <C = M['state']>(machine: M, to: string, state: C, prevState: C, event?: SendEvent) => void

  export type Machine<S extends MachineStates<S, F> = {}, C = {}, K = string, F extends string = string> = {
    context: C
    current: K
    states: S
    state: {
      name: K
      value: MachineState<F>
    }
  }

  export type Action<C, E> = {
    fn: ActionFunction<C, E>
  }

  export type Reducer<C, E> = {
    fn: ReduceFunction<C, E>
  }

  export type Guard<C, E> = {
    fn: GuardFunction<C, E>
  }

  export interface MachineState<F extends string> {
    final: boolean
    transitions: Map<F, Transition<F>[]>
    immediates?: Map<F, Immediate<F>[]>
    enter?: any
  }

  export interface Transition<F extends string> {
    from: F | null
    to: string
    guards: any[]
    reducers: any[]
  }

  export interface Service<M extends Machine> {
    child?: Service<M>
    machine: M
    context: M['context']
    onChange: InterpretOnChangeFunction<M>
    send: SendFunction<GetMachineTransitions<M>>
  }

  export type Immediate<F extends string> = Transition<F>;

  // Utilities
  type IsAny<T> = 0 extends (1 & T) ? true : false;

  // Get state objects from a Machine
  type GetMachineStateObject<M extends Machine> = M['states'];

  // Create mapped type without the final indexing
  type GetTransitionsFromStates<S> = {
  [K in keyof S]: S[K] extends { transitions: Map<string, Array<Transition<infer F>>> }
    ? IsAny<F> extends true 
      ? never 
      : F
    : never
  }

  type ExtractNonAnyValues<T> = {
    [K in keyof T]: IsAny<T[K]> extends true ? never : T[K]
  }[keyof T] & {};

  export type GetMachineTransitions<M extends Machine> = 
    ExtractNonAnyValues<GetTransitionsFromStates<GetMachineStateObject<M>>>;
}
