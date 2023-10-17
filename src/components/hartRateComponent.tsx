import React, { useEffect, useState, useRef } from "react";
import { socket } from "../utils/SocketClient";

export class HartRateComponent extends React.Component<any, any> {

    private interval: any;

    constructor(props: any) {
        super(props);
        this.state = {
            likes: [], // Initialize likes as an empty array in the component's state
        };
        socket.on('connect', this.onConnect);
        socket.on('disconnect', this.onDisconnect);
        socket.on('hart_beat_event', (data) => {
            this.updateHartRateUI(data);
            if(this.interval) {
                clearInterval(this.interval);
            }
            this.addHart(data);
        });
        socket.connect();

        this.cleanLike = this.cleanLike.bind(this);
        this.addHart = this.addHart.bind(this);
    }

    onConnect() {
        socket.emit("connect_web_client");
        console.log("Connected: " + socket.id);
        document.getElementById('harthRate')!.innerHTML = "Connected to webserver ✅. Waiting for hart rate... ⌚️";
    }

    onDisconnect() {
        console.log("Disconnected: " + socket.id);
    }

    updateHartRateUI(heartRate: any) {
        console.log("Response: " + heartRate);
        document.getElementById('harthRate')!.innerHTML = heartRate + " ❤️";
    }

    addHart(heartRate: any) {
        this.interval = setInterval(() => {
            this.setState((prevState: any) => ({
                likes: [...prevState.likes, Math.random()]
            }));
        }, 1000 / ((heartRate + 100) / 60));
    }

    cleanLike(id: any) {
        this.setState((prevState: any) => ({
            likes: prevState.likes.filter((like: any) => like !== id),
        }));
    }

    Bubble({ id, onAnimationEnd }: any) {
        const opacityDuration: number = 1;
        const [position, setPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight - 140 });
        const [opacity, setOpacity] = useState(0.5);
        const size = useRef(random(0.2, 0.9));
        const emojis = ["❤️", "😍", "👏", "🔥"];
        const emoji = useRef(Math.floor(random(0, emojis.length - 1)));

        const element = useRef();

        const initialOptions = useRef({
            animationDuration: 8,
            element,
            onAnimationEnd,
            id
        });

        useEffect(() => {
            const {
                animationDuration,
                element,
                onAnimationEnd,
                id
            } = initialOptions.current;

            if (element && element.current) {
                var current = element.current as any;
                current.addEventListener("transitionend", (event: any) => {
                    if (event.propertyName === "opacity") {
                        onAnimationEnd(id);
                    }
                });
            }

            setTimeout(() => {
                setPosition((prevState) => ({
                    ...prevState,
                    y: random(-250, -450)
                }));
            }, 5);

            setTimeout(() => {
                setOpacity(0);
            }, (animationDuration - opacityDuration) * 500);
        }, []);

        function random(min: number, max: number) {
            return Math.random() * (max - min) + min;
        }

        return (
            <div
                style={{
                    color: "red",
                    fontSize: "2em",
                    opacity,
                    pointerEvents: "none",
                    position: "absolute",
                    transform: `translate(calc(${position.x}px), calc(${position.y}px)) scale(${size.current})`,
                    textShadow: "0 0 5px rgba(0, 0, 0, .25)",
                    transition: `transform ${initialOptions.current.animationDuration}s linear, opacity ${opacityDuration}s ease-in-out`
                }}
                ref={element as any}
            >{emojis[emoji.current]}</div>
        );
    }

    render(): React.ReactNode {
        console.log("Render: " + this.state.likes.length);
        return (
            <div>
                <p className="hb-text" id='harthRate'>Connecting...</p>
                {this.state.likes.map((id: any) => (
                    <this.Bubble onAnimationEnd={this.cleanLike} key={id} id={id} />
                ))}
            </div>
        );
    }
}