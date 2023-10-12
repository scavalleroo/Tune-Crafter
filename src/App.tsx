import React, { useRef, useEffect, useLayoutEffect, useState, Ref } from "react";
import { hasGetUserMedia } from './utils/helpers';
import { HartRateComponent } from './components/hartRateComponent';
import GestureController from "./controllers/GestureController";

import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import { WaveSurfer } from 'wavesurfer-react/dist/utils/createWavesurfer';
import Waveform from "./components/customWawesurfer";

function App() {

  //const waveformRef = useRef<WaveSurfer | null>(null);
  //var waveForm : WaveSurfer | null = null;
  const waveformRef : Ref<WaveSurfer> | null = useRef<WaveSurfer | null>(null);
  //let controller: any;
  let audioUrl = 'assets/audio.mp3';

  //var waveForm : WaveSurfer | null = null;
  //const[waveForm, setWaveForm] = useState<WaveSurfer | null>(null);
  const[video, setVideo] = useState<HTMLVideoElement | null>(null); 

  useEffect(() => {

    /*
    if(waveForm == null) {

      console.warn("waveForm creation");
      
      waveForm = WaveSurfer.create({
        container: '#waveform',
        backend: 'WebAudio',
        waveColor: 'violet',
        progressColor: 'purple',
      });

      console.warn(waveForm);

      //if(waveForm != null) {
        waveForm!.load(audioUrl);
      //}
    }
    */

    // If webcam supported, add event listener to button for when user
    // wants to activate it.
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

      console.warn(video);
      console.warn(waveformRef);
      
      if(video != null) {
        video.srcObject = stream;
      }
      
      //controller = new GestureController({ video, waveformRef });
      /*
      controller.createGestureRecognizer().then(() => {
        video.addEventListener("loadeddata", controller.predictWebcam);
        window.requestAnimationFrame(controller.predictWebcam.bind(controller));
      });
      */
    });

    console.warn("PRIMA QUESTO?");

  }
/*
  useEffect(() => {

    waveForm = waveformRef.current;

  }, [waveformRef])
  */

  return (
    <>
      <section className="container text-center">
        <HartRateComponent />
        <Waveform ref={waveformRef} audioUrl={audioUrl} />
        
        <video id="webcam" autoPlay playsInline style={{ display: "none" }}></video>
        <GestureController video={video} waveform={waveformRef.current}></GestureController>
      </section>
    </>
  )
}

export default App

//<Waveform ref={waveformRef} audioUrl={audioUrl} /> <div id="waveform" style={{ height: '50px' }}></div>