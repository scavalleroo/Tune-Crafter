import React, { useState, useEffect } from "react";
import RegionsPlugin from 'wavesurfer.js/src/plugin/regions';
import 'bootstrap/dist/css/bootstrap.css';

import { GestureRecognizer, FilesetResolver, DrawingUtils } from '../../node_modules/@mediapipe/tasks-vision';
import { AudioManager } from "../AudioManager";
import VolumeProgressBar from "../components/VolumeProgressBar";
import WaveSurfer from "wavesurfer.js";
import { GestureModel } from "./GestureModel";


export interface Coordinates {
    x: number;
    y: number;
}

interface GestureControllerProps {
    video: HTMLVideoElement | null,
    waveform: WaveSurfer | null
}

const GestureController = (props: GestureControllerProps) => {
    // Define a sensitivity value to control effect change speed
    var video = props.video;
    var waveform = props.waveform;
    var gestureRecognizer: GestureRecognizer | null = null;

    //var gestureOutput : any | null = null;
    var canvasElement: any | null = null;
    var canvasCtx: any | null = null;
    var results: any = undefined;
    const videoHeight = "100vh";
    const videoWidth = "auto";
    var volumeTimer: any = null;
    const soundManager: AudioManager = new AudioManager();
    const model: GestureModel = new GestureModel();

    const [volume, setVolume] = useState<number>(50);
    const [isVolumeVisible, setIsVolumeVisible] = useState<boolean>(false);
    var lastVideoTime: any = -1;

    // First functions that has to be excecuted just at the first render
    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new (window as any).webkitSpeechRecognition();

            recognition.continuous = true; // Continuously listen for commands
            recognition.interimResults = false;
            recognition.onresult = (event: any) => {
                const current = event.resultIndex;
                const transcript = event.results[current][0].transcript.trim();
                let current_voice = document.getElementById('current_voice') as HTMLOutputElement;
                current_voice.innerText = "🎙️ " + transcript;
                switch (transcript.toLowerCase().trim()) {
                    case 'start':
                    case 'play':
                        if (!waveform?.isPlaying()) {
                            waveform?.playPause();
                            current_voice.innerText = "🎙️ Play ▶️ ✅";
                        }
                        break;
                    case 'pause':
                    case 'stop':
                        if (waveform?.isPlaying()) {
                            waveform?.playPause();
                            current_voice.innerText = "🎙️ Pause ⏹️ ✅";
                        }
                        break;
                    case 'repeat':
                    case 'loop':
                        waveform?.setCurrentTime(0);
                        current_voice.innerText = "🎙️ Playback 🔁 ✅";
                        break;
                    case 'next':
                        model.nextSong();
                        waveform?.load("assets/sounds/" + model.getCurrentSong());
                        waveform?.on('ready', () => {
                            waveform?.play();
                        });
                        current_voice.innerText = "🎙️ New Track ✅";
                        break;
                }
            };
            recognition.start();
        }
    }, []);

    // Excecuted every time the video or the waveForm change
    useEffect(() => {
        if (video && waveform && gestureRecognizer == null) {
            createGestureRecognizer().then(() => {
                video?.addEventListener("loadeddata", predictWebcam);
                window.requestAnimationFrame(predictWebcam.bind(this));
            });
            setAudioObjects();
        }
    }, [video, waveform]);

    // Add other useEffect hooks as needed
    const createGestureRecognizer = async () => {
        try {
            const vision = await FilesetResolver.forVisionTasks("../../node_modules/@mediapipe/tasks-vision/wasm");
            const recognizer = await GestureRecognizer.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: "../../public/models/gesture_recognizer.task"
                },
                numHands: 2,
                runningMode: "VIDEO"
            });
            gestureRecognizer = recognizer;
        } catch (error) {
            console.error(error);
        }

        if (model.haveRegions()) {
            const regions = waveform?.addPlugin(RegionsPlugin.create({}));
            regions?.on('region-created', (region: any) => {
                if (region.loop) {
                    region.playLoop();
                    console.log(region);
                }
            });
            regions?.on('region-out', (region: any) => {
                if (region.loop) {
                    region.play();
                }
            });
            regions?.on('region-removed', (_: any) => {
                console.log("Region removed");
                waveform?.play();
            });
            model.setRegions(regions);
        }
    }

    const predictWebcam = () => {
        // Now let's start detecting the stream.
        if (gestureRecognizer) {
            setupCanvas();
            let nowInMs = Date.now();
            if (video?.currentTime !== lastVideoTime) {
                lastVideoTime = video!.currentTime;
                const newResults = gestureRecognizer?.recognizeForVideo(video!, nowInMs);
                results = newResults;
            }
            drawHands();
            performAction();
            window.requestAnimationFrame(predictWebcam.bind(this));
        }
    };

    const setAudioObjects = () => {
        // Load audio files
        soundManager.loadSound('mainMusic', 'assets/sounds/audio.mp3')
        soundManager.loadSound('bassdrum', 'assets/sounds/kick.wav');
        soundManager.loadSound('snare', 'assets/sounds/snare.wav');
        soundManager.loadSound('hat', 'assets/sounds/hat.wav');
        soundManager.loadSound('clap', 'assets/sounds/clap.wav');

    }

    const setupCanvas = () => {
        if (canvasCtx == undefined) {
            canvasElement = document.getElementById("output_canvas") as HTMLCanvasElement;
            canvasCtx = canvasElement.getContext("2d");
            canvasElement.style.height = videoHeight;
            canvasElement.style.width = videoWidth;
        }

        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    }

    const drawHands = () => {
        const drawingUtils = new DrawingUtils(canvasCtx);
        if (results.landmarks) {
            for (const landmarks of results.landmarks) {
                drawingUtils.drawConnectors(
                    landmarks,
                    GestureRecognizer.HAND_CONNECTIONS,
                    {
                        color: "#FFFFFF",
                        lineWidth: 5
                    }
                );
                drawingUtils.drawLandmarks(landmarks, {
                    color: "#B01EB0",
                    lineWidth: 2
                });
            }
        }
        canvasCtx.restore();
    }

    const performAction = () => {
        if (results.gestures.length == 0) {
            let current_gesture = document.getElementById('current_gesture') as HTMLOutputElement;
            current_gesture.innerText = "🙌";
        }

        for (let i = 0; i < results.gestures.length; i++) {
            const categoryName = results.gestures[i][0].categoryName;
            const handedness = results.handednesses[i][0].displayName;

            detectAction(categoryName, handedness, results.landmarks[i]);
            handleDrums(handedness, results.landmarks[i]);
            handlePlayPause();
            handleEffects(handedness, results.landmarks[i]);
            handleRegions();
            handleVolume(results.landmarks[i]);
        }
    }

    const detectAction = (categoryName: string, handedness: string, landmarks: any) => {
        let current_gesture = document.getElementById('current_gesture') as HTMLOutputElement;
        model.updateFSMStates(categoryName, handedness, landmarks, current_gesture, model.wsRegions);
        setGestureMesssage();
    }

    const setGestureMesssage = () => {
        let current_gesture = document.getElementById('current_gesture') as HTMLOutputElement;
        let cutText = model.getCutText();
        if (cutText) {
            current_gesture.innerText = cutText;
        }
    }


    const handleDrums = (handedness: string, landmarks: any) => {
        //DRUMS detect and managing
        if (handedness == "Left") {
            //Audio to put in async to play them without overriding everything (?)
            //Index finger action
            let sound = model.getDrumSound(landmarks);
            if (sound) {
                soundManager.playSound(sound);
                let current_gesture = document.getElementById('current_gesture') as HTMLOutputElement;
                current_gesture.innerText = "🥁 ✅";
            }
        }
    }

    const handlePlayPause = () => {
        if (waveform && model.runPlayPause()) {
            waveform.playPause();
        }
    }

    const handleEffects = (handedness: string, landmarks: any) => {
        let speedText = model.getSpeedText(landmarks, handedness);
        if(speedText) {
            let current_gesture = document.getElementById('current_gesture') as HTMLOutputElement;
            current_gesture.innerText = speedText;
            waveform?.setPlaybackRate(model.getSpeedValue());
        }
    }

    const handleRegions = () => {
        if(waveform) {
            model.handleLoopRegions(waveform.getCurrentTime());
        }
    }

    const handleVolume = (landmarks: any) => {
        if (model.isVolumeStarted()) {
            let currentVolume: number = 1 - landmarks[8].x;
            setVolume(Math.min(100, parseFloat((currentVolume * 100).toFixed(0))));
            setIsVolumeVisible(true);
            waveform?.setVolume(currentVolume);

            //To let finish the Timeout only when the the user changes gesture
            if (volumeTimer != null) {
                clearTimeout(volumeTimer);
            }
            volumeTimer = setTimeout(() => {
                setIsVolumeVisible(false);
                volumeTimer = null;
            }, 3000);
        }
    }

    return (
        <>
            <div>
                <canvas className="output_canvas" id="output_canvas" width="1280" height="720">  </canvas>
            </div>
            <p id='current_voice' className="currVoice">🎙️</p>
            <p className="tooltipVoice">Voice commands</p>
            <p id='current_gesture' className="currGesture">🙌</p>
            <p className="tooltipGesture">Current gesture</p>
            <div className="volumeProgressBar" style={{ display: isVolumeVisible ? "block" : "none" }}>
                <VolumeProgressBar volume={volume}></VolumeProgressBar>
            </div>
        </>
    );
};

export default GestureController;