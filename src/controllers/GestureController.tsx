import React, { useState, useEffect } from "react";
import RegionsPlugin from 'wavesurfer.js/src/plugin/regions';
import './GestureController.css';
import 'bootstrap/dist/css/bootstrap.css';
import { GestureRecognizer, FilesetResolver, DrawingUtils } from '../../node_modules/@mediapipe/tasks-vision';
import { AudioManager } from "../AudioManager";
import WaveSurfer from "wavesurfer.js";
import VolumeProgressBar from "../components/VolumeProgressBar";

export interface Coordinates {
    x: number;
    y: number;
}

//Finite States Machines
enum CutState {
    Empty = "empty",
    StartCuttingLeft = "startCuttingLeft",
    ClosedCutLeft = "closedCutLeft",
    CuttedLeft = "cuttedLeft",
    StartCuttingRight = "startCuttingRight",
    ClosedCutRight = "closedCutRight",
    CuttedCompleted = "cuttedCompleted"
}

enum PlayPauseState {
    Empty = "empty",
    Started = "started",
    Completed = "completed"
}

enum IndexState {
    Listening = "listen",
    Stopping = "stop"
}

enum MiddleState {
    Listening = "listen",
    Stopping = "stop"
}

enum RingState {
    Listening = "listen",
    Stopping = "stop"
}

enum PickyState {
    Listening = "listen",
    Stopping = "stop"
}

enum VolumeState {
    Empty = "empty",
    Started = "startedManagingVolume"
}

enum EffectsState {
    Empty = "empty",
    StartPuttingEffects = "startPuttingEffects",
}

//Interface on props passed by App.tsx
interface GestureControllerProps {
    video: HTMLVideoElement | null,
    waveform : WaveSurfer | null
}

const GestureController = (props: GestureControllerProps) => {

    // Define a sensitivity value to control effect change speed
    var video = props.video;
    var waveform = props.waveform;
    var gestureRecognizer : GestureRecognizer | null = null;
    var canvasElement : any | null = null;
    var canvasCtx : any | null = null;
    
    //Current states in the implemented Finite State Machine
    var currSPlayPause: PlayPauseState = PlayPauseState.Empty;
    var currSCut: CutState = CutState.Empty;
    var currSIndex: IndexState = IndexState.Listening;
    var currSMiddle: MiddleState = MiddleState.Listening;
    var currSRing: RingState = RingState.Listening;
    var currSPincky: PickyState = PickyState.Listening;
    var currSVolume: VolumeState = VolumeState.Empty;
    var currSEffects: EffectsState = EffectsState.Empty;

    var results: any = undefined;
    var loopRegion: any = undefined;
    var canvasCtx: any = undefined;
    var wsRegions: any = undefined;

    var results : any | null = null;

    const videoHeight = "100vh";
    const videoWidth = "auto";

    var volumeTimer : any = null;

    const soundManager: AudioManager = new AudioManager();
    
    const [volume, setVolume] = useState<number>(50);
    const [isVolumeVisible, setIsVolumeVisible] = useState<boolean>(false);
    var speedValue : number = 1;

    var lastVideoTime : any = -1;

    //First functions that has to be excecuted just at the first render
    useEffect(() => {
        setAudioObjects();
    }, [])

    //Excecuted every time the video or the waveForm change
    useEffect(() => {
        if (video && waveform) {    
            createGestureRecognizer().then(() => {
                video?.addEventListener("loadeddata", predictWebcam);
                window.requestAnimationFrame(predictWebcam.bind(this));
            });
        }
        
    }, [video, waveform]);

    /**
     * Function to create a gesture recognizer
     */
    const createGestureRecognizer = async () => {

        const vision = await FilesetResolver.forVisionTasks("../../node_modules/@mediapipe/tasks-vision/wasm");
        const recognizer = await GestureRecognizer.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: "../../public/models/gesture_recognizer.task"
            },
            numHands: 2,
            runningMode: "VIDEO"
        });
        gestureRecognizer = recognizer;
        //setGestureRecognizer(recognizer);

        if (wsRegions == null) {
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
            wsRegions = regions;
        }
    };

    /**
     * Function to predict webcam gestures
     */
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

    /**
     * Function to set up audio objects
     */
    const setAudioObjects = () => {

        // Load audio files
        soundManager.loadSound('mainMusic', 'assets/sounds/audio.mp3')
        soundManager.loadSound('bassdrum', 'assets/sounds/bassdrum.mp3');
        soundManager.loadSound('snare', 'assets/sounds/dubstep-snare-drum.mp3');
        soundManager.loadSound('electribe', 'assets/sounds/electribe-hats.mp3');
        soundManager.loadSound('clap', 'assets/sounds/mega-clap.mp3');
        
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
     * Function that draw the users hands detected by the program. It restore the CanvasContext
     */
    const drawHands = () => {
        const drawingUtils = new DrawingUtils(canvasCtx);
        if (results.landmarks) {
            for (const landmarks of results.landmarks) {
                drawingUtils.drawConnectors(
                    landmarks,
                    GestureRecognizer.HAND_CONNECTIONS,
                    {
                        color: "#00FF00",
                        lineWidth: 5
                    }
                );
                drawingUtils.drawLandmarks(landmarks, {
                    color: "#FF0000",
                    lineWidth: 2
                });
            }
        }
        canvasCtx.restore();
    }

    const performAction = () => {

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
        switch (categoryName) {
            case "None":
                if (currSCut == CutState.StartCuttingLeft && handedness == "Left" && closedPoints(landmarks[6], landmarks[10]) && closedPoints(landmarks[7], landmarks[11]) && closedPoints(landmarks[8], landmarks[12])) {
                    currSCut = CutState.ClosedCutLeft;
                } else {
                    if (currSCut == CutState.StartCuttingRight && handedness == "Right" && closedPoints(landmarks[6], landmarks[10]) && closedPoints(landmarks[7], landmarks[11]) && closedPoints(landmarks[8], landmarks[12])) {
                        currSCut = CutState.ClosedCutRight;
                    }
                }

                currSVolume = VolumeState.Empty;
                currSEffects = EffectsState.Empty;

                break;
            case "Pointing_Up":
                currSPlayPause = PlayPauseState.Empty;
                currSCut = CutState.Empty;
                currSIndex = IndexState.Stopping;
                currSMiddle = MiddleState.Stopping;
                currSRing = RingState.Stopping;
                currSPincky = PickyState.Stopping;
                currSEffects = EffectsState.Empty;
                if(handedness == "Right") {
                    currSVolume = VolumeState.Started;
                }
                break;
            case "Open_Palm":
                if (handedness == "Right") {
                    currSPlayPause = PlayPauseState.Started;
                }
                currSCut = CutState.Empty;
                currSVolume = VolumeState.Empty;
                currSIndex = IndexState.Stopping;
                currSMiddle = MiddleState.Stopping;
                currSRing = RingState.Stopping;
                currSPincky = PickyState.Stopping;
                currSEffects = EffectsState.Empty;
                break;
            case "Closed_Fist":
                if (handedness == "Right") {

                    if(currSPlayPause == PlayPauseState.Started) {
                        currSPlayPause = PlayPauseState.Completed;
                    }
                    
                }
                currSCut = CutState.Empty;
                currSVolume = VolumeState.Empty;
                currSIndex = IndexState.Stopping;
                currSMiddle = MiddleState.Stopping;
                currSRing = RingState.Stopping;
                currSPincky = PickyState.Stopping;
                currSEffects = EffectsState.Empty;
                break;
            case "Victory":
                currSPlayPause = PlayPauseState.Empty;
                currSVolume = VolumeState.Empty;
                currSIndex = IndexState.Stopping;
                currSMiddle = MiddleState.Stopping;
                currSRing = RingState.Stopping;
                currSPincky = PickyState.Stopping;
                currSEffects = EffectsState.Empty;
                switch (currSCut) {
                    case CutState.Empty:
                        if (handedness == "Left") {
                            currSCut = CutState.StartCuttingLeft;
                            if(wsRegions != undefined) {
                                wsRegions.clearRegions();
                            }
                            loopRegion = undefined;
                        }
                        break;
                    case CutState.ClosedCutLeft:
                        if (handedness == "Left") {
                            currSCut = CutState.CuttedLeft;
                        }
                        break;
                    case CutState.CuttedLeft:
                        if (handedness == "Right") {
                            currSCut = CutState.StartCuttingRight;
                        }
                        break;
                    case CutState.ClosedCutRight:
                        if (handedness == "Right") {
                            currSCut = CutState.CuttedCompleted;
                        }
                        break;
                }
                break;
            case "Thumb_Up":
                currSPlayPause = PlayPauseState.Empty;
                currSCut = CutState.Empty;
                currSVolume = VolumeState.Empty;
                currSIndex = IndexState.Stopping;
                currSMiddle = MiddleState.Stopping;
                currSRing = RingState.Stopping;
                currSPincky = PickyState.Stopping;
                if (handedness == "Right") {
                    currSEffects = EffectsState.StartPuttingEffects;
                }
                break;
            case "Thumb_Down":
                currSPlayPause = PlayPauseState.Empty;
                currSCut = CutState.Empty;
                currSVolume = VolumeState.Empty;
                currSIndex = IndexState.Stopping;
                currSMiddle = MiddleState.Stopping;
                currSRing = RingState.Stopping;
                currSPincky = PickyState.Stopping;
                currSEffects = EffectsState.Empty;
                break;
            case "ILoveYou":
                currSPlayPause = PlayPauseState.Empty;
                currSCut = CutState.Empty;
                currSVolume = VolumeState.Empty;
                currSIndex = IndexState.Stopping;
                currSMiddle = MiddleState.Stopping;
                currSRing = RingState.Stopping;
                currSPincky = PickyState.Stopping;
                currSEffects = EffectsState.Empty;
                break;
        }
    }

    const handleDrums = (handedness : string, landmarks: any) => {
        
        //DRUMS detect and managing
        if(handedness == "Left") {

            //Audio to put in async to play them without overriding everything (?)

            //Index finger action
            if(closedPoints(landmarks[8], landmarks[4])) {

                if(currSIndex == IndexState.Listening) {
                    // Play the audio in the background
                    soundManager.playSound('bassdrum');

                    currSIndex = IndexState.Stopping;
                }
                
            }
            else {
                currSIndex = IndexState.Listening;
            }

            //Middle finger action
            if(closedPoints(landmarks[12], landmarks[4])) {
                
                if(currSMiddle == MiddleState.Listening) {
                    // Play the audio in the background
                    soundManager.playSound('snare');

                    currSMiddle = MiddleState.Stopping;
                }
            }
            else {
                currSMiddle = MiddleState.Listening;
            }

            //Ring finger action
            if (closedPoints(landmarks[16], landmarks[4])) {

                if(currSRing == RingState.Listening) {
                    // Play the audio in the background
                    soundManager.playSound('electribe');

                    currSRing = RingState.Stopping;
                }
                
            }
            else {
                currSRing = RingState.Listening;
            }

            //Pinky Finger action
            if (closedPoints(landmarks[20], landmarks[4])) {

                if(currSPincky == PickyState.Listening) {
                    // Play sounds
                    soundManager.playSound('clap');

                    currSPincky = PickyState.Stopping;
                }
                
            }
            else {
                currSPincky = PickyState.Listening;
            }

        }
    }

    /**
     * Function to handle play/pause based on detected gestures (Closed_Fist)
     */
    const handlePlayPause = () => {
        if (currSPlayPause == PlayPauseState.Completed && waveform) {

            waveform.playPause();
            currSPlayPause = PlayPauseState.Empty;
        }
    }

    /**
     * Function to handle audio effects based on detected gestures (Thumb_Up)
     */
    const handleEffects = (handedness : string, landmarks: any) => {

        if(currSEffects == EffectsState.StartPuttingEffects && handedness == "Right") {

            //Managing the effect
            var currentThumbUpCoordinates = {x:landmarks[4].x, y: landmarks[4].y};
            var referencePoint = {x:landmarks[0].x, y: landmarks[0].y} //Thumb tip and wrist landmarks of the model hand scheleton
          
            updateEffectsValue(currentThumbUpCoordinates!, referencePoint!);

            waveform?.setPlaybackRate(speedValue);
            
        }
        else if(handedness == "Right") {
            speedValue = 1;
        }

    }

    /**
     * Function to handle waveform regions based on detected gestures (creation and deletion)
     */
    const handleRegions = () => {

        if (currSCut == CutState.ClosedCutLeft && loopRegion == undefined && waveform) {
            loopRegion = {
                start: waveform.getCurrentTime(),
                color: "#00bcd447",
                content: 'Start Loop',
                loop: false,
                drag: false,
                resize: false,
            };
            wsRegions.addRegion(loopRegion);
        }

        if (currSCut == CutState.ClosedCutRight && waveform) {
            loopRegion.end = waveform.getCurrentTime();
            loopRegion.loop = true;
        }

        if (currSCut == CutState.CuttedCompleted && waveform) {
            wsRegions.clearRegions();
            wsRegions.addRegion(loopRegion);
            currSCut = CutState.Empty;
        }
    }

    /**
     * Function to handle volume control based on the gesture detected
     */
    const handleVolume = (landmarks : any) => {

        if(currSVolume == VolumeState.Started) {
            
            let currentVolume : number = 1-landmarks[8].x;

            setVolume(Math.min(100, parseFloat((currentVolume*100).toFixed(0))));
            setIsVolumeVisible(true);

            waveform?.setVolume(currentVolume);

            //To let finish the Timeout only when the the user changes gesture
            if(volumeTimer != null) {
                clearTimeout(volumeTimer);
            }
            volumeTimer = setTimeout(() => {
                setIsVolumeVisible(false);
                volumeTimer = null;

            }, 3000);

        }
    }

    /**
     * Function to update the effect factor based on the angle taken by the Thumb_Up gesture, specifically the angle from the 
     * segment between the thumb tip and the wrist (landmarks 4 and 0 of the model scheleton)
     */
    const updateEffectsValue = (point1: Coordinates, point2: Coordinates) => {
        var angle : number = 0;

        angle = calculateAngle(point1, point2);

        speedValue = angle/100;
        
    };

    /**
     * Function to calculate the angle between two coordinates and the x axis starting from (0,0)
     * Online help: "How to calculate the angle between two points and the X axis?"
     */
    const calculateAngle = (coord1: Coordinates, coord2: Coordinates) => {
        const dx = coord2.x - coord1.x;
        const dy = coord2.y - coord1.y;

        const angle = Math.atan2(dy, dx);

        const angleDegree = (angle * 180) / Math.PI

        return angleDegree;
    };

    /**
     * Function to check if two points are close enough in order to detect the finger tips touch
     */
    const closedPoints = (point1: any, point2: any) => {
        var a = point1.x - point2.x;
        var b = point1.y - point2.y;
        var c = Math.sqrt(a * a + b * b);
        if (c < 0.05) {
            return true;
        }
        return false;
    }

    return (
        <>
            <div>
                <canvas className="output_canvas" id="output_canvas" width="1280" height="720">  
                </canvas>
            </div>
            <div className="volumeProgressBar" style={{ display: isVolumeVisible ? "block" : "none"}}>
                <VolumeProgressBar volume={volume}></VolumeProgressBar>
            </div>
        </>
    );
};

export default GestureController;