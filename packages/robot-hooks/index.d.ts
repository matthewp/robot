declare module 'robot-hooks' {
  import type {Machine, SendFunction, Service} from 'robot3';
  function useMachine<M extends Machine>(
    machine: M,
    initialContext?: M['context']
  ): [
    M['state'] & {context: M['context']},
    SendFunction,
    Service<typeof machine>
  ];

  export function createUseMachine(
    useEffect: any,
    useState: any
  ): typeof useMachine;
}
