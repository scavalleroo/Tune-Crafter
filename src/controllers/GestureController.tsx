import React, { useState, useEffect } from "react";
import RegionsPlugin from 'wavesurfer.js/src/plugin/regions';
import './GestureController.css';
import 'bootstrap/dist/css/bootstrap.css';
import { GestureRecognizer, FilesetResolver, DrawingUtils } from '../../node_modules/@mediapipe/tasks-vision';
import { AudioManager } from "../AudioManager";
//import IconsUI from "../IconsUI";
import VolumeProgressBar from "../components/volumeProgressBar";
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
    Started = "startedManagingVolume"
}

enum EffectsState {
    Empty = "empty",
    StartPuttingEffects = "startPuttingEffects",
}

interface GestureControllerProps {
    video: HTMLVideoElement | null,
    waveform : WaveSurfer | null
}

const GestureController = (props: GestureControllerProps) => {

    // Define a sensitivity value to control effect change speed
    var video = props.video;
    var waveform = props.waveform;
    var gestureRecognizer : GestureRecognizer | null = null;
    //var gestureOutput : any | null = null;
    var canvasElement : any | null = null;
    var canvasCtx : any | null = null;
    
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

    if ('webkitSpeechRecognition' in window) {
        const recognition = new (window as any).webkitSpeechRecognition();
    
        recognition.continuous = true; // Continuously listen for commands
        recognition.interimResults = true; // Get interim results (might not be the final command)
        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcript = event.results[current][0].transcript.trim();
          let current_voice = document.getElementById('current_voice') as HTMLOutputElement;
          current_voice.innerText = "🎙️ " + transcript;
          console.log("Voice command: " + transcript.toLowerCase().trim());
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
          }
        };
        recognition.start();
      }
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
            setAudioObjects();
        }
        
    }, [video, waveform]);

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
        // Load audio files
        // audioManager.loadSound('mainMusic', 'assets/sounds/audio.mp3');
        // audioManager.loadSound('bassdrum', 'assets/sounds/bassdrum.mp3');
        // audioManager.loadSound('snare', 'assets/sounds/dubstep-snare-drum.mp3');
        // audioManager.loadSound('electribe', 'assets/sounds/electribe-hats.mp3');
        // audioManager.loadSound('clap', 'assets/sounds/mega-clap.mp3');

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

        //In modalità doppia mano non ferma la musica

        if(results.gestures.length == 0) {
            let current_gesture = document.getElementById('current_gesture') as HTMLOutputElement;
            current_gesture.innerText = "🙌";
        }

        for (let i = 0; i < results.gestures.length; i++) {
            const categoryName = results.gestures[i][0].categoryName;
            const categoryScore = parseFloat(
                (results.gestures[i][0].score * 100).toString()
            ).toFixed(2);
            const handedness = results.handednesses[i][0].displayName;

            //gestureOutput.innerText = "Cut State " + currSCut;

            detectAction(categoryName, categoryScore, handedness, results.landmarks[i]);
            handleDrums(handedness, results.landmarks[i]);
            handlePlayPause();
            handleEffects(handedness, results.landmarks[i]);
            handleRegions();
            handleVolume(results.landmarks[i]);
        }
    }

    const detectAction = (categoryName: string, categoryScore: any, handedness: string, landmarks: any) => {
        console.log(categoryScore);

        let current_gesture = document.getElementById('current_gesture') as HTMLOutputElement;

        switch (categoryName) {
            case "None":
                if (currSCut == CutState.StartCuttingLeft && handedness == "Left" && closedPoints(landmarks[6], landmarks[10], 0.1) && closedPoints(landmarks[7], landmarks[11], 0.1) && closedPoints(landmarks[8], landmarks[12], 0.1)) {
                    currSCut = CutState.ClosedCutLeft;
                } else {
                    if (currSCut == CutState.StartCuttingRight && handedness == "Right" && closedPoints(landmarks[6], landmarks[10], 0.1) && closedPoints(landmarks[7], landmarks[11], 0.1) && closedPoints(landmarks[8], landmarks[12], 0.1)) {
                        currSCut = CutState.ClosedCutRight;
                    }
                }
                currSVolume = VolumeState.Empty;
                currSEffects = EffectsState.Empty;

                //handleDrums(handedness, landmarks);

                break;
            case "Pointing_Up":
                currSPlayPause = PlayPauseState.Empty;
                if(currSCut != CutState.Empty) {
                    wsRegions.clearRegions();
                    currSCut = CutState.Empty;
                }
                currSIndex = IndexState.Stopping;
                currSMiddle = MiddleState.Stopping;
                currSRing = RingState.Stopping;
                currSPincky = PickyState.Stopping;
                currSEffects = EffectsState.Empty;
                if(handedness == "Right") {
                    currSVolume = VolumeState.Started;
                    current_gesture.innerText = "👆 + ↔️ → Down 🔈 ↔️ 🔊 Up";
                }
                break;
            case "Open_Palm":
                if (handedness == "Right") {
                    currSPlayPause = PlayPauseState.Started;
                    current_gesture.innerText = "🖐️ + ✊ → ⏯️";
                }
                if(currSCut != CutState.Empty) {
                    wsRegions.clearRegions();
                    currSCut = CutState.Empty;
                }
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
                        current_gesture.innerText = "⏯️ ✅";
                    }
                    
                }
                if(currSCut != CutState.Empty) {
                    wsRegions.clearRegions();
                    currSCut = CutState.Empty;
                }
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
                if(currSCut != CutState.Empty) {
                    wsRegions.clearRegions();
                    currSCut = CutState.Empty;
                }
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
                if(currSCut != CutState.Empty) {
                    wsRegions.clearRegions();
                    currSCut = CutState.Empty;
                }
                currSVolume = VolumeState.Empty;
                currSIndex = IndexState.Stopping;
                currSMiddle = MiddleState.Stopping;
                currSRing = RingState.Stopping;
                currSPincky = PickyState.Stopping;
                currSEffects = EffectsState.Empty;
                break;
            case "ILoveYou":
                currSPlayPause = PlayPauseState.Empty;
                if(currSCut != CutState.Empty) {
                    wsRegions.clearRegions();
                    currSCut = CutState.Empty;
                }
                currSVolume = VolumeState.Empty;
                currSIndex = IndexState.Stopping;
                currSMiddle = MiddleState.Stopping;
                currSRing = RingState.Stopping;
                currSPincky = PickyState.Stopping;
                currSEffects = EffectsState.Empty;
                break;
        }
        setGestureMesssage();
    }

    const setGestureMesssage = () => {
        let current_gesture = document.getElementById('current_gesture') as HTMLOutputElement;
        switch (currSCut) {
            case CutState.Empty:
                break;
            case CutState.StartCuttingLeft:
                current_gesture.innerText = "✌️ + 🤞 To Start Loop";
                break;
            case CutState.ClosedCutLeft:
                current_gesture.innerText = "Left Cut ✅ → Complete Right Cut ✌️";
                break;
            case CutState.CuttedLeft:
                current_gesture.innerText = "✌️ + 🤞 To Close Loop";
                break;
            case CutState.StartCuttingRight:
                current_gesture.innerText = "✌️ + 🤞 To Close Loop";
                break;
            case CutState.CuttedCompleted:
                current_gesture.innerText = "Loop created ✅ → ✌️ To Remove Loop";
                break;
        }
    }
        

    const handleDrums = (handedness : string, landmarks: any) => {
        let current_gesture = document.getElementById('current_gesture') as HTMLOutputElement;

        //DRUMS detect and managing
        if(handedness == "Left") {
            //Audio to put in async to play them without overriding everything (?)
            //Index finger action
            if(closedPoints(landmarks[8], landmarks[4], 0.05)) {
                if(currSIndex == IndexState.Listening) {
                    // Play the audio in the background
                    soundManager.playSound('bassdrum');
                    current_gesture.innerText = "🥁 ✅";
                    currSIndex = IndexState.Stopping;
                }
            } else {
                currSIndex = IndexState.Listening;
            }

            //Middle finger action
            if(closedPoints(landmarks[12], landmarks[4], 0.05)) {
                if(currSMiddle == MiddleState.Listening) {
                    // Play the audio in the background
                    soundManager.playSound('snare');
                    current_gesture.innerText = "🥁 ✅";
                    currSMiddle = MiddleState.Stopping;
                }
            } else {
                currSMiddle = MiddleState.Listening;
            }

            //Ring finger action
            if (closedPoints(landmarks[16], landmarks[4], 0.05)) {
                if(currSRing == RingState.Listening) {
                    // Play the audio in the background
                    soundManager.playSound('clap');
                    current_gesture.innerText = "🥁 ✅";
                    currSRing = RingState.Stopping;
                }   
            } else {
                currSRing = RingState.Listening;
            }

            //Pinky Finger action
            if (closedPoints(landmarks[20], landmarks[4], 0.05)) {
                if(currSPincky == PickyState.Listening) {
                    // Play sounds
                    soundManager.playSound('hat');
                    current_gesture.innerText = "👏 ✅";
                    currSPincky = PickyState.Stopping;
                }  
            } else {
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

    const handleEffects = (handedness : string, landmarks: any) => {

        if(currSEffects == EffectsState.StartPuttingEffects && handedness == "Right") {

            //Manage effects

            var currentThumbUpCoordinates = {x:landmarks[4].x, y: landmarks[4].y};
            var referencePoint = {x:landmarks[0].x, y: landmarks[0].y}
          
            updateEffectsValue(currentThumbUpCoordinates!, referencePoint!);

            console.warn("EFFECTIVE VALUE: " + speedValue);

            waveform?.setPlaybackRate(speedValue);
            
        }
        else if(handedness == "Right") {
            speedValue = 1;
        }

    }

    const handleRegions = () => {
        if (currSCut == CutState.ClosedCutLeft && loopRegion == undefined && waveform) {
            loopRegion = {
                start: waveform.getCurrentTime(),
                color: "#e0a9e06e",
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
     * Function to update the effect factor based on the angle taken by the Thumb_Up gesture
     */
    const updateEffectsValue = (point1: Coordinates, point2: Coordinates) => {
        var angle : number = 0;

        angle = calculateAngle(point1, point2);

        speedValue = angle/100;

        console.warn("EFFECTIVE VALUE: " + speedValue);
        
    };

    const calculateAngle = (coord1: Coordinates, coord2: Coordinates) => {
        const dx = coord2.x - coord1.x;
        const dy = coord2.y - coord1.y;

        const angle = Math.atan2(dy, dx);

        const angleDegree = (angle * 180) / Math.PI

        return angleDegree;
    };

    const closedPoints = (point1: any, point2: any, precision: number) => {
        var a = point1.x - point2.x;
        var b = point1.y - point2.y;
        var c = Math.sqrt(a * a + b * b);
        if (c < precision) {
            return true;
        }
        return false;
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
            <div className="volumeProgressBar" style={{ display: isVolumeVisible ? "block" : "none"}}>
                <VolumeProgressBar volume={volume}></VolumeProgressBar>
            </div>
        </>
    );
};

export default GestureController;