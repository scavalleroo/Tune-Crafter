import React, { useRef, useEffect, useState, Ref } from "react";
import { hasGetUserMedia } from './utils/helpers';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import { WaveSurfer } from 'wavesurfer-react/dist/utils/createWavesurfer';
import GestureComponent from "./components/GestureComponent";
import AudioWaveComponent from "./components/AudioWaveComponent";
import SpeechComponent from "./components/SpeechComponent";
import { AudioManager } from "./AudioManager";

function App() {
  let audioUrl = "assets/sounds/audio.mp3"
  const waveformRef: Ref<WaveSurfer> | null = useRef<WaveSurfer | null>(null);
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  // Check if the browser supports the WebSpeech API

  const soundManager: AudioManager = new AudioManager(waveformRef.current);
  
  useEffect(() => {
    if (hasGetUserMedia()) {
      enableCam();
    } else {
      console.log("getUserMedia() is not supported by your browser");
    }
  }, [video]);

  function enableCam() {
    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      setVideo(document.getElementById("webcam") as HTMLVideoElement);
      if (video != null) {
        video.srcObject = stream;
      }
    }).catch((error) => {
      console.error("Error accessing webcam:", error);
    });
  }

  return (
    <>
      <section className="main-cont">
        {/* <HeartRateComponent /> */}
        <div className="waveForm">
          <AudioWaveComponent ref={waveformRef} audioUrl={audioUrl}/>
        </div>
        <video id="webcam" autoPlay playsInline style={{ display: "none" }}></video>
        {video && (
          <GestureComponent video={video} waveform={waveformRef.current} soundManager={soundManager}></GestureComponent>
        )}
        <SpeechComponent waveform={waveformRef.current} soundManager={soundManager}></SpeechComponent>
      </section>
    </>
  )
}

export default App