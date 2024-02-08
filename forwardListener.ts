import { Ids } from "./module/ids.js";
import { Listener } from "./module/listener.js";

export class ForwardListener<Types, Data> extends Listener<Types, Data> {
  private readonly listenerObjects = new Map<number, { obj: Listener<Partial<Types>, Data>, id: number }>();
  private listenerObjectIds = new Ids();

  constructor() {
    super();
  }

  forwardListenerEvent(listener: Listener<Partial<Types>, Data>, type: Types) {
    const listenerId = listener.on(type, this.trigger.bind(this, type));
    
    const id = this.listenerObjectIds.generateId();
    this.listenerObjects.set(id, { obj: listener, id: listenerId });
  }

  unforwardListenerEvent(id: number) {
    if (!this.listenerObjects.has(id)) return; 

    const data = this.listenerObjects.get(id);
    data.obj.off(data.id);
    
    this.listenerObjectIds.releaseId(id);
    this.listenerObjects.delete(id);
  }
}