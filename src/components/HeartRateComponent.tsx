import React from "react";
import { socket } from "../utils/SocketClient";
import { HeartAnimation } from "./HeartAnimation";

export class HeartRateComponent extends React.Component<any, any> {

    private interval: any;

    constructor(props: any) {
        super(props);
        // Initialize component state with an empty array for likes
        this.state = {
            likes: [], // Initialize likes as an empty array in the component's state
        };
        // Set up socket event listeners
        socket.on('connect', this.onConnect);
        socket.on('disconnect', this.onDisconnect);
        socket.on('heart_beat_event', (data) => {
            this.updateHeartRateUI(data);
            if(this.interval) {
                clearInterval(this.interval);
            }
            this.addHeart(data);
        });
        socket.connect();

        // Bind functions to the component context
        this.cleanLike = this.cleanLike.bind(this);
        this.addHeart = this.addHeart.bind(this);
    }

    // Function to handle the 'connect' event
    onConnect() {
        socket.emit("connect_web_client");
        console.log("Connected: " + socket.id);
        document.getElementById('hearthRate')!.innerHTML = "Connected to webserver ✅. Waiting for heart rate... ⌚️";
    }

    // Function to handle the 'disconnect' event
    onDisconnect() {
        console.log("Disconnected: " + socket.id);
    }

    // Function to update the heart rate UI
    updateHeartRateUI(heartRate: any) {
        console.log("Response: " + heartRate);
        document.getElementById('hearthRate')!.innerHTML = heartRate + " ❤️";
    }

    // Function to add a heart depending on the heartRate coming from the smartwatch connection
    addHeart(heartRate: any) {
        this.interval = setInterval(() => {
            this.setState((prevState: any) => ({
                likes: [...prevState.likes, Math.random()]
            }));
        }, 1000 / ((heartRate + 100) / 60));
    }

    // Function to remove a like with a given id
    cleanLike(id: any) {
        this.setState((prevState: any) => ({
            likes: prevState.likes.filter((like: any) => like !== id),
        }));
    }

    render(): React.ReactNode {
        return (
            <div>
                <p className="hb-text" id='hearthRate'>Connecting...</p>
                {this.state.likes.map((id: any) => (
                    <HeartAnimation onAnimationEnd={this.cleanLike} key={id} id={id} />
                ))}
            </div>
        );
    }
}