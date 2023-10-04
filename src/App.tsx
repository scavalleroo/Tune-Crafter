import './App.css';
import React, { useRef, useEffect } from "react";
import { hasGetUserMedia } from './utils/helpers';

import {
  GestureRecognizer,
  FilesetResolver,
  DrawingUtils
} from '../node_modules/@mediapipe/tasks-vision';

// import { Button } from 'react-bootstrap';
import Waveform from './components/customWawesurfer';
import RegionsPlugin from 'wavesurfer.js/src/plugin/regions';


function App() {
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

  var currSPlayPause: PlayPauseState = PlayPauseState.Empty;
  var currSDrum: DrumState = DrumState.Empty;
  var currSCut: CutState = CutState.Empty;
  var loopRegion: any = null;
  var startDrumHitLeft: Boolean = false;
  // var cuttedLeft: Boolean = false;
  // var startCuttingRight: Boolean = false;
  // var closedCutRight: Boolean = false;
  // var cuttedCompleted: Boolean = false;

  const audioUrl = 'assets/audio.mp3';
  const audioBassdrum = new Audio('assets/bassdrum.mp3');
  audioBassdrum.preload = 'auto'; // Preload the audio file
  const audioSnare = new Audio('assets/dubstep-snare-drum.mp3');
  audioSnare.preload = 'auto'; // Preload the audio file
  const audioElecribe = new Audio('assets/electribe-hats.mp3');
  audioElecribe.preload = 'auto'; // Preload the audio file
  const audioClap = new Audio('assets/mega-clap.mp3');
  audioClap.preload = 'auto'; // Preload the audio file
  
  const waveformRef = useRef<WaveSurfer | null>(null);
  let wsRegions: any = null;

  useEffect(() => {
    let gestureRecognizer: GestureRecognizer;
    // let enableWebcamButton: any;
    let webcamRunning: Boolean = false;
    const videoHeight = "100vh";
    const videoWidth = "auto";

    // Before we can use HandLandmarker class we must wait for it to finish
    // loading. Machine Learning models can be large and take a moment to
    // get everything needed to run.
    const createGestureRecognizer = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "../node_modules/@mediapipe/tasks-vision/wasm",
      );
      gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "../public/models/gesture_recognizer.task"
        },
        numHands: 2,
        runningMode: "VIDEO"
      });

      // If webcam supported, add event listener to button for when user
      // wants to activate it.
      if (hasGetUserMedia()) {
        // enableWebcamButton = document.getElementById("webcamButton");
        // enableWebcamButton.addEventListener("click", enableCam);
        enableCam();
      } else {
        console.warn("getUserMedia() is not supported by your browser");
      }
    };

    createGestureRecognizer();

    const video: HTMLVideoElement = document.getElementById("webcam") as HTMLVideoElement;
    const canvasElement: HTMLCanvasElement = document.getElementById("output_canvas") as HTMLCanvasElement;
    var canvasCtx: any = null;

    if (canvasElement != null) {
      console.log("CanvasElement present");
      canvasCtx = canvasElement.getContext("2d");
    } else {
      console.log("Error, element not found"); //TODO Error handling 
    }

    const gestureOutput: HTMLOutputElement = document.getElementById("gesture_output") as HTMLOutputElement;

    // Enable the live webcam view and start detection.
    function enableCam() {
      if (!gestureRecognizer) {
        alert("Please wait for gestureRecognizer to load");
        return;
      }

      if (webcamRunning === true) {
        webcamRunning = false;
        // enableWebcamButton.innerText = "Enable predictors";
      } else {
        webcamRunning = true;
        // enableWebcamButton.innerText = "Disable predictors";
      }

      // getUsermedia parameters.
      const constraints = {
        video: true
      };

      // Activate the webcam stream.
      navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        video.srcObject = stream;
        video.addEventListener("loadeddata", predictWebcam);
      });
    }

    let lastVideoTime = -1;
    let results: any = undefined;

    async function predictWebcam() {
      const webcamElement: HTMLWebViewElement = document.getElementById("webcam") as HTMLWebViewElement;
      // Now let's start detecting the stream.
      await gestureRecognizer.setOptions({
        runningMode: "VIDEO",
        numHands: 2
      });

      let nowInMs = Date.now();
      if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        results = gestureRecognizer.recognizeForVideo(video, nowInMs);
        console.log(results);
      }

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      const drawingUtils = new DrawingUtils(canvasCtx);

      canvasElement.style.height = videoHeight;
      webcamElement.style.height = videoHeight;
      canvasElement.style.width = videoWidth;
      webcamElement.style.width = videoWidth;

      //Skeleton of hands detection
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
      if (results.gestures.length > 0) {
        gestureOutput.style.display = "block";
        gestureOutput.style.width = videoWidth;

        const categoryName = results.gestures[0][0].categoryName;
        const categoryScore = parseFloat(
          (results.gestures[0][0].score * 100).toString()
        ).toFixed(2);

        const handedness = results.handednesses[0][0].displayName;
        gestureOutput.innerText = "Cut State " + currSCut;

        detectAction(categoryName, categoryScore, handedness, results.landmarks[0]);

        if (wsRegions == null) {
          wsRegions = waveformRef.current?.addPlugin(RegionsPlugin.create({}));
          wsRegions.on('region-created', (region: any) => {
            region.playLoop();
            console.log(region);
            console.log("Play region");
          });
          wsRegions.on('region-out', (region: any) => {
            region.play();
          })
        }

        if (currSPlayPause == PlayPauseState.Completed && waveformRef.current) {
          waveformRef.current.playPause();
        }

        if (currSCut == CutState.CuttedLeft && waveformRef.current) {
          loopRegion = {
            start: waveformRef.current.getCurrentTime(),
            color: "red",
            resize: false,
            drag: false,
            loop: true,
          };
        }

        if (currSCut == CutState.CuttedCompleted && waveformRef.current) {
          loopRegion.end = waveformRef.current.getCurrentTime();
          wsRegions.addRegion(loopRegion);
          currSCut = CutState.Empty;
        }
      } else {
        gestureOutput.style.display = "none";
      }
      // Call this function again to keep predicting when the browser is ready.
      if (webcamRunning === true) {
        window.requestAnimationFrame(predictWebcam);
      }
    }

    function detectAction(categoryName: string, categoryScore: any, handedness: string, landmarks: any) {
      console.log(categoryScore);
      switch (categoryName) {
        case "None":
          if (currSCut == CutState.StartCuttingLeft && handedness == "Left" && closedPoints(landmarks[6], landmarks[10]) && closedPoints(landmarks[7], landmarks[11]) && closedPoints(landmarks[8], landmarks[12])) {
            currSCut = CutState.ClosedCutLeft;
          } else {
            if (currSCut == CutState.StartCuttingRight && handedness == "Right" && closedPoints(landmarks[6], landmarks[10]) && closedPoints(landmarks[7], landmarks[11]) && closedPoints(landmarks[8], landmarks[12])) {
              currSCut = CutState.ClosedCutRight;
            }
          }

          //DRUMS detect and managing
          if(currSDrum == DrumState.StartDrumming) {

            //Index finger action
            if(closedPoints(landmarks[8], landmarks[4])) {

              console.warn("Index finger action");
              currSDrum = DrumState.Completed;  
              // Play the audio in the background
              audioBassdrum.play();
            }

            //Middle finger action
            if(closedPoints(landmarks[12], landmarks[4])) {
              console.warn("Middle finger action");

              startDrumHitLeft = false;  
  
              // Play the audio in the background
              audioSnare.play();
            }

            //Ring finger action
            if(closedPoints(landmarks[16], landmarks[4])) {
              console.warn("Ring Finger action ");

              startDrumHitLeft = false;  
  
              // Play the audio in the background
              audioElecribe.play();
            }

            if(closedPoints(landmarks[20], landmarks[4])) {
              console.warn("Pinky Finger action");

              startDrumHitLeft = false;  
              // Play the audio in the background
              audioClap.play();
            }

          }
          
          break;
        case "Pointing_Up":
          currSPlayPause = PlayPauseState.Empty;
          currSCut = CutState.Empty;
          break;
        case "Open_Palm":
          if (handedness == "Right") {
            currSPlayPause = PlayPauseState.Started;
          }
          currSDrum = DrumState.StartDrumming;
          currSCut = CutState.Empty;
          break;
        case "Closed_Fist":
          if (handedness == "Right" && currSPlayPause == PlayPauseState.Started) {
            currSPlayPause = PlayPauseState.Completed;
          } else {
            currSPlayPause = PlayPauseState.Empty;
          }
          currSCut = CutState.Empty;
          break;
        case "Victory":
          currSPlayPause = PlayPauseState.Empty;
          switch (currSCut) {
            case CutState.Empty:
              if (handedness == "Left") {
                currSCut = CutState.StartCuttingLeft;
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
          break;
        case "Thumbs_Down":
          currSPlayPause = PlayPauseState.Empty;
          currSCut = CutState.Empty;
          break;
        case "ILoveYou":
          currSPlayPause = PlayPauseState.Empty;
          currSCut = CutState.Empty;
          break;

      }
    }

    function closedPoints(point1: any, point2: any) {
      var a = point1.x - point2.x;
      var b = point1.y - point2.y;
      var c = Math.sqrt(a * a + b * b);
      if (c < 0.1) {
        return true;
      }
      return false;
    }
  }, []);

  return (
    <>
      <section className="container text-center">
        <p id='gesture_output'></p>
        <Waveform ref={waveformRef} audioUrl={audioUrl} />
        <div style={{ height: "100vh", width: "auto" }}>
          <video id="webcam" autoPlay playsInline style={{ display: "none" }}></video>
          <canvas className="output_canvas" id="output_canvas" width="1280" height="720" style={{ margin: "0 auto", border: "1px solid #000000", width: "auto", height: "100%" }}></canvas>
        </div>
        {/* <Button id="webcamButton" className='mt-5' variant="primary">Enable webcam</Button> */}
      </section>
    </>
  )
}

export default App
