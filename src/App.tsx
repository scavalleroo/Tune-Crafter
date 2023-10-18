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

  const waveformRef : Ref<WaveSurfer> | null = useRef<WaveSurfer | null>(null);

  let audioUrl = 'assets/sounds/audio.mp3';
  const audioManager = new AudioManager(); 
  audioManager.loadSound('snare', 'assets/sounds/dubstep-snare-drum.mp3');
  audioManager.loadSound('electribe', 'assets/sounds/electribe-hats.mp3');
  audioManager.loadSound('clap', 'assets/sounds/mega-clap.mp3'); 
  const[video, setVideo] = useState<HTMLVideoElement | null>(null); 
// Check if the browser supports the WebSpeech API
if ('webkitSpeechRecognition' in window) {
  const recognition = new (window as any).webkitSpeechRecognition();
  recognition.continuous = true; // Continuously listen for commands
  recognition.interimResults = true; // Get interim results (might not be the final command)

  recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript.trim();

      // Display the recognized transcript
      document.getElementById("voice-command-output")!.textContent = transcript;

      // Handle specific voice commands
      if (transcript === 'Cut.') {
          // Implement the 'Cut' action here
      } else if (transcript === 'Terminate.') {
          // Implement the 'Terminate' action here
      } else if (transcript === 'Snare.') {
        audioManager.playSound('snare');
          // Implement the 'Snare' action here
      } else if (transcript === 'Electribe.') {
        audioManager.playSound('electribe');
          // Implement the 'Electribe' action here
      } else if (transcript === 'Clap.') {
        audioManager.playSound('clap');
          // Implement the 'Clap' action here
      } else if (transcript === 'Play.') {
        console.log("Play")
        waveformRef.current?.playPause();
          // Implement the 'Play' action here
      } else if (transcript === 'Stop.') {
        waveformRef.current?.playPause();
          // Implement the 'Stop' action here
      } else if (transcript === 'Playback.') {
          // Implement the 'Loop' action here
      } else if (transcript === 'Volume up.') {
          // Implement the 'Volume up' action here
      } else if (transcript === 'Volume down.') {
          // Implement the 'Volume down' action here
      } else if (transcript === 'Clear-all.') {
          // Implement the 'Clear-all' action here
      }
  };

  recognition.start(); // Start listening
} else {
  document.getElementById("voice-command-output")!.textContent = "WebSpeech API not supported";
}
//Voice recoginition 

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
      
      if(video != null) {
        video.srcObject = stream;
      }
    });

  }

  return (
    <>
      <section className="main-cont">
        <HartRateComponent />
        <div id="voice-command-output">Listening...</div>
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