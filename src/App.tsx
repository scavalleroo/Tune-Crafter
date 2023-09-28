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

function App() {
  var waitForOpenHand: Boolean = true;

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
        gestureOutput.innerText = `GestureRecognizer: ${categoryName}\n Confidence: ${categoryScore} %\n Handedness: ${handedness}\n`;

        detectAction(categoryName, categoryScore, handedness);
      } else {
        gestureOutput.style.display = "none";
      }
      // Call this function again to keep predicting when the browser is ready.
      if (webcamRunning === true) {
        window.requestAnimationFrame(predictWebcam);
      }
    }

    function detectAction(categoryName: string, categoryScore: any, handedness: string) {
      if(!waitForOpenHand && categoryName == "Closed_Fist" && categoryScore > 60 && handedness == "Right") {
        if (waveformRef.current) {
          waveformRef.current.playPause();
          waitForOpenHand = true;
        }
      }

      if(categoryName == "Open_Palm" && handedness == "Right" && categoryScore > 60) {
        waitForOpenHand = false;
      }
    }
  }, []);

  const audioUrl = 'assets/audio.mp3';
  const waveformRef = useRef<WaveSurfer | null>(null);

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
