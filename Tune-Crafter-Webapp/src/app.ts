
// Copyright 2023 The MediaPipe Authors.

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//      http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import {
    GestureRecognizer,
    FilesetResolver,
    DrawingUtils
  } from "@mediapipe/tasks-vision";
  


  /*
  console.log('Hello world!')

  //const demosSection = document.getElementById("demos")!; //"!" to indicate is not gonna be null 
  let gestureRecognizer: GestureRecognizer;
  let runningMode = "VIDEO";
  let enableWebcamButton: HTMLButtonElement;
  let webcamRunning: Boolean = false;
  const videoHeight = "360px";
  const videoWidth = "480px";


  // Before we can use HandLandmarker class we must wait for it to finish
  // loading. Machine Learning models can be large and take a moment to
  // get everything needed to run.
  const createGestureRecognizer = async () => {
    const vision = await FilesetResolver.forVisionTasks(
      //"@mediapipe/tasks-vision"
      //"./src/shared/models/gesture_recognizer.task"
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.6/wasm"
    );

    //gestureRecognizer = await GestureRecognizer.createFromModelPath("./src/shared/models/gesture_recognizer.task");

    
    gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "/shared/models/gesture_recognizer.task",
          //"https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task"
        delegate: "GPU"
      },
      runningMode: "VIDEO",
      numHands: 1
    });
  
    
    //demosSection.classList.remove("invisible");
    
  };
  createGestureRecognizer();


  //-------------------------------------------------------------------
  // Demo 2: Continuously grab image from webcam stream and detect it.
  //-------------------------------------------------------------------
  
  const video = document.getElementById("webcam") as HTMLVideoElement;
  const canvasElement: HTMLCanvasElement = document.getElementById("output_canvas")! as HTMLCanvasElement;
  const canvasCtx = canvasElement.getContext("2d") as CanvasRenderingContext2D;
  const gestureOutput = document.getElementById("gesture_output")!;
  
  // Check if webcam access is supported.
  function hasGetUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }
  
  // If webcam supported, add event listener to button for when user
  // wants to activate it.
  if (hasGetUserMedia()) {
    enableWebcamButton = document.getElementById("webcamButton") as HTMLButtonElement;
    enableWebcamButton.addEventListener("click", enableCam);
  } else {
    console.warn("getUserMedia() is not supported by your browser");
  }
  
  // Enable the live webcam view and start detection.
  function enableCam(event : any) {
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
    const webcamElement = document.getElementById("webcam")!;
    // Now let's start detecting the stream.
    if (runningMode === "IMAGE") {
      runningMode = "VIDEO";
      await gestureRecognizer.setOptions({ runningMode: "VIDEO" });
    }
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
      let num = results.gestures[0][0].score * 100
      const categoryScore = parseFloat(
        num.toString()
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

  */


  /**  IMAGE PROCESSOR
    let lastVideoTime = -1;
    function renderLoop(): void {
    const video = document.getElementById("video");

    if (video.currentTime !== lastVideoTime) {
        const gestureRecognitionResult = gestureRecognizer.recognizeForVideo(video);
        processResult(gestureRecognitionResult);
        lastVideoTime = video.currentTime;
    }

    requestAnimationFrame(() => {
        renderLoop();
    });
    }
     */






  
// Import the required APIs
import { ObjectDetector } from '@mediapipe/tasks-vision';

// Get the DOM Elements.
const fileInput : any = document.getElementById('file-input')!;
const imageWrapper = document.getElementById('image-wrapper')!;

// This asynchronous function is resposible for creating
// the `ObjectDetector` object.
const createObjectDetector = async () => {
  // Fetch the wasm files from CDN for vision task.
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.6/wasm"
  );

  // Create and return the `ObjectDetector`.
  return await ObjectDetector.createFromOptions(vision, {
    baseOptions: {
      // Path to the trained model.
      modelAssetPath: `./shared/models/efficientdet_lite0.tflite`
    },
    // Minimum score the detector should look for between 0 to 1.
    scoreThreshold: 0.5,
    // Either `IMAGE` or `VIDEO`.
    runningMode: 'IMAGE'
  });
};


document.addEventListener('DOMContentLoaded', () => {
    createObjectDetector().then(detector => {
      fileInput.addEventListener('input', () => {
      
        while(imageWrapper.firstChild) {
          imageWrapper.removeChild(imageWrapper.firstChild)
        }

        const file = fileInput.files[0]
        const image = new Image()
        const dataUrl = URL.createObjectURL(file)

        image.onload = () => {
          image.style.height = '100%'
          image.style.width = '100%'
          imageWrapper.append(image)

          // `ObjectDetector` operates on the natural height and width of
          // the image. We need to calculate the ratio of the rendered image's
          // height/width and naturalHeight/naturalWidth.
          const heightRatio = image.height / image.naturalHeight
          const widthRatio = image.width / image.naturalWidth

          
          const result = detector.detect(image)

          // Take all the detections and draw bounding box with label.
          result.detections.forEach(detection => {
            // A `div` element for bounding box.
            const box = document.createElement('div')

            box.style.position = 'absolute'
            box.style.border = '2px solid red'
            // Notice how we are using the calculated ratios to preserve
            // the sizing and coordinate of the detection.
            box.style.left = `${detection.boundingBox!.originX * widthRatio}px`
            box.style.top = `${detection.boundingBox!.originY * heightRatio}px`
            box.style.height = `${detection.boundingBox!.height * heightRatio}px`
            box.style.width = `${detection.boundingBox!.width * widthRatio}px`
            
            // Extract the name of the detection and score.
            const labelName = detection.categories[0].categoryName
            const scorePercentage = Math.round(detection.categories[0].score * 100)
            
            // A `small` element for the label.
            const label = document.createElement('small')

            label.style.position = 'absolute'
            label.style.top = '-16px'
            label.style.left = '0'
            label.style.color = 'white'
            label.style.backgroundColor = 'red'
            label.textContent = `${labelName} ${scorePercentage}%`

            // Finally append the elements.
            box.append(label)
            imageWrapper.append(box)
          })
        }

        image.src = dataUrl
      })
    })
})