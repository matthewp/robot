declare module 'lit-robot' {
    import type { LitElement } from 'lit'
    import type { Machine, Service } from 'robot3'

    type Constructor<T = {}> = new (...args: any[]) => T;

    export declare class RobotLitElementInterface<M extends Machine>{
        public service: Service<M>;
        public machine: M;
    }

    export function Robot<T extends Constructor<LitElement>, M extends Machine>(Base: T): Constructor<RobotLitElementInterface<M>> & T
}
