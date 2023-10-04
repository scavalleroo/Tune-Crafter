import React from "react";
import RegionsPlugin from 'wavesurfer.js/src/plugin/regions';

import {
    GestureRecognizer,
    FilesetResolver,
    DrawingUtils
} from '../../node_modules/@mediapipe/tasks-vision';

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

enum DrumState {
    Empty = "empty",
    StartDrumming = "startedLeft",
    Completed = "completed"
}

export class GestureController extends React.Component {
    private video: HTMLVideoElement;
    private lastVideoTime: number = -1;
    private gestureRecognizer: GestureRecognizer | undefined = undefined;

    private gestureOutput: any = undefined;
    private canvasElement: any = undefined;

    private currSPlayPause: PlayPauseState = PlayPauseState.Empty;
    private currSCut: CutState = CutState.Empty;
    private currSDrum: DrumState = DrumState.Empty;

    private results: any = undefined;
    private loopRegion: any = undefined;
    private canvasCtx: any = undefined;
    private wsRegions: any = undefined;

    private videoHeight: string = "100vh";
    private videoWidth: string = "auto";

    private waveformRef: any = undefined;

    private audioBassdrum : HTMLAudioElement = new Audio('assets/bassdrum.mp3');
    private audioSnare : HTMLAudioElement = new Audio('assets/dubstep-snare-drum.mp3');
    private audioElecribe : HTMLAudioElement = new Audio('assets/electribe-hats.mp3');    
    private audioClap : HTMLAudioElement = new Audio('assets/mega-clap.mp3');

    constructor(props: any) {
        super(props);
        this.video = props.video;
        this.waveformRef = props.waveformRef;

        this.setAudioObjects();

    }

    async createGestureRecognizer() {
        const vision = await FilesetResolver.forVisionTasks(
            "../../node_modules/@mediapipe/tasks-vision/wasm",
        );
        this.gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath:
                    "../../public/models/gesture_recognizer.task"
            },
            numHands: 2,
            runningMode: "VIDEO"
        });
    }

    predictWebcam() {
        // Now let's start detecting the stream.
        if (this.gestureRecognizer) {
            this.gestureRecognizer?.setOptions({
                runningMode: "VIDEO",
                numHands: 2
            });

            let nowInMs = Date.now();
            if (this.video.currentTime !== this.lastVideoTime) {
                this.lastVideoTime = this.video.currentTime;
                this.results = this.gestureRecognizer?.recognizeForVideo(this.video, nowInMs);
                console.log(this.results);
            }

            this.gestureOutput = document.getElementById("gesture_output") as HTMLOutputElement;
            this.canvasElement = document.getElementById("output_canvas") as HTMLCanvasElement;
            this.canvasCtx = this.canvasElement.getContext("2d");

            if (this.canvasCtx && this.gestureOutput) {
                this.canvasCtx.save();
                this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
                const drawingUtils = new DrawingUtils(this.canvasCtx);

                this.canvasElement.style.height = this.videoHeight;
                this.canvasElement.style.width = this.videoWidth;

                //Skeleton of hands detection
                if (this.results.landmarks) {
                    for (const landmarks of this.results.landmarks) {
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
                this.canvasCtx.restore();
                if (this.results.gestures.length > 0) {
                    this.gestureOutput.style.display = "block";
                    this.gestureOutput.style.width = this.videoWidth;

                    const categoryName = this.results.gestures[0][0].categoryName;
                    const categoryScore = parseFloat(
                        (this.results.gestures[0][0].score * 100).toString()
                    ).toFixed(2);

                    const handedness = this.results.handednesses[0][0].displayName;
                    this.gestureOutput.innerText = "Cut State " + this.currSCut;

                    this.detectAction(categoryName, categoryScore, handedness, this.results.landmarks[0]);

                    if (this.wsRegions == null) {
                        this.wsRegions = this.waveformRef.current?.addPlugin(RegionsPlugin.create({}));
                        this.wsRegions.on('region-created', (region: any) => {
                            region.playLoop();
                            console.log(region);
                            console.log("Play region");
                        });
                        this.wsRegions.on('region-out', (region: any) => {
                            region.play();
                        })
                    }

                    if (this.currSPlayPause == PlayPauseState.Completed && this.waveformRef.current) {
                        this.waveformRef.current.playPause();
                    }

                    if (this.currSCut == CutState.CuttedLeft && this.waveformRef.current) {
                        this.loopRegion = {
                            start: this.waveformRef.current.getCurrentTime(),
                            color: "red",
                            resize: false,
                            drag: false,
                            loop: true,
                        };
                    }

                    if (this.currSCut == CutState.CuttedCompleted && this.waveformRef.current) {
                        this.loopRegion.end = this.waveformRef.current.getCurrentTime();
                        this.wsRegions.addRegion(this.loopRegion);
                        this.currSCut = CutState.Empty;
                    }

                } else {
                    this.gestureOutput.style.display = "none";
                }
            }
            window.requestAnimationFrame(this.predictWebcam.bind(this));
        }
    }

    detectAction(categoryName: string, categoryScore: any, handedness: string, landmarks: any) {
        console.log(categoryScore);
        switch (categoryName) {
            case "None":
                if (this.currSCut == CutState.StartCuttingLeft && handedness == "Left" && this.closedPoints(landmarks[6], landmarks[10]) && this.closedPoints(landmarks[7], landmarks[11]) && this.closedPoints(landmarks[8], landmarks[12])) {
                    this.currSCut = CutState.ClosedCutLeft;
                } else {
                    if (this.currSCut == CutState.StartCuttingRight && handedness == "Right" && this.closedPoints(landmarks[6], landmarks[10]) && this.closedPoints(landmarks[7], landmarks[11]) && this.closedPoints(landmarks[8], landmarks[12])) {
                        this.currSCut = CutState.ClosedCutRight;
                    }
                }

                //DRUMS detect and managing
                if(this.currSDrum == DrumState.StartDrumming && handedness == "Left") {

                    //Audio to put in async to play them without overriding everything

                    //Index finger action
                    if(this.closedPoints(landmarks[8], landmarks[4])) {

                        console.warn("Index finger action");
                        this.currSDrum = DrumState.Completed;  
                        // Play the audio in the background
                        this.audioBassdrum.play();
                    }

                    //Middle finger action
                    if(this.closedPoints(landmarks[12], landmarks[4])) {
                        console.warn("Middle finger action");
            
                        // Play the audio in the background
                        this.audioSnare.play();
                    }

                    //Ring finger action
                    if(this.closedPoints(landmarks[16], landmarks[4])) {
                        console.warn("Ring Finger action ");
            
                        // Play the audio in the background
                        this.audioElecribe.play();
                    }

                    //Pinky Finger action
                    if(this.closedPoints(landmarks[20], landmarks[4])) {
                        console.warn("Pincky Finger action ");

                        // Play the audio in the background
                        this.audioClap.play();
                    }

                }

                break;
            case "Pointing_Up":
                this.currSPlayPause = PlayPauseState.Empty;
                this.currSCut = CutState.Empty;
                break;
            case "Open_Palm":
                if (handedness == "Right") {
                    this.currSPlayPause = PlayPauseState.Started;
                }
                this.currSDrum = DrumState.StartDrumming;
                this.currSCut = CutState.Empty;
                break;
            case "Closed_Fist":
                if (handedness == "Right" && this.currSPlayPause == PlayPauseState.Started) {
                    this.currSPlayPause = PlayPauseState.Completed;
                } else {
                    this.currSPlayPause = PlayPauseState.Empty;
                }
                this.currSCut = CutState.Empty;
                break;
            case "Victory":
                this.currSPlayPause = PlayPauseState.Empty;
                switch (this.currSCut) {
                    case CutState.Empty:
                        if (handedness == "Left") {
                            this.currSCut = CutState.StartCuttingLeft;
                        }
                        break;
                    case CutState.ClosedCutLeft:
                        if (handedness == "Left") {
                            this.currSCut = CutState.CuttedLeft;
                        }
                        break;
                    case CutState.CuttedLeft:
                        if (handedness == "Right") {
                            this.currSCut = CutState.StartCuttingRight;
                        }
                        break;
                    case CutState.ClosedCutRight:
                        if (handedness == "Right") {
                            this.currSCut = CutState.CuttedCompleted;
                        }
                        break;
                }
                break;
            case "Thumbs_Up":
                this.currSPlayPause = PlayPauseState.Empty;
                this.currSCut = CutState.Empty;
                break;
            case "Thumbs_Down":
                this.currSPlayPause = PlayPauseState.Empty;
                this.currSCut = CutState.Empty;
                break;
            case "ILoveYou":
                this.currSPlayPause = PlayPauseState.Empty;
                this.currSCut = CutState.Empty;
                break;
        }
    }

    setAudioObjects() {
        this.audioBassdrum.preload = 'auto';
        this.audioSnare.preload = 'auto';
        this.audioElecribe.preload = 'auto';
        this.audioClap.preload = 'auto'

        this.audioBassdrum.volume = 1.0;
        this.audioSnare.volume = 1.0;
        this.audioElecribe.volume = 1.0;
        this.audioClap.volume = 1.0;
    }

    closedPoints(point1: any, point2: any) {
        var a = point1.x - point2.x;
        var b = point1.y - point2.y;
        var c = Math.sqrt(a * a + b * b);
        if (c < 0.1) {
            return true;
        }
        return false;
    }

    isReady() {
        return this.gestureRecognizer != undefined;
    }

    render() {
        return (
            <div>
                <p id='gesture_output'></p>
                <canvas className="output_canvas" id="output_canvas" width="1280" height="720" style={{ margin: "0 auto", border: "1px solid #000000", width: "auto", height: "100%" }}></canvas>
            </div>
        );
    }
}