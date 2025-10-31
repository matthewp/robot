declare module 'react-robot' {
  import type {Machine, SendFunction, Service, GetMachineTransitions} from 'robot3';
  export function useMachine<M extends Machine>(
    machine: M,
    initialContext?: M['context']
  ): [
    M['state'] & {context: M['context']},
    SendFunction<GetMachineTransitions<M>>,
    Service<typeof machine>
  ];
}
