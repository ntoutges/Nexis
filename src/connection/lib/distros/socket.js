import { ChannelBase, ClientBase, ConnectionBase } from "../connBase.js";
export class SocketConnection extends ConnectionBase {
    socket;
    constructor({ socket }) {
        super();
        this.socket = socket;
    }
    createNewClient(id, heartbeatInterval) { return new SocketClient(id, this, heartbeatInterval); }
}
export class SocketClient extends ClientBase {
    socket;
    waitingForSocketOpen = null;
    constructor(id, connection, heartbeatInterval) {
        super(id, connection, heartbeatInterval);
        this.socket = connection.socket;
        if (this.socket.connected)
            setTimeout(() => { this.setReadyState(this.id, true); }, 0); // Allow for other events to happen before running this
        // Listen for new connections
        this.socket.on("connect", () => {
            this.setReadyState(this.id, true);
        });
        this.socket.on("disconnect", () => {
            this.setReadyState(this.id, false);
        });
    }
    connectTo(id, callback) {
        this.setReadyState(id, true);
        callback(true);
    }
    async disconnectFrom(id) {
        return true;
    }
    createNewChannel(id) { return new SocketChannel(id, this); }
    // No cleanup required
    async destroyClient() { }
}
export class SocketChannel extends ChannelBase {
    doSend(msg, recipientId) {
        console.log("sending", msg);
        this.client.socket.send(msg);
    }
}
//# sourceMappingURL=socket.js.map