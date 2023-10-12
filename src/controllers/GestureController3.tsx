






import React from "react";
import RegionsPlugin from 'wavesurfer.js/src/plugin/regions';
import './GestureController.css';
import 'bootstrap/dist/css/bootstrap.css'

import {
    GestureRecognizer,
    FilesetResolver,
    DrawingUtils
} from '../../node_modules/@mediapipe/tasks-vision';
import { AudioManager } from "../AudioManager";
import IconsUI from "../IconsUI";
import VolumeProgressBar from "../components/volumeProgressBar";

//Icons coordinates
interface Coordinates {
    x : number; // X-coordinate in pixels
    y : number; // Y-coordinate in pixels
}
export default Coordinates; 

//Finite State Machine states
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

export class GestureController extends React.Component {
    private video: HTMLVideoElement;
    private lastVideoTime: number = -1;
    private gestureRecognizer: GestureRecognizer | undefined = undefined;

    private gestureOutput: any = undefined;
    private canvasElement: any = undefined;

    private currSPlayPause: PlayPauseState = PlayPauseState.Empty;
    private currSCut: CutState = CutState.Empty;
    private currSIndex: IndexState = IndexState.Listening;
    private currSMiddle: MiddleState = MiddleState.Listening;
    private currSRing: RingState = RingState.Listening;
    private currSPincky: PickyState = PickyState.Listening;
    private currSVolume: VolumeState = VolumeState.Empty;

    private results: any = undefined;
    private loopRegion: any = undefined;
    private canvasCtx: any = undefined;
    private wsRegions: any = undefined;

    private videoHeight: string = "100vh";
    private videoWidth: string = "auto";

    private waveformRef: any = undefined;

    private audioManager = new AudioManager();

    //AudioContext for the main music
    //private mainAudioContext : AudioContext | null= null;

    //private volume : number = 50;

    private thumbCoordinates : Coordinates = {
        x: 100,
        y: 100
    }
    private indexCoordinates : Coordinates = {
        x: 200,
        y: 200
    }
    private middleCoordinates : Coordinates = {
        x: 300,
        y: 300
    }
    private ringCoordinates : Coordinates = {
        x: 400,
        y: 400
    }
    private pinkyCoordinates : Coordinates = {
        x: 500,
        y: 500
    }

    state = {
        myVolume: 50 
    }

    constructor(props: any) {
        super(props);

        /*
        this.state = {
            myVolume: 50 
        }
        */

        //this.setState({myVolume : 100})

        this.video = props.video;
        this.waveformRef = props.waveformRef;

        if(this.waveformRef) {
            console.warn(this.waveformRef.current.backend.ac);
            console.warn(this.waveformRef);

            //Gestione Effetti

        }

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

        if (this.wsRegions == null) {
            this.wsRegions = this.waveformRef.current?.addPlugin(RegionsPlugin.create({}));
            this.wsRegions.on('region-created', (region: any) => {
                if(region.loop) {
                    region.playLoop();
                    console.log(region);
                }
            });
            this.wsRegions.on('region-out', (region: any) => {
                if(region.loop) {
                    region.play();
                }
            });
            this.wsRegions.on('region-removed', (_: any) => {
                console.log("Region removed");
                this.waveformRef.current?.play();
            });
        }
    }

    predictWebcam(): void {
        // Now let's start detecting the stream.
        if (this.gestureRecognizer) {
            this.setupCanvas();
            let nowInMs = Date.now();
            if (this.video.currentTime !== this.lastVideoTime) {
                this.lastVideoTime = this.video.currentTime;
                this.results = this.gestureRecognizer?.recognizeForVideo(this.video, nowInMs);
                console.log(this.results);
            }
            this.drawHands();
            this.performAction();
            window.requestAnimationFrame(this.predictWebcam.bind(this));
        }
    }

    private performAction() {

        //In modalità doppia mano non ferma la musica

        for (let i = 0; i < this.results.gestures.length; i++) {
            const categoryName = this.results.gestures[i][0].categoryName;
            const categoryScore = parseFloat(
                (this.results.gestures[i][0].score * 100).toString()
            ).toFixed(2);
            const handedness = this.results.handednesses[i][0].displayName;

            this.gestureOutput.innerText = "Cut State " + this.currSCut;

            this.detectAction(categoryName, categoryScore, handedness, this.results.landmarks[i]);
            this.handleDrums(handedness, this.results.landmarks[i]);
            this.handlePlayPause();
            this.handleRegions();
            this.handleVolume(this.results.landmarks[i]);
        }
    }

    getVolume = () => {
        return this.state.myVolume;
    }


    private handleVolume(landmarks : any) {

        if(this.currSVolume == VolumeState.Started) {
            //this.volume = landmarks[8].y;

            this.setState({myVolume: 100});

            console.warn(this.state.myVolume*100);
            
            //this.waveformRef.current.setVolume(this.volume);

        }
    }

    private handlePlayPause() {
        if (this.currSPlayPause == PlayPauseState.Completed && this.waveformRef.current) {
            this.waveformRef.current.playPause();
            this.currSPlayPause = PlayPauseState.Empty;
        }
    }

    private handleRegions() {

        if (this.currSCut == CutState.ClosedCutLeft && this.loopRegion == undefined && this.waveformRef.current) {
            this.loopRegion = {
                start: this.waveformRef.current.getCurrentTime(),
                color: "#00bcd447",
                content: 'Start Loop',
                loop: false,
                drag: false,
                resize: false,
            };
            this.wsRegions.addRegion(this.loopRegion);
        }

        if (this.currSCut == CutState.ClosedCutRight && this.waveformRef.current) {
            this.loopRegion.end = this.waveformRef.current.getCurrentTime();
            this.loopRegion.loop = true;
        }

        if (this.currSCut == CutState.CuttedCompleted && this.waveformRef.current) {
            this.wsRegions.clearRegions();
            this.wsRegions.addRegion(this.loopRegion);
            this.currSCut = CutState.Empty;
        }
    }

    private handleDrums(handedness : string, landmarks: any) {
        
        //DRUMS detect and managing
        if(handedness == "Left") {

            //Audio to put in async to play them without overriding everything (?)

            //Index finger action
            if(this.closedPoints(landmarks[8], landmarks[4])) {

                if(this.currSIndex == IndexState.Listening) {
                    // Play the audio in the background
                    this.audioManager.playSound('bassdrum');

                    this.currSIndex = IndexState.Stopping;
                }
                
            }
            else {
                this.currSIndex = IndexState.Listening;
            }

            //Middle finger action
            if(this.closedPoints(landmarks[12], landmarks[4])) {
                
                if(this.currSMiddle == MiddleState.Listening) {
                    // Play the audio in the background
                    this.audioManager.playSound('snare');

                    this.currSMiddle = MiddleState.Stopping;
                }
            }
            else {
                this.currSMiddle = MiddleState.Listening;
            }

            //Ring finger action
            if (this.closedPoints(landmarks[16], landmarks[4])) {

                if(this.currSRing == RingState.Listening) {
                    // Play the audio in the background
                    this.audioManager.playSound('electribe');

                    this.currSRing = RingState.Stopping;
                }
                
            }
            else {
                this.currSRing = RingState.Listening;
            }

            //Pinky Finger action
            if (this.closedPoints(landmarks[20], landmarks[4])) {

                if(this.currSPincky == PickyState.Listening) {
                    // Play sounds
                    this.audioManager.playSound('clap');

                    this.currSPincky = PickyState.Stopping;
                }
                
            }
            else {
                this.currSPincky = PickyState.Listening;
            }

        }
    }


    private setupCanvas() {
        if (this.gestureOutput == undefined || this.canvasElement == undefined || this.canvasCtx == undefined) {
            this.gestureOutput = document.getElementById("gesture_output") as HTMLOutputElement;
            this.canvasElement = document.getElementById("output_canvas") as HTMLCanvasElement;
            this.canvasCtx = this.canvasElement.getContext("2d");
            this.canvasElement.style.height = this.videoHeight;
            this.canvasElement.style.width = this.videoWidth;
            this.gestureOutput.style.width = this.videoWidth;
        }

        this.canvasCtx.save();
        this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    }

    private drawHands() {
        const drawingUtils = new DrawingUtils(this.canvasCtx);
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
    }

    detectAction(categoryName: string, categoryScore: any, handedness: string, landmarks: any) {
        console.warn(categoryName);
        console.warn(categoryScore);
        switch (categoryName) {
            case "None":
                if (this.currSCut == CutState.StartCuttingLeft && handedness == "Left" && this.closedPoints(landmarks[6], landmarks[10]) && this.closedPoints(landmarks[7], landmarks[11]) && this.closedPoints(landmarks[8], landmarks[12])) {
                    this.currSCut = CutState.ClosedCutLeft;
                } else {
                    if (this.currSCut == CutState.StartCuttingRight && handedness == "Right" && this.closedPoints(landmarks[6], landmarks[10]) && this.closedPoints(landmarks[7], landmarks[11]) && this.closedPoints(landmarks[8], landmarks[12])) {
                        this.currSCut = CutState.ClosedCutRight;
                    }
                }

                this.currSVolume = VolumeState.Empty;

                //this.handleDrums(handedness, landmarks);

                break;
            case "Pointing_Up":
                this.currSPlayPause = PlayPauseState.Empty;
                this.currSCut = CutState.Empty;
                if(handedness == "Right") {
                    this.currSVolume = VolumeState.Started;
                }
                break;
            case "Open_Palm":
                if (handedness == "Right") {
                    this.currSPlayPause = PlayPauseState.Started;
                }
                this.currSCut = CutState.Empty;
                this.currSVolume = VolumeState.Empty;
                break;
            case "Closed_Fist":
                if (handedness == "Right") {

                    if(this.currSPlayPause == PlayPauseState.Started) {
                        this.currSPlayPause = PlayPauseState.Completed;
                    }
                    
                }
                this.currSCut = CutState.Empty;
                this.currSVolume = VolumeState.Empty;
                break;
            case "Victory":
                this.currSPlayPause = PlayPauseState.Empty;
                this.currSVolume = VolumeState.Empty;
                switch (this.currSCut) {
                    case CutState.Empty:
                        if (handedness == "Left") {
                            this.currSCut = CutState.StartCuttingLeft;
                            if(this.wsRegions != undefined) {
                                this.wsRegions.clearRegions();
                            }
                            this.loopRegion = undefined;
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
                this.currSVolume = VolumeState.Empty;
                break;
            case "Thumbs_Down":
                this.currSPlayPause = PlayPauseState.Empty;
                this.currSCut = CutState.Empty;
                this.currSVolume = VolumeState.Empty;
                break;
            case "ILoveYou":
                this.currSPlayPause = PlayPauseState.Empty;
                this.currSCut = CutState.Empty;
                this.currSVolume = VolumeState.Empty;
                break;
        }
    }

    setAudioObjects() {
        /*
        this.audioBassdrum.preload = 'auto';
        this.audioSnare.preload = 'auto';
        this.audioElecribe.preload = 'auto';
        this.audioClap.preload = 'auto'

        this.audioBassdrum.volume = 1.0;
        this.audioSnare.volume = 1.0;
        this.audioElecribe.volume = 1.0;
        this.audioClap.volume = 1.0;
        */

        // Load audio files
        //this.audioManager.loadSound('mainMusic', 'assets/audio.mp3')
        this.audioManager.loadSound('bassdrum', 'assets/bassdrum.mp3');
        this.audioManager.loadSound('snare', 'assets/dubstep-snare-drum.mp3');
        this.audioManager.loadSound('electribe', 'assets/electribe-hats.mp3');
        this.audioManager.loadSound('clap', 'assets/mega-clap.mp3');
        
    }

    renderLandmarkIcons(results : any) {

        for (let index = 0; index < results.handedness.length; index++) {

            let arrayHand : any = results.handedness[index];
            let arrayLandmarks : any = results.landmarks[index];

            console.warn(arrayHand);
            console.warn(arrayLandmarks);
            console.warn(results);  

            //If the hand detected is the left one, take its relative landmarks to modify the icons coordinates 
            if(arrayHand[0].categoryName == "Left") {

                console.warn("Entrato in coordinates");

                //TODO 

                this.thumbCoordinates.x = this.thumbCoordinates.x + arrayLandmarks[0].x;
                this.thumbCoordinates.y = this.thumbCoordinates.y + arrayLandmarks[0].y;

                console.warn(this.thumbCoordinates.x);

                this.waveformRef

            }

            //Make it a Hook to change it dinamically?
            
        }

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

    render(): React.ReactNode {

        return (
            <>
                <div>
                    <p id='gesture_output'></p>
                    <IconsUI x={this.thumbCoordinates.x} y={this.thumbCoordinates.y}></IconsUI>
                    <IconsUI x={this.indexCoordinates.x} y={this.indexCoordinates.y}></IconsUI>
                    <IconsUI x={this.middleCoordinates.x} y={this.middleCoordinates.y}></IconsUI>
                    <IconsUI x={this.ringCoordinates.x} y={this.ringCoordinates.y}></IconsUI>
                    <IconsUI x={this.pinkyCoordinates.x} y={this.pinkyCoordinates.y}></IconsUI>
                    <canvas className="output_canvas" id="output_canvas" width="1280" height="720" style={{ margin: "0 auto", border: "1px solid #000000", width: "auto", height: "100%" }}>  
                    </canvas>
                    
                </div>
                <p style={{fontSize: "50px"}}>{this.getVolume()}</p>
                
            </>
        );
    }
}

/**
 * <div className="custom-progress">
                    <VolumeProgressBar volume={this.volume}></VolumeProgressBar>
                </div>
 */