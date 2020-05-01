import { interpret } from 'robot3';

function Robot(Base) {
  if(Base == null) {
    throw new Error('Robot(Base) expects a Base class');
  }

  return class RobotLitElement extends Base {
    constructor() {
      super();
      
      let machine = new.target.machine;
      this.service = interpret(machine, service => {
        this.machine = service.machine;
        this.requestUpdate();
      }, { element: this });
      this.machine = this.service.machine;
    }
  }
}

export {
  Robot,
  Robot as default
};