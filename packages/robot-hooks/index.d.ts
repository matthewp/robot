declare module 'robot-hooks' {
  import type {Machine, SendFunction, Service, GetMachineTransitions} from 'robot3';
  function useMachine<M extends Machine>(
    machine: M,
    initialContext?: M['context']
  ): [
    M['state'] & {context: M['context']},
    SendFunction<GetMachineTransitions<M>>,
    Service<typeof machine>
  ];

  export function createUseMachine(
    useEffect: any,
    useState: any
  ): typeof useMachine;
}
