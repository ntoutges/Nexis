import { Ids } from "./ids.js";
import { Listener } from "./listener.js";

export class AttachableListener<Types, Data> {
  protected listener = null;
  readonly validator: () => (Listener<Types, Data> | AttachableListener<Types, Data>);

  private readonly ids = new Ids();
  private readonly attachmentConstructors = new Map<number, { type: Types, callback: (data: Data) => void }>();
  private readonly attachments = new Map<number, number>(); // convert from local id to listener id

  constructor(
    validator: () => (Listener<Types, Data> | AttachableListener<Types, Data>)
  ) {
    this.validator = validator;
  }

  updateValidity() {
    const listener = this.validator();
    if (listener == this.listener) return;

    this.detachAllFromListener(); // remove from old listener
    this.listener = listener;
    this.attachAllToListener(); // attach to new listener
  }

  on(
    type: Types,
    callback: (data: Data) => void
  ): number {
    const id = this.ids.generateId();
    
    this.attachmentConstructors.set(id, { type, callback });
    this.attachToListener(id);
    return id;
  }

  off (id: number) {
    if (this.attachmentConstructors.has(id)) {
      
      this.detachFromListener(id);
      this.attachmentConstructors.delete(id);
      
      this.ids.releaseId(id);
      return true;
    }
    return false;
  }

  trigger(type: Types, data: Data) {
    if (this.listener) this.listener.trigger(type, data);
  }

  private detachAllFromListener() {
    if (!this.listener) return;
    for (const localId of this.attachments.keys()) {
      this.detachFromListener(localId);
    }
  }

  private detachFromListener(localId: number) {
    if (!this.listener || !this.attachments.has(localId)) return;
    this.listener.off(this.attachments.get(localId));
    this.attachments.delete(localId);
  }

  private attachAllToListener() {
    if (!this.listener) return;
    for (const localId of this.attachmentConstructors.keys()) {
      this.attachToListener(localId);
    }
  }

  private attachToListener(localId: number) {
    if (!this.listener || !this.attachmentConstructors.has(localId) || this.attachments.has(localId)) return;
    const { type, callback } = this.attachmentConstructors.get(localId);

    this.attachments.set(localId, this.listener.on(type, callback));
  }
}