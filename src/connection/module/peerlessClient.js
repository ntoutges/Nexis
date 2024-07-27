import { ClientBase } from "./connBase.js";
export class PeerlessClient extends ClientBase {
    _onLocalConnectionCallback = null;
    _onRemoteConnectionCallback = null;
    setConnectionStatus(working) {
        this.setReadyState(this.id, working);
        this.doFinalizeConnect(false, working);
    }
    connectTo(id, callback) {
        if (id == null) { // Not connecting to anyone
            if (this.getReadyState(this.id))
                callback(true); // Already connected
            else
                this._onLocalConnectionCallback = callback; // Still yet to connect
            return;
        }
        // Already connected to router
        if (this.getReadyState(this.id) && this.getReadyState(id))
            return callback(true);
        this._onRemoteConnectionCallback = callback;
        this.sendHandshake(id);
    }
    sendHandshake(id) {
        let oldRemoteReadyState = this.getReadyState(id);
        this.setReadyState(id, true, false); // Allow for message to be sent
        this.dmChannel.echo("", id, 1000, "init").then(response => {
            this.doFinalizeConnect(true, true); // Successfully connected
        }).catch(() => {
            this.doFinalizeConnect(true, false); // Failed to connect
        });
        // Reset ready states
        this.setReadyState(id, oldRemoteReadyState, false);
    }
    doFinalizeConnect(remote, success) {
        if (remote && this.routerId) {
            this.setReadyState(this.routerId, success);
        }
        let callback = remote ? this._onRemoteConnectionCallback : this._onLocalConnectionCallback;
        if (!callback)
            return; // No callback available
        callback(success); // Run callback
        // Reset callback for use later
        this._onRemoteConnectionCallback = null;
        this._onLocalConnectionCallback = null;
    }
}
//# sourceMappingURL=peerlessClient.js.map