import React, { useState, useEffect } from "react";
import RegionsPlugin from 'wavesurfer.js/src/plugin/regions';
import './GestureController.css';
import 'bootstrap/dist/css/bootstrap.css';
import { GestureRecognizer, FilesetResolver, DrawingUtils } from '../../node_modules/@mediapipe/tasks-vision';
import { AudioManager } from "../AudioManager";
import IconsUI from "../IconsUI";
//import VolumeProgressBar from "../components/volumeProgressBar";
import WaveSurfer from "wavesurfer.js";

export interface Coordinates {
    x: number;
    y: number;
}

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
    Started = "startedManagingVolume",
    Increasing = "increasing",
    Decreasing = "decreasing"
}

interface GestureControllerProps {
    video: HTMLVideoElement | null,
    waveform : WaveSurfer | null
}

const GestureController = (props: GestureControllerProps) => {
    const video = props.video;
    const waveform = props.waveform;
    var gestureRecognizer : GestureRecognizer | null = null;
    var gestureOutput : any | null = null;
    var canvasElement : any | null = null;
    var canvasCtx : any | null = null;
    //var [gestureRecognizer, setGestureRecognizer] = useState<GestureRecognizer | null>(null);
    //var [gestureOutput, setGestureOutput] = useState<any>(null);
    //var [canvasElement, canvasElement] = useState<any>(null);
    //var [canvasCtx, setCanvasCtx] = useState<any>(null);

    /*
    const [currSPlayPause, setCurrSPlayPause] = useState<PlayPauseState>(PlayPauseState.Empty);
    const [currSCut, setCurrSCut] = useState<CutState>(CutState.Empty);
    const [currSIndex, setCurrSIndex] = useState<IndexState>(IndexState.Listening);
    const [currSMiddle, setCurrSMiddle] = useState<MiddleState>(MiddleState.Listening);
    const [currSRing, setCurrSRing] = useState<RingState>(RingState.Listening);
    const [currSPincky, setCurrSPincky] = useState<PickyState>(PickyState.Listening);
    const [currSVolume, setCurrSVolume] = useState<VolumeState>(VolumeState.Empty);
    */

    var currSPlayPause: PlayPauseState = PlayPauseState.Empty;
    var currSCut: CutState = CutState.Empty;
    var currSIndex: IndexState = IndexState.Listening;
    var currSMiddle: MiddleState = MiddleState.Listening;
    var currSRing: RingState = RingState.Listening;
    var currSPincky: PickyState = PickyState.Listening;
    var currSVolume: VolumeState = VolumeState.Empty;

    var results: any = undefined;
    var loopRegion: any = undefined;
    var canvasCtx: any = undefined;
    var wsRegions: any = undefined;

    //var [results, setResults] = useState<any>(undefined);
    var results : any | null = null;
    //const [loopRegion, setLoopRegion] = useState<any>(undefined);
    //const [wsRegions, setWsRegions] = useState<any>(undefined);

    const videoHeight = "100vh";
    const videoWidth = "auto";
    //const waveform = useRef<any>(null);
    const audioManager = new AudioManager();
    const [volume, setVolume] = useState<number>(50);

    var lastVideoTime : any = -1;

    var thumbCoordinates: Coordinates = {
        x: 100,
        y: 100
    };
    var indexCoordinates: Coordinates = {
        x: 200,
        y: 200
    };
    var middleCoordinates: Coordinates = {
        x: 300,
        y: 300
    };
    var ringCoordinates: Coordinates = {
        x: 400,
        y: 400
    };
    var pinkyCoordinates: Coordinates = {
        x: 500,
        y: 500
    };

    useEffect(() => {
        if (video && waveform) {
            if(video) {
                createGestureRecognizer().then(() => {
                    video?.addEventListener("loadeddata", predictWebcam);
                    window.requestAnimationFrame(predictWebcam.bind(this));
                  });
            }
        }
        
    }, [video, waveform]);

    useEffect(() => {
        if (waveform) {
            console.warn(waveform);
            // Handle Effects
        }
        setAudioObjects();
    }, [waveform]);

    // Add other useEffect hooks as needed

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
            wsRegions = regions;
        }
    };

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
        audioManager.loadSound('bassdrum', 'assets/bassdrum.mp3');
        audioManager.loadSound('snare', 'assets/dubstep-snare-drum.mp3');
        audioManager.loadSound('electribe', 'assets/electribe-hats.mp3');
        audioManager.loadSound('clap', 'assets/mega-clap.mp3');
        
    }

    const setupCanvas = () => {
        if (gestureOutput == undefined || canvasElement == undefined || canvasCtx == undefined) {
            gestureOutput = document.getElementById("gesture_output") as HTMLOutputElement;
            canvasElement = document.getElementById("output_canvas") as HTMLCanvasElement;
            canvasCtx = canvasElement.getContext("2d");
            canvasElement.style.height = videoHeight;
            canvasElement.style.width = videoWidth;
            gestureOutput.style.width = videoWidth;
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
            const categoryScore = parseFloat(
                (results.gestures[i][0].score * 100).toString()
            ).toFixed(2);
            const handedness = results.handednesses[i][0].displayName;

            gestureOutput.innerText = "Cut State " + currSCut;

            detectAction(categoryName, categoryScore, handedness, results.landmarks[i]);
            handleDrums(handedness, results.landmarks[i]);
            handlePlayPause();
            handleRegions();
            handleVolume(results.landmarks[i]);
        }
    }

    const detectAction = (categoryName: string, categoryScore: any, handedness: string, landmarks: any) => {
        console.warn(categoryName);
        console.warn(categoryScore);
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

                //handleDrums(handedness, landmarks);

                break;
            case "Pointing_Up":
                currSPlayPause = PlayPauseState.Empty;
                currSCut = CutState.Empty;
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
                break;
            case "Closed_Fist":
                if (handedness == "Right") {

                    if(currSPlayPause == PlayPauseState.Started) {
                        currSPlayPause = PlayPauseState.Completed;
                    }
                    
                }
                currSCut = CutState.Empty;
                currSVolume = VolumeState.Empty;
                break;
            case "Victory":
                currSPlayPause = PlayPauseState.Empty;
                currSVolume = VolumeState.Empty;
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
            case "Thumbs_Up":
                currSPlayPause = PlayPauseState.Empty;
                currSCut = CutState.Empty;
                currSVolume = VolumeState.Empty;
                break;
            case "Thumbs_Down":
                currSPlayPause = PlayPauseState.Empty;
                currSCut = CutState.Empty;
                currSVolume = VolumeState.Empty;
                break;
            case "ILoveYou":
                currSPlayPause = PlayPauseState.Empty;
                currSCut = CutState.Empty;
                currSVolume = VolumeState.Empty;
                break;
        }
    }

    const closedPoints = (point1: any, point2: any) => {
        var a = point1.x - point2.x;
        var b = point1.y - point2.y;
        var c = Math.sqrt(a * a + b * b);
        if (c < 0.1) {
            return true;
        }
        return false;
    }

    const handleDrums = (handedness : string, landmarks: any) => {
        
        //DRUMS detect and managing
        if(handedness == "Left") {

            //Audio to put in async to play them without overriding everything (?)

            //Index finger action
            if(closedPoints(landmarks[8], landmarks[4])) {

                if(currSIndex == IndexState.Listening) {
                    // Play the audio in the background
                    audioManager.playSound('bassdrum');

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
                    audioManager.playSound('snare');

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
                    audioManager.playSound('electribe');

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
                    audioManager.playSound('clap');

                    currSPincky = PickyState.Stopping;
                }
                
            }
            else {
                currSPincky = PickyState.Listening;
            }

        }
    }

    const handlePlayPause = () => {
        if (currSPlayPause == PlayPauseState.Completed && waveform) {
            waveform.playPause();
            currSPlayPause = PlayPauseState.Empty;
        }
    }

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

    const handleVolume = (landmarks : any) => {

        if(currSVolume == VolumeState.Started) {
            //volume = landmarks[8].y;

            setVolume(landmarks[8].y);

            console.warn(volume*100);
        }
    }

    // Add other functions and hooks as needed

    return (
        <>
            <div>
                <p id='gesture_output'></p>
                <IconsUI x={thumbCoordinates.x} y={thumbCoordinates.y}></IconsUI>
                <IconsUI x={indexCoordinates.x} y={indexCoordinates.y}></IconsUI>
                <IconsUI x={middleCoordinates.x} y={middleCoordinates.y}></IconsUI>
                <IconsUI x={ringCoordinates.x} y={ringCoordinates.y}></IconsUI>
                <IconsUI x={pinkyCoordinates.x} y={pinkyCoordinates.y}></IconsUI>
                <canvas className="output_canvas" id="output_canvas" width="1280" height="720" style={{ margin: "0 auto", border: "1px solid #000000", width: "auto", height: "100%" }}>  
                </canvas>
            </div>
            <p style={{fontSize: "50px"}}>{volume}</p>
            
        </>
    );
};

export default GestureController;
