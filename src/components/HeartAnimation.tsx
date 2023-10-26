import React, { useEffect, useState, useRef } from "react";

/**
 * Class randomizing icons displaying based on the heartbeat received from the connection with the smartwatch
 */
export function HeartAnimation({ id, onAnimationEnd }: any) {
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