import './App.css';
import React, { useRef, useEffect } from "react";
import { hasGetUserMedia } from './utils/helpers';
import { GestureController } from './controllers/GestureController';

// import { Button } from 'react-bootstrap';
import Waveform from './components/customWawesurfer';


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
  // var cuttedLeft: Boolean = false;
  // var startCuttingRight: Boolean = false;
  // var closedCutRight: Boolean = false;
  // var cuttedCompleted: Boolean = false;

  const audioUrl = 'assets/audio.mp3';
  const waveformRef = useRef<WaveSurfer | null>(null);
  let controller: any;

  useEffect(() => {
    // If webcam supported, add event listener to button for when user
    // wants to activate it.
    if (hasGetUserMedia()) {
      enableCam();
    } else {
      console.warn("getUserMedia() is not supported by your browser");
    }

    // Enable the live webcam view and start detection.
    async function enableCam() {
      const video: HTMLVideoElement = document.getElementById("webcam") as HTMLVideoElement;

      const constraints = {
        video: true
      };

      // Activate the webcam stream.
      navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        video.srcObject = stream;
        controller = new GestureController({ video, waveformRef });
        controller.createGestureRecognizer().then(() => {
          console.log("Starting predictions");
          video.addEventListener("loadeddata", controller.predictWebcam);
        });
      });

      if (!controller?.isReady()) {
        console.log("Controller not ready");
        return;
      }
    }
  }, []);

  return (
    <>
      <section className="container text-center">
        <Waveform ref={waveformRef} audioUrl={audioUrl} />
        <div style={{ height: "100vh", width: "auto" }}>
          <video id="webcam" autoPlay playsInline style={{ display: "none" }}></video>
          <GestureController ref={controller} />
        </div>
      </section>
    </>
  )
}

export default App
