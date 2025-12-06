import { interpret } from 'robot3';

function Robot(Base, machine, onChange) {
  if(Base == null) {
    throw new Error('Robot(Base, machine) expects a Base class');
  }

  if(machine == null) {
    throw new Error('Robot(Base, machine) expects a machine')
  }

  return class RobotLitElement extends Base {
    constructor() {
      super();
      
      this.service = interpret(machine, ...args => {
        onChange?.(...args);
        this.requestUpdate();
      }, { element: this });
    }
  }
}

export {
  Robot,
  Robot as default
};
