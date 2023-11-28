import { SmartInterval } from "./smartInterval.js";
export class Listener {
    listenerIds = 0;
    listeners = new Map();
    reserved = new Set;
    pollingCallbacks = new Map();
    pollingIntervals = new Map(); // maps an event type to a polling interval
    autoResponses = new Map;
    on(type, listener) {
        const newId = this.listenerIds++;
        if (!this.listeners.has(type))
            this.listeners.set(type, new Map());
        this.listeners.get(type).set(newId, listener);
        this.reserved.add(newId);
        if (this.autoResponses.has(type)) {
            listener(this.autoResponses.get(type));
        }
        // start polling interval if needed and not already
        if (this.pollingCallbacks.has(type) && !this.pollingIntervals.has(type)) {
            const data = this.pollingCallbacks.get(type);
            this.pollingIntervals.set(type, new SmartInterval(() => {
                const output = data[0]();
                if (output !== null)
                    this.trigger(type, output);
            }, data[1]));
        }
        return newId;
    }
    /**
     * Sets a polling function to be used to periodically check if an event should be triggered
     * @param period the amount of time between polling requests
     */
    setPollingOptions(type, callback, period = null // ms
    ) {
        if (this.pollingIntervals.has(type)) { // modify existing SmartInterval
            if (period != null)
                this.pollingIntervals.get(type).setInterval(period);
            this.pollingIntervals.get(type).setCallback(callback);
        }
        this.pollingCallbacks.set(type, [callback, period ?? 400]); // create new entry
    }
    setPollingInterval(type, period) {
        if (this.pollingIntervals.has(type)) { // modify existing SmartInterval
            this.pollingIntervals.get(type).setInterval(period);
        }
        this.pollingCallbacks.set(type, [() => { return null; }, period ?? 400]); // create new entry
    }
    /**
     * An event that triggers once, after which, sends an immediate event to any listeners that connects
     */
    setAutoResponse(type, data) {
        this.trigger(type, data); // send initial event
        this.autoResponses.set(type, data); // update any who connect afterwards
    }
    off(listenerId) {
        if (!this.hasListenerId(listenerId))
            return false;
        for (const type of this.listeners.keys()) {
            if (this.listeners.get(type).has(listenerId)) {
                this.listeners.get(type).delete(listenerId);
                this.reserved.delete(listenerId); // remove tracking for listener id
                if (this.listeners.get(type).size == 0) {
                    this.listeners.delete(type); // remove listener callback
                    if (this.pollingIntervals.has(type)) {
                        this.pollingIntervals.get(type).pause();
                        // clearInterval(this.pollingIntervals.get(type)); // clear polling function
                        this.pollingIntervals.delete(type);
                    }
                }
                return true;
            }
        }
        return false;
    }
    trigger(type, data) {
        if (!this.listeners.has(type))
            return;
        for (const listeners of this.listeners.get(type).values()) {
            listeners(data);
        }
    }
    reserve(listenerId) {
        this.listenerIds = Math.max(listenerId + 1, this.listenerIds); // ensure there is never a collision
    }
    /**
     * Used to prevent two listeners from using the same id
     */
    doSync(other) {
        this.reserve(other.listenerIds);
        other.listenerIds = this.listenerIds;
    }
    isListeningTo(type) { return this.listeners.has(type); }
    hasListenerId(id) { return this.reserved.has(id); }
}
//# sourceMappingURL=listener.js.map