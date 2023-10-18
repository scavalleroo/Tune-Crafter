import React, { useRef, useEffect, useState, Ref } from "react";
import { hasGetUserMedia } from './utils/helpers';
import { HartRateComponent } from './components/hartRateComponent';
import GestureController from "./controllers/GestureController";
import { AudioManager } from "./AudioManager";
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';

import { WaveSurfer } from 'wavesurfer-react/dist/utils/createWavesurfer';
import Waveform from "./components/customWawesurfer";

function App() {

  const waveformRef: Ref<WaveSurfer> | null = useRef<WaveSurfer | null>(null);

  let audioUrl = 'assets/sounds/audio.mp3';
  const audioManager = new AudioManager();
  audioManager.loadSound('snare', 'assets/sounds/dubstep-snare-drum.mp3');
  audioManager.loadSound('electribe', 'assets/sounds/electribe-hats.mp3');
  audioManager.loadSound('clap', 'assets/sounds/mega-clap.mp3');
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  // Check if the browser supports the WebSpeech API

  useEffect(() => {
    if (hasGetUserMedia()) {
      console.warn("Enebling webcam");
      enableCam();
      console.warn("Webcam enabled");

    } else {
      console.warn("getUserMedia() is not supported by your browser");
    }
  });

  function enableCam() {
    const constraints = { video: true };

    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {

      setVideo(document.getElementById("webcam") as HTMLVideoElement);

      if (video != null) {
        video.srcObject = stream;
      }
    });

  }

  return (
    <>
      <section className="main-cont">
        <HartRateComponent />
        <div className="waveForm">
          <Waveform ref={waveformRef} audioUrl={audioUrl} />
        </div>
        <video id="webcam" autoPlay playsInline style={{ display: "none" }}></video>
        <GestureController video={video} waveform={waveformRef.current}></GestureController>
      </section>
    </>
  )
}

export default App