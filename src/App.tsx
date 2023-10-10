import './App.css';
import React, { useRef, useEffect } from "react";
import { hasGetUserMedia } from './utils/helpers';
import { GestureController } from './controllers/GestureController';
import Waveform from './components/customWawesurfer';
import { HartRateComponent } from './components/hartRateComponent';

function App() {

  const waveformRef = useRef<WaveSurfer | null>(null);
  let controller: any;
  let audioUrl = 'assets/audio.mp3';

  useEffect(() => {
    // If webcam supported, add event listener to button for when user
    // wants to activate it.
    if (hasGetUserMedia()) {
      console.log("Enebling webcam");
      enableCam();
      console.log("Webcam enabled");

    } else {
      console.warn("getUserMedia() is not supported by your browser");
    }
  }, []);

  function enableCam() {
    const video: HTMLVideoElement = document.getElementById("webcam") as HTMLVideoElement;

    const constraints = { video: true };

    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
      video.srcObject = stream;
      controller = new GestureController({ video, waveformRef });
      controller.createGestureRecognizer().then(() => {
        video.addEventListener("loadeddata", controller.predictWebcam);
        window.requestAnimationFrame(controller.predictWebcam.bind(controller));
      });
    });
  }

  return (
    <>
      <section className="container text-center">
        <HartRateComponent />
        <Waveform ref={waveformRef} audioUrl={audioUrl} />
        <video id="webcam" autoPlay playsInline style={{ display: "none" }}></video>
        <GestureController ref={controller} />
      </section>
    </>
  )
}

export default App
