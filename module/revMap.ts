export class RevMap<Key, Val> {
  private readonly forwards = new Map<Key, Val>();
  private readonly backwards = new Map<Val, Key>();

  get(key: Key, fallback: Val = null) { return this.forwards.get(key) ?? fallback; }
  revGet(key: Val, fallback: Key = null) { return this.backwards.get(key) ?? fallback; }

  has(key: Key) { return this.forwards.has(key); }
  revHas(key: Val) { return this.backwards.has(key); }

  delete(key: Key) {
    if (!this.forwards.has(key)) return false;
    this.backwards.delete(this.forwards.get(key));
    this.forwards.delete(key);
  }
  revDelete(key: Val) {
    if (!this.backwards.has(key)) return false;
    this.forwards.delete(this.backwards.get(key));
    this.backwards.delete(key);
  }

  set(key: Key, val: Val) {
    if (this.forwards.has(key)) this.backwards.delete(this.forwards.get(key));
    if (this.backwards.has(val)) this.forwards.delete(this.backwards.get(val));

    this.forwards.set(key, val);
    this.backwards.set(val, key);
  }

  keys() { return this.forwards.keys(); }
  values() { return this.forwards.values(); }

  forEach(callback: (value: Val, key: Key, map: Map<Key,Val>) => void) {
    this.forwards.forEach(callback);
  }
}