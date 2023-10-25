import React, { useRef, useEffect, useState, Ref } from "react";
import { hasGetUserMedia } from './utils/helpers';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import { WaveSurfer } from 'wavesurfer-react/dist/utils/createWavesurfer';

// import { HeartRateComponent } from './components/HeartRateComponent';
import GestureComponent from "./components/GestureComponent";
import AudioWaveComponent from "./components/AudioWaveComponent";
import SpeechComponent from "./components/SpeechComponent";

function App() {
  let audioUrl = "assets/sounds/audio.mp3"
  const waveformRef: Ref<WaveSurfer> | null = useRef<WaveSurfer | null>(null);
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  // Check if the browser supports the WebSpeech API

  useEffect(() => {
    if (hasGetUserMedia()) {
      console.log("Enebling webcam");
      enableCam();
      console.log("Webcam enabled");
    } else {
      console.log("getUserMedia() is not supported by your browser");
    }
  }, [video]);

  function enableCam() {
    const constraints = { video: true };

    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {

      setVideo(document.getElementById("webcam") as HTMLVideoElement);

      if (video != null) {
        video.srcObject = stream;
        video.onload = function () {
          console.log("Webcam loaded");
        };
      }
    });

  }

  return (
    <>
      <section className="main-cont">
        {/* <HeartRateComponent /> */}
        <div className="waveForm">
          <AudioWaveComponent ref={waveformRef} audioUrl={audioUrl} />
        </div>
        <video id="webcam" autoPlay playsInline style={{ display: "none" }}></video>
        {video && (
          <GestureComponent video={video} waveform={waveformRef.current}></GestureComponent>
        )}
        <SpeechComponent waveform={waveformRef.current}></SpeechComponent>
      </section>
    </>
  )
}

export default App