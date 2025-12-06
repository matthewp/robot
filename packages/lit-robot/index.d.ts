declare module 'lit-robot' {
    import type { LitElement } from 'lit'
    import type { Machine, Service, InterpretOnChangeFunction } from 'robot3';

    type Constructor<T = {}> = new (...args: any[]) => T;

    export class RobotLitElementInterface<M extends Machine> {
        public service: Service<M>;
    }

    export function Robot<T extends Constructor<LitElement>, M extends Machine>(Base: T, machine: M, onChange?: InterpretOnChangeFunction<M>): Constructor<RobotLitElementInterface<M>> & T
}
