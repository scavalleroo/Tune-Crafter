import React from "react";
import { socket } from "../utils/SocketClient";

export class HartRateComponent extends React.Component {

    constructor(props: any) {
        super(props);
        socket.on('connect', this.onConnect);
        socket.on('disconnect', this.onDisconnect);
        socket.on('hart_beat_event', this.updateHartRateUI);
        socket.connect();
    }

    onConnect() {
        socket.emit("connect_web_client");
        document.getElementById('harthRate')!.innerHTML = "Connected to webserver. Waiting for hart rate...";
    }

    onDisconnect() {
        console.log("Disconnected: " + socket.id);
    }

    updateHartRateUI(hartRate: any) {
        document.getElementById('harthRate')!.innerHTML = "Hart rate: " + hartRate;
    }

    render(): React.ReactNode {
        return (
            <div>
                <p id='harthRate'></p>
            </div>
        );
    }
}