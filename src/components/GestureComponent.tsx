import React, { useState, useEffect } from "react";
import RegionsPlugin from 'wavesurfer.js/src/plugin/regions';
import 'bootstrap/dist/css/bootstrap.css';
import { FaRegWindowMinimize, FaRegWindowMaximize } from 'react-icons/fa';

import { GestureRecognizer, FilesetResolver, DrawingUtils } from '../../node_modules/@mediapipe/tasks-vision';
import { AudioManager } from "../AudioManager";
import VolumeProgressBar from "./VolumeProgressBar";
import WaveSurfer from "wavesurfer.js";
import { GestureModel } from "../models/GestureModel";

export interface Coordinates {
    x: number;
    y: number;
}

interface GestureComponentProps {
    video: HTMLVideoElement | null,
    waveform: WaveSurfer | null
}

const GestureComponent = (props: GestureComponentProps) => {
    // Define a sensitivity value to control effect change speed
    var video = props.video;
    var waveform = props.waveform;
    var gestureRecognizer: GestureRecognizer | null = null;

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
    // var lastVideoTime: any = -1;

    const [isCollapsed, setCollapsed] = useState(false);

    const toggleCollapse = () => {
        setCollapsed(!isCollapsed);
    };

    // Excecuted every time the video or the waveForm change
    useEffect(() => {
        if (video && waveform && gestureRecognizer == null) {
            console.log("Loading the gesture recognizer...");
            createGestureRecognizer().then(() => {
                video?.addEventListener("loadeddata", predictWebcam);
                requestAnimationFrame(() => {
                    predictWebcam();
                });
                console.log("Gesture recognizer loaded!");
            });
            setAudioObjects();
        }
    }, [video, waveform]);

    /**
     * Function to create the gestureRecognizer and initialization of the regions (used to create loops in the music flow)
     */
    const createGestureRecognizer = async () => {
        let recognizer = await loadModelWithRetry();
        if (recognizer) {
            gestureRecognizer = recognizer;
        }

        if (gestureRecognizer) {
            console.log("Model loaded successfully.");
            // Use gestureRecognizer for further processing
        } else {
            console.error("Model loading failed after all retry attempts.");
            // Handle the failure case here
        }

        if (!model.haveRegions()) {
            const regions = waveform?.addPlugin(RegionsPlugin.create({}));
            regions?.on('region-created', (region: any) => {
                if (region.loop) {
                    region.playLoop();
                }
            });
            regions?.on('region-out', (region: any) => {
                if (region.loop) {
                    region.play();
                }
            });
            regions?.on('region-removed', (_: any) => {
                waveform?.play();
            });
            model.setRegions(regions);
        }
    }

    async function loadModelWithRetry() {
        let maxRetries = 3; // Maximum number of retry attempts
        let currentRetry = 0;
        let recognizer;

        while (currentRetry < maxRetries) {
            try {
                const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm");
                recognizer = await GestureRecognizer.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task"
                    },
                    numHands: 2,
                    runningMode: "VIDEO"
                });
                break; // If loading is successful, exit the loop
            } catch (error) {
                console.error("An error occurred on attempt #" + (currentRetry + 1) + ":", error);

                // Calculate and log the percentage of completion
                const percentage = ((currentRetry + 1) / maxRetries) * 100;
                console.log("Loading progress: " + percentage.toFixed(2) + "%");

                currentRetry++;

                if (currentRetry < maxRetries) {
                    // You can add a delay before the next retry if needed
                    // await new Promise(resolve => setTimeout(resolve, retryDelayMilliseconds));
                } else {
                    console.error("Maximum retry attempts reached. Model loading failed.");
                    break; // Exit the loop if max retries are reached
                }
            }
        }

        return recognizer; // Return the loaded recognizer or null if all retries failed
    }


    /**
     * Function to predict gestures from the webcam feed
     */
    const predictWebcam = () => {
        // Start detecting the stream
        if (gestureRecognizer) {
            setupCanvas();
            let nowInMs = Date.now();
            if (video && video.videoHeight > 0 && video.videoWidth > 0) {
                console.log("Predicting... " + video.videoHeight + " " + video.videoWidth);
                try {
                    results = gestureRecognizer.recognizeForVideo(video, nowInMs);
                    console.log(results);
                } catch (error) {
                    console.error(error);
                }
            }
            drawHands();
            performAction();
            requestAnimationFrame(() => {
                predictWebcam();
            });
            // window.requestAnimationFrame(predictWebcam.bind(this));
        }
    };

    /**
     * Function to load in advance all the sounds used in the application in the AudioManager
     */
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

    /**
     * Function to render the user's hands skeleton
     */
    const drawHands = () => {
        const drawingUtils = new DrawingUtils(canvasCtx);
        if (results && results.landmarks) {
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

    /**
     * Function from which all the handles are called
     */
    const performAction = () => {
        if (results && results.gestures.length == 0) {
            let current_gesture = document.getElementById('current_gesture') as HTMLOutputElement;
            current_gesture.innerText = "🙌";
        }

        if (results && results.gestures.length > 0) {
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
    }

    /**
     * Function to detect the specific action returned by the model
     */
    const detectAction = (categoryName: string, handedness: string, landmarks: any) => {
        let current_gesture = document.getElementById('current_gesture') as HTMLOutputElement;
        model.updateFSMStates(categoryName, handedness, landmarks, current_gesture, model.wsRegions);
        setGestureMesssage();
    }

    /**
     * Function setting the "guide" messages shown to the users
     */
    const setGestureMesssage = () => {
        let current_gesture = document.getElementById('current_gesture') as HTMLOutputElement;
        let cutText = model.getCutText();
        if (cutText) {
            current_gesture.innerText = cutText;
        }
    }

    /**
     * Function to handle "drums" effects. Mapped to each finger (through the relative landmark)
     */
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

    /**
     * Function to handle play/pause based on detected gestures (Closed_Fist)
     */
    const handlePlayPause = () => {
        if (waveform && model.runPlayPause()) {
            waveform.playPause();
        }
    }

    /**
     * Function to handle audio effects based on detected gestures (Thumb_Up)
     */
    const handleEffects = (handedness: string, landmarks: any) => {
        let speedText = model.getSpeedText(landmarks, handedness);
        if (speedText) {
            let current_gesture = document.getElementById('current_gesture') as HTMLOutputElement;
            current_gesture.innerText = speedText;
            waveform?.setPlaybackRate(model.getSpeedValue());
        }
    }

    /**
     * Function to handle waveform regions based on detected gestures (creation and deletion)
     */
    const handleRegions = () => {
        if (waveform) {
            model.handleLoopRegions(waveform.getCurrentTime());
        }
    }

    /**
     * Function to handle volume control based on the gesture detected
     */
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
            <p id='current_gesture' className="currGesture">🙌</p>
            <p className="tooltipGesture">Current gesture</p>
            <div className="volumeProgressBar" style={{ display: isVolumeVisible ? "block" : "none" }}>
                <VolumeProgressBar volume={volume}></VolumeProgressBar>
            </div>
            <div className="listOfGestures">
                <button className="btn btn-link close-button-list" onClick={toggleCollapse}>
                    {isCollapsed ? <FaRegWindowMaximize /> : <FaRegWindowMinimize />}
                </button>
                <strong>Gestures list</strong>
                <p>Use only 1 hand at the time</p>
                {!isCollapsed && (
                    <ul>
                        <li>Right Hand 🖐️ + ✊: Play/Pause</li>
                        <li>Right Hand 👍 + Rotate: control speed</li>
                        <li>Right Hand 👆 + ↔️: Volume control</li>
                        <li>Left Hand 🖐️ + 👌 with every finger: play the drum</li>
                        <li>Left Hand ✌️ + 🤞: Start a loop</li>
                        <li>Right Hand ✌️ + 🤞: Close a loop</li>
                        <li>Left Hand ✌️: To remove a loop</li>
                    </ul>
                )}
            </div>
        </>
    );
};

export default GestureComponent;