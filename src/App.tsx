import './App.css'
import React from "react";
import {useEffect} from 'react';

import {
  GestureRecognizer,
  FilesetResolver,
  DrawingUtils
} from '../node_modules/@mediapipe/tasks-vision';


function App() {
  useEffect(() => {
    const demosSection : HTMLAreaElement = document.getElementById("demos") as HTMLAreaElement;
    let gestureRecognizer: GestureRecognizer;
    //let enableWebcamButton: HTMLButtonElement;
    let enableWebcamButton: any;
    let webcamRunning: Boolean = false;
    const videoHeight = "360px";
    const videoWidth = "480px";
  
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
      demosSection.classList.remove("invisible");
    };

    createGestureRecognizer();
  
    /********************************************************************
    // Demo 1: Continuously grab image from webcam stream and detect it.
    ********************************************************************/
  
    const video : HTMLVideoElement = document.getElementById("webcam") as HTMLVideoElement;
    const canvasElement : HTMLCanvasElement = document.getElementById("output_canvas") as HTMLCanvasElement;
    var canvasCtx : any = null;
  
    if (canvasElement != null) {
      console.log("CanvasElement present");      
      canvasCtx = canvasElement.getContext("2d");
    } else {
      console.log("Error, element not found"); //TODO Error handling 
    }
    const gestureOutput : HTMLOutputElement = document.getElementById("gesture_output") as HTMLOutputElement;
  
    // Check if webcam access is supported.
    function hasGetUserMedia() {
      return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }
  
    // If webcam supported, add event listener to button for when user
    // wants to activate it.
    if (hasGetUserMedia()) {
      enableWebcamButton = document.getElementById("webcamButton");
      enableWebcamButton.addEventListener("click", enableCam);
    } else {
      console.warn("getUserMedia() is not supported by your browser");
    }
  
    // Enable the live webcam view and start detection.
    function enableCam() {
      if (!gestureRecognizer) {
        alert("Please wait for gestureRecognizer to load");
        return;
      }
  
      if (webcamRunning === true) {
        webcamRunning = false;
        enableWebcamButton.innerText = "ENABLE PREDICTIONS";
      } else {
        webcamRunning = true;
        enableWebcamButton.innerText = "DISABLE PREDICTIONS";
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
    let results : any = undefined;
    async function predictWebcam() {
      const webcamElement : HTMLWebViewElement = document.getElementById("webcam") as HTMLWebViewElement;
      // Now let's start detecting the stream.
      await gestureRecognizer.setOptions({ 
        runningMode: "VIDEO",
        numHands: 2
      });

      let nowInMs = Date.now();
      if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        results = gestureRecognizer.recognizeForVideo(video, nowInMs);
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
        gestureOutput.innerText = `GestureRecognizer: ${categoryName}\n Confidence: ${categoryScore} %\n Handedness: ${handedness}`;
      } else {
        gestureOutput.style.display = "none";
      }
      // Call this function again to keep predicting when the browser is ready.
      if (webcamRunning === true) {
        window.requestAnimationFrame(predictWebcam);
      }
    }
  }, []);
  

  return (
    <>
      <section id="demos" className="invisible">
        <div id="liveView" className="videoView">
          <button id="webcamButton" className="mdc-button mdc-button--raised">
            <span className="mdc-button__ripple"></span>
            <span className="mdc-button__label">ENABLE WEBCAM</span>
          </button>
          <div style={{position: "relative"}}>
            <video id="webcam" autoPlay playsInline></video>
            <canvas className="output_canvas" id="output_canvas" width="1280" height="720" style={{position: "absolute", left: "0px", top: "0px"}}></canvas>
            <p id='gesture_output' className="output"></p>
          </div>
        </div>
      </section>
    </>
  )
}

export default App
